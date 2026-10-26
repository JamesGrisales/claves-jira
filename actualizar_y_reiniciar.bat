@echo off
chcp 65001 >nul
title Actualizador Automatico - Boveda Jira
echo ========================================================
echo   ACTUALIZANDO BOVEDA JIRA DESDE GITHUB...
echo ========================================================
echo.

:: 1. Esperar 2 segundos de forma segura sin timeout interactivo
ping 127.0.0.1 -n 3 >nul

:: 2. Matar cualquier proceso residual en el puerto 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a 2>nul
ping 127.0.0.1 -n 2 >nul

:: 3. Ir a la carpeta principal del proyecto
cd /d "%~dp0"
if exist "..\\.git" cd /d ".."

echo Guardando cambios locales si existen (git stash)...
git stash 2>nul

echo Descargando ultimas mejoras de GitHub...
git fetch origin main
git pull origin main

:: 4. Instalar o actualizar dependencias si hubo cambios
if exist "package.json" (
    echo Verificando librerias de Node.js...
    call npm install --no-audit --no-fund 2>nul
)

:: 5. Si existe la subcarpeta boveda_node, actualizarla tambien
if exist "boveda_node\package.json" (
    echo Actualizando dependencias de boveda_node...
    cd boveda_node
    call npm install --no-audit --no-fund 2>nul
    cd ..
)

echo.
echo ========================================================
echo   REINICIANDO SERVICIO BOVEDA JIRA...
echo ========================================================
ping 127.0.0.1 -n 2 >nul

:: 6. Iniciar el servidor
if exist "Iniciar_Boveda.bat" (
    start "" "Iniciar_Boveda.bat"
) else if exist "boveda_node\server.js" (
    cd boveda_node
    start "" cmd /c "node server.js"
) else (
    start "" cmd /c "node server.js"
)

echo Actualizacion completada.
exit
