require("dotenv").config();

const express = require("express");
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

const EXTENSIONES_PERMITIDAS = [".txt", ".sql", ".docx", ".pdf"];

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
  if ((nota.archivo_tipo || "").toLowerCase() === "sql") return true;

  if (/\bsql\b/i.test(nota.categoria || "") || /\bsql\b/i.test(nota.titulo || "")) {
    return true;
  }

  const texto = nota.contenido || "";

  if (SQL_INICIO_DE_LINEA.test(texto)) return true;

  const señales = SQL_SEÑALES_SUELTAS.filter((p) => p.test(texto)).length;
  return señales >= 2;
}

const app = express();
const PORT = process.env.PORT || 5050;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout");

app.use(
  express.urlencoded({
    extended: true,
    limit: Math.max(MAX_UPLOAD_MB * 3, 100) + "mb",
    parameterLimit: 10000,
  })
);
app.use(express.static(path.join(__dirname, "public")));

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

// Usuario y mensajes flash disponibles en todas las vistas
app.use(async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flashes = req.session.flashes || [];
  res.locals.currentPath = req.path;
  res.locals.papeleraCount = 0;

  req.session.flashes = [];

  // Cantidad de elementos en la papelera (para el menú de arriba)
  if (
    req.session.user &&
    req.method === "GET" &&
    !req.path.includes("/imagen/") &&
    !req.path.endsWith("/archivo")
  ) {
    try {
      const { rows } = await pool.query(
        `SELECT (SELECT COUNT(*) FROM notas WHERE eliminado_en IS NOT NULL)
              + (SELECT COUNT(*) FROM jaivana_notas WHERE eliminado_en IS NOT NULL) AS total`
      );
      res.locals.papeleraCount = Number(rows[0].total) || 0;
    } catch (error) {
      // si falla el conteo no debe romper la página
    }
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

  if (!primero && !req.session.user) {
    flash(
      req,
      "error",
      "Inicia sesión para poder crear un nuevo usuario."
    );

    return res.redirect("/login");
  }

  res.render("register", {
    primero,
    title: "Crear usuario",
  });
});

app.post("/registro", async (req, res) => {
  const primero = !(await anyUserExists());

  if (!primero && !req.session.user) {
    flash(
      req,
      "error",
      "Inicia sesión para poder crear un nuevo usuario."
    );

    return res.redirect("/login");
  }

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

      await pool.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
        [username, hash]
      );

      flash(
        req,
        "ok",
        "Usuario creado correctamente."
      );

      return res.redirect(
        primero ? "/login" : "/"
      );
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

    return res.redirect("/");
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

app.get("/cambiar-clave", requireLogin, (req, res) => {
  res.render("change_password", {
    title: "Cambiar mi contraseña",
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
    const { rows } = await pool.query(
      `SELECT id, categoria, titulo, updated_at, archivo_nombre, archivo_tipo,
              LEFT(contenido, 20000) AS muestra,
              LENGTH(contenido) AS largo,
              (LENGTH(contenido) - LENGTH(REPLACE(contenido, chr(10), '')) + 1) AS lineas
       FROM ${tabla}
       WHERE eliminado_en IS NULL
       ORDER BY categoria COLLATE "C" ASC, titulo COLLATE "C" ASC`
    );

    rows.forEach((r) => {
      r.es_sql = pareceSql({
        contenido: r.muestra,
        archivo_tipo: r.archivo_tipo,
        categoria: r.categoria,
        titulo: r.titulo,
      });
      r.largo = Number(r.largo);
      r.lineas = Number(r.lineas);
      delete r.muestra;
    });

    const { rows: catRows } = await pool.query(
      `SELECT DISTINCT categoria FROM ${tabla} WHERE eliminado_en IS NULL ORDER BY 1 ASC`
    );

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
    const r = await procesarArchivo({ originalname: nombreOriginal, buffer: contenidoBinario });
    texto = r.texto;
    imagenes = r.imagenes;
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
              ? `Ningún archivo válido. No permitidos: ${rechazados.join(", ")} (solo .txt, .sql, .docx y .pdf).`
              : "Selecciona al menos un archivo (.txt, .sql, .docx o .pdf)."
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

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/notas");
    }

    await pool.query(
      "INSERT INTO notas (categoria, titulo, contenido) VALUES ($1, $2, $3)",
      [categoria, titulo, contenido]
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

    if (!categoria || !titulo || !contenido) {
      flash(
        req,
        "error",
        "Apartado (categoría), título y contenido son obligatorios."
      );

      return res.redirect("/jaivana");
    }

    await pool.query(
      "INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ($1, $2, $3)",
      [categoria, titulo, contenido]
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
// Listas: convierte datos pegados en ('a','b','c') (todo ocurre en el navegador)
// ---------------------------------------------------------------------------

app.get("/listas", requireLogin, (req, res) => {
  res.render("listas", { title: "Listas" });
});

// ---------------------------------------------------------------------------
// Aceptados: pegas la tabla del dashboard de Jaivaná y calcula los totales
// (todo ocurre en el navegador)
// ---------------------------------------------------------------------------

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
    const servidor = app.listen(PORT, "127.0.0.1", () => {
      console.log(
        `Bóveda de claves corriendo en http://127.0.0.1:${PORT}` +
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

