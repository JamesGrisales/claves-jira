"use strict";

// ---------------------------------------------------------------------------
// Informe diario de envío de documentos electrónicos -> PDF
//
// Reproduce el formato del Word "INFORME_DOCUMENTOS_ELECTRONICOS": mismo fondo
// (membrete Jaivaná a página completa), mismas fuentes, tamaños, columnas de la
// tabla y posiciones. Todas las medidas están en puntos (1/72 de pulgada) sobre
// una hoja carta (612 x 792) y salen del propio documento.
// ---------------------------------------------------------------------------

const PDFDocument = require("pdfkit");
const path = require("path");

const FONDO = path.join(__dirname, "assets", "informe-fondo.jpeg");

const W = 612;
const H = 792;
const LIMITE = 700; // el borde azul inferior del membrete empieza cerca de y = 728
const BASE_TITULO_PAG_NUEVA = 102.25; // primer renglón en páginas 2, 3...
const TABLA_X = 13.5;
const TABLA_COL = 117.2;
const TABLA_TOP_PAG_NUEVA = 90;

const SANS = "Helvetica"; // Arial
const SANS_B = "Helvetica-Bold"; // Arial negrita
const SERIF = "Times-Roman"; // Times New Roman

const AZUL_ENCABEZADO = "#B4C5E7";

const ENCABEZADOS = [
  "Empresa",
  "Documentos Enviados",
  "Pendientes por Enviar",
  "Rechazados",
  "Observaciones Técnicas",
];

// ----------------------------- limpieza de datos ---------------------------

function limpiar(valor, max) {
  return String(valor == null ? "" : valor)
    .replace(/[\r\n\t\v\f]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC\u2026]/g, "?")
    .trim()
    .slice(0, max || 200);
}

// Como limpiar(), pero conserva los saltos de línea (para el cuadro de observaciones).
function limpiarMultilinea(valor, max) {
  return String(valor == null ? "" : valor)
    .replace(/\r\n?/g, "\n")
    .replace(/[\t\v\f]/g, " ")
    .replace(/[^\n\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC\u2026]/g, "?")
    .split("\n")
    .map((l) => l.replace(/ {2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max || 3000);
}

function fechaDdMmAaaa(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  return m ? `${m[3]}-${m[2]}-${m[1]}` : limpiar(iso, 20);
}

function horaTexto(hhmm, formato) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ""));
  if (!m) return limpiar(hhmm, 20);
  const h = Math.min(23, parseInt(m[1], 10));
  const min = m[2];
  const sufijo = h >= 12 ? "pm" : "am";
  if (formato === "24h") return `${String(h).padStart(2, "0")}:${min}`;
  if (formato === "12h") return `${h % 12 === 0 ? 12 : h % 12}:${min} ${sufijo}`;
  // "word": igual que el documento original (17:40pm)
  return `${String(h).padStart(2, "0")}:${min}${sufijo}`;
}

function normalizar(d) {
  d = d || {};
  const filas = (Array.isArray(d.filas) ? d.filas : []).slice(0, 300).map((f) => {
    f = Array.isArray(f) ? f : [];
    return [0, 1, 2, 3, 4].map((i) => limpiar(f[i], 120));
  });
  const r = d.resumen || {};
  return {
    titulo: limpiar(d.titulo, 200) || "FORMATO DIARIO DE REPORTE DE ENVÍO DE DOCUMENTOS ELECTRÓNICOS",
    tecnico: limpiar(d.tecnico, 120),
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha || "")) ? d.fecha : "",
    hora: limpiar(d.hora, 10),
    horaFormato: ["word", "12h", "24h"].includes(d.horaFormato) ? d.horaFormato : "word",
    filas,
    observaciones: limpiarMultilinea(d.observaciones, 3000),
    ticket: String(d.ticket || "").toLowerCase() === "no" ? "No" : "Si",
    numeroTicket: limpiar(d.numeroTicket, 60),
    resumen: {
      empresas: limpiar(r.empresas, 40),
      aceptados: limpiar(r.aceptados, 40),
      pendientes: limpiar(r.pendientes, 40),
      escalados: limpiar(r.escalados, 40),
      tickets: limpiar(r.tickets, 40),
    },
  };
}

// ------------------------------ utilidades PDF -----------------------------

function ancho(doc, texto, fuente, tam) {
  doc.font(fuente).fontSize(tam);
  return doc.widthOfString(texto);
}

// Escribe texto ubicando su LÍNEA BASE en (x, base), como se mide en el Word.
function texto(doc, str, x, base, fuente, tam, opciones) {
  doc.font(fuente).fontSize(tam).fillColor("#000000");
  const asc = (doc._font.ascender / 1000) * tam;
  doc.text(str, x, base - asc, Object.assign({ lineBreak: false }, opciones || {}));
}

