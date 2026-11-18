// Lectura de hojas de cálculo (.xlsx, .xlsm, .xls, .csv) para mostrarlas como en Excel.
// Usa la librería "xlsx" (la misma que ya usa el panel Masivo de /sql).
const XLSX = require("xlsx");

const EXT_EXCEL = ["xlsx", "xlsm", "xls", "csv"];

// Límites para no bloquear el navegador con libros gigantes
const MAX_FILAS = 5000;          // filas por hoja
const MAX_COLS = 100;            // columnas por hoja (debe ser < 128)
const MAX_CELDAS_TOTAL = 400000; // celdas entre todas las hojas
const MAX_CHARS_CELDA = 2000;    // texto máximo por celda
const MAX_CHARS_TEXTO = 3000000; // texto plano que se guarda para buscar/copiar
const MAX_COMBINADAS = 5000;

function esExcel(ext) {
  return EXT_EXCEL.includes(String(ext || "").toLowerCase().replace(".", ""));
}

// CSV: decide si separa por coma, punto y coma, tabulador o barra vertical
function adivinarSeparador(texto) {
  const primera = texto.split(/\r?\n/, 1)[0] || "";
  let mejor = ",";
  let max = 0;
  for (const s of [",", ";", "\t", "|"]) {
    const n = primera.split(s).length - 1;
    if (n > max) {
      max = n;
      mejor = s;
    }
  }
  return mejor;
}

function abrirLibro(buffer, ext) {
  if (ext === "csv") {
    let texto = buffer.toString("utf8");
    if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
    // Si no era UTF-8 (CSV guardado desde Excel en Windows), se lee como latin1
    if (texto.includes("\uFFFD")) texto = buffer.toString("latin1");
    // raw:true => no convierte nada (conserva ceros a la izquierda, fechas, etc.)
    return XLSX.read(texto, { type: "string", FS: adivinarSeparador(texto), raw: true });
  }
  return XLSX.read(buffer, { type: "buffer", cellDates: true, cellText: true });
}

function textoCelda(c) {
  if (!c) return "";
  let t;
  if (c.w !== undefined && c.w !== null) t = String(c.w);
  else if (c.v === undefined || c.v === null) t = "";
  else if (c.v instanceof Date) t = isNaN(c.v) ? "" : c.v.toISOString().slice(0, 10);
  else t = String(c.v);
  return t.length > MAX_CHARS_CELDA ? t.slice(0, MAX_CHARS_CELDA) + "…" : t;
}

// Devuelve [{ nombre, filas: [[texto,...],...], nCols, anchos, combinadas, truncada }]
function leerLibro(buffer, ext) {
  ext = String(ext || "").toLowerCase().replace(".", "");
  const wb = abrirLibro(buffer, ext);
  const meta = (wb.Workbook && wb.Workbook.Sheets) || [];
  let celdasRestantes = MAX_CELDAS_TOTAL;
  const hojas = [];

  wb.SheetNames.forEach(function (nombre, i) {
    if (meta[i] && meta[i].Hidden) return; // hojas ocultas de Excel

    const ws = wb.Sheets[nombre];
    const ref = ws && ws["!ref"];
    let filas = [];
    let nCols = 0;
    let truncada = false;
    let anchos = [];
    let combinadas = [];

    if (ref) {
      const rango = XLSX.utils.decode_range(ref);
      const totalFilas = rango.e.r + 1;
      const totalCols = rango.e.c + 1;
      const cols = Math.min(totalCols, MAX_COLS);
      const nFilas = Math.max(0, Math.min(totalFilas, MAX_FILAS, Math.floor(celdasRestantes / cols)));

      let ultFila = -1;
      let ultCol = -1;

      for (let r = 0; r < nFilas; r++) {
        const fila = new Array(cols);
        for (let c = 0; c < cols; c++) {
          const t = textoCelda(ws[XLSX.utils.encode_cell({ r: r, c: c })]);
          fila[c] = t;
          if (t !== "") {
            if (r > ultFila) ultFila = r;
            if (c > ultCol) ultCol = c;
          }
        }
        filas.push(fila);
      }

      // quita filas y columnas vacías del final (Excel a veces deja rangos enormes)
      filas = filas.slice(0, ultFila + 1).map(function (f) {
        return f.slice(0, ultCol + 1);
      });
      nCols = ultCol + 1;
      celdasRestantes -= nFilas * cols;

      truncada =
        (nFilas < totalFilas && ultFila === nFilas - 1) ||
        (cols < totalCols && ultCol === cols - 1);

      (ws["!merges"] || []).slice(0, MAX_COMBINADAS).forEach(function (m) {
        if (m.s.r > ultFila || m.s.c > ultCol) return;
        combinadas.push([
          m.s.r,
          m.s.c,
          Math.min(m.e.r, ultFila),
          Math.min(m.e.c, ultCol),
        ]);
      });

      const cfg = ws["!cols"] || [];
      for (let c = 0; c < nCols; c++) {
        const k = cfg[c];
        let w = k ? k.wch || (k.wpx ? k.wpx / 7 : k.width) : null;
        anchos.push(w ? Math.max(6, Math.min(60, Math.round(w))) : null);
      }
    }

    hojas.push({
      nombre: nombre,
      filas: filas,
      nCols: nCols,
      anchos: anchos,
      combinadas: combinadas,
      truncada: truncada,
    });
  });

  return hojas;
}

