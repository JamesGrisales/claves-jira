const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "127.0.0.1",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "1593",
  database: process.env.PGDATABASE || "boveda_jira",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Aviso en pool de PostgreSQL (cliente inactivo o reconexión):", err.message);
});

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, "db", "schema.sql"), "utf8");
  await pool.query(schema);

  // Carga inicial de vendedores (solo si la tabla está vacía)
  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM vendedores");
    const archivo = path.join(__dirname, "db", "vendedores_seed.json");
    if (rows[0].n === 0 && fs.existsSync(archivo)) {
      const lista = JSON.parse(fs.readFileSync(archivo, "utf8"));
      if (lista.length) {
        await pool.query(
          `INSERT INTO vendedores (codigo, nombre)
           SELECT * FROM UNNEST($1::text[], $2::text[])
           ON CONFLICT (codigo) DO NOTHING`,
          [lista.map((v) => v.codigo), lista.map((v) => v.nombre)]
        );
        console.log("Vendedores cargados:", lista.length);
      }
    }
  } catch (e) {
    console.error("No se pudieron cargar los vendedores iniciales:", e.message);
  }
}

module.exports = { pool, initDb };
