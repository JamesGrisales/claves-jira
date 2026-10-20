// PDF de los formularios de Viáticos (mismo formato de los Excel originales de Jaivaná):
//   1) Solicitud de anticipos de viáticos  (carta vertical, página 2 = presupuesto de la visita)
//   2) Legalización de gastos de viaje      (carta horizontal)
//
// Uso:  const { buffer, filename } = await generarSolicitudPdf(datos);
//       const { buffer, filename } = await generarLegalizacionPdf(datos);

const PDFDocument = require("pdfkit");

const LOGO = Buffer.from("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", "base64");

const NEGRO = "#000000";
const REG = "Helvetica";
const NEG = "Helvetica-Bold";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const TEXTO_LEGAL =
  "El suscrito trabajador declara haber recibido en la fecha el importe que aparece en este comprobante y que " +
  "corresponde enteramente al cubrimiento de los costos transitorios de representación , alimentación, " +
  "hospedaje y/o pernoctación, medios de transporte elementos de trabajo y otros semejantes, generados en " +
  "el desarrollo de las visitas que con motivo de su trabajo debe realizar.  Manifiesta expresamente que el " +
  "presente desembolso no constituye salario ni en dinero ni en especie, pues tiene como exclusiva y precisa " +
  "destinación la de desempeñar a cabalidad sus funciones de acuerdo con el Artículo 128 del Código " +
  "Sustantivo del Trabajo Subrogado Ley 50/90 Artículo 15, igualmente manifiesta que no constituye salario, " +
  "por el convenio escrito que sobre pagos no salariales quedó establecido expresamente en el Contrato de " +
  "Trabajo suscrito entre la Empresa y el Trabajador, aunado ello a la presunción de buena fé que consagra, " +
  "con relación a las actuaciones entre particulares, el Artículo 83 de la Constitución Política de Colombia.";

const TEXTO_NOTA =
  " Es responsabilidad del empleado legalizar los gastos de viaje de acuerdo al instructivo que conoce, " +
  "de no realizarlo, autoriza a Sumatec S.A. para que descuente de su nómina y/o liquidación definitiva en " +
  "caso de retiro, los valores que por este concepto adeude.";

// ---------------------------------------------------------------------------
// Utilidades de datos (la misma lógica está en la pantalla viaticos.ejs)
// ---------------------------------------------------------------------------

// Texto seguro para las fuentes estándar del PDF (Latin-1): sin saltos de línea ni caracteres raros
function limpio(v, max) {
  let s = String(v === null || v === undefined ? "" : v)
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...");
  s = Array.from(s)
    .map((ch) => (ch.charCodeAt(0) > 255 ? "?" : ch))
    .join("");
  return s.trim().slice(0, max || 200);
}

// "55.000", "$ 55000", "55,000", "-5.000" → número entero (pesos)
function numero(v) {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : 0;
  let s = String(v === null || v === undefined ? "" : v).trim();
  if (!s) return 0;
  const neg = /^[\s$]*[-(]/.test(s);
  s = s.replace(/,\d{1,2}\s*$/, "");
  s = s.replace(/\D/g, "");
  if (!s) return 0;
  const n = Number(s.slice(0, 12));
  return neg ? -n : n;
}

function miles(n) {
  const t = String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "-" : "") + t;
}

function partesFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const f = new Date(Date.UTC(y, mo - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mo - 1 || f.getUTCDate() !== d) return null;
  return { y, mo, d, dia: f.getUTCDay() };
}

function fechaDMY(iso) {
  const p = partesFecha(iso);
  if (!p) return "";
  return String(p.d).padStart(2, "0") + "/" + String(p.mo).padStart(2, "0") + "/" + p.y;
}

function nombreDia(iso) {
  const p = partesFecha(iso);
  return p ? DIAS[p.dia] : "";
}

function mesAnio(iso) {
  const p = partesFecha(iso);
  if (!p) return "";
  const mes = MESES[p.mo - 1];
  return mes.charAt(0).toUpperCase() + mes.slice(1) + " del " + p.y;
}

