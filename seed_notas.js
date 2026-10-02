require("dotenv").config();
const { pool, initDb } = require("./db");

// Notas iniciales, agrupadas por apartado (categoria).
// Puedes editar este archivo y volver a correr "node seed_notas.js"
// cuantas veces quieras: las notas que ya existen (mismo apartado +
// mismo título) no se duplican.

const notas = [
  // ---------------------------------------------------------------------
  {
    categoria: "Ver características del equipo",
    titulo: "Linux — sistema operativo, CPU, RAM y disco",
    contenido: `sistema operativo
hostnamectl

procesador
lscpu | grep "Model name"

memoria ram
free -h

disco duro
lsblk -d -o MODEL,SIZE`,
  },
  {
    categoria: "Ver características del equipo",
    titulo: "Windows — sistema operativo, CPU, RAM y disco (PowerShell)",
    contenido: `sistema operativo, ram, procesador
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
Windows 10 Pro     2009           22621`,
  },
  // ---------------------------------------------------------------------
  {
    categoria: "Ventoy — preparar USB",
    titulo: "Guía completa: preparar USB e instalar Ventoy por comandos",
    contenido: `IMPORTANTE:
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

X = EL NÚMERO REAL DE TU MEMORIA USB.`,
  },
  // ---------------------------------------------------------------------
  {
    categoria: "Windows — iconos en blanco",
    titulo: "Script PowerShell: limpiar caché de iconos",
    contenido: `try {
    Write-Host "Cerrando Explorer..." -ForegroundColor Yellow

    Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    Write-Host "Limpiando cache de iconos..." -ForegroundColor Yellow

    Remove-Item "$env:LOCALAPPDATA\\IconCache.db" -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer\\iconcache*" -Force -ErrorAction SilentlyContinue

    Write-Host "Cache de iconos eliminada." -ForegroundColor Green
}
finally {
    Write-Host "Iniciando Explorer..." -ForegroundColor Yellow

    Start-Process explorer.exe

    Write-Host ""
    Write-Host "Proceso terminado. Windows reconstruira los iconos automaticamente." -ForegroundColor Green
}`,
  },
  // ---------------------------------------------------------------------
  {
    categoria: "Linux — instalación de programas (cajas)",
    titulo: "Actualizar sistema, AnyDesk, Java, SSH y Chrome",
    contenido: `AL INSTALAR LINUX
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
sudo apt update && \\
sudo apt install wget -y && \\
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \\
sudo dpkg -i google-chrome-stable_current_amd64.deb || sudo apt -f install -y && \\
rm google-chrome-stable_current_amd64.deb && \\
xdg-settings set default-web-browser google-chrome.desktop && \\
google-chrome-stable`,
  },
  {
    categoria: "Linux — instalación de programas (cajas)",
    titulo: "Permisos de impresora USB en caja (lp1)",
    contenido: `cd /dev/usb
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
(revisar según la distribución antes de repetir el comando).`,
  },
  // ---------------------------------------------------------------------
  {
    categoria: "Windows — pantalla azul (BSOD)",
    titulo: "Reparar con SFC y DISM",
    contenido: `1. Revisar y reparar archivos dañados de Windows (SFC)
sfc /scannow

2. Reparar la imagen de Windows con DISM
Ejecuta en este orden:

DISM /Online /Cleanup-Image /CheckHealth
DISM /Online /Cleanup-Image /ScanHealth
DISM /Online /Cleanup-Image /RestoreHealth

Después vuelve a ejecutar:
sfc /scannow`,
  },
];

async function main() {
  await initDb();

  const { rows: existentesRows } = await pool.query(
    "SELECT LOWER(categoria) AS c, LOWER(titulo) AS t FROM notas"
  );
  const existentes = new Set(
    existentesRows.map((r) => `${r.c}|||${r.t}`)
  );

  let agregadas = 0;
  let omitidas = 0;

  for (const nota of notas) {
    const clave = `${nota.categoria.toLowerCase()}|||${nota.titulo.toLowerCase()}`;

    if (existentes.has(clave)) {
      omitidas++;
      continue;
    }

    await pool.query(
      "INSERT INTO notas (categoria, titulo, contenido) VALUES ($1, $2, $3)",
      [nota.categoria, nota.titulo, nota.contenido]
    );

    existentes.add(clave);
    agregadas++;
  }

  console.log(
    `Listo. ${agregadas} notas agregadas, ${omitidas} ya existían y se omitieron.`
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Error cargando notas:", err.message);
  process.exit(1);
});
