// Calendario de fechas especiales y reuniones, con alerta a la hora del evento.
// Se conecta desde server.js con:
//   require("./calendario-routes")(app, { pool, requireLogin });
//
// Las fechas se guardan como hora "de pared" (sin zona horaria) en la zona
// configurada en .env con TZ_APP (por defecto America/Bogota).

const express = require("express");
const crypto = require("crypto");

const TZ = process.env.TZ_APP || "America/Bogota";

module.exports = function (app, { pool, requireLogin }) {
  const json = express.json({ limit: "64kb" });

  // Crea la tabla si no existe (no hace falta tocar db.js)
  pool
    .query(
      `CREATE TABLE IF NOT EXISTS calendario_eventos (
         id          SERIAL PRIMARY KEY,
         titulo      TEXT NOT NULL,
         descripcion TEXT NOT NULL DEFAULT '',
         tipo        TEXT NOT NULL DEFAULT 'reunion',
         fecha_hora  TIMESTAMP NOT NULL,
         todo_el_dia BOOLEAN NOT NULL DEFAULT FALSE,
         avisar_min  INTEGER NOT NULL DEFAULT 0,
         avisado_en  TIMESTAMPTZ,
         creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
       )`
    )
    .then(() => pool.query("ALTER TABLE calendario_eventos ADD COLUMN IF NOT EXISTS serie_id TEXT"))
    .then(() =>
      pool.query(
        "CREATE INDEX IF NOT EXISTS calendario_fecha_idx ON calendario_eventos (fecha_hora)"
      )
    )
    .catch((e) => console.error("No se pudo crear la tabla del calendario:", e.message));

  const TIPOS = new Set(["reunion", "especial", "recordatorio"]);

  function leerEvento(body) {
    const titulo = String(body.titulo || "").trim().slice(0, 200);
    const descripcion = String(body.descripcion || "").trim().slice(0, 2000);
    const tipo = TIPOS.has(body.tipo) ? body.tipo : "reunion";
    const todoElDia = body.todo_el_dia === true || body.todo_el_dia === "1" || body.todo_el_dia === "on";
    const fecha = String(body.fecha || "").trim(); // YYYY-MM-DD
    let hora = String(body.hora || "").trim(); // HH:MM
    let avisar = parseInt(body.avisar_min, 10);

    if (!Number.isFinite(avisar) || avisar < 0 || avisar > 10080) avisar = 0;

    if (!titulo) return { error: "El título es obligatorio." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "Elige una fecha válida." };

    if (todoElDia) {
      hora = "09:00"; // los eventos de todo el día avisan a las 9:00 a. m.
    } else if (!/^\d{2}:\d{2}$/.test(hora)) {
      return { error: "Elige una hora válida." };
    }

    return {
      valor: { titulo, descripcion, tipo, todoElDia, fecha, hora, fechaHora: `${fecha} ${hora}:00`, avisar },
    };
  }

  // Fechas de una serie repetida (solo matemática de calendario, sin zonas horarias)
  const MAX_SERIE = 400;

  function fechasSerie(fecha, hasta, modo, dias) {
    const [y, m, d] = fecha.split("-").map(Number);
    const [y2, m2, d2] = hasta.split("-").map(Number);
    const ini = Date.UTC(y, m - 1, d);
    const fin = Date.UTC(y2, m2 - 1, d2);
    const diaInicio = new Date(ini).getUTCDay();
    const elegidos = dias.length ? dias : [diaInicio];
    const out = [];

    for (let t = ini; t <= fin; t += 86400000) {
      const dt = new Date(t);
      const dow = dt.getUTCDay(); // 0 = domingo
      let ok = false;

      if (modo === "semanal") ok = elegidos.includes(dow);
      else if (modo === "diario") ok = true;
      else if (modo === "laborales") ok = dow >= 1 && dow <= 5;
      else if (modo === "mensual") ok = dt.getUTCDate() === d;

      if (ok) out.push(dt.toISOString().slice(0, 10));
      if (out.length > MAX_SERIE) break;
    }
    return out;
  }

  // Página del calendario
  app.get("/calendario", requireLogin, (req, res) => {
    res.render("calendario", { title: "Calendario" });
  });

  // Eventos de un rango (el calendario pide mes por mes)
  app.get("/calendario/api/eventos", requireLogin, async (req, res) => {
    try {
      const desde = String(req.query.desde || "");
      const hasta = String(req.query.hasta || "");

      if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
        return res.status(400).json({ error: "Rango inválido." });
      }

      const { rows } = await pool.query(
        `SELECT id, titulo, descripcion, tipo, todo_el_dia, avisar_min, serie_id,
                to_char(fecha_hora, 'YYYY-MM-DD') AS fecha,
                to_char(fecha_hora, 'HH24:MI')    AS hora
         FROM calendario_eventos
         WHERE fecha_hora >= $1::date AND fecha_hora < ($2::date + 1)
         ORDER BY fecha_hora ASC`,
        [desde, hasta]
      );

      res.set("Cache-Control", "no-store");
      res.json({ eventos: rows });
    } catch (error) {
      console.error("Error leyendo eventos:", error.message);
      res.status(500).json({ error: "No se pudieron leer los eventos." });
    }
  });

  // Próximos eventos (panel lateral de la página)
  app.get("/calendario/api/proximos", requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, titulo, tipo, todo_el_dia,
                to_char(fecha_hora, 'YYYY-MM-DD') AS fecha,
                to_char(fecha_hora, 'HH24:MI')    AS hora
         FROM calendario_eventos
         WHERE fecha_hora >= date_trunc('day', NOW() AT TIME ZONE $1)
         ORDER BY fecha_hora ASC
         LIMIT 8`,
        [TZ]
      );
      res.set("Cache-Control", "no-store");
      res.json({ eventos: rows });
    } catch (error) {
      console.error("Error leyendo próximos eventos:", error.message);
      res.status(500).json({ error: "No se pudieron leer los eventos." });
    }
  });

  // Recordatorios que ya les llegó la hora de avisar (los consulta la alerta global)
  app.get("/calendario/api/pendientes", requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, titulo, descripcion, tipo, todo_el_dia, avisar_min,
                to_char(fecha_hora, 'YYYY-MM-DD') AS fecha,
                to_char(fecha_hora, 'HH24:MI')    AS hora,
                CEIL(EXTRACT(EPOCH FROM (fecha_hora - (NOW() AT TIME ZONE $1))) / 60)::int AS faltan_min
         FROM calendario_eventos
         WHERE avisado_en IS NULL
           AND (fecha_hora - (avisar_min || ' minutes')::interval) <= (NOW() AT TIME ZONE $1)
           AND fecha_hora > (NOW() AT TIME ZONE $1) - interval '1 day'
         ORDER BY fecha_hora ASC
         LIMIT 10`,
        [TZ]
      );
      res.set("Cache-Control", "no-store");
      res.json({ eventos: rows });
    } catch (error) {
      res.status(500).json({ eventos: [] });
    }
  });

  // Marca un evento como ya avisado (para que la alerta no se repita)
  app.post("/calendario/api/:id/avisado", requireLogin, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ ok: false });
      await pool.query(
        "UPDATE calendario_eventos SET avisado_en = NOW() WHERE id = $1 AND avisado_en IS NULL",
        [req.params.id]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  // Posponer una alerta N minutos (vuelve a sonar más tarde)
  app.post("/calendario/api/:id/posponer", requireLogin, json, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ ok: false });
      let min = parseInt(req.body && req.body.min, 10);
      if (!Number.isFinite(min) || min < 1 || min > 1440) min = 5;

      // Se mueve la hora de aviso: fecha_hora pasa a ser ahora + min y se quita el aviso previo
      await pool.query(
        `UPDATE calendario_eventos
         SET fecha_hora = (NOW() AT TIME ZONE $2) + ($3 || ' minutes')::interval,
             avisar_min = 0,
             avisado_en = NULL
         WHERE id = $1`,
        [req.params.id, TZ, String(min)]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  app.post("/calendario/api/agregar", requireLogin, json, async (req, res) => {
    const body = req.body || {};
    const { valor, error } = leerEvento(body);
    if (error) return res.status(400).json({ error });

    try {
      const modo = ["semanal", "diario", "laborales", "mensual"].includes(body.repetir) ? body.repetir : "no";

      // Evento único
      if (modo === "no") {
        const { rows } = await pool.query(
          `INSERT INTO calendario_eventos (titulo, descripcion, tipo, fecha_hora, todo_el_dia, avisar_min)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [valor.titulo, valor.descripcion, valor.tipo, valor.fechaHora, valor.todoElDia, valor.avisar]
        );
        return res.json({ ok: true, id: rows[0].id, creados: 1 });
      }

      // Serie repetida
      const hasta = String(body.hasta || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
        return res.status(400).json({ error: "Elige hasta qué fecha se repite." });
      }
      if (hasta < valor.fecha) {
        return res.status(400).json({ error: "La fecha final debe ser igual o posterior a la fecha de inicio." });
      }

      const dias = (Array.isArray(body.dias) ? body.dias : [])
        .map((n) => parseInt(n, 10))
        .filter((n) => n >= 0 && n <= 6);

      const fechas = fechasSerie(valor.fecha, hasta, modo, dias);

      if (!fechas.length) {
        return res.status(400).json({ error: "Con esas opciones no cae ningún día en el rango elegido." });
      }
      if (fechas.length > MAX_SERIE) {
        return res.status(400).json({ error: `Son demasiados eventos (máximo ${MAX_SERIE}). Acorta la fecha final.` });
      }

      const serie = crypto.randomUUID();

      await pool.query(
        `INSERT INTO calendario_eventos (titulo, descripcion, tipo, fecha_hora, todo_el_dia, avisar_min, serie_id)
         SELECT $1::text, $2::text, $3::text, (f::date + $4::time), $5::boolean, $6::integer, $7::text
         FROM unnest($8::text[]) AS f`,
        [valor.titulo, valor.descripcion, valor.tipo, valor.hora, valor.todoElDia, valor.avisar, serie, fechas]
      );

      res.json({ ok: true, creados: fechas.length, serie });
    } catch (e) {
      console.error("Error agregando evento:", e.message);
      res.status(500).json({ error: "No se pudo guardar el evento." });
    }
  });

  app.post("/calendario/api/:id/actualizar", requireLogin, json, async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Id inválido." });

    const { valor, error } = leerEvento(req.body || {});
    if (error) return res.status(400).json({ error });

    try {
      // avisado_en vuelve a NULL para que la alerta suene con la nueva fecha/hora
      const { rowCount } = await pool.query(
        `UPDATE calendario_eventos
         SET titulo = $2, descripcion = $3, tipo = $4, fecha_hora = $5,
             todo_el_dia = $6, avisar_min = $7, avisado_en = NULL
         WHERE id = $1`,
        [req.params.id, valor.titulo, valor.descripcion, valor.tipo, valor.fechaHora, valor.todoElDia, valor.avisar]
      );
      if (!rowCount) return res.status(404).json({ error: "Ese evento ya no existe." });
      res.json({ ok: true });
    } catch (e) {
      console.error("Error actualizando evento:", e.message);
      res.status(500).json({ error: "No se pudo actualizar el evento." });
    }
  });

  // Elimina todos los eventos de la misma serie (por ejemplo, todos los viernes)
  app.post("/calendario/api/:id/eliminar-serie", requireLogin, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ ok: false });
      const { rowCount } = await pool.query(
        `DELETE FROM calendario_eventos
         WHERE serie_id IS NOT NULL
           AND serie_id = (SELECT serie_id FROM calendario_eventos WHERE id = $1)`,
        [req.params.id]
      );
      res.json({ ok: true, eliminados: rowCount });
    } catch (e) {
      console.error("Error eliminando serie:", e.message);
      res.status(500).json({ ok: false });
    }
  });

  app.post("/calendario/api/:id/eliminar", requireLogin, async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ ok: false });
      await pool.query("DELETE FROM calendario_eventos WHERE id = $1", [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      console.error("Error eliminando evento:", e.message);
      res.status(500).json({ ok: false });
    }
  });
};
