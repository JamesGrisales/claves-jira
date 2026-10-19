const { pool } = require('./db');

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS biometria_credenciales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT,
        dispositivo TEXT DEFAULT 'Sensor de Huella (Windows Hello)',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_biometria_user_id ON biometria_credenciales(user_id);
      CREATE INDEX IF NOT EXISTS idx_biometria_credential_id ON biometria_credenciales(credential_id);
    `);
    console.log('TABLA biometria_credenciales CREADA CON EXITO');
    process.exit(0);
  } catch (err) {
    console.error('ERROR CREANDO TABLA:', err.message);
    process.exit(1);
  }
}

main();
