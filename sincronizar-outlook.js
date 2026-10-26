"use strict";

const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Sincroniza las reuniones y citas asignadas en Outlook Desktop con la Bóveda de Claves.
 * Realiza un UPSERT basado en el EntryID único de Outlook para evitar duplicados.
 */
async function sincronizarReunionesOutlook(pool, opciones = {}) {
  const diasAtras = opciones.diasAtras || 365;
  const diasAdelante = opciones.diasAdelante || 180;

  const tempId = Date.now() + "_" + Math.floor(Math.random() * 10000);
  const psFile = path.join(os.tmpdir(), "sync_outlook_calendar_" + tempId + ".ps1");

  const psScript = `
$ErrorActionPreference = 'Stop'
$outlook = $null
try { $outlook = [System.Runtime.InteropServices.Marshal]::GetActiveObject('Outlook.Application') } catch {}
if (-not $outlook) {
  try { $outlook = New-Object -ComObject Outlook.Application } catch {
    Write-Output '{"error": "NO_OUTLOOK_APP"}'
    exit
  }
}

$namespace = $outlook.GetNamespace('MAPI')
$calendar = $namespace.GetDefaultFolder(9) # olFolderCalendar = 9
$items = $calendar.Items
$items.IncludeRecurrences = $true
$items.Sort('[Start]')

$startFilter = (Get-Date).AddDays(-${diasAtras}).ToString('MM/dd/yyyy 00:00')
$endFilter = (Get-Date).AddDays(${diasAdelante}).ToString('MM/dd/yyyy 23:59')
$filtered = $items.Restrict("[Start] >= '$startFilter' AND [Start] <= '$endFilter'")

$res = @()
foreach ($item in $filtered) {
  $bodyClean = ''
  if ($item.Body) {
    $bodyClean = ($item.Body -replace '\\r?\\n', '\\n').Trim()
    if ($bodyClean.Length -gt 3000) { $bodyClean = $bodyClean.Substring(0, 3000) }
  }

  $subj = if ($item.Subject) { $item.Subject.Trim() } else { '(Sin Asunto)' }
  $org = if ($item.Organizer) { $item.Organizer.Trim() } else { '' }
  $avisar = if ($item.ReminderSet) { [int]$item.ReminderMinutesBeforeStart } else { 0 }

  $res += [PSCustomObject]@{
    Subject = $subj
    Start = $item.Start.ToString('yyyy-MM-dd HH:mm:ss')
    AllDay = [bool]$item.AllDayEvent
    Body = $bodyClean
    EntryID = $item.EntryID
    Organizer = $org
    ReminderMin = $avisar
  }
}

$res | ConvertTo-Json -Compress
`;

  try {
    fs.writeFileSync(psFile, psScript, "utf8");

    const stdout = cp.execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`,
      { timeout: 35000, maxBuffer: 10 * 1024 * 1024 }
    ).toString();

    let raw = stdout.trim();
    if (!raw) return { ok: true, total: 0, sincronizados: 0 };
    if (raw.includes("NO_OUTLOOK_APP")) {
      return { ok: false, error: "Outlook no está abierto en este equipo. Por favor abre Outlook e intenta nuevamente." };
    }

    let parsed = JSON.parse(raw);
    const reuniones = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);

    let insertados = 0;
    let actualizados = 0;

    for (const r of reuniones) {
      if (!r.EntryID || !r.Start) continue;

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
        const resDb = await pool.query(q, values);
        
      // Detección automática de turnos de disponibilidad semanales
      if (r.Subject && /disponib/i.test(r.Subject) && !/cancel/i.test(r.Subject)) {
        try {
          const startDateStr = r.Start.split(' ')[0];
          const dStart = new Date(startDateStr + 'T00:00:00');
          const dEnd = new Date(dStart.getTime());
          dEnd.setDate(dEnd.getDate() + 6);
          const endDateStr = dEnd.getFullYear() + '-' + String(dEnd.getMonth() + 1).padStart(2, '0') + '-' + String(dEnd.getDate()).padStart(2, '0');
          await pool.query(`
            INSERT INTO turnos_disponibilidad (usuario, fecha_inicio, fecha_fin, notas)
            VALUES ($1, $2::date, $3::date, $4)
            ON CONFLICT (usuario, fecha_inicio, fecha_fin) DO UPDATE SET activo = TRUE, notas = EXCLUDED.notas
          `, [r.Organizer || 'James Grisales', startDateStr, endDateStr, r.Subject]);
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
  }
}

module.exports = { sincronizarReunionesOutlook };
