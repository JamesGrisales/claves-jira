require("dotenv").config();

const express = require("express");
const compression = require("compression");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const expressLayouts = require("express-ejs-layouts");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

const { pool, initDb } = require("./db");
const { encryptValue, decryptValue } = require("./crypto-vault");
const multer = require("multer");
const { procesarArchivo } = require("./procesar-archivo");
const { leerArchivoClaves, compararConBd, normalizar } = require("./importar-claves");
const { esExcel, leerLibro, hojasATexto } = require("./excel-hoja");
const biometria = require("./biometria-service");

// Excel (.xlsx, .xlsm, .xls, .csv) se guarda y se muestra como hoja de cálculo
const EXTENSIONES_PERMITIDAS = [".txt", ".sql", ".docx", ".pdf", ".xlsx", ".xlsm", ".xls", ".csv"];

// Tamaño máximo por archivo (en MB). Se puede cambiar en el archivo .env con
// MAX_UPLOAD_MB=200, por ejemplo.
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 100;

// Los archivos se guardan primero en la carpeta temporal del sistema (disco), no
// en memoria, para poder aceptar archivos grandes y varios a la vez.
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) =>
      cb(null, "boveda-" + Date.now() + "-" + crypto.randomBytes(6).toString("hex")),
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
      (req.rechazados = req.rechazados || []).push(
        nombreArchivoLimpio(file.originalname)
      );
      return cb(null, false);
    }

    cb(null, true);
  },
});

// Detecta si el contenido de una nota parece código SQL (para mostrarlo
// con numeración de líneas). Se considera SQL si: el archivo adjunto era
// .sql, el apartado/título lo menciona explícitamente, alguna línea
// empieza con una sentencia típica (SELECT, INSERT INTO, UPDATE, etc.),
// o aparecen al menos 2 señales sueltas (WHERE, JOIN, GROUP BY...).
const SQL_INICIO_DE_LINEA =
  /^\s*(select|insert\s+into|update|delete\s+from|create\s+(or\s+replace\s+)?(table|view|procedure|function|index|trigger)|alter\s+table|drop\s+(table|view|index)|truncate\s+table|merge\s+into|with)\b/im;

const SQL_SEÑALES_SUELTAS = [
  /\bwhere\b/i,
  /\bjoin\b/i,
  /\bgroup\s+by\b/i,
  /\border\s+by\b/i,
  /\bvalues\s*\(/i,
];

function pareceSql(nota) {
  const tipo = (nota.archivo_tipo || "").toLowerCase();
  if (tipo === "sql") return true;

  // Si fue marcado o subido explícitamente como archivo de texto (.txt sin palabras de sql)
  if (tipo === "txt" && !/\bsql\b/i.test(nota.titulo || "") && !/\bsql\b/i.test(nota.categoria || "")) {
    return false;
  }

  if (/\bsql\b/i.test(nota.categoria || "") || /\bsql\b/i.test(nota.titulo || "")) {
    return true;
  }

  // Las notas y apuntes manuales (sin archivo adjunto) se visualizan con resaltado de código/colores por defecto
  if (!nota.archivo_tipo && !nota.archivo_nombre) {
    return true;
  }

  const texto = nota.contenido || "";
  if (SQL_INICIO_DE_LINEA.test(texto)) return true;

  const señales = SQL_SEÑALES_SUELTAS.filter((p) => p.test(texto)).length;
  return señales >= 1;
}

const app = express();
const PORT = process.env.PORT || 5050;

// Siempre forzar acceso con localhost (requerido para WebAuthn y Sensor de Huella de Windows Hello)
app.use((req, res, next) => {
  if (req.hostname === "127.0.0.1" || req.hostname === "::1") {
    const host = req.headers.host || "";
    const portSuffix = host.includes(":") ? `:${host.split(":")[1]}` : (PORT === 80 ? "" : `:${PORT}`);
    return res.redirect(301, `http://localhost${portSuffix}${req.originalUrl}`);
  }
  next();
});

// Compresión Gzip/Deflate para acelerar transferencias HTML, CSS, JS y JSON
app.use(compression({ level: 6 }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Cache de plantillas compiladas en memoria (evita leer y compilar disco en cada petición)
app.set("view cache", false);

app.use(expressLayouts);
app.set("layout", "layout");

app.use(
  express.urlencoded({
    extended: true,
    limit: Math.max(MAX_UPLOAD_MB * 3, 100) + "mb",
    parameterLimit: 10000,
  })
);
app.use(express.json());

// Archivos estáticos con cache HTTP en el navegador
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "7d",
  etag: true,
}));

// Librería de Excel para el navegador (con cabeceras de cache inmutable)
app.get("/xlsx.min.js", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.sendFile(require.resolve("xlsx/dist/xlsx.full.min.js"));
});

app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "cambia-esto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// Cache en memoria para conteo de papelera (evita 2 subconsultas SQL pesadas en cada navegación o polling)
const papeleraCache = { count: 0, expiresAt: 0 };
function invalidarPapeleraCache() {
  papeleraCache.expiresAt = 0;
}

// Usuario y mensajes flash disponibles en todas las vistas
app.use(async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flashes = req.session.flashes || [];
  res.locals.currentPath = req.path;
  res.locals.papeleraCount = papeleraCache.count;

  req.session.flashes = [];

  // Cantidad de elementos en la papelera (para el menú de arriba)
  // Se ignora para llamadas a API, imágenes o descargas para no saturar la base de datos
  const p = req.path;
  if (
    req.session.user &&
    req.method === "GET" &&
    !p.startsWith("/api/") &&
    !p.includes("/api/") &&
    !p.includes("/imagen/") &&
    !p.endsWith("/archivo") &&
    !p.endsWith("/contenido") &&
    !p.endsWith("/buscar")
  ) {
    const ahora = Date.now();
    if (ahora >= papeleraCache.expiresAt) {
      try {
        const { rows } = await pool.query(
          `SELECT (SELECT COUNT(*) FROM notas WHERE eliminado_en IS NOT NULL)
                + (SELECT COUNT(*) FROM jaivana_notas WHERE eliminado_en IS NOT NULL) AS total`
        );
        papeleraCache.count = Number(rows[0].total) || 0;
        papeleraCache.expiresAt = ahora + 15000; // 15 segundos de cache
      } catch (error) {
        // si falla el conteo no debe romper la página
      }
    }
    res.locals.papeleraCount = papeleraCache.count;
  }

  next();
});

function flash(req, category, message) {
  if (!req.session.flashes) {
    req.session.flashes = [];
  }

  req.session.flashes.push({
    category,
    message,
  });
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

async function anyUserExists() {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS c FROM users"
  );

  return rows[0].c > 0;
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

app.get("/registro", async (req, res) => {
  const primero = !(await anyUserExists());

  res.render("register", {
    primero,
    title: primero ? "Crear primer usuario" : "Crear usuario",
  });
});

app.post("/registro", async (req, res) => {
  const primero = !(await anyUserExists());
  const estaLogueado = !!req.session.user;

  const username = (req.body.username || "").trim();
  const password = req.body.password || "";
  const confirm = req.body.confirm || "";

  if (!username || !password) {
    flash(
      req,
      "error",
      "Usuario y contraseña son obligatorios."
    );
  } else if (password !== confirm) {
    flash(
      req,
      "error",
      "Las contraseñas no coinciden."
    );
  } else if (password.length < 6) {
    flash(
      req,
      "error",
      "La contraseña debe tener al menos 6 caracteres."
    );
  } else {
    const existe = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existe.rows.length > 0) {
      flash(
        req,
        "error",
        "Ese usuario ya existe."
      );
    } else {
      const hash = await bcrypt.hash(password, 12);

      const result = await pool.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
        [username, hash]
      );

      const nuevoUsuario = result.rows[0];

      // Si ya estaba logueado con otra cuenta, notificar y regresar a la bóveda
      if (estaLogueado) {
        flash(
          req,
          "ok",
          `Usuario "${nuevoUsuario.username}" creado correctamente.`
        );
        return res.redirect("/");
      }

      // Si se registró desde el login o es el primer usuario, iniciar sesión automáticamente
      req.session.user = {
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
      };

      flash(
        req,
        "ok",
        `¡Bienvenido, ${nuevoUsuario.username}! Tu cuenta ha sido creada exitosamente.`
      );

      return res.redirect("/");
    }
  }

  return res.redirect("/registro");
});

app.get("/login", async (req, res) => {
  if (!(await anyUserExists())) {
    return res.redirect("/registro");
  }

  res.render("login", {
    title: "Iniciar sesión",
  });
});

