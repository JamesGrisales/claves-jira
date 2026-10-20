const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvPath = 'c:\\Users\\JamesGrisales\\Downloads\\Others\\campos tablas';
const outPath = path.join(__dirname, 'public', 'sql-columnas.js');

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let lineCount = 0;
const tableCols = {}; // lowercase_table -> array of column names

function parseCSVLine(line) {
  const match = line.match(/^"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
  if (match) {
    return {
      esquema: match[1],
      tabla: match[2],
      columna: match[3],
      tipo: match[4]
    };
  }
  return null;
}

rl.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) return;
  const row = parseCSVLine(line);
  if (!row || row.esquema !== 'public') return;

  const t = row.tabla.trim();
  // Filter out temporary tables
  if (/^(tmp_|conteo0|dtmp_|copia_|cruce_|elresumenmigi)/i.test(t)) return;

  const key = t.toLowerCase();
  if (!tableCols[key]) {
    tableCols[key] = [];
  }
  const col = row.columna.trim();
  if (col && !tableCols[key].includes(col)) {
    tableCols[key].push(col);
  }
});

rl.on('close', () => {
  console.log(`Leídas ${lineCount} líneas del CSV.`);
  const tableCount = Object.keys(tableCols).length;
  let totalCols = 0;
  for (const t in tableCols) {
    totalCols += tableCols[t].length;
  }
  console.log(`Tablas extraídas: ${tableCount}, Total columnas: ${totalCols}`);

  const header = `/* Columnas de las tablas de la BD para autocompletado y Masivo SQL.
   Generado automáticamente. Para regenerar: node generar_columnas.js */\nwindow.SQL_COLUMNAS = `;
  
  const content = header + JSON.stringify(tableCols) + ';\n';
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Archivo generado con éxito en ${outPath} (${(content.length / 1024).toFixed(1)} KB)`);
});
