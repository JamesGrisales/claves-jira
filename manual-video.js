// ---------------------------------------------------------------------------
// Manual desde video (automático)
//
// Subes un video de pantalla (sin audio) y el sistema:
//   1. detecta los cambios de pantalla y saca capturas de cada paso,
//   2. le muestra a la IA (Gemini) las capturas en orden (el cursor acercándose, justo antes
//      del cambio y después) para que siga el cursor y redacte qué se está haciendo,
//   3. arma el PDF sobre el membrete de Jaivaná (informe-fondo.jpeg).
//
// Requisitos:  npm i pdf-lib ffmpeg-static
// IA: usa la misma configuración del asistente en el .env (OPENAI_API_KEY, OPENAI_BASE_URL, AI_MODEL).
// Se conecta en server.js con:  require("./manual-video")(app, { requireLogin });
// ---------------------------------------------------------------------------

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const MAX_VIDEO_MB = Number(process.env.MANUAL_MAX_MB) || 500;
const MAX_PASOS = Number(process.env.MANUAL_MAX_PASOS) || 120;
const EXT_VIDEO = [".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".wmv"];
const CARPETA_TRABAJOS = path.join(os.tmpdir(), "boveda-manual");
const HORAS_VIDA = 12;
// La IA usa la misma configuración del asistente (.env):
//   OPENAI_API_KEY + OPENAI_BASE_URL + AI_MODEL  (sirve para Gemini, ChatGPT u Ollama con visión)
//   o bien GEMINI_API_KEY (API nativa de Gemini). MANUAL_MODELO permite usar otro modelo solo aquí.
const modoIA = () => (process.env.OPENAI_API_KEY ? "compatible" : process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? "gemini" : "");
const iaActiva = () => !!modoIA();
const modeloIA = () =>
  process.env.MANUAL_MODELO || process.env.AI_MODEL || (modoIA() === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini");
const urlCompatible = () => (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const urlGemini = () => (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
const PARALELO = Math.min(4, Math.max(1, Number(process.env.MANUAL_PARALELO) || 2)); // llamadas a la IA a la vez

// ---------- ffmpeg ----------
function rutaFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const p = require("ffmpeg-static");
    if (p) return p;
  } catch (e) {}
  return "ffmpeg";
}

function correrFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(rutaFfmpeg(), args, { windowsHide: true });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
      if (err.length > 5e6) err = err.slice(-2e6);
    });
    p.on("error", (e) => {
      const x = new Error(
        e.code === "ENOENT"
          ? "No se encontró ffmpeg. Instálalo (https://ffmpeg.org) o ejecuta: npm i ffmpeg-static"
          : e.message
      );
      x.salida = "";
      reject(x);
    });
    p.on("close", (code) => {
      if (code === 0) return resolve(err);
      const x = new Error("ffmpeg falló: " + err.slice(-400));
      x.salida = err;
      reject(x);
    });
  });
}

// Duración y si trae audio (ffmpeg -i sin salida "falla", pero imprime los datos)
async function infoVideo(archivo) {
  const salida = await correrFfmpeg(["-hide_banner", "-i", archivo]).catch((e) => e.salida || "");
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(salida);
  return {
    duracion: m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0,
    audio: /Stream #[^\n]*Audio:/.test(salida),
  };
}

// Momentos (en segundos) donde la imagen cambia de forma notable
async function detectarCambios(archivo, umbral, separacion) {
  const filtro =
    `scale=480:-2,select='gt(scene,${umbral})*(isnan(prev_selected_t)+gte(t-prev_selected_t,${separacion}))',showinfo`;
  const salida = await correrFfmpeg(["-hide_banner", "-i", archivo, "-an", "-vf", filtro, "-f", "null", "-"]);
  const tiempos = [];
  const re = /pts_time:([0-9.]+)/g;
  let m;
  while ((m = re.exec(salida))) tiempos.push(Number(m[1]));
  return tiempos;
}

function repartidos(duracion, cuantos) {
  const out = [];
  for (let i = 0; i < cuantos; i++) out.push((duracion * i) / cuantos);
  return out;
}

function adelgazar(tiempos, max) {
  if (tiempos.length <= max) return tiempos;
  const out = [];
  for (let i = 0; i < max; i++) out.push(tiempos[Math.floor((i * tiempos.length) / max)]);
  return out;
}

