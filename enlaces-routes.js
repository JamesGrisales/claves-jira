// Sección "Enlaces": guarda links con nombre, ícono, color y grupo.
// Se registra desde server.js con:  require("./enlaces-routes")(app, { pool, requireLogin });
// La tabla se crea sola la primera vez (no hace falta tocar schema.sql).
const express = require("express");

module.exports = function registrarEnlaces(app, { pool, requireLogin }) {
  const listo = pool
    .query(
      `CREATE TABLE IF NOT EXISTS enlaces (
         id SERIAL PRIMARY KEY,
         nombre TEXT NOT NULL,
         url TEXT NOT NULL,
         icono TEXT NOT NULL DEFAULT '🔗',
         color TEXT NOT NULL DEFAULT '#2563eb',
         grupo TEXT NOT NULL DEFAULT '',
         fijado BOOLEAN NOT NULL DEFAULT FALSE,
         usos INTEGER NOT NULL DEFAULT 0,
         creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
       )`
    )
    .catch((e) => console.error("No se pudo crear la tabla enlaces:", e.message));

  const json = express.json({ limit: "16kb" });
  const COLS = "id, nombre, url, icono, color, grupo, fijado, usos";

  // Valida y limpia lo que llega del formulario. Solo se aceptan http/https
  // (así nadie puede guardar un "javascript:..." que se ejecute al hacer clic).
  function limpiar(b) {
    b = b || {};
    const nombre = String(b.nombre || "").trim().slice(0, 120);
    let url = String(b.url || "").trim();
    if (!nombre) return { error: "Escribe un nombre para el enlace." };
    if (!url) return { error: "Escribe la dirección (URL)." };
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url) || /^[^/]+:\d+(\/|$)/.test(url))
      url = (/^(localhost|\d{1,3}(\.\d{1,3}){3})(:|\/|$)/i.test(url) ? "http://" : "https://") + url; // servidores locales/IP: http
    let u;
    try { u = new URL(url); } catch (e) { return { error: "Esa dirección no es válida." }; }
    if (u.protocol !== "http:" && u.protocol !== "https:")
      return { error: "Solo se permiten enlaces http:// o https://" };
    const icono = Array.from(String(b.icono || "🔗").trim()).slice(0, 4).join("") || "🔗";
    const color = /^#[0-9a-f]{6}$/i.test(b.color || "") ? b.color : "#2563eb";
    return {
      v: {
        nombre,
        url: u.href.length > 2000 ? null : u.href,
        icono,
        color,
        grupo: String(b.grupo || "").trim().slice(0, 60),
        fijado: !!b.fijado,
      },
    };
  }

  app.get("/enlaces", requireLogin, async (req, res, next) => {
    try {
      await listo;
      const { rows } = await pool.query(`SELECT ${COLS} FROM enlaces ORDER BY LOWER(nombre)`);
      res.render("enlaces", { title: "Enlaces", items: rows });
    } catch (e) { next(e); }
  });

  app.post("/enlaces/api", requireLogin, json, async (req, res) => {
    const r = limpiar(req.body);
    if (r.error || !r.v.url) return res.status(400).json({ ok: false, error: r.error || "URL demasiado larga." });
    try {
      const v = r.v;
      const { rows } = await pool.query(
        `INSERT INTO enlaces (nombre, url, icono, color, grupo, fijado)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${COLS}`,
        [v.nombre, v.url, v.icono, v.color, v.grupo, v.fijado]
      );
      res.json({ ok: true, item: rows[0] });
    } catch (e) { res.status(500).json({ ok: false, error: "No se pudo guardar." }); }
  });

  app.put("/enlaces/api/:id(\\d+)", requireLogin, json, async (req, res) => {
    const r = limpiar(req.body);
    if (r.error || !r.v.url) return res.status(400).json({ ok: false, error: r.error || "URL demasiado larga." });
    try {
      const v = r.v;
      const { rows } = await pool.query(
        `UPDATE enlaces SET nombre=$1, url=$2, icono=$3, color=$4, grupo=$5, fijado=$6
         WHERE id=$7 RETURNING ${COLS}`,
        [v.nombre, v.url, v.icono, v.color, v.grupo, v.fijado, req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ ok: false, error: "Ese enlace ya no existe." });
      res.json({ ok: true, item: rows[0] });
    } catch (e) { res.status(500).json({ ok: false, error: "No se pudo guardar." }); }
  });

  app.post("/enlaces/api/:id(\\d+)/abrir", requireLogin, async (req, res) => {
    try { await pool.query("UPDATE enlaces SET usos = usos + 1 WHERE id = $1", [req.params.id]); } catch (e) {}
    res.json({ ok: true });
  });

  app.delete("/enlaces/api/:id(\\d+)", requireLogin, async (req, res) => {
    try {
      await pool.query("DELETE FROM enlaces WHERE id = $1", [req.params.id]);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ ok: false, error: "No se pudo eliminar." }); }
  });

  module.exports.limpiar = limpiar;
};
