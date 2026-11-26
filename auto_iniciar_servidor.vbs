' Auto-inicio silencioso del servidor Boveda Jira al encender Windows
' Solo arranca Node.js en segundo plano si el puerto 5050 aun no esta escuchando.
Option Explicit
Dim WshShell, fso, strDir, nodeExe

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

nodeExe = "C:\Program Files\nodejs\node.exe"
If Not fso.FileExists(nodeExe) Then nodeExe = "node"

Function ServidorListo()
    On Error Resume Next
    Dim http, st
    ServidorListo = False
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 400, 400, 400, 400
    http.Open "GET", "http://127.0.0.1:5050/login", False
    http.Send
    If Err.Number = 0 Then
        st = http.Status
        If Err.Number = 0 Then
            If st >= 200 And st < 500 Then
                ServidorListo = True
            End If
        End If
    End If
    Err.Clear
End Function

If Not ServidorListo() Then
    WshShell.Run "cmd.exe /c """"" & nodeExe & """ """ & strDir & "\server.js"" > """ & strDir & "\servidor.log"" 2>&1""", 0, False
End If