// Decide los momentos de cada paso según la sensibilidad (1 = pocos pasos, 5 = muchos)
async function elegirMomentos(archivo, duracion, sensibilidad, maxPasos) {
  const umbrales = { 1: 0.16, 2: 0.09, 3: 0.045, 4: 0.02, 5: 0.009 };
  const separaciones = { 1: 1.8, 2: 1.2, 3: 0.8, 4: 0.5, 5: 0.35 };
  let umbral = umbrales[sensibilidad] || umbrales[5];
  const separacion = separaciones[sensibilidad] || 0.35;
  let tiempos = [];

  for (let intento = 0; intento < 5; intento++) {
    tiempos = await detectarCambios(archivo, umbral, separacion);
    if (tiempos.length > maxPasos) umbral *= 1.35;
    else if (tiempos.length < 3 && umbral > 0.003) umbral /= 1.7;
    else break;
  }

  tiempos = [0].concat(tiempos.filter((t) => t > 0.35));

  if (tiempos.length < 3 && duracion > 4) tiempos = repartidos(duracion, Math.min(maxPasos, Math.max(3, Math.round(duracion / 4))));

  return adelgazar(tiempos, maxPasos);
}

async function sacarCaptura(archivo, segundo, destino) {
  await correrFfmpeg([
    "-hide_banner", "-y",
    "-ss", Math.max(0, segundo).toFixed(2),
    "-i", archivo,
    "-frames:v", "1",
    "-vf", "scale='min(1920,iw)':-2",
    "-q:v", "2",
    destino,
  ]);
  return fs.existsSync(destino) && fs.statSync(destino).size > 0;
}

// ---------- llamadas a las APIs ----------
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function conReintentos(hacer) {
  let ultimo;
  for (let intento = 0; intento < 5; intento++) {
    try {
      const r = await hacer();
      if (r.ok) return r;
      const cuerpo = (await r.text().catch(() => "")).slice(0, 300);
      ultimo = new Error(`HTTP ${r.status}: ${cuerpo}`);
      if (![408, 429, 500, 502, 503, 504, 529].includes(r.status)) throw Object.assign(ultimo, { fatal: true });
    } catch (e) {
      if (e.fatal) throw e;
      ultimo = e;
    }
    await espera(2000 * Math.pow(2, intento));
  }
  throw ultimo;
}

function imagenParaIA(ruta) {
  return {
    type: "image",
    source: { type: "base64", media_type: "image/jpeg", data: fs.readFileSync(ruta).toString("base64") },
  };
}