app.post("/login", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";
  const isAjax = req.xhr || (req.headers["accept"] && req.headers["accept"].includes("application/json")) || req.body.ajax === "1" || req.headers["x-requested-with"] === "XMLHttpRequest";

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );

  const user = rows[0];

  if (
    user &&
    (await bcrypt.compare(
      password,
      user.password_hash
    ))
  ) {
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    flash(req, "ok", `¡Bienvenido de nuevo, ${user.username}!`);

    if (isAjax) {
      return res.json({ ok: true, redirect: "/" });
    }
    return res.redirect("/");
  }

  if (isAjax) {
    return res.json({ ok: false, error: "Usuario o contraseña incorrectos." });
  }

  flash(
    req,
    "error",
    "Usuario o contraseña incorrectos."
  );

  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// --- RUTAS DE AUTENTICACIÓN BIOMÉTRICA (WEBAUTHN / WINDOWS HELLO / HUELLA) ---
app.get("/api/biometria/registro-challenge", requireLogin, biometria.registroChallenge);
app.post("/api/biometria/registro-verificar", requireLogin, biometria.registroGuardar);
app.get("/api/biometria/login-challenge", biometria.loginChallenge);
app.post("/api/biometria/login-verificar", biometria.loginVerificar);
app.get("/api/biometria/estado", biometria.estadoBiometria);
app.delete("/api/biometria/:id?", requireLogin, biometria.eliminarHuella);

app.get("/cambiar-clave", requireLogin, (req, res) => {
  res.render("change_password", {
    title: "Mi contraseña y huella digital",
  });
});

app.post("/cambiar-clave", requireLogin, async (req, res) => {
  const {
    actual,
    nueva,
    confirmar,
  } = req.body;

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [req.session.user.id]
  );

  const user = rows[0];

  const actualOk = await bcrypt.compare(
    actual || "",
    user.password_hash
  );

  if (!actualOk) {
    flash(
      req,
      "error",
      "La contraseña actual no es correcta."
    );
  } else if ((nueva || "").length < 6) {
    flash(
      req,
      "error",
      "La nueva contraseña debe tener al menos 6 caracteres."
    );
  } else if (nueva !== confirmar) {
    flash(
      req,
      "error",
      "La confirmación no coincide con la nueva contraseña."
    );
  } else if (
    await bcrypt.compare(
      nueva,
      user.password_hash
    )
  ) {
    flash(
      req,
      "error",
      "La nueva contraseña debe ser distinta a la actual."
    );
  } else {
    const hash = await bcrypt.hash(nueva, 12);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hash, user.id]
    );

    flash(
      req,
      "ok",
      "Tu contraseña de acceso se actualizó correctamente."
    );

    return res.redirect("/");
  }

  res.redirect("/cambiar-clave");
});

// ---------------------------------------------------------------------------
// Bóveda de empresas
// ---------------------------------------------------------------------------

app.get("/", requireLogin, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, empresa FROM companies ORDER BY empresa COLLATE "C" ASC'
  );

  res.render("dashboard", {
    title: "Claves Jira por empresa",
    companies: rows,
  });
});

app.get("/empresa/:id/clave", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({
        error: "Empresa no encontrada.",
      });
    }

    const clave = decryptValue(
      rows[0].clave_cifrada
    );

    return res.json({
      clave,
    });
  } catch (error) {
    console.error(
      `Error descifrando clave de empresa ${req.params.id}:`,
      error.message
    );

    return res.status(500).json({
      error:
        "No se pudo descifrar la clave almacenada. " +
        "Es posible que el registro tenga un formato antiguo o esté dañado.",
    });
  }
});

app.get("/api/seguridad/auditoria", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, empresa, clave_cifrada, updated_at FROM companies ORDER BY empresa COLLATE "C" ASC'
    );
    const ahora = Date.now();
    const meses6 = 180 * 24 * 60 * 60 * 1000;

    function evaluarClave(pw) {
      if (!pw) return { debil: true, motivos: ["Clave vacía"], score: 0 };
      const len = pw.length;
      const motivos = [];
      let score = 0;
      if (len < 8) motivos.push("Menos de 8 caracteres");
      else if (len >= 14) score += 2;
      else score += 1;

      if (!/[A-Z]/.test(pw)) motivos.push("Sin mayúsculas");
      else score++;
      if (!/[0-9]/.test(pw)) motivos.push("Sin números");
      else score++;
      if (!/[^A-Za-z0-9]/.test(pw)) motivos.push("Sin símbolos especiales");
      else score++;

      if (/(.)\1{2,}/.test(pw)) motivos.push("Caracteres repetidos seguidos");
      if (/1234|abcd|qwerty|admin|password/i.test(pw)) motivos.push("Patrón predecible");

      return {
        debil: len < 8 || motivos.length >= 2,
        motivos,
        score: Math.min(5, score)
      };
    }

    const mapaClaves = new Map();
    const duplicadas = [];
    const debiles = [];
    const desactualizadas = [];

    for (const r of rows) {
      let clave = "";
      try {
        clave = decryptValue(r.clave_cifrada);
      } catch (e) {
        clave = "";
      }
      const evalClave = evaluarClave(clave);
      const fechaMod = r.updated_at ? new Date(r.updated_at).getTime() : 0;
      const dias = fechaMod > 0 ? Math.floor((ahora - fechaMod) / (24 * 60 * 60 * 1000)) : null;
      const esAntigua = fechaMod > 0 ? (ahora - fechaMod > meses6) : false;

      if (clave) {
        if (!mapaClaves.has(clave)) mapaClaves.set(clave, []);
        mapaClaves.get(clave).push({ id: r.id, empresa: r.empresa, fecha: r.updated_at, dias });
      }

      if (evalClave.debil) {
        debiles.push({ id: r.id, empresa: r.empresa, motivos: evalClave.motivos, fecha: r.updated_at, dias });
      }

      if (esAntigua) {
        desactualizadas.push({ id: r.id, empresa: r.empresa, dias, fecha: r.updated_at });
      }
    }

    for (const [clave, empList] of mapaClaves.entries()) {
      if (empList.length > 1) {
        duplicadas.push({
          empresas: empList,
          cantidad: empList.length
        });
      }
    }

    const total = rows.length;
    const fallas = duplicadas.reduce((a, b) => a + b.cantidad, 0) * 1.5 + debiles.length * 1.2 + desactualizadas.length * 0.5;
    const salud = total > 0 ? Math.max(10, Math.min(100, Math.round(100 - (fallas / total) * 100))) : 100;

    res.json({
      total,
      salud,
      duplicadas,
      debiles,
      desactualizadas
    });
  } catch (error) {
    console.error("Error en auditoría:", error);
    res.status(500).json({ error: "No se pudo realizar la auditoría de la bóveda." });
  }
});

app.post("/empresa/agregar", requireLogin, async (req, res) => {
  try {
    const empresa = (
      req.body.empresa || ""
    ).trim();

    const clave = (
      req.body.clave || ""
    ).trim();

    if (!empresa || !clave) {
      flash(
        req,
        "error",
        "Nombre de empresa y clave son obligatorios."
      );

      return res.redirect("/");
    }

    const claveCifrada = encryptValue(clave);

    await pool.query(
      "INSERT INTO companies (empresa, clave_cifrada) VALUES ($1, $2)",
      [
        empresa,
        claveCifrada,
      ]
    );

    flash(
      req,
      "ok",
      `Empresa «${empresa}» agregada.`
    );

    res.redirect("/");
  } catch (error) {
    console.error(
      "Error agregando empresa:",
      error.message
    );

    flash(
      req,
      "error",
      "No fue posible agregar la empresa."
    );

    res.redirect("/");
  }
});

// ---------------------------------------------------------------------------
// Importar claves desde un archivo (.txt, .csv, .xml, .xlsx, .xls)
// Paso 1: vista previa (no cambia nada). Paso 2: aplicar lo que el usuario marque.
// ---------------------------------------------------------------------------

const EXT_CLAVES = [".txt", ".csv", ".xml", ".xlsx", ".xls"];

const uploadClaves = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

app.post("/empresas/importar-claves/vista-previa", requireLogin, (req, res) => {
  uploadClaves.single("archivo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error:
          err.code === "LIMIT_FILE_SIZE"
            ? "El archivo pesa más de 5 MB."
            : "No se pudo recibir el archivo.",
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Selecciona un archivo." });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!EXT_CLAVES.includes(ext)) {
        return res.status(400).json({
          error: "Formato no permitido. Usa .txt, .csv, .xml, .xlsx o .xls.",
        });
      }

      const { pares, avisos } = leerArchivoClaves(req.file.buffer, ext);

      if (!pares.length) {
        return res.status(422).json({
          error:
            "No encontré pares «empresa / clave» en el archivo. " +
            "Cada empresa debe ir seguida de su clave (o en dos columnas).",
          avisos,
        });
      }

      const { rows } = await pool.query(
        "SELECT id, empresa, clave_cifrada FROM companies"
      );

      const bd = rows.map((r) => {
        let clave = null;
        try {
          clave = decryptValue(r.clave_cifrada);
        } catch (e) {
          // si no se puede descifrar se tratará como "cambia"
        }
        return { id: r.id, empresa: r.empresa, clave };
      });

      const cmp = compararConBd(pares, bd);

      res.json({
        archivo: req.file.originalname,
        items: cmp.items,
        libres: cmp.libres,
        avisos: avisos.concat(cmp.avisos),
      });
    } catch (error) {
      console.error("Error leyendo archivo de claves:", error.message);
      res.status(500).json({
        error: "No se pudo leer el archivo: " + error.message,
      });
    }
  });
});