function nombreArchivo(base, iso) {
  const p = partesFecha(iso);
  const f = p ? iso : new Date().toISOString().slice(0, 10);
  return base + "_" + f + ".pdf";
}

// ---------------------------------------------------------------------------
// Utilidades de dibujo
// ---------------------------------------------------------------------------
function nuevoPdf(opciones, titulo) {
  const doc = new PDFDocument(Object.assign({ size: "LETTER", margin: 0, info: { Title: titulo, Author: "Bóveda Jira" } }, opciones));
  const partes = [];
  doc.on("data", (c) => partes.push(c));
  const terminado = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(partes)));
    doc.on("error", reject);
  });
  return { doc, terminado };
}

function linea(doc, x1, y1, x2, y2, grosor) {
  doc.lineWidth(grosor || 0.8).strokeColor(NEGRO).moveTo(x1, y1).lineTo(x2, y2).stroke();
}

function caja(doc, x, y, w, h, grosor) {
  doc.lineWidth(grosor || 0.8).strokeColor(NEGRO).rect(x, y, w, h).stroke();
}

// Escribe una sola línea con su centro vertical en "yc". Si no cabe en "w", reduce la letra y al final recorta con "…"
function texto(doc, str, x, yc, o) {
  o = o || {};
  str = String(str === null || str === undefined ? "" : str);
  if (!str) return;

  const fuente = o.font || REG;
  let size = o.size || 10;
  doc.font(fuente);

  if (o.w) {
    const minimo = o.min || 5.5;
    while (size > minimo && doc.fontSize(size).widthOfString(str) > o.w) size -= 0.25;
    doc.fontSize(size);
    if (doc.widthOfString(str) > o.w) {
      while (str.length > 1 && doc.widthOfString(str + "...") > o.w) str = str.slice(0, -1);
      str += "...";
    }
  }

  doc.fontSize(size).fillColor(NEGRO);
  const arriba = yc - size * 0.36;
  if (o.w) doc.text(str, x, arriba, { width: o.w, align: o.align || "left", lineBreak: false });
  else doc.text(str, x, arriba, { lineBreak: false });
}

// "$" a la izquierda y el valor pegado a la derecha (como los campos de dinero de Excel)
function dinero(doc, valor, x, w, yc, o) {
  o = o || {};
  texto(doc, "$", x + 2, yc, { font: o.font || REG, size: o.size || 9 });
  texto(doc, valor, x, yc, { font: o.font || REG, size: o.size || 9, w: w - 3, align: "right" });
}

function celdaMoneda(n, ceroComoGuion) {
  if (!n && ceroComoGuion) return "-";
  return miles(n);
}

// ---------------------------------------------------------------------------
// 1) SOLICITUD DE ANTICIPOS DE VIÁTICOS
// ---------------------------------------------------------------------------
function calcularSolicitud(d) {
  const conceptos = (Array.isArray(d.conceptos) ? d.conceptos : [])
    .slice(0, 30)
    .map((c) => ({ concepto: limpio(c && c.concepto, 60), valor: numero(c && c.valor) }))
    .filter((c) => c.concepto || c.valor);

  const totalPresupuesto = conceptos.reduce((s, c) => s + c.valor, 0);
  const anterior = numero(d.anticipoAnterior);
  const causado = numero(d.valorCausado);
  const saldo = anterior - causado;
  const solicitado = d.autoSolicitado === false ? numero(d.anticipoSolicitado) : totalPresupuesto;
  const consignar = solicitado - saldo;

  return { conceptos, totalPresupuesto, anterior, causado, saldo, solicitado, consignar };
}

