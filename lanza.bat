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

:: 1. Comprobar de inmediato si el servidor ya está respondiendo en el puerto 5050
curl.exe -s -o nul --max-time 1 "http://127.0.0.1:5050/login" >nul 2>&1
if %errorlevel%==0 (
    start "" "http://localhost:5050/login"
    exit /b 0
)

:: 2. Si no estaba corriendo, iniciar Node.js en segundo plano absoluto
if exist "%PROYECTO_DIR%\auto_iniciar_servidor.vbs" (
    start "" wscript.exe //B //Nologo "%PROYECTO_DIR%\auto_iniciar_servidor.vbs"
) else if exist "%PROYECTO_DIR%\ejecutar_segundo_plano.vbs" (
    start "" wscript.exe //B //Nologo "%PROYECTO_DIR%\ejecutar_segundo_plano.vbs" node server.js
) else (
    start "" /B node server.js > "%PROYECTO_DIR%\servidor.log" 2>&1
)

:: 3. Esperar solo lo necesario hasta que responda (máximo ~15s) y abrir de una vez
set /a INTENTOS=0
:ESPERAR
set /a INTENTOS+=1
curl.exe -s -o nul --max-time 1 "http://127.0.0.1:5050/login" >nul 2>&1
if %errorlevel%==0 goto ABRIR
if %INTENTOS% GEQ 25 goto ABRIR
ping 127.0.0.1 -n 2 -w 400 >nul 2>&1
goto ESPERAR

:ABRIR
start "" "http://localhost:5050/login"
exit /b 0
