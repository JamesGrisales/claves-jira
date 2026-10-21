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

      const htmlCompleto = `
        <div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5;">
          ${mensajeHtml}
          <br><br>
          <div style="margin-top: 15px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 10.5pt; color: #334155;">
            <strong style="font-size: 11.5pt; color: #0f172a;">${tecnicoNombre}</strong><br>
            <span style="color: #64748b;">Analista de Soporte</span><br><br>
            <div style="background: #2b2b2b; display: inline-block; padding: 10px 22px; border-radius: 6px;">
              <span style="color: #ffffff; font-weight: bold; font-size: 20px; font-family: sans-serif; letter-spacing: 0.5px;">Jaivaná<span style="color: #e11d48; margin-left: 4px;">▲</span></span>
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
          $mail.HTMLBody = $data.htmlBody

          if (Test-Path $data.pdfPath) {
            $mail.Attachments.Add($data.pdfPath) | Out-Null
          }
          
          if ($data.logoPath -and (Test-Path $data.logoPath)) {
            $attachment = $mail.Attachments.Add($data.logoPath)
            # 0x3712001F es PR_ATTACH_CONTENT_ID para imagen incrustada
            $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x3712001F", "jaivana_signature_img") | Out-Null
          }

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

module.exports = { enviarViaOutlookMapi };
