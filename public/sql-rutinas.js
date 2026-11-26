/* ==========================================================================
   Revisor y formateador de FUNCIONES, PROCEDIMIENTOS y TRIGGERS
   (PostgreSQL / PL-pgSQL; también entiende BEGIN…END estilo Oracle/MySQL).

   - Separa el script en objetos (CREATE FUNCTION / PROCEDURE / TRIGGER / DO).
   - Formatea la cabecera (parámetros, RETURNS, LANGUAGE, atributos) y el
     cuerpo con sangría por bloques: DECLARE, BEGIN, IF/ELSIF/ELSE, LOOP,
     CASE, EXCEPTION…
   - Genera un resumen legible (parámetros, variables, tablas, excepciones,
     datos del trigger) y avisos de revisión (SECURITY DEFINER, EXECUTE
     dinámico, UPDATE/DELETE sin WHERE, bloques sin cerrar, etc.).
   Funciona en el navegador (window.SqlRutinas) y en Node (require).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SqlRutinas = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function set(str) { var o = {}; str.split(' ').forEach(function (k) { if (k) o[k] = true; }); return o; }

  /* Palabras que se escriben en MAYÚSCULAS (solo las que casi nunca son nombres de columnas) */
  var KW = set('OR AS ON IN IS NOT AND LIKE ILIKE BETWEEN UPDATE INSERT DELETE TRUNCATE DEFAULT BEGIN END DECLARE IF ELSIF ELSEIF ELSE THEN LOOP WHILE FOR FOREACH RAISE USING ERRCODE PERFORM INTO EXECUTE RETURN CASE WHEN NULL CONSTANT ALIAS CURSOR SELECT FROM WHERE JOIN INNER LEFT RIGHT FULL OUTER CROSS GROUP BY ORDER HAVING LIMIT OFFSET UNION ALL DISTINCT VALUES SET RETURNING WITH EXISTS ANY TRUE FALSE ASC DESC CONFLICT DO NOTHING STRICT');
  var FUNC_KW = set('LEFT RIGHT ANY');
  var PLSTART = set('EXIT CONTINUE PERFORM RAISE RETURN EXECUTE OPEN CLOSE FETCH GET MOVE CALL NULL ASSERT COMMIT ROLLBACK EXCEPTION');
  var CTX_KW = {
    QUERY: 'RETURN', NEXT: 'RETURN', REVERSE: 'IN', OTHERS: 'WHEN',
    NOTICE: 'RAISE', WARNING: 'RAISE', INFO: 'RAISE', LOG: 'RAISE', DEBUG: 'RAISE', EXCEPTION: 'RAISE',
    DIAGNOSTICS: 'GET STACKED', STACKED: 'GET'
  };
  var USING_OPT = set('HINT DETAIL MESSAGE ERRCODE COLUMN CONSTRAINT DATATYPE TABLE SCHEMA');
  var UNARY_BEFORE = set('RETURN THEN ELSE WHEN AND OR NOT IN SELECT WHERE BY USING VALUES SET DEFAULT LIMIT OFFSET IS BETWEEN');

  /* ---------------------------------------------------------------------- */
  /* Tokenizador                                                             */
  /* ---------------------------------------------------------------------- */
  var RE_TOK = new RegExp(
    '(\\s+)|(--[^\\n]*)|(\\/\\*[\\s\\S]*?(?:\\*\\/|$))' +
    "|((?:[eEnNbBxX])?'(?:[^']|'')*(?:'|$))" +
    '|("(?:[^"]|"")*(?:"|$))' +
    '|(\\$(?:[\\p{L}_][\\p{L}\\p{N}_]*)?\\$)|(\\$\\d+)' +
    '|(\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?|\\.\\d+)' +
    '|([\\p{L}_][\\p{L}\\p{N}_$]*)' +
    '|(->>|#>>|!~\\*|<<|>>|:=|::|<>|!=|>=|<=|\\|\\||=>|->|@>|<@|&&|~\\*|!~|#>|\\.\\.|[\\s\\S])', 'uy');

  function tokenize(src) {
    var toks = [], pos = 0, nl = 0, sp = false, m, start, v, t, close;
    while (pos < src.length) {
      RE_TOK.lastIndex = pos;
      m = RE_TOK.exec(src);
      if (!m) { pos++; continue; }
      start = pos; v = m[0]; pos = RE_TOK.lastIndex;
      if (m[1]) { nl += (v.match(/\n/g) || []).length; sp = true; continue; }
      if (m[2]) t = 'lc';
      else if (m[3]) t = 'bc';
      else if (m[4]) t = 'str';
      else if (m[5]) t = 'dq';
      else if (m[6]) {
        t = 'dol';
        close = src.indexOf(v, pos);
        pos = close < 0 ? src.length : close + v.length;
        v = src.slice(start, pos);
      }
      else if (m[7]) t = 'par';
      else if (m[8]) t = 'num';
      else if (m[9]) t = 'w';
      else t = 'p';
      toks.push({ t: t, v: v, u: t === 'w' ? v.toUpperCase() : '', s: start, e: pos, nl: nl, sp: sp });
      nl = 0; sp = false;
    }
    return toks;
  }

  function isP(t, v) { return !!t && t.t === 'p' && t.v === v; }
  function isW(t, u) { return !!t && t.t === 'w' && t.u === u; }
  function isComment(t) { return !!t && (t.t === 'lc' || t.t === 'bc'); }
  function noComments(toks) { return toks.filter(function (t) { return !isComment(t); }); }
  function raw(src, toks) { return toks.length ? src.slice(toks[0].s, toks[toks.length - 1].e) : ''; }
  function hasMultiline(toks) {
    for (var i = 0; i < toks.length; i++) if ((toks[i].t === 'str' || toks[i].t === 'dol' || toks[i].t === 'bc') && toks[i].v.indexOf('\n') >= 0) return true;
    return false;
  }

  function matchParen(toks, open) {
    var d = 0;
    for (var i = open; i < toks.length; i++) {
      if (isP(toks[i], '(')) d++;
      else if (isP(toks[i], ')')) { d--; if (d === 0) return i; }
    }
    return -1;
  }
  function splitTop(toks, sep) {
    var out = [], cur = [], d = 0;
    toks.forEach(function (t) {
      if (isP(t, '(') || isP(t, '[')) d++;
      else if (isP(t, ')') || isP(t, ']')) d--;
      if (d === 0 && isP(t, sep)) { out.push(cur); cur = []; return; }
      cur.push(t);
    });
    if (cur.length) out.push(cur);
    return out;
  }

  /* ---------------------------------------------------------------------- */
  /* Opciones                                                                */
  /* ---------------------------------------------------------------------- */
  function normOpts(opts) {
    opts = opts || {};
    var ind = String(opts.indent);
    var sf = opts.sqlFmt;
    if (!sf && typeof self !== 'undefined' && self.SqlFormatter && self.SqlFormatter.format) sf = self.SqlFormatter.format;
    var kw = (opts.kw === 'lower' || opts.kw === 'keep') ? opts.kw : 'upper';
    return {
      kw: kw,
      indOpt: (ind === 'tab' || ind === '2') ? ind : '4',
      indStr: ind === 'tab' ? '\t' : (ind === '2' ? '  ' : '    '),
      maxLen: opts.maxLen || 100,
      sqlFmt: sf || null
    };
  }
  function K(txt, o) { return o.kw === 'lower' ? txt.toLowerCase() : txt; }
  function pad(o, n) { var s = ''; for (var i = 0; i < n; i++) s += o.indStr; return s; }

  /* ---------------------------------------------------------------------- */
  /* Unir tokens con espacios correctos                                      */
  /* ---------------------------------------------------------------------- */
  function kwText(t, prev, startKw, afterUsing, next, o) {
    if (o.kw === 'keep') return t.v;
    var u = t.u, isKw = false;
    if (prev && isP(prev, '.')) isKw = false;
    else if (KW[u]) isKw = true;
    else if (CTX_KW[u] && prev && prev.t === 'w' && (' ' + CTX_KW[u] + ' ').indexOf(' ' + prev.u + ' ') >= 0) isKw = true;
    else if (startKw && PLSTART[u]) isKw = true;
    else if (afterUsing && USING_OPT[u] && isP(next, '=')) isKw = true;
    if (!isKw) return t.v;
    return o.kw === 'lower' ? t.v.toLowerCase() : u;
  }

  function needSpace(a, b, aUnary) {
    if (aUnary) return false;
    var av = a.v, bv = b.v;
    if (a.t === 'p' && (av === '(' || av === '[' || av === '.' || av === '::' || av === '..')) return false;
    if (b.t === 'p' && (bv === ')' || bv === ']' || bv === ',' || bv === ';' || bv === '.' || bv === '::' || bv === '..')) return false;
    if (a.pct || b.pct) return false;
    if (a.t === 'p' && av === ':' && !b.sp) return false;
    if (b.t === 'p' && bv === ':' && !b.sp) return false;
    if (b.t === 'p' && bv === '(') {
      if (a.t === 'w') return !!KW[a.u] && !FUNC_KW[a.u];
      if (a.t === 'p' && av === ']') return false;
      return true;
    }
    if (b.t === 'p' && bv === '[') return !(a.t === 'w' || a.t === 'dq' || (a.t === 'p' && (av === ')' || av === ']')));
    return true;
  }

  function joinToks(toks, o, startKw) {
    var out = '', prev = null, prevUnary = false, afterUsing = false, i, t, txt, unary;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '%') && toks[i + 1] && toks[i + 1].t === 'w' && (toks[i + 1].u === 'TYPE' || toks[i + 1].u === 'ROWTYPE') && prev && (prev.t === 'w' || prev.t === 'dq')) {
        t.pct = true; toks[i + 1].pct = true;
      }
      if (t.t === 'w') {
        txt = kwText(t, prev, i === 0 && startKw, afterUsing, toks[i + 1], o);
        if (t.u === 'USING') afterUsing = true;
      } else if (t.t === 'lc') {
        txt = '/* ' + t.v.replace(/^--\s?/, '').replace(/\*\//g, '* /').trim() + ' */';
      } else txt = t.v;
      unary = false;
      if (t.t === 'p' && (t.v === '-' || t.v === '+')) {
        if (!prev) unary = true;
        else if (prev.t === 'p' && prev.v !== ')' && prev.v !== ']') unary = true;
        else if (prev.t === 'w' && UNARY_BEFORE[prev.u]) unary = true;
      }
      if (prev) out += (needSpace(prev, t, prevUnary) ? ' ' : '');
      out += txt;
      prev = t; prevUnary = unary;
    }
    return out;
  }

  /* Parte una expresión larga en varias líneas antes de AND / OR / || (fuera de paréntesis) */
  function splitBool(toks, words, opWords) {
    var segs = [[]], d = 0, cs = 0, between = false, i, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '(') || isP(t, '[')) d++;
      else if (isP(t, ')') || isP(t, ']')) d--;
      else if (t.t === 'w' && t.u === 'CASE') cs++;
      else if (t.t === 'w' && t.u === 'END' && cs > 0) cs--;
      else if (t.t === 'w' && t.u === 'BETWEEN' && d === 0 && cs === 0) between = true;
      var brk = false;
      if (d === 0 && cs === 0 && i > 0) {
        if (t.t === 'w' && words[t.u]) {
          if (t.u === 'AND' && between) between = false;
          else brk = true;
        } else if (t.t === 'p' && opWords && opWords[t.v]) brk = true;
      }
      if (brk) segs.push([]);
      segs[segs.length - 1].push(t);
    }
    return segs;
  }

  function wrapLines(toks, o, startKw, curLen, words, opWords) {
    var single = joinToks(toks, o, startKw);
    if (single.length + curLen <= o.maxLen) return [single];
    var segs = splitBool(toks, words, opWords);
    if (segs.length < 2) return [single];
    return segs.map(function (sg, i) { return (i ? o.indStr : '') + joinToks(sg, o, i === 0 && startKw); });
  }

  /* CASE ... END largo dentro de una asignación / RETURN */
  function wrapCase(toks, o, startKw, curLen) {
    var single = joinToks(toks, o, startKw);
    if (single.length + curLen <= o.maxLen) return null;
    var c = -1, i, d = 0, e = -1, t;
    for (i = 0; i < toks.length; i++) {
      t = toks[i];
      if (isP(t, '(')) d++; else if (isP(t, ')')) d--;
      if (d === 0 && isW(t, 'CASE')) { c = i; break; }
    }
    if (c < 0) return null;
    var cs = 0;
    for (i = c; i < toks.length; i++) {
      if (isW(toks[i], 'CASE')) cs++;
      else if (isW(toks[i], 'END')) { cs--; if (cs === 0) { e = i; break; } }
    }
    if (e < 0) return null;
    var inner = toks.slice(c + 1, e), segs = [[]], dd = 0, cc = 0;
    inner.forEach(function (x) {
      if (isP(x, '(')) dd++; else if (isP(x, ')')) dd--;
      else if (isW(x, 'CASE')) cc++;
      else if (isW(x, 'END')) cc--;
      if (dd === 0 && cc === 0 && (isW(x, 'WHEN') || isW(x, 'ELSE')) && segs[segs.length - 1].length) segs.push([]);
      segs[segs.length - 1].push(x);
    });
    if (segs.length < 2) return null;
    var lines = [joinToks(toks.slice(0, c + 1), o, startKw)];
    segs.forEach(function (sg) { if (sg.length) lines.push(o.indStr + joinToks(sg, o, false)); });
    lines.push(joinToks(toks.slice(e), o, false));
    return lines;
  }

  /* ---------------------------------------------------------------------- */
  /* Formateo de SQL embebido (usa SqlFormatter si está disponible)          */
  /* ---------------------------------------------------------------------- */
  function fmtSql(text, o) {
    if (!o.sqlFmt) return null;
    try {
      var r = o.sqlFmt(text, { kw: o.kw, indent: o.indOpt });
      var s = r && r.text ? r.text.replace(/\s+$/, '') : '';
      return s ? s.split('\n') : null;
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------------- */
  /* Separar el cuerpo en "unidades" (sentencias y marcas de bloque)         */
  /* ---------------------------------------------------------------------- */
  function splitUnits(toks) {
    var units = [], i = 0, n = toks.length;
    function nextNC(j) { while (j < n && isComment(toks[j])) j++; return toks[j] || null; }
    function collect(u, endPred, includeEnd, ignoreCase) {
      var paren = 0, cs = 0, t;
      while (i < n) {
        t = toks[i];
        if (!isComment(t)) {
          if (isP(t, '(')) paren++;
          else if (isP(t, ')')) { if (paren > 0) paren--; }
          else if (!ignoreCase && t.t === 'w' && t.u === 'CASE') cs++;
          else if (!ignoreCase && t.t === 'w' && t.u === 'END' && cs > 0) cs--;
          else if (paren === 0 && cs === 0) {
            if (isP(t, ';')) { u.term = true; i++; return; }
            if (endPred && endPred(t)) { if (includeEnd) { u.toks.push(t); i++; } return; }
          }
        }
        u.toks.push(t); i++;
      }
    }
    while (i < n) {
      var t = toks[i];
      if (isComment(t)) {
        var last = units[units.length - 1];
        if (t.nl === 0 && last && last.kind !== 'comment') last.trail.push(t);
        else units.push({ kind: 'comment', toks: [t], trail: [], nl: t.nl });
        i++; continue;
      }
      if (isP(t, ';')) { i++; continue; }
      var u = { kind: 'stmt', toks: [], trail: [], nl: t.nl, term: false };
      var w = t.t === 'w' ? t.u : '';
      var nx = nextNC(i + 1);
      if (isP(t, '<<')) {
        u.kind = 'label';
        while (i < n) { u.toks.push(toks[i]); i++; if (isP(toks[i - 1], '>>')) break; }
      } else if (w === 'DECLARE') { u.kind = 'declare'; u.toks.push(t); i++; }
      else if (w === 'BEGIN' && !isP(nx, ';')) {
        u.kind = 'begin'; u.toks.push(t); i++;
        if (isW(toks[i], 'ATOMIC')) { u.toks.push(toks[i]); i++; }
      }
      else if (w === 'EXCEPTION' && isW(nx, 'WHEN')) { u.kind = 'exception'; u.toks.push(t); i++; }
      else if (w === 'LOOP') { u.kind = 'loop'; u.toks.push(t); i++; }
      else if (w === 'ELSE') { u.kind = 'else'; u.toks.push(t); i++; }
      else if (w === 'END') { u.kind = 'end'; collect(u, null, false, true); }
      else if (w === 'IF') { u.kind = 'if'; collect(u, function (x) { return isW(x, 'THEN'); }, true); }
      else if (w === 'ELSIF' || w === 'ELSEIF') { u.kind = 'elsif'; collect(u, function (x) { return isW(x, 'THEN'); }, true); }
      else if (w === 'WHEN') { u.kind = 'when'; collect(u, function (x) { return isW(x, 'THEN'); }, true); }
      else if (w === 'WHILE') { u.kind = 'while'; collect(u, function (x) { return isW(x, 'LOOP'); }, true); }
      else if (w === 'FOR' || w === 'FOREACH') { u.kind = 'for'; collect(u, function (x) { return isW(x, 'LOOP'); }, true); }
      else if (w === 'CASE') {
        u.kind = 'case';
        var paren = 0;
        while (i < n) {
          var x = toks[i];
          if (isP(x, '(')) paren++; else if (isP(x, ')')) paren--;
          if (paren === 0 && i > 0 && isW(x, 'WHEN') && u.toks.length) break;
          if (isP(x, ';')) { u.term = true; i++; break; }
          u.toks.push(x); i++;
        }
      }
      else collect(u, null, false);
      if (u.toks.length || u.kind !== 'stmt') units.push(u);
      else if (i < n && u.toks.length === 0) i++;
    }
    return units;
  }

  /* ---------------------------------------------------------------------- */
  /* Texto de cada unidad                                                    */
  /* ---------------------------------------------------------------------- */
  var SQLSTART = set('SELECT WITH INSERT UPDATE DELETE');

  function topIndex(toks, pred, from) {
    var d = 0, i;
    for (i = from || 0; i < toks.length; i++) {
      if (isP(toks[i], '(')) d++;
      else if (isP(toks[i], ')')) d--;
      else if (d === 0 && pred(toks[i])) return i;
    }
    return -1;
  }

  function unitLines(u, o, src, curLen) {
    var T = u.toks, k = u.kind, first = (T[0] && T[0].t === 'w') ? T[0].u : '', term = u.term ? ';' : '';
    if (k === 'comment') {
      var c = T[0];
      if (c.t === 'lc') return [c.v.replace(/\s+$/, '')];
      var ls = c.v.split('\n');
      return ls.map(function (l, i) { l = l.trim(); return i === 0 ? l : ((l.charAt(0) === '*' ? ' ' : '   ') + l); });
    }
    if (k === 'label') return [T.map(function (x) { return x.v; }).join('')];
    if (k === 'declare' || k === 'loop' || k === 'else' || k === 'exception' || k === 'begin' || k === 'case')
      return [joinToks(T, o, true)];
    if (k === 'end') return [joinToks(T, o, true) + term];
    if (k === 'if' || k === 'elsif' || k === 'when' || k === 'while')
      return wrapLines(T, o, true, curLen, { AND: 1, OR: 1 }, null);
    if (k === 'for') {
      var s = topIndex(T, function (x) { return isW(x, 'SELECT') || isW(x, 'WITH'); }, 1);
      if (s > 0 && !hasMultiline(T)) {
        var endIdx = isW(T[T.length - 1], 'LOOP') ? T.length - 1 : T.length;
        var sel = fmtSql(raw(src, T.slice(s, endIdx)), o);
        if (sel) {
          var out = [joinToks(T.slice(0, s), o, true)];
          sel.forEach(function (l) { out.push(o.indStr + l); });
          out.push(K('LOOP', o));
          return out;
        }
      }
      return wrapLines(T, o, true, curLen, null, null);
    }
    /* sentencia normal */
    var multi = hasMultiline(T);
    function addTerm(lines) { if (term && lines.length) lines[lines.length - 1] += term; return lines; }
    if (!multi) {
      if (SQLSTART[first]) {
        var r = fmtSql(raw(src, T), o);
        if (r) return addTerm(r);
      }
      var second = T[1] && T[1].t === 'w' ? T[1].u : '';
      if (first === 'RETURN' && second === 'QUERY' && T[2] && (isW(T[2], 'SELECT') || isW(T[2], 'WITH'))) {
        var rq = fmtSql(raw(src, T.slice(2)), o);
        if (rq) return addTerm([joinToks(T.slice(0, 2), o, true)].concat(rq.map(function (l) { return o.indStr + l; })));
      }
      if (first === 'OPEN') {
        var f = topIndex(T, function (x) { return isW(x, 'FOR'); }, 1);
        if (f > 0 && T[f + 1] && (isW(T[f + 1], 'SELECT') || isW(T[f + 1], 'WITH'))) {
          var ro = fmtSql(raw(src, T.slice(f + 1)), o);
          if (ro) return addTerm([joinToks(T.slice(0, f + 1), o, true)].concat(ro.map(function (l) { return o.indStr + l; })));
        }
      }
      if (first === 'PERFORM' && topIndex(T, function (x) { return isW(x, 'FROM'); }, 1) > 0) {
        var pf = fmtSql('SELECT ' + raw(src, T.slice(1)), o);
        if (pf) { pf[0] = pf[0].replace(/^select/i, K('PERFORM', o).replace(/^perform$/, 'perform')); return addTerm(pf); }
      }
      var cw = wrapCase(T, o, true, curLen + 1);
      if (cw) return addTerm(cw);
      var words = null, opw = null;
      if (first === 'RAISE') words = { USING: 1 };
      else opw = { '||': 1 };
      var wl = wrapLines(T, o, true, curLen + 1, words || {}, opw);
      return addTerm(wl);
    }
    u.verbatim = true;
    return addTerm([joinToks(T, o, true)]);
  }

  /* ---------------------------------------------------------------------- */
  /* Recorrer las unidades y aplicar la sangría por bloques                  */
  /* ---------------------------------------------------------------------- */
  function renderBlock(src, o) {
    var toks = tokenize(src);
    var units = splitUnits(toks);
    var lines = [], metas = [], stack = [], lvl = 0, errors = [], maxD = 0, lastKind = '';
    function top() { return stack[stack.length - 1]; }
    function push(t) { stack.push({ t: t, when: false, decl: false }); if (stack.length > maxD) maxD = stack.length; return top(); }
    function dec() { if (lvl > 0) lvl--; }

    units.forEach(function (u, idx) {
      var k = u.kind, t = top(), w2 = '';
      if (k === 'end') {
        var sw = u.toks[1] && u.toks[1].t === 'w' ? u.toks[1].u : '';
        w2 = (sw === 'IF' || sw === 'LOOP' || sw === 'CASE') ? sw : '';
      }
      /* 1) ajuste de sangría antes de escribir la línea */
      switch (k) {
        case 'begin':
          if (t && t.t === 'block' && t.decl) { dec(); }
          break;
        case 'exception':
          if (t && t.t === 'block') dec(); else errors.push('EXCEPTION fuera de un bloque BEGIN');
          break;
        case 'elsif':
          if (t && t.t === 'if') dec(); else errors.push('ELSIF sin IF');
          break;
        case 'else':
          if (t && t.t === 'if') dec();
          else if (t && t.t === 'case') { if (t.when) dec(); }
          else errors.push('ELSE sin IF/CASE');
          break;
        case 'when':
          if (t && (t.t === 'case' || t.t === 'exc')) { if (t.when) dec(); }
          else errors.push('WHEN fuera de CASE / EXCEPTION');
          break;
        case 'end':
          if (w2 === 'IF') { if (t && t.t === 'if') { stack.pop(); } else errors.push('END IF sin IF'); dec(); }
          else if (w2 === 'LOOP') { if (t && t.t === 'loop') { stack.pop(); } else errors.push('END LOOP sin LOOP'); dec(); }
          else if (w2 === 'CASE') {
            if (t && t.t === 'case') { if (t.when) dec(); stack.pop(); } else errors.push('END CASE sin CASE');
            dec();
          } else {
            if (t && t.t === 'exc') { if (t.when) dec(); dec(); stack.pop(); t = top(); }
            if (t && t.t === 'block') { stack.pop(); dec(); } else errors.push('END sin BEGIN');
          }
          break;
      }
      /* 2) texto de la unidad */
      var curLen = lvl * o.indStr.length;
      var ls = unitLines(u, o, src, curLen);
      if (u.trail && u.trail.length) {
        ls[ls.length - 1] += '  ' + u.trail.map(function (c) { return c.t === 'lc' ? c.v.replace(/\s+$/, '') : c.v; }).join(' ');
      }
      var needBlank = u.nl >= 2 && lines.length > 0 && !/^(declare|begin|if|elsif|else|loop|when|case|exception|end|label)$/.test(k) &&
        !/^(declare|begin|if|elsif|else|loop|when|case|exception)$/.test(lastKind);
      if (needBlank) lines.push('');
      var meta = { kind: k, line: lines.length, toks: u.toks, unit: u, lvl: lvl, decl: (k === 'stmt' && t && t.t === 'block' && t.decl) };
      ls.forEach(function (l, i) {
        if (u.verbatim && i > 0) lines.push(l);
        else lines.push(pad(o, lvl) + l);
      });
      meta.lineEnd = lines.length - 1;
      metas.push(meta);
      lastKind = k;
      /* 3) ajuste de sangría después */
      switch (k) {
        case 'declare': var b = push('block'); b.decl = true; lvl++; break;
        case 'begin':
          if (t && t.t === 'block' && t.decl) { t.decl = false; lvl++; }
          else { push('block'); lvl++; }
          break;
        case 'exception': push('exc'); lvl++; break;
        case 'if': push('if'); lvl++; break;
        case 'elsif': lvl++; break;
        case 'else': if (t && (t.t === 'if' || t.t === 'case')) { if (t.t === 'case') t.when = true; lvl++; } break;
        case 'when': if (t && (t.t === 'case' || t.t === 'exc')) { t.when = true; lvl++; } break;
        case 'case': push('case'); lvl++; break;
        case 'loop': case 'while': case 'for': push('loop'); lvl++; break;
      }
    });
    var abiertos = stack.length;
    if (abiertos) {
      var tipos = stack.map(function (s) { return s.t === 'block' ? 'BEGIN' : (s.t === 'exc' ? 'EXCEPTION' : (s.t === 'if' ? 'IF' : (s.t === 'loop' ? 'LOOP' : 'CASE'))); });
      errors.push('Faltan cierres de bloque: ' + tipos.reverse().join(', '));
    }
    return { lines: lines, metas: metas, errors: errors, maxDepth: maxD, units: units };
  }

  /* ---------------------------------------------------------------------- */
  /* Detección de objetos en el script                                       */
  /* ---------------------------------------------------------------------- */
  function rutinaTipo(T) {
    var i = 0, w;
    if (isW(T[0], 'DO') && T[1] && (T[1].t === 'dol' || T[1].t === 'str' || isW(T[1], 'LANGUAGE'))) return 'DO';
    if (!isW(T[0], 'CREATE')) return null;
    for (i = 1; i < T.length && i < 8; i++) {
      w = T[i].t === 'w' ? T[i].u : '';
      if (w === 'FUNCTION') return 'FUNCION';
      if (w === 'PROCEDURE') return 'PROCEDIMIENTO';
      if (w === 'TRIGGER') return 'TRIGGER';
      if (w === 'OR' || w === 'REPLACE' || w === 'CONSTRAINT' || w === 'EDITIONABLE' || w === 'NONEDITIONABLE' || w === 'DEFINER' || isP(T[i], '=') || T[i].t === 'str' || isP(T[i], '@')) continue;
      if (T[i].t === 'w' && i > 1 && (isP(T[i - 1], '=') || isP(T[i - 1], '@'))) continue;
      return null;
    }
    return null;
  }

  function splitStatements(toks) {
    var out = [], i = 0, n = toks.length;
    while (i < n) {
      var lead = [];
      while (i < n && (isComment(toks[i]) || isP(toks[i], ';') || (isP(toks[i], '/') && toks[i].nl >= 1))) {
        if (isComment(toks[i])) lead.push(toks[i]);
        i++;
      }
      if (i >= n) { if (lead.length) out.push({ lead: lead, toks: [] }); break; }
      var start = i, depth = 0, blk = 0, inDecl = false, rutina = !!rutinaTipo(toks.slice(i, i + 10).filter(function (x) { return !isComment(x); }));
      for (; i < n; i++) {
        var t = toks[i];
        if (t.t === 'p') {
          if (t.v === '(') depth++;
          else if (t.v === ')') { if (depth > 0) depth--; }
          else if (t.v === ';' && depth === 0 && blk <= 0) break;
          continue;
        }
        if (t.t !== 'w' || !rutina || depth > 0) continue;
        if (t.u === 'DECLARE') { blk++; inDecl = true; }
        else if (t.u === 'BEGIN') { if (inDecl) inDecl = false; else blk++; }
        else if (t.u === 'CASE') blk++;
        else if (t.u === 'END') {
          var nx = toks[i + 1] && toks[i + 1].t === 'w' ? toks[i + 1].u : '';
          if (nx !== 'IF' && nx !== 'LOOP' && nx !== 'WHILE' && nx !== 'REPEAT' && nx !== 'FOR') blk--;
        }
      }
      out.push({ lead: lead, toks: toks.slice(start, i) });
      i++;
    }
    return out;
  }

  /* ---------------------------------------------------------------------- */
  /* Funciones y procedimientos: lectura de la cabecera                      */
  /* ---------------------------------------------------------------------- */
  var ATTR_START = set('LANGUAGE IMMUTABLE STABLE VOLATILE STRICT CALLED RETURNS SECURITY EXTERNAL PARALLEL COST ROWS SET AS WINDOW LEAKPROOF NOT TRANSFORM SUPPORT BEGIN DECLARE');

  function typeText(toks, o) { return joinToks(toks, { kw: 'keep', indStr: o.indStr, maxLen: o.maxLen }, false); }

  function parseParams(toks, o) {
    if (!toks.length) return [];
    return splitTop(toks, ',').map(function (pt) {
      var mode = '', k = 0, di = -1, j, d = 0;
      if (pt[0] && pt[0].t === 'w' && /^(IN|OUT|INOUT|VARIADIC)$/.test(pt[0].u)) {
        mode = pt[0].u; k = 1;
        if (mode === 'IN' && pt[1] && isW(pt[1], 'OUT')) { mode = 'INOUT'; k = 2; }
      }
      for (j = k; j < pt.length; j++) {
        if (isP(pt[j], '(')) d++; else if (isP(pt[j], ')')) d--;
        if (d === 0 && (isW(pt[j], 'DEFAULT') || isP(pt[j], '='))) { di = j; break; }
      }
      var core = pt.slice(k, di >= 0 ? di : pt.length), def = di >= 0 ? pt.slice(di + 1) : null;
      var name = '', type = core;
      var txt = core.map(function (x) { return x.v; }).join(' ').toLowerCase();
      var multi = /^(double precision|character varying|timestamp( without| with)? time zone|time( without| with)? time zone|bit varying)\b/.test(txt) && core.length <= 5;
      if (core.length >= 2 && !multi) { name = core[0].v; type = core.slice(1); }
      return { modo: mode, nombre: name, tipo: typeText(type, o), def: def ? joinToks(def, o, false) : null };
    });
  }

  function parseFuncion(T, kind, o) {
    var h = noComments(T), i = 0, p = {
      kind: kind, orReplace: false, nombre: '', params: [], returns: null, lang: null, vol: null, strict: null,
      security: null, parallel: null, cost: null, rows: null, set: [], extra: [], body: null, bodyToks: null
    };
    while (i < h.length && !(h[i].t === 'w' && (h[i].u === 'FUNCTION' || h[i].u === 'PROCEDURE'))) { if (isW(h[i], 'OR')) p.orReplace = true; i++; }
    i++;
    var nameToks = [];
    while (i < h.length && !isP(h[i], '(')) { nameToks.push(h[i]); i++; }
    if (i >= h.length) throw new Error('sin parámetros');
    p.nombre = nameToks.map(function (x) { return x.v; }).join('');
    var close = matchParen(h, i);
    if (close < 0) throw new Error('paréntesis sin cerrar');
    p.params = parseParams(h.slice(i + 1, close), o);
    var rest = h.slice(close + 1), j = 0, d;
    function nextAttr(from) {
      var dd = 0, x;
      for (x = from; x < rest.length; x++) {
        if (isP(rest[x], '(')) dd++; else if (isP(rest[x], ')')) dd--;
        else if (dd === 0 && rest[x].t === 'w' && ATTR_START[rest[x].u]) return x;
      }
      return rest.length;
    }
    while (j < rest.length) {
      var w = rest[j], u = w.t === 'w' ? w.u : '';
      if (u === 'RETURNS' && isW(rest[j + 1], 'NULL')) {
        p.strict = 'STRICT'; j += 5; continue;
      }
      if (u === 'RETURNS') {
        var e = nextAttr(j + 1);
        p.returns = rest.slice(j + 1, e); j = e; continue;
      }
      if (u === 'LANGUAGE') { p.lang = rest[j + 1] ? rest[j + 1].v.replace(/^'|'$/g, '') : null; j += 2; continue; }
      if (u === 'IMMUTABLE' || u === 'STABLE' || u === 'VOLATILE') { p.vol = u; j++; continue; }
      if (u === 'STRICT') { p.strict = 'STRICT'; j++; continue; }
      if (u === 'CALLED') { p.strict = 'CALLED ON NULL INPUT'; j += 4; continue; }
      if (u === 'EXTERNAL') { j++; continue; }
      if (u === 'SECURITY') { p.security = rest[j + 1] ? rest[j + 1].u : null; j += 2; continue; }
      if (u === 'PARALLEL') { p.parallel = rest[j + 1] ? rest[j + 1].u : null; j += 2; continue; }
      if (u === 'COST') { p.cost = rest[j + 1] ? rest[j + 1].v : null; j += 2; continue; }
      if (u === 'ROWS') { p.rows = rest[j + 1] ? rest[j + 1].v : null; j += 2; continue; }
      if (u === 'SET') {
        var es = nextAttr(j + 1), seg = rest.slice(j + 1, es), eq = -1, q;
        for (q = 0; q < seg.length; q++) if (isW(seg[q], 'TO') || isP(seg[q], '=')) { eq = q; break; }
        if (eq > 0) p.set.push({ nombre: seg.slice(0, eq).map(function (x) { return x.v; }).join(''), valor: joinToks(seg.slice(eq + 1), { kw: 'keep', indStr: o.indStr, maxLen: o.maxLen }, false) });
        else p.set.push({ nombre: joinToks(seg, o, false), valor: '' });
        j = es; continue;
      }
      if (u === 'AS') {
        if (rest[j + 1] && (rest[j + 1].t === 'dol' || rest[j + 1].t === 'str') && !(rest[j + 2] && isP(rest[j + 2], ','))) { p.body = rest[j + 1]; j += 2; continue; }
        j = nextAttr(j + 1); p.extern = true; continue;
      }
      if (u === 'BEGIN' || u === 'DECLARE') { p.bodyToks = rest.slice(j); j = rest.length; continue; }
      if (u === 'WINDOW' || u === 'LEAKPROOF') { p.extra.push(u); j++; continue; }
      if (u === 'NOT' && isW(rest[j + 1], 'LEAKPROOF')) { p.extra.push('NOT LEAKPROOF'); j += 2; continue; }
      if (u === 'TRANSFORM' || u === 'SUPPORT') { var e2 = nextAttr(j + 1); p.extra.push(joinToks(rest.slice(j, e2), o, false)); j = e2; continue; }
      p.extra.push(w.v); j++;
    }
    return p;
  }

  function paramLine(pm, o) {
    var s = '';
    if (pm.modo) s += K(pm.modo, o) + ' ';
    if (pm.nombre) s += pm.nombre + ' ';
    s += pm.tipo;
    if (pm.def != null) s += ' ' + K('DEFAULT', o) + ' ' + pm.def;
    return s;
  }

  function headerFuncion(p, o) {
    var tipoKw = p.kind === 'PROCEDIMIENTO' ? 'PROCEDURE' : 'FUNCTION';
    var first = K('CREATE', o) + (p.orReplace ? ' ' + K('OR REPLACE', o) : '') + ' ' + K(tipoKw, o) + ' ' + p.nombre;
    var lines = [], plines = p.params.map(function (pm) { return paramLine(pm, o); });
    var inline = '(' + plines.join(', ') + ')';
    if (plines.length <= 1 || (first.length + inline.length <= o.maxLen && plines.length <= 2)) lines.push(first + inline);
    else {
      lines.push(first + '(');
      plines.forEach(function (l, i) { lines.push(o.indStr + l + (i < plines.length - 1 ? ',' : '')); });
      lines.push(')');
    }
    if (p.returns && p.returns.length) {
      var r0 = p.returns[0];
      if (isW(r0, 'TABLE') && isP(p.returns[1], '(')) {
        var cl = matchParen(p.returns, 1), cols = splitTop(p.returns.slice(2, cl), ',').map(function (c) { return joinToks(c, { kw: 'keep', indStr: o.indStr, maxLen: o.maxLen }, false); });
        lines.push(K('RETURNS TABLE', o) + ' (');
        cols.forEach(function (c, i) { lines.push(o.indStr + c + (i < cols.length - 1 ? ',' : '')); });
        lines.push(')');
      } else {
        lines.push(K('RETURNS', o) + ' ' + joinToks(p.returns, { kw: o.kw === 'lower' ? 'lower' : 'keep', indStr: o.indStr, maxLen: o.maxLen }, false).replace(/^setof\b/i, function (m) { return K('SETOF', o); }));
      }
    }
    if (p.lang) lines.push(K('LANGUAGE', o) + ' ' + p.lang.toLowerCase());
    if (p.vol) lines.push(K(p.vol, o));
    if (p.strict) lines.push(K(p.strict, o));
    if (p.security) lines.push(K('SECURITY ' + p.security, o));
    if (p.parallel) lines.push(K('PARALLEL ' + p.parallel, o));
    if (p.cost) lines.push(K('COST', o) + ' ' + p.cost);
    if (p.rows) lines.push(K('ROWS', o) + ' ' + p.rows);
    p.set.forEach(function (s) { lines.push(K('SET', o) + ' ' + s.nombre + (s.valor ? ' = ' + s.valor : '')); });
    p.extra.forEach(function (x) { lines.push(K(x, o)); });
    return lines;
  }

  /* ---------------------------------------------------------------------- */
  /* Triggers                                                                */
  /* ---------------------------------------------------------------------- */
  function parseTrigger(T, o) {
    var h = noComments(T), i = 0, p = {
      kind: 'TRIGGER', orReplace: false, constraint: false, nombre: '', momento: '', eventos: [], columnas: [], tabla: '',
      desde: '', diferible: '', referencing: [], nivel: '', cuando: '', funcion: '', args: '', ejecutaKw: 'FUNCTION',
      body: null, bodyToks: null, inline: null
    };
    while (i < h.length && !isW(h[i], 'TRIGGER')) { if (isW(h[i], 'OR')) p.orReplace = true; if (isW(h[i], 'CONSTRAINT')) p.constraint = true; i++; }
    i++;
    var nm = [];
    while (i < h.length && !(h[i].t === 'w' && /^(BEFORE|AFTER|INSTEAD)$/.test(h[i].u)) && nm.length < 6) { nm.push(h[i]); i++; }
    p.nombre = nm.map(function (x) { return x.v; }).join('');
    if (!p.nombre || i >= h.length) throw new Error('trigger incompleto');
    if (isW(h[i], 'INSTEAD')) { p.momento = 'INSTEAD OF'; i += 2; } else { p.momento = h[i].u; i++; }
    /* eventos */
    var guard = 0;
    while (i < h.length && guard++ < 12) {
      var u = h[i].t === 'w' ? h[i].u : '';
      if (u === 'INSERT' || u === 'DELETE' || u === 'TRUNCATE') { p.eventos.push(u); i++; }
      else if (u === 'UPDATE') {
        p.eventos.push('UPDATE'); i++;
        if (isW(h[i], 'OF')) {
          i++;
          while (i < h.length && !isW(h[i], 'OR') && !isW(h[i], 'ON')) { if (!isP(h[i], ',')) p.columnas.push(h[i].v); i++; }
        }
      } else break;
      if (isW(h[i], 'OR')) i++; else break;
    }
    if (!isW(h[i], 'ON')) throw new Error('falta ON');
    i++;
    function nombreCompuesto() {
      var out = [];
      while (i < h.length) {
        var x = h[i];
        if (!out.length || isP(x, '.') || isP(out[out.length - 1], '.')) { out.push(x); i++; } else break;
      }
      return out.map(function (x) { return x.v; }).join('');
    }
    p.tabla = nombreCompuesto();
    if (!p.tabla) throw new Error('falta tabla');
    while (i < h.length) {
      var w = h[i].t === 'w' ? h[i].u : '';
      if (w === 'FROM') { i++; p.desde = nombreCompuesto(); continue; }
      if (w === 'NOT' || w === 'DEFERRABLE' || w === 'INITIALLY') {
        var dt = []; while (i < h.length && /^(NOT|DEFERRABLE|INITIALLY|IMMEDIATE|DEFERRED)$/.test(h[i].u || '')) { dt.push(h[i].u); i++; }
        p.diferible = dt.join(' '); continue;
      }
      if (w === 'REFERENCING') {
        i++; var rf = [];
        while (i < h.length) {
          var rx = h[i], ru = rx.t === 'w' ? rx.u : '', rp = rf.length ? rf[rf.length - 1] : null;
          if (/^(NEW|OLD|TABLE|AS)$/.test(ru)) { rf.push(rx); i++; }
          else if (rp && (rp.u === 'AS' || rp.u === 'TABLE') && (rx.t === 'w' || rx.t === 'dq') && !/^(FOR|WHEN|EXECUTE)$/.test(ru)) { rf.push(rx); i++; }
          else break;
        }
        p.referencing = rf.map(function (x) { return x.t === 'w' && /^(NEW|OLD|TABLE|AS)$/.test(x.u) ? x.u : x.v; });
        continue;
      }
      if (w === 'FOR') {
        i++; if (isW(h[i], 'EACH')) i++;
        if (h[i]) { p.nivel = h[i].u; i++; }
        continue;
      }
      if (w === 'WHEN' && isP(h[i + 1], '(')) {
        var c = matchParen(h, i + 1);
        if (c < 0) throw new Error('WHEN sin cerrar');
        p.cuando = joinToks(h.slice(i + 2, c), o, false);
        i = c + 1; continue;
      }
      if (w === 'EXECUTE') {
        i++; p.ejecutaKw = h[i] ? h[i].u : 'FUNCTION'; i++;
        var fn = [];
        while (i < h.length && !isP(h[i], '(')) { fn.push(h[i]); i++; }
        p.funcion = fn.map(function (x) { return x.v; }).join('');
        if (isP(h[i], '(')) { var cp = matchParen(h, i); p.args = cp > i ? joinToks(h.slice(i + 1, cp), o, false) : ''; i = cp + 1; }
        continue;
      }
      if (w === 'BEGIN' || w === 'DECLARE') { p.bodyToks = h.slice(i); break; }
      p.inline = h.slice(i); break;
    }
    return p;
  }

  function headerTrigger(p, o) {
    var lines = [], ind = o.indStr;
    lines.push(K('CREATE', o) + (p.orReplace ? ' ' + K('OR REPLACE', o) : '') + (p.constraint ? ' ' + K('CONSTRAINT', o) : '') + ' ' + K('TRIGGER', o) + ' ' + p.nombre);
    var evs = p.eventos.map(function (e) {
      return K(e, o) + (e === 'UPDATE' && p.columnas.length ? ' ' + K('OF', o) + ' ' + p.columnas.join(', ') : '');
    }).join(' ' + K('OR', o) + ' ');
    lines.push(ind + K(p.momento, o) + ' ' + evs);
    lines.push(ind + K('ON', o) + ' ' + p.tabla);
    if (p.desde) lines.push(ind + K('FROM', o) + ' ' + p.desde);
    if (p.diferible) lines.push(ind + K(p.diferible, o));
    if (p.referencing.length) lines.push(ind + K('REFERENCING', o) + ' ' + p.referencing.map(function (x) { return /^(NEW|OLD|TABLE|AS)$/.test(x) ? K(x, o) : x; }).join(' '));
    if (p.nivel) lines.push(ind + K('FOR EACH ' + p.nivel, o));
    if (p.cuando) lines.push(ind + K('WHEN', o) + ' (' + p.cuando + ')');
    if (p.funcion) lines.push(ind + K('EXECUTE ' + p.ejecutaKw, o) + ' ' + p.funcion + '(' + p.args + ')');
    return lines;
  }

  /* ---------------------------------------------------------------------- */
  /* Análisis del cuerpo (resumen + avisos)                                  */
  /* ---------------------------------------------------------------------- */
  function cleanName(n) { return String(n || '').replace(/"/g, '').trim(); }
  /* ¿el texto termina dentro de EXTRACT( / TRIM( / SUBSTRING( …? (allí FROM no introduce una tabla) */
  function enFuncionEspecial(antes) {
    var d = 0, i, open = -1;
    for (i = antes.length - 1; i >= 0; i--) {
      if (antes.charAt(i) === ')') d++;
      else if (antes.charAt(i) === '(') { if (d === 0) { open = i; break; } d--; }
    }
    if (open < 0) return false;
    return /\b(?:EXTRACT|TRIM|SUBSTRING|OVERLAY|POSITION|DATE_PART)\s*$/.test(antes.slice(0, open));
  }
  function shortName(n) { var s = cleanName(n).split('.'); return s[s.length - 1].toLowerCase(); }
  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { var k = x.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(x); } }); return out; }

  function analizarCuerpo(rend, p, lang, offset, info) {
    var metas = rend.metas, avisos = info.avisos, res = info.resumen;
    var cnt = { ifs: 0, elsifs: 0, loops: 0, cases: 0, whens: 0, sql: 0, exec: 0, raises: 0, handlers: 0, returns: 0 };
    var vars = [], lee = [], escribe = [], raises = [], retornos = [], tgOps = [], newCols = [], usaNEW = false, usaOLD = false, usaTG = false;
    var execDin = [], updSinWhere = [], delSinWhere = [], selStar = [], selIntoSinStrict = [], whenOthers = [], loopsSinExit = [];
    var usados = {}, declNames = [];
    var linea = function (m) { return offset + m.line + 1; };
    var loopStack = [];

    metas.forEach(function (m) {
      var T = noComments(m.toks), first = T[0] && T[0].t === 'w' ? T[0].u : '';
      var codeUp = T.map(function (x) { return x.t === 'str' ? "''" : (x.t === 'dol' ? '$$' : (x.u || x.v.toUpperCase())); }).join(' ');
      var codeRaw = T.map(function (x) { return x.t === 'str' ? "''" : (x.t === 'dol' ? '$$' : x.v); }).join(' ');
      /* variables declaradas */
      if (m.decl && T.length >= 2) {
        var nm = T[0].v, rest = T.slice(1), cst = false;
        if (isW(rest[0], 'CONSTANT')) { cst = true; rest = rest.slice(1); }
        var ai = -1, q;
        for (q = 0; q < rest.length; q++) if (isP(rest[q], ':=') || isP(rest[q], '=') || isW(rest[q], 'DEFAULT')) { ai = q; break; }
        var tp = ai >= 0 ? rest.slice(0, ai) : rest, val = ai >= 0 ? rest.slice(ai + 1) : null;
        tp = tp.filter(function (x) { return !isW(x, 'NOT') && !isW(x, 'NULL'); });
        vars.push({ nombre: nm, tipo: joinToks(tp, { kw: 'keep', indStr: '', maxLen: 999 }, false), constante: cst, valor: val ? joinToks(val, { kw: 'keep', indStr: '', maxLen: 999 }, false) : '' });
        declNames.push(nm.toLowerCase());
        return;
      }
      /* uso de identificadores */
      T.forEach(function (x, ix) {
        if (x.t === 'w') {
          usados[x.v.toLowerCase()] = true;
          if (x.u === 'NEW' && isP(T[ix + 1], '.')) usaNEW = true;
          if (x.u === 'OLD' && isP(T[ix + 1], '.')) usaOLD = true;
          if (/^TG_/.test(x.u)) usaTG = true;
        } else if (x.t === 'par') usados[x.v] = true;
      });
      if (m.kind === 'if') cnt.ifs++;
      else if (m.kind === 'elsif') cnt.elsifs++;
      else if (m.kind === 'case') cnt.cases++;
      else if (m.kind === 'when') {
        var inExc = /OTHERS|^WHEN\s+\w+/.test(codeUp) && false;
        cnt.whens++;
      }
      else if (m.kind === 'loop' || m.kind === 'while' || m.kind === 'for') {
        cnt.loops++;
        loopStack.push({ m: m, exit: false, bare: m.kind === 'loop', depth: loopStack.length });
      }
      else if (m.kind === 'end' && T[1] && isW(T[1], 'LOOP')) {
        var lp = loopStack.pop();
        if (lp && lp.bare && !lp.exit) loopsSinExit.push(lp.m);
      }
      if (m.kind === 'when') {
        if (/^WHEN\s+OTHERS\b/.test(codeUp)) whenOthers.push({ m: m, idx: metas.indexOf(m) });
      }
      if (m.kind === 'stmt' || m.kind === 'for' || m.kind === 'while' || m.kind === 'if' || m.kind === 'elsif') {
        /* tablas leídas / escritas */
        var re, mm;
        if (m.kind === 'stmt' || m.kind === 'for') {
          var cu = codeUp.replace(/\s*\.\s*/g, '.');
          var cr = codeRaw.replace(/\s*\.\s*/g, '.');
          var NM = '((?:"[^"]+"|[A-Za-z_][\\w$]*)(?:\\.(?:"[^"]+"|[A-Za-z_][\\w$]*))*)';
          var nameAt = function (x) { return cleanName(cr.slice(x.indices[1][0], x.indices[1][1])); };
          re = new RegExp('\\b(?:FROM|JOIN)\\s+(?:ONLY\\s+)?' + NM + '(?![\\w$"])(?!\\s*\\()', 'gd');
          while ((mm = re.exec(cu))) {
            if (/^(NEW|OLD|LATERAL|SELECT|UNNEST)\b/i.test(mm[1])) continue;
            if (/\bDELETE\s+$/.test(cu.slice(0, mm.index))) continue;
            if (/\bDISTINCT\s+$/.test(cu.slice(0, mm.index))) continue;
            if (enFuncionEspecial(cu.slice(0, mm.index))) continue;
            lee.push(nameAt(mm));
          }
          var ins = new RegExp('^(?:WITH\\b.*?)?\\bINSERT\\s+INTO\\s+' + NM, 'd').exec(cu);
          if (ins) escribe.push({ tabla: nameAt(ins), op: 'INSERT' });
          var upd = new RegExp('(?:^|\\bWITH\\b.*?\\))\\s*UPDATE\\s+(?:ONLY\\s+)?' + NM + '\\s+(?:AS\\s+\\w+\\s+)?SET\\b', 'd').exec(cu) ||
            (first === 'UPDATE' ? new RegExp('^UPDATE\\s+(?:ONLY\\s+)?' + NM, 'd').exec(cu) : null);
          if (upd) {
            escribe.push({ tabla: nameAt(upd), op: 'UPDATE' });
            if (!/\bWHERE\b/.test(cu) && !/\bCURRENT\s+OF\b/.test(cu)) updSinWhere.push(m);
          }
          var del = new RegExp('\\bDELETE\\s+FROM\\s+(?:ONLY\\s+)?' + NM, 'd').exec(cu);
          if (del) {
            escribe.push({ tabla: nameAt(del), op: 'DELETE' });
            if (!/\bWHERE\b/.test(cu) && !/\bCURRENT\s+OF\b/.test(cu) && !/\bUSING\b/.test(cu)) delSinWhere.push(m);
          }
          var trn = new RegExp('^TRUNCATE\\s+(?:TABLE\\s+)?(?:ONLY\\s+)?' + NM, 'd').exec(cu);
          if (trn) escribe.push({ tabla: nameAt(trn), op: 'TRUNCATE' });
          if (SQLSTART[first] || (first === 'PERFORM' && /\bFROM\b/.test(cu)) || (first === 'RETURN' && T[1] && isW(T[1], 'QUERY'))) cnt.sql++;
          if (/\bSELECT\s+\*/.test(cu) || /,\s*\*\s+FROM\b/.test(cu)) selStar.push(m);
          if (first === 'SELECT' && /\bINTO\b/.test(cu) && !/\bINTO\s+STRICT\b/.test(cu) && !/\bINSERT\s+INTO\b/.test(cu) &&
            !(/\b(?:COUNT|SUM|AVG|MIN|MAX)\s*\(/.test(cu) && !/\bGROUP\s+BY\b/.test(cu)) && !/\bLIMIT\s+1\b/.test(cu)) selIntoSinStrict.push(m);
        }
      }
      if (first === 'EXECUTE') {
        cnt.exec++;
        var hasFmt = /\bFORMAT\s*\(/.test(codeUp) || /\bQUOTE_(?:IDENT|LITERAL|NULLABLE)\b/.test(codeUp) || /\bUSING\b/.test(codeUp);
        var concat = T.some(function (x) { return isP(x, '||'); });
        execDin.push({ m: m, concat: concat, seguro: hasFmt && !concat });
      }
      if (first === 'RAISE') {
        cnt.raises++;
        var lvlTok = T[1] && T[1].t === 'w' && /^(EXCEPTION|NOTICE|WARNING|INFO|LOG|DEBUG)$/.test(T[1].u) ? T[1].u : '';
        var msg = T.filter(function (x) { return x.t === 'str'; })[0];
        raises.push({ nivel: lvlTok || 'EXCEPTION', mensaje: msg ? msg.v.replace(/^[eEnN]?'|'$/g, '').replace(/''/g, "'") : (T[1] ? joinToks(T.slice(1), { kw: 'keep', indStr: '', maxLen: 999 }, false) : ''), linea: linea(m) });
        if (lvlTok === 'EXCEPTION' || !lvlTok) { /* re-raise ok */ }
      }
      if (first === 'EXIT' && loopStack.length) loopStack[loopStack.length - 1].exit = true;
      if (first === 'RETURN') {
        cnt.returns++;
        var r1 = T[1];
        retornos.push({ valor: !r1 ? '(vacío)' : (r1.t === 'w' && /^(NEW|OLD|NULL|QUERY|NEXT)$/.test(r1.u) ? (r1.u === 'QUERY' ? 'QUERY' : r1.u) : joinToks(T.slice(1), { kw: 'keep', indStr: '', maxLen: 999 }, false)), linea: linea(m) });
      }
      if (T[0] && isW(T[0], 'NEW') && isP(T[1], '.') && T[2] && (isP(T[3], ':=') || isP(T[3], '='))) newCols.push(T[2].v);
      if (first === 'IF' || first === 'ELSIF' || first === 'WHEN') {
        var seen = {}, rx = /TG_OP[^']*?'([A-Za-z]+)'/i;
        T.forEach(function (x) { if (x.t === 'str') { var sv = x.v.replace(/'/g, '').toUpperCase(); if (/^(INSERT|UPDATE|DELETE|TRUNCATE)$/.test(sv) && /TG_OP/i.test(codeUp)) tgOps.push(sv); } });
      }
      if (/^(IF|ELSIF|ELSEIF|WHEN|CASE)$/.test(first) && /TG_OP/.test(codeUp)) {
        T.forEach(function (x) { if (x.t === 'str') { var sv = x.v.replace(/'/g, '').toUpperCase(); if (/^(INSERT|UPDATE|DELETE|TRUNCATE)$/.test(sv)) tgOps.push(sv); } });
      }
    });

    /* variables / parámetros sin usar */
    var sinUsar = [];
    vars.forEach(function (v) { if (!usados[v.nombre.toLowerCase()] && !/^(CURSOR|ALIAS)/i.test(v.tipo)) sinUsar.push(v.nombre); });
    var paramsSinUsar = [];
    if (p && p.params) p.params.forEach(function (pm, ix) {
      if (!pm.nombre) return;
      if (pm.modo === 'OUT') return;
      if (!usados[pm.nombre.toLowerCase()] && !usados['$' + (ix + 1)]) paramsSinUsar.push(pm.nombre);
    });

    /* tablas */
    var declSet = {};
    declNames.forEach(function (n) { declSet[n] = 1; });
    if (p && p.params) p.params.forEach(function (pm) { if (pm.nombre) declSet[pm.nombre.toLowerCase()] = 1; });
    lee = uniq(lee.filter(function (n) { return !declSet[n.toLowerCase()] && !/^(NEW|OLD)\./i.test(n); }));
    var escMap = {}, escOut = [];
    escribe.forEach(function (e) { var k = e.tabla.toLowerCase(); if (!escMap[k]) { escMap[k] = { tabla: e.tabla, ops: [] }; escOut.push(escMap[k]); } if (escMap[k].ops.indexOf(e.op) < 0) escMap[k].ops.push(e.op); });
    var leeSolo = lee.filter(function (n) { return !escMap[n.toLowerCase()]; });

    /* métricas */
    var cc = 1 + cnt.ifs + cnt.elsifs + cnt.loops + cnt.whens;
    var nivelCx = cc <= 5 ? 'baja' : (cc <= 10 ? 'moderada' : (cc <= 20 ? 'alta' : 'muy alta'));
    res.variables = vars;
    res.lee = lee;
    res.escribe = escOut;
    res.excepciones = raises;
    res.retornos = retornos;
    res.metricas = {
      lineas: rend.lines.length, ifs: cnt.ifs + cnt.elsifs, bucles: cnt.loops, casos: cnt.cases, sql: cnt.sql, dinamicos: cnt.exec,
      raises: cnt.raises, complejidad: cc, nivel: nivelCx, profundidad: Math.max(0, rend.maxDepth - 1)
    };
    res.trigger = { usaNEW: usaNEW, usaOLD: usaOLD, usaTG: usaTG, operaciones: uniq(tgOps), modificaNEW: uniq(newCols) };

    /* avisos */
    function add(n, titulo, detalle, ln) { avisos.push({ nivel: n, titulo: titulo, detalle: detalle || '', linea: ln || null }); }
    rend.errors.forEach(function (e) { add('error', 'Estructura de bloques incorrecta', e); });
    execDin.forEach(function (x) {
      if (x.concat) add('error', 'EXECUTE dinámico con concatenación (||)', 'Concatenar valores en SQL dinámico abre la puerta a inyección SQL. Usa format() con %I / %L o la cláusula USING.', linea(x.m));
      else if (!x.seguro) add('warn', 'EXECUTE dinámico', 'Revisa que los valores entren con USING o format(%I, %L).', linea(x.m));
    });
    if (execDin.length && execDin.every(function (x) { return x.seguro; })) add('ok', 'SQL dinámico seguro', 'Los EXECUTE usan format() / USING.', null);
    updSinWhere.forEach(function (m) { add('error', 'UPDATE sin WHERE', 'Modificará todas las filas de la tabla.', linea(m)); });
    delSinWhere.forEach(function (m) { add('error', 'DELETE sin WHERE', 'Borrará todas las filas de la tabla.', linea(m)); });
    selStar.forEach(function (m) { add('info', 'SELECT *', 'Mejor listar las columnas: evita problemas si la tabla cambia.', linea(m)); });
    selIntoSinStrict.forEach(function (m) { add('info', 'SELECT … INTO sin STRICT', 'Si devuelve varias filas toma la primera sin avisar; si no devuelve ninguna deja la variable en NULL.', linea(m)); });
    whenOthers.forEach(function (x) {
      var m = x.m, j = x.idx + 1, hay = false, vacio = true;
      for (; j < metas.length; j++) {
        var mk = metas[j];
        if (mk.kind === 'when' || mk.kind === 'end') break;
        var tk = noComments(mk.toks);
        if (tk[0] && tk[0].t === 'w') { if (tk[0].u === 'RAISE') hay = true; if (tk[0].u !== 'NULL') vacio = false; }
      }
      if (vacio) add('warn', 'WHEN OTHERS que no hace nada', 'El error se traga en silencio. Registra o vuelve a lanzarlo con RAISE.', linea(m));
      else if (!hay) add('info', 'WHEN OTHERS sin RAISE', 'Captura cualquier error sin volver a lanzarlo; confirma que es lo que quieres.', linea(m));
    });
    loopsSinExit.forEach(function (m) { add('warn', 'LOOP sin EXIT', 'Un LOOP simple sin EXIT / RETURN puede quedar en bucle infinito.', linea(m)); });
    if (sinUsar.length) add('info', 'Variables declaradas y no usadas', sinUsar.join(', '));
    if (paramsSinUsar.length) add('info', 'Parámetros que no se usan', paramsSinUsar.join(', '));
    if (rend.maxDepth - 1 > 4) add('warn', 'Anidación profunda', 'Hay ' + (rend.maxDepth - 1) + ' niveles de bloques anidados; considera dividir la función.');
    if (cc > 20) add('warn', 'Complejidad muy alta', 'Complejidad estimada ' + cc + '. Difícil de probar y mantener.');
    return { retornos: retornos, newCols: uniq(newCols), tgOps: uniq(tgOps), escOut: escOut, lee: lee, usaNEW: usaNEW, usaOLD: usaOLD, execDin: execDin };
  }

  /* ---------------------------------------------------------------------- */
  /* Armado de cada objeto                                                   */
  /* ---------------------------------------------------------------------- */
  function leadLines(lead) {
    var out = [];
    lead.forEach(function (c) {
      if (c.t === 'lc') out.push(c.v.replace(/\s+$/, ''));
      else c.v.split('\n').forEach(function (l, i) { l = l.trim(); out.push(i === 0 ? l : ((l.charAt(0) === '*' ? ' ' : '   ') + l)); });
    });
    return out;
  }

  function bodyParts(p) {
    var tag, inner;
    if (p.body.t === 'dol') {
      tag = /^\$[^$]*\$/.exec(p.body.v)[0];
      var closed = p.body.v.length >= 2 * tag.length && p.body.v.slice(-tag.length) === tag;
      inner = p.body.v.slice(tag.length, closed ? p.body.v.length - tag.length : p.body.v.length);
    } else {
      inner = p.body.v.replace(/^[eEnNbBxX]?'/, '').replace(/'$/, '').replace(/''/g, "'");
      tag = inner.indexOf('$$') >= 0 ? '$body$' : '$$';
      p.bodyConvertido = true;
    }
    return { tag: tag, inner: inner };
  }

  function dedent(text) {
    var ls = text.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n'), min = 1e9;
    ls.forEach(function (l) { if (l.trim()) { var m = /^[ \t]*/.exec(l)[0].length; if (m < min) min = m; } });
    if (min === 1e9) min = 0;
    return ls.map(function (l) { return l.slice(min).replace(/\s+$/, ''); });
  }

  function mkObj(tipo, rotulo, nombre) {
    return { tipo: tipo, rotulo: rotulo, nombre: nombre, texto: '', cabecera: '', cuerpo: '', pie: '', avisos: [], resumen: { datos: [] }, lineas: 0, cabLineas: 0 };
  }

  function ensamblar(ob, cab, cuerpo, pie) {
    ob.cabecera = cab.join('\n');
    ob.cuerpo = cuerpo.join('\n');
    ob.pie = pie.join('\n');
    var all = cab.concat(cuerpo, pie);
    ob.texto = all.join('\n');
    ob.lineas = all.length;
    ob.cabLineas = cab.length;
    ob.cuerpoLineas = cuerpo.length;
  }

  function procFuncion(st, kind, src, o) {
    var T = st.toks, p = parseFuncion(T, kind, o);
    var esProc = kind === 'PROCEDIMIENTO';
    var ob = mkObj(kind, esProc ? 'Procedimiento' : 'Función', cleanName(p.nombre));
    ob.p = p;
    var lead = leadLines(st.lead);
    var cab = lead.concat(headerFuncion(p, o)), cuerpo = [], pie = [], rend = null;
    var lang = (p.lang || 'plpgsql').toLowerCase();
    var offsetAfterHeader;
    if (p.body) {
      var bp = bodyParts(p);
      cab.push(K('AS', o) + ' ' + bp.tag);
      ob.delim = bp.tag;
      if (lang === 'plpgsql' || lang === 'sql') {
        rend = renderBlock(bp.inner, o);
        cuerpo = rend.lines;
      } else {
        cuerpo = dedent(bp.inner).map(function (l) { return l ? o.indStr + l : l; });
        ob.avisos.push({ nivel: 'info', titulo: 'Lenguaje ' + lang, detalle: 'El cuerpo no es PL/pgSQL ni SQL: se muestra tal cual (solo se re-sangró).', linea: null });
      }
      pie = [bp.tag + ';'];
      if (p.bodyConvertido) ob.avisos.push({ nivel: 'info', titulo: 'Cuerpo entre comillas simples', detalle: 'Se muestra entre ' + bp.tag + ' para que sea legible (equivale al original).', linea: null });
    } else if (p.bodyToks && p.bodyToks.length) {
      var inner = src.slice(p.bodyToks[0].s, p.bodyToks[p.bodyToks.length - 1].e) + ';';
      rend = renderBlock(inner, o);
      cuerpo = rend.lines;
    } else {
      cab[cab.length - 1] += ';';
      ob.avisos.push({ nivel: 'info', titulo: 'Sin cuerpo', detalle: 'La definición no trae cuerpo en el texto (función externa).', linea: null });
    }
    ensamblar(ob, cab, cuerpo, pie);

    /* resumen */
    var res = ob.resumen;
    var tg = p.returns && p.returns.length === 1 && isW(p.returns[0], 'TRIGGER');
    ob.esTriggerFn = !!tg;
    res.parametros = p.params;
    res.retorna = p.returns && p.returns.length ? joinToks(p.returns, { kw: 'keep', indStr: '', maxLen: 999 }, false) : (esProc ? '—' : '');
    res.datos.push({ k: 'Nombre', v: cleanName(p.nombre) });
    res.datos.push({ k: 'Tipo', v: esProc ? 'Procedimiento (CALL)' : (tg ? 'Función de trigger' : 'Función') });
    res.datos.push({ k: 'Lenguaje', v: lang });
    if (!esProc) res.datos.push({ k: 'Devuelve', v: res.retorna || '—' });
    res.datos.push({ k: 'Volatilidad', v: p.vol ? p.vol.toLowerCase() : 'volatile (por defecto)' });
    res.datos.push({ k: 'Seguridad', v: p.security ? p.security : 'INVOKER (por defecto)' });
    if (p.strict) res.datos.push({ k: 'Nulos', v: p.strict });
    if (p.parallel) res.datos.push({ k: 'Paralelismo', v: p.parallel });
    if (p.set.length) res.datos.push({ k: 'Configuración', v: p.set.map(function (s) { return s.nombre + (s.valor ? ' = ' + s.valor : ''); }).join(' · ') });

    var an = rend ? analizarCuerpo(rend, p, lang, cab.length, ob) : null;
    ob.an = an;

    /* avisos de cabecera */
    if (!p.lang) ob.avisos.unshift({ nivel: 'error', titulo: 'Falta LANGUAGE', detalle: 'CREATE FUNCTION necesita indicar el lenguaje (por ejemplo LANGUAGE plpgsql).', linea: null });
    if (!esProc && !p.returns && !p.params.some(function (x) { return x.modo === 'OUT' || x.modo === 'INOUT'; })) ob.avisos.unshift({ nivel: 'error', titulo: 'Falta RETURNS', detalle: 'La función no declara qué devuelve.', linea: null });
    if (p.security === 'DEFINER') {
      var sp = p.set.some(function (s) { return /^search_path$/i.test(s.nombre); });
      if (!sp) ob.avisos.unshift({ nivel: 'error', titulo: 'SECURITY DEFINER sin search_path', detalle: 'Se ejecuta con los permisos del dueño. Fija SET search_path = … para evitar que otro esquema suplante objetos.', linea: null });
      else ob.avisos.unshift({ nivel: 'info', titulo: 'SECURITY DEFINER', detalle: 'Se ejecuta con los permisos del dueño de la función (search_path fijado).', linea: null });
    }
    if (an && rend && !esProc && p.returns && !tg && !/^void$/i.test(res.retorna) && !an.retornos.length && !p.params.some(function (x) { return /^(OUT|INOUT)$/.test(x.modo); }) && lang === 'plpgsql' && !/^TABLE/i.test(res.retorna))
      ob.avisos.push({ nivel: 'warn', titulo: 'Sin RETURN', detalle: 'La función devuelve ' + res.retorna + ' pero no se encontró ningún RETURN.', linea: null });
    if (tg && an) {
      if (!an.retornos.length) ob.avisos.push({ nivel: 'error', titulo: 'Función de trigger sin RETURN', detalle: 'Toda función de trigger debe terminar con RETURN NEW / OLD / NULL.', linea: null });
    }
    if (tg && p.params.length) ob.avisos.push({ nivel: 'warn', titulo: 'Parámetros en función de trigger', detalle: 'Las funciones de trigger no reciben parámetros; los datos llegan por TG_ARGV.', linea: null });
    return ob;
  }

  function procTrigger(st, src, o) {
    var T = st.toks, p = parseTrigger(T, o);
    var ob = mkObj('TRIGGER', 'Trigger', cleanName(p.nombre));
    ob.p = p;
    var lead = leadLines(st.lead);
    var cab = lead.concat(headerTrigger(p, o)), cuerpo = [], pie = [], rend = null;
    if (p.bodyToks && p.bodyToks.length) {
      var inner = src.slice(p.bodyToks[0].s, p.bodyToks[p.bodyToks.length - 1].e) + ';';
      rend = renderBlock(inner, o);
      cuerpo = rend.lines;
    } else if (p.inline && p.inline.length) {
      rend = renderBlock(raw(src, p.inline) + ';', o);
      cuerpo = rend.lines.map(function (l) { return o.indStr + l; });
    } else cab[cab.length - 1] += ';';
    ensamblar(ob, cab, cuerpo, pie);

    var res = ob.resumen;
    var mom = { BEFORE: 'ANTES de', AFTER: 'DESPUÉS de', 'INSTEAD OF': 'EN LUGAR DE' }[p.momento] || p.momento;
    res.trigger = { momento: p.momento, eventos: p.eventos, columnas: p.columnas, tabla: cleanName(p.tabla), nivel: p.nivel || 'STATEMENT', cuando: p.cuando, funcion: cleanName(p.funcion), args: p.args, diferible: p.diferible };
    res.datos.push({ k: 'Nombre', v: cleanName(p.nombre) });
    res.datos.push({ k: 'Momento', v: p.momento });
    res.datos.push({ k: 'Eventos', v: p.eventos.map(function (e) { return e + (e === 'UPDATE' && p.columnas.length ? ' (solo ' + p.columnas.join(', ') + ')' : ''); }).join(' / ') || '—' });
    res.datos.push({ k: 'Tabla', v: cleanName(p.tabla) });
    res.datos.push({ k: 'Se ejecuta', v: p.nivel === 'ROW' ? 'por cada fila afectada' : (p.nivel === 'STATEMENT' ? 'una vez por sentencia' : 'una vez por sentencia (por defecto)') });
    if (p.cuando) res.datos.push({ k: 'Condición (WHEN)', v: p.cuando });
    if (p.funcion) res.datos.push({ k: 'Función que llama', v: cleanName(p.funcion) + '(' + p.args + ')' });
    if (p.diferible) res.datos.push({ k: 'Diferible', v: p.diferible });
    var evTxt = p.eventos.join(', ').replace(/, ([^,]*)$/, ' o $1');
    res.descripcion = 'Se dispara ' + mom + ' ' + (evTxt || '…') + ' sobre «' + cleanName(p.tabla) + '»' +
      (p.nivel === 'ROW' ? ', por cada fila' : ', una vez por sentencia') +
      (p.cuando ? ', solo cuando ' + p.cuando : '') + (p.funcion ? ' y ejecuta la función ' + cleanName(p.funcion) + '().' : '.');
    if (rend) analizarCuerpo(rend, null, 'plpgsql', cab.length, ob);
    /* avisos propios del trigger */
    if (p.momento === 'INSTEAD OF' && p.nivel !== 'ROW') ob.avisos.unshift({ nivel: 'error', titulo: 'INSTEAD OF requiere FOR EACH ROW', detalle: 'Los triggers INSTEAD OF solo existen a nivel de fila (y sobre vistas).', linea: null });
    if (p.eventos.indexOf('TRUNCATE') >= 0 && p.nivel === 'ROW') ob.avisos.unshift({ nivel: 'error', titulo: 'TRUNCATE no admite FOR EACH ROW', detalle: 'Los triggers de TRUNCATE solo pueden ser FOR EACH STATEMENT.', linea: null });
    if (p.cuando && p.nivel !== 'ROW') ob.avisos.unshift({ nivel: 'warn', titulo: 'WHEN en trigger de sentencia', detalle: 'NEW/OLD no existen a nivel de sentencia; revisa la condición.', linea: null });
    if (p.eventos.indexOf('UPDATE') >= 0 && !p.columnas.length && !p.cuando && p.nivel === 'ROW')
      ob.avisos.push({ nivel: 'info', titulo: 'UPDATE sin OF ni WHEN', detalle: 'Se dispara aunque no cambie ningún valor. Considera WHEN (OLD.* IS DISTINCT FROM NEW.*) o UPDATE OF columnas.', linea: null });
    return ob;
  }

  function procDo(st, src, o) {
    var T = noComments(st.toks), body = null, lang = 'plpgsql', i;
    for (i = 1; i < T.length; i++) {
      if (isW(T[i], 'LANGUAGE') && T[i + 1]) { lang = T[i + 1].v.replace(/^'|'$/g, '').toLowerCase(); i++; }
      else if (T[i].t === 'dol' || T[i].t === 'str') body = T[i];
    }
    if (!body) throw new Error('DO sin cuerpo');
    var ob = mkObj('DO', 'Bloque anónimo', 'DO');
    var p = { body: body };
    var bp = bodyParts(p);
    var cab = leadLines(st.lead).concat([K('DO', o) + (lang !== 'plpgsql' ? ' ' + K('LANGUAGE', o) + ' ' + lang : '') + ' ' + bp.tag]);
    var rend = lang === 'plpgsql' ? renderBlock(bp.inner, o) : null;
    var cuerpo = rend ? rend.lines : dedent(bp.inner).map(function (l) { return l ? o.indStr + l : l; });
    ensamblar(ob, cab, cuerpo, [bp.tag + ';']);
    ob.delim = bp.tag;
    ob.resumen.datos.push({ k: 'Tipo', v: 'Bloque anónimo (DO)' });
    ob.resumen.datos.push({ k: 'Lenguaje', v: lang });
    ob.resumen.descripcion = 'Bloque de código que se ejecuta una sola vez; no se guarda en la base de datos.';
    if (rend) analizarCuerpo(rend, null, lang, cab.length, ob);
    return ob;
  }

  function procOtro(st, src, o) {
    var T = st.toks, rawTxt = raw(src, T), fm = fmtSql(rawTxt, o);
    var ws = noComments(T), rot = ws.slice(0, 2).map(function (x) { return x.v; }).join(' ').toUpperCase(), nom = [], q = 2;
    while (q < ws.length && ws[q].t === 'w' && /^(IF|NOT|EXISTS|ONLY|TABLE)$/.test(ws[q].u)) q++;
    while (q < ws.length && nom.length < 5 && (!nom.length || isP(ws[q], '.') || isP(nom[nom.length - 1], '.')) && (ws[q].t === 'w' || ws[q].t === 'dq' || isP(ws[q], '.'))) { nom.push(ws[q]); q++; }
    var ob = mkObj('OTRO', 'Sentencia', nom.length ? nom.map(function (x) { return x.v; }).join('') : (rot || 'SQL'));
    ob.rotulo = rot || 'Sentencia';
    var lines = fm ? fm : rawTxt.split('\n');
    lines = lines.slice();
    lines[lines.length - 1] += ';';
    ensamblar(ob, leadLines(st.lead).concat(lines), [], []);
    ob.resumen.datos.push({ k: 'Sentencia', v: rot + (nom.length ? ' ' + ob.nombre : '') });
    return ob;
  }

  /* ---------------------------------------------------------------------- */
  /* Relacionar triggers con sus funciones                                   */
  /* ---------------------------------------------------------------------- */
  function vincular(objetos) {
    var funcs = {};
    objetos.forEach(function (ob) { if (ob.tipo === 'FUNCION' || ob.tipo === 'PROCEDIMIENTO') funcs[shortName(ob.nombre)] = ob; });
    objetos.forEach(function (ob) {
      if (ob.tipo !== 'TRIGGER' || !ob.p || !ob.p.funcion) return;
      var f = funcs[shortName(ob.p.funcion)];
      var res = ob.resumen;
      res.trigger.funcionEnScript = !!f;
      if (!f) {
        ob.avisos.push({ nivel: 'info', titulo: 'Función no incluida', detalle: 'La función ' + cleanName(ob.p.funcion) + '() no está en este texto; no se puede revisar su contenido.', linea: null });
        return;
      }
      ob.funcionObj = f.nombre;
      f.resumen.usadaPor = (f.resumen.usadaPor || []).concat([{ trigger: ob.nombre, tabla: cleanName(ob.p.tabla), momento: ob.p.momento, eventos: ob.p.eventos }]);
      if (!f.esTriggerFn) ob.avisos.unshift({ nivel: 'error', titulo: 'La función no es de trigger', detalle: cleanName(f.nombre) + '() no declara RETURNS trigger, por lo que no se puede usar en un trigger.', linea: null });
      else ob.avisos.push({ nivel: 'ok', titulo: 'Función encontrada', detalle: cleanName(f.nombre) + '() está en este script y devuelve trigger.', linea: null });
      var an = f.an;
      if (an) {
        var tabla = shortName(ob.p.tabla);
        var rec = an.escOut.filter(function (e) { return shortName(e.tabla) === tabla && e.ops.some(function (x) { return x !== 'DELETE' || true; }); });
        if (rec.length && ob.p.momento !== 'INSTEAD OF') {
          var aviso = { nivel: 'warn', titulo: 'Posible recursión', detalle: cleanName(f.nombre) + '() modifica la misma tabla «' + cleanName(ob.p.tabla) + '» sobre la que se dispara el trigger (' + rec[0].ops.join('/') + '). Puede llamarse a sí mismo sin fin; usa WHEN o pg_trigger_depth().', linea: null };
          ob.avisos.push(aviso);
          f.avisos.push(aviso);
        }
        var ret = an.retornos.map(function (r) { return r.valor; });
        if (ob.p.momento === 'BEFORE' && ob.p.nivel === 'ROW') {
          if (!ret.length) ob.avisos.push({ nivel: 'error', titulo: 'BEFORE ROW sin RETURN', detalle: 'La función no devuelve NEW/OLD/NULL: la operación fallará.', linea: null });
          else if (ret.every(function (r) { return r === 'NULL'; })) ob.avisos.push({ nivel: 'warn', titulo: 'Siempre devuelve NULL', detalle: 'En un BEFORE ROW, RETURN NULL cancela la operación sobre cada fila.', linea: null });
          else if (ob.p.eventos.length === 1 && ob.p.eventos[0] === 'DELETE' && ret.indexOf('OLD') < 0 && ret.indexOf('NULL') < 0)
            ob.avisos.push({ nivel: 'warn', titulo: 'BEFORE DELETE devuelve NEW', detalle: 'En DELETE no existe NEW; devuelve OLD para que se borre la fila.', linea: null });
        }
        if (ob.p.momento === 'AFTER' && an.newCols.length)
          f.avisos.push({ nivel: 'warn', titulo: 'Cambia NEW en un trigger AFTER', detalle: 'Los cambios en NEW (' + an.newCols.join(', ') + ') no tienen efecto en un trigger AFTER; usa BEFORE.', linea: null });
        if (ob.p.eventos.indexOf('INSERT') >= 0 && ob.p.eventos.length === 1 && an.usaOLD)
          f.avisos.push({ nivel: 'warn', titulo: 'Usa OLD en un trigger de INSERT', detalle: 'OLD no existe en INSERT; fallará al ejecutarse.', linea: null });
        if (ob.p.eventos.indexOf('DELETE') >= 0 && ob.p.eventos.length === 1 && an.usaNEW)
          f.avisos.push({ nivel: 'warn', titulo: 'Usa NEW en un trigger de DELETE', detalle: 'NEW no existe en DELETE; fallará al ejecutarse.', linea: null });
      }
    });
  }

  /* Descripción en lenguaje natural para funciones */
  function describirFuncion(ob) {
    var res = ob.resumen, p = ob.p, an = ob.an, partes = [];
    if (ob.esTriggerFn) {
      partes.push('Función de trigger');
      if (an && an.tgOps.length) partes.push('que reacciona a ' + an.tgOps.join(', '));
    } else if (ob.tipo === 'PROCEDIMIENTO') partes.push('Procedimiento');
    else partes.push('Función');
    var s = partes[0] + ' «' + ob.nombre + '»';
    if (ob.esTriggerFn && an && an.tgOps.length) s += ' que distingue ' + an.tgOps.join(', ').replace(/, ([^,]*)$/, ' y $1') + ' (TG_OP)';
    if (!ob.esTriggerFn) {
      var ent = p.params.filter(function (x) { return x.modo !== 'OUT'; }).length;
      s += ent ? ' que recibe ' + ent + (ent === 1 ? ' parámetro' : ' parámetros') : ' que no recibe parámetros';
      if (res.retorna && res.retorna !== '—') s += ' y devuelve ' + res.retorna;
    }
    var det = [];
    if (res.lee && res.lee.length) det.push('lee de ' + res.lee.join(', '));
    if (res.escribe && res.escribe.length) det.push('escribe en ' + res.escribe.map(function (e) { return e.tabla + ' (' + e.ops.join('/') + ')'; }).join(', '));
    if (an && an.newCols.length) det.push('modifica ' + an.newCols.map(function (c) { return 'NEW.' + c; }).join(', '));
    if (res.excepciones && res.excepciones.filter(function (x) { return x.nivel === 'EXCEPTION'; }).length) det.push('puede lanzar ' + res.excepciones.filter(function (x) { return x.nivel === 'EXCEPTION'; }).length + ' excepción(es)');
    if (det.length) s += '; ' + det.join('; ');
    return s + '.';
  }

  /* ---------------------------------------------------------------------- */
  /* API                                                                     */
  /* ---------------------------------------------------------------------- */
  function analizar(texto, opts) {
    var o = normOpts(opts), src = String(texto == null ? '' : texto);
    var toks = tokenize(src), stmts = splitStatements(toks), objetos = [];
    stmts.forEach(function (st) {
      var ob = null, kind;
      if (!st.toks.length) {
        if (st.lead.length) {
          ob = mkObj('COMENTARIO', 'Comentario', 'Comentario');
          ensamblar(ob, leadLines(st.lead), [], []);
        }
      } else {
        kind = rutinaTipo(noComments(st.toks).slice(0, 10));
        try {
          if (kind === 'TRIGGER') ob = procTrigger(st, src, o);
          else if (kind === 'FUNCION' || kind === 'PROCEDIMIENTO') ob = procFuncion(st, kind, src, o);
          else if (kind === 'DO') ob = procDo(st, src, o);
        } catch (e) { ob = null; }
        if (!ob) ob = procOtro(st, src, o);
      }
      if (ob) { ob.id = objetos.length; objetos.push(ob); }
    });
    vincular(objetos);
    objetos.forEach(function (ob) {
      if (ob.tipo === 'FUNCION' || ob.tipo === 'PROCEDIMIENTO') {
        ob.resumen.descripcion = describirFuncion(ob);
        if (ob.resumen.usadaPor && ob.resumen.usadaPor.length) ob.resumen.datos.push({ k: 'Usada por', v: ob.resumen.usadaPor.map(function (u) { return u.trigger + ' (' + u.momento + ' ' + u.eventos.join('/') + ' en ' + u.tabla + ')'; }).join(' · ') });
      }
      /* orden: errores primero */
      var peso = { error: 0, warn: 1, info: 2, ok: 3 };
      ob.avisos.sort(function (a, b) { return (peso[a.nivel] - peso[b.nivel]); });
      ob.conteo = { error: 0, warn: 0, info: 0, ok: 0 };
      ob.avisos.forEach(function (a) { ob.conteo[a.nivel]++; });
    });
    var sep = '\n\n';
    var totales = { funciones: 0, procedimientos: 0, triggers: 0, otros: 0, errores: 0, avisos: 0 };
    objetos.forEach(function (ob) {
      if (ob.tipo === 'FUNCION') totales.funciones++; else if (ob.tipo === 'PROCEDIMIENTO') totales.procedimientos++;
      else if (ob.tipo === 'TRIGGER') totales.triggers++; else totales.otros++;
      totales.errores += ob.conteo.error; totales.avisos += ob.conteo.warn;
    });
    return {
      objetos: objetos,
      texto: objetos.map(function (ob) { return ob.texto; }).join(sep),
      totales: totales
    };
  }

  var EJEMPLO = [
    '-- Auditoría de cambios en facturas',
    'create or replace function public.fn_audit_factura() returns trigger language plpgsql security definer as $$',
    'declare v_usuario text := current_user; v_cambios integer := 0; v_no_usada text;',
    'begin',
    'if (tg_op = \'INSERT\') then',
    'insert into auditoria_factura(factura_id,accion,usuario,fecha) values (new.id,\'INSERT\',v_usuario,now());',
    'elsif (tg_op = \'UPDATE\') then',
    'if new.total <> old.total or new.estado <> old.estado then',
    'insert into auditoria_factura(factura_id,accion,usuario,fecha,detalle) values (new.id,\'UPDATE\',v_usuario,now(),format(\'total %s -> %s\',old.total,new.total));',
    'end if;',
    'new.actualizado_en := now();',
    'elsif (tg_op = \'DELETE\') then',
    'delete from detalle_factura;',
    'insert into auditoria_factura(factura_id,accion,usuario,fecha) values (old.id,\'DELETE\',v_usuario,now());',
    'return old;',
    'end if;',
    'return new;',
    'exception when others then null;',
    'end; $$;',
    '',
    'create trigger trg_audit_factura after insert or update or delete on public.facturas for each row execute function public.fn_audit_factura();',
    '',
    'create or replace function calcular_total(p_factura_id integer, p_iva numeric default 0.19, p_tabla text default \'detalle\') returns numeric as $$',
    'declare v_total numeric; r record;',
    'begin',
    'select sum(cantidad*precio) into v_total from detalle_factura where factura_id=p_factura_id;',
    'for r in select id, descuento from descuentos where factura_id = p_factura_id loop',
    'v_total := v_total - r.descuento;',
    'end loop;',
    'execute \'update \' || p_tabla || \' set total = \' || v_total;',
    'return v_total * (1 + p_iva);',
    'end;',
    '$$ language plpgsql stable;'
  ].join('\n');

  return { analizar: analizar, tokenize: tokenize, EJEMPLO: EJEMPLO, normOpts: normOpts };
});