// Texto plano (separado por tabuladores) de todas las hojas: sirve para buscar y copiar
function hojasATexto(hojas) {
  const partes = [];
  let largo = 0;

  for (const h of hojas) {
    if (hojas.length > 1) partes.push("=== Hoja: " + h.nombre + " ===");
    for (const f of h.filas) {
      const linea = f
        .map(function (t) {
          return t.replace(/[\t\r\n]+/g, " ");
        })
        .join("\t")
        .replace(/\t+$/, "");
      partes.push(linea);
      largo += linea.length + 1;
      if (largo > MAX_CHARS_TEXTO) {
        partes.push("(… texto recortado: la hoja completa se ve en el visor …)");
        return partes.join("\n");
      }
    }
  }

  return partes.join("\n").trim();
}

// Genera un Buffer binario de Excel (.xlsx, .xls o .csv) a partir de la estructura de hojas
function guardarLibro(hojas, formato = "xlsx") {
  const wb = XLSX.utils.book_new();
  const nombresUsados = new Set();

  (hojas || []).forEach(function (h, idx) {
    let nombre = String(h.nombre || `Hoja${idx + 1}`).trim().slice(0, 31).replace(/[\\/?*[\]]/g, "_") || `Hoja${idx + 1}`;
    let contador = 1;
    let baseNombre = nombre;
    while (nombresUsados.has(nombre.toLowerCase())) {
      nombre = `${baseNombre.slice(0, 27)}_${contador++}`;
    }
    nombresUsados.add(nombre.toLowerCase());

    const filas = (h.filas || []).map(function (fila) {
      return (fila || []).map(function (c) {
        if (c === null || c === undefined) return "";
        return c;
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(filas.length ? filas : [[""]]);

    if (h.anchos && Array.isArray(h.anchos)) {
      ws["!cols"] = h.anchos.map(function (w) {
        return { wch: w || 14 };
      });
    }

    if (h.combinadas && Array.isArray(h.combinadas)) {
      ws["!merges"] = h.combinadas.map(function (m) {
        return { s: { r: m[0], c: m[1] }, e: { r: m[2], c: m[3] } };
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, nombre);
  });

  const ext = String(formato || "xlsx").toLowerCase().replace(".", "");
  const bookType = (ext === "xls") ? "biff8" : ((ext === "csv") ? "csv" : "xlsx");
  return XLSX.write(wb, { type: "buffer", bookType });
}

module.exports = { esExcel, leerLibro, hojasATexto, guardarLibro };
