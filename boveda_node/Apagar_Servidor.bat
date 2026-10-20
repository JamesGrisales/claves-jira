@echo off
title Apagando Boveda...
echo Buscando proceso de Node.js en el puerto 5050...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %%a 2>nul
echo.
echo Servidor apagado correctamente.
pause