app.post(
  "/empresas/importar-claves/aplicar",
  requireLogin,
  express.json({ limit: "1mb" }),
  async (req, res) => {
    const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];

    if (!items.length || items.length > 1000) {
      return res.status(400).json({ error: "No hay cambios para aplicar." });
    }

    const client = await pool.connect();
    let actualizadas = 0;
    let creadas = 0;
    const omitidas = [];

    try {
      await client.query("BEGIN");

      const { rows: existentes } = await client.query(
        "SELECT id, empresa FROM companies"
      );
      const idsValidos = new Set(existentes.map((e) => e.id));
      const nombresUsados = new Set(existentes.map((e) => normalizar(e.empresa)));
      const idsTocados = new Set();

      for (const it of items) {
        const empresa = String(it.empresa || "").trim();
        const clave = String(it.clave || "").trim();

        if (!clave || clave.length > 500 || !empresa) {
          omitidas.push(empresa || "(sin nombre)");
          continue;
        }

        const cifrada = encryptValue(clave);

        if (it.id) {
          const id = Number(it.id);

          if (!Number.isInteger(id) || !idsValidos.has(id) || idsTocados.has(id)) {
            omitidas.push(empresa);
            continue;
          }

          await client.query(
            "UPDATE companies SET clave_cifrada = $1, updated_at = NOW() WHERE id = $2",
            [cifrada, id]
          );
          idsTocados.add(id);
          actualizadas++;
        } else {
          if (nombresUsados.has(normalizar(empresa))) {
            omitidas.push(empresa);
            continue;
          }

          await client.query(
            "INSERT INTO companies (empresa, clave_cifrada) VALUES ($1, $2)",
            [empresa, cifrada]
          );
          nombresUsados.add(normalizar(empresa));
          creadas++;
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error importando claves:", error.message);
      return res.status(500).json({
        error: "No se pudo aplicar la importación. No se cambió nada.",
      });
    } finally {
      client.release();
    }

    let msg = `Importación lista: ${actualizadas} ${actualizadas === 1 ? "clave actualizada" : "claves actualizadas"}`;
    if (creadas) msg += `, ${creadas} ${creadas === 1 ? "empresa nueva" : "empresas nuevas"}`;
    msg += ".";
    if (omitidas.length) msg += ` Se omitieron ${omitidas.length}: ${omitidas.slice(0, 5).join(", ")}${omitidas.length > 5 ? "…" : ""}.`;

    flash(req, "ok", msg);
    res.json({ ok: true, actualizadas, creadas, omitidas });
  }
);

app.post("/empresa/:id/renombrar", requireLogin, async (req, res) => {
  try {
    const nuevoNombre = (req.body.empresa || "").trim();

    if (!nuevoNombre) {
      flash(req, "error", "El nombre de la empresa no puede quedar vacío.");
      return res.redirect("/");
    }

    const { rows: existe } = await pool.query(
      "SELECT id FROM companies WHERE LOWER(empresa) = LOWER($1) AND id <> $2",
      [nuevoNombre, req.params.id]
    );

    if (existe[0]) {
      flash(req, "error", `Ya existe otra empresa llamada «${nuevoNombre}».`);
      return res.redirect("/");
    }

    const { rows } = await pool.query(
      "UPDATE companies SET empresa = $1 WHERE id = $2 RETURNING id",
      [nuevoNombre, req.params.id]
    );

    if (!rows[0]) {
      flash(req, "error", "Esa empresa ya no existe.");
      return res.redirect("/");
    }

    flash(req, "ok", `Empresa renombrada a «${nuevoNombre}».`);

    res.redirect("/");
  } catch (error) {
    console.error("Error renombrando empresa:", error.message);

    flash(req, "error", "No fue posible renombrar la empresa.");

    res.redirect("/");
  }
});

app.post("/empresa/:id/actualizar", requireLogin, async (req, res) => {
  try {
    const {
      clave_anterior,
      clave_nueva,
    } = req.body;

    const { rows } = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [req.params.id]
    );

    const row = rows[0];

    if (!row) {
      flash(
        req,
        "error",
        "Esa empresa ya no existe."
      );

      return res.redirect("/");
    }

    let claveReal;

    try {
      claveReal = decryptValue(
        row.clave_cifrada
      );
    } catch (error) {
      console.error(
        `Error descifrando empresa ${row.id}:`,
        error.message
      );

      flash(
        req,
        "error",
        "La clave almacenada de esta empresa no se puede descifrar. Debe revisarse o volver a registrarse."
      );

      return res.redirect("/");
    }

    if (
      (clave_anterior || "") !== claveReal
    ) {
      flash(
        req,
        "error",
        "La clave anterior no coincide con la registrada. No se hizo ningún cambio."
      );

      return res.redirect("/");
    }

    if (
      !clave_nueva ||
      !clave_nueva.trim()
    ) {
      flash(
        req,
        "error",
        "Debes escribir la nueva clave."
      );

      return res.redirect("/");
    }

    const nuevaClaveCifrada =
      encryptValue(
        clave_nueva.trim()
      );

    await pool.query(
      "UPDATE companies SET clave_cifrada = $1, updated_at = NOW() WHERE id = $2",
      [
        nuevaClaveCifrada,
        row.id,
      ]
    );

    flash(
      req,
      "ok",
      `Clave de «${row.empresa}» actualizada.`
    );

    res.redirect("/");
  } catch (error) {
    console.error(
      "Error actualizando empresa:",
      error.message
    );

    flash(
      req,
      "error",
      "No fue posible actualizar la clave."
    );

    res.redirect("/");
  }
});

app.post("/empresa/:id/eliminar", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM companies WHERE id = $1",
      [req.params.id]
    );

    if (rows[0]) {
      flash(
        req,
        "ok",
        `Empresa «${rows[0].empresa}» eliminada.`
      );
    }

    res.redirect("/");
  } catch (error) {
    console.error(
      "Error eliminando empresa:",
      error.message
    );

    flash(
      req,
      "error",
      "No fue posible eliminar la empresa."
    );

    res.redirect("/");
  }
});

// ---------------------------------------------------------------------------
// Notas / apuntes técnicos (por apartados)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Listado, contenido bajo demanda y búsqueda de Notas / Jaivaná
// ---------------------------------------------------------------------------
// El listado NO envía el texto completo de cada nota (puede ser enorme): envía
// solo los datos básicos y el tamaño. El contenido se pide cuando se abre la nota.

function crearRutasDeListado({ base, tabla, vista, titulo, cfg }) {
  app.get(base, requireLogin, async (req, res) => {
    // Consultas en paralelo para reducir latencia a la mitad
    const [notasRes, catRes] = await Promise.all([
      pool.query(
        `SELECT id, categoria, titulo, updated_at, archivo_nombre, archivo_tipo,
                LEFT(contenido, 2500) AS muestra,
                LENGTH(contenido) AS largo,
                (LENGTH(contenido) - LENGTH(REPLACE(contenido, chr(10), '')) + 1) AS lineas
         FROM ${tabla}
         WHERE eliminado_en IS NULL
         ORDER BY categoria COLLATE "C" ASC, titulo COLLATE "C" ASC`
      ),
      pool.query(
        `SELECT DISTINCT categoria FROM ${tabla} WHERE eliminado_en IS NULL ORDER BY 1 ASC`
      ),
    ]);

    const rows = notasRes.rows;
    const catRows = catRes.rows;

    rows.forEach((r) => {
      r.es_excel = esExcel(r.archivo_tipo);
      r.es_sql =
        !r.es_excel &&
        pareceSql({
          contenido: r.muestra,
          archivo_tipo: r.archivo_tipo,
          categoria: r.categoria,
          titulo: r.titulo,
        });
      r.largo = Number(r.largo);
      r.lineas = Number(r.lineas);
      delete r.muestra;
    });

    res.render(vista, {
      title: titulo,
      notas: rows,
      categorias: catRows.map((r) => r.categoria),
      cfg,
      maxUploadMb: MAX_UPLOAD_MB,
    });
  });

  // Texto completo de una nota (se pide al abrirla)
  app.get(base + "/:id/contenido", requireLogin, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).send("Id inválido.");

      const { rows } = await pool.query(
        `SELECT contenido FROM ${tabla} WHERE id = $1`,
        [req.params.id]
      );

      if (!rows[0]) return res.status(404).send("No existe.");

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.send(rows[0].contenido);
    } catch (error) {
      console.error("Error leyendo contenido:", error.message);
      res.status(500).send("No fue posible leer el contenido.");
    }
  });

  // Búsqueda en título, apartado y TODO el contenido (lo hace la base de datos)
  app.get(base + "/buscar", requireLogin, async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();

      if (!q) return res.json({ ids: null });

      const patron = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";

      const { rows } = await pool.query(
        `SELECT id FROM ${tabla}
         WHERE eliminado_en IS NULL
           AND (titulo ILIKE $1 OR categoria ILIKE $1 OR contenido ILIKE $1)`,
        [patron]
      );

      res.json({ ids: rows.map((r) => r.id) });
    } catch (error) {
      console.error("Error buscando:", error.message);
      res.status(500).json({ ids: null, error: "No fue posible buscar." });
    }
  });
}

