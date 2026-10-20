// API de vendedores para el panel "Procesar query" de /sql.
// Se registra desde server.js con:  require("./vendedores-routes")(app, { pool, requireLogin });
const express = require("express");

module.exports = function registrarVendedores(app, { pool, requireLogin }) {
  const json = express.json({ limit: "1mb" });

  const limpiarCodigo = (c) => String(c == null ? "" : c).trim().slice(0, 30);
  const limpiarNombre = (n) => String(n == null ? "" : n).trim().slice(0, 200);

  // Lista completa
  app.get("/api/vendedores", requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT codigo, nombre FROM vendedores ORDER BY codigo COLLATE \"C\"");
      res.json({ ok: true, items: rows });
    } catch (e) {
      res.status(500).json({ ok: false, error: "No se pudo leer la lista de vendedores." });
    }
  });

  // Agregar / actualizar uno o varios: { items: [{codigo, nombre}, ...] }
  app.post("/api/vendedores", requireLogin, json, async (req, res) => {
    try {
      const vistos = new Map();
      for (const it of (req.body && req.body.items) || []) {
        const codigo = limpiarCodigo(it && it.codigo);
        if (codigo) vistos.set(codigo.toUpperCase(), { codigo, nombre: limpiarNombre(it.nombre) });
      }
      const lista = [...vistos.values()];
      if (!lista.length) return res.status(400).json({ ok: false, error: "No hay vendedores válidos para guardar." });
      // Si ya existe un código con otra mayúscula/minúscula, se actualiza ese mismo
      await pool.query(
        `INSERT INTO vendedores (codigo, nombre)
         SELECT * FROM UNNEST($1::text[], $2::text[])
         ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, updated_at = NOW()`,
        [lista.map((v) => v.codigo), lista.map((v) => v.nombre)]
      );
      res.json({ ok: true, guardados: lista.length });
    } catch (e) {
      res.status(500).json({ ok: false, error: "No se pudo guardar." });
    }
  });

  // Quitar uno
  app.delete("/api/vendedores/:codigo", requireLogin, async (req, res) => {
    try {
      await pool.query("DELETE FROM vendedores WHERE codigo = $1", [limpiarCodigo(req.params.codigo)]);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: "No se pudo eliminar." });
    }
  });
};
