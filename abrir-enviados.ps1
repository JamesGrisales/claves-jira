# abrir-enviados.ps1: Lanza la aplicación de escritorio de Outlook instalada en el equipo
$ErrorActionPreference = "SilentlyContinue"

# 1. Si existe la aplicación Outlook PWA / Chrome instalada por el usuario
$pwaLnk = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Aplicaciones de Chrome\Outlook (PWA).lnk"
if (Test-Path $pwaLnk) {
  try {
    Start-Process -FilePath "explorer.exe" -ArgumentList "`"$pwaLnk`""
  } catch {}
}

# 2. Si existe el acceso directo de Outlook Classic
$classicLnk = "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Outlook (classic).lnk"
if (Test-Path $classicLnk) {
  try {
    Start-Process -FilePath "explorer.exe" -ArgumentList "`"$classicLnk`""
  } catch {}
} else {
  # 3. Si no hay acceso directo, ejecutar el binario directamente
  $candidates = @(
    "C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE",
    "C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE",
    "C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE",
    "C:\Program Files (x86)\Microsoft Office\Office16\OUTLOOK.EXE"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) {
      try {
        Start-Process -FilePath "explorer.exe" -ArgumentList "`"$c`""
      } catch {
        Start-Process -FilePath $c
      }
      break
    }
  }
}

# 4. Enviar señal de activación de ventana
Start-Sleep -Milliseconds 600
try {
  $wsh = New-Object -ComObject WScript.Shell
  $wsh.AppActivate("Outlook") | Out-Null
} catch {}
