// Importación masiva de claves: lee un archivo (.txt, .csv, .xml, .xlsx, .xls)
// con pares "empresa / clave" y lo compara con las empresas de la bóveda.
// No toca la base de datos: solo interpreta el archivo y arma la vista previa.

const XLSX = require("xlsx");

// Las claves de Jaivaná tienen la forma JVN-XXXX-XXXX-XXXX
const RE_CLAVE = /^JVN(?:-[A-Z0-9]{4}){3}$/i;

// ---------------------------------------------------------------------------
// Lectura del archivo
// ---------------------------------------------------------------------------

function decodificar(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString("utf16le");
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    const b = Buffer.from(buf.slice(2));
    for (let i = 0; i + 1 < b.length; i += 2) {
      const t = b[i];
      b[i] = b[i + 1];
      b[i + 1] = t;
    }
    return b.toString("utf16le");
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.slice(3).toString("utf8");
  }
  const utf8 = buf.toString("utf8");
  // Si no es UTF-8 válido (archivos de Windows con tildes), se lee como latin1
  return utf8.includes("\uFFFD") ? buf.toString("latin1") : utf8;
}

function decodificarEntidades(t) {
  return t
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

// Devuelve los valores de un XML en el orden en que aparecen.
// Primero los textos de las etiquetas; con conAtributos también los atributos.
function valoresDeXml(texto, conAtributos) {
  const limpio = texto
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (m, c) =>
      c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    );

  const valores = [];
  const re = /<\/[^>]*>|<([A-Za-z_][\w:.-]*)((?:\s+[^<>]*?)?)\s*(\/?)>|<[^>]*>|([^<]+)/g;
  let m;
  while ((m = re.exec(limpio)) !== null) {
    if (m[4] !== undefined) {
      const t = decodificarEntidades(m[4]).trim();
      if (t) valores.push(t);
    } else if (conAtributos && m[2]) {
      const ra = /[\w:.-]+\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      const delElemento = [];
      let a;
      while ((a = ra.exec(m[2])) !== null) {
        const v = decodificarEntidades(a[1] !== undefined ? a[1] : a[2]).trim();
        if (v) delElemento.push(v);
      }
      // solo elementos con 2+ atributos (nombre y clave); así se ignora, por ejemplo, version="2"
      if (delElemento.length >= 2) valores.push(...delElemento);
    }
  }
  return valores;
}

// Excel: cada fila con 2+ celdas es "empresa<TAB>clave"; las filas de una sola
// celda se dejan tal cual (formato de una columna: empresa, clave, empresa, clave…)
function lineasDeExcel(buf) {
  const wb = XLSX.read(buf, { type: "buffer" });
  const lineas = [];
  wb.SheetNames.forEach((nombre) => {
    const filas = XLSX.utils.sheet_to_json(wb.Sheets[nombre], {
      header: 1,
      raw: false,
      defval: "",
    });
    filas.forEach((fila) => {
      const celdas = fila.map((c) => String(c).trim()).filter(Boolean);
      if (celdas.length >= 2) lineas.push(celdas[0] + "\t" + celdas[1]);
      else if (celdas.length === 1) lineas.push(celdas[0]);
    });
  });
  return lineas;
}

// Convierte las líneas en una lista plana de valores. Las líneas con
// "empresa<TAB>clave", "empresa;clave" o "empresa,clave" se separan en dos.
function valoresDeLineas(lineas) {
  const valores = [];
  lineas.forEach((l) => {
    const linea = String(l).trim();
    if (!linea) return;

    let partes = linea.split(/\t|;|\|/).map((s) => s.trim()).filter(Boolean);
    if (partes.length < 2 && linea.includes(",")) {
      const p = linea.split(",").map((s) => s.trim()).filter(Boolean);
      if (p.length >= 2 && RE_CLAVE.test(p[p.length - 1])) {
        partes = [p.slice(0, -1).join(", "), p[p.length - 1]];
      }
    }
    if (partes.length >= 2) valores.push(partes[0], partes[1]);
    else valores.push(linea);
  });
  return valores;
}

const ENCABEZADOS = ["empresa", "empresas", "nombre", "nombres", "clave", "claves", "key", "password", "contrasena", "contrasenas"];

// Une "nombre" con la "clave" que le sigue.
function emparejar(valores) {
  const pares = [];
  const avisos = [];
  // se ignoran los títulos de columna («Empresa», «Clave»…)
  valores = valores.filter((v) => !ENCABEZADOS.includes(normalizar(v)));

  if (valores.some((v) => RE_CLAVE.test(v))) {
    let pendiente = null;
    valores.forEach((v) => {
      if (RE_CLAVE.test(v)) {
        if (pendiente === null) avisos.push(`La clave ${v} no tiene un nombre de empresa antes; se ignoró.`);
        else pares.push({ empresa: pendiente, clave: v });
        pendiente = null;
      } else {
        if (pendiente !== null) avisos.push(`«${pendiente}» no tiene clave; se ignoró.`);
        pendiente = v;
      }
    });
    if (pendiente !== null) avisos.push(`«${pendiente}» no tiene clave; se ignoró.`);
    return { pares, avisos };
  }

  // Sin claves tipo JVN-…: se asume empresa, clave, empresa, clave…
  if (valores.length && valores.length % 2 === 0) {
    for (let i = 0; i < valores.length; i += 2) pares.push({ empresa: valores[i], clave: valores[i + 1] });
    return { pares, avisos };
  }

  return { pares, avisos };
}