crearRutasDeListado({
  base: "/notas",
  tabla: "notas",
  vista: "notas",
  titulo: "Notas y comandos",
  cfg: {
    base: "/notas",
    titulo: "Notas y comandos",
    plural: "notas",
    agregar: "+ Agregar nota",
    placeCat: "Ej: Ventoy USB",
    placeTit: "Ej: Preparar la USB",
    placeCont: "Pega aquí el comando, script o apunte…",
    vacio: "Todavía no hay notas guardadas. Agrega la primera arriba.",
    buscarDentro: "Buscar dentro de esta nota…",
    papeleraUno: "Mover esta nota a la papelera",
    el: "la nota",
    todos: "las",
  },
});
crearRutasDeListado({
  base: "/jaivana",
  tabla: "jaivana_notas",
  vista: "jaivana",
  titulo: "Apuntes Jaivaná",
  cfg: {
    base: "/jaivana",
    titulo: "Apuntes Jaivaná",
    plural: "apuntes",
    agregar: "+ Agregar apunte",
    placeCat: "Ej: Facturación electrónica y DIAN",
    placeTit: "Ej: Marcar factura enviada a la DIAN",
    placeCont: "Pega aquí la consulta SQL, procedimiento o apunte…",
    vacio: "Todavía no hay apuntes guardados. Agrega el primero arriba.",
    buscarDentro: "Buscar dentro de este apunte…",
    papeleraUno: "Mover este apunte a la papelera",
    el: "el apunte",
    todos: "los",
  },
});

// ---------------------------------------------------------------------------
// Subida de archivos (.txt, .sql, .docx, .pdf) a Notas y Jaivaná
// ---------------------------------------------------------------------------

const MIMES_IMG_SERVIR = {
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/gif": "image/gif",
  "image/bmp": "image/bmp",
  "image/webp": "image/webp",
};

// Corrige nombres con tildes/ñ que algunos navegadores envían mal codificados
function nombreArchivoLimpio(nombre) {
  try {
    const arreglado = Buffer.from(nombre, "latin1").toString("utf8");
    return arreglado.includes("\uFFFD") ? nombre : arreglado;
  } catch (e) {
    return nombre;
  }
}

// Procesa un archivo (texto + imágenes) y lo guarda como una nota.
// Devuelve la cantidad de imágenes guardadas.
async function guardarArchivoComoNota({ file, categoria, titulo, tabla, tablaImg }) {
  const nombreOriginal = nombreArchivoLimpio(file.originalname);
  const ext = path.extname(nombreOriginal).toLowerCase().replace(".", "");
  const tituloFinal = titulo || nombreOriginal.replace(/\.[^.]+$/, "");

  const contenidoBinario = file.buffer || (await fs.promises.readFile(file.path));

  let texto = "";
  let imagenes = [];
  try {
    if (esExcel(ext)) {
      // Hojas de cálculo: se guarda el texto (para buscar/copiar) y el archivo original
      texto = hojasATexto(leerLibro(contenidoBinario, ext));
    } else {
      const r = await procesarArchivo({ originalname: nombreOriginal, buffer: contenidoBinario });
      texto = r.texto;
      imagenes = r.imagenes;
    }
  } catch (error) {
    console.error("Error procesando archivo:", nombreOriginal, error.message);
  }

  if (!texto) {
    texto =
      "(No se pudo extraer texto de este archivo. Descarga el archivo original abajo para verlo.)";
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO ${tabla} (categoria, titulo, contenido, archivo_nombre, archivo_tipo, archivo_datos)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [categoria, tituloFinal, texto, nombreOriginal, ext, contenidoBinario]
    );

    for (const img of imagenes) {
      await client.query(
        `INSERT INTO ${tablaImg} (nota_id, orden, mime, datos) VALUES ($1, $2, $3, $4)`,
        [rows[0].id, img.numero, img.mime, img.datos]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return imagenes.length;
}

function crearRutasDeSubida({ base, tabla, tablaImg }) {
  app.post(
    base + "/subir",
    requireLogin,
    upload.array("archivos", 20),
    async (req, res) => {
      try {
        const archivos = req.files || [];
        const rechazados = req.rechazados || [];

        if (!archivos.length) {
          flash(
            req,
            "error",
            rechazados.length
              ? `Ningún archivo válido. No permitidos: ${rechazados.join(", ")} (solo .txt, .sql, .docx, .pdf, .xlsx, .xls y .csv).`
              : "Selecciona al menos un archivo (.txt, .sql, .docx, .pdf, .xlsx, .xls o .csv)."
          );
          return res.redirect(base);
        }

        const categoria = (req.body.categoria || "").trim();

        if (!categoria) {
          flash(req, "error", "Elige o escribe un apartado (categoría) para los archivos.");
          return res.redirect(base);
        }

        // El título manual solo aplica si se sube un único archivo
        const tituloManual = archivos.length === 1 ? (req.body.titulo || "").trim() : "";

        let subidos = 0;
        let totalImagenes = 0;
        const fallidos = [];

        for (const file of archivos) {
          try {
            totalImagenes += await guardarArchivoComoNota({
              file,
              categoria,
              titulo: tituloManual,
              tabla,
              tablaImg,
            });
            subidos++;
          } catch (error) {
            console.error("Error guardando", file.originalname, error.message);
            fallidos.push(nombreArchivoLimpio(file.originalname));
          }
        }

        let mensaje = subidos
          ? `${subidos} archivo${subidos === 1 ? "" : "s"} subido${subidos === 1 ? "" : "s"} y guardado${subidos === 1 ? "" : "s"} en «${categoria}»` +
            (totalImagenes ? ` (con ${totalImagenes} imagen${totalImagenes === 1 ? "" : "es"}).` : ".")
          : "";

        if (fallidos.length) mensaje += ` No se pudieron guardar: ${fallidos.join(", ")}.`;
        if (rechazados.length) mensaje += ` Omitidos por tipo no permitido: ${rechazados.join(", ")}.`;

        flash(req, subidos ? "ok" : "error", mensaje.trim());

        res.redirect(base);
      } catch (error) {
        console.error("Error subiendo archivos (" + base + "):", error.message);

        flash(req, "error", "No fue posible subir los archivos.");

        res.redirect(base);
      } finally {
        for (const f of req.files || []) {
          if (f.path) fs.promises.unlink(f.path).catch(() => {});
        }
      }
    }
  );

  // Hojas de cálculo: devuelve todas las hojas del Excel para dibujarlas como cuadrícula
  app.get(base + "/:id/hoja", requireLogin, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Id inválido." });

      const { rows } = await pool.query(
        `SELECT archivo_tipo, archivo_datos FROM ${tabla} WHERE id = $1`,
        [req.params.id]
      );

      const row = rows[0];

      if (!row || !row.archivo_datos || !esExcel(row.archivo_tipo)) {
        return res.status(404).json({ error: "Esta nota no tiene una hoja de cálculo." });
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({ hojas: leerLibro(row.archivo_datos, row.archivo_tipo) });
    } catch (error) {
      console.error("Error leyendo hoja de cálculo:", error.message);
      res.status(500).json({ error: "No fue posible leer la hoja de cálculo." });
    }
  });

  app.get(base + "/:id/imagen/:orden", requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT mime, datos FROM ${tablaImg} WHERE nota_id = $1 AND orden = $2`,
        [req.params.id, req.params.orden]
      );

      const row = rows[0];

      if (!row) return res.status(404).send("Imagen no encontrada.");

      res.setHeader("Content-Type", MIMES_IMG_SERVIR[row.mime] || "application/octet-stream");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, max-age=86400");
      res.send(row.datos);
    } catch (error) {
      console.error("Error sirviendo imagen:", error.message);
      res.status(500).send("No fue posible cargar la imagen.");
    }
  });
}

crearRutasDeSubida({ base: "/notas", tabla: "notas", tablaImg: "notas_imagenes" });
crearRutasDeSubida({ base: "/jaivana", tabla: "jaivana_notas", tablaImg: "jaivana_imagenes" });

app.get("/notas/:id/archivo", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT archivo_nombre, archivo_datos FROM notas WHERE id = $1",
      [req.params.id]
    );

    const row = rows[0];

    if (!row || !row.archivo_datos) {
      return res.status(404).send("Este apunte no tiene un archivo adjunto.");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        row.archivo_nombre || "archivo"
      )}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(row.archivo_datos);
  } catch (error) {
    console.error("Error descargando archivo de nota:", error.message);

    res.status(500).send("No fue posible descargar el archivo.");
  }
});

app.post("/notas/:id/quitar-archivo", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE notas
       SET archivo_nombre = NULL, archivo_tipo = NULL, archivo_datos = NULL
       WHERE id = $1
       RETURNING titulo`,
      [req.params.id]
    );

    if (!rows[0]) {
      flash(req, "error", "Ese apunte ya no existe.");
    } else {
      flash(
        req,
        "ok",
        `Se quitó el archivo adjunto de «${rows[0].titulo}» (la nota se conserva).`
      );
    }

    res.redirect("/notas");
  } catch (error) {
    console.error("Error quitando archivo de nota:", error.message);

    flash(req, "error", "No fue posible quitar el archivo.");

    res.redirect("/notas");
  }
});

