@echo off
chcp 65001 >nul 2>&1

:: Si se ejecuta directamente sin --oculto, re-lanzarse en segundo plano absoluto sin consola
if not "%1"=="--oculto" (
    if exist "%~dp0ejecutar_segundo_plano.vbs" (
        start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" "%~f0" --oculto
        exit /b 0
    )
    if exist "C:\Users\JamesGrisales\Desktop\Proyectos\boveda_claves_jira_node_postgres_completov2\ejecutar_segundo_plano.vbs" (
        start "" wscript.exe //B //Nologo "C:\Users\JamesGrisales\Desktop\Proyectos\boveda_claves_jira_node_postgres_completov2\ejecutar_segundo_plano.vbs" "%~f0" --oculto
        exit /b 0
    )
)

set "PROYECTO_DIR=C:\Users\JamesGrisales\Desktop\Proyectos\boveda_claves_jira_node_postgres_completov2"
cd /d "%PROYECTO_DIR%"

:: 1. Liberar puerto 5050 si esta ocupado por un proceso anterior
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = Get-NetTCPConnection -LocalPort 5050 -State Listen -ErrorAction SilentlyContinue; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 600 }"

:: 2. Iniciar servidor Node.js en segundo plano absoluto
start "" /B node server.js > "%PROYECTO_DIR%\servidor.log" 2>&1

:: 3. Esperar 2 segundos a que el servidor este listo
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2"

:: 4. Abrir en el navegador por defecto
start "" "http://localhost:5050/login"

exit /b 0
