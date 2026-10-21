@echo off
title Boveda Jira - Servidor
echo =========================================
echo   Iniciando la Boveda de Claves...
echo =========================================
echo.
echo Por favor, manten esta ventana abierta mientras usas la aplicacion.
echo Cuando termines, simplemente cierra esta ventana.
echo.

:: 1. Ir a la carpeta del proyecto
if exist "%~dp0boveda_node\server.js" (
    cd /d "%~dp0boveda_node"
) else (
    cd /d "%~dp0"
)

:: 2. Crear un archivo temporal vbs para abrir el navegador con retraso sin pausar el servidor
echo set WshShell = WScript.CreateObject("WScript.Shell") > "%TEMP%\abrir_boveda.vbs"
echo WScript.Sleep 2500 >> "%TEMP%\abrir_boveda.vbs"
echo WshShell.Run "http://127.0.0.1:5050/logout" >> "%TEMP%\abrir_boveda.vbs"
start wscript "%TEMP%\abrir_boveda.vbs"

:: 3. Iniciar el servidor de Node
npm start