app.post("/notas/eliminar-todo", requireLogin, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE notas SET eliminado_en = NOW() WHERE eliminado_en IS NULL"
    );

    invalidarPapeleraCache();

    flash(
      req,
      "ok",
      rowCount
        ? `Se movieron a la papelera las ${rowCount} notas de esta sección. Puedes restaurarlas cuando quieras.`
        : "No había notas para eliminar."
    );

    res.redirect("/notas");
  } catch (error) {
    console.error("Error eliminando todas las notas:", error.message);

    flash(req, "error", "No fue posible eliminar todas las notas.");

    res.redirect("/notas");
  }
});

app.post("/notas/agregar", requireLogin, async (req, res) => {
  try {
    const categoria = (req.body.categoria || "").trim();
    const titulo = (req.body.titulo || "").trim();
    const contenido = (req.body.contenido || "").trim();
    const formato = (req.body.formato || "sql").trim();
    const archivoTipo = formato === "texto" ? "txt" : "sql";

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/notas");
    }

    await pool.query(
      "INSERT INTO notas (categoria, titulo, contenido, archivo_tipo) VALUES ($1, $2, $3, $4)",
      [categoria, titulo, contenido, archivoTipo]
    );

    flash(req, "ok", `Nota «${titulo}» agregada en «${categoria}».`);

    res.redirect("/notas");
  } catch (error) {
    console.error("Error agregando nota:", error.message);

    flash(req, "error", "No fue posible agregar la nota.");

    res.redirect("/notas");
  }
});

app.post("/notas/:id/actualizar", requireLogin, async (req, res) => {
  try {
    const categoria = (req.body.categoria || "").trim();
    const titulo = (req.body.titulo || "").trim();
    const contenido = (req.body.contenido || "").trim();

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/notas");
    }

    const { rows } = await pool.query(
      "UPDATE notas SET categoria = $1, titulo = $2, contenido = $3, updated_at = NOW() WHERE id = $4 AND eliminado_en IS NULL RETURNING id",
      [categoria, titulo, contenido, req.params.id]
    );

    if (!rows[0]) {
      flash(req, "error", "Esa nota ya no existe.");

      return res.redirect("/notas");
    }

    flash(req, "ok", `Nota «${titulo}» actualizada.`);

    res.redirect("/notas");
  } catch (error) {
    console.error("Error actualizando nota:", error.message);

    flash(req, "error", "No fue posible actualizar la nota.");

    res.redirect("/notas");
  }
});

app.post("/notas/:id/eliminar", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE notas SET eliminado_en = NOW() WHERE id = $1 AND eliminado_en IS NULL RETURNING titulo",
      [req.params.id]
    );

    invalidarPapeleraCache();

    if (rows[0]) {
      flash(req, "ok", `Nota «${rows[0].titulo}» movida a la papelera.`);
    }

    res.redirect("/notas");
  } catch (error) {
    console.error("Error eliminando nota:", error.message);

    flash(req, "error", "No fue posible eliminar la nota.");

    res.redirect("/notas");
  }
});

// ---------------------------------------------------------------------------
// Apuntes Jaivaná (sección aparte, independiente de "Notas")
// ---------------------------------------------------------------------------



app.get("/jaivana/:id/archivo", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT archivo_nombre, archivo_datos FROM jaivana_notas WHERE id = $1",
      [req.params.id]
    );

    const row = rows[0];

    if (!row || !row.archivo_datos) {
      return res.status(404).send("Este apunte no tiene un archivo adjunto.");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        row.archivo_nombre || "archivo"
      )}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(row.archivo_datos);
  } catch (error) {
    console.error("Error descargando archivo de Jaivaná:", error.message);

    res.status(500).send("No fue posible descargar el archivo.");
  }
});

