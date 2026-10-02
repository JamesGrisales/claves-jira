-- Inserta las notas generales de soporte (Linux/Windows, Ventoy, iconos,
-- instalación de programas, pantalla azul) directamente en PostgreSQL.
-- Ejecutar con la app arrancada al menos una vez (para que exista la tabla notas), por ejemplo:
--   psql -U postgres -d boveda_jira -f insertar_notas.sql
BEGIN;

INSERT INTO notas (categoria, titulo, contenido) VALUES ('Ver características del equipo', 'Linux — sistema operativo, CPU, RAM y disco', $q$sistema operativo
hostnamectl

procesador
lscpu | grep "Model name"

memoria ram
free -h

disco duro
lsblk -d -o MODEL,SIZE$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Ver características del equipo', 'Windows — sistema operativo, CPU, RAM y disco (PowerShell)', $q$sistema operativo, ram, procesador
systeminfo

disco
Get-PhysicalDisk | Select FriendlyName, MediaType, Size

FriendlyName MediaType          Size
------------ ---------          ----
SSD 2TB      SSD       2000398934016

procesador
Get-CimInstance Win32_Processor | Select Name

Name
----
Pentium(R) Dual-Core  CPU      E6600  @ 3.06GHz

ram
Get-CimInstance Win32_OperatingSystem | Select TotalVisibleMemorySize,FreePhysicalMemory

TotalVisibleMemorySize FreePhysicalMemory
---------------------- ------------------
               6255860            1570772

sistema operativo (nombre, versión, build)
Get-ComputerInfo | Select WindowsProductName, WindowsVersion, OsBuildNumber

WindowsProductName WindowsVersion OsBuildNumber
------------------ -------------- -------------
Windows 10 Pro     2009           22621$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Ventoy — preparar USB', 'Guía completa: preparar USB e instalar Ventoy por comandos', $q$IMPORTANTE:
- Estos comandos BORRAN COMPLETAMENTE la memoria USB seleccionada.
- Antes de ejecutar CLEAN, confirma con LIST DISK que seleccionaste la USB correcta (por su tamaño).
- NO ejecutes SELECT DISK X sin comprobar primero el número real de la USB.

1. ABRIR CMD COMO ADMINISTRADOR
--------------------------------
Win + X -> Terminal (Administrador)

diskpart
list disk

Busca la USB por su tamaño aproximado. Ejemplo:

Disco 0    476 GB
Disco 1    931 GB
Disco 2      4 GB

2. COMPROBAR LA USB
--------------------
Si la USB realmente es el Disco 2:

select disk 2
detail disk

Comprueba que el disco seleccionado sea la memoria USB.

3. BORRAR Y PREPARAR LA USB
----------------------------
SOLO DESPUÉS DE CONFIRMAR QUE ES LA USB:

attributes disk clear readonly
clean
convert mbr
create partition primary
format fs=exfat quick
assign
exit

4. PREPARAR VENTOY
-------------------
Descarga la versión más nueva desde:
https://github.com/ventoy/Ventoy/releases/latest

Descarga el archivo para Windows (ej: ventoy-1.1.17-windows.zip) y descomprime el ZIP.

5. ABRIR LA CARPETA DE VENTOY
-------------------------------
Abre CMD como administrador dentro de la carpeta donde está Ventoy2Disk.exe.
Puedes comprobarlo con:

dir

Debe aparecer Ventoy2Disk.exe

6. VER LAS OPCIONES DE VENTOY
-------------------------------
Ventoy2Disk.exe -h

NOTA: no ejecutes un comando de instalación indicando un número de disco sin
comprobarlo primero; el número puede cambiar entre sesiones. Si Ventoy vuelve
a mostrar un error, guarda el mensaje o una captura para revisarlo.

ORDEN RECOMENDADO
------------------
diskpart
list disk
select disk X
detail disk
attributes disk clear readonly
clean
convert mbr
create partition primary
format fs=exfat quick
assign
exit

Después abrir Ventoy2Disk.exe como administrador.

X = EL NÚMERO REAL DE TU MEMORIA USB.$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Windows — iconos en blanco', 'Script PowerShell: limpiar caché de iconos', $q$try {
    Write-Host "Cerrando Explorer..." -ForegroundColor Yellow

    Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    Write-Host "Limpiando cache de iconos..." -ForegroundColor Yellow

    Remove-Item "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache*" -Force -ErrorAction SilentlyContinue

    Write-Host "Cache de iconos eliminada." -ForegroundColor Green
}
finally {
    Write-Host "Iniciando Explorer..." -ForegroundColor Yellow

    Start-Process explorer.exe

    Write-Host ""
    Write-Host "Proceso terminado. Windows reconstruira los iconos automaticamente." -ForegroundColor Green
}$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Linux — instalación de programas (cajas)', 'Actualizar sistema, AnyDesk, Java, SSH y Chrome', $q$AL INSTALAR LINUX
sudo apt update
sudo apt upgrade

--instalar anydesk
wget -qO - https://keys.anydesk.com/repos/DEB-GPG-KEY | sudo apt-key add -
echo "deb http://deb.anydesk.com/ all main" | sudo tee /etc/apt/sources.list.d/anydesk-stable.list
sudo apt update
sudo apt install anydesk

--instalar java
sudo apt install openjdk-8-jdk -y

--instalar y habilitar SSH
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh

sudo nano /etc/ssh/sshd_config
sudo systemctl restart sshd

--instalar chrome
sudo apt update && \
sudo apt install wget -y && \
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
sudo dpkg -i google-chrome-stable_current_amd64.deb || sudo apt -f install -y && \
rm google-chrome-stable_current_amd64.deb && \
xdg-settings set default-web-browser google-chrome.desktop && \
google-chrome-stable$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Linux — instalación de programas (cajas)', 'Permisos de impresora USB en caja (lp1)', $q$cd /dev/usb
ls
# hiddev0  lp1

chmod 777 lp1
# chmod: cambiando los permisos de 'lp1': Operación no permitida
# (falta permiso de superusuario)

sudo su
ls
# hiddev0  lp1

chmod 777 lp1
usermod -aG lp1 caja5
sudo usermod -aG lp caja9
sudo chmod 777 /dev/usb/lp1

Nota: el grupo correcto para impresoras suele ser "lp", no "lp1"
(revisar según la distribución antes de repetir el comando).$q$);
INSERT INTO notas (categoria, titulo, contenido) VALUES ('Windows — pantalla azul (BSOD)', 'Reparar con SFC y DISM', $q$1. Revisar y reparar archivos dañados de Windows (SFC)
sfc /scannow

2. Reparar la imagen de Windows con DISM
Ejecuta en este orden:

DISM /Online /Cleanup-Image /CheckHealth
DISM /Online /Cleanup-Image /ScanHealth
DISM /Online /Cleanup-Image /RestoreHealth

Después vuelve a ejecutar:
sfc /scannow$q$);

COMMIT;