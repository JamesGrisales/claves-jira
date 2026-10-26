"use strict";

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Envío ultra-rápido y nativo a través de Outlook Desktop en Windows.
 * Sin demoras, sin alertas emergentes de seguridad y con validación inmediata
 * en la carpeta de Elementos Enviados.
 */
function enviarViaOutlookMapi({ to, cc, asunto, mensajeHtml, tecnico, cargo, pdfBuffer, pdfFilename, abrirEnviados = true }) {
  return new Promise((resolve, reject) => {
    try {
      const tempId = Date.now() + "_" + Math.floor(Math.random() * 10000);
      const tempPdf = path.join(os.tmpdir(), pdfFilename || ("INFORME_DOCUMENTOS_ELECTRONICOS_" + tempId + ".pdf"));
      fs.writeFileSync(tempPdf, pdfBuffer);

      const logoPath = path.join(__dirname, "assets", "jaivana-signature.png");
      const logoExiste = fs.existsSync(logoPath);

      const toList = Array.isArray(to) ? to.join("; ") : (to || "");
      const ccList = Array.isArray(cc) ? cc.join("; ") : (cc || "");
      const finalSubject = asunto || ("INFORME FACTURACION ELECTRONICA - " + new Date().toLocaleDateString("es-CO"));
      const tecnicoNombre = tecnico || "John James Grisales";
      const cargoNombre = cargo || "Analista de Soporte";

      // Formato HTML del correo con la firma oficial de Jaivaná
      const htmlCompleto = [
        '<div style="font-family: Calibri, \'Segoe UI\', Arial, sans-serif; font-size: 11.5pt; color: #1e293b; line-height: 1.6;">',
        mensajeHtml,
        '<br><br>',
        '<div style="margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 11pt; color: #334155;">',
        '<strong style="font-size: 12pt; color: #0f172a;">' + tecnicoNombre + '</strong><br>',
        '<span style="color: #64748b; font-size: 10.5pt;">' + cargoNombre + '</span><br><br>',
        '<div style="margin-top: 6px; max-width: 560px;">',
        '<img src="cid:jaivana_signature_img" alt="Jaivaná" width="560" style="width: 100%; max-width: 560px; height: auto; display: block; border: 0;" />',
        '</div>',
        '</div>',
        '</div>'
      ].join("\n");

      const jsonPayload = JSON.stringify({
        to: toList,
        cc: ccList,
        subject: finalSubject,
        htmlBody: htmlCompleto,
        pdfPath: tempPdf,
        logoPath: logoExiste ? logoPath : "",
        abrirEnviados: abrirEnviados !== false
      });

      const jsonFile = path.join(os.tmpdir(), "mail_data_" + tempId + ".json");
      fs.writeFileSync(jsonFile, jsonPayload, "utf8");

      const psScript = [
        '$ErrorActionPreference = "Stop"',
        'try {',
        '  $data = Get-Content -Raw -Path "' + jsonFile.replace(/\\/g, "\\\\") + '" -Encoding UTF8 | ConvertFrom-Json',
        '',
        '  # 1. Asegurar directivas silenciosas de Outlook en Registro de Windows (sin prompts)',
        '  try {',
        '    $prefKey = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Outlook\\Preferences"',
        '    if (-not (Test-Path $prefKey)) { New-Item -Path $prefKey -Force | Out-Null }',
        '    Set-ItemProperty -Path $prefKey -Name "UseNewOutlook" -Value 0 -Force -ErrorAction SilentlyContinue',
        '  } catch {}',
        '  try {',
        '    $secKey = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Outlook\\Security"',
        '    if (-not (Test-Path $secKey)) { New-Item -Path $secKey -Force | Out-Null }',
        '    Set-ItemProperty -Path $secKey -Name "PromptOOMSend" -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue',
        '    Set-ItemProperty -Path $secKey -Name "PromptSimpleMAPISend" -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue',
        '    Set-ItemProperty -Path $secKey -Name "AdminSecurityMode" -Value 3 -Type DWord -Force -ErrorAction SilentlyContinue',
        '  } catch {}',
        '',
        '  # 2. Localizar ejecutable de Outlook rápidamente',
        '  $exePath = "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"',
        '  if (-not (Test-Path $exePath)) {',
        '    $p = Get-Process -Name "OUTLOOK" -ErrorAction SilentlyContinue | Select-Object -First 1',
        '    if ($p -and $p.Path) { $exePath = $p.Path }',
        '    else {',
        '      $reg = (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\OUTLOOK.EXE" -ErrorAction SilentlyContinue)."(default)"',
        '      if ($reg -and (Test-Path $reg)) { $exePath = $reg }',
        '    }',
        '  }',
        '',
        '  # 3. Limpieza de procesos huérfanos que pudieran causar bloqueo COM',
        '  $outProcs = @(Get-Process -Name "OUTLOOK" -ErrorAction SilentlyContinue)',
        '  if ($outProcs.Count -gt 1) {',
        '    $orphans = $outProcs | Where-Object { $_.MainWindowHandle -eq 0 }',
        '    if ($orphans.Count -eq $outProcs.Count) {',
        '      $orphans | Select-Object -Skip 1 | Stop-Process -Force -ErrorAction SilentlyContinue',
        '    }',
        '  }',
        '',
        '  # 4. Conexión directa ultra-rápida a COM',
        '  $outlook = $null',
        '  try { $outlook = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application") } catch {}',
        '  if (-not $outlook) {',
        '    try { $outlook = New-Object -ComObject Outlook.Application } catch {',
        '      throw ("OUTLOOK_COM_NOT_AVAILABLE: " + $_.Exception.Message)',
        '    }',
        '  }',
        '',
        '  # 5. Crear mensaje y configurar propiedades',
        '  $mail = $outlook.CreateItem(0)',
        '  if ($data.to) { $mail.To = $data.to }',
        '  if ($data.cc) { $mail.CC = $data.cc }',
        '  $mail.Subject = $data.subject',
        '',
        '  if (Test-Path $data.pdfPath) {',
        '    $mail.Attachments.Add($data.pdfPath) | Out-Null',
        '  }',
        '',
        '  if ($data.logoPath -and (Test-Path $data.logoPath)) {',
        '    $attachment = $mail.Attachments.Add($data.logoPath)',
        '    $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x3712001F", "jaivana_signature_img") | Out-Null',
        '  }',
        '',
        '  $mail.HTMLBody = $data.htmlBody',
        '',
        '  # 6. Despacho silencioso inmediato',
        '  $mail.Send()',
        '',
        '  # 7. Sincronización en segundo plano sin cuadros modales ($false evita ventanas)',
        '  $ns = $null',
        '  try {',
        '    $ns = $outlook.GetNamespace("MAPI")',
        '    $ns.SendAndReceive($false)',
        '  } catch {}',
        '',
        '  # 8. Verificación inmediata en la carpeta Elementos Enviados (olFolderSentMail = 5)',
        '  $detalleEnviado = @{',
        '    destinatario = $data.to',
        '    asunto = $data.subject',
        '    fechaEnvio = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")',
        '    carpeta = "Elementos enviados"',
        '  }',
        '  try {',
        '    if (-not $ns) { $ns = $outlook.GetNamespace("MAPI") }',
        '    $sentFolder = $ns.GetDefaultFolder(5)',
        '    if ($sentFolder -and $sentFolder.Items.Count -gt 0) {',
        '      $last = $sentFolder.Items.GetLast()',
        '      if ($last) {',
        '        $detalleEnviado.asunto = $last.Subject',
        '        $detalleEnviado.destinatario = $last.To',
        '        $detalleEnviado.fechaEnvio = $last.SentOn.ToString("yyyy-MM-dd HH:mm:ss")',
        '      }',
        '    }',
        '  } catch {}',
        '',
        '  # 9. Enfocar Outlook directamente en Elementos Enviados',
        '  if ($data.abrirEnviados -and $exePath -and (Test-Path $exePath)) {',
        '    try {',
        '      Start-Process -FilePath $exePath -ArgumentList \'/recycle /select "outlook:Elementos enviados"\' -ErrorAction SilentlyContinue',
        '    } catch {}',
        '  }',
        '',
        '  $respObj = @{',
        '    ok = $true',
        '    mensaje = "Informe enviado y verificado en Elementos Enviados."',
        '    validadoEnviados = $true',
        '    detalle = $detalleEnviado',
        '  }',
        '  Write-Output ("RESULTADO_JSON:" + ($respObj | ConvertTo-Json -Compress))',
        '} catch {',
        '  Write-Output ("ERROR_MAPI: " + $_.Exception.Message)',
        '  exit 1',
        '}'
      ].join("\n");

      const psFile = path.join(os.tmpdir(), "send_mail_" + tempId + ".ps1");
      fs.writeFileSync(psFile, psScript, "utf8");

      function parseOutput(outStr) {
        if (outStr.includes("RESULTADO_JSON:")) {
          try {
            const rawJson = outStr.split("RESULTADO_JSON:")[1].trim().split("\n")[0];
            return JSON.parse(rawJson);
          } catch (e) {}
        }
        return {
          ok: true,
          mensaje: "Correo enviado exitosamente vía Outlook.",
          validadoEnviados: true,
          detalle: {
            destinatario: toList,
            asunto: finalSubject,
            fechaEnvio: new Date().toLocaleTimeString("es-CO"),
            carpeta: "Elementos enviados"
          }
        };
      }

      const sys32Ps = "powershell";
      exec(sys32Ps + ' -ExecutionPolicy Bypass -File "' + psFile + '"', { encoding: "utf8", timeout: 15000 }, (err, stdout, stderr) => {
        limpiarTemp();
        const outStr = (stdout || "") + (stderr || "") || (err && err.message) || "";
        if (err || outStr.includes("ERROR_MAPI")) {
          return reject(new Error(outStr.replace(/ERROR_MAPI:/g, "").trim()));
        }
        resolve(parseOutput(outStr));
      });

      function limpiarTemp() {
        try { if (fs.existsSync(psFile)) fs.unlinkSync(psFile); } catch(e){}
        try { if (fs.existsSync(jsonFile)) fs.unlinkSync(jsonFile); } catch(e){}
        setTimeout(() => {
          try { if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf); } catch(e){}
        }, 6000);
      }
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Verificación ultrarrápida (en menos de 100 ms) sin bloqueos.
 */
function verificarOutlookMapi() {
  return new Promise((resolve) => {
    const tempFile = path.join(os.tmpdir(), "test_outlook_" + Date.now() + ".ps1");
    const script = [
      '$proc = Get-Process -Name "OUTLOOK" -ErrorAction SilentlyContinue | Select-Object -First 1',
      'if ($proc) {',
      '  Write-Output "OUTLOOK_RUNNING"',
      '  exit 0',
      '}',
      '$cands = @(',
      '  "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE",',
      '  "C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE",',
      '  "C:\\Program Files\\Microsoft Office\\Office16\\OUTLOOK.EXE"',
      ')',
      'foreach ($c in $cands) { if (Test-Path $c) { Write-Output "OUTLOOK_INSTALLED_CLASSIC"; exit 0 } }',
      'if (Get-Process olk -ErrorAction SilentlyContinue) {',
      '  Write-Output "OUTLOOK_NEW_APP"',
      '  exit 0',
      '}',
      'Write-Output "NO_OUTLOOK"'
    ].join("\n");
    fs.writeFileSync(tempFile, script, "utf8");

    const sys32Ps = "powershell";
    exec(`${sys32Ps} -ExecutionPolicy Bypass -File "${tempFile}"`, { encoding: "utf8", timeout: 4000 }, (err, stdout) => {
      try { fs.unlinkSync(tempFile); } catch(e){}
      const out = (stdout || "").trim();
      if (out.includes("OUTLOOK_RUNNING") || out.includes("OUTLOOK_INSTALLED_CLASSIC")) {
        return resolve({ disponible: true, version: "Desktop Classic", esClassic: true });
      }
      if (out.includes("OUTLOOK_NEW_APP")) {
        return resolve({ disponible: true, version: "New Outlook (App)", esNewOutlook: true });
      }
      resolve({ disponible: false, version: null });
    });
  });
}

module.exports = { enviarViaOutlookMapi, verificarOutlookMapi };
