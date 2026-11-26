' Lanzador instantaneo y silencioso de Boveda Jira
Option Explicit
Dim WshShell, fso, strDir, nodeExe, i

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

' 1. Si el servidor no esta corriendo, arrancar Node.js en segundo plano sin ventana
If Not ServidorListo() Then
    WshShell.Run "cmd.exe /c """"" & nodeExe & """ """ & strDir & "\server.js"" > """ & strDir & "\servidor.log"" 2>&1""", 0, False

    ' 2. Esperar solo lo necesario hasta que responda (maximo ~15s)
    For i = 1 To 50
        WScript.Sleep 300
        If ServidorListo() Then Exit For
    Next
End If

' 3. Abrir en el navegador por defecto
WshShell.Run "http://localhost:5050/login", 1, False
