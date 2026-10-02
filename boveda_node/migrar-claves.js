require("dotenv").config();

const { pool, initDb } = require("./db");
const { encryptValue } = require("./crypto-vault");

async function migrarClaves() {
  try {
    await initDb();

    console.log("Buscando claves antiguas...");

    const { rows } = await pool.query(`
      SELECT id, empresa, clave_cifrada
      FROM companies
      ORDER BY id
    `);

    console.log(`Empresas encontradas: ${rows.length}`);

    let migradas = 0;

    for (const row of rows) {
      const clave = row.clave_cifrada;

      if (!clave) {
        console.log(
          `ID ${row.id} - ${row.empresa}: sin clave, se omite.`
        );
        continue;
      }

      /*
        Las claves antiguas tienen el formato:

        JVN-XXXX-XXXX-XXXX

        y actualmente están almacenadas como texto plano.

        Las nuevas quedarán cifradas con AES-256-GCM.
      */

      if (/^JVN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(clave.trim())) {
        const claveCifrada = encryptValue(clave.trim());

        await pool.query(
          `
          UPDATE companies
          SET clave_cifrada = $1,
              updated_at = NOW()
          WHERE id = $2
          `,
          [claveCifrada, row.id]
        );

        console.log(
          `ID ${row.id} - ${row.empresa}: migrada correctamente.`
        );

        migradas++;
      } else {
        console.log(
          `ID ${row.id} - ${row.empresa}: formato no reconocido, se omite.`
        );
      }
    }

    console.log("");
    console.log("====================================");
    console.log("Migración terminada.");
    console.log(`Claves migradas: ${migradas}`);
    console.log("====================================");

  } catch (error) {
    console.error(
      "Error durante la migración:",
      error.message
    );
  } finally {
    await pool.end();
  }
}

migrarClaves();