async function generarSolicitudPdf(d) {
  d = d || {};
  const c = calcularSolicitud(d);
  const { doc, terminado } = nuevoPdf({ layout: "portrait" }, "Solicitud de anticipos de viáticos");

  const nombre = limpio(d.nombre, 80);
  const periodo = limpio(d.periodo, 80);

  // --- Encabezado
  doc.image(LOGO, 29, 30, { width: 184, height: 42 });
  texto(doc, "Fecha actualización", 309, 47, { font: NEG, size: 8.5 });
  texto(doc, limpio(d.fechaFormato, 20), 427, 47, { size: 8.5 });
  texto(doc, "SOLICITUD DE ANTICIPOS DE VIÁTICOS", 20, 85, { font: NEG, size: 13.5, w: 552, align: "center" });
  texto(doc, "COMPROBANTE DE DINEROS ENTREGADOS PARA CUBRIR GASTOS DE REPRESENTACIÓN,", 20, 121, { font: NEG, size: 10.5, w: 552, align: "center" });
  texto(doc, "HABITACIÓN, ALIMENTACIÓN Y/O TRANSPORTES PARA EL DESARROLLO DE VISITAS", 20, 134, { font: NEG, size: 10.5, w: 552, align: "center" });

  // --- Datos del empleado (etiqueta + valor con línea inferior)
  const L = 20;
  const VX = 153;
  const campo = (etiqueta, yc, x1, x2, valor, o) => {
    texto(doc, etiqueta, L, yc, { font: NEG, size: 11 });
    linea(doc, x1, yc + 8.5, x2, yc + 8.5, 1);
    if (valor) texto(doc, valor, x1 + 2, yc, Object.assign({ w: x2 - x1 - 4 }, o || {}));
  };

  campo("NOMBRE EMPLEADO", 181, VX, 572, nombre, { size: 10 });
  campo("CEDULA", 202, VX, 329, limpio(d.cedula, 30), { size: 10, align: "center" });
  texto(doc, "Nro CUENTA", 342, 202, { font: NEG, size: 9 });
  linea(doc, 414, 210.5, 572, 210.5, 1);
  texto(doc, limpio(d.cuenta, 30), 416, 201.5, { font: NEG, size: 11, w: 154 });

  campo("CARGO", 222, VX, 329, limpio(d.cargo, 60), { font: NEG, size: 7.5 });
  texto(doc, "SEDE", 355, 222, { font: NEG, size: 10.5 });
  linea(doc, 415, 230.5, 572, 230.5, 1);
  texto(doc, limpio(d.sede, 40), 417, 222, { font: NEG, size: 10.5, w: 153 });

  campo("FECHA SOLICITUD", 242, VX, 329, fechaDMY(d.fecha), { font: NEG, size: 10.5 });
  campo("PERIODO", 262, VX, 509, periodo, { font: NEG, size: 10.5 });
  campo("CORRERÍA", 282, VX, 509, limpio(d.correria1, 90), { font: NEG, size: 10.5 });
  linea(doc, VX, 310.2, 509, 310.2, 1);
  texto(doc, limpio(d.correria2, 90), VX + 2, 302, { font: NEG, size: 8.5, w: 352 });

  // --- Valores
  const dinLinea = (etiqueta, yc, valor, negrita) => {
    texto(doc, etiqueta, L, yc, { font: NEG, size: 11 });
    linea(doc, VX, yc + 8, 329, yc + 8, 1);
    texto(doc, "$", VX + 6, yc + 1, { font: NEG, size: 9.5 });
    texto(doc, valor, VX + 20, yc + 1, { font: NEG, size: 8.5, w: 127, align: "right" });
  };
  dinLinea("ANTICIPO ANTERIOR", 337, celdaMoneda(c.anterior, true));
  dinLinea("VALOR CAUSADO", 357.5, celdaMoneda(c.causado, true));
  dinLinea("SALDO", 378, celdaMoneda(c.saldo, true));
  dinLinea("ANTICIPO SOLICITADO", 397.5, celdaMoneda(c.solicitado, true));
  dinLinea("VALOR A CONSIGNAR", 418, celdaMoneda(c.consignar, true));

  // --- Texto legal y nota
  doc.font(REG).fontSize(10.8).fillColor(NEGRO).text(TEXTO_LEGAL, L, 451, { width: 552, align: "left", lineGap: 1.9 });

  doc.font(NEG).fontSize(10.8).text("NOTA:", L, 622, { continued: true, width: 552, lineGap: 1.9 });
  doc.font(REG).text(TEXTO_NOTA, { width: 552, align: "left", lineGap: 1.9 });

  // --- Firmas
  const firmaEmp = limpio(d.firmaEmpleado, 80) || nombre;
  const firmaAut = limpio(d.firmaAutoriza, 80);
  texto(doc, "Firma empleado", 54, 699, { font: NEG, size: 9 });
  linea(doc, 152, 707, 303, 707, 1);
  texto(doc, firmaEmp, 54, 713, { font: NEG, size: 9, w: 250 });
  linea(doc, 52, 741, 303, 741, 1);

  texto(doc, "Firma autorización", 330, 699, { font: NEG, size: 9 });
  linea(doc, 414, 707, 572, 707, 1);
  texto(doc, firmaAut, 330, 713, { font: NEG, size: 9, w: 240 });
  linea(doc, 327, 741, 572, 741, 1);

  // --- Página 2: presupuesto de la visita
  doc.addPage({ size: "LETTER", layout: "portrait", margin: 0 });
  const TX = 52;
  const W1 = 108;
  const W2 = 84;
  let y = 40;

  const hEnc = 15;
  caja(doc, TX, y, W1 + W2, hEnc);
  texto(doc, "PRESUPUESTO VISITA", TX, y + hEnc / 2, { font: NEG, size: 10, w: W1 + W2, align: "center" });
  y += hEnc;

  const empresas = limpio(d.empresas, 60);
  doc.font(NEG).fontSize(10);
  const hPer = doc.heightOfString(periodo || " ", { width: W2 - 8, align: "center" });
  const hEmp = doc.heightOfString(empresas || " ", { width: W1 - 8, align: "center" });
  const hCab = Math.max(30, hPer + 10, hEmp + 10);

  caja(doc, TX, y, W1, hCab);
  caja(doc, TX + W1, y, W2, hCab);
  doc.font(NEG).fontSize(10).fillColor(NEGRO);
  doc.text(empresas, TX + 4, y + (hCab - hEmp) / 2, { width: W1 - 8, align: "center" });
  doc.text(periodo, TX + W1 + 4, y + (hCab - hPer) / 2, { width: W2 - 8, align: "center" });
  y += hCab;

  const hFila = 14.6;
  c.conceptos.forEach((fila) => {
    caja(doc, TX, y, W1, hFila);
    caja(doc, TX + W1, y, W2, hFila);
    texto(doc, fila.concepto, TX + 3, y + hFila / 2, { size: 10, w: W1 - 6 });
    texto(doc, "$" + miles(fila.valor), TX + W1, y + hFila / 2, { size: 10, w: W2 - 3, align: "right" });
    y += hFila;
  });

  caja(doc, TX, y, W1, hFila);
  caja(doc, TX + W1, y, W2, hFila);
  texto(doc, "TOTAL", TX + 3, y + hFila / 2, { font: NEG, size: 10 });
  texto(doc, "$" + miles(c.totalPresupuesto), TX + W1, y + hFila / 2, { font: NEG, size: 10, w: W2 - 3, align: "right" });

  doc.end();
  const buffer = await terminado;
  return { buffer, filename: nombreArchivo("SOLICITUD_ANTICIPO_VIATICOS", d.fecha) };
}

