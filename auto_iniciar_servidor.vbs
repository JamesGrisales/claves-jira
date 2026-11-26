' Auto-inicio silencioso del servidor Bóveda Jira al encender Windows
' Solo arranca Node.js en segundo plano si el puerto 5050 aún no está escuchando.
Dim WshShell, fso, strDir, rc
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

' Verificar si ya está corriendo
rc = WshShell.Run("cmd.exe /c curl.exe -s -o nul --max-time 1 http://127.0.0.1:5050/login", 0, True)
If rc <> 0 Then
    WshShell.Run "cmd.exe /c node server.js > """ & strDir & "\servidor.log"" 2>&1", 0, False
End If
