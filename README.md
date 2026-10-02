# Bóveda de claves Jira — Node.js + PostgreSQL (instalación local)

Versión con base de datos PostgreSQL real y servidor en Node.js/Express.
Corre en tu propio computador. Tiene:

- Usuarios propios (creas el tuyo, y puedes crear otros después).
- Cambio de tu contraseña de acceso pidiendo la clave actual + la nueva.
- Cambio de la clave de cada empresa pidiendo la clave anterior + la nueva
  (si la clave anterior no coincide, no deja guardar el cambio).
- Buscador, mostrar/ocultar, copiar al portapapeles, agregar y eliminar
  empresas.
- Ícono 🔐 en la pestaña del navegador.
- Las claves se cifran (AES-256-GCM) antes de guardarse en PostgreSQL.

## 1. Requisitos

- **Node.js 18 o más nuevo** — https://nodejs.org (instalador normal, con
  "Add to PATH" marcado en Windows).
- **PostgreSQL** instalado y corriendo en tu equipo —
  https://www.postgresql.org/download/ (en Windows el instalador te pide
  poner una contraseña para el usuario `postgres`; anótala, la necesitas
  en el paso 3).

## 2. Crear la base de datos

Con PostgreSQL instalado, abre una terminal y entra a `psql` (en Windows
puedes usar "SQL Shell (psql)" que se instala junto con PostgreSQL):

```
psql -U postgres
```

Y dentro de psql:

```sql
CREATE DATABASE boveda_jira;
\q
```

Las tablas (`users`, `companies`) se crean solas la primera vez que
arrancas la app; no necesitas escribir más SQL a mano.

## 3. Configurar la app

Dentro de esta carpeta, copia `.env.example` a un archivo nuevo llamado
`.env` y edítalo con los datos de tu PostgreSQL:

```
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=la_contraseña_que_pusiste_al_instalar_postgres
PGDATABASE=boveda_jira
SESSION_SECRET=cualquier_texto_largo_y_aleatorio
PORT=5050
```

## 4. Instalar dependencias y arrancar

```
npm install
npm start
```

Abre en el navegador: **http://127.0.0.1:5050**

La primera vez te pedirá crear tu usuario. Esa es tu contraseña de acceso
a la bóveda; la puedes cambiar luego desde "Cambiar mi contraseña".

## 5. Cargar las empresas y claves que me diste

Con la app arrancada al menos una vez (para que existan las tablas y el
archivo `secret.key`), corre en otra terminal, desde la misma carpeta:

```
npm run seed -- claves_bd_jira.xlsx
```

o directamente:

```
node seed_data.js claves_bd_jira.xlsx
```

Esto lee el Excel e inserta cada empresa con su clave, cifradas, en
PostgreSQL. Si lo vuelves a correr no duplica las que ya existen.
También puedes agregar empresas manualmente desde "+ Agregar empresa"
dentro de la app.

## 5.1 Notas y comandos por apartados

Además de las claves de las empresas, la bóveda ahora tiene una sección
**"Notas"** (menú de arriba) para guardar apuntes técnicos organizados por
apartado (categoría): comandos de Linux/Windows, guías (Ventoy, pantalla
azul, etc.), scripts, o cualquier procedimiento que uses seguido.

- Cada nota tiene: **apartado** (categoría, ej. "Ventoy — preparar USB"),
  **título** y **contenido** (se guarda tal cual, con saltos de línea).
- Se pueden agregar, editar, copiar al portapapeles y eliminar desde la
  misma página, igual que las empresas. Las pestañas de arriba filtran
  por apartado y el buscador filtra por título/contenido.
- Para cargar de una vez las notas iniciales (comandos de Linux/Windows,
  Ventoy, iconos en blanco, instalación de programas y pantalla azul),
  corre una vez, con la app arrancada al menos una vez:

  ```
  npm run seed:notas
  ```

  o directamente:

  ```
  node seed_notas.js
  ```

  Puedes editar el archivo `seed_notas.js` (agregar o cambiar objetos del
  arreglo `notas`) y volver a correrlo cuantas veces quieras: no duplica
  las notas que ya tengan el mismo apartado + título.
- A diferencia de las claves de empresas, el contenido de las notas
  **no se cifra** (son comandos/guías, no contraseñas), así que se guarda
  como texto plano en PostgreSQL.

