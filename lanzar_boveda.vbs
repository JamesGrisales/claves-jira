' Lanzador instantáneo y silencioso de Bóveda Jira
Option Explicit
Dim WshShell, fso, strDir, i

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

' 1. Si el servidor ya está respondiendo, abrir el navegador al instante
If Not ServidorListo() Then
    ' 2. Si no está corriendo, arrancar Node.js en segundo plano sin ventana
    WshShell.Run "cmd.exe /c node server.js > """ & strDir & "\servidor.log"" 2>&1", 0, False

    ' 3. Esperar solo lo necesario hasta que responda (máximo ~15s)
    For i = 1 To 50
        WScript.Sleep 300
        If ServidorListo() Then Exit For
    Next
End If

' 4. Abrir en el navegador por defecto
WshShell.Run "http://localhost:5050/login", 1, False