// ---------------------------------------------------------------------------
// 2) LEGALIZACIÓN DE GASTOS DE VIAJE
// ---------------------------------------------------------------------------
const N_DIAS = 7;
const N_FILAS = 7;
const N_OTROS = 2;

function calcularLegalizacion(d) {
  const fechas = [];
  for (let i = 0; i < N_DIAS; i++) fechas.push(Array.isArray(d.fechas) && partesFecha(d.fechas[i]) ? String(d.fechas[i]).trim() : "");

  const leerFila = (f) => {
    const valores = [];
    for (let i = 0; i < N_DIAS; i++) valores.push(numero(f && Array.isArray(f.valores) ? f.valores[i] : 0));
    return { concepto: limpio(f && f.concepto, 60), valores, total: valores.reduce((s, v) => s + v, 0) };
  };

  const filas = [];
  for (let i = 0; i < N_FILAS; i++) filas.push(leerFila(Array.isArray(d.filas) ? d.filas[i] : null));
  const otros = [];
  for (let i = 0; i < N_OTROS; i++) otros.push(leerFila(Array.isArray(d.otros) ? d.otros[i] : null));

  const totalGastos = filas.concat(otros).reduce((s, f) => s + f.total, 0);
  return { fechas, filas, otros, totalGastos };
}