async function preguntarIA({ sistema, contenido, maxTokens }) {
  const limite = Math.max(4096, maxTokens || 0); // los modelos con "razonamiento" gastan parte pensando

  if (modoIA() === "compatible") {
    // API estilo OpenAI (Gemini la ofrece en /v1beta/openai)
    const partes = contenido.map((c) =>
      c.type === "image"
        ? { type: "image_url", image_url: { url: `data:${c.source.media_type};base64,${c.source.data}` } }
        : { type: "text", text: c.text }
    );
    const r = await conReintentos(() =>
      fetch(urlCompatible() + "/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          model: modeloIA(),
          max_tokens: limite,
          messages: [
            { role: "system", content: sistema },
            { role: "user", content: partes },
          ],
        }),
      })
    );
    const j = await r.json();
    const ch = (j.choices || [])[0];
    const raw = ch && ch.message && ch.message.content;
    const texto = (Array.isArray(raw) ? raw.map((x) => x.text || "").join("") : String(raw || "")).trim();
    if (!texto) throw new Error("La IA no devolvió texto (" + ((ch && ch.finish_reason) || "respuesta vacía") + ").");
    return texto;
  }

  // API nativa de Gemini (la clave viaja en un encabezado, no en la URL)
  const partes = contenido.map((c) =>
    c.type === "image" ? { inlineData: { mimeType: c.source.media_type, data: c.source.data } } : { text: c.text }
  );
  const r = await conReintentos(() =>
    fetch(`${urlGemini()}/v1beta/models/${encodeURIComponent(modeloIA())}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: partes }],
        generationConfig: { maxOutputTokens: limite },
      }),
    })
  );
  const j = await r.json();
  const cand = (j.candidates || [])[0];
  const texto = ((cand && cand.content && cand.content.parts) || []).map((x) => x.text || "").join("").trim();
  if (!texto) {
    const motivo = (j.promptFeedback && j.promptFeedback.blockReason) || (cand && cand.finishReason) || "respuesta vacía";
    throw new Error("Gemini no devolvió texto (" + motivo + ").");
  }
  return texto;
}

function sistemaPaso(estilo) {
  const forma =
    estilo === "instruccion"
      ? "en modo imperativo directo de instrucción técnica detallada (ej: «1. Haz clic en la pestaña 'Ventas'. 2. En el campo 'Cliente', ingresa 'Juan Pérez'. 3. Pulsa el botón 'Guardar'.»)"
      : "narrado en primera persona del plural con tono técnico profesional y descriptivo (ej: «Nos dirigimos a la pestaña 'Ventas', seleccionamos el campo 'Cliente' e ingresamos 'Juan Pérez', y pulsamos el botón 'Guardar'.»)";

  return (
    "Eres un redactor experto de manuales de usuario y documentación técnica de software con un nivel de minuciosidad, precisión y detalle quirúrgico.\n" +
    "Se te entregan capturas de pantalla secuenciales de un procedimiento en video:\n" +
    "  - Captura(s) previas: Muestran el movimiento y posición exacta del cursor sobre los elementos de la interfaz.\n" +
    "  - Captura DESPUÉS del cambio: Muestra el estado exacto de la interfaz resultante tras la acción.\n\n" +
    "INSTRUCCIONES OBLIGATORIAS DE MÁXIMA PRECISIÓN Y MINUCIOSIDAD:\n" +
    "1. MINUCIOSIDAD EXHAUSTIVA: No omitas ningún paso. Narra detalladamente la acción realizada y su efecto visual en pantalla. Explica el camino que sigue el usuario de forma que cualquier persona pueda replicarlo paso a paso sin perderse.\n" +
    "2. EXTRACCIÓN LITERAL DE DATOS: Lee con extrema atención todo el texto visible. Si el usuario escribe datos, busca términos o selecciona valores de listas o casillas, EXTRAE Y CITA ENTRE COMILLAS el texto o número exacto (ej: «En el campo 'Referencia', digitamos 'FAC-2024-001'» o «Seleccionamos la opción 'Aprobado'»).\n" +
    "3. NOMBRES EXACTOS DE LA INTERFAZ: Utiliza los nombres literales y precisos de todos los elementos (botones, pestañas, menús desplegables, encabezados de columnas, iconos, casillas de verificación, ventanas modales) tal como aparecen escritos en la imagen.\n" +
    "4. SECUENCIA Y RESULTADO: Describe la causa y la consecuencia inmediata (ej: «Hacemos clic en el icono de lupa 'Buscar' y el sistema carga la tabla de resultados con los registros filtrados»).\n" +
    "5. ESTILO: Redacta " + forma + ".\n" +
    "6. REGLA ESTRICTA DE DESCARTE: ÚNICAMENTE responde 'OMITIR' si la captura final es completamente negra/vacía o si no existe absolutamente ningún cambio visible ni acción del usuario. En cualquier otro caso, redacta minuciosamente la acción."
  );
}

async function describirPaso({ previas, despues, numero, total, estilo }) {
  const contenido = [{ type: "text", text: `Paso ${numero} de ${total}. Analiza las capturas para documentar minuciosamente la acción:` }];
  (previas || []).forEach((p) => {
    contenido.push({ type: "text", text: `Captura ${p.etiqueta}:` });
    contenido.push(imagenParaIA(p.ruta));
  });
  contenido.push({ type: "text", text: "Captura DESPUÉS del cambio (estado resultante de la interfaz tras la acción):" });
  contenido.push(imagenParaIA(despues));
  contenido.push({ type: "text", text: "Escribe la descripción minuciosa y precisa del paso, citando entre comillas cualquier dato o texto escrito o seleccionado." });
  const t = await preguntarIA({ sistema: sistemaPaso(estilo), contenido, maxTokens: 1000 });
  return t.replace(/^["«“\s]+|["»”\s]+$/g, "").replace(/^paso\s*\d+\s*[:.\-–]\s*/i, "").trim();
}

async function redactarTitulo({ pasos, nombreVideo }) {
  const lista = pasos.map((p, i) => `${i + 1}. [${p.tiempo}] ${p.texto || "(sin descripción)"}`).join("\n");
  const t = await preguntarIA({
    sistema:
      "Eres un redactor técnico de manuales de usuario de software. Con los pasos detallados de un procedimiento extraídos de un video, genera un título profesional y un objetivo claro.\n" +
      'Responde ÚNICAMENTE un JSON válido con esta estructura: {"titulo":"…","objetivo":"…"}.\n' +
      "El título debe ser descriptivo, profesional y conciso (máximo 12 palabras).\n" +
      "El objetivo es un párrafo de 1 a 3 oraciones (máximo 60 palabras) que describe claramente qué se logra con este procedimiento, a qué módulo pertenece y su utilidad práctica.\n" +
      "Responde en español.",
    contenido: [
      {
        type: "text",
        text: `Nombre del archivo de video: ${nombreVideo}\n\n<pasos_del_procedimiento>\n${lista}\n</pasos_del_procedimiento>`,
      },
    ],
    maxTokens: 500,
  });
  const m = /\{[\s\S]*\}/.exec(t);
  if (!m) throw new Error("La IA no devolvió el título en el formato esperado.");
  const j = JSON.parse(m[0]);
  return { titulo: String(j.titulo || "").trim(), objetivo: String(j.objetivo || "").trim() };
}

async function enParalelo(items, limite, fn) {
  let siguiente = 0;
  const trabajadores = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (siguiente < items.length) {
      const i = siguiente++;
      await fn(items[i], i);
    }
  });
  await Promise.all(trabajadores);
}

// ---------- proceso completo ----------
function formatoTiempo(s) {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60);
  return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

async function procesarVideoAuto({ archivo, dir, nombreVideo, sensibilidad, maxPasos, estilo, progreso }) {
  const avisos = [];
  const avanza = (fase, hecho, total) => progreso && progreso({ fase, hecho: hecho || 0, total: total || 0 });

  avanza("Leyendo el video");
  const { duracion } = await infoVideo(archivo);

  avanza("Buscando los cambios de pantalla");
  const momentos = await elegirMomentos(archivo, duracion, sensibilidad, maxPasos);

  fs.mkdirSync(dir, { recursive: true });
  const pasos = [];
  for (let i = 0; i < momentos.length; i++) {
    avanza("Sacando las capturas", i, momentos.length);
    const t = momentos[i];
    // Captura resultante inmediatamente tras el cambio (0.22s de asentamiento visual para precisión exacta)
    const seg = Math.min(t + 0.22, Math.max(0, duracion - 0.05));
    const n = pasos.length + 1;
    const archivoPaso = "p" + String(n).padStart(3, "0") + ".jpg";
    const ok = await sacarCaptura(archivo, seg, path.join(dir, archivoPaso)).catch(() => false);
    if (!ok) continue;

    // Capturas previas para seguir el cursor: cuando se acerca y justo antes del cambio
    const previas = [];
    const instantes = [
      { dt: 0.75, pref: "b", etiqueta: "unos instantes ANTES (el cursor se desplaza hacia el elemento)" },
      { dt: 0.18, pref: "c", etiqueta: "inmediatamente ANTES (el cursor está exactamente sobre el botón, campo o menú)" },
    ];
    for (const ins of instantes) {
      if (t - ins.dt < 0.3) continue;
      const ruta = path.join(dir, ins.pref + String(n).padStart(3, "0") + ".jpg");
      if (await sacarCaptura(archivo, t - ins.dt, ruta).catch(() => false)) previas.push({ ruta, etiqueta: ins.etiqueta });
    }
    pasos.push({ archivo: archivoPaso, inicio: t, tiempo: formatoTiempo(seg), previas, texto: "" });
  }
  if (!pasos.length) throw new Error("No se pudieron sacar imágenes del video.");

  // Descripción de cada paso con IA
  if (iaActiva()) {
    let hechos = 0;
    let fallidos = 0;
    avanza("Describiendo los pasos con IA", 0, pasos.length);
    await enParalelo(pasos, PARALELO, async (p, i) => {
      try {
        p.texto = await describirPaso({
          previas: p.previas,
          despues: path.join(dir, p.archivo),
          numero: i + 1,
          total: pasos.length,
          estilo,
        });
      } catch (e) {
        fallidos++;
        console.error("Error describiendo el paso " + (i + 1) + ":", e.message);
        p.texto = "";
      }
      avanza("Describiendo los pasos con IA", ++hechos, pasos.length);
    });
    if (fallidos) avisos.push(`La IA no pudo describir ${fallidos} paso(s); revísalos y escríbelos a mano.`);
  } else {
    avisos.push("No hay clave de IA en el .env (la misma del asistente): el PDF sale con las capturas pero sin la descripción de los pasos.");
  }

  // Pasos sin acción relevante o vacíos
  let finales = pasos.filter((p) => {
    const txt = p.texto.trim();
    return txt && txt.length > 4 && !/^OMITIR\.?$/i.test(txt);
  });
  if (!finales.length && pasos.length > 0) finales = [pasos[pasos.length - 1]];
  for (const p of pasos) if (!finales.includes(p)) fs.rmSync(path.join(dir, p.archivo), { force: true });

  // Título y objetivo
  const nombreLimpio = nombreVideo.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  let titulo = nombreLimpio || "Manual";
  let objetivo = "";
  if (iaActiva() && finales.some((p) => p.texto)) {
    avanza("Redactando el título y el objetivo");
    try {
      const r = await redactarTitulo({ pasos: finales, nombreVideo: nombreLimpio });
      if (r.titulo) titulo = r.titulo;
      objetivo = r.objetivo;
    } catch (e) {
      console.error("Error redactando el título:", e.message);
    }
  }

  // Las capturas previas solo sirven para que la IA siga el cursor
  for (const f of fs.readdirSync(dir)) if (/^[bc]\d{3}\.jpg$/.test(f)) fs.rmSync(path.join(dir, f), { force: true });

  return {
    titulo,
    objetivo,
    duracion: formatoTiempo(duracion),
    avisos,
    pasos: finales.map((p) => ({ archivo: p.archivo, tiempo: p.tiempo, texto: p.texto })),
  };
}

// ---------- trabajos temporales ----------
const ID_VALIDO = /^[a-f0-9]{16}$/;
const ARCHIVO_VALIDO = /^p\d{3}\.jpg$/;
const trabajos = new Map(); // id -> { usuario, fase, hecho, total, error, resultado }

function carpetaDe(id) {
  return path.join(CARPETA_TRABAJOS, id);
}

function limpiarViejos() {
  try {
    if (!fs.existsSync(CARPETA_TRABAJOS)) return;
    const limite = Date.now() - HORAS_VIDA * 3600 * 1000;
    for (const d of fs.readdirSync(CARPETA_TRABAJOS)) {
      const p = path.join(CARPETA_TRABAJOS, d);
      try {
        if (fs.statSync(p).mtimeMs < limite) {
          fs.rmSync(p, { recursive: true, force: true });
          trabajos.delete(d);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

function leerMeta(id) {
  try {
    return JSON.parse(fs.readFileSync(path.join(carpetaDe(id), "meta.json"), "utf8"));
  } catch (e) {
    return null;
  }
}

// ---------- PDF ----------
function buscarFondo() {
  const candidatos = [
    process.env.MANUAL_FONDO,
    path.join(__dirname, "informe-fondo.jpeg"),
    path.join(__dirname, "informe-fondo.jpg"),
    path.join(__dirname, "assets", "informe-fondo.jpeg"),
    path.join(__dirname, "public", "informe-fondo.jpeg"),
    path.join(__dirname, "public", "img", "informe-fondo.jpeg"),
  ].filter(Boolean);
  return candidatos.find((p) => fs.existsSync(p)) || null;
}

function ajustarTexto(texto, fuente, tam, ancho) {
  const lineas = [];
  for (const parrafo of String(texto || "").replace(/\r/g, "").split("\n")) {
    let actual = "";
    for (const palabra of parrafo.split(/\s+/).filter(Boolean)) {
      const prueba = actual ? actual + " " + palabra : palabra;
      if (fuente.widthOfTextAtSize(prueba, tam) <= ancho) actual = prueba;
      else {
        if (actual) lineas.push(actual);
        actual = palabra;
      }
    }
    lineas.push(actual);
  }
  while (lineas.length && lineas[lineas.length - 1] === "") lineas.pop();
  return lineas;
}

// Las fuentes estándar del PDF solo entienden Latin-1 (tildes, ñ y « » sí; emojis no)
function limpiar(texto) {
  return String(texto || "").replace(/[^\u0009\u000A -ÿ–—‘’“”•…]/g, "");
}

async function generarPdf({ titulo, objetivo, autor, pasos, grande }) {
  const W = 612, H = 792; // carta, igual que el membrete (1224 x 1584 px a 144 ppp)
  const MARGEN_X = 56;
  const TOPE = 118;       // debajo de la cabecera azul del membrete
  const BASE = 78;        // encima de la barra inferior del membrete
  const ANCHO = W - MARGEN_X * 2;

  const pdf = await PDFDocument.create();
  const tipo = await pdf.embedFont(StandardFonts.Helvetica);
  const tipoNeg = await pdf.embedFont(StandardFonts.HelveticaBold);

  const rutaFondo = buscarFondo();
  const fondo = rutaFondo ? await pdf.embedJpg(fs.readFileSync(rutaFondo)) : null;

  const azul = rgb(0.043, 0.239, 0.451);
  const azulClaro = rgb(0, 0.6, 1);
  const gris = rgb(0.36, 0.42, 0.52);
  const tinta = rgb(0.1, 0.13, 0.2);

  let pagina;
  let y;
  function nuevaPagina() {
    pagina = pdf.addPage([W, H]);
    if (fondo) pagina.drawImage(fondo, { x: 0, y: 0, width: W, height: H });
    y = H - TOPE;
  }
  nuevaPagina();

  const tituloLimpio = limpiar(titulo) || "Manual";
  for (const l of ajustarTexto(tituloLimpio, tipoNeg, 24, ANCHO)) {
    pagina.drawText(l, { x: MARGEN_X, y: y - 24, size: 24, font: tipoNeg, color: azul });
    y -= 30;
  }
  y -= 12;
  pagina.drawRectangle({ x: MARGEN_X, y: y, width: 70, height: 3, color: azulClaro });
  y -= 18;
  const fecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  pagina.drawText(limpiar(`${fecha}${autor ? "  ·  " + autor : ""}`), { x: MARGEN_X, y: y, size: 10, font: tipo, color: gris });
  y -= 24;

  const lineasObjetivo = ajustarTexto(limpiar(objetivo), tipo, 11, ANCHO).slice(0, 6);
  if (lineasObjetivo.length) {
    pagina.drawText("Objetivo", { x: MARGEN_X, y: y - 11, size: 11, font: tipoNeg, color: azul });
    y -= 18;
    lineasObjetivo.forEach((l, k) => pagina.drawText(l, { x: MARGEN_X, y: y - 11 - k * 15, size: 11, font: tipo, color: tinta }));
    y -= lineasObjetivo.length * 15 + 8;
  }
  y -= 10;

  const maxW = grande ? 500 : 400;
  const maxH = grande ? 290 : 215;

  for (let i = 0; i < pasos.length; i++) {
    const p = pasos[i];
    const lineas = ajustarTexto(limpiar(p.texto), tipo, 11, ANCHO - 34);
    const altoTexto = lineas.length * 15;

    const img = await pdf.embedJpg(fs.readFileSync(p.ruta));
    let maxH_actual = maxH;
    const altoDisponible = H - TOPE - BASE - 30 - altoTexto - 8 - 26;
    if (altoDisponible < maxH_actual && altoDisponible > 110) {
      maxH_actual = altoDisponible;
    }
    const escala = Math.min(maxW / img.width, maxH_actual / img.height);
    const iw = img.width * escala;
    const ih = img.height * escala;

    const total = 30 + altoTexto + 8 + ih + 26;
    if (y - total < BASE && y < H - TOPE - 1) nuevaPagina();

    pagina.drawCircle({ x: MARGEN_X + 12, y: y - 12, size: 12, color: azulClaro });
    const num = String(i + 1);
    const nw = tipoNeg.widthOfTextAtSize(num, 11);
    pagina.drawText(num, { x: MARGEN_X + 12 - nw / 2, y: y - 16, size: 11, font: tipoNeg, color: rgb(1, 1, 1) });
    pagina.drawText(`Paso ${i + 1}`, { x: MARGEN_X + 32, y: y - 16, size: 13, font: tipoNeg, color: azul });
    y -= 30;

    lineas.forEach((l, k) => {
      pagina.drawText(l, { x: MARGEN_X + 32, y: y - 11 - k * 15, size: 11, font: tipo, color: tinta });
    });
    y -= altoTexto + 8;

    const x = MARGEN_X + (ANCHO - iw) / 2;
    pagina.drawRectangle({ x: x - 1.5, y: y - ih - 1.5, width: iw + 3, height: ih + 3, color: rgb(1, 1, 1), borderColor: rgb(0.62, 0.78, 0.93), borderWidth: 1 });
    pagina.drawImage(img, { x, y: y - ih, width: iw, height: ih });
    y -= ih + 26;
  }

  const paginas = pdf.getPages();
  paginas.forEach((pg, k) => {
    const t = `Página ${k + 1} de ${paginas.length}`;
    pg.drawText(t, { x: W - MARGEN_X - tipo.widthOfTextAtSize(t, 9), y: 22, size: 9, font: tipo, color: rgb(1, 1, 1) });
  });

  pdf.setTitle(tituloLimpio);
  pdf.setCreator("Bóveda Jira");
  return Buffer.from(await pdf.save());
}

// ---------- Transcripción OCR de imagen con IA ----------
async function transcribirImagenConIA({ buffer, mimeType, modo }) {
  const base64Data = buffer.toString("base64");
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("No hay una clave de IA configurada en el archivo .env.");
  }

  let prompt = "Eres un transcriptor óptico (OCR) de altísima precisión para manuales, capturas y documentos. " +
    "Transcribe de manera completa, exacta y fiel TODO el texto, números, datos, títulos, tablas, códigos y detalles visibles en la imagen proporcionada. " +
    "Conserva fielmente la estructura original (saltos de línea, párrafos, listas, columnas o sangrías). " +
    "No inventes contenido, no resumas y no añadas saludos, introducciones ni notas personales como 'Aquí tienes la transcripción:'. Devuelve ÚNICAMENTE el texto extraído tal como se lee.";

  if (modo === "markdown") {
    prompt += " Formatea el texto en Markdown estructurado (utiliza encabezados # ##, viñetas -, tablas si hay datos tabulares, o bloques de código ``` si es código fuente).";
  } else if (modo === "limpio") {
    prompt += " Corrige posibles errores tipográficos evidentes de captura y entrega el texto limpio y ordenado en párrafos legibles.";
  }

  // 1. Intentar con modelos Gemini rápidos y estables
  const modelos = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3-flash-preview"];
  let ultimoError = null;

  for (const modelo of modelos) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt }] },
          contents: [{
            parts: [
              { inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data } },
              { text: "Transcribe exactamente todo el texto visible en esta imagen." }
            ]
          }],
          generationConfig: { maxOutputTokens: 8192 }
        })
      });

      const data = await resp.json();
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts || [];
        const texto = parts.map(p => p.text || "").join("").trim();
        if (texto) return texto;
      }

      if (data && data.error) {
        ultimoError = new Error(data.error.message || `Error con modelo ${modelo}`);
      }
    } catch (e) {
      ultimoError = e;
    }
  }

  // 2. Fallback a preguntarIA si las llamadas directas fallan
  try {
    const fallbackTexto = await preguntarIA({
      sistema: prompt,
      contenido: [
        { type: "image", source: { media_type: mimeType || "image/jpeg", data: base64Data } },
        { type: "text", text: "Transcribe todo el texto contenido en esta imagen." }
      ],
      maxTokens: 8192
    });
    if (fallbackTexto) return fallbackTexto;
  } catch (e) {
    ultimoError = e;
  }

  throw ultimoError || new Error("No se pudo extraer texto de la imagen.");
}