app.post("/jaivana/:id/quitar-archivo", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE jaivana_notas
       SET archivo_nombre = NULL, archivo_tipo = NULL, archivo_datos = NULL
       WHERE id = $1
       RETURNING titulo`,
      [req.params.id]
    );

    if (!rows[0]) {
      flash(req, "error", "Ese apunte ya no existe.");
    } else {
      flash(
        req,
        "ok",
        `Se quitó el archivo adjunto de «${rows[0].titulo}» (el apunte se conserva).`
      );
    }

    res.redirect("/jaivana");
  } catch (error) {
    console.error("Error quitando archivo de Jaivaná:", error.message);

    flash(req, "error", "No fue posible quitar el archivo.");

    res.redirect("/jaivana");
  }
});

app.post("/jaivana/eliminar-todo", requireLogin, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE jaivana_notas SET eliminado_en = NOW() WHERE eliminado_en IS NULL"
    );

    invalidarPapeleraCache();

    flash(
      req,
      "ok",
      rowCount
        ? `Se movieron a la papelera los ${rowCount} apuntes de esta sección. Puedes restaurarlos cuando quieras.`
        : "No había apuntes para eliminar."
    );

    res.redirect("/jaivana");
  } catch (error) {
    console.error("Error eliminando todos los apuntes de Jaivaná:", error.message);

    flash(req, "error", "No fue posible eliminar todos los apuntes.");

    res.redirect("/jaivana");
  }
});

app.post("/jaivana/agregar", requireLogin, async (req, res) => {
  try {
    const categoria = (req.body.categoria || "").trim();
    const titulo = (req.body.titulo || "").trim();
    const contenido = (req.body.contenido || "").trim();
    const formato = (req.body.formato || "sql").trim();
    const archivoTipo = formato === "texto" ? "txt" : "sql";

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/jaivana");
    }

    await pool.query(
      "INSERT INTO jaivana_notas (categoria, titulo, contenido, archivo_tipo) VALUES ($1, $2, $3, $4)",
      [categoria, titulo, contenido, archivoTipo]
    );

    flash(req, "ok", `Apunte «${titulo}» agregado en «${categoria}».`);

    res.redirect("/jaivana");
  } catch (error) {
    console.error("Error agregando apunte Jaivaná:", error.message);

    flash(req, "error", "No fue posible agregar el apunte.");

    res.redirect("/jaivana");
  }
});

app.post("/jaivana/:id/actualizar", requireLogin, async (req, res) => {
  try {
    const categoria = (req.body.categoria || "").trim();
    const titulo = (req.body.titulo || "").trim();
    const contenido = (req.body.contenido || "").trim();

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/jaivana");
    }

    const { rows } = await pool.query(
      "UPDATE jaivana_notas SET categoria = $1, titulo = $2, contenido = $3, updated_at = NOW() WHERE id = $4 AND eliminado_en IS NULL RETURNING id",
      [categoria, titulo, contenido, req.params.id]
    );

    if (!rows[0]) {
      flash(req, "error", "Ese apunte ya no existe.");

      return res.redirect("/jaivana");
    }

    flash(req, "ok", `Apunte «${titulo}» actualizado.`);

    res.redirect("/jaivana");
  } catch (error) {
    console.error("Error actualizando apunte Jaivaná:", error.message);

    flash(req, "error", "No fue posible actualizar el apunte.");

    res.redirect("/jaivana");
  }
});

app.post("/jaivana/:id/eliminar", requireLogin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE jaivana_notas SET eliminado_en = NOW() WHERE id = $1 AND eliminado_en IS NULL RETURNING titulo",
      [req.params.id]
    );

    invalidarPapeleraCache();

    if (rows[0]) {
      flash(req, "ok", `Apunte «${rows[0].titulo}» movido a la papelera.`);
    }

    res.redirect("/jaivana");
  } catch (error) {
    console.error("Error eliminando apunte Jaivaná:", error.message);

    flash(req, "error", "No fue posible eliminar el apunte.");

    res.redirect("/jaivana");
  }
});

// ---------------------------------------------------------------------------
// Papelera (lo eliminado en Notas y Jaivaná queda aquí hasta borrarlo de verdad)
// ---------------------------------------------------------------------------

const TABLAS_PAPELERA = {
  notas: { tabla: "notas", nombre: "Notas" },
  jaivana: { tabla: "jaivana_notas", nombre: "Jaivaná" },
};

app.get("/papelera", requireLogin, async (req, res) => {
  const items = [];

  for (const [origen, cfg] of Object.entries(TABLAS_PAPELERA)) {
    const { rows } = await pool.query(
      `SELECT id, categoria, titulo, LEFT(contenido, 260) AS vista,
              LENGTH(contenido) AS largo, archivo_nombre, eliminado_en
       FROM ${cfg.tabla} WHERE eliminado_en IS NOT NULL`
    );
    rows.forEach((r) => {
      r.origen = origen;
      r.origenNombre = cfg.nombre;
      items.push(r);
    });
  }

  items.sort((a, b) => new Date(b.eliminado_en) - new Date(a.eliminado_en));

  res.render("papelera", { title: "Papelera", items });
});

app.post("/papelera/restaurar-todo", requireLogin, async (req, res) => {
  try {
    let total = 0;
    for (const cfg of Object.values(TABLAS_PAPELERA)) {
      const { rowCount } = await pool.query(
        `UPDATE ${cfg.tabla} SET eliminado_en = NULL WHERE eliminado_en IS NOT NULL`
      );
      total += rowCount;
    }
    invalidarPapeleraCache();
    flash(req, "ok", total ? `Se restauraron ${total} elementos.` : "La papelera ya estaba vacía.");
  } catch (error) {
    console.error("Error restaurando todo:", error.message);
    flash(req, "error", "No fue posible restaurar los elementos.");
  }
  res.redirect("/papelera");
});

app.post("/papelera/vaciar", requireLogin, async (req, res) => {
  try {
    let total = 0;
    for (const cfg of Object.values(TABLAS_PAPELERA)) {
      const { rowCount } = await pool.query(
        `DELETE FROM ${cfg.tabla} WHERE eliminado_en IS NOT NULL`
      );
      total += rowCount;
    }
    invalidarPapeleraCache();
    flash(req, "ok", total ? `Se eliminaron definitivamente ${total} elementos.` : "La papelera ya estaba vacía.");
  } catch (error) {
    console.error("Error vaciando papelera:", error.message);
    flash(req, "error", "No fue posible vaciar la papelera.");
  }
  res.redirect("/papelera");
});

app.post("/papelera/:origen/:id/restaurar", requireLogin, async (req, res) => {
  try {
    const cfg = TABLAS_PAPELERA[req.params.origen];
    if (!cfg) return res.redirect("/papelera");

    const { rows } = await pool.query(
      `UPDATE ${cfg.tabla} SET eliminado_en = NULL
       WHERE id = $1 AND eliminado_en IS NOT NULL RETURNING titulo`,
      [req.params.id]
    );

    invalidarPapeleraCache();

    if (rows[0]) {
      flash(req, "ok", `«${rows[0].titulo}» restaurado en ${cfg.nombre}.`);
    }
  } catch (error) {
    console.error("Error restaurando:", error.message);
    flash(req, "error", "No fue posible restaurar el elemento.");
  }
  res.redirect("/papelera");
});

app.post("/papelera/:origen/:id/eliminar", requireLogin, async (req, res) => {
  try {
    const cfg = TABLAS_PAPELERA[req.params.origen];
    if (!cfg) return res.redirect("/papelera");

    const { rows } = await pool.query(
      `DELETE FROM ${cfg.tabla}
       WHERE id = $1 AND eliminado_en IS NOT NULL RETURNING titulo`,
      [req.params.id]
    );

    invalidarPapeleraCache();

    if (rows[0]) {
      flash(req, "ok", `«${rows[0].titulo}» eliminado definitivamente.`);
    }
  } catch (error) {
    console.error("Error eliminando definitivamente:", error.message);
    flash(req, "error", "No fue posible eliminar el elemento.");
  }
  res.redirect("/papelera");
});

// ---------------------------------------------------------------------------
// Visor de XML / JSON (todo el formateo ocurre en el navegador)
// ---------------------------------------------------------------------------

app.get("/visor", requireLogin, (req, res) => {
  res.render("visor", { title: "Visor XML / JSON" });
});

// ---------------------------------------------------------------------------
// Formateador de SQL (todo el formateo ocurre en el navegador, ver public/sql-formatter.js)
// ---------------------------------------------------------------------------

app.get("/sql", requireLogin, (req, res) => {
  res.render("sql", { title: "Formateador SQL" });
});

// ---------------------------------------------------------------------------
// Visor de Excel (.xlsx / .xls): el archivo se lee en el navegador con /xlsx.min.js,
// no se sube ni se guarda nada en el servidor.
// ---------------------------------------------------------------------------

app.get("/excel", requireLogin, (req, res) => {
  res.render("excel", { title: "Visor de Excel" });
});

// ---------------------------------------------------------------------------
// Listas: convierte datos pegados en ('a','b','c') (todo ocurre en el navegador)
// ---------------------------------------------------------------------------

app.get("/listas", requireLogin, (req, res) => {
  res.render("listas", { title: "Listas" });
});

// ---------------------------------------------------------------------------
// Aceptados: pegas la tabla del dashboard de Jaivaná y calcula los totales
// (todo ocurre en el navegador)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Revisor de logs (todo se procesa en el navegador)
// ---------------------------------------------------------------------------

app.get("/logs", requireLogin, (req, res) => {
  res.render("logs", { title: "Logs" });
});

// Enlaces guardados (nombre, ícono, color, grupo)
require("./enlaces-routes")(app, { pool, requireLogin });

// Vendedores (código + nombre) para el panel "Procesar query" de /sql
require("./vendedores-routes")(app, { pool, requireLogin });

// Asistente de IA (chat flotante con agente)
require("./asistente-routes")(app, { pool, requireLogin });

// Calendario: fechas especiales, reuniones y alertas a la hora del evento
require("./calendario-routes")(app, { pool, requireLogin });

// Manual desde video: capturas automáticas + PDF con membrete
require("./manual-video")(app, { requireLogin });

// ---------------------------------------------------------------------------
// Datos pequeños compartidos entre pestañas y navegadores
// ---------------------------------------------------------------------------

const KV_PERMITIDAS = new Set(["aceptados-resumen"]);

app.get("/api/kv/:k", requireLogin, async (req, res) => {
  if (!KV_PERMITIDAS.has(req.params.k)) return res.status(404).json({ v: null });
  try {
    const { rows } = await pool.query("SELECT v, updated_at FROM kv_store WHERE k = $1", [req.params.k]);
    res.json(rows[0] ? { v: rows[0].v, updated_at: rows[0].updated_at } : { v: null });
  } catch (error) {
    res.status(500).json({ v: null });
  }
});

app.put("/api/kv/:k", requireLogin, express.json({ limit: "64kb" }), async (req, res) => {
  if (!KV_PERMITIDAS.has(req.params.k)) return res.status(404).json({ ok: false });
  try {
    const v = req.body && req.body.v !== undefined ? req.body.v : null;
    if (v === null) {
      await pool.query("DELETE FROM kv_store WHERE k = $1", [req.params.k]);
    } else {
      await pool.query(
        `INSERT INTO kv_store (k, v, updated_at) VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = NOW()`,
        [req.params.k, JSON.stringify(v)]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

app.get("/aceptados", requireLogin, (req, res) => {
  res.render("aceptados", { title: "Aceptados" });
});

// ---------------------------------------------------------------------------
// Informe diario de envío de documentos electrónicos (formulario + PDF)
// El PDF se arma en informe-pdf.js con el mismo formato del Word original.
// ---------------------------------------------------------------------------

// Nombres de la tabla de empresas (Claves). Nunca se envían las claves.
async function listarEmpresasInforme() {
  const { rows } = await pool.query('SELECT empresa FROM companies ORDER BY empresa COLLATE "C" ASC');
  const vistos = new Set();
  const empresas = [];
  for (const r of rows) {
    const nombre = String(r.empresa || "").trim();
    if (nombre && !vistos.has(nombre.toLowerCase())) {
      vistos.add(nombre.toLowerCase());
      empresas.push(nombre);
    }
  }
  return empresas;
}

app.get("/informe", requireLogin, async (req, res) => {
  let empresas = [];
  let empresasError = false;
  try {
    empresas = await listarEmpresasInforme();
  } catch (err) {
    console.error("No se pudo leer la tabla de empresas para el informe:", err.message);
    empresasError = true;
  }
  res.render("informe", { title: "Informe diario", empresas, empresasError });
});

// La pantalla del informe vuelve a pedir esta lista al abrir el desplegable y al
// volver a la pestaña, así una empresa recién agregada aparece sin recargar.
app.get("/informe/empresas", requireLogin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json({ empresas: await listarEmpresasInforme() });
  } catch (err) {
    console.error("No se pudo leer la tabla de empresas:", err.message);
    res.status(500).json({ error: "No se pudo leer la tabla de empresas." });
  }
});

app.post("/informe/pdf", requireLogin, express.json({ limit: "512kb" }), async (req, res) => {
  try {
    const { generarInformePdf } = require("./informe-pdf");
    const { buffer, filename } = await generarInformePdf(req.body || {});
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `${req.query.descargar ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    });
    res.send(buffer);
  } catch (err) {
    console.error("Error generando el PDF del informe:", err);
    res.status(500).json({ error: "No se pudo generar el PDF." });
  }
});

