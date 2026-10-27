@echo off
chcp 65001 >nul 2>&1
title Actualizador Automatico - Boveda Jira

:: 1. Ir a la carpeta principal del proyecto
cd /d "%~dp0"
if exist "..\.git" cd /d ".."

:: 2. Si se ejecuto directamente (sin --oculto), re-lanzarse en segundo plano con wscript para cerrar la terminal inmediatamente
if not "%1"=="--oculto" (
    if exist "ejecutar_segundo_plano.vbs" (
        start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" "%~f0" --oculto
        exit /b 0
    )
)

:: 3. Definir archivos de log para que NINGUN comando emita texto a la consola
set "LOGFILE=%~dp0actualizacion.log"
set "SERVER_LOG=%~dp0servidor.log"

echo [%date% %time%] === INICIO DE ACTUALIZACION EN SEGUNDO PLANO === > "%LOGFILE%"

:: 4. Esperar 2 segundos a que el proceso anterior de Node.js libere el puerto
ping 127.0.0.1 -n 3 >nul 2>&1

:: 5. Matar cualquier proceso residual en el puerto 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a >> "%LOGFILE%" 2>&1
ping 127.0.0.1 -n 2 >nul 2>&1

:: 6. Guardar cambios locales si existen (git stash)
echo [%date% %time%] Guardando cambios locales si existen (git stash)... >> "%LOGFILE%"
git stash >> "%LOGFILE%" 2>&1

:: 7. Descargar ultimas mejoras de GitHub
echo [%date% %time%] Descargando mejoras de GitHub (git fetch y git pull)... >> "%LOGFILE%"
git fetch origin main >> "%LOGFILE%" 2>&1
git pull origin main >> "%LOGFILE%" 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Conflicto local detectado. Sincronizando limpiamente con origin/main... >> "%LOGFILE%"
    git reset --hard origin/main >> "%LOGFILE%" 2>&1
)

:: 8. Instalar dependencias si hubo cambios
if exist "package.json" (
    echo [%date% %time%] Verificando dependencias npm... >> "%LOGFILE%"
    call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
)
if exist "boveda_node\package.json" (
    cd boveda_node
    call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
    cd ..
)

:: 9. Iniciar el servidor Node.js 100% en segundo plano sin ninguna ventana de consola
echo [%date% %time%] Reiniciando servidor Node.js en segundo plano... >> "%LOGFILE%"
ping 127.0.0.1 -n 2 >nul 2>&1

if exist "ejecutar_segundo_plano.vbs" (
    start "" wscript.exe //B //Nologo "%~dp0ejecutar_segundo_plano.vbs" node server.js
) else (
    start "" /B node server.js >> "%SERVER_LOG%" 2>&1
)

echo [%date% %time%] === ACTUALIZACION COMPLETADA EXITOSAMENTE === >> "%LOGFILE%"
exit /b 0
