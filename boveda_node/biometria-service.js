const crypto = require("crypto");
const { pool } = require("./db");

// 1. Iniciar registro de huella digital (Usuario autenticado)
async function registroChallenge(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, error: "Debes iniciar sesión primero." });
  }

  const challenge = crypto.randomBytes(32).toString("base64url");
  req.session.webauthnChallenge = challenge;

  const hostname = req.hostname || "localhost";
  const rpId = (hostname === "127.0.0.1" || hostname === "::1" || hostname === "localhost") ? "localhost" : hostname;
  const user = req.session.user;

  res.json({
    ok: true,
    options: {
      challenge: challenge,
      rp: {
        name: "Bóveda de Claves",
        id: rpId
      },
      user: {
        id: Buffer.from(String(user.id)).toString("base64url"),
        name: user.username,
        displayName: user.username
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256 (P-256)
        { type: "public-key", alg: -257 }, // RS256
        { type: "public-key", alg: -8 }    // Ed25519
      ],
      authenticatorSelection: {
        userVerification: "preferred",
        residentKey: "preferred"
      },
      timeout: 60000,
      attestation: "none"
    }
  });
}

// 2. Guardar credencial de huella registrada
async function registroGuardar(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, error: "No autorizado." });
  }

  const { credentialId, clientDataJSON, rawId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ ok: false, error: "Datos de credencial inválidos." });
  }

  // Verificar challenge de sesión
  if (clientDataJSON && req.session.webauthnChallenge) {
    try {
      const decodedClientData = JSON.parse(Buffer.from(clientDataJSON, "base64url").toString("utf8"));
      if (decodedClientData.challenge !== req.session.webauthnChallenge) {
        return res.status(400).json({ ok: false, error: "Desafío biométrico no coincide." });
      }
    } catch (e) {}
  }

  const userId = req.session.user.id;
  const dispositivo = req.body.dispositivo || "Sensor de Huella (Windows Hello)";

  try {
    await pool.query(
      `INSERT INTO biometria_credenciales (user_id, credential_id, public_key, dispositivo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (credential_id) DO UPDATE SET dispositivo = EXCLUDED.dispositivo`,
      [userId, credentialId, rawId || null, dispositivo]
    );

    delete req.session.webauthnChallenge;
    res.json({ ok: true, mensaje: "¡Huella digital vinculada exitosamente con Windows Hello!" });
  } catch (err) {
    console.error("Error guardando credencial biométrica:", err);
    res.status(500).json({ ok: false, error: "Error al guardar la huella en la base de datos." });
  }
}

// 3. Generar challenge para Login con Huella
async function loginChallenge(req, res) {
  const challenge = crypto.randomBytes(32).toString("base64url");
  req.session.webauthnChallenge = challenge;

  const hostname = req.hostname || "localhost";
  const rpId = (hostname === "127.0.0.1" || hostname === "::1" || hostname === "localhost") ? "localhost" : hostname;

  // Opcional: filtrar por usuario si fue proporcionado
  const username = (req.query.username || "").trim();
  let query = "SELECT credential_id FROM biometria_credenciales";
  let params = [];

  if (username) {
    query = `SELECT c.credential_id FROM biometria_credenciales c
             JOIN users u ON u.id = c.user_id WHERE u.username = $1`;
    params = [username];
  }

  let allowCredentials = [];
  try {
    const { rows } = await pool.query(query, params);
    allowCredentials = rows.map(r => ({
      id: r.credential_id,
      type: "public-key"
    }));
  } catch (err) {}

  res.json({
    ok: true,
    options: {
      challenge: challenge,
      rpId: rpId,
      allowCredentials: allowCredentials,
      userVerification: "preferred",
      timeout: 60000
    }
  });
}

// 4. Verificar credencial y autenticar sesión
async function loginVerificar(req, res) {
  const { credentialId, clientDataJSON } = req.body;
  if (!credentialId) {
    return res.status(400).json({ ok: false, error: "Credencial biométrica no proporcionada." });
  }

  if (clientDataJSON && req.session.webauthnChallenge) {
    try {
      const decodedClientData = JSON.parse(Buffer.from(clientDataJSON, "base64url").toString("utf8"));
      if (decodedClientData.challenge !== req.session.webauthnChallenge) {
        return res.status(400).json({ ok: false, error: "Desafío de seguridad biométrica inválido." });
      }
    } catch (e) {}
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username FROM users u
       JOIN biometria_credenciales b ON b.user_id = u.id
       WHERE b.credential_id = $1`,
      [credentialId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Huella no reconocida en el sistema." });
    }

    const user = rows[0];
    req.session.user = {
      id: user.id,
      username: user.username
    };

    delete req.session.webauthnChallenge;
    res.json({
      ok: true,
      mensaje: `¡Acceso biométrico concedido! Bienvenido, ${user.username}`,
      redirect: "/"
    });
  } catch (err) {
    console.error("Error autenticando con huella:", err);
    res.status(500).json({ ok: false, error: "Error en el servidor al verificar huella." });
  }
}

// 5. Estado de credenciales biométricas del usuario
async function estadoBiometria(req, res) {
  try {
    if (req.session && req.session.user) {
      const { rows } = await pool.query(
        "SELECT id, dispositivo, created_at FROM biometria_credenciales WHERE user_id = $1 ORDER BY created_at DESC",
        [req.session.user.id]
      );
      return res.json({ ok: true, credenciales: rows, tieneHuella: rows.length > 0 });
    }

    // Para la pantalla de login: saber si existen credenciales registradas
    const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM biometria_credenciales");
    res.json({ ok: true, tieneHuella: rows[0].c > 0 });
  } catch (err) {
    res.json({ ok: false, tieneHuella: false });
  }
}

// 6. Eliminar huella vinculada
async function eliminarHuella(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, error: "No autorizado." });
  }

  try {
    const id = req.params.id;
    if (id) {
      await pool.query("DELETE FROM biometria_credenciales WHERE id = $1 AND user_id = $2", [id, req.session.user.id]);
    } else {
      await pool.query("DELETE FROM biometria_credenciales WHERE user_id = $1", [req.session.user.id]);
    }
    res.json({ ok: true, mensaje: "Huella eliminada." });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error eliminando huella." });
  }
}

module.exports = {
  registroChallenge,
  registroGuardar,
  loginChallenge,
  loginVerificar,
  estadoBiometria,
  eliminarHuella
};
