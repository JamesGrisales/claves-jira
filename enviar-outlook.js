"use strict";

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Envía un correo directamente a través de la sesión activa de Outlook en Windows.
 * No requiere contraseña, ni SMTP, ni autenticador, porque utiliza el perfil
 * autenticado de Outlook en el equipo local.
 */
function enviarViaOutlookMapi({ to, cc, asunto, mensajeHtml, tecnico, cargo, pdfBuffer, pdfFilename }) {
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

      // Formato HTML del correo con la firma oficial de Jaivaná en tamaño adecuado (banner ancho)
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
        logoPath: logoExiste ? logoPath : ""
      });

      const jsonFile = path.join(os.tmpdir(), "mail_data_" + tempId + ".json");
      fs.writeFileSync(jsonFile, jsonPayload, "utf8");

      const psScript = [
        '$ErrorActionPreference = "Stop"',
        'try {',
        '  $data = Get-Content -Raw -Path "' + jsonFile.replace(/\\/g, "\\\\") + '" -Encoding UTF8 | ConvertFrom-Json',
        '',
        '  # 1. Limpiar claves corruptas en HKCU si existen',
        '  try {',
        '    Remove-Item -Path "HKCU:\\Software\\Classes\\CLSID\\{0006F03A-0000-0000-C000-000000000046}" -Recurse -Force -ErrorAction SilentlyContinue',
        '    Remove-Item -Path "HKCU:\\Software\\Classes\\Outlook.Application" -Recurse -Force -ErrorAction SilentlyContinue',
        '  } catch {}',
        '',
        '  # 2. Desactivar redirección de New Outlook hacia Classic Outlook',
        '  try {',
        '    $prefKey = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Outlook\\Preferences"',
        '    if (-not (Test-Path $prefKey)) { New-Item -Path $prefKey -Force | Out-Null }',
        '    Set-ItemProperty -Path $prefKey -Name "UseNewOutlook" -Value 0 -Force -ErrorAction SilentlyContinue',
        '  } catch {}',
        '',
        '  # 3. Intentar conectar directamente al objeto COM de Outlook (si ya está corriendo o registrado)',
        '  $outlook = $null',
        '  $lastComErr = ""',
        '',
        '  try { $outlook = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application") } catch { $lastComErr = $_.Exception.Message }',
        '  if (-not $outlook) {',
        '    try { $outlook = New-Object -ComObject Outlook.Application } catch { $lastComErr = $_.Exception.Message }',
        '  }',
        '  if (-not $outlook) {',
        '    try {',
        '      $t = [Type]::GetTypeFromProgID("Outlook.Application")',
        '      if ($t) { $outlook = [Activator]::CreateInstance($t) }',
        '    } catch { $lastComErr = $_.Exception.Message }',
        '  }',
        '  if (-not $outlook) {',
        '    try {',
        '      $t = [Type]::GetTypeFromCLSID([Guid]"0006F03A-0000-0000-C000-000000000046")',
        '      if ($t) { $outlook = [Activator]::CreateInstance($t) }',
        '    } catch { $lastComErr = $_.Exception.Message }',
        '  }',
        '',
        '  # 4. Si aún no conecta, buscar OUTLOOK.EXE e iniciarlo',
        '  if (-not $outlook) {',
        '    $exePath = $null',
        '    $proc = Get-Process -Name "OUTLOOK" -ErrorAction SilentlyContinue | Select-Object -First 1',
        '    if ($proc -and $proc.Path -and (Test-Path $proc.Path)) {',
        '      $exePath = $proc.Path',
        '    }',
        '',
        '    if (-not $exePath) {',
        '      $cand = @(',
        '        (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\OUTLOOK.EXE" -ErrorAction SilentlyContinue)."(default)",',
        '        (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\OUTLOOK.EXE" -ErrorAction SilentlyContinue)."(default)",',
        '        (Get-ItemProperty -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\OUTLOOK.EXE" -ErrorAction SilentlyContinue)."(default)",',
        '        (Get-ItemProperty -Path "HKCU:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\OUTLOOK.EXE" -ErrorAction SilentlyContinue)."(default)",',
        '        "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE",',
        '        "C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE",',
        '        "C:\\Program Files\\Microsoft Office\\Office16\\OUTLOOK.EXE",',
        '        "C:\\Program Files (x86)\\Microsoft Office\\Office16\\OUTLOOK.EXE",',
        '        "C:\\Program Files\\Microsoft Office\\root\\Office15\\OUTLOOK.EXE",',
        '        "C:\\Program Files (x86)\\Microsoft Office\\root\\Office15\\OUTLOOK.EXE",',
        '        "C:\\Program Files\\Microsoft Office\\Office15\\OUTLOOK.EXE",',
        '        "C:\\Program Files (x86)\\Microsoft Office\\Office15\\OUTLOOK.EXE",',
        '        "$env:LOCALAPPDATA\\Microsoft\\Office\\root\\Office16\\OUTLOOK.EXE",',
        '        "$env:ProgramFiles\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"',
        '      )',
        '      foreach ($c in $cand) {',
        '        if ($c -and (Test-Path $c)) { $exePath = $c; break }',
        '      }',
        '      if (-not $exePath) {',
        '        try {',
        '          $gcmd = Get-Command "outlook.exe" -ErrorAction SilentlyContinue',
        '          if ($gcmd -and $gcmd.Source -and (Test-Path $gcmd.Source)) { $exePath = $gcmd.Source }',
        '        } catch {}',
        '      }',
        '    }',
        '',
        '    if ($exePath) {',
        '      try { Start-Process -FilePath $exePath -ArgumentList "/recycle" -WindowStyle Minimized } catch {}',
        '      for ($k = 0; $k -lt 16; $k++) {',
        '        Start-Sleep -Milliseconds 600',
        '        try { $outlook = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application") } catch { $lastComErr = $_.Exception.Message }',
        '        if ($outlook) { break }',
        '        try { $outlook = New-Object -ComObject Outlook.Application } catch { $lastComErr = $_.Exception.Message }',
        '        if ($outlook) { break }',
        '      }',
        '    }',
        '  }',
        '',
        '  if (-not $outlook) {',
        '    throw ("OUTLOOK_COM_NOT_AVAILABLE: " + $lastComErr)',
        '  }',
        '',
        '  # 5. Crear el elemento de correo y enviar',
        '  $mail = $outlook.CreateItem(0)',
        '',
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
        '    try {',
        '      $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x7FFE000B", $true) | Out-Null',
        '    } catch {}',
        '  }',
        '',
        '  $mail.HTMLBody = $data.htmlBody',
        '',
        '  $mail.Send()',
        '  Write-Output "ENVIADO_EXITOSO"',
        '} catch {',
        '  Write-Output ("ERROR_MAPI: " + $_.Exception.Message)',
        '  exit 1',
        '}'
      ].join("\n");

      const psFile = path.join(os.tmpdir(), "send_mail_" + tempId + ".ps1");
      fs.writeFileSync(psFile, psScript, "utf8");

      const sys32Ps = "powershell";
      const sys64Ps = "C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe";

      // 1. Intentar primero con el PowerShell estándar
      exec(sys32Ps + ' -ExecutionPolicy Bypass -File "' + psFile + '"', { encoding: "utf8" }, (err, stdout, stderr) => {
        const outStr = (stdout || "") + (stderr || "") || (err && err.message) || "";

        // Si falló y existe el PowerShell de 32 bits (SysWOW64), reintentar automáticamente con 32 bits (Office 32-bit en Windows 64-bit)
        if ((err || outStr.includes("ERROR_MAPI")) && fs.existsSync(sys64Ps)) {
          exec('"' + sys64Ps + '" -ExecutionPolicy Bypass -File "' + psFile + '"', { encoding: "utf8" }, (err32, stdout32, stderr32) => {
            limpiarTemp();
            const out32 = (stdout32 || "") + (stderr32 || "") || (err32 && err32.message) || "";
            if (err32 || out32.includes("ERROR_MAPI")) {
              return reject(new Error(out32.replace(/ERROR_MAPI:/g, "").trim()));
            }
            resolve({ ok: true, mensaje: "Correo enviado exitosamente vía Outlook (32-bit)." });
          });
          return;
        }

        limpiarTemp();

        if (err || outStr.includes("ERROR_MAPI")) {
          return reject(new Error(outStr.replace(/ERROR_MAPI:/g, "").trim()));
        }

        resolve({ ok: true, mensaje: "Correo enviado exitosamente vía Outlook." });
      });

      function limpiarTemp() {
        try { if (fs.existsSync(psFile)) fs.unlinkSync(psFile); } catch(e){}
        try { if (fs.existsSync(jsonFile)) fs.unlinkSync(jsonFile); } catch(e){}
        setTimeout(() => {
          try { if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf); } catch(e){}
        }, 8000);
      }
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Verifica si Outlook Desktop (MAPI COM) está instalado y disponible en Windows.
 */
