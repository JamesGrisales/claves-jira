/* ==========================================================================
   Validador y Revisor de Sintaxis SQL para PostgreSQL
   - Detecta discrepancias de columnas vs valores en INSERT (ej. 5 campos y 4 valores).
   - Detecta UPDATE y DELETE sin cláusula WHERE (prevención de desastres).
   - Detecta comas huérfanas o sobrantes (antes de FROM, WHERE, o al final de tuplas).
   - Detecta sentencias incompletas (UPDATE sin SET, INSERT sin VALUES/SELECT).
   - Detecta paréntesis, comillas y comentarios sin cerrar con número exacto de línea.
   - Provee correcciones automáticas (autoFix) para completar campos faltantes con NULL.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./sql-formatter.js'));
  } else {
    root.SqlValidador = factory(root.SqlFormatter);
  }
})(typeof self !== 'undefined' ? self : this, function (SqlFormatter) {
  'use strict';

  function getLineCol(src, pos) {
    var before = src.slice(0, pos);
    var lines = before.split('\n');
    return {
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    };
  }

  function isBinaryOp(tok) {
    if (!tok) return false;
    if (tok.t === 'op') {
      var ops = ['+', '-', '*', '/', '%', '||', '=', '!=', '<>', '<', '>', '<=', '>=', '::', '->', '->>', '#>', '#>>', '~', '~*', '!~', '!~*'];
      return ops.indexOf(tok.v) >= 0;
    }
    if (tok.t === 'w') {
      var kwOps = ['AND', 'OR', 'IS', 'LIKE', 'ILIKE', 'IN', 'BETWEEN', 'NOT', 'AS', 'COLLATE'];
      return kwOps.indexOf(tok.u) >= 0;
    }
    return false;
  }

  function isValToken(tok) {
    if (!tok) return false;
    if (tok.t === 'num' || tok.t === 'str') return true;
    if (tok.t === 'p' && (tok.v === ')' || tok.v === '(')) return true;
    if (tok.t === 'w') {
      var c = tok.u;
      if (c === 'NULL' || c === 'TRUE' || c === 'FALSE' || c === 'DEFAULT' || tok.v === '?' || (tok.v && (tok.v[0] === '$' || tok.v[0] === ':'))) return true;
    }
    if (tok.t === 'op' && tok.v === '?') return true;
    return false;
  }

  function parseStatements(tokens) {
    var statements = [];
    var current = [];
    var depth = 0;

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.t === 'p' && t.v === '(') depth++;
      else if (t.t === 'p' && t.v === ')' && depth > 0) depth--;

      if (t.t === 'p' && t.v === ';' && depth === 0) {
        if (current.length) {
          statements.push(current);
          current = [];
        }
      } else {
        current.push(t);
      }
    }
    if (current.length) statements.push(current);
    return statements;
  }

  function splitCommaDepth0(toks) {
    var items = [];
    var cur = [];
    var depth = 0;
    var trailingComma = false;

    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (t.t === 'p' && t.v === '(') depth++;
      else if (t.t === 'p' && t.v === ')' && depth > 0) depth--;

      if (t.t === 'p' && t.v === ',' && depth === 0) {
        items.push(cur);
        cur = [];
        trailingComma = true;
      } else {
        if (t.t !== 'lc' && t.t !== 'bc') trailingComma = false;
        cur.push(t);
      }
    }
    if (cur.length || items.length) items.push(cur);
    return { items: items, trailingComma: trailingComma };
  }

  function checkMissingCommasInColumns(tokList, tableName, stmtIdx, src, diagnostics) {
    var sig = tokList.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
    if (sig.length <= 1) return;

    var lastWasIdent = false;
    var prevTok = null;

    for (var i = 0; i < sig.length; i++) {
      var tok = sig[i];
      if (tok.t === 'w' || tok.t === 'qi') {
        if (lastWasIdent) {
          var lc = getLineCol(src, tok.s);
          diagnostics.push({
            type: 'error',
            code: 'MISSING_COMMA_COLUMNS',
            title: "Falta una coma ',' entre columnas",
            message: "Línea " + lc.line + ": Falta una coma ',' entre la columna '" + prevTok.v + "' y '" + tok.v + "' en la definición de INSERT para '" + tableName + "'.",
            line: lc.line,
            col: lc.col,
            tokenPos: tok.s,
            statementIndex: stmtIdx,
            details: {
              prevName: prevTok.v,
              nextName: tok.v,
              insertPos: tok.s
            }
          });
        }
        lastWasIdent = true;
        prevTok = tok;
      } else if (tok.t === 'p' && tok.v === '.') {
        lastWasIdent = false;
      } else {
        lastWasIdent = false;
      }
    }
  }

  function extractCleanColumns(items) {
    var result = [];
    items.forEach(function (tokList) {
      var sig = tokList.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
      var curCol = '';
      for (var i = 0; i < sig.length; i++) {
        var tok = sig[i];
        if (tok.t === 'p' && tok.v === '.') {
          curCol += tok.v;
        } else if (tok.t === 'w' || tok.t === 'qi') {
          if (curCol && curCol[curCol.length - 1] !== '.') {
            result.push(curCol);
            curCol = tok.v;
          } else {
            curCol += tok.v;
          }
        } else {
          curCol += tok.v;
        }
      }
      if (curCol) result.push(curCol);
    });
    return result.filter(function (x) { return x.trim() !== ''; });
  }

  function checkMissingCommasInValues(tokList, tableName, rowCount, stmtIdx, src, diagnostics) {
    var sig = tokList.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
    if (sig.length <= 1) return;

    var depth = 0;
    var prevEnd = null;
    var prevSummary = '';

    for (var i = 0; i < sig.length; i++) {
      var tok = sig[i];
      if (tok.t === 'p' && tok.v === '(') {
        if (depth === 0) {
          var isFuncCall = (i > 0 && (sig[i - 1].t === 'w' || sig[i - 1].t === 'qi') && !isBinaryOp(sig[i - 1]));
          if (prevEnd && !isFuncCall) {
            var lc = getLineCol(src, tok.s);
            diagnostics.push({
              type: 'error',
              code: 'MISSING_COMMA_VALUES',
              title: "Falta una coma ',' entre valores",
              message: "Línea " + lc.line + ": Falta una coma ',' entre el valor '" + (prevSummary || prevEnd.v) + "' y la siguiente expresión '(' en la fila " + rowCount + " de VALUES.",
              line: lc.line,
              col: lc.col,
              tokenPos: tok.s,
              statementIndex: stmtIdx,
              details: {
                prevVal: prevSummary || prevEnd.v,
                nextVal: '(',
                insertPos: tok.s
              }
            });
            prevEnd = null;
          }
        }
        depth++;
        continue;
      }

      if (tok.t === 'p' && tok.v === ')') {
        if (depth > 0) depth--;
        if (depth === 0) {
          prevEnd = tok;
          prevSummary = '(...)';
        }
        continue;
      }

      if (depth > 0) continue;

      if (isBinaryOp(tok)) {
        prevEnd = null;
        continue;
      }

      var typePrefixes = ['DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'];
      if (tok.t === 'w' && typePrefixes.indexOf(tok.u) >= 0) {
        prevEnd = null;
        continue;
      }

      var isValStart = false;
      if (tok.t === 'num' || tok.t === 'str') isValStart = true;
      else if (tok.t === 'op' && tok.v === '?') isValStart = true;
      else if (tok.t === 'w') {
        var u = tok.u;
        if (u === 'NULL' || u === 'TRUE' || u === 'FALSE' || u === 'DEFAULT') isValStart = true;
        else if (tok.v === '?' || (tok.v && (tok.v[0] === '$' || tok.v[0] === ':'))) isValStart = true;
        else if (u === 'CASE') isValStart = true;
        else if (i + 1 < sig.length && sig[i + 1].t === 'p' && sig[i + 1].v === '(') isValStart = true;
      }

      if (isValStart && prevEnd) {
        var lcTok = getLineCol(src, tok.s);
        diagnostics.push({
          type: 'error',
          code: 'MISSING_COMMA_VALUES',
          title: "Falta una coma ',' entre valores",
          message: "Línea " + lcTok.line + ": Falta una coma ',' entre el valor '" + (prevSummary || prevEnd.v) + "' y '" + tok.v + "' en la fila " + rowCount + " de VALUES.",
          line: lcTok.line,
          col: lcTok.col,
          tokenPos: tok.s,
          statementIndex: stmtIdx,
          details: {
            prevVal: prevSummary || prevEnd.v,
            nextVal: tok.v,
            insertPos: tok.s
          }
        });
      }

      if (tok.t === 'num' || tok.t === 'str') {
        prevEnd = tok;
        prevSummary = tok.v;
      } else if (tok.t === 'op' && tok.v === '?') {
        prevEnd = tok;
        prevSummary = '?';
      } else if (tok.t === 'w') {
        var wU = tok.u;
        if (wU === 'NULL' || wU === 'TRUE' || wU === 'FALSE' || wU === 'DEFAULT' || tok.v === '?' || (tok.v && (tok.v[0] === '$' || tok.v[0] === ':'))) {
          prevEnd = tok;
          prevSummary = tok.v;
        } else {
          prevEnd = null;
        }
      }
    }
  }

  function extractCleanValues(items) {
    var result = [];
    items.forEach(function (tokList) {
      var sig = tokList.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
      if (!sig.length) return;

      var depth = 0;
      var curVal = '';
      var prevEnd = false;

      for (var i = 0; i < sig.length; i++) {
        var tok = sig[i];
        if (tok.t === 'p' && tok.v === '(') {
          if (depth === 0 && prevEnd) {
            var isFunc = (i > 0 && (sig[i - 1].t === 'w' || sig[i - 1].t === 'qi') && !isBinaryOp(sig[i - 1]));
            if (!isFunc) {
              if (curVal.trim()) result.push(curVal.trim());
              curVal = '';
              prevEnd = false;
            }
          }
          depth++;
          curVal += tok.v;
          continue;
        }

        if (tok.t === 'p' && tok.v === ')') {
          if (depth > 0) depth--;
          curVal += tok.v;
          if (depth === 0) prevEnd = true;
          continue;
        }

        if (depth > 0) {
          curVal += tok.v;
          continue;
        }

        if (isBinaryOp(tok)) {
          prevEnd = false;
          curVal += ' ' + tok.v + ' ';
          continue;
        }

        var isValStart = false;
        if (tok.t === 'num' || tok.t === 'str') isValStart = true;
        else if (tok.t === 'op' && tok.v === '?') isValStart = true;
        else if (tok.t === 'w') {
          var u = tok.u;
          if (u === 'NULL' || u === 'TRUE' || u === 'FALSE' || u === 'DEFAULT') isValStart = true;
          else if (tok.v === '?' || (tok.v && (tok.v[0] === '$' || tok.v[0] === ':'))) isValStart = true;
          else if (u === 'CASE') isValStart = true;
          else if (i + 1 < sig.length && sig[i + 1].t === 'p' && sig[i + 1].v === '(') isValStart = true;
        }

        if (isValStart && prevEnd) {
          if (curVal.trim()) result.push(curVal.trim());
          curVal = tok.v;
          prevEnd = (tok.t === 'num' || tok.t === 'str' || (tok.t === 'op' && tok.v === '?') || tok.t === 'w');
        } else {
          curVal += (curVal ? ' ' : '') + tok.v;
          if (tok.t === 'num' || tok.t === 'str' || (tok.t === 'op' && tok.v === '?')) {
            prevEnd = true;
          } else if (tok.t === 'w' && (tok.u === 'NULL' || tok.u === 'TRUE' || tok.u === 'FALSE' || tok.u === 'DEFAULT')) {
            prevEnd = true;
          } else {
            prevEnd = false;
          }
        }
      }
      if (curVal.trim()) result.push(curVal.trim());
    });
    return result;
  }

  function checkMissingCommasInUpdateSet(tokList, tableName, stmtIdx, src, diagnostics) {
    var sig = tokList.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
    var depth = 0;
    var eqCount = 0;

    for (var i = 0; i < sig.length; i++) {
      var tok = sig[i];
      if (tok.t === 'p' && tok.v === '(') depth++;
      else if (tok.t === 'p' && tok.v === ')' && depth > 0) depth--;

      if (depth === 0 && tok.t === 'op' && tok.v === '=') {
        eqCount++;
        if (eqCount > 1) {
          var colTok = (i > 0) ? sig[i - 1] : tok;
          var lc = getLineCol(src, colTok.s);
          diagnostics.push({
            type: 'error',
            code: 'MISSING_COMMA_UPDATE_SET',
            title: "Falta una coma ',' en SET",
            message: "Línea " + lc.line + ": Falta una coma ',' antes de la columna '" + colTok.v + "' en la cláusula SET de la tabla '" + tableName + "'.",
            line: lc.line,
            col: lc.col,
            tokenPos: colTok.s,
            statementIndex: stmtIdx,
            details: {
              colName: colTok.v,
              insertPos: colTok.s
            }
          });
        }
      }
    }
  }

  function validate(src) {
    src = String(src == null ? '' : src);
    if (!src.trim()) {
      return {
        valid: true,
        errorsCount: 0,
        warningsCount: 0,
        diagnostics: [],
        stats: { statements: 0, inserts: 0, updates: 0, deletes: 0, selects: 0 }
      };
    }

    var tkResult = SqlFormatter.tokenize(src);
    var tokens = tkResult.tokens;
    var diagnostics = [];
    var stats = { statements: 0, inserts: 0, updates: 0, deletes: 0, selects: 0 };

    // 1. Advertencias iniciales del tokenizador (comillas o comentarios sin cerrar)
    if (tkResult.warnings && tkResult.warnings.length) {
      tkResult.warnings.forEach(function (w) {
        diagnostics.push({
          type: 'error',
          code: 'TOKENIZER_UNCLOSED',
          title: 'Texto o comentario sin cerrar',
          message: w,
          line: 1,
          col: 1,
          tokenPos: 0
        });
      });
    }

    // 2. Balance estricto de paréntesis () con contexto y número de línea exacto
    var parenStack = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.t === 'p' && t.v === '(') {
        parenStack.push({ token: t, index: i });
      } else if (t.t === 'p' && t.v === ')') {
        if (!parenStack.length) {
          var lcClose = getLineCol(src, t.s);
          diagnostics.push({
            type: 'error',
            code: 'UNEXPECTED_CLOSE_PAREN',
            title: "Paréntesis de cierre ')' huérfano",
            message: "Línea " + lcClose.line + ": Se encontró un paréntesis de cierre ')' en la línea " + lcClose.line + ", columna " + lcClose.col + " sin un '(' de apertura previo.",
            line: lcClose.line,
            col: lcClose.col,
            tokenPos: t.s
          });
        } else {
          parenStack.pop();
        }
      }
    }
    while (parenStack.length) {
      var unclosedItem = parenStack.pop();
      var unclosed = unclosedItem.token;
      var uIdx = unclosedItem.index;
      var lcOpen = getLineCol(src, unclosed.s);

      var prevSig = null;
      for (var pi = uIdx - 1; pi >= 0; pi--) {
        if (tokens[pi].t !== 'lc' && tokens[pi].t !== 'bc') {
          prevSig = tokens[pi];
          break;
        }
      }

      var titulo = "Paréntesis '(' abierto sin cerrar";
      var msg = "Línea " + lcOpen.line + ": El paréntesis '(' abierto en la línea " + lcOpen.line + ", columna " + lcOpen.col + " no fue cerrado. Falta un ')' de cierre al final.";

      if (prevSig) {
        if (prevSig.t === 'w' && prevSig.u === 'VALUES') {
          titulo = "Falta paréntesis de cierre ')' en VALUES";
          msg = "Línea " + lcOpen.line + ": La cláusula VALUES abierta en la línea " + lcOpen.line + ", columna " + lcOpen.col + " no fue cerrada. Falta un paréntesis ')' al final de los valores.";
        } else if (prevSig.t === 'w' && prevSig.u === 'IN') {
          titulo = "Falta paréntesis de cierre ')' en lista IN(...)";
          msg = "Línea " + lcOpen.line + ": La lista IN(...) abierta en la línea " + lcOpen.line + ", columna " + lcOpen.col + " no fue cerrada. Falta un paréntesis ')' de cierre.";
        } else if (prevSig.t === 'w' || prevSig.t === 'qi') {
          titulo = "Falta paréntesis de cierre ')' en columnas de " + prevSig.v;
          msg = "Línea " + lcOpen.line + ": La lista de columnas para '" + prevSig.v + "' abierta en la línea " + lcOpen.line + ", columna " + lcOpen.col + " no fue cerrada. Falta un paréntesis ')' de cierre.";
        }
      }

      diagnostics.push({
        type: 'error',
        code: 'UNCLOSED_OPEN_PAREN',
        title: titulo,
        message: msg,
        line: lcOpen.line,
        col: lcOpen.col,
        tokenPos: unclosed.s
      });
    }

    // 3. Balance de bloques CASE ... END
    var caseStack = [];
    for (var ci = 0; ci < tokens.length; ci++) {
      var ct = tokens[ci];
      if (ct.t === 'w' && ct.u === 'CASE') {
        caseStack.push(ct);
      } else if (ct.t === 'w' && ct.u === 'END') {
        if (caseStack.length) caseStack.pop();
      }
    }
    while (caseStack.length) {
      var unclosedCase = caseStack.pop();
      var lcCase = getLineCol(src, unclosedCase.s);
      diagnostics.push({
        type: 'error',
        code: 'UNCLOSED_CASE',
        title: 'Bloque CASE sin END',
        message: "El bloque CASE iniciado en la línea " + lcCase.line + " no tiene su palabra de cierre END.",
        line: lcCase.line,
        col: lcCase.col,
        tokenPos: unclosedCase.s
      });
    }

    // 4. Comas dobles consecutivas fuera de cadenas
    for (var dj = 0; dj < tokens.length - 1; dj++) {
      if (tokens[dj].t === 'p' && tokens[dj].v === ',' && tokens[dj + 1].t === 'p' && tokens[dj + 1].v === ',') {
        var lcComma = getLineCol(src, tokens[dj + 1].s);
        diagnostics.push({
          type: 'error',
          code: 'DOUBLE_COMMA',
          title: 'Comas dobles consecutivas',
          message: "Se detectaron dos comas seguidas ',,' en la línea " + lcComma.line + ".",
          line: lcComma.line,
          col: lcComma.col,
          tokenPos: tokens[dj + 1].s
        });
      }
    }

    // 5. Análisis semántico de sentencias (INSERT, UPDATE, DELETE, SELECT)
    var statements = parseStatements(tokens);
    stats.statements = statements.length;

    statements.forEach(function (stmt, stmtIdx) {
      var sigIdx = 0;
      while (sigIdx < stmt.length && (stmt[sigIdx].t === 'lc' || stmt[sigIdx].t === 'bc')) sigIdx++;
      if (sigIdx >= stmt.length) return;

      var first = stmt[sigIdx];
      var second = stmt[sigIdx + 1];

      // ----------------------------------------------------
      // INSERT INTO
      // ----------------------------------------------------
      if (first.t === 'w' && first.u === 'INSERT') {
        stats.inserts++;
        var isInsertInto = second && second.t === 'w' && second.u === 'INTO';
        var tableIdx = isInsertInto ? sigIdx + 2 : sigIdx + 1;

        var tableName = '';
        while (tableIdx < stmt.length && (stmt[tableIdx].t === 'w' || stmt[tableIdx].t === 'qi' || (stmt[tableIdx].t === 'p' && stmt[tableIdx].v === '.'))) {
          tableName += stmt[tableIdx].v;
          tableIdx++;
        }

        if (!tableName) {
          var lcNoTable = getLineCol(src, first.s);
          diagnostics.push({
            type: 'error',
            code: 'INSERT_NO_TABLE',
            title: 'INSERT sin nombre de tabla',
            message: 'La sentencia INSERT no especifica la tabla destino.',
            line: lcNoTable.line,
            col: lcNoTable.col,
            tokenPos: first.s,
            statementIndex: stmtIdx
          });
          return;
        }

        var colParenStart = -1;
        var colParenEnd = -1;
        var valuesKeywordIdx = -1;
        var selectKeywordIdx = -1;

        for (var k = tableIdx; k < stmt.length; k++) {
          var tok = stmt[k];
          if (tok.t === 'w' && tok.u === 'VALUES') {
            valuesKeywordIdx = k;
            break;
          }
          if (tok.t === 'w' && tok.u === 'SELECT') {
            selectKeywordIdx = k;
            break;
          }
          if (tok.t === 'p' && tok.v === '(' && colParenStart === -1) {
            colParenStart = k;
            var d = 1;
            for (var m = k + 1; m < stmt.length; m++) {
              if (stmt[m].t === 'p' && stmt[m].v === '(') d++;
              else if (stmt[m].t === 'p' && stmt[m].v === ')') {
                d--;
                if (d === 0) {
                  colParenEnd = m;
                  break;
                }
              }
            }
            if (colParenEnd !== -1) k = colParenEnd;
          }
        }

        if (valuesKeywordIdx === -1 && selectKeywordIdx === -1) {
          var lcNoVal = getLineCol(src, first.s);
          diagnostics.push({
            type: 'error',
            code: 'INSERT_NO_VALUES_OR_SELECT',
            title: 'INSERT incompleto',
            message: "En la tabla '" + tableName + "': falta la cláusula VALUES o una consulta SELECT con los datos a insertar.",
            line: lcNoVal.line,
            col: lcNoVal.col,
            tokenPos: first.s,
            statementIndex: stmtIdx
          });
          return;
        }

        var explicitColumns = [];
        if (colParenStart !== -1 && colParenEnd !== -1) {
          var colTokens = stmt.slice(colParenStart + 1, colParenEnd);
          var colSplit = splitCommaDepth0(colTokens);
          if (colSplit.trailingComma) {
            var lcColComma = getLineCol(src, stmt[colParenEnd].s);
            diagnostics.push({
              type: 'error',
              code: 'INSERT_TRAILING_COMMA_COLUMNS',
              title: 'Coma sobrante en columnas de INSERT',
              message: "En tabla '" + tableName + "': hay una coma sobrante antes de cerrar ')' en la lista de columnas.",
              line: lcColComma.line,
              col: lcColComma.col,
              tokenPos: stmt[colParenEnd].s,
              statementIndex: stmtIdx
            });
          }
          // Chequeo de comas faltantes entre columnas
          colSplit.items.forEach(function (chunk) {
            checkMissingCommasInColumns(chunk, tableName, stmtIdx, src, diagnostics);
          });
          explicitColumns = extractCleanColumns(colSplit.items);

          var seenCols = {};
          explicitColumns.forEach(function (c) {
            var lower = c.toLowerCase().replace(/"/g, '');
            if (seenCols[lower]) {
              var lcDup = getLineCol(src, stmt[colParenStart].s);
              diagnostics.push({
                type: 'warning',
                code: 'INSERT_DUPLICATE_COLUMN',
                title: 'Columna duplicada en INSERT',
                message: "La columna '" + c + "' aparece repetida en la definición del INSERT para '" + tableName + "'.",
                line: lcDup.line,
                col: lcDup.col,
                tokenPos: stmt[colParenStart].s,
                statementIndex: stmtIdx
              });
            }
            seenCols[lower] = true;
          });
        }

        if (valuesKeywordIdx !== -1) {
          var vIdx = valuesKeywordIdx + 1;
          var rowCount = 0;

          while (vIdx < stmt.length) {
            var vTok = stmt[vIdx];
            if (vTok.t === 'p' && vTok.v === '(') {
              rowCount++;
              var tupleStart = vIdx;
              var vd = 1;
              var tupleEnd = -1;
              for (var vm = vIdx + 1; vm < stmt.length; vm++) {
                if (stmt[vm].t === 'p' && stmt[vm].v === '(') vd++;
                else if (stmt[vm].t === 'p' && stmt[vm].v === ')') {
                  vd--;
                  if (vd === 0) {
                    tupleEnd = vm;
                    break;
                  }
                }
              }

              if (tupleEnd !== -1) {
                var valTokens = stmt.slice(tupleStart + 1, tupleEnd);
                var valSplit = splitCommaDepth0(valTokens);
                // Chequear comas faltantes entre valores en cada bloque de la fila
                valSplit.items.forEach(function (chunk) {
                  checkMissingCommasInValues(chunk, tableName, rowCount, stmtIdx, src, diagnostics);
                });
                var tupleValues = extractCleanValues(valSplit.items);

                var tupleLc = getLineCol(src, stmt[tupleStart].s);

                if (valSplit.trailingComma) {
                  diagnostics.push({
                    type: 'error',
                    code: 'VALUES_TRAILING_COMMA',
                    title: 'Coma sobrante en VALUES',
                    message: "En tabla '" + tableName + "' (fila " + rowCount + " de VALUES): hay una coma sobrante antes del paréntesis ')'.",
                    line: tupleLc.line,
                    col: tupleLc.col,
                    tokenPos: stmt[tupleEnd].s,
                    statementIndex: stmtIdx
                  });
                }

                if (explicitColumns.length > 0) {
                  if (tupleValues.length < explicitColumns.length) {
                    var diff = explicitColumns.length - tupleValues.length;
                    var missingCols = explicitColumns.slice(tupleValues.length);
                    diagnostics.push({
                      type: 'error',
                      code: 'INSERT_VALUES_MISMATCH',
                      title: 'Discrepancia en INSERT: Faltan valores',
                      message: "En tabla '" + tableName + "': Se definieron " + explicitColumns.length + " campos pero la fila " + rowCount + " de VALUES solo tiene " + tupleValues.length + " valores. Hace falta " + diff + " valor(es) para: [" + missingCols.join(', ') + "].",
                      line: tupleLc.line,
                      col: tupleLc.col,
                      tokenPos: stmt[tupleStart].s,
                      statementIndex: stmtIdx,
                      details: {
                        table: tableName,
                        columns: explicitColumns,
                        columnsCount: explicitColumns.length,
                        values: tupleValues,
                        valuesCount: tupleValues.length,
                        diff: diff,
                        missingColumns: missingCols,
                        rowNumber: rowCount,
                        tupleClosePos: stmt[tupleEnd].s
                      }
                    });
                  } else if (tupleValues.length > explicitColumns.length) {
                    var surplusDiff = tupleValues.length - explicitColumns.length;
                    diagnostics.push({
                      type: 'error',
                      code: 'INSERT_VALUES_SURPLUS',
                      title: 'Discrepancia en INSERT: Sobran valores',
                      message: "En tabla '" + tableName + "': Se definieron " + explicitColumns.length + " campos pero la fila " + rowCount + " de VALUES tiene " + tupleValues.length + " valores. Sobran " + surplusDiff + " valor(es).",
                      line: tupleLc.line,
                      col: tupleLc.col,
                      tokenPos: stmt[tupleStart].s,
                      statementIndex: stmtIdx,
                      details: {
                        table: tableName,
                        columns: explicitColumns,
                        columnsCount: explicitColumns.length,
                        values: tupleValues,
                        valuesCount: tupleValues.length,
                        diff: surplusDiff,
                        rowNumber: rowCount
                      }
                    });
                  }
                }

                vIdx = tupleEnd + 1;
                continue;
              }
            }
            vIdx++;
          }
        }
      }

      // ----------------------------------------------------
      // UPDATE
      // ----------------------------------------------------
      if (first.t === 'w' && first.u === 'UPDATE') {
        stats.updates++;
        var uTableIdx = sigIdx + 1;
        var uTableName = '';
        while (uTableIdx < stmt.length && (stmt[uTableIdx].t === 'w' || stmt[uTableIdx].t === 'qi' || (stmt[uTableIdx].t === 'p' && stmt[uTableIdx].v === '.'))) {
          if (stmt[uTableIdx].t === 'w' && (stmt[uTableIdx].u === 'SET' || stmt[uTableIdx].u === 'WHERE')) break;
          uTableName += stmt[uTableIdx].v;
          uTableIdx++;
        }

        var setIdx = -1;
        var whereIdx = -1;
        for (var uk = sigIdx; uk < stmt.length; uk++) {
          if (stmt[uk].t === 'w' && stmt[uk].u === 'SET' && setIdx === -1) setIdx = uk;
          if (stmt[uk].t === 'w' && stmt[uk].u === 'WHERE' && whereIdx === -1) whereIdx = uk;
        }

        var uLc = getLineCol(src, first.s);

        if (setIdx === -1) {
          diagnostics.push({
            type: 'error',
            code: 'UPDATE_NO_SET',
            title: 'UPDATE sin cláusula SET',
            message: "En tabla '" + (uTableName || 'tabla') + "': falta la cláusula SET con las asignaciones.",
            line: uLc.line,
            col: uLc.col,
            tokenPos: first.s,
            statementIndex: stmtIdx
          });
        } else {
          var setEnd = whereIdx !== -1 ? whereIdx : stmt.length;
          var setTokens = stmt.slice(setIdx + 1, setEnd);
          var setSplit = splitCommaDepth0(setTokens);

          if (setSplit.trailingComma) {
            var errPos = whereIdx !== -1 ? stmt[whereIdx].s : stmt[stmt.length - 1].s;
            var errLc = getLineCol(src, errPos);
            diagnostics.push({
              type: 'error',
              code: 'UPDATE_SET_TRAILING_COMMA',
              title: 'Coma sobrante en SET de UPDATE',
              message: "En '" + (uTableName || 'tabla') + "': hay una coma sobrante al final del SET " + (whereIdx !== -1 ? 'antes de WHERE' : '') + ".",
              line: errLc.line,
              col: errLc.col,
              tokenPos: errPos,
              statementIndex: stmtIdx
            });
          }

          // Chequear comas faltantes entre asignaciones en SET
          setSplit.items.forEach(function (chunk) {
            checkMissingCommasInUpdateSet(chunk, uTableName || 'tabla', stmtIdx, src, diagnostics);
          });

          setSplit.items.forEach(function (asigTokens) {
            var sigAsig = asigTokens.filter(function (x) { return x.t !== 'lc' && x.t !== 'bc'; });
            if (!sigAsig.length) return;
            var eqIdx = sigAsig.findIndex(function (x) { return x.t === 'op' && x.v === '='; });
            if (eqIdx === -1) {
              var asigLc = getLineCol(src, sigAsig[0].s);
              diagnostics.push({
                type: 'error',
                code: 'UPDATE_SET_NO_EQUALS',
                title: 'Asignación inválida en SET',
                message: "En '" + uTableName + "': la expresión '" + sigAsig.map(function (x) { return x.v; }).join(' ') + "' no tiene el signo '='.",
                line: asigLc.line,
                col: asigLc.col,
                tokenPos: sigAsig[0].s,
                statementIndex: stmtIdx
              });
            } else {
              var valPart = sigAsig.slice(eqIdx + 1);
              if (!valPart.length) {
                var eqLc = getLineCol(src, sigAsig[eqIdx].s);
                diagnostics.push({
                  type: 'error',
                  code: 'UPDATE_SET_EMPTY_VALUE',
                  title: 'Valor vacío en asignación de SET',
                  message: "En '" + uTableName + "': falta el valor a asignar después del signo '='.",
                  line: eqLc.line,
                  col: eqLc.col,
                  tokenPos: sigAsig[eqIdx].s,
                  statementIndex: stmtIdx
                });
              }
            }
          });
        }

        if (whereIdx === -1) {
          diagnostics.push({
            type: 'warning',
            code: 'UPDATE_NO_WHERE',
            title: '⚠️ UPDATE sin cláusula WHERE',
            message: "En tabla '" + (uTableName || 'tabla') + "': no tiene filtro WHERE. Modificará absolutamente TODOS los registros.",
            line: uLc.line,
            col: uLc.col,
            tokenPos: first.s,
            statementIndex: stmtIdx,
            details: { table: uTableName }
          });
        }
      }

      // ----------------------------------------------------
      // DELETE FROM
      // ----------------------------------------------------
      if (first.t === 'w' && first.u === 'DELETE') {
        stats.deletes++;
        var dWhereIdx = -1;
        var dFromIdx = -1;
        for (var dk = sigIdx; dk < stmt.length; dk++) {
          if (stmt[dk].t === 'w' && stmt[dk].u === 'FROM' && dFromIdx === -1) dFromIdx = dk;
          if (stmt[dk].t === 'w' && stmt[dk].u === 'WHERE' && dWhereIdx === -1) dWhereIdx = dk;
        }

        var dLc = getLineCol(src, first.s);
        var dTableName = '';
        if (dFromIdx !== -1 && dFromIdx + 1 < stmt.length) {
          dTableName = stmt[dFromIdx + 1].v;
        }

        if (dWhereIdx === -1) {
          diagnostics.push({
            type: 'warning',
            code: 'DELETE_NO_WHERE',
            title: '⚠️ DELETE sin cláusula WHERE',
            message: "En tabla '" + (dTableName || 'tabla') + "': no tiene cláusula WHERE. ¡Eliminará TODOS los registros de la tabla!",
            line: dLc.line,
            col: dLc.col,
            tokenPos: first.s,
            statementIndex: stmtIdx,
            details: { table: dTableName }
          });
        }
      }

      // ----------------------------------------------------
      // SELECT
      // ----------------------------------------------------
      if (first.t === 'w' && first.u === 'SELECT') {
        stats.selects++;
        var sFromIdx = -1;
        var sDepth = 0;
        for (var sk = sigIdx; sk < stmt.length; sk++) {
          if (stmt[sk].t === 'p' && stmt[sk].v === '(') sDepth++;
          else if (stmt[sk].t === 'p' && stmt[sk].v === ')' && sDepth > 0) sDepth--;
          else if (sDepth === 0 && stmt[sk].t === 'w' && stmt[sk].u === 'FROM') {
            sFromIdx = sk;
            break;
          }
        }

        if (sFromIdx !== -1) {
          var prevFrom = sFromIdx - 1;
          while (prevFrom >= sigIdx && (stmt[prevFrom].t === 'lc' || stmt[prevFrom].t === 'bc')) prevFrom--;
          if (prevFrom >= sigIdx && stmt[prevFrom].t === 'p' && stmt[prevFrom].v === ',') {
            var sLc = getLineCol(src, stmt[prevFrom].s);
            diagnostics.push({
              type: 'error',
              code: 'SELECT_TRAILING_COMMA',
              title: 'Coma sobrante antes de FROM',
              message: "Hay una coma sobrante al final de las columnas antes de 'FROM' en la línea " + sLc.line + ".",
              line: sLc.line,
              col: sLc.col,
              tokenPos: stmt[prevFrom].s,
              statementIndex: stmtIdx
            });
          }
        }
      }
    });

    return {
      valid: diagnostics.filter(function (d) { return d.type === 'error'; }).length === 0,
      errorsCount: diagnostics.filter(function (d) { return d.type === 'error'; }).length,
      warningsCount: diagnostics.filter(function (d) { return d.type === 'warning'; }).length,
      diagnostics: diagnostics,
      stats: stats
    };
  }

  // Corrección asistida para resolver errores automáticamente
  function autoFix(src, diagnostic, fillValue) {
    if (!diagnostic || !src) return src;
    fillValue = fillValue || 'NULL';

    if (diagnostic.code === 'INSERT_VALUES_MISMATCH' && diagnostic.details && diagnostic.details.tupleClosePos != null) {
      var pos = diagnostic.details.tupleClosePos;
      var diff = diagnostic.details.diff || 1;
      var fillStr = '';
      for (var k = 0; k < diff; k++) fillStr += ', ' + fillValue;
      return src.slice(0, pos) + fillStr + src.slice(pos);
    }

    if (diagnostic.code === 'MISSING_COMMA_COLUMNS' || diagnostic.code === 'MISSING_COMMA_VALUES' || diagnostic.code === 'MISSING_COMMA_UPDATE_SET') {
      if (diagnostic.details && diagnostic.details.insertPos != null) {
        var ins = diagnostic.details.insertPos;
        var beforeIns = src.slice(0, ins).replace(/\s+$/, '');
        return beforeIns + ', ' + src.slice(ins);
      }
    }

    if (diagnostic.code === 'SELECT_TRAILING_COMMA' || diagnostic.code === 'UPDATE_SET_TRAILING_COMMA' || diagnostic.code === 'VALUES_TRAILING_COMMA' || diagnostic.code === 'INSERT_TRAILING_COMMA_COLUMNS') {
      var commaPos = diagnostic.tokenPos;
      if (commaPos != null) {
        // Encontrar la coma anterior o en la posición
        var targetComma = src.lastIndexOf(',', commaPos);
        if (targetComma !== -1 && targetComma >= commaPos - 4) {
          return src.slice(0, targetComma) + src.slice(targetComma + 1);
        }
      }
    }

    if (diagnostic.code === 'UPDATE_NO_WHERE' || diagnostic.code === 'DELETE_NO_WHERE') {
      return src.trim() + '\nWHERE id = /* especificar id */ 1;';
    }

    return src;
  }

  return {
    validate: validate,
    autoFix: autoFix
  };
});
