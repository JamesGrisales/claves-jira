@echo off
chcp 65001 >nul
title Activar Outlook Clásico para Envío Directo Silencioso
echo ======================================================================
echo   Bóveda de Claves - Activador de Outlook Clásico (MAPI COM)
echo ======================================================================
echo.
echo Este asistente configura y registra tu aplicación de Outlook Clásico
echo para que puedas enviar informes en silencio directamente desde la App.
echo.

:: 1. Desactivar la redirección forzada de Nuevo Outlook hacia Clásico en el perfil del usuario
reg add "HKCU\Software\Microsoft\Office\16.0\Outlook\Preferences" /v UseNewOutlook /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Office\15.0\Outlook\Preferences" /v UseNewOutlook /t REG_DWORD /d 0 /f >nul 2>&1

set OUTLOOK_PATH=

:: Buscar en Registro de Windows
for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\OUTLOOK.EXE" /ve 2^>nul') do set "OUTLOOK_PATH=%%b"
if not defined OUTLOOK_PATH for /f "tokens=2*" %%a in ('reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\OUTLOOK.EXE" /ve 2^>nul') do set "OUTLOOK_PATH=%%b"

:: Buscar en rutas estándar si no está en registro
if not defined OUTLOOK_PATH if exist "C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "C:\Program Files (x86)\Microsoft Office\Office16\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files (x86)\Microsoft Office\Office16\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "C:\Program Files\Microsoft Office\Office15\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files\Microsoft Office\Office15\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "C:\Program Files (x86)\Microsoft Office\Office15\OUTLOOK.EXE" set "OUTLOOK_PATH=C:\Program Files (x86)\Microsoft Office\Office15\OUTLOOK.EXE"
if not defined OUTLOOK_PATH if exist "%LOCALAPPDATA%\Microsoft\Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_PATH=%LOCALAPPDATA%\Microsoft\Office\root\Office16\OUTLOOK.EXE"

if defined OUTLOOK_PATH (
    echo [✓] Se localizó Outlook Clásico en:
    echo     "%OUTLOOK_PATH%"
    echo.
    echo Registrando componentes COM de Outlook en Windows...
    start "" /wait "%OUTLOOK_PATH%" /regserver
    
    :: Registrar explícitamente en el perfil del usuario actual (no requiere administrador)
    reg add "HKCU\Software\Classes\CLSID\{0006F03A-0000-0000-C000-000000000046}" /ve /d "Microsoft Outlook" /f >nul 2>&1
    reg add "HKCU\Software\Classes\CLSID\{0006F03A-0000-0000-C000-000000000046}\LocalServer32" /ve /d "\"%OUTLOOK_PATH%\"" /f >nul 2>&1
    reg add "HKCU\Software\Classes\CLSID\{0006F03A-0000-0000-C000-000000000046}\ProgID" /ve /d "Outlook.Application.16" /f >nul 2>&1
    reg add "HKCU\Software\Classes\CLSID\{0006F03A-0000-0000-C000-000000000046}\VersionIndependentProgID" /ve /d "Outlook.Application" /f >nul 2>&1
    reg add "HKCU\Software\Classes\Outlook.Application\CLSID" /ve /d "{0006F03A-0000-0000-C000-000000000046}" /f >nul 2>&1
    reg add "HKCU\Software\Classes\Outlook.Application.16\CLSID" /ve /d "{0006F03A-0000-0000-C000-000000000046}" /f >nul 2>&1
    
    echo [✓] Registro COM completado exitosamente.
    echo.
    echo Iniciando Outlook Clásico...
    start "" "%OUTLOOK_PATH%" /recycle
    echo.
    echo ======================================================================
    echo  ¡LISTO! Outlook Clásico quedó activo y registrado.
    echo  Ya puedes enviar informes directamente y en silencio desde la App.
    echo ======================================================================
) else (
    echo [!] No se encontró la ruta tradicional de OUTLOOK.EXE en tu equipo.
    echo.
    echo Si actualmente tienes abierta la aplicación "Nuevo Outlook":
    echo 1. Abre el menú Inicio de Windows.
    echo 2. Busca y abre "Outlook (clásico)".
    echo 3. O desactiva el interruptor "Probar el nuevo Outlook" en la esquina de Outlook.
)

echo.
pause