## 5.2 Apuntes Jaivaná (sección aparte)

Además de "Empresas" y "Notas", hay una tercera sección independiente:
**"Jaivaná"** (menú de arriba), pensada solo para los apuntes de soporte
del ERP Jaivaná (consultas SQL, casos de facturación electrónica/DIAN,
clonación de usuarios y permisos, vendedores, cartera/proveedores,
inventario, contabilidad, y una guía de Liquibase). Funciona igual que
"Notas" (apartados en pestañas, buscador, copiar/editar/eliminar), pero
guarda todo en su propia tabla (`jaivana_notas`) para no mezclarlo con
los apuntes generales de soporte técnico.

Para cargar de una vez los apuntes extraídos de tu documento
`APUNTES_JAIVANA-SOPORTE.docx` (ya divididos y agrupados en apartados
automáticamente), con la app arrancada al menos una vez:

```
npm run seed:jaivana
```

o directamente:

```
node seed_jaivana.js
```

Esto lee `jaivana_notas_data.json` (que va junto a `seed_jaivana.js`) y
agrega cada apunte a `jaivana_notas`. Puedes editar ese `.json` a mano
(mover un apunte de apartado, corregir un título, etc.) y volver a
correr el comando cuantas veces quieras: no duplica un apunte si el
apartado + título + contenido ya coinciden exactamente con uno
existente.

Nota: la separación en apartados (Facturación electrónica y DIAN,
Usuarios/roles y permisos, Vendedores, Terceros/cartera, Inventario y
cajas, Contabilidad, Apuntes sueltos Jaivaná, Liquibase) se hizo de
forma automática por palabras clave a partir del documento original, así
que puede que algún apunte quede en un apartado que no es el más
preciso; revísalos con calma la primera vez y muévelos de apartado desde
"Editar" si hace falta.

## 5.3 Subir archivos (.txt, .sql, .docx, .pdf) a Notas y Jaivaná — varios a la vez

Tanto en "Notas" como en "Jaivaná" hay un botón **"⬆ Subir archivo"** junto
a "+ Agregar...". Permite subir **uno o varios archivos a la vez** (hasta 20
por envío) `.txt`, `.sql`, `.docx` o `.pdf`, eligiendo un apartado
(categoría) para todos. Si subes un solo archivo, puedes ponerle un título;
si subes varios, cada uno queda con el nombre del archivo como título.

Al subir cada archivo, la app hace dos cosas a la vez:

1. **Guarda el archivo tal cual** en la base de datos, para que lo puedas
   descargar después con un clic (aparece un botón con el nombre del
   archivo debajo del contenido de la nota).
2. **Extrae el texto** del archivo (de `.docx` y `.pdf` con librerías que
   leen el documento; de `.txt` y `.sql` se toma el texto directo) y lo
   guarda como el contenido de una nota normal, para que puedas buscarlo,
   leerlo y copiarlo igual que las demás notas.

Si un PDF no tiene texto real (por ejemplo, es una imagen escaneada), la
nota queda con un aviso de que no se pudo extraer texto, pero el archivo
original sigue disponible para descargar.

**Tamaño máximo por archivo:** 100 MB por defecto (sin límite real en la
cantidad de líneas: se probó con un archivo de 90 MB y más de 200,000
líneas y quedó completo). Si necesitas más, agrega esta línea a tu archivo
`.env` y reinicia la app:

```
MAX_UPLOAD_MB=250
```

**Importante:** esta función necesita 3 paquetes nuevos de Node
(`multer`, `mammoth`, `pdf-parse`). Después de copiar los archivos de la
actualización, corre una vez:

```
npm install
```

para que se instalen (ya quedaron agregados en `package.json`). También
agrega columnas nuevas a las tablas `notas` y `jaivana_notas`
(`archivo_nombre`, `archivo_tipo`, `archivo_datos`); se crean solas la
próxima vez que arranques la app con `npm start` (no hace falta tocar la
base de datos a mano).

## 5.4 Imágenes, limpieza de espacios y SQL estilo editor

- **Imágenes:** al subir un `.docx` o `.pdf`, las imágenes se guardan en la base
  de datos y se muestran dentro de la nota (en el `.docx` en el mismo lugar donde
  estaban; en el `.pdf` al final, en "Imágenes del PDF"). Clic en una imagen para
  verla en grande. Se aceptan PNG, JPG, GIF, BMP y WEBP (formatos como EMF/WMF que
  el navegador no puede mostrar se omiten con un aviso). En el texto aparecen como
  una línea `[[IMG:1]]`: si borras esa línea al editar, la imagen deja de mostrarse.
