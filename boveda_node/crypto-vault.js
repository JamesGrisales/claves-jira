const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const KEY_PATH = path.join(__dirname, "secret.key");

function getKey() {
  if (!fs.existsSync(KEY_PATH)) {
    const key = crypto.randomBytes(32);

    fs.writeFileSync(KEY_PATH, key.toString("hex"), {
      mode: 0o600,
    });
  }

  const keyHex = fs.readFileSync(KEY_PATH, "utf8").trim();
  const key = Buffer.from(keyHex, "hex");

  if (key.length !== 32) {
    throw new Error(
      `secret.key inválido: se esperaban 32 bytes y se encontraron ${key.length}`
    );
  }

  return key;
}

const KEY = getKey();

/*
  Formato del valor cifrado:

  IV         = 12 bytes
  AuthTag    = 16 bytes
  Ciphertext = resto

  Todo se almacena como Base64.
*/

function encryptValue(plainText) {
  if (plainText === null || plainText === undefined) {
    throw new Error("No se puede cifrar un valor vacío.");
  }

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    KEY,
    iv
  );

  const ciphertext = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([
    iv,
    authTag,
    ciphertext,
  ]).toString("base64");
}

function decryptValue(token) {
  if (!token || typeof token !== "string") {
    throw new Error(
      "El valor cifrado está vacío o no es válido."
    );
  }

  const tokenLimpio = token.trim();

  let raw;

  try {
    raw = Buffer.from(tokenLimpio, "base64");
  } catch (error) {
    throw new Error(
      "El valor cifrado no tiene un formato Base64 válido."
    );
  }

  /*
    AES-GCM:

    IV         = 12 bytes
    AuthTag    = 16 bytes
    Ciphertext = mínimo 1 byte

    Mínimo total = 29 bytes
  */

  if (raw.length < 29) {
    throw new Error(
      `El valor cifrado es inválido o está incompleto. ` +
      `Se esperaban mínimo 29 bytes y llegaron ${raw.length}.`
    );
  }

  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);

  if (authTag.length !== 16) {
    throw new Error(
      `Authentication tag inválido: se esperaban 16 bytes y llegaron ${authTag.length}.`
    );
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    KEY,
    iv
  );

  decipher.setAuthTag(authTag);

  try {
    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plain.toString("utf8");
  } catch (error) {
    throw new Error(
      "No se pudo descifrar la clave. " +
      "Puede que haya sido cifrada con otra secret.key o que el dato esté corrupto."
    );
  }
}

module.exports = {
  encryptValue,
  decryptValue,
};