async function generarLegalizacionPdf(d) {
  d = d || {};
  const c = calcularLegalizacion(d);
  const { doc, terminado } = nuevoPdf({ layout: "landscape" }, "Legalización de gastos de viaje");

  const X0 = 52;
  const XR = 705;
  const XC = 326; // donde termina la columna de conceptos del encabezado
  const XD = 322; // inicio de las columnas de días
  const DW = 48; // ancho de cada día
  const XT = XD + DW * N_DIAS; // inicio de la columna TOTAL
  const nombre = limpio(d.nombre, 80);

  // --- Encabezado
  caja(doc, X0, 54, XR - X0, 33);
  linea(doc, XC, 54, XC, 87);
  doc.image(LOGO, 80, 57, { width: 108 });
  texto(doc, "Fecha actualización:", 480, 60, { font: NEG, size: 8 });
  texto(doc, fechaDMY(d.fechaFormato) || limpio(d.fechaFormato, 20), 566, 60, { size: 8 });
  texto(doc, "LEGALIZACIÓN GASTOS DE VIAJE", XC, 76, { font: NEG, size: 9.5, w: XR - XC, align: "center" });

  // nombre
  caja(doc, X0, 87, XR - X0, 12);
  linea(doc, XC, 87, XC, 123);
  linea(doc, 531, 87, 531, 99);
  linea(doc, 574, 87, 574, 99);
  texto(doc, "NOMBRE COMPLETO DEL EMPLEADO", X0 + 1, 93, { font: NEG, size: 8.5 });
  texto(doc, nombre, XC + 2, 93, { font: NEG, size: 8.5, w: 200 });
  // cargo
  caja(doc, X0, 99, XR - X0, 12);
  texto(doc, "CARGO", X0 + 1, 105, { font: NEG, size: 8.5 });
  texto(doc, limpio(d.cargo, 60), XC + 2, 105, { font: NEG, size: 8.5, w: XR - XC - 6 });
  // zona
  caja(doc, X0, 111, XR - X0, 12);
  texto(doc, "ZONA O SEDE", X0 + 1, 117, { font: NEG, size: 8.5 });
  texto(doc, limpio(d.zona, 60), XC + 2, 117, { font: NEG, size: 7, w: XR - XC - 6 });

  // --- Tabla principal
  const hFechas = 12.4; // fila del mes y las fechas
  const hDias = 17.7; // fila del día de la semana
  const hFilas = [17.7, 17.7, 13, 13, 13, 13, 13]; // los 7 conceptos (los dos primeros son más altos)
  const hOtrosEnc = 12.4;
  const hOtros = 12.4;
  const hTotal = 12.4;

  let y = 133;

  // fila 1: mes y fechas
  const h1 = hFechas;
  caja(doc, X0, y, XR - X0, h1);
  linea(doc, XD, y, XD, y + h1);
  for (let i = 1; i <= N_DIAS; i++) linea(doc, XD + DW * i, y, XD + DW * i, y + h1);
  texto(doc, mesAnio(c.fechas.find((f) => f) || ""), X0, y + h1 / 2, { font: NEG, size: 8.5, w: XD - X0, align: "center" });
  c.fechas.forEach((f, i) => texto(doc, fechaDMY(f), XD + DW * i, y + h1 / 2, { font: NEG, size: 7.5, w: DW, align: "center" }));
  texto(doc, "TOTAL", XT + 2, y + h1 / 2, { font: NEG, size: 8.5 });
  y += h1;

  // fila 2: día de la semana
  const h2 = hDias;
  caja(doc, X0, y, XR - X0, h2);
  linea(doc, XD, y, XD, y + h2);
  for (let i = 1; i <= N_DIAS; i++) linea(doc, XD + DW * i, y, XD + DW * i, y + h2);
  texto(doc, "FECHA", X0, y + h2 / 2, { font: NEG, size: 8.5, w: XD - X0, align: "center" });
  c.fechas.forEach((f, i) => texto(doc, nombreDia(f), XD + DW * i, y + h2 / 2, { font: NEG, size: 7.5, w: DW, align: "center" }));
  y += h2;

  // filas de conceptos
  const dibujarFila = (fila, h, grande, negritaTotal) => {
    caja(doc, X0, y, XR - X0, h);
    linea(doc, XD, y, XD, y + h);
    for (let i = 1; i <= N_DIAS; i++) linea(doc, XD + DW * i, y, XD + DW * i, y + h);
    texto(doc, fila.concepto, X0 + 2, y + h / 2, { size: grande ? 10 : 8.5, w: XD - X0 - 4, align: "center" });
    fila.valores.forEach((v, i) => {
      if (v) dinero(doc, miles(v), XD + DW * i, DW, y + h / 2, { size: grande ? 9 : 8 });
    });
    dinero(doc, celdaMoneda(fila.total, true), XT, XR - XT, y + h / 2, { font: negritaTotal ? NEG : REG, size: 7.5 });
    y += h;
  };

  c.filas.forEach((fila, i) => dibujarFila(fila, hFilas[i], i === 0, true));

  // OTROS GASTOS
  caja(doc, X0, y, XR - X0, hOtrosEnc);
  texto(doc, "OTROS GASTOS", X0, y + hOtrosEnc / 2, { font: NEG, size: 8.5, w: XR - X0, align: "center" });
  y += hOtrosEnc;
  c.otros.forEach((fila) => dibujarFila(fila, hOtros, false, false));

  // TOTAL GASTOS
  const xl = XD + DW * 4;
  caja(doc, xl, y, DW * 2, hTotal);
  caja(doc, xl + DW * 2, y, DW, hTotal);
  caja(doc, XT, y, XR - XT, hTotal);
  texto(doc, "TOTAL GASTOS", xl, y + hTotal / 2, { font: NEG, size: 8.5, w: DW * 2, align: "center" });
  dinero(doc, miles(c.totalGastos), XT, XR - XT, y + hTotal / 2, { size: 8 });
  y += hTotal;

  // --- Pie
  texto(doc, "Anexo facturas y/o documentos equivalentes:", X0, y + 16, { font: NEG, size: 8 });

  const ys = y + 44;
  linea(doc, X0, ys, XC, ys, 1);
  linea(doc, 437, ys, 575, ys, 1);
  texto(doc, "Firma empleado", X0, ys + 6, { font: NEG, size: 8 });
  texto(doc, "Firma de Autorizacion", 437, ys + 6, { font: NEG, size: 8 });
  texto(doc, limpio(d.firmaEmpleado, 80) || nombre, X0, ys + 17, { size: 7.5, w: 270 });

  doc.end();
  const buffer = await terminado;
  const primera = c.fechas.find((f) => f) || "";
  return { buffer, filename: nombreArchivo("LEGALIZACION_GASTOS_VIAJE", primera) };
}

module.exports = { generarSolicitudPdf, generarLegalizacionPdf, numero, miles };
