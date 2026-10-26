' Actualizador y Reiniciador de Boveda Jira 100% en Segundo Plano (Sin Consola)
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

batPath = strDir & "\actualizar_y_reiniciar.bat"
If Not fso.FileExists(batPath) Then
    batPath = strDir & "\..\actualizar_y_reiniciar.bat"
End If

If fso.FileExists(batPath) Then
    ' 0 = Oculto (SW_HIDE), False = Asincrono
    WshShell.Run "cmd.exe /c """ & batPath & """ --segundo-plano", 0, False
End If