function verificarOutlookMapi() {
  return new Promise((resolve) => {
    const tempFile = path.join(os.tmpdir(), "test_outlook_" + Date.now() + ".ps1");
    const script = [
      '$o = $null',
      'try { $o = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application") } catch {}',
      'if (-not $o) { try { $o = New-Object -ComObject Outlook.Application } catch {} }',
      'if (-not $o) {',
      '  try {',
      '    $t = [Type]::GetTypeFromCLSID([Guid]"0006F03A-0000-0000-C000-000000000046")',
      '    if ($t) { $o = [Activator]::CreateInstance($t) }',
      '  } catch {}',
      '}',
      'if ($o) {',
      '  Write-Output ("OUTLOOK_VERSION=" + $o.Version)',
      '} else {',
      '  if (Get-Process olk -ErrorAction SilentlyContinue) {',
      '    Write-Output "OUTLOOK_NEW_APP"',
      '  } else {',
      '    Write-Output "NO_OUTLOOK"',
      '  }',
      '}'
    ].join("\n");
    fs.writeFileSync(tempFile, script, "utf8");

    const sys32Ps = "powershell";
    const sys64Ps = "C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe";

    exec(`${sys32Ps} -ExecutionPolicy Bypass -File "${tempFile}"`, { encoding: "utf8", timeout: 7000 }, (err, stdout) => {
      const out = (stdout || "").trim();
      if (out.includes("OUTLOOK_VERSION=")) {
        try { fs.unlinkSync(tempFile); } catch(e){}
        const ver = out.split("OUTLOOK_VERSION=")[1].trim();
        return resolve({ disponible: true, version: ver, esClassic: true });
      }

      if (fs.existsSync(sys64Ps)) {
        exec(`"${sys64Ps}" -ExecutionPolicy Bypass -File "${tempFile}"`, { encoding: "utf8", timeout: 7000 }, (err32, stdout32) => {
          try { fs.unlinkSync(tempFile); } catch(e){}
          const out32 = (stdout32 || "").trim();
          if (out32.includes("OUTLOOK_VERSION=")) {
            const ver32 = out32.split("OUTLOOK_VERSION=")[1].trim();
            return resolve({ disponible: true, version: ver32 + " (32-bit)", esClassic: true });
          }
          if (out32.includes("OUTLOOK_NEW_APP") || out.includes("OUTLOOK_NEW_APP")) {
            return resolve({ disponible: true, version: "New Outlook (App)", esNewOutlook: true });
          }
          resolve({ disponible: false, version: null });
        });
        return;
      }

      try { fs.unlinkSync(tempFile); } catch(e){}
      if (out.includes("OUTLOOK_NEW_APP")) {
        return resolve({ disponible: true, version: "New Outlook (App)", esNewOutlook: true });
      }
      resolve({ disponible: false, version: null });
    });
  });
}

module.exports = { enviarViaOutlookMapi, verificarOutlookMapi };
