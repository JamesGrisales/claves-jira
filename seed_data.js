require("dotenv").config();
const path = require("path");
const XLSX = require("xlsx");
const { pool, initDb } = require("./db");
const { encryptValue } = require("./crypto-vault");

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.log("Uso: node seed_data.js ruta_al_archivo.xlsx");
    process.exit(1);
  }

  await initDb();

  const wb = XLSX.readFile(path.resolve(file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  const { rows: existentesRows } = await pool.query("SELECT LOWER(empresa) AS e FROM companies");
  const existentes = new Set(existentesRows.map((r) => r.e));

  let agregadas = 0;
  let omitidas = 0;

  for (const row of rows) {
    const valores = row.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
    if (valores.length < 2) continue;

    const empresa = String(valores[0]).trim();
    const clave = String(valores[1]).trim();

    if (["empresas", "empresa", "cliente"].includes(empresa.toLowerCase())) continue; // encabezado

    if (existentes.has(empresa.toLowerCase())) {
      omitidas++;
      continue;
    }

    await pool.query(
      "INSERT INTO companies (empresa, clave_cifrada) VALUES ($1, $2)",
      [empresa, encryptValue(clave)]
    );
    existentes.add(empresa.toLowerCase());
    agregadas++;
  }

  console.log(`Listo. ${agregadas} empresas agregadas, ${omitidas} ya existían y se omitieron.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Error importando:", err.message);
  process.exit(1);
});
