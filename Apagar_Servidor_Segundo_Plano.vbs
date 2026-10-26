' Apagar Boveda Jira en Segundo Plano (Sin Ventana de Consola)
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %a 2>nul", 0, True
