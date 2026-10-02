/* ==========================================================================
   Formateador SQL para PostgreSQL (estilo pgAdmin)
   - Quita espacios, tabs y saltos de línea que sobran (fuera de textos entre comillas).
   - Cada cláusula (SELECT, FROM, WHERE, JOIN...) queda en su propia línea.
   - Listas de datos (IN (...), columnas, VALUES): máximo N datos por fila.
   - No toca el contenido de textos '...', $$...$$ / $q$...$q$, "identificadores" ni comentarios.
   Funciona en el navegador (window.SqlFormatter) y en Node (require).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SqlFormatter = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KEYWORDS = {};
  ('SELECT FROM WHERE AND OR NOT IN IS NULL LIKE ILIKE SIMILAR BETWEEN AS ON JOIN INNER LEFT RIGHT FULL OUTER CROSS ' +
   'NATURAL USING GROUP BY ORDER HAVING LIMIT OFFSET UNION ALL INTERSECT EXCEPT DISTINCT INSERT INTO VALUES UPDATE SET ' +
   'DELETE RETURNING WITH RECURSIVE CASE WHEN THEN ELSE END ASC DESC NULLS EXISTS ANY SOME CREATE TABLE INDEX UNIQUE ' +
   'DROP ALTER ADD COLUMN PRIMARY FOREIGN REFERENCES DEFAULT CHECK CONSTRAINT IF TRUE FALSE OVER PARTITION WINDOW FETCH ' +
   'FOR CONFLICT DO NOTHING TRUNCATE BEGIN COMMIT ROLLBACK EXPLAIN ANALYZE VIEW REPLACE TEMP TEMPORARY CASCADE RESTRICT ' +
   'LATERAL FILTER TO ONLY GRANT REVOKE CURRENT_DATE CURRENT_TIME CURRENT_TIMESTAMP')
    .split(' ').forEach(function (k) { KEYWORDS[k] = true; });

  // Palabras reservadas que a la vez se usan como función: van pegadas al paréntesis
  var FUNC_KEYWORDS = { LEFT: 1, RIGHT: 1, REPLACE: 1, IF: 1 };
  // Después de estas palabras, un signo + o - es unario (no lleva espacio después)
  var NOT_OPERAND_END = { NULL: 1, TRUE: 1, FALSE: 1, END: 1, CURRENT_DATE: 1, CURRENT_TIME: 1, CURRENT_TIMESTAMP: 1 };
  var JOIN_PREFIX = { NATURAL: 1, INNER: 1, LEFT: 1, RIGHT: 1, FULL: 1, OUTER: 1, CROSS: 1 };
  var DDL_START = { CREATE: 1, ALTER: 1, DROP: 1, TRUNCATE: 1, GRANT: 1, REVOKE: 1 };

  var OPS3 = ['->>', '#>>', '!~*'];
  var OPS2 = ['::', '<>', '!=', '>=', '<=', '||', '->', '#>', '@>', '<@', '&&', '~*', '!~', '=>', ':=', '<<', '>>', '?|', '?&'];
  var OPS1 = '+-*/%=<>~!@#^&|?:';

  var RE_WORD = /^[\p{L}_][\p{L}\p{N}_$]*/u;
  var RE_NUM = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
  var RE_DOLLAR = /^\$(?:[\p{L}_][\p{L}\p{N}_]*)?\$/u;
  var RE_PARAM = /^\$\d+/;
  var RE_NAMED = /^:[\p{L}_][\p{L}\p{N}_]*/u;

  /* ------------------------------------------------------------------ */
  /* Tokenizador                                                         */
  /* ------------------------------------------------------------------ */
  function tokenize(src) {
    var toks = [], warnings = [], i = 0, n = src.length, ch, j, m, lastLen = 0, lastStart = 0, q;
    function line(pos) { return src.slice(0, pos).split('\n').length; }

    while (i < n) {
      if (toks.length > lastLen) { for (q = lastLen; q < toks.length; q++) toks[q].s = lastStart; lastLen = toks.length; }
      lastStart = i;
      ch = src[i];

      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v' || ch === '\u00a0' || ch === '\ufeff') { i++; continue; }
      if (/\s/.test(ch)) { i++; continue; }

      // Comentario de línea
      if (ch === '-' && src[i + 1] === '-') {
        j = src.indexOf('\n', i); if (j < 0) j = n;
        toks.push({ t: 'lc', v: src.slice(i, j).replace(/\s+$/, '') });
        i = j; continue;
      }
      // Comentario de bloque
      if (ch === '/' && src[i + 1] === '*') {
        j = src.indexOf('*/', i + 2);
        if (j < 0) { warnings.push('Comentario /* sin cerrar (línea ' + line(i) + ')'); j = n; } else j += 2;
        toks.push({ t: 'bc', v: src.slice(i, j) });
        i = j; continue;
      }
      // Texto entre comillas simples (con prefijo E, N, B, X opcional)
      if (ch === "'" || (/[eEnNbBxX]/.test(ch) && src[i + 1] === "'")) {
        var start = i, esc = (ch === 'e' || ch === 'E');
        if (ch !== "'") i++;
        i++;
        var closed = false;
        while (i < n) {
          if (esc && src[i] === '\\') { i += 2; continue; }
          if (src[i] === "'") {
            if (src[i + 1] === "'") { i += 2; continue; }
            i++; closed = true; break;
          }
          i++;
        }
        if (!closed) warnings.push("Texto con comilla simple ' sin cerrar (línea " + line(start) + ')');
        toks.push({ t: 'str', v: src.slice(start, Math.min(i, n)) });
        continue;
      }
      // Dollar-quoting: $$ ... $$  o  $q$ ... $q$
      if (ch === '$') {
        m = RE_DOLLAR.exec(src.slice(i, i + 80));
        if (m) {
          var tag = m[0];
          j = src.indexOf(tag, i + tag.length);
          if (j < 0) { warnings.push('Texto ' + tag + ' sin cerrar (línea ' + line(i) + ')'); j = n; } else j += tag.length;
          toks.push({ t: 'str', v: src.slice(i, j) });
          i = j; continue;
        }
        m = RE_PARAM.exec(src.slice(i, i + 12));
        if (m) { toks.push({ t: 'w', v: m[0], u: m[0] }); i += m[0].length; continue; }
      }
      // Identificador entre comillas dobles
      if (ch === '"') {
        j = i + 1;
        var okq = false;
        while (j < n) {
          if (src[j] === '"') { if (src[j + 1] === '"') { j += 2; continue; } j++; okq = true; break; }
          j++;
        }
        if (!okq) warnings.push('Identificador con comilla doble " sin cerrar (línea ' + line(i) + ')');
        toks.push({ t: 'qi', v: src.slice(i, Math.min(j, n)) });
        i = j; continue;
      }
      // Número
      if ((ch >= '0' && ch <= '9') || (ch === '.' && src[i + 1] >= '0' && src[i + 1] <= '9')) {
        m = RE_NUM.exec(src.slice(i, i + 60));
        if (m) { toks.push({ t: 'num', v: m[0] }); i += m[0].length; continue; }
      }
      // Parámetro con nombre  :nombre  (pero no el cast ::)
      if (ch === ':' && src[i + 1] !== ':' && (i === 0 || src[i - 1] !== ':')) {
        m = RE_NAMED.exec(src.slice(i, i + 80));
        if (m) { toks.push({ t: 'w', v: m[0], u: m[0] }); i += m[0].length; continue; }
      }
      // Palabra
      m = RE_WORD.exec(src.slice(i, i + 200));
      if (m) { toks.push({ t: 'w', v: m[0], u: m[0].toUpperCase() }); i += m[0].length; continue; }
      // Puntuación
      if (ch === '(' || ch === ')' || ch === '[' || ch === ']' || ch === ',' || ch === ';' || ch === '.') {
        toks.push({ t: 'p', v: ch }); i++; continue;
      }
      // Operadores
      var s3 = src.substr(i, 3), s2 = src.substr(i, 2);
      if (OPS3.indexOf(s3) >= 0) { toks.push({ t: 'op', v: s3 }); i += 3; continue; }
      if (OPS2.indexOf(s2) >= 0) { toks.push({ t: 'op', v: s2 }); i += 2; continue; }
      if (OPS1.indexOf(ch) >= 0) { toks.push({ t: 'op', v: ch }); i++; continue; }
      // Cualquier otro carácter se conserva tal cual
      toks.push({ t: 'op', v: ch }); i++;
    }
    for (q = lastLen; q < toks.length; q++) toks[q].s = lastStart;
    return { tokens: toks, warnings: warnings };
  }

  /* ------------------------------------------------------------------ */
  /* Datos vs. sintaxis: divide el texto en trozos                        */
  /*   data = texto entre comillas ('...', $$...$$)                       */
  /*   prot = comentarios e identificadores "entre comillas dobles"       */
  /*   code = la sintaxis SQL (palabras, operadores, espacios entre ellos)*/
  /* ------------------------------------------------------------------ */
  function segments(src) {
    src = String(src == null ? '' : src);
    var toks = tokenize(src).tokens, out = [], pos = 0, k, t, end;
    function add(kind, text) {
      if (!text) return;
      var last = out[out.length - 1];
      if (last && last.kind === kind && kind === 'code') last.text += text;
      else out.push({ kind: kind, text: text });
    }
    for (k = 0; k < toks.length; k++) {
      t = toks[k];
      if (t.t !== 'str' && t.t !== 'lc' && t.t !== 'bc' && t.t !== 'qi') continue;
      add('code', src.slice(pos, t.s));
      end = t.s + t.v.length;
      add(t.t === 'str' ? 'data' : 'prot', src.slice(t.s, end));
      pos = end;
    }
    add('code', src.slice(pos));
    return out;
  }

  var RE_PAD = /^([eEnNbBxX]?')([ \t]*)([\s\S]*?)([ \t]*)('?)$/;

  // Quita los espacios del inicio y del final de cada dato 'texto'. ' 1 ' -> '1'.
  // Los datos que son solo espacios (' ') se dejan como están.
  function trimData(src) {
    var count = 0, text = segments(src).map(function (sg) {
      if (sg.kind !== 'data') return sg.text;
      var m = RE_PAD.exec(sg.text);
      if (!m || !m[3] || (!m[2] && !m[4])) return sg.text;
      count++;
      return m[1] + m[3] + m[5];
    }).join('');
    return { text: text, count: count };
  }

  function paddedCount(src) {
    var n = 0;
    segments(src).forEach(function (sg) {
      if (sg.kind !== 'data') return;
      var m = RE_PAD.exec(sg.text);
      if (m && m[3] && (m[2] || m[4])) n++;
    });
    return n;
  }

  /* ------------------------------------------------------------------ */
  /* Utilidades sobre listas de tokens                                   */
  /* ------------------------------------------------------------------ */
  function matchParens(toks) {
    var m = new Array(toks.length), st = [], i, t, j;
    for (i = 0; i < toks.length; i++) {
      m[i] = -1; t = toks[i];
      if (t.t === 'p') {
        if (t.v === '(') st.push(i);
        else if (t.v === ')' && st.length) { j = st.pop(); m[j] = i; m[i] = j; }
      }
    }
    return m;
  }

  function isW(t, u) { return t && t.t === 'w' && t.u === u; }
  function isP(t, v) { return t && t.t === 'p' && t.v === v; }
  function isKeyword(t, prev) {
    if (!t || t.t !== 'w') return false;
    if (KEYWORDS[t.u]) return true;
    return t.u === 'KEY' && prev && (prev.u === 'PRIMARY' || prev.u === 'FOREIGN');
  }

  function kwText(t, o, prev) {
    if (t.t !== 'w') return t.v;
    if (!isKeyword(t, prev)) return t.v;
    return o.kw === 'upper' ? t.u : (o.kw === 'lower' ? t.v.toLowerCase() : t.v);
  }

  function lcToBc(t) {
    return { t: 'bc', v: '/* ' + t.v.replace(/^--\s?/, '').replace(/\*\//g, '* /') + ' */' };
  }
  function lastLcToBc(toks) {
    if (!toks.length || toks[toks.length - 1].t !== 'lc') return toks;
    var c = toks.slice(); c[c.length - 1] = lcToBc(c[c.length - 1]); return c;
  }

  function splitComma(toks) {
    var m = matchParens(toks), out = [], cur = [], br = 0, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '(') && m[i] > i) {
        for (var k = i; k <= m[i]; k++) cur.push(toks[k]);
        i = m[i]; continue;
      }
      if (isP(t, '[')) br++;
      else if (isP(t, ']') && br > 0) br--;
      if (isP(t, ',') && br === 0) { out.push(lastLcToBc(cur)); cur = []; continue; }
      cur.push(t);
    }
    out.push(cur);
    return out;
  }

  function nonEmpty(a) { return a.length > 0; }
  function firstSig(toks) {
    for (var i = 0; i < toks.length; i++) if (toks[i].t !== 'lc' && toks[i].t !== 'bc') return toks[i];
    return null;
  }
  function isSub(content) {
    var f = firstSig(content);
    return !!f && f.t === 'w' && (f.u === 'SELECT' || f.u === 'WITH' || f.u === 'VALUES');
  }

  function needSpace(prev, t, prevUnary) {
    if (!prev || prevUnary) return false;
    if (t.t === 'p') {
      if (t.v === ',' || t.v === ';' || t.v === ')' || t.v === ']' || t.v === '.') return false;
      if (t.v === '[') return !(prev.t === 'w' || prev.t === 'qi' || (prev.t === 'p' && (prev.v === ')' || prev.v === ']')));
    }
    if (t.t === 'op' && t.v === '::') return false;
    if (prev.t === 'op' && prev.v === '::') return false;
    if (prev.t === 'p' && (prev.v === '(' || prev.v === '[' || prev.v === '.')) return false;
    return true;
  }

  function expectsOperand(prev) {
    if (!prev) return true;
    if (prev.t === 'op') return prev.v !== '::';
    if (prev.t === 'p') return prev.v === '(' || prev.v === ',' || prev.v === '[';
    if (prev.t === 'w' && KEYWORDS[prev.u] && !NOT_OPERAND_END[prev.u]) return true;
    return false;
  }

  function chunk(arr, n) {
    var out = [];
    for (var i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Expresiones (todo lo que va dentro de una cláusula)                 */
  /* ------------------------------------------------------------------ */
  function findEnd(toks, i, m) {
    var depth = 0;
    for (var j = i; j < toks.length; j++) {
      if (isP(toks[j], '(') && m[j] > j) { j = m[j]; continue; }
      if (isW(toks[j], 'CASE')) depth++;
      else if (isW(toks[j], 'END')) { depth--; if (depth === 0) return j; }
    }
    return -1;
  }

  function wrapParen(items, base, o) {
    var rows = chunk(items, o.perRow).map(function (r) {
      return r.map(function (it) { return renderExpr(it, base + o.indent, o); }).join(', ');
    });
    return '(\n' + rows.map(function (r) { return base + o.indent + r; }).join(',\n') + '\n' + base + ')';
  }

  function renderCase(caseTok, endTok, inner, ind, o) {
    var m = matchParens(inner), parts = [{ kw: '', toks: [] }], cur = parts[0], depth = 0, j, t;
    for (j = 0; j < inner.length; j++) {
      t = inner[j];
      if (isP(t, '(') && m[j] > j) { for (var k = j; k <= m[j]; k++) cur.toks.push(inner[k]); j = m[j]; continue; }
      if (isW(t, 'CASE')) depth++;
      else if (isW(t, 'END')) depth--;
      if (depth === 0 && (isW(t, 'WHEN') || isW(t, 'ELSE'))) {
        cur = { kw: kwText(t, o), toks: [] }; parts.push(cur); continue;
      }
      cur.toks.push(t);
    }
    var sub = ind + o.indent;
    var out = kwText(caseTok, o);
    if (parts[0].toks.length) out += ' ' + renderExpr(parts[0].toks, ind, o);
    for (j = 1; j < parts.length; j++) {
      out += '\n' + sub + parts[j].kw + (parts[j].toks.length ? ' ' + renderExpr(parts[j].toks, sub, o) : '');
    }
    return out + '\n' + ind + kwText(endTok, o);
  }

  // Convierte una lista de tokens en texto en una sola pasada, con espaciado limpio.
  function renderExpr(toks, ind, o, ctx) {
    var m = matchParens(toks), s = '', prev = null, prevUnary = false, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];

      if (t.t === 'lc') {
        if (o.flat) t = lcToBc(t);
        else {
          s += (s && prev ? ' ' : '') + t.v;
          if (i < toks.length - 1) s += '\n' + ind;
          prev = null; prevUnary = false; continue;
        }
      }

      // CASE ... END
      if (!o.flat && isW(t, 'CASE')) {
        var e = findEnd(toks, i, m);
        if (e > i) {
          s += (needSpace(prev, t, prevUnary) ? ' ' : '') + renderCase(t, toks[e], toks.slice(i + 1, e), ind, o);
          prev = { t: 'w', u: 'END', v: 'END' }; prevUnary = false; i = e; continue;
        }
      }

      // Paréntesis
      if (isP(t, '(') && m[i] > i) {
        var content = toks.slice(i + 1, m[i]);
        var funcLike = !(ctx && ctx.spaceParen) && prev &&
          ((prev.t === 'w' && (!isKeyword(prev) || FUNC_KEYWORDS[prev.u])) || prev.t === 'qi');
        var sp = !funcLike && needSpace(prev, t, prevUnary);
        var piece;
        content = lastLcToBc(content);
        if (o.flat) {
          piece = '(' + renderExpr(content, ind, o) + ')';
        } else if (isSub(content)) {
          piece = '(\n' + formatStatement(content, ind + o.indent, o) + '\n' + ind + ')';
        } else {
          var items = splitComma(content);
          piece = items.length > o.perRow
            ? wrapParen(items, ind, o)
            : '(' + items.map(function (it) { return renderExpr(it, ind, o); }).join(', ') + ')';
        }
        s += (sp ? ' ' : '') + piece;
        prev = { t: 'p', v: ')' }; prevUnary = false; i = m[i]; continue;
      }

      var txt = t.t === 'w' ? kwText(t, o, prev) : t.v;
      s += (needSpace(prev, t, prevUnary) ? ' ' : '') + txt;

      prevUnary = t.t === 'op' && (t.v === '-' || t.v === '+') && expectsOperand(prev);
      prev = t;
    }
    return s;
  }

  /* ------------------------------------------------------------------ */
  /* Sentencias: se separan en cláusulas                                 */
  /* ------------------------------------------------------------------ */
  function clauseAt(toks, i, atStart) {
    var w = toks[i].u;
    var n1 = toks[i + 1] && toks[i + 1].t === 'w' ? toks[i + 1].u : null;
    var n2 = toks[i + 2] && toks[i + 2].t === 'w' ? toks[i + 2].u : null;
    var p1 = toks[i - 1] && toks[i - 1].t === 'w' ? toks[i - 1].u : null;
    var p2 = toks[i - 2] && toks[i - 2].t === 'w' ? toks[i - 2].u : null;
    function c(key, len) { return { key: key, len: len, words: toks.slice(i, i + len) }; }
    var k;
    switch (w) {
      case 'SELECT': case 'HAVING': case 'WHERE': case 'LIMIT': case 'OFFSET': case 'VALUES':
      case 'RETURNING': case 'WINDOW': case 'FETCH': case 'SET':
        return c(w, 1);
      case 'FROM':
        if (p1 === 'DISTINCT' && (p2 === 'IS' || p2 === 'NOT')) return null;
        return c('FROM', 1);
      case 'WITH': return atStart ? c('WITH', 1) : null;
      case 'INSERT': return n1 === 'INTO' ? c('INSERT INTO', 2) : null;
      case 'DELETE': return n1 === 'FROM' ? c('DELETE FROM', 2) : null;
      case 'UPDATE':
        return (p1 === 'FOR' || p1 === 'DO' || p1 === 'ON' || p1 === 'OF' || p1 === 'BEFORE' || p1 === 'AFTER') ? null : c('UPDATE', 1);
      case 'GROUP': case 'ORDER': return n1 === 'BY' ? c(w + ' BY', 2) : null;
      case 'UNION': case 'INTERSECT': case 'EXCEPT':
        return (n1 === 'ALL' || n1 === 'DISTINCT') ? c(w + ' ' + n1, 2) : c(w, 1);
      case 'ON': return n1 === 'CONFLICT' ? c('ON CONFLICT', 2) : null;
      case 'DO':
        if (n1 === 'UPDATE' && n2 === 'SET') return c('DO UPDATE SET', 3);
        return n1 === 'NOTHING' ? c('DO NOTHING', 2) : null;
      case 'FOR': return (n1 === 'UPDATE' || n1 === 'SHARE') ? c('FOR ' + n1, 2) : null;
      case 'NATURAL': case 'INNER': case 'LEFT': case 'RIGHT': case 'FULL': case 'CROSS': case 'JOIN':
        k = i;
        while (toks[k] && toks[k].t === 'w' && JOIN_PREFIX[toks[k].u]) k++;
        if (toks[k] && isW(toks[k], 'JOIN')) return c('JOIN', k - i + 1);
        return null;
    }
    return null;
  }

  function splitClauses(toks, o) {
    var m = matchParens(toks), segs = [{ key: '', kw: '', toks: [] }], cur = segs[0], onlyComments = true, i, t, c;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '(') && m[i] > i) {
        for (var k = i; k <= m[i]; k++) cur.toks.push(toks[k]);
        i = m[i]; onlyComments = false; continue;
      }
      c = t.t === 'w' ? clauseAt(toks, i, onlyComments) : null;
      if (c) {
        var prevW = null;
        cur = { key: c.key, kw: c.words.map(function (w) { var r = kwText(w, o, prevW); prevW = w; return r; }).join(' '), toks: [] };
        segs.push(cur); i += c.len - 1; onlyComments = false; continue;
      }
      if (t.t !== 'lc' && t.t !== 'bc') onlyComments = false;
      cur.toks.push(t);
    }
    return segs.filter(function (s) { return s.key !== '' || s.toks.length; });
  }

  // Divide una condición en partes separadas por AND / OR (respeta BETWEEN..AND, CASE y paréntesis)
  function splitLogic(toks, o) {
    var m = matchParens(toks), parts = [{ op: '', toks: [] }], cur = parts[0], caseDepth = 0, between = 0, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '(') && m[i] > i) { for (var k = i; k <= m[i]; k++) cur.toks.push(toks[k]); i = m[i]; continue; }
      if (t.t === 'w') {
        if (t.u === 'CASE') caseDepth++;
        else if (t.u === 'END' && caseDepth > 0) caseDepth--;
        else if (caseDepth === 0) {
          if (t.u === 'BETWEEN') between++;
          else if (t.u === 'AND' && between > 0) between--;
          else if (t.u === 'AND' || t.u === 'OR') { cur = { op: kwText(t, o), toks: [] }; parts.push(cur); continue; }
        }
      }
      cur.toks.push(t);
    }
    return parts;
  }

  function renderLogic(toks, ind, o) {
    var parts = splitLogic(toks, o), sub = ind + o.indent;
    var out = renderExpr(parts[0].toks, ind, o);
    for (var k = 1; k < parts.length; k++) {
      out += '\n' + sub + parts[k].op + ' ' + renderExpr(parts[k].toks, sub, o);
    }
    return out;
  }

  function rowsOf(items, ind, o) {
    return chunk(items, o.perRow).map(function (r) {
      return ind + r.map(function (it) { return renderExpr(it, ind, o); }).join(', ');
    });
  }

  function tupleStr(tp, base, o) {
    var m = matchParens(tp);
    if (tp.length >= 2 && isP(tp[0], '(') && m[0] === tp.length - 1) {
      var items = splitComma(lastLcToBc(tp.slice(1, -1)));
      if (items.length <= o.perRow) {
        return '(' + items.map(function (it) { return renderExpr(it, base, o); }).join(', ') + ')';
      }
      return wrapParen(items, base, o);
    }
    return renderExpr(tp, base, o);
  }

  function renderSeg(seg, ind, o) {
    var sub = ind + o.indent, kw = seg.kw, body = seg.toks, key = seg.key, items, out, idx, k;

    if (key === 'SELECT' || key === 'RETURNING' || key === 'SET' || key === 'DO UPDATE SET') {
      items = splitComma(body).filter(nonEmpty);
      if (!items.length) return ind + kw;
      if (items.length === 1) return ind + kw + ' ' + renderExpr(items[0], ind, o);
      if (o.selectMode === 'group' && key === 'SELECT') {
        return ind + kw + '\n' + rowsOf(items, sub, o).join(',\n');
      }
      return ind + kw + '\n' + items.map(function (it) { return sub + renderExpr(it, sub, o); }).join(',\n');
    }

    if (key === 'FROM' || key === 'GROUP BY' || key === 'ORDER BY') {
      items = splitComma(body).filter(nonEmpty);
      if (!items.length) return ind + kw;
      if (items.length <= o.perRow) {
        return ind + kw + ' ' + items.map(function (it) { return renderExpr(it, ind, o); }).join(', ');
      }
      return ind + kw + '\n' + rowsOf(items, sub, o).join(',\n');
    }

    if (key === 'WHERE' || key === 'HAVING') {
      return body.length ? ind + kw + ' ' + renderLogic(body, ind, o) : ind + kw;
    }

    if (key === 'JOIN') {
      var mm = matchParens(body);
      idx = -1;
      for (k = 0; k < body.length; k++) {
        if (isP(body[k], '(') && mm[k] > k) { k = mm[k]; continue; }
        if (isW(body[k], 'ON')) { idx = k; break; }
      }
      var tbl = idx < 0 ? body : body.slice(0, idx);
      out = ind + kw + (tbl.length ? ' ' + renderExpr(tbl, ind, o) : '');
      if (idx >= 0) out += ' ' + kwText(body[idx], o) + ' ' + renderLogic(body.slice(idx + 1), ind, o);
      return out;
    }

    if (key === 'VALUES') {
      var tuples = splitComma(body).filter(nonEmpty);
      if (!tuples.length) return ind + kw;
      if (tuples.length === 1) return ind + kw + ' ' + tupleStr(tuples[0], ind, o);
      return ind + kw + '\n' + tuples.map(function (tp) { return sub + tupleStr(tp, sub, o); }).join(',\n');
    }

    if (key === 'WITH') {
      items = splitComma(body).filter(nonEmpty);
      return ind + kw + ' ' + items.map(function (it) { return renderExpr(it, ind, o); }).join(',\n' + ind);
    }

    if (key === 'INSERT INTO' || key === 'ON CONFLICT') {
      return ind + kw + (body.length ? ' ' + renderExpr(body, ind, o, { spaceParen: true }) : '');
    }

    return ind + kw + (body.length ? ' ' + renderExpr(body, ind, o) : '');
  }

  function formatGeneric(toks, ind, o) {
    var m = matchParens(toks), i, k;
    // CREATE VIEW ... AS SELECT ...   /   CREATE TABLE ... AS SELECT ...
    for (i = 0; i < toks.length - 1; i++) {
      if (isP(toks[i], '(') && m[i] > i) { i = m[i]; continue; }
      if (isW(toks[i], 'AS') && (isW(toks[i + 1], 'SELECT') || isW(toks[i + 1], 'WITH'))) {
        return ind + renderExpr(toks.slice(0, i + 1), ind, o) + '\n' + formatStatement(toks.slice(i + 1), ind, o);
      }
    }
    // CREATE TABLE t ( columnas ... ): una definición por línea
    var head = firstSig(toks);
    var hasTable = false;
    for (k = 0; k < Math.min(toks.length, 8); k++) if (isW(toks[k], 'TABLE')) hasTable = true;
    if (head && head.u === 'CREATE' && hasTable) {
      for (i = 0; i < toks.length; i++) {
        if (isP(toks[i], '(') && m[i] > i) {
          var content = toks.slice(i + 1, m[i]);
          if (isSub(content)) break;
          var items = splitComma(lastLcToBc(content)).filter(nonEmpty), sub = ind + o.indent;
          return ind + renderExpr(toks.slice(0, i), ind, o) + ' (\n' +
            items.map(function (it) { return sub + renderExpr(it, sub, o); }).join(',\n') + '\n' + ind + ')' +
            (m[i] < toks.length - 1 ? ' ' + renderExpr(toks.slice(m[i] + 1), ind, o) : '');
        }
      }
    }
    return ind + renderExpr(toks, ind, o);
  }

  function formatStatement(toks, ind, o) {
    var f = firstSig(toks);
    if (f && f.t === 'w' && DDL_START[f.u]) return formatGeneric(toks, ind, o);

    var segs = splitClauses(toks, o);
    if (!segs.length) return '';

    // Sin cláusulas SQL: puede ser una simple lista de datos (1, 2, 3, ...)
    if (segs.length === 1 && segs[0].key === '') {
      var items = splitComma(segs[0].toks);
      if (items.length > 1) return rowsOf(items, ind, o).join(',\n');
      return ind + renderExpr(segs[0].toks, ind, o);
    }

    return segs.map(function (s) {
      if (s.key === '') return s.toks.length ? ind + renderExpr(s.toks, ind, o) : '';
      return renderSeg(s, ind, o);
    }).filter(function (x) { return x !== ''; }).join('\n');
  }

  /* ------------------------------------------------------------------ */
  /* API pública                                                         */
  /* ------------------------------------------------------------------ */
  function normOpts(opts, flat) {
    opts = opts || {};
    var per = parseInt(opts.perRow, 10);
    if (!(per >= 1)) per = 10;
    if (per > 10000) per = 10000;
    var ind = String(opts.indent);
    return {
      kw: (opts.kw === 'lower' || opts.kw === 'keep') ? opts.kw : 'upper',
      perRow: flat ? Infinity : per,
      indent: ind === 'tab' ? '\t' : (ind === '2' ? '  ' : '    '),
      selectMode: opts.selectMode === 'group' ? 'group' : 'one',
      flat: !!flat
    };
  }

  function splitStatements(toks) {
    var m = matchParens(toks), out = [], cur = [], i;
    for (i = 0; i < toks.length; i++) {
      if (isP(toks[i], '(') && m[i] > i) {
        for (var k = i; k <= m[i]; k++) cur.push(toks[k]);
        i = m[i]; continue;
      }
      if (isP(toks[i], ';')) { out.push({ toks: cur, term: true }); cur = []; continue; }
      cur.push(toks[i]);
    }
    if (cur.length) out.push({ toks: cur, term: false });
    return out;
  }

  function parenWarnings(toks) {
    var m = matchParens(toks), abre = 0, cierra = 0;
    for (var i = 0; i < toks.length; i++) {
      if (isP(toks[i], '(') && m[i] < 0) abre++;
      if (isP(toks[i], ')') && m[i] < 0) cierra++;
    }
    var w = [];
    if (abre) w.push(abre + (abre === 1 ? ' paréntesis "(" sin cerrar' : ' paréntesis "(" sin cerrar'));
    if (cierra) w.push(cierra + (cierra === 1 ? ' paréntesis ")" de más' : ' paréntesis ")" de más'));
    return w;
  }

  /* ------------------------------------------------------------------ */
  /* Listas IN ( ... ) con paréntesis de más o anidados                   */
  /*   IN (1,2,(3,4,(5,6)   ->  IN (1, 2, 3, 4, 5, 6)                     */
  /* Solo actúa cuando TODO lo que hay dentro son datos (números, textos, */
  /* NULL/TRUE/FALSE, parámetros) y comas/paréntesis. No toca subconsultas */
  /* ni comparaciones de filas tipo  (a, b) IN ((1, 2), (3, 4)).           */
  /* ------------------------------------------------------------------ */
  function isDataTok(x) {
    if (!x) return false;
    if (x.t === 'num' || x.t === 'str') return true;
    return x.t === 'w' && (x.u === 'NULL' || x.u === 'TRUE' || x.u === 'FALSE' || x.v[0] === '$' || x.v[0] === ':');
  }

  function normalizeInLists(toks, notes) {
    var out = [], i = 0, fixed = 0;
    while (i < toks.length) {
      var t = toks[i];
      out.push(t);
      if (isW(t, 'IN') && isP(toks[i + 1], '(')) {
        var b = i - 1;
        if (b >= 0 && isW(toks[b], 'NOT')) b--;
        var rowValue = b >= 0 && isP(toks[b], ')');
        var j = i + 1, depth = 0, maxD = 0, closed = false, hasDP = false, stop = null, x;
        for (; j < toks.length; j++) {
          x = toks[j];
          if (isP(x, '(')) {
            depth++; if (depth > maxD) maxD = depth;
            if (j > i + 1 && isDataTok(toks[j - 1])) hasDP = true;
          } else if (isP(x, ')')) {
            depth--;
            if (depth === 0) { closed = true; j++; break; }
          } else if (isDataTok(x) || isP(x, ',')) {
            /* dato o coma: sigue */
          } else if (x.t === 'op' && (x.v === '-' || x.v === '+') && toks[j + 1] && toks[j + 1].t === 'num') {
            /* signo de un número */
          } else { stop = x; break; }
        }
        var hastaElFinal = !closed && (stop === null || isP(stop, ';'));
        var reescribir = closed ? (maxD > 1 && !rowValue) : (hastaElFinal || hasDP);
        if (reescribir) {
          var items = [], k, y;
          for (k = i + 1; k < j; k++) {
            y = toks[k];
            if (isDataTok(y)) items.push(y);
            else if (y.t === 'op' && (y.v === '-' || y.v === '+') && toks[k + 1] && toks[k + 1].t === 'num') {
              items.push({ t: 'num', v: y.v + toks[k + 1].v }); k++;
            }
          }
          if (items.length > 1 || (items.length === 1 && !closed)) {
            out.push({ t: 'p', v: '(' });
            items.forEach(function (it, n) { if (n) out.push({ t: 'p', v: ',' }); out.push(it); });
            out.push({ t: 'p', v: ')' });
            if (!closed) fixed++;
            i = j; continue;
          }
        }
      }
      i++;
    }
    if (fixed) notes.push(fixed === 1
      ? 'Una lista IN tenía paréntesis de más o de menos: se ordenó ignorando los paréntesis internos.'
      : fixed + ' listas IN tenían paréntesis de más o de menos: se ordenaron ignorando los paréntesis internos.');
    return out;
  }

  function run(src, opts, flat) {
    var o = normOpts(opts, flat);
    var tk = tokenize(String(src == null ? '' : src));
    var notas = [];
    var tokens = normalizeInLists(tk.tokens, notas);
    var stmts = splitStatements(tokens), outs = [];
    stmts.forEach(function (st) {
      if (!st.toks.length) return;
      var toks = st.term ? lastLcToBc(st.toks) : st.toks;
      var text = flat ? renderExpr(toks, '', o) : formatStatement(toks, '', o);
      if (st.term) text += ';';
      outs.push(text);
    });
    return {
      text: outs.join(flat ? '\n' : '\n\n'),
      statements: outs.length,
      warnings: tk.warnings.concat(notas, parenWarnings(tokens))
    };
  }

  return {
    format: function (src, opts) { return run(src, opts, false); },
    minify: function (src, opts) { return run(src, opts, true); },
    tokenize: tokenize,
    segments: segments,
    trimData: trimData,
    paddedCount: paddedCount,
    KEYWORDS: KEYWORDS
  };
});
