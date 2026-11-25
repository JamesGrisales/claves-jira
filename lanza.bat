@echo off
chcp 65001 >nul 2>&1

:: Si se ejecuta directamente sin --oculto, re-lanzarse en segundo plano absoluto sin consola
if not "%1"=="--oculto" (
    if exist "%~dp0ejecutar_segundo_plano.vbs" (
        start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" "%~f0" --oculto
        exit /b 0
    )
)

set "PROYECTO_DIR=%~dp0"
if "%PROYECTO_DIR:~-1%"=="\" set "PROYECTO_DIR=%PROYECTO_DIR:~0,-1%"
cd /d "%PROYECTO_DIR%"

:: 1. Liberar puerto 5050 matando cualquier proceso previo en el puerto
for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr /R /C:":5050  .*LISTENING"') do (
    if not "%%a"=="0" taskkill /F /PID %%a 2>nul
)
ping 127.0.0.1 -n 2 >nul 2>&1

:: 2. Iniciar servidor Node.js en segundo plano absoluto usando wscript
if exist "%PROYECTO_DIR%\ejecutar_segundo_plano.vbs" (
    start "" wscript.exe //B //Nologo "%PROYECTO_DIR%\ejecutar_segundo_plano.vbs" node server.js
) else (
    start "" /B node server.js > "%PROYECTO_DIR%\servidor.log" 2>&1
)

:: 3. Esperar a que el servidor este listo
ping 127.0.0.1 -n 3 >nul 2>&1

:: 4. Abrir en el navegador por defecto
start "" "http://localhost:5050/login"

exit /b 0
