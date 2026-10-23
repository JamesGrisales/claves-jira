"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ (-1)) >>> 0;
}

function chunkPng(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function construirPng(w, h, rawData) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = chunkPng("IHDR", ihdrData);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunkPng("IDAT", compressed);
  const iendChunk = chunkPng("IEND", Buffer.alloc(0));
  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function crearPngCirculoGlow(radio = 48) {
  const size = radio * 2;
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const dx = x - radio;
      const dy = y - radio;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radio) {
        const factor = 1 - (dist / radio);
        // Exponential falloff for soft diffusion
        const alpha = Math.min(255, Math.round(255 * Math.pow(factor, 1.45)));
        rawData[offset++] = 225; // R #e11d48
        rawData[offset++] = 29;  // G
        rawData[offset++] = 72;  // B
        rawData[offset++] = alpha; // A
      } else {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }
  return construirPng(width, height, rawData);
}

function crearPngCursor(w = 32, h = 32) {
  const rawData = Buffer.alloc(h * (1 + w * 4));
  let offset = 0;

  const arrowPoints = [
    [0, 0], [0, 20], [5, 16], [9, 24], [13, 22], [9, 14], [16, 14]
  ];

  function puntoEnPoligono(px, py, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i][0], yi = vertices[i][1];
      const xj = vertices[j][0], yj = vertices[j][1];
      const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function distAlBorde(px, py, vertices) {
    let minD = 999;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const x1 = vertices[i][0], y1 = vertices[i][1];
      const x2 = vertices[j][0], y2 = vertices[j][1];
      const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = lenSq !== 0 ? dot / lenSq : -1;
      let xx, yy;
      if (param < 0) { xx = x1; yy = y1; }
      else if (param > 1) { xx = x2; yy = y2; }
      else { xx = x1 + param * C; yy = y1 + param * D; }
      const d = Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
      if (d < minD) minD = d;
    }
    return minD;
  }

  for (let y = 0; y < h; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < w; x++) {
      const inside = puntoEnPoligono(x, y, arrowPoints);
      const distBorder = distAlBorde(x, y, arrowPoints);

      if (inside) {
        if (distBorder < 1.35) {
          rawData[offset++] = 15; rawData[offset++] = 23; rawData[offset++] = 42; rawData[offset++] = 255;
        } else {
          rawData[offset++] = 255; rawData[offset++] = 255; rawData[offset++] = 255; rawData[offset++] = 255;
        }
      } else if (distBorder < 1.25) {
        const a = Math.round(255 * (1 - distBorder / 1.25));
        rawData[offset++] = 15; rawData[offset++] = 23; rawData[offset++] = 42; rawData[offset++] = a;
      } else if (distAlBorde(x - 1.5, y - 1.5, arrowPoints) < 2.0) {
        rawData[offset++] = 0; rawData[offset++] = 0; rawData[offset++] = 0; rawData[offset++] = 85;
      } else {
        rawData[offset++] = 0; rawData[offset++] = 0; rawData[offset++] = 0; rawData[offset++] = 0;
      }
    }
  }

  return construirPng(w, h, rawData);
}

function generarAssets() {
  const glowBuf = crearPngCirculoGlow(48);
  const cursorBuf = crearPngCursor(32, 32);

  const targets = [
    path.join(__dirname, "assets"),
    path.join(__dirname, "boveda_node", "assets")
  ];

  for (const dir of targets) {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, "manual-click-glow.png"), glowBuf);
      fs.writeFileSync(path.join(dir, "manual-mouse-cursor.png"), cursorBuf);
      console.log("Assets guardados en:", dir);
    }
  }
}

if (require.main === module) {
  generarAssets();
}

module.exports = { crearPngCirculoGlow, crearPngCursor, generarAssets };
