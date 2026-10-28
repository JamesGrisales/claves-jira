const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

const MIMES_IMAGEN_OK = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/bmp",
  "image/webp",
]);

// ---------------------------------------------------------------------------
// Decodificación de texto: UTF-8 (con o sin BOM), UTF-16 (LE/BE) y, si el
// archivo no es UTF-8 válido, Windows-1252 (ANSI, típico de scripts SQL viejos)
// ---------------------------------------------------------------------------
function decodificarTexto(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.slice(2).toString("utf16le");
  }

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const invertido = Buffer.from(buffer.slice(2));
    invertido.swap16();
    return invertido.toString("utf16le");
  }

  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.slice(3).toString("utf8");
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch (e) {
    try {
      return new TextDecoder("windows-1252").decode(buffer);
    } catch (e2) {
      return buffer.toString("latin1");
    }
  }
}

// ---------------------------------------------------------------------------
// Limpieza de espacios
// ---------------------------------------------------------------------------
// - Quita BOM, caracteres invisibles y espacios "raros" (no separables).
// - Unifica saltos de línea y convierte tabuladores en 4 espacios.
// - Quita espacios al final de cada línea.
// - En líneas SIN comillas, junta espacios repetidos en el medio en uno solo
//   (así no se toca el contenido de textos entre comillas de un SQL).
// - Deja como máximo UNA línea en blanco seguida.
// - Quita líneas en blanco al inicio y al final.
function limpiarTexto(texto) {
  if (!texto) return "";

  let t = String(texto)
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00A0\u2007\u202F\u2002-\u200A\u3000]/g, " ")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u2028|\u2029/g, "\n")
    .replace(/\t/g, "    ");

  const lineas = t.split("\n").map((linea) => {
    let l = linea.trimEnd();
    if (!/['"`]/.test(l)) {
      const sangria = l.length - l.trimStart().length;
      l = l.slice(0, sangria) + l.slice(sangria).replace(/ {2,}/g, " ");
    }
    return l;
  });

  const salida = [];
  let enBlanco = false;
  for (const l of lineas) {
    if (l === "") {
      if (!enBlanco) salida.push("");
      enBlanco = true;
    } else {
      salida.push(l);
      enBlanco = false;
    }
  }

  return salida.join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
}

// ---------------------------------------------------------------------------
// HTML (de mammoth) -> texto plano conservando saltos de línea y marcadores
// de imagen [[IMG:n]]
// ---------------------------------------------------------------------------
function decodificarEntidades(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

function htmlATexto(html) {
  let t = html
    .replace(/<sup><a href="#(?:footnote|endnote)-\d+"[^>]*>\[\d+\]<\/a><\/sup>/g, "")
    .replace(/<img[^>]*src="IMGMARK(\d+)"[^>]*>/g, "\n[[IMG:$1]]\n")
    .replace(/<\/(p|h[1-6]|li|div|pre|blockquote)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/t[dh]>/g, "\t")
    .replace(/<\/tr>/g, "\n")
    .replace(/<[^>]+>/g, "");
  return decodificarEntidades(t);
}

async function procesarDocx(buffer) {
  const imagenes = [];

  const resultado = await mammoth.convertToHtml(
    { buffer },
    {
      ignoreEmptyParagraphs: false,
      convertImage: mammoth.images.imgElement(async (image) => {
        const numero = imagenes.length + 1;
        const slot = { numero, mime: image.contentType, datos: null };
        imagenes.push(slot);
        try {
          slot.datos = await image.readAsBuffer();
        } catch (e) {
          slot.datos = null;
        }
        return { src: "IMGMARK" + numero };
      }),
    }
  );

  let texto = htmlATexto(resultado.value);

  // Imágenes en formatos que el navegador no muestra (EMF, WMF, etc.)
  const utiles = [];
  for (const img of imagenes) {
    const mime = (img.mime || "").toLowerCase();
    if (img.datos && MIMES_IMAGEN_OK.has(mime)) {
      utiles.push(img);
    } else {
      texto = texto.replace(
        "[[IMG:" + img.numero + "]]",
        "[Imagen omitida: formato no compatible (" + (img.mime || "desconocido") + ")]"
      );
    }
  }

  return { texto, imagenes: utiles };
}

async function procesarPdf(buffer) {
  const imagenes = [];
  let texto = "";

  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const rt = await parser.getText();
      texto = (rt.text || "").replace(/^-- \d+ of \d+ --$/gm, "");

      try {
        const ri = await parser.getImage({ imageThreshold: 40 });
        let n = 0;
        const marcas = [];
        for (const pagina of ri.pages || []) {
          for (const im of pagina.images || []) {
            if (!im.data) continue;
            n++;
            imagenes.push({
              numero: n,
              mime: "image/png",
              datos: Buffer.from(im.data),
            });
            marcas.push("[[IMG:" + n + "]]");
          }
        }
        if (marcas.length) {
          texto += "\n\nImágenes del PDF\n" + marcas.join("\n\n");
        }
      } catch (e) {
        // Ignorar si el PDF no contiene imágenes extraíbles
      }
    } finally {
      await parser.destroy().catch(() => {});
    }
  } catch (errPdf) {
    console.error("Aviso: extracción de texto de PDF falló, se conservará el documento original:", errPdf.message);
  }

  if (!texto || !texto.trim()) {
    texto = "[Documento PDF con formato original adjunto]\n\nEste archivo se visualiza con su diseño, gráficos, páginas y formato original en el visor integrado de la nota.";
  }

  return { texto, imagenes };
}
// Devuelve { texto (ya limpio), imagenes: [{numero, mime, datos}] }
async function procesarArchivo(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  let resultado;
  if (ext === ".txt" || ext === ".sql") {
    resultado = { texto: decodificarTexto(file.buffer), imagenes: [] };
  } else if (ext === ".docx") {
    resultado = await procesarDocx(file.buffer);
  } else if (ext === ".pdf") {
    resultado = await procesarPdf(file.buffer);
  } else {
    throw new Error("Tipo de archivo no soportado.");
  }

  resultado.texto = limpiarTexto(resultado.texto);
  return resultado;
}

module.exports = { procesarArchivo, limpiarTexto, decodificarTexto };
