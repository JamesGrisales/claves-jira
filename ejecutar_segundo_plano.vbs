' Script universal para ejecutar comandos y scripts .bat en segundo plano absoluto (SW_HIDE = 0)
' Permite que cualquier proceso se ejecute de forma 100% invisible sin ventana de consola ni parpadeos.
Dim WshShell, fso, scriptDir, strCommand, i, arg
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Establecer el directorio de trabajo al mismo donde reside este script
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

If WScript.Arguments.Count > 0 Then
    strCommand = ""
    For i = 0 To WScript.Arguments.Count - 1
        arg = WScript.Arguments(i)
        If InStr(arg, " ") > 0 And InStr(arg, """") = 0 Then
            arg = """" & arg & """"
        End If
        If i > 0 Then strCommand = strCommand & " "
        strCommand = strCommand & arg
    Next
    ' 0 = Oculto (SW_HIDE), False = No esperar a que termine (asincrono)
    ' Comillas externas para que cmd.exe preserve todas las rutas con espacios intactas
    WshShell.Run "cmd.exe /c """ & strCommand & """", 0, False
End If