function quitarRepetidas(pares, avisos) {
  const mapa = new Map();
  pares.forEach((p) => {
    const k = compacto(p.empresa);
    if (mapa.has(k) && mapa.get(k).clave !== p.clave) {
      avisos.push(`«${p.empresa}» aparece varias veces con claves distintas; se usó la última.`);
    }
    mapa.set(k, p);
  });
  return Array.from(mapa.values());
}

function leerArchivoClaves(buffer, ext) {
  let resultado;

  if (ext === ".xml") {
    const texto = decodificar(buffer);
    resultado = emparejar(valoresDeXml(texto, false));
    if (!resultado.pares.length) resultado = emparejar(valoresDeXml(texto, true));
  } else if (ext === ".xlsx" || ext === ".xls") {
    resultado = emparejar(valoresDeLineas(lineasDeExcel(buffer)));
  } else {
    resultado = emparejar(valoresDeLineas(decodificar(buffer).split(/\r?\n/)));
  }

  const avisos = resultado.avisos.slice();
  const pares = quitarRepetidas(
    resultado.pares.map((p) => ({ empresa: p.empresa.trim(), clave: p.clave.trim() })),
    avisos
  );
  return { pares, avisos };
}

// ---------------------------------------------------------------------------
// Comparación con las empresas de la bóveda
// ---------------------------------------------------------------------------

function normalizar(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Sin espacios ni signos: "UNO-A SUPIA" y "UNOA SUPIA" quedan iguales
function compacto(s) {
  return normalizar(s).replace(/[^a-z0-9]/g, "");
}

function partesNombre(nombre) {
  const m = String(nombre).match(/\(([^)]*)\)/);
  return {
    completo: compacto(nombre),
    base: compacto(String(nombre).replace(/\([^)]*\)/g, " ")),
    alias: m ? compacto(m[1]) : "",
  };
}

function distancia(a, b) {
  if (a === b) return 0;
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function parecido(a, b) {
  if (!a || !b) return 0;
  if (Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a))) return 0.85;
  return 1 - distancia(a, b) / Math.max(a.length, b.length);
}

const UMBRAL_PARECIDO = 0.8;

function compararConBd(pares, bd) {
  const avisos = [];
  const dbInfo = bd.map((e) => Object.assign({}, e, { p: partesNombre(e.empresa) }));
  const reclamada = new Set();
  const items = pares.map((p, i) => ({
    idx: i,
    empresa: p.empresa,
    clave: p.clave,
    p: partesNombre(p.empresa),
    id: null,
    empresaBd: null,
    nivel: null, // exacta | parecida | sugerida
    ambiguo: false,
  }));

  const asignar = (it, e, nivel) => {
    it.id = e.id;
    it.empresaBd = e.empresa;
    it.nivel = nivel;
    it._clave = e.clave;
    reclamada.add(e.id);
  };
  const libres = () => dbInfo.filter((e) => !reclamada.has(e.id));

  // 1) Mismo nombre (sin importar mayúsculas, tildes, espacios o guiones)
  items.forEach((it) => {
    if (!it.p.completo) return;
    const c = libres().filter((e) => e.p.completo === it.p.completo);
    if (c.length === 1) asignar(it, c[0], "exacta");
    else if (c.length > 1) it.ambiguo = true;
  });

  // 2) Coincide el nombre sin el paréntesis, o el texto del paréntesis:
  //    «SEVILLA(contabilidad arango)» ↔ «SEVILLA»   |   «INVERSA (BRIKO)» ↔ «BRIKO»
  items.forEach((it) => {
    if (it.id || it.ambiguo) return;
    const mias = [it.p.completo, it.p.base, it.p.alias].filter(Boolean);
    const c = libres().filter((e) => {
      const suyas = [e.p.completo, e.p.base, e.p.alias].filter(Boolean);
      return mias.some((x) => suyas.includes(x));
    });
    if (c.length === 1) asignar(it, c[0], "parecida");
    else if (c.length > 1) it.ambiguo = true;
  });

  // 3) Nombres muy parecidos (errores de tipeo): se sugieren, sin marcarlos
  items.forEach((it) => {
    if (it.id || it.ambiguo) return;
    let mejor = null;
    let mejorPuntaje = 0;
    let empate = false;
    libres().forEach((e) => {
      let s = 0;
      [it.p.completo, it.p.base].forEach((a) =>
        [e.p.completo, e.p.base].forEach((b) => {
          s = Math.max(s, parecido(a, b));
        })
      );
      if (s > mejorPuntaje + 1e-9) {
        mejor = e;
        mejorPuntaje = s;
        empate = false;
      } else if (Math.abs(s - mejorPuntaje) < 1e-9 && s > 0) {
        empate = true;
      }
    });
    if (mejor && mejorPuntaje >= UMBRAL_PARECIDO && !empate) asignar(it, mejor, "sugerida");
  });

  const salida = items.map((it) => {
    let estado;
    if (it.ambiguo) estado = "ambiguo";
    else if (!it.id) estado = "nueva";
    else estado = it._clave !== null && it._clave === it.clave ? "igual" : "cambia";
    return {
      idx: it.idx,
      empresa: it.empresa,
      clave: it.clave,
      id: it.id,
      empresaBd: it.empresaBd,
      nivel: it.nivel,
      estado,
    };
  });

  const sinAsignar = libres();
  return {
    items: salida,
    avisos,
    libres: sinAsignar.map((e) => ({ id: e.id, empresa: e.empresa })),
  };
}

module.exports = { leerArchivoClaves, compararConBd, normalizar, compacto, RE_CLAVE };
