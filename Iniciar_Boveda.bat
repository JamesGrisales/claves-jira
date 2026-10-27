@echo off
chcp 65001 >nul 2>&1

:: 1. Si se ejecuto directamente (sin --oculto), re-lanzarse en segundo plano con wscript para cerrar la terminal inmediatamente
if not "%1"=="--oculto" (
    if exist "%~dp0ejecutar_segundo_plano.vbs" (
        start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" "%~f0" --oculto
        exit /b 0
    )
)

title Iniciando Boveda Jira...

:: 2. Ir a la carpeta principal del proyecto
cd /d "%~dp0"

:: 3. Matar cualquier proceso anterior en el puerto 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a 2>nul

:: 4. Iniciar el servidor Node.js en segundo plano (sin ventana de consola)
if exist "%~dp0ejecutar_segundo_plano.vbs" (
    start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" node server.js
) else (
    start "" /B node server.js > "%~dp0servidor.log" 2>&1
)

:: 5. Abrir la aplicacion en el navegador por defecto
echo set WshShell = WScript.CreateObject("WScript.Shell") > "%TEMP%\abrir_boveda.vbs"
echo WScript.Sleep 2000 >> "%TEMP%\abrir_boveda.vbs"
echo WshShell.Run "http://127.0.0.1:5050/logout" >> "%TEMP%\abrir_boveda.vbs"
start wscript "%TEMP%\abrir_boveda.vbs"

:: 6. Cerrar esta ventana de consola inmediatamente
exit /b 0