function centrado(doc, str, centroX, base, fuente, tam) {
  const w = ancho(doc, str, fuente, tam);
  texto(doc, str, centroX - w / 2, base, fuente, tam);
}

function linea(doc, x1, y1, x2, y2, grosor) {
  doc.save().lineWidth(grosor || 0.5).strokeColor("#000000").moveTo(x1, y1).lineTo(x2, y2).stroke().restore();
}

function partir(doc, str, disponible, fuente, tam) {
  doc.font(fuente).fontSize(tam);
  const palabras = String(str).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = "";
  for (let palabra of palabras) {
    while (doc.widthOfString(palabra) > disponible && palabra.length > 1) {
      let i = palabra.length;
      while (i > 1 && doc.widthOfString(palabra.slice(0, i)) > disponible) i--;
      if (actual) { lineas.push(actual); actual = ""; }
      lineas.push(palabra.slice(0, i));
      palabra = palabra.slice(i);
    }
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (actual && doc.widthOfString(prueba) > disponible) { lineas.push(actual); actual = palabra; }
    else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas.length ? lineas : [""];
}

// ------------------------------ generación ---------------------------------

function generarInformePdf(datos) {
  const d = normalizar(datos);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      autoFirstPage: false,
      info: {
        Title: "Informe diario de envío de documentos electrónicos",
        Author: d.tecnico || "Jaivaná",
        Subject: `Reporte del ${fechaDdMmAaaa(d.fecha)}`,
      },
    });
    const partes = [];
    doc.on("data", (c) => partes.push(c));
    doc.on("end", () => {
      const sufijo = d.fecha || new Date().toISOString().slice(0, 10);
      resolve({ buffer: Buffer.concat(partes), filename: `INFORME_DOCUMENTOS_ELECTRONICOS_${sufijo}.pdf` });
    });
    doc.on("error", reject);

    const nuevaPagina = () => {
      doc.addPage({ size: "LETTER", margin: 0 });
      doc.image(FONDO, 0, 0, { width: W, height: H });
    };

    try {
      // ============================ PÁGINA 1 ===============================
      nuevaPagina();

      // Título centrado (Arial negrita 12)
      let base = 137.3;
      const lineasTitulo = partir(doc, d.titulo, 400, SANS_B, 12);
      lineasTitulo.forEach((t, i) => {
        centrado(doc, t, 306, base + i * 13.8, SANS_B, 12);
      });
      base += (lineasTitulo.length - 1) * 13.8;

      // Técnico / fecha / hora
      base += 41.4;
      const lineasTecnico = partir(doc, `Técnico responsable: ${d.tecnico}`, 440, SANS_B, 12);
      lineasTecnico.forEach((t, i) => texto(doc, t, 85.2, base + i * 13.8, SANS_B, 12));
      base += (lineasTecnico.length - 1) * 13.8 + 13.8;
      const hora = horaTexto(d.hora, d.horaFormato);
      texto(doc, `Fecha del reporte: ${fechaDdMmAaaa(d.fecha)} Hora:${hora}`, 85.2, base, SANS_B, 12);

      // 1. Detalles por Empresa
      base += 41.4;
      texto(doc, "1.", 103.2, base, SANS_B, 12);
      texto(doc, "Detalles por Empresa", 121.2, base, SANS_B, 12);

      let y = base + 12.2; // borde superior de la tabla

      const colX = [0, 1, 2, 3, 4, 5].map((i) => TABLA_X + i * TABLA_COL);

      const dibujarEncabezado = (top) => {
        const alto = 41.7;
        doc.save().rect(TABLA_X, top, TABLA_COL * 5, alto).fill(AZUL_ENCABEZADO).restore();
        ENCABEZADOS.forEach((t, i) => {
          const ls = partir(doc, t, TABLA_COL - 6, SANS_B, 12);
          const primera = top + 25.5 - ((ls.length - 1) * 13.8) / 2;
          ls.forEach((l, k) => centrado(doc, l, colX[i] + TABLA_COL / 2, primera + k * 13.8, SANS_B, 12));
        });
        linea(doc, colX[0], top, colX[5], top);
        colX.forEach((x) => linea(doc, x, top, x, top + alto));
        linea(doc, colX[0], top + alto, colX[5], top + alto);
        return alto;
      };

      y += dibujarEncabezado(y);

      d.filas.forEach((fila) => {
        const celdas = fila.map((t) => partir(doc, t, TABLA_COL - 1.4, SERIF, 11));
        const nLineas = Math.max(...celdas.map((c) => c.length));
        const alto = Math.max(16.65, nLineas * 12.65 + 0.5);
        if (y + alto > LIMITE) {
          nuevaPagina();
          y = TABLA_TOP_PAG_NUEVA;
          y += dibujarEncabezado(y);
        }
        celdas.forEach((ls, i) => {
          ls.forEach((l, k) => centrado(doc, l, colX[i] + TABLA_COL / 2, y + 10.45 + k * 12.65, SERIF, 11));
        });
        colX.forEach((x) => linea(doc, x, y, x, y + alto));
        linea(doc, colX[0], y + alto, colX[5], y + alto);
        y += alto;
      });

      // Observaciones (opcional): va debajo de la tabla y solo sale si tiene texto,
      // así el informe sin observaciones queda idéntico al formato original.
      let referencia = y; // borde inferior de la tabla
      if (d.observaciones) {
        let b = y + 26;
        if (b > LIMITE - 40) { nuevaPagina(); b = BASE_TITULO_PAG_NUEVA; }
        texto(doc, "Observaciones:", 85.2, b, SANS_B, 12);
        let cur = b + 18;
        let ultima = b;
        d.observaciones.split("\n").forEach((parrafo) => {
          if (parrafo === "") { cur += 13.8; return; }
          partir(doc, parrafo, 468, SANS, 12).forEach((l) => {
            if (cur > LIMITE - 4) { nuevaPagina(); cur = BASE_TITULO_PAG_NUEVA; }
            texto(doc, l, 85.2, cur, SANS, 12);
            ultima = cur;
            cur += 13.8;
          });
        });
        referencia = ultima - 5; // el siguiente bloque conserva la separación normal
      }

      // 2. ¿Se generó ticket en mesa de ayuda?
      let base2 = referencia + 39.25;
      if (base2 + 148.75 > LIMITE - 5) {
        nuevaPagina();
        base2 = BASE_TITULO_PAG_NUEVA;
      }
      texto(doc, "2.", 103.2, base2, SANS_B, 12);
      texto(doc, "¿Se generó ticket en mesa de ayuda?", 121.2, base2, SANS_B, 12);

      // Respuesta subrayada (Si / No)
      const baseSi = base2 + 36.75;
      texto(doc, d.ticket, 85.2, baseSi, SANS, 12);
      const finSi = Math.max(135.3, 85.2 + ancho(doc, d.ticket, SANS, 12) + 6);
      linea(doc, 85.2 + ancho(doc, d.ticket, SANS, 12), baseSi + 0.6, finSi, baseSi + 0.6, 0.6);

      // Número del ticket
      const baseNum = baseSi + 84;
      texto(doc, "número del", 85.2, baseNum, SANS, 12);
      texto(doc, "ticket", 85.2, baseNum + 28, SANS, 12);
      const xNum = 85.2 + ancho(doc, "ticket", SANS, 12) + 6;
      const wNum = ancho(doc, d.numeroTicket, SANS, 12);
      if (d.numeroTicket) texto(doc, d.numeroTicket, xNum + 3, baseNum + 28, SANS, 12);
      linea(doc, xNum, baseNum + 28.6, xNum + Math.max(60, wNum + 8), baseNum + 28.6, 0.6);

      // ============================ RESUMEN ================================
      nuevaPagina();
      texto(doc, "3.", 103.2, BASE_TITULO_PAG_NUEVA, SANS_B, 12);
      texto(doc, "Resumen Diario", 121.2, BASE_TITULO_PAG_NUEVA, SANS_B, 12);

      const items = [
        ["Total de empresas revisadas:", d.resumen.empresas],
        ["Total de documentos aceptadas:", d.resumen.aceptados],
        ["Total de documentos pendientes:", d.resumen.pendientes],
        ["Total de casos escalados a infraestructura:", d.resumen.escalados],
        ["Tickets generados para automatización:", d.resumen.tickets],
      ];
      items.forEach(([etiqueta, valor], i) => {
        const b = 125.05 + i * 14;
        texto(doc, "•", 103.2, b, SANS, 10);
        texto(doc, etiqueta, 121.2, b, SANS, 12);
        const x0 = 121.2 + ancho(doc, etiqueta, SANS, 12) + 4;
        const wv = ancho(doc, valor, SANS, 12);
        if (valor) texto(doc, valor, x0 + 4, b, SANS, 12);
        linea(doc, x0, b + 0.6, x0 + Math.max(36, wv + 8), b + 0.6, 0.6);
      });

      // ============================= PIE ===================================
      // Dos renglones como en el Word: "Nuestro propósito:" (negrita) + frase;
      // el segundo renglón arranca en x = 151.9.
      const etiquetaProp = "Nuestro propósito:";
      const wEt = ancho(doc, etiquetaProp, SANS_B, 12);
      texto(doc, etiquetaProp, 90.9, 764.9, SANS_B, 12);
      texto(doc, "Apoyándonos en la tecnología, contribuimos al desarrollo económico y", 90.9 + wEt + 4, 764.9, SANS, 12);
      texto(doc, "social, aportando mejoras a su negocio y calidad de vida a sus colaboradores", 151.9, 778.9, SANS, 12);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}


module.exports = { generarInformePdf, normalizar };
