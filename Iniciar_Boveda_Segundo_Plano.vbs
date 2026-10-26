' Iniciar Boveda Jira en Segundo Plano (Sin Ventana de Consola)
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Matar procesos anteriores en el puerto 5050 si existen
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr :5050') do taskkill /F /PID %a 2>nul", 0, True

' 2. Definir carpeta de trabajo
WshShell.CurrentDirectory = strDir

' 3. Iniciar el servidor Node.js de forma 100% invisible en segundo plano
If fso.FileExists(strDir & "\server.js") Then
    WshShell.Run "cmd /c node server.js > """ & strDir & "\servidor.log"" 2>&1", 0, False
ElseIf fso.FileExists(strDir & "\boveda_node\server.js") Then
    WshShell.CurrentDirectory = strDir & "\boveda_node"
    WshShell.Run "cmd /c node server.js > """ & strDir & "\servidor.log"" 2>&1", 0, False
End If

' 4. Esperar a que el servidor inicialice (2.5 segundos) y abrir el navegador
WScript.Sleep 2500
WshShell.Run "http://127.0.0.1:5050/logout"
