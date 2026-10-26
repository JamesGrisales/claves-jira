@echo off
chcp 65001 >nul 2>&1
title Actualizador Automatico - Boveda Jira

:: 1. Ir a la carpeta principal del proyecto
cd /d "%~dp0"
if exist "..\\.git" cd /d ".."

:: 2. Detectar modo: Si se pasa --segundo-plano, silenciar toda salida a la consola
set "MODO_BG=0"
if "%1"=="--segundo-plano" set "MODO_BG=1"
if "%1"=="-b" set "MODO_BG=1"
if "%1"=="--silent" set "MODO_BG=1"

set "LOGFILE=%~dp0actualizacion.log"
set "SERVER_LOG=%~dp0servidor.log"

if "%MODO_BG%"=="1" goto MODO_SEGUNDO_PLANO

:: ---------------------------------------------------------------------------
:: MODO INTERACTIVO (Consola Visible)
:: ---------------------------------------------------------------------------
echo ========================================================
echo   ACTUALIZANDO BOVEDA JIRA DESDE GITHUB (Modo Consola)
echo ========================================================
echo.
echo [1/5] Esperando liberacion de procesos...
ping 127.0.0.1 -n 3 >nul

echo [2/5] Deteniendo cualquier proceso en el puerto 5050...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a 2>nul
ping 127.0.0.1 -n 2 >nul

echo [3/5] Guardando cambios locales si existen (git stash)...
git stash 2>nul

echo [4/5] Descargando ultimas mejoras de GitHub...
git fetch origin main
git pull origin main
if %errorlevel% neq 0 (
    echo [AVISO] Conflicto local detectado. Sincronizando limpiamente con origin/main...
    git reset --hard origin/main
)

if exist "package.json" (
    echo Verificando dependencias de Node.js...
    call npm install --no-audit --no-fund 2>nul
)

if exist "boveda_node\package.json" (
    cd boveda_node
    call npm install --no-audit --no-fund 2>nul
    cd ..
)

echo.
echo [5/5] Reiniciando servicio Boveda Jira...
ping 127.0.0.1 -n 2 >nul
if exist "Iniciar_Boveda.bat" (
    start "" "Iniciar_Boveda.bat"
) else (
    start "" cmd /c "node server.js"
)
echo Actualizacion completada.
exit /b 0

:: ---------------------------------------------------------------------------
:: MODO SEGUNDO PLANO (100% Invisible, Silencioso, Sin Ventanas)
:: ---------------------------------------------------------------------------
:MODO_SEGUNDO_PLANO
echo [%date% %time%] === INICIO DE ACTUALIZACION EN SEGUNDO PLANO === > "%LOGFILE%"

:: 1. Esperar 2.5 segundos a que el proceso anterior de Node.js libere el puerto
ping 127.0.0.1 -n 4 >nul 2>&1

:: 2. Matar cualquier proceso residual en el puerto 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a >> "%LOGFILE%" 2>&1
ping 127.0.0.1 -n 2 >nul 2>&1

:: 3. Git stash por seguridad
echo [%date% %time%] Ejecutando git stash... >> "%LOGFILE%"
git stash >> "%LOGFILE%" 2>&1

:: 4. Descargar cambios
echo [%date% %time%] Ejecutando git fetch y git pull... >> "%LOGFILE%"
git fetch origin main >> "%LOGFILE%" 2>&1
git pull origin main >> "%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Conflicto local reportado por git pull. Forzando reset limpio con origin/main... >> "%LOGFILE%"
    git reset --hard origin/main >> "%LOGFILE%" 2>&1
)

:: 5. Instalar dependencias si hubo cambios
if exist "package.json" (
    echo [%date% %time%] Verificando npm install... >> "%LOGFILE%"
    call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
)
if exist "boveda_node\package.json" (
    cd boveda_node
    call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
    cd ..
)

:: 6. Iniciar el servidor Node.js en segundo plano sin ventana
echo [%date% %time%] Reiniciando servidor Node.js en segundo plano... >> "%LOGFILE%"
ping 127.0.0.1 -n 2 >nul 2>&1

if exist "server.js" (
    start "" /B node server.js >> "%SERVER_LOG%" 2>&1
) else if exist "boveda_node\server.js" (
    cd boveda_node
    start "" /B node server.js >> "%SERVER_LOG%" 2>&1
    cd ..
)

echo [%date% %time%] === ACTUALIZACION EN SEGUNDO PLANO COMPLETADA EXITOSAMENTE === >> "%LOGFILE%"
exit /b 0
