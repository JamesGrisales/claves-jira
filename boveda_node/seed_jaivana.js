require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool, initDb } = require("./db");

// Los apuntes vienen del archivo APUNTES_JAIVANA-SOPORTE.docx, separados
// automáticamente por bloques (separados por líneas en blanco en el
// documento original) y agrupados en apartados por palabras clave
// (facturación/DIAN, usuarios y permisos, vendedores, terceros/cartera,
// inventario/cajas, contabilidad, y un último grupo "Apuntes sueltos
// Jaivaná" para lo que no encajó en ningún grupo). La guía de Liquibase
// del final del documento quedó en su propio apartado.
//
// Puedes editar jaivana_notas_data.json a mano (agregar, mover de
// apartado, corregir títulos) y volver a correr "node seed_jaivana.js"
// las veces que quieras: no duplica apuntes idénticos (mismo apartado +
// título + contenido).

async function main() {
  await initDb();

  const dataPath = path.join(__dirname, "jaivana_notas_data.json");
  const notas = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const { rows: existentesRows } = await pool.query(
    "SELECT LOWER(categoria) AS c, LOWER(titulo) AS t, contenido AS co FROM jaivana_notas"
  );
  const existentes = new Set(
    existentesRows.map((r) => `${r.c}|||${r.t}|||${r.co}`)
  );

  let agregadas = 0;
  let omitidas = 0;

  for (const nota of notas) {
    const categoria = (nota.categoria || "").trim();
    const titulo = (nota.titulo || "").trim();
    const contenido = (nota.contenido || "").trim();

    if (!categoria || !titulo || !contenido) {
      omitidas++;
      continue;
    }

    const clave = `${categoria.toLowerCase()}|||${titulo.toLowerCase()}|||${contenido}`;

    if (existentes.has(clave)) {
      omitidas++;
      continue;
    }

    await pool.query(
      "INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ($1, $2, $3)",
      [categoria, titulo, contenido]
    );

    existentes.add(clave);
    agregadas++;
  }

  console.log(
    `Listo. ${agregadas} apuntes de Jaivaná agregados, ${omitidas} ya existían (u omitidos) y se saltaron.`
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Error cargando apuntes de Jaivaná:", err.message);
  process.exit(1);
});
