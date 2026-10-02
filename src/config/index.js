require("dotenv").config();

const path = require("path");

const ROOT_DIR = path.join(__dirname, "..", "..");

/**
 * Configuración centralizada de la aplicación.
 * Todo valor que solía leerse suelto de `process.env` vive aquí,
 * de modo que el resto del código no depende del entorno.
 */
const config = {
  port: Number(process.env.PORT) || 5050,
  host: "127.0.0.1",

  sessionSecret: process.env.SESSION_SECRET || "cambia-esto",
  sessionMaxAgeMs: 1000 * 60 * 60 * 8, // 8 horas

  /** Tamaño máximo por archivo en MB. Configurable con MAX_UPLOAD_MB. */
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 100,

  /** Formatos de archivo adjuntos que se procesan como texto/imágenes. */
  extensionesPermitidas: [".txt", ".sql", ".docx", ".pdf"],

  /** Formatos aceptados por el importador de claves. */
  extensionesClaves: [".txt", ".csv", ".xml", ".xlsx", ".xls"],

  /** Máximo de archivos por envío en la subida de notas. */
  maxArchivosPorSubida: 20,

  /** Máximo de elementos aceptados en una importación de claves. */
  maxElementosImportacion: 1000,

  /** Longitud máxima permitida para una clave de empresa. */
  maxClaveLength: 500,

  bcryptRounds: 12,
  minPasswordLength: 6,

  paths: {
    root: ROOT_DIR,
    views: path.join(ROOT_DIR, "views"),
    public: path.join(ROOT_DIR, "public"),
  },
};

/** Límite del body (formularios/urlencoded) en bytes. */
config.bodyLimitBytes = `${Math.max(config.maxUploadMb * 3, 100)}mb`;

module.exports = config;