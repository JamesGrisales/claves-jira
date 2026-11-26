' Auto-inicio silencioso del servidor Bóveda Jira al encender Windows
' Solo arranca Node.js en segundo plano si el puerto 5050 aún no está escuchando.
Option Explicit
Dim WshShell, fso, strDir

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

Function ServidorListo()
    On Error Resume Next
    Dim http
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 400, 400, 400, 400
    http.Open "GET", "http://127.0.0.1:5050/login", False
    http.Send
    If Err.Number = 0 And http.Status >= 200 And http.Status < 500 Then
        ServidorListo = True
    Else
        ServidorListo = False
    End If
    Err.Clear
End Function

If Not ServidorListo() Then
    WshShell.Run "cmd.exe /c node server.js > """ & strDir & "\servidor.log"" 2>&1", 0, False
End If
