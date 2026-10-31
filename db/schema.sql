-- Esquema de la bóveda de claves. Se ejecuta solo (server.js lo corre
-- automáticamente al arrancar si las tablas no existen).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  empresa VARCHAR(255) NOT NULL,
  clave_cifrada TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_empresa ON companies (LOWER(empresa));

CREATE TABLE IF NOT EXISTS notas (
  id SERIAL PRIMARY KEY,
  categoria VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_categoria ON notas (LOWER(categoria));

ALTER TABLE notas ADD COLUMN IF NOT EXISTS archivo_nombre TEXT;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS archivo_tipo TEXT;
ALTER TABLE notas ADD COLUMN IF NOT EXISTS archivo_datos BYTEA;

CREATE TABLE IF NOT EXISTS jaivana_notas (
  id SERIAL PRIMARY KEY,
  categoria VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jaivana_notas_categoria ON jaivana_notas (LOWER(categoria));

ALTER TABLE jaivana_notas ADD COLUMN IF NOT EXISTS archivo_nombre TEXT;
ALTER TABLE jaivana_notas ADD COLUMN IF NOT EXISTS archivo_tipo TEXT;
ALTER TABLE jaivana_notas ADD COLUMN IF NOT EXISTS archivo_datos BYTEA;

CREATE TABLE IF NOT EXISTS notas_imagenes (
  id SERIAL PRIMARY KEY,
  nota_id INTEGER NOT NULL REFERENCES notas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  mime TEXT NOT NULL,
  datos BYTEA NOT NULL,
  UNIQUE (nota_id, orden)
);

CREATE TABLE IF NOT EXISTS jaivana_imagenes (
  id SERIAL PRIMARY KEY,
  nota_id INTEGER NOT NULL REFERENCES jaivana_notas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL,
  mime TEXT NOT NULL,
  datos BYTEA NOT NULL,
  UNIQUE (nota_id, orden)
);

-- Papelera: los elementos eliminados quedan marcados con la fecha en que se eliminaron
ALTER TABLE notas ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMP;
ALTER TABLE jaivana_notas ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notas_eliminado ON notas (eliminado_en);
CREATE INDEX IF NOT EXISTS idx_jaivana_notas_eliminado ON jaivana_notas (eliminado_en);

-- Títulos y apartados sin límite de 255 caracteres
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'notas' AND column_name = 'titulo' AND character_maximum_length IS NOT NULL) THEN
    ALTER TABLE notas ALTER COLUMN titulo TYPE TEXT;
    ALTER TABLE notas ALTER COLUMN categoria TYPE TEXT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'jaivana_notas' AND column_name = 'titulo' AND character_maximum_length IS NOT NULL) THEN
    ALTER TABLE jaivana_notas ALTER COLUMN titulo TYPE TEXT;
    ALTER TABLE jaivana_notas ALTER COLUMN categoria TYPE TEXT;
  END IF;
END $$;

-- Pequeños datos compartidos entre pestañas/navegadores (ej. resumen de Aceptados para el Informe)
CREATE TABLE IF NOT EXISTS kv_store (
  k TEXT PRIMARY KEY,
  v JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendedores (código + nombre) para el panel "Procesar query" de /sql.
-- Se llena solo la primera vez desde db/vendedores_seed.json; después se agregan desde la página.
CREATE TABLE IF NOT EXISTS vendedores (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de alto rendimiento para ordenamiento y consultas activas frecuentes
CREATE INDEX IF NOT EXISTS idx_companies_sort ON companies (empresa COLLATE "C" ASC);
CREATE INDEX IF NOT EXISTS idx_notas_activas_sort ON notas (categoria COLLATE "C" ASC, titulo COLLATE "C" ASC) WHERE eliminado_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_jaivana_activas_sort ON jaivana_notas (categoria COLLATE "C" ASC, titulo COLLATE "C" ASC) WHERE eliminado_en IS NULL;

-- Credenciales biométricas WebAuthn (Huella dactilar / Windows Hello)
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



-- Índices optimizados para aceleración de consultas (Turbo Speed)
CREATE INDEX IF NOT EXISTS idx_companies_empresa_collate ON companies (empresa COLLATE "C" ASC);
CREATE INDEX IF NOT EXISTS idx_notas_cat_tit ON notas (categoria COLLATE "C" ASC, titulo COLLATE "C" ASC);
CREATE INDEX IF NOT EXISTS idx_jaivana_cat_tit ON jaivana_notas (categoria COLLATE "C" ASC, titulo COLLATE "C" ASC);
CREATE INDEX IF NOT EXISTS idx_notas_no_del ON notas (eliminado_en) WHERE eliminado_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_jaivana_no_del ON jaivana_notas (eliminado_en) WHERE eliminado_en IS NULL;