app.post("/informe/probar-smtp", requireLogin, express.json(), async (req, res) => {
  try {
    const { host, port, user, pass } = req.body || {};
    const { verificarOutlookMapi } = require("./enviar-outlook");
    const estadoMapi = await verificarOutlookMapi();

    // Si no se proporcionó contraseña pero Outlook de escritorio está disponible
    if (!pass && !process.env.OUTLOOK_PASS) {
      if (estadoMapi.disponible) {
        return res.json({
          ok: true,
          mapiActivo: true,
          version: estadoMapi.version,
          mensaje: "Outlook de Escritorio detectado y activo (v" + estadoMapi.version + "). Tus informes se envían directamente a través de tu aplicación de Outlook sin necesidad de contraseña."
        });
      }
      return res.status(400).json({ error: "Ingresa tu contraseña para probar la conexión SMTP." });
    }

    const finalUser = user || process.env.OUTLOOK_USER || process.env.SMTP_USER || "jgrisales@jaivana.co";
    const finalPass = pass || process.env.OUTLOOK_PASS || process.env.SMTP_PASS;
    const finalHost = host || process.env.OUTLOOK_HOST || "smtp.office365.com";
    const finalPort = parseInt(port || process.env.OUTLOOK_PORT || 587, 10);

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: finalHost,
      port: finalPort,
      secure: finalPort === 465,
      auth: { user: finalUser, pass: finalPass },
      tls: { ciphers: "SSLv3", rejectUnauthorized: false }
    });

    try {
      await transporter.verify();
      return res.json({
        ok: true,
        smtpOk: true,
        mapiActivo: estadoMapi.disponible,
        version: estadoMapi.version,
        mensaje: "Conexión SMTP directa y Outlook de escritorio verificados exitosamente."
      });
    } catch (smtpErr) {
      const msg = smtpErr.message || "";
      // Caso estándar Microsoft 365: SmtpClientAuthentication disabled for Tenant (535 5.7.139)
      if (msg.includes("SmtpClientAuthentication is disabled for the Tenant") || msg.includes("535 5.7.139") || msg.includes("535")) {
        return res.json({
          ok: true,
          tenantPolicy: true,
          mapiActivo: estadoMapi.disponible,
          version: estadoMapi.version,
          advertencia: true,
          mensaje: estadoMapi.disponible
            ? "Outlook de Escritorio ACTIVO y FUNCIONAL (v" + estadoMapi.version + "). Nota de seguridad: Tu organización Microsoft 365 (jaivana.co) tiene bloqueada la autenticación por contraseña SMTP básica. ¡No te preocupes! El envío del informe funciona al 100% y de forma segura a través de tu Outlook de escritorio."
            : "Tu organización Microsoft 365 tiene deshabilitada la autenticación básica SMTP (SmtpClientAuthentication). Se requiere habilitar en Exchange Online o usar Outlook de escritorio."
        });
      }
      throw smtpErr;
    }
  } catch (err) {
    console.error("Error al probar SMTP de Outlook:", err.message);
    res.status(400).json({ error: err.message || "No se pudo conectar al servidor de correo." });
  }
});

