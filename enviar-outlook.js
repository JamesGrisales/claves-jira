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
function enviarViaOutlookMapi({ to, cc, asunto, mensajeHtml, tecnico, pdfBuffer, pdfFilename }) {
  return new Promise((resolve, reject) => {
    try {
      const tempId = Date.now() + "_" + Math.floor(Math.random() * 10000);
      const tempPdf = path.join(os.tmpdir(), pdfFilename || `INFORME_DOCUMENTOS_ELECTRONICOS_${tempId}.pdf`);
      fs.writeFileSync(tempPdf, pdfBuffer);

      const logoPath = path.join(__dirname, "assets", "jaivana-signature.png");
      const logoExiste = fs.existsSync(logoPath);

      const toList = Array.isArray(to) ? to.join("; ") : (to || "");
      const ccList = Array.isArray(cc) ? cc.join("; ") : (cc || "");
      const finalSubject = asunto || `INFORME FACTURACION ELECTRONICA - ${new Date().toLocaleDateString("es-CO")}`;
      const tecnicoNombre = tecnico || "James Grisales";

      // Formato HTML del correo con la firma oficial de Jaivaná en tamaño adecuado (banner ancho)
      const htmlCompleto = `
        <div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11.5pt; color: #1e293b; line-height: 1.6;">
          ${mensajeHtml}
          <br><br>
          <div style="margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 11pt; color: #334155;">
            <strong style="font-size: 12pt; color: #0f172a;">${tecnicoNombre}</strong><br>
            <span style="color: #64748b; font-size: 10.5pt;">Analista de Soporte</span><br><br>
            <div style="margin-top: 6px; max-width: 560px;">
              <img src="cid:jaivana_signature_img" alt="Jaivaná" width="560" style="width: 100%; max-width: 560px; height: auto; display: block; border: 0;" />
            </div>
          </div>
        </div>
      `.trim();

      const jsonPayload = JSON.stringify({
        to: toList,
        cc: ccList,
        subject: finalSubject,
        htmlBody: htmlCompleto,
        pdfPath: tempPdf,
        logoPath: logoExiste ? logoPath : ""
      });

      const jsonFile = path.join(os.tmpdir(), `mail_data_${tempId}.json`);
      fs.writeFileSync(jsonFile, jsonPayload, "utf8");

      const psScript = `
        $ErrorActionPreference = "Stop"
        try {
          $data = Get-Content -Raw -Path "${jsonFile.replace(/\\/g, "\\\\")}" -Encoding UTF8 | ConvertFrom-Json
          $outlook = New-Object -ComObject Outlook.Application
          $mail = $outlook.CreateItem(0)
          
          if ($data.to) { $mail.To = $data.to }
          if ($data.cc) { $mail.CC = $data.cc }
          $mail.Subject = $data.subject

          if (Test-Path $data.pdfPath) {
            $mail.Attachments.Add($data.pdfPath) | Out-Null
          }
          
          if ($data.logoPath -and (Test-Path $data.logoPath)) {
            $attachment = $mail.Attachments.Add($data.logoPath)
            # 0x3712001F es PR_ATTACH_CONTENT_ID para imagen incrustada
            $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x3712001F", "jaivana_signature_img") | Out-Null
            # 0x7FFE000B es PR_ATTACHMENT_HIDDEN para que no aparezca en la lista de archivos adjuntos
            try {
              $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x7FFE000B", $true) | Out-Null
            } catch {}
          }

          $mail.HTMLBody = $data.htmlBody

          $mail.Send()
          Write-Output "ENVIADO_EXITOSO"
        } catch {
          Write-Output ("ERROR_MAPI: " + $_.Exception.Message)
          exit 1
        }
      `;

      const psFile = path.join(os.tmpdir(), `send_mail_${tempId}.ps1`);
      fs.writeFileSync(psFile, psScript, "utf8");

      exec(`powershell -ExecutionPolicy Bypass -File "${psFile}"`, { encoding: "utf8" }, (err, stdout, stderr) => {
        // Limpieza de archivos temporales
        try { if (fs.existsSync(psFile)) fs.unlinkSync(psFile); } catch(e){}
        try { if (fs.existsSync(jsonFile)) fs.unlinkSync(jsonFile); } catch(e){}
        setTimeout(() => {
          try { if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf); } catch(e){}
        }, 8000);

        if (err || (stdout && stdout.includes("ERROR_MAPI"))) {
          const msg = (stdout || "") + (stderr || "") || (err && err.message);
          return reject(new Error(msg.replace(/ERROR_MAPI:/g, "").trim()));
        }

        resolve({ ok: true, mensaje: "Correo enviado exitosamente vía Outlook." });
      });
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
    const psCmd = `powershell -ExecutionPolicy Bypass -Command "try { $o = New-Object -ComObject Outlook.Application; Write-Output ('OUTLOOK_VERSION=' + $o.Version) } catch { Write-Output 'NO_OUTLOOK' }"`;
    exec(psCmd, { encoding: "utf8", timeout: 6000 }, (err, stdout) => {
      const out = (stdout || "").trim();
      if (out.includes("OUTLOOK_VERSION=")) {
        const ver = out.split("OUTLOOK_VERSION=")[1].trim();
        return resolve({ disponible: true, version: ver });
      }
      resolve({ disponible: false, version: null });
    });
  });
}

module.exports = { enviarViaOutlookMapi, verificarOutlookMapi };