// ---------- rutas ----------
module.exports = function (app, { requireLogin }) {
  const express = require("express");
  const multer = require("multer");

  limpiarViejos();
  setInterval(limpiarViejos, 3600 * 1000).unref();
  fs.mkdirSync(CARPETA_TRABAJOS, { recursive: true });

  const subirVideo = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, os.tmpdir()),
      filename: (req, file, cb) => cb(null, "boveda-video-" + Date.now() + "-" + crypto.randomBytes(6).toString("hex")),
    }),
    limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => cb(null, EXT_VIDEO.includes(path.extname(file.originalname).toLowerCase())),
  });

  const subirImagen = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 35 * 1024 * 1024 }, // 35 MB
  });

  const apiRequireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ ok: false, error: "Tu sesión ha expirado o debes iniciar sesión primero." });
    }
    next();
  };

  app.get("/manual", requireLogin, (req, res) => {
    res.render("manual", {
      title: "Manuales y Transcripción",
      maxMb: MAX_VIDEO_MB,
      maxPasos: MAX_PASOS,
      fondoOk: !!buscarFondo(),
      iaOk: iaActiva(),
    });
  });

  // Transcribir imagen a texto (OCR con IA)
  app.post("/manual/transcribir-imagen", apiRequireLogin, (req, res) => {
    subirImagen.single("imagen")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ ok: false, error: err.message || "Error al recibir la imagen." });
      }

      let buffer = null;
      let mimeType = "image/jpeg";

      if (req.file && req.file.buffer) {
        buffer = req.file.buffer;
        mimeType = req.file.mimetype || "image/jpeg";
      } else if (req.body && req.body.base64) {
        const raw = String(req.body.base64);
        const match = /^data:(image\/[a-zA-Z0-9\.\+\-]+);base64,(.+)$/.exec(raw);
        if (match) {
          mimeType = match[1];
          buffer = Buffer.from(match[2], "base64");
        } else {
          buffer = Buffer.from(raw, "base64");
        }
      }

      if (!buffer || !buffer.length) {
        return res.status(400).json({ ok: false, error: "No se proporcionó ninguna imagen para transcribir." });
      }

      if (!iaActiva()) {
        return res.status(400).json({
          ok: false,
          error: "La IA no está configurada en el archivo .env (se requiere OPENAI_API_KEY o GEMINI_API_KEY).",
        });
      }

      try {
        const modo = (req.body && req.body.modo) || "texto";
        const texto = await transcribirImagenConIA({ buffer, mimeType, modo });

        res.json({
          ok: true,
          texto,
          caracteres: texto.length,
          palabras: (texto.match(/\S+/g) || []).length
        });
      } catch (error) {
        console.error("Error transcribiendo imagen:", error);
        res.status(500).json({
          ok: false,
          error: error.message || "Error al procesar la imagen con la IA."
        });
      }
    });
  });

  // Recibe el video y lo procesa en segundo plano; la página consulta /estado
  app.post("/manual/procesar", requireLogin, (req, res) => {
    subirVideo.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.code === "LIMIT_FILE_SIZE" ? `El video pesa más de ${MAX_VIDEO_MB} MB.` : "No se pudo recibir el video.",
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Elige un video (" + EXT_VIDEO.join(", ") + ")." });
      }

      const archivo = req.file.path;
      const id = crypto.randomBytes(8).toString("hex");
      const dir = carpetaDe(id);
      const usuario = req.session.user.id;
      const sensibilidad = Math.min(5, Math.max(1, Number(req.body.sensibilidad) || 4));
      const estilo = req.body.estilo === "instruccion" ? "instruccion" : "narrado";
      const maxPasos = Math.min(MAX_PASOS, Math.max(3, Number(req.body.max) || 60));
      const nombreVideo = Buffer.from(req.file.originalname, "latin1").toString("utf8");

      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ usuario, titulo: "", pasos: [] }));

      const trabajo = { usuario, fase: "Empezando", hecho: 0, total: 0, error: null, resultado: null };
      trabajos.set(id, trabajo);

      procesarVideoAuto({
        archivo,
        dir,
        nombreVideo,
        sensibilidad,
        maxPasos,
        estilo,
        progreso: (p) => Object.assign(trabajo, p),
      })
        .then((resultado) => {
          fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ usuario, ...resultado }));
          trabajo.resultado = resultado;
        })
        .catch((error) => {
          console.error("Error procesando video del manual:", error.message);
          trabajo.error = error.message || "No se pudo procesar el video.";
          fs.rmSync(dir, { recursive: true, force: true });
        })
        .finally(() => fs.promises.unlink(archivo).catch(() => {}));

      res.json({ id });
    });
  });

  app.get("/manual/:id/estado", requireLogin, (req, res) => {
    const { id } = req.params;
    if (!ID_VALIDO.test(id)) return res.status(400).json({ error: "Solicitud inválida." });
    res.set("Cache-Control", "no-store");

    const t = trabajos.get(id);
    if (t) {
      if (t.usuario !== req.session.user.id) return res.status(404).json({ error: "No existe." });
      if (t.error) return res.json({ error: t.error });
      if (t.resultado) return res.json({ listo: true, id, ...t.resultado });
      return res.json({ fase: t.fase, hecho: t.hecho, total: t.total });
    }

    // Si el servidor se reinició, se recupera lo ya terminado
    const meta = leerMeta(id);
    if (meta && meta.usuario === req.session.user.id && meta.pasos && meta.pasos.length) {
      return res.json({ listo: true, id, titulo: meta.titulo, objetivo: meta.objetivo, avisos: meta.avisos || [], pasos: meta.pasos });
    }
    res.status(404).json({ error: "El proceso ya no existe. Sube el video otra vez." });
  });

  app.get("/manual/:id/captura/:archivo", requireLogin, (req, res) => {
    const { id, archivo } = req.params;
    if (!ID_VALIDO.test(id) || !ARCHIVO_VALIDO.test(archivo)) return res.status(400).send("Solicitud inválida.");
    const meta = leerMeta(id);
    if (!meta || meta.usuario !== req.session.user.id) return res.status(404).send("No existe.");
    const ruta = path.join(carpetaDe(id), archivo);
    if (!fs.existsSync(ruta)) return res.status(404).send("No existe.");
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=3600");
    fs.createReadStream(ruta).pipe(res);
  });

  app.post("/manual/pdf", requireLogin, express.json({ limit: "512kb" }), async (req, res) => {
    try {
      const { id, titulo, objetivo, pasos, grande } = req.body || {};
      if (!ID_VALIDO.test(String(id || ""))) return res.status(400).json({ error: "Manual inválido." });
      const meta = leerMeta(id);
      if (!meta || meta.usuario !== req.session.user.id) {
        return res.status(404).json({ error: "El manual expiró. Sube el video otra vez." });
      }
      if (!Array.isArray(pasos) || !pasos.length || pasos.length > MAX_PASOS) {
        return res.status(400).json({ error: "No hay pasos para el PDF." });
      }

      const lista = [];
      for (const p of pasos) {
        if (!ARCHIVO_VALIDO.test(String(p.archivo || ""))) continue;
        const ruta = path.join(carpetaDe(id), p.archivo);
        if (fs.existsSync(ruta)) lista.push({ ruta, texto: String(p.texto || "").slice(0, 1500) });
      }
      if (!lista.length) return res.status(400).json({ error: "No hay pasos para el PDF." });

      const buffer = await generarPdf({
        titulo: String(titulo || meta.titulo || "Manual").slice(0, 150),
        objetivo: String(objetivo || "").slice(0, 600),
        autor: req.session.user.username,
        pasos: lista,
        grande: grande !== false,
      });

      const nombre = (String(titulo || "manual").replace(/[^\w\- áéíóúñÁÉÍÓÚÑ]/g, "").trim().replace(/\s+/g, "_") || "manual") + ".pdf";
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `${req.query.descargar ? "attachment" : "inline"}; filename="${encodeURIComponent(nombre)}"`,
        "Cache-Control": "no-store",
      });
      res.send(buffer);
    } catch (error) {
      console.error("Error generando el PDF del manual:", error);
      res.status(500).json({ error: "No se pudo generar el PDF." });
    }
  });
};

module.exports.generarPdf = generarPdf;
module.exports.procesarVideoAuto = procesarVideoAuto;
