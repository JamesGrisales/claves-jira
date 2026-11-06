"use strict";

const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const util = require("util");
const execFile = util.promisify(cp.execFile);

/**
 * Sincroniza las reuniones y citas asignadas en Outlook Desktop con la Bóveda de Claves.
 * Realiza un UPSERT basado en el EntryID único de Outlook para evitar duplicados.
 *
 * Optimizado:
 *  - Ejecución asíncrona directa con powershell.exe (sin intermediario cmd.exe).
 *  - Detección dinámica del formato regional de fecha de Windows (evita conflictos dd/MM vs MM/dd).
 *  - Liberación explícita de punteros COM RCW (ReleaseComObject) para evitar cuelgues RPC al salir.
 *  - Salida JSON en archivo UTF-8 sin BOM para máxima fidelidad y velocidad.
 *  - Transacción atómica en PostgreSQL para actualización ultra-rápida.
 */
async function sincronizarReunionesOutlook(pool, opciones = {}) {
  const diasAtras = opciones.diasAtras || 180;
  const diasAdelante = opciones.diasAdelante || 180;

  const tempId = Date.now() + "_" + Math.floor(Math.random() * 10000);
  const psFile = path.join(os.tmpdir(), "sync_outlook_calendar_" + tempId + ".ps1");
  const jsonOutputFile = path.join(os.tmpdir(), "sync_outlook_calendar_" + tempId + ".json");

  const psScript = `
$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$outlook = $null
try { $outlook = [System.Runtime.InteropServices.Marshal]::GetActiveObject('Outlook.Application') } catch {}
if (-not $outlook) {
  try { $outlook = New-Object -ComObject Outlook.Application } catch {
    [System.IO.File]::WriteAllText("${jsonOutputFile.replace(/\\/g, "\\\\")}", '{"error": "NO_OUTLOOK_APP"}', $utf8NoBom)
    exit
  }
}

$namespace = $outlook.GetNamespace('MAPI')
$calendar = $namespace.GetDefaultFolder(9) # olFolderCalendar = 9
$items = $calendar.Items
$items.IncludeRecurrences = $true
$items.Sort('[Start]')

$shortDate = [System.Globalization.DateTimeFormatInfo]::CurrentInfo.ShortDatePattern
$startFilter = (Get-Date).AddDays(-${diasAtras}).ToString("$shortDate 00:00")
$endFilter = (Get-Date).AddDays(${diasAdelante}).ToString("$shortDate 23:59")
$filtered = $items.Restrict("[Start] >= '$startFilter' AND [Start] <= '$endFilter'")

$res = [System.Collections.Generic.List[object]]::new()
foreach ($item in $filtered) {
  $subj = if ($item.Subject) { $item.Subject.Trim() } else { '(Sin Asunto)' }
  $org = try { if ($item.Organizer) { $item.Organizer.Trim() } else { '' } } catch { '' }
  $avisar = try { if ($item.ReminderSet) { [int]$item.ReminderMinutesBeforeStart } else { 0 } } catch { 0 }
  $bodyClean = ''
  try {
    if ($item.Body) {
      $bodyClean = ($item.Body -replace '\\r?\\n', '\\n').Trim()
      if ($bodyClean.Length -gt 1500) { $bodyClean = $bodyClean.Substring(0, 1500) }
    }
  } catch {}

  $res.Add([PSCustomObject]@{
    Subject = $subj
    Start = $item.Start.ToString('yyyy-MM-dd HH:mm:ss')
    AllDay = [bool]$item.AllDayEvent
    Body = $bodyClean
    EntryID = $item.EntryID
    Organizer = $org
    ReminderMin = $avisar
  })

  # Liberar referencia COM inmediata de cada elemento para evitar bloqueo STA / RPC al salir
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($item) | Out-Null
}

# Liberar referencias COM primarias
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($filtered) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($items) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($calendar) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($namespace) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($outlook) | Out-Null
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

$json = $res | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("${jsonOutputFile.replace(/\\/g, "\\\\")}", $json, $utf8NoBom)
`;

  try {
    fs.writeFileSync(psFile, psScript, "utf8");

    await execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", psFile],
      { timeout: 90000, maxBuffer: 25 * 1024 * 1024, windowsHide: true }
    );

    if (!fs.existsSync(jsonOutputFile)) {
      return { ok: true, total: 0, sincronizados: 0 };
    }

    const raw = fs.readFileSync(jsonOutputFile, "utf8").trim().replace(/^\uFEFF/, "");
    if (!raw) return { ok: true, total: 0, sincronizados: 0 };

    if (raw.includes("NO_OUTLOOK_APP")) {
      return { ok: false, error: "Outlook no está abierto en este equipo. Por favor abre Outlook e intenta nuevamente." };
    }

    let parsed = JSON.parse(raw);
    const reuniones = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);

    let insertados = 0;
    let actualizados = 0;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const q = `
        INSERT INTO calendario_eventos (
          titulo, descripcion, tipo, fecha_hora, todo_el_dia, avisar_min, outlook_id, organizador
        )
        VALUES ($1, $2, 'reunion', $3::timestamp, $4, $5, $6, $7)
        ON CONFLICT (outlook_id) WHERE outlook_id IS NOT NULL
        DO UPDATE SET
          titulo = EXCLUDED.titulo,
          descripcion = EXCLUDED.descripcion,
          fecha_hora = EXCLUDED.fecha_hora,
          todo_el_dia = EXCLUDED.todo_el_dia,
          avisar_min = EXCLUDED.avisar_min,
          organizador = EXCLUDED.organizador
        RETURNING (xmax = 0) AS es_nuevo
      `;

      for (const r of reuniones) {
        if (!r.EntryID || !r.Start) continue;

        const values = [
          r.Subject || "Reunión Outlook",
          r.Body || "",
          r.Start,
          !!r.AllDay,
          Math.max(0, parseInt(r.ReminderMin, 10) || 0),
          r.EntryID,
          r.Organizer || ""
        ];

        try {
          const resDb = await client.query(q, values);

          // Detección automática de turnos de disponibilidad semanales
          if (r.Subject && /disponib/i.test(r.Subject) && !/cancel/i.test(r.Subject)) {
            try {
              const startDateStr = r.Start.split(" ")[0];
              const dStart = new Date(startDateStr + "T00:00:00");
              const dEnd = new Date(dStart.getTime());
              dEnd.setDate(dEnd.getDate() + 6);
              const endDateStr =
                dEnd.getFullYear() +
                "-" +
                String(dEnd.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(dEnd.getDate()).padStart(2, "0");

              await client.query(
                `
                INSERT INTO turnos_disponibilidad (usuario, fecha_inicio, fecha_fin, notas)
                VALUES ($1, $2::date, $3::date, $4)
                ON CONFLICT (usuario, fecha_inicio, fecha_fin) DO UPDATE SET activo = TRUE, notas = EXCLUDED.notas
              `,
                [r.Organizer || "James Grisales", startDateStr, endDateStr, r.Subject]
              );
            } catch (errDisp) {}
          }

          if (resDb.rows.length > 0) {
            if (resDb.rows[0].es_nuevo) insertados++;
            else actualizados++;
          }
        } catch (errDb) {
          console.error("Error guardando reunión Outlook:", r.Subject, errDb.message);
        }
      }

      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    return {
      ok: true,
      total: reuniones.length,
      insertados,
      actualizados
    };
  } catch (err) {
    console.error("Error sincronizando calendario de Outlook:", err.message);
    return { ok: false, error: err.message };
  } finally {
    try { fs.unlinkSync(psFile); } catch (e) {}
    try { fs.unlinkSync(jsonOutputFile); } catch (e) {}
  }
}

module.exports = { sincronizarReunionesOutlook };