- **Limpieza de espacios (al subir cualquier archivo):** quita caracteres
  invisibles y espacios raros, espacios al final de cada línea, junta espacios
  repetidos en el medio de una línea (sin tocar líneas con comillas, para no
  alterar textos de un SQL), deja máximo una línea en blanco seguida y elimina las
  líneas en blanco del inicio y del final. La sangría (espacios al inicio) se
  conserva.
- **SQL estilo editor:** las notas con SQL se muestran con fondo oscuro, número de
  línea y colores (palabras clave, textos entre comillas, números, funciones y
  comentarios). Las líneas que no son SQL (explicaciones) se ven en verde. Clic
  derecho sobre el contenido: "Vista de código" / "Ver como texto normal".
- **Límites:** archivos de hasta 60 MB; textos editados de hasta 50 MB.

## 5.5 Papelera (Notas y Jaivaná)

Al eliminar una nota, un apunte, o usar "Eliminar todo", **ya no se borra
de una vez**: se mueve a la papelera (menú de arriba, "🗑 Papelera", con un
número rojo que indica cuántos elementos tiene). Desde ahí puedes:

- **Restaurar** un elemento (vuelve a Notas o a Jaivaná tal cual estaba).
- **Eliminar definitivamente** un elemento (ahí sí ya no se puede recuperar).
- **Restaurar todo** o **Vaciar la papelera** de una vez.

No hay borrado automático por tiempo: lo que mandes a la papelera se queda
ahí hasta que tú decidas restaurarlo o vaciarla.

## 5.6 Visor de XML / JSON

Pestaña **"Visor XML/JSON"** en el menú de arriba: pegas un XML o un JSON
(la app detecta cuál de los dos es) y lo muestra formateado, con sangría y
colores, fácil de leer. Sirve para revisar respuestas de servicios o
archivos de configuración sin tener que abrir otro programa. No se guarda
nada de lo que pegues ahí, es solo para verlo en el momento.

## 5.6.1 Formateador de SQL

Pestaña **"SQL"** en el menú de arriba: pegas (o arrastras un archivo .sql) y
el SQL se limpia y ordena al estilo pgAdmin:

- Quita espacios, tabs y saltos de línea que sobran (los textos entre
  comillas, los bloques `$$...$$` / `$q$...$q$` y los comentarios no se tocan).
- Cada cláusula (`SELECT`, `FROM`, `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY`...)
  queda en su propia línea; `AND` / `OR` van sangrados debajo.
- Las listas de datos (`IN (...)`, columnas de un `INSERT`, tuplas de
  `VALUES`, argumentos largos) se parten en **filas de máximo 10 datos**
  (configurable en "Datos por fila").
- Opciones: palabras clave en MAYÚSCULAS / minúsculas / como están, columnas
  del `SELECT` una por línea o por filas, y sangría de 4, 2 espacios o tab.
- Además de la vista "Formateado" hay "Una línea por sentencia" (minificado).
  Se puede copiar o descargar como `.sql`.

- **Buscar y reemplazar** (botón 🔎 o Ctrl+H): con opciones Aa (mayúsculas) y
  .* (regex), "Reemplazar todo", y atajos para espacios dobles → uno, quitar
  espacios al inicio/fin de línea, espacios → `_` o quitar todos los espacios.
  "Usar resultado como entrada" pasa lo formateado a la caja para seguir editando.
- **Ctrl+Shift+F** formatea al instante.
- El cuadro donde pegas el SQL se **colorea mientras escribes** (palabras
  clave, textos, números, comentarios). Con más de ~120.000 caracteres se
  muestra sin colores para no trabar el navegador.
- Las listas `IN (...)` con paréntesis de más o anidados (`IN (1,2,(3,4,(5,6)`)
  se ordenan como una sola lista de datos, en filas de máximo N datos, y se
  muestra un aviso. Las subconsultas y comparaciones de filas
  `(a, b) IN ((1, 2), (3, 4))` no se tocan.

Todo se procesa en el navegador (archivo `public/sql-formatter.js`): no se
guarda ni se envía nada. No hay que instalar nada nuevo.