app.post("/informe/enviar-email", requireLogin, express.json({ limit: "1mb" }), async (req, res) => {
  try {
    const { to, cc, asunto, mensaje, reporte, tecnico, cargo, smtp: clientSmtp } = req.body || {};

    if (!to || (!Array.isArray(to) && !String(to).trim()) || (Array.isArray(to) && to.length === 0)) {
      return res.status(400).json({ error: "Debes especificar al menos un destinatario en el campo 'Para'." });
    }

    // Generar el PDF oficial del informe en memoria
    const { generarInformePdf } = require("./informe-pdf");
    const { buffer, filename } = await generarInformePdf(reporte || {});

    const cuerpoHtml = (mensaje || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    const tecnicoNombre = tecnico || (reporte && reporte.tecnico) || "John James Grisales";
    const cargoNombre = cargo || "Analista de Soporte";

    // Envío directo transparente a través de Outlook MAPI de Windows (sin pedir contraseñas ni 2FA)
    const { enviarViaOutlookMapi } = require("./enviar-outlook");
    try {
      await enviarViaOutlookMapi({
        to,
        cc,
        asunto,
        mensajeHtml: cuerpoHtml,
        tecnico: tecnicoNombre,
        cargo: cargoNombre,
        pdfBuffer: buffer,
        pdfFilename: filename
      });
      return res.json({ ok: true, mensaje: "Informe enviado exitosamente desde tu cuenta de Outlook." });
    } catch (mapiErr) {
      console.warn("MAPI COM directo no disponible en este equipo, preparando envío universal vía Outlook:", mapiErr.message);

      const MailComposer = require("nodemailer/lib/mail-composer");
      const fs = require("fs");
      const path = require("path");
      const os = require("os");
      const { exec } = require("child_process");

      const logoPath = path.join(__dirname, "assets", "jaivana-signature.png");
      const attachments = [
        {
          filename: filename || `INFORME_DOCUMENTOS_ELECTRONICOS_${new Date().toISOString().slice(0,10)}.pdf`,
          content: buffer,
          contentType: "application/pdf"
        }
      ];

      let logoTag = "";
      if (fs.existsSync(logoPath)) {
        attachments.push({
          filename: "jaivana-logo.png",
          path: logoPath,
          cid: "jaivana_signature_img"
        });
        logoTag = `<div style="margin-top:12px; max-width:560px;"><img src="cid:jaivana_signature_img" alt="Jaivaná" width="560" style="width:100%; max-width:560px; height:auto; display:block; border:0;" /></div>`;
      } else {
        logoTag = `<div style="background:#2b2b2b; display:inline-block; padding:10px 24px; border-radius:8px; margin-top:12px; color:#ffffff; font-weight:bold; font-size:22px; font-family:sans-serif;">
          Jaivaná<span style="color:#e11d48; margin-left:4px;">▲</span>
        </div>`;
      }

      const htmlCompleto = `
        <div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 14.5px; color: #1e293b; line-height: 1.6; max-width: 650px;">
          <div>${cuerpoHtml}</div>
          <br>
          <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 13.5px; color: #334155;">
            <strong style="font-size: 15px; color: #0f172a;">${tecnicoNombre}</strong><br>
            <span style="color: #64748b;">${cargoNombre}</span><br>
            ${logoTag}
          </div>
        </div>
      `;

      const toList = Array.isArray(to) ? to.join("; ") : to;
      const ccList = cc ? (Array.isArray(cc) ? cc.join("; ") : cc) : undefined;
      const userEmail = (clientSmtp && clientSmtp.user) || process.env.OUTLOOK_USER || "jgrisales@jaivana.co";

      const mail = new MailComposer({
        from: `"${tecnicoNombre}" <${userEmail}>`,
        to: toList,
        cc: ccList,
        subject: asunto || `INFORME FACTURACION ELECTRONICA - ${new Date().toLocaleDateString("es-CO")}`,
        html: htmlCompleto,
        attachments
      });

      const emlBuffer = await mail.compile().build();

      // Guardar y abrir localmente con Start-Process en Windows si corre en local
      try {
        const tempEmlPath = path.join(os.tmpdir(), `INFORME_OUTLOOK_${Date.now()}.eml`);
        fs.writeFileSync(tempEmlPath, emlBuffer);
        exec(`start "" "${tempEmlPath}"`, (err) => {
          if (err) console.warn("Aviso al invocar start en Windows:", err.message);
        });
      } catch (e) {}

      return res.json({
        ok: true,
        abrirEml: true,
        metodo: "draft_desktop",
        emlBase64: emlBuffer.toString("base64"),
        filename: `INFORME_OUTLOOK_${new Date().toISOString().slice(0,10)}.eml`,
        mensaje: "Correo preparado y abierto en tu Outlook con el PDF adjunto y la firma oficial listos para enviar."
      });
    }
  } catch (err) {
    console.error("Error al enviar informe por correo:", err);
    res.status(500).json({ error: err.message || "Error al enviar el correo." });
  }
});

app.post("/informe/abrir-outlook", requireLogin, express.json({ limit: "1mb" }), async (req, res) => {
  try {
    const { to, cc, asunto, mensaje, reporte, tecnico, cargo } = req.body || {};
    const { generarInformePdf } = require("./informe-pdf");
    const { buffer: pdfBuffer, filename } = await generarInformePdf(reporte || {});

    const MailComposer = require("nodemailer/lib/mail-composer");
    const cuerpoHtml = (mensaje || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    const tecnicoNombre = tecnico || (reporte && reporte.tecnico) || "John James Grisales";
    const cargoNombre = cargo || "Analista de Soporte";
    const fs = require("fs");
    const logoPath = path.join(__dirname, "assets", "jaivana-signature.png");

    const attachments = [
      {
        filename: filename || `INFORME_DOCUMENTOS_ELECTRONICOS_${new Date().toISOString().slice(0,10)}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ];

    let logoTag = "";
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "jaivana-logo.png",
        path: logoPath,
        cid: "jaivana_signature_img"
      });
      logoTag = `<div style="margin-top:12px; max-width:560px;"><img src="cid:jaivana_signature_img" alt="Jaivaná" width="560" style="width:100%; max-width:560px; height:auto; display:block; border:0;" /></div>`;
    } else {
      logoTag = `<div style="background:#2b2b2b; display:inline-block; padding:10px 24px; border-radius:8px; margin-top:12px; color:#ffffff; font-weight:bold; font-size:22px; font-family:sans-serif;">
        Jaivaná<span style="color:#e11d48; margin-left:4px;">▲</span>
      </div>`;
    }

    const htmlCompleto = `
      <div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 14.5px; color: #1e293b; line-height: 1.6; max-width: 650px;">
        <div>${cuerpoHtml}</div>
        <br>
        <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 13.5px; color: #334155;">
          <strong style="font-size: 15px; color: #0f172a;">${tecnicoNombre}</strong><br>
          <span style="color: #64748b;">${cargoNombre}</span><br>
          ${logoTag}
        </div>
      </div>
    `;

    const toList = Array.isArray(to) ? to.join("; ") : to;
    const ccList = cc ? (Array.isArray(cc) ? cc.join("; ") : cc) : undefined;

    const mail = new MailComposer({
      from: `"James Grisales" <jgrisales@jaivana.co>`,
      to: toList,
      cc: ccList,
      subject: asunto || `INFORME FACTURACION ELECTRONICA - ${new Date().toLocaleDateString("es-CO")}`,
      html: htmlCompleto,
      attachments
    });

    const emlBuffer = await mail.compile().build();

    // Guardar temporalmente en Windows y abrir con la aplicación de Outlook
    const os = require("os");
    const { exec } = require("child_process");
    const tempDir = os.tmpdir();
    const tempEmlPath = path.join(tempDir, `INFORME_${Date.now()}.eml`);
    fs.writeFileSync(tempEmlPath, emlBuffer);

    // Lanzar Outlook con el borrador y PDF adjunto
    exec(`start "" "${tempEmlPath}"`, (err) => {
      if (err) console.error("No se pudo invocar start en Windows:", err.message);
    });

    res.setHeader("Content-Type", "message/rfc822");
    res.setHeader("Content-Disposition", `attachment; filename="INFORME_OUTLOOK_${new Date().toISOString().slice(0,10)}.eml"`);
    res.send(emlBuffer);
  } catch (err) {
    console.error("Error al preparar correo Outlook:", err);
    res.status(500).json({ error: err.message || "Error al preparar el correo." });
  }
});

app.post("/informe/actualizar-banner", requireLogin, express.json({ limit: "15mb" }), async (req, res) => {
  try {
    const { imagenBase64, restaurar } = req.body || {};
    const fs = require("fs");
    const path = require("path");

    const pathsToUpdate = [
      path.join(__dirname, "assets", "jaivana-signature.png"),
      path.join(__dirname, "public", "img", "jaivana-signature.png"),
      path.join(__dirname, "..", "assets", "jaivana-signature.png"),
      path.join(__dirname, "..", "public", "img", "jaivana-signature.png"),
      path.join(__dirname, "boveda_node", "assets", "jaivana-signature.png"),
      path.join(__dirname, "boveda_node", "public", "img", "jaivana-signature.png")
    ];

    if (restaurar) {
      const defaultCandidates = [
        path.join(__dirname, "assets", "jaivana-signature-default.png"),
        path.join(__dirname, "public", "img", "jaivana-signature-default.png"),
        path.join(__dirname, "..", "assets", "jaivana-signature-default.png"),
        path.join(__dirname, "..", "public", "img", "jaivana-signature-default.png")
      ];
      let defaultBuf = null;
      for (const dc of defaultCandidates) {
        if (fs.existsSync(dc)) {
          defaultBuf = fs.readFileSync(dc);
          break;
        }
      }
      if (!defaultBuf) {
        return res.status(404).json({ error: "No se encontró el archivo de respaldo original del banner." });
      }
      for (const p of pathsToUpdate) {
        try {
          if (fs.existsSync(path.dirname(p))) {
            fs.writeFileSync(p, defaultBuf);
          }
        } catch (e) {}
      }
      return res.json({ ok: true, mensaje: "Banner oficial de Jaivaná restaurado con éxito." });
    }

    if (!imagenBase64) {
      return res.status(400).json({ error: "No se proporcionó imagen para el banner." });
    }

    const matches = imagenBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], "base64") : Buffer.from(imagenBase64, "base64");

    for (const p of pathsToUpdate) {
      try {
        if (fs.existsSync(path.dirname(p))) {
          fs.writeFileSync(p, buffer);
        }
      } catch (e) {}
    }

    return res.json({ ok: true, mensaje: "Banner de firma actualizado exitosamente." });
  } catch (err) {
    console.error("Error al actualizar banner:", err);
    res.status(500).json({ error: err.message || "Error al actualizar banner." });
  }
});

// ---------------------------------------------------------------------------
// Viáticos: solicitud de anticipo y legalización de gastos de viaje (formulario + PDF)
// Los PDF se arman en viaticos-pdf.js con el mismo formato de los Excel originales.
// ---------------------------------------------------------------------------

app.get("/viaticos", requireLogin, (req, res) => {
  res.render("viaticos", { title: "Viáticos" });
});

function crearRutaPdfViaticos(ruta, nombreFuncion, etiqueta) {
  app.post(ruta, requireLogin, express.json({ limit: "256kb" }), async (req, res) => {
    try {
      const generador = require("./viaticos-pdf");
      const { buffer, filename } = await generador[nombreFuncion](req.body || {});
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `${req.query.descargar ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "no-store",
      });
      res.send(buffer);
    } catch (err) {
      console.error(`Error generando el PDF de ${etiqueta}:`, err);
      res.status(500).json({ error: "No se pudo generar el PDF." });
    }
  });
}

crearRutaPdfViaticos("/viaticos/anticipo/pdf", "generarSolicitudPdf", "la solicitud de anticipo");
crearRutaPdfViaticos("/viaticos/legalizacion/pdf", "generarLegalizacionPdf", "la legalización de gastos");

// ---------------------------------------------------------------------------
// Manejo de errores de subida de archivos (multer y validaciones propias)
// ---------------------------------------------------------------------------

app.use((err, req, res, next) => {
  if (!err) return next();

  if (err.type === "entity.too.large") {
    flash(req, "error", "El contenido es demasiado grande para enviarlo. Sube el texto como archivo (.txt/.sql) en vez de pegarlo.");
    const vuelta = req.originalUrl.startsWith("/jaivana") ? "/jaivana" : "/notas";
    return res.redirect(vuelta);
  }

  const esErrorDeArchivo =
    err instanceof multer.MulterError ||
    (err.message && err.message.toLowerCase().includes("archivo"));

  if (!esErrorDeArchivo) return next(err);

  console.error("Error de subida de archivo:", err.message);

  let mensaje = err.message || "No fue posible procesar el archivo.";
  if (err.code === "LIMIT_FILE_SIZE") {
    mensaje = `El archivo pesa más de ${MAX_UPLOAD_MB} MB (límite actual). Puedes subirlo cambiando MAX_UPLOAD_MB en el archivo .env.`;
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    mensaje = "Máximo 20 archivos por vez.";
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    mensaje = "La página está desactualizada: recárgala con Ctrl+F5 e inténtalo de nuevo.";
  }

  flash(req, "error", mensaje);

  const volverA = req.originalUrl.startsWith("/jaivana") ? "/jaivana" : "/notas";
  res.redirect(volverA);
});

// ---------------------------------------------------------------------------
// Inicialización
// ---------------------------------------------------------------------------

initDb()
  .then(() => {
    const servidor = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Bóveda de claves corriendo en http://localhost:${PORT}` +
          ` (archivos de hasta ${MAX_UPLOAD_MB} MB)`
      );
    });

    // Sin tiempo máximo para recibir/enviar archivos grandes (por defecto Node
    // corta cualquier petición que tarde más de 5 minutos).
    servidor.requestTimeout = 0;
    servidor.timeout = 0;
  })
  .catch((err) => {
    console.error(
      "No se pudo conectar/inicializar PostgreSQL:",
      err.message
    );

    process.exit(1);
  });