## 5.6.2 Informe diario (PDF)

Pestaña **"Informe"** del menú: es el "Formato diario de reporte de envío de
documentos electrónicos" del Word, hecho formulario.

- Se editan la fecha, la hora, el técnico, el título, las filas de la tabla
  (agregar / quitar empresas), el ticket de mesa de ayuda y el resumen diario.
- La vista previa de la derecha **es el PDF real** y se actualiza sola al
  escribir. "Descargar PDF" baja `INFORME_DOCUMENTOS_ELECTRONICOS_AAAA-MM-DD.pdf`.
- El PDF usa el mismo fondo (membrete Jaivaná), fuentes, columnas y posiciones
  del Word. Si la tabla es larga, pasa a otra hoja repitiendo el encabezado.
- **Observaciones:** cuadro de texto debajo de la tabla (hasta 3000 caracteres,
  respeta los saltos de línea). Sale en el PDF como "Observaciones:" bajo la
  tabla, y el ticket y el resumen bajan solos. Si está vacío no aparece nada y el
  PDF queda idéntico al formato original. Si el texto es largo, continúa en la
  hoja siguiente.
- **Totales automáticos:** "Total de empresas revisadas" y "Total de documentos
  aceptadas" se llenan solos con lo que pegaste en la pestaña **Aceptados**
  (número de empresas y suma de la columna de aceptados elegida allí). Cada campo
  tiene una casilla "Automático": desmárcala para escribir el valor a mano. Si
  vuelves a pegar datos en Aceptados, el informe se actualiza solo; si los datos
  son de hace más de un día, avisa. El resumen viaja por el navegador
  (clave `boveda-aceptados-resumen`), no por la base de datos.
- La columna **Empresa** es un desplegable con las empresas de la pestaña
  **Empresas** (tabla `companies`; solo se leen los nombres, nunca las claves):
  se abre al hacer clic, se filtra al escribir (sin importar tildes ni
  mayúsculas), marca las que ya están en la tabla y también acepta un nombre que
  no esté en la lista.
- La lista se mantiene al día sola: al abrir el desplegable y al volver a la
  pestaña del informe se vuelve a leer la tabla (`GET /informe/empresas`), así
  que una empresa nueva aparece sin recargar la página.
- **☰ Elegir varias de la lista** abre una ventana con buscador y casillas: marcas
  las empresas y se agregan de una vez a la tabla (primero llena las filas vacías).
- Lo escrito se recuerda en el navegador; si es de otro día, la fecha y la hora
  vuelven a ser las de hoy.
- Archivos: `views/informe.ejs`, `informe-pdf.js` y el fondo en
  `assets/informe-fondo.jpeg`. Usa la librería `pdfkit` (ejecuta `npm install`).

## 5.7 Buscar dentro de una nota, con flechas

Al abrir una nota o apunte y escribir en "Buscar dentro de..." aparecen
dos flechas (▲ ▼) junto al contador de resultados, para saltar a la
coincidencia anterior o siguiente sin tener que desplazarte a mano (también
funciona con Enter / Shift+Enter desde el teclado). El contador muestra en
qué coincidencia vas, por ejemplo "3 de 12 líneas".

## 6. Uso diario

Con PostgreSQL corriendo (normalmente arranca solo con el sistema),
entra a la carpeta y ejecuta `npm start`. Abre
`http://127.0.0.1:5050`. Para detener la app, cierra la terminal o
Ctrl+C.

## Notas de seguridad

- Las claves se cifran con una llave que se guarda en el archivo
  `secret.key`, generado automáticamente la primera vez que arrancas la
  app. **No borres ni compartas ese archivo**: sin él no se pueden
  descifrar las claves guardadas en PostgreSQL. Si mueves la app a otro
  computador, copia también `secret.key` (o exporta/importa los datos
  ya descifrados y vuelve a cifrarlos).
- El archivo `.env` tiene la contraseña de tu PostgreSQL: no lo
  compartas ni lo subas a ningún repositorio público.
- Todo corre en tu propio equipo (127.0.0.1); nada se envía a internet.
- Para que otra persona en tu misma red (no solo tú) pueda entrar,
  habría que cambiar `app.listen(PORT, "127.0.0.1", ...)` por
  `app.listen(PORT, "0.0.0.0", ...)` en `server.js`; no lo dejé así por
  defecto porque expondría la bóveda a la red.
