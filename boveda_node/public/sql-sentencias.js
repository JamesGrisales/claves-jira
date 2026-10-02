/* ==========================================================================
   Catálogo SQL (PostgreSQL) para la pestaña SQL
   - Palabras clave, tipos de datos y funciones (para colorear y autocompletar).
   - Catálogo de sentencias y fragmentos listos para insertar con un clic.
     Los {{campos}} son huecos que se saltan con Tab.
   Funciona en el navegador (window.SqlSentencias) y en Node (require).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SqlSentencias = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function set(txt) { var o = {}; txt.split(/\s+/).forEach(function (w) { if (w) o[w] = 1; }); return o; }

  /* ------------------------------ palabras ------------------------------ */
  var KEYWORDS = set(
    'ABORT ADD AFTER ALL ALTER ANALYZE AND ANY ARRAY AS ASC AT AUTHORIZATION BEFORE BEGIN BETWEEN BOTH BY CALL CASCADE CASE CAST CHECK ' +
    'CLOSE COLLATE COLUMN COMMENT COMMIT CONCURRENTLY CONFLICT CONSTRAINT COPY CREATE CROSS CURRENT CURRENT_DATE CURRENT_TIME ' +
    'CURRENT_TIMESTAMP CURRENT_USER CURSOR DATABASE DECLARE DEFAULT DEFERRABLE DELETE DESC DISTINCT DO DOMAIN DROP EACH ELSE ELSIF END ' +
    'EXCEPT EXCEPTION EXECUTE EXISTS EXPLAIN EXTENSION FALSE FETCH FILTER FIRST FOLLOWING FOR FOREIGN FROM FULL FUNCTION GENERATED ' +
    'GRANT GROUP HAVING IDENTITY IF ILIKE IN INDEX INHERITS INNER INSERT INSTEAD INTERSECT INTO IS ISNULL JOIN KEY LANGUAGE LAST LATERAL ' +
    'LEADING LEFT LIKE LIMIT LOCAL LOCK LOOP MATERIALIZED MERGE NATURAL NEXT NOT NOTHING NOTIFY NOTNULL NULL NULLS OF OFFSET ON ONLY OR ' +
    'ORDER OUTER OVER OVERLAPS OWNER PARTITION PRECEDING PRIMARY PROCEDURE RAISE RANGE RECURSIVE REFERENCES REFRESH REINDEX RENAME REPLACE ' +
    'RESET RESTART RESTRICT RETURN RETURNING RETURNS REVOKE RIGHT ROLE ROLLBACK ROW ROWS SAVEPOINT SCHEMA SELECT SEQUENCE SESSION_USER ' +
    'SET SHARE SHOW SIMILAR SOME START TABLE TEMP TEMPORARY THEN TO TRAILING TRIGGER TRUE TRUNCATE UNBOUNDED UNION UNIQUE UNLOGGED ' +
    'UPDATE USER USING VACUUM VALUES VERBOSE VIEW WHEN WHERE WHILE WINDOW WITH WITHIN WITHOUT ZONE'
  );

  var TYPES = set(
    'BIGINT BIGSERIAL BIT BOOL BOOLEAN BOX BYTEA CHAR CHARACTER CIDR CIRCLE DATE DECIMAL DOUBLE FLOAT FLOAT4 FLOAT8 INET INT INT2 INT4 INT8 ' +
    'INTEGER INTERVAL JSON JSONB LINE MACADDR MONEY NUMERIC OID POINT POLYGON PRECISION REAL REGCLASS REGPROC SERIAL SERIAL4 SERIAL8 ' +
    'SMALLINT SMALLSERIAL TEXT TIME TIMESTAMP TIMESTAMPTZ TIMETZ TSQUERY TSVECTOR UUID VARBIT VARCHAR VARYING XML INT4RANGE INT8RANGE ' +
    'NUMRANGE DATERANGE TSRANGE TSTZRANGE'
  );

  var FUNCS = ('COUNT SUM AVG MIN MAX COALESCE NULLIF GREATEST LEAST CONCAT CONCAT_WS UPPER LOWER INITCAP TRIM LTRIM RTRIM BTRIM LENGTH CHAR_LENGTH ' +
    'SUBSTRING SUBSTR LEFT RIGHT REPLACE SPLIT_PART POSITION STRPOS LPAD RPAD REGEXP_REPLACE REGEXP_MATCH REGEXP_MATCHES REGEXP_SPLIT_TO_TABLE FORMAT REPEAT REVERSE ' +
    'MD5 TRANSLATE ASCII CHR ROUND CEIL CEILING FLOOR ABS MOD POWER SQRT RANDOM TRUNC SIGN EXP LN LOG NOW DATE_TRUNC EXTRACT DATE_PART AGE ' +
    'TO_CHAR TO_DATE TO_TIMESTAMP TO_NUMBER MAKE_DATE MAKE_TIMESTAMP MAKE_INTERVAL CLOCK_TIMESTAMP STATEMENT_TIMESTAMP TIMEOFDAY STRING_AGG ARRAY_AGG BOOL_AND BOOL_OR EVERY ' +
    'JSON_AGG JSONB_AGG JSON_BUILD_OBJECT JSONB_BUILD_OBJECT JSON_BUILD_ARRAY JSONB_BUILD_ARRAY JSONB_SET JSONB_EACH JSONB_EACH_TEXT JSONB_OBJECT_KEYS ' +
    'JSONB_ARRAY_ELEMENTS JSONB_ARRAY_ELEMENTS_TEXT JSONB_ARRAY_LENGTH JSONB_PRETTY JSON_EXTRACT_PATH_TEXT TO_JSON TO_JSONB ROW_TO_JSON ARRAY_LENGTH ARRAY_APPEND ' +
    'ARRAY_REMOVE ARRAY_CAT ARRAY_POSITION UNNEST ARRAY_TO_STRING STRING_TO_ARRAY GENERATE_SERIES ROW_NUMBER RANK DENSE_RANK PERCENT_RANK CUME_DIST NTILE LAG LEAD ' +
    'FIRST_VALUE LAST_VALUE NTH_VALUE VERSION CURRENT_DATABASE CURRENT_SCHEMA CURRENT_SCHEMAS GEN_RANDOM_UUID PG_SLEEP PG_SIZE_PRETTY PG_TOTAL_RELATION_SIZE ' +
    'PG_RELATION_SIZE PG_DATABASE_SIZE PG_TERMINATE_BACKEND PG_CANCEL_BACKEND PG_BLOCKING_PIDS PG_GET_VIEWDEF PG_GET_FUNCTIONDEF PG_GET_SERIAL_SEQUENCE ' +
    'SETVAL NEXTVAL CURRVAL LASTVAL TO_TSVECTOR TO_TSQUERY PLAINTO_TSQUERY WEBSEARCH_TO_TSQUERY TS_RANK').split(' ');
  var FUNC_SET = set(FUNCS.join(' '));

  // Palabras que, aunque lleven "(" detrás, NO son funciones
  var NO_FUNC = set('IN VALUES AS ON AND OR NOT EXISTS ANY ALL SOME FROM WHERE JOIN USING SET SELECT BETWEEN LIKE ILIKE IS THEN ELSE WHEN CASE OVER FILTER ' +
    'WITHIN LATERAL RETURNING INTO TABLE UNION INTERSECT EXCEPT HAVING BY LIMIT OFFSET WITH RECURSIVE PARTITION ORDER GROUP INSERT UPDATE DELETE ARRAY ROW ' +
    'REFERENCES CHECK UNIQUE PRIMARY KEY CONSTRAINT INDEX VIEW DO IF OF TO FOR ADD DROP ALTER CREATE EXECUTE CONFLICT DISTINCT');

  /* ------------------------------ categorías ------------------------------ */
  var CATS = [
    { id: 'todas', nombre: 'Todas', ico: '✨' },
    { id: 'consultar', nombre: 'Consultar', ico: '🔎' },
    { id: 'unir', nombre: 'Unir tablas', ico: '🔗' },
    { id: 'filtrar', nombre: 'Condiciones', ico: '🎯' },
    { id: 'datos', nombre: 'Insertar / Modificar', ico: '✏️' },
    { id: 'estructura', nombre: 'Estructura (DDL)', ico: '🏗️' },
    { id: 'permisos', nombre: 'Permisos', ico: '🔑' },
    { id: 'transacciones', nombre: 'Transacciones', ico: '🔁' },
    { id: 'avanzado', nombre: 'Avanzado', ico: '🚀' },
    { id: 'admin', nombre: 'Utilidades', ico: '🧰' },
    { id: 'funciones', nombre: 'Funciones', ico: 'ƒ' },
    { id: 'tipos', nombre: 'Tipos de datos', ico: '🔤' }
  ];

  /* ------------------------------ catálogo ------------------------------ */
  var CATALOGO = [];
  // S(categoría, nombre, descripción, código, {frag, t(atajo), k(palabras de búsqueda)})
  function S(cat, nombre, desc, code, o) {
    o = o || {};
    CATALOGO.push({
      cat: cat, nombre: nombre, desc: desc,
      code: Array.isArray(code) ? code.join('\n') : code,
      frag: !!o.frag, t: o.t || '', k: o.k || ''
    });
  }

  /* ---- Consultar ---- */
  S('consultar', 'SELECT', 'Consultar columnas de una tabla', ['SELECT {{columnas}}', 'FROM {{tabla}};'], { t: 'sel', k: 'seleccionar consultar leer ver mostrar' });
  S('consultar', 'SELECT * (100 filas)', 'Ver las primeras filas de una tabla', ['SELECT *', 'FROM {{tabla}}', 'LIMIT 100;'], { t: 'sela', k: 'todo todas las columnas primeras filas' });
  S('consultar', 'SELECT … WHERE', 'Consultar con una condición', ['SELECT {{columnas}}', 'FROM {{tabla}}', 'WHERE {{columna}} = {{valor}};'], { t: 'selw', k: 'filtrar buscar condicion' });
  S('consultar', 'SELECT DISTINCT', 'Valores sin repetir', ['SELECT DISTINCT {{columna}}', 'FROM {{tabla}}', 'ORDER BY {{columna}};'], { k: 'unicos repetidos sin duplicados' });
  S('consultar', 'DISTINCT ON', 'Una fila por grupo (la más reciente)', ['SELECT DISTINCT ON ({{grupo}}) *', 'FROM {{tabla}}', 'ORDER BY {{grupo}}, {{fecha}} DESC;'], { k: 'ultimo ultima mas reciente por grupo' });
  S('consultar', 'COUNT filas', 'Contar las filas de una tabla', ['SELECT COUNT(*) AS total', 'FROM {{tabla}};'], { t: 'cnt', k: 'contar cuantos total' });
  S('consultar', 'Alias (AS)', 'Renombrar columnas y tablas', ['SELECT t.{{columna}} AS {{alias}}', 'FROM {{tabla}} AS t;'], { k: 'apodo renombrar' });
  S('consultar', 'ORDER BY', 'Ordenar el resultado', 'ORDER BY {{columna}} {{DESC}}', { frag: true, k: 'ordenar asc desc' });
  S('consultar', 'LIMIT / OFFSET', 'Limitar filas y paginar', 'LIMIT {{10}} OFFSET {{0}}', { frag: true, k: 'paginar primeras top' });
  S('consultar', 'FETCH FIRST', 'Limitar filas (estándar SQL)', 'FETCH FIRST {{10}} ROWS ONLY', { frag: true, k: 'top limitar' });
  S('consultar', 'GROUP BY + HAVING', 'Agrupar y filtrar grupos', ['SELECT {{columna}}, COUNT(*) AS total', 'FROM {{tabla}}', 'GROUP BY {{columna}}', 'HAVING COUNT(*) > {{1}}', 'ORDER BY total DESC;'], { t: 'grp', k: 'agrupar contar por' });
  S('consultar', 'Subconsulta con IN', 'Filtrar con el resultado de otra consulta', ['SELECT *', 'FROM {{tabla}}', 'WHERE {{columna}} IN (', '    SELECT {{columna}}', '    FROM {{otra_tabla}}', '    WHERE {{condicion}}', ');'], { k: 'subquery anidada' });
  S('consultar', 'Subconsulta en FROM', 'Usar una consulta como tabla', ['SELECT t.*', 'FROM (', '    SELECT {{columnas}}', '    FROM {{tabla}}', ') AS t;'], { k: 'subquery derivada' });
  S('consultar', 'EXISTS', 'Filas que tienen relación en otra tabla', ['SELECT *', 'FROM {{tabla}} t', 'WHERE EXISTS (', '    SELECT 1', '    FROM {{otra_tabla}} o', '    WHERE o.{{fk}} = t.{{id}}', ');'], { k: 'existe relacion' });
  S('consultar', 'NOT EXISTS', 'Filas sin relación en otra tabla', ['SELECT *', 'FROM {{tabla}} t', 'WHERE NOT EXISTS (', '    SELECT 1', '    FROM {{otra_tabla}} o', '    WHERE o.{{fk}} = t.{{id}}', ');'], { k: 'no existe sin relacion huerfanos' });
  S('consultar', 'UNION', 'Unir resultados sin repetidos', ['SELECT {{columnas}} FROM {{tabla1}}', 'UNION', 'SELECT {{columnas}} FROM {{tabla2}};'], { k: 'combinar juntar' });
  S('consultar', 'UNION ALL', 'Unir resultados conservando repetidos', ['SELECT {{columnas}} FROM {{tabla1}}', 'UNION ALL', 'SELECT {{columnas}} FROM {{tabla2}};'], { k: 'combinar juntar' });
  S('consultar', 'INTERSECT', 'Solo lo que está en las dos consultas', ['SELECT {{columnas}} FROM {{tabla1}}', 'INTERSECT', 'SELECT {{columnas}} FROM {{tabla2}};'], { k: 'interseccion comunes' });
  S('consultar', 'EXCEPT', 'Lo que está en la primera y no en la segunda', ['SELECT {{columnas}} FROM {{tabla1}}', 'EXCEPT', 'SELECT {{columnas}} FROM {{tabla2}};'], { k: 'diferencia menos' });
  S('consultar', 'WITH (CTE)', 'Consulta con nombre para reutilizar', ['WITH {{nombre}} AS (', '    SELECT {{columnas}}', '    FROM {{tabla}}', '    WHERE {{condicion}}', ')', 'SELECT *', 'FROM {{nombre}};'], { t: 'cte', k: 'common table expression temporal' });
  S('consultar', 'WITH RECURSIVE', 'Consulta recursiva (jerarquías, árboles)', ['WITH RECURSIVE {{arbol}} AS (', '    SELECT id, padre_id, nombre, 1 AS nivel', '    FROM {{tabla}}', '    WHERE padre_id IS NULL', '    UNION ALL', '    SELECT h.id, h.padre_id, h.nombre, a.nivel + 1', '    FROM {{tabla}} h', '    JOIN {{arbol}} a ON h.padre_id = a.id', ')', 'SELECT * FROM {{arbol}};'], { k: 'jerarquia arbol padre hijo' });
  S('consultar', 'VALUES', 'Lista de filas escritas a mano', ["VALUES ({{1}}, '{{a}}'), ({{2}}, '{{b}}');"], { k: 'filas constantes' });
  S('consultar', 'SELECT … FOR UPDATE', 'Bloquear filas mientras se editan', ['SELECT *', 'FROM {{tabla}}', 'WHERE {{condicion}}', 'FOR UPDATE;'], { k: 'bloquear lock' });
  S('consultar', 'SELECT INTO', 'Guardar el resultado en una tabla nueva', ['SELECT {{columnas}}', 'INTO {{tabla_nueva}}', 'FROM {{tabla}}', 'WHERE {{condicion}};'], { k: 'copiar tabla nueva' });

  /* ---- Unir tablas ---- */
  S('unir', 'INNER JOIN', 'Solo filas que coinciden en las dos tablas', ['INNER JOIN {{tabla}} {{t2}}', '    ON {{t2}}.{{id}} = {{t1}}.{{fk}}'], { frag: true, t: 'ijoin', k: 'unir relacionar' });
  S('unir', 'LEFT JOIN', 'Todas las de la izquierda, y las que coincidan', ['LEFT JOIN {{tabla}} {{t2}}', '    ON {{t2}}.{{id}} = {{t1}}.{{fk}}'], { frag: true, t: 'ljoin', k: 'unir relacionar izquierda' });
  S('unir', 'RIGHT JOIN', 'Todas las de la derecha, y las que coincidan', ['RIGHT JOIN {{tabla}} {{t2}}', '    ON {{t2}}.{{id}} = {{t1}}.{{fk}}'], { frag: true, k: 'unir relacionar derecha' });
  S('unir', 'FULL OUTER JOIN', 'Todas las filas de ambas tablas', ['FULL OUTER JOIN {{tabla}} {{t2}}', '    ON {{t2}}.{{id}} = {{t1}}.{{fk}}'], { frag: true, k: 'unir completo' });
  S('unir', 'CROSS JOIN', 'Todas las combinaciones posibles', 'CROSS JOIN {{tabla}}', { frag: true, k: 'producto cartesiano' });
  S('unir', 'JOIN … USING', 'Unir por una columna con el mismo nombre', 'JOIN {{tabla}} USING ({{columna}})', { frag: true });
  S('unir', 'NATURAL JOIN', 'Unir por todas las columnas de igual nombre', 'NATURAL JOIN {{tabla}}', { frag: true });
  S('unir', 'LEFT JOIN LATERAL', 'Subconsulta que usa columnas de la fila anterior', ['LEFT JOIN LATERAL (', '    SELECT {{columnas}}', '    FROM {{tabla}} x', '    WHERE x.{{fk}} = {{t1}}.{{id}}', '    ORDER BY {{fecha}} DESC', '    LIMIT 1', ') u ON TRUE'], { frag: true, k: 'ultimo por fila' });
  S('unir', 'SELECT con JOIN', 'Consulta completa con dos tablas', ['SELECT a.{{columna}}, b.{{columna}}', 'FROM {{tabla_a}} a', 'INNER JOIN {{tabla_b}} b', '    ON b.{{fk}} = a.{{id}}', 'WHERE {{condicion}};'], { t: 'selj', k: 'unir dos tablas relacionar' });
  S('unir', 'Varios JOIN', 'Consulta con tres tablas', ['SELECT a.{{columna}}, b.{{columna}}, c.{{columna}}', 'FROM {{tabla_a}} a', 'JOIN {{tabla_b}} b ON b.{{fk}} = a.{{id}}', 'JOIN {{tabla_c}} c ON c.{{fk}} = b.{{id}}', 'WHERE {{condicion}};'], { k: 'tres tablas' });
  S('unir', 'Registros sin relación', 'Filas de A que no tienen nada en B (anti-join)', ['SELECT a.*', 'FROM {{tabla_a}} a', 'LEFT JOIN {{tabla_b}} b', '    ON b.{{fk}} = a.{{id}}', 'WHERE b.{{id}} IS NULL;'], { k: 'huerfanos sin coincidencia faltantes' });
  S('unir', 'Auto-JOIN', 'Unir una tabla consigo misma', ['SELECT h.{{nombre}} AS hijo, p.{{nombre}} AS padre', 'FROM {{tabla}} h', 'LEFT JOIN {{tabla}} p', '    ON p.id = h.{{padre_id}};'], { k: 'misma tabla jerarquia' });

  /* ---- Condiciones y filtros (fragmentos) ---- */
  S('filtrar', 'WHERE', 'Empezar a filtrar', 'WHERE {{columna}} = {{valor}}', { frag: true, t: 'whr', k: 'donde filtrar condicion' });
  S('filtrar', 'AND', 'Y (se cumplen las dos condiciones)', 'AND {{columna}} = {{valor}}', { frag: true, k: 'y ademas' });
  S('filtrar', 'OR', 'O (se cumple una de las dos)', 'OR {{columna}} = {{valor}}', { frag: true, k: 'o' });
  S('filtrar', 'IN (lista)', 'Está dentro de una lista de valores', "{{columna}} IN ({{1}}, {{2}}, {{3}})", { frag: true, k: 'lista varios valores' });
  S('filtrar', 'NOT IN', 'No está en la lista', "{{columna}} NOT IN ({{1}}, {{2}})", { frag: true, k: 'excluir no esta' });
  S('filtrar', 'BETWEEN', 'Dentro de un rango (incluye extremos)', '{{columna}} BETWEEN {{inicio}} AND {{fin}}', { frag: true, k: 'rango entre' });
  S('filtrar', 'LIKE', 'Texto que contiene o empieza por…', "{{columna}} LIKE '%{{texto}}%'", { frag: true, k: 'contiene empieza termina patron' });
  S('filtrar', 'ILIKE', 'Como LIKE pero sin importar mayúsculas', "{{columna}} ILIKE '%{{texto}}%'", { frag: true, k: 'contiene sin mayusculas' });
  S('filtrar', 'NOT LIKE', 'Texto que NO contiene…', "{{columna}} NOT LIKE '%{{texto}}%'", { frag: true });
  S('filtrar', 'IS NULL', 'Vacío (sin valor)', '{{columna}} IS NULL', { frag: true, k: 'nulo vacio sin valor' });
  S('filtrar', 'IS NOT NULL', 'Tiene algún valor', '{{columna}} IS NOT NULL', { frag: true, k: 'nulo con valor' });
  S('filtrar', 'IS DISTINCT FROM', 'Distinto, tratando NULL como un valor', '{{columna}} IS DISTINCT FROM {{valor}}', { frag: true });
  S('filtrar', '= ANY (arreglo)', 'Igual a alguno de un arreglo', "{{columna}} = ANY (ARRAY[{{1}}, {{2}}, {{3}}])", { frag: true });
  S('filtrar', 'Expresión regular (~)', 'Texto que cumple un patrón regex', "{{columna}} ~ '{{^abc}}'", { frag: true, k: 'regex patron' });
  S('filtrar', 'Fecha de hoy', 'Filas de hoy', '{{fecha}}::date = CURRENT_DATE', { frag: true, k: 'hoy actual' });
  S('filtrar', 'Rango de fechas', 'Entre dos fechas (el fin no incluido)', "{{fecha}} >= '{{2026-01-01}}' AND {{fecha}} < '{{2026-02-01}}'", { frag: true, k: 'mes entre fechas' });
  S('filtrar', 'Últimos 7 días', 'Filas de la última semana', "{{fecha}} >= NOW() - INTERVAL '7 days'", { frag: true, k: 'ultima semana reciente' });
  S('filtrar', 'CASE WHEN', 'Condicional dentro de la consulta', ['CASE', '    WHEN {{condicion}} THEN {{valor1}}', '    WHEN {{condicion2}} THEN {{valor2}}', '    ELSE {{otro}}', 'END AS {{alias}}'], { frag: true, t: 'case', k: 'si entonces condicional' });

  /* ---- Insertar / Modificar / Borrar ---- */
  S('datos', 'INSERT INTO … VALUES', 'Agregar una fila', ['INSERT INTO {{tabla}} ({{col1}}, {{col2}})', "VALUES ({{valor1}}, '{{valor2}}');"], { t: 'ins', k: 'agregar crear nuevo registro guardar' });
  S('datos', 'INSERT varias filas', 'Agregar varias filas de una vez', ['INSERT INTO {{tabla}} ({{col1}}, {{col2}})', 'VALUES', "    ({{1}}, '{{a}}'),", "    ({{2}}, '{{b}}'),", "    ({{3}}, '{{c}}');"], { k: 'agregar muchos masivo' });
  S('datos', 'INSERT … SELECT', 'Agregar filas desde otra consulta', ['INSERT INTO {{destino}} ({{col1}}, {{col2}})', 'SELECT {{col1}}, {{col2}}', 'FROM {{origen}}', 'WHERE {{condicion}};'], { k: 'copiar desde otra tabla' });
  S('datos', 'INSERT … RETURNING', 'Agregar y obtener el id creado', ['INSERT INTO {{tabla}} ({{col1}})', "VALUES ('{{valor}}')", 'RETURNING id;'], { k: 'devolver id creado' });
  S('datos', 'INSERT … ON CONFLICT DO NOTHING', 'Agregar ignorando los repetidos', ['INSERT INTO {{tabla}} ({{col_unica}}, {{col2}})', "VALUES ('{{valor}}', '{{valor2}}')", 'ON CONFLICT ({{col_unica}}) DO NOTHING;'], { k: 'ignorar duplicado repetido' });
  S('datos', 'UPSERT (ON CONFLICT DO UPDATE)', 'Agregar o actualizar si ya existe', ['INSERT INTO {{tabla}} ({{col_unica}}, {{col2}})', "VALUES ('{{valor}}', '{{valor2}}')", 'ON CONFLICT ({{col_unica}})', 'DO UPDATE SET {{col2}} = EXCLUDED.{{col2}};'], { t: 'ups', k: 'insertar o actualizar merge existe' });
  S('datos', 'UPDATE', 'Modificar filas', ['UPDATE {{tabla}}', "SET {{columna}} = '{{valor}}'", 'WHERE {{condicion}};'], { t: 'upd', k: 'actualizar cambiar editar modificar' });
  S('datos', 'UPDATE con FROM', 'Modificar usando datos de otra tabla', ['UPDATE {{tabla}} t', 'SET {{columna}} = o.{{columna}}', 'FROM {{otra_tabla}} o', 'WHERE o.{{id}} = t.{{id}};'], { k: 'actualizar desde otra tabla' });
  S('datos', 'UPDATE … RETURNING', 'Modificar y ver lo que quedó', ['UPDATE {{tabla}}', "SET {{columna}} = '{{valor}}'", 'WHERE {{condicion}}', 'RETURNING *;'], { k: 'devolver' });
  S('datos', 'DELETE', 'Borrar filas', ['DELETE FROM {{tabla}}', 'WHERE {{condicion}};'], { t: 'del', k: 'eliminar borrar quitar' });
  S('datos', 'DELETE con USING', 'Borrar usando otra tabla', ['DELETE FROM {{tabla}} t', 'USING {{otra_tabla}} o', 'WHERE o.{{id}} = t.{{fk}}', '  AND {{condicion}};'], { k: 'eliminar relacionado' });
  S('datos', 'DELETE … RETURNING', 'Borrar y ver lo borrado', ['DELETE FROM {{tabla}}', 'WHERE {{condicion}}', 'RETURNING *;'], { k: 'devolver eliminar' });
  S('datos', 'TRUNCATE', 'Vaciar una tabla rápido', ['TRUNCATE TABLE {{tabla}};'], { k: 'vaciar limpiar borrar todo' });
  S('datos', 'TRUNCATE … RESTART IDENTITY CASCADE', 'Vaciar, reiniciar contadores y tablas relacionadas', ['TRUNCATE TABLE {{tabla}} RESTART IDENTITY CASCADE;'], { k: 'vaciar reiniciar' });
  S('datos', 'MERGE (PostgreSQL 15+)', 'Insertar, actualizar o borrar según coincidencia', ['MERGE INTO {{destino}} d', 'USING {{origen}} o', '    ON d.{{id}} = o.{{id}}', 'WHEN MATCHED THEN', '    UPDATE SET {{columna}} = o.{{columna}}', 'WHEN NOT MATCHED THEN', '    INSERT ({{id}}, {{columna}})', '    VALUES (o.{{id}}, o.{{columna}});'], { k: 'sincronizar upsert' });
  S('datos', 'COPY … FROM (importar CSV)', 'Cargar un archivo CSV en una tabla', ["COPY {{tabla}} ({{col1}}, {{col2}})", "FROM '{{/ruta/archivo.csv}}'", "WITH (FORMAT csv, HEADER true, DELIMITER ',');"], { k: 'importar cargar archivo csv' });
  S('datos', 'COPY … TO (exportar CSV)', 'Guardar una tabla en un archivo CSV', ["COPY (SELECT * FROM {{tabla}})", "TO '{{/ruta/archivo.csv}}'", "WITH (FORMAT csv, HEADER true);"], { k: 'exportar guardar archivo csv' });

  /* ---- Estructura (DDL) ---- */
  S('estructura', 'CREATE TABLE', 'Crear una tabla', ['CREATE TABLE {{tabla}} (', '    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,', '    {{nombre}}      VARCHAR({{100}}) NOT NULL,', '    activo      BOOLEAN NOT NULL DEFAULT TRUE,', '    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()', ');'], { t: 'crt', k: 'crear tabla nueva' });
  S('estructura', 'CREATE TABLE IF NOT EXISTS', 'Crear la tabla solo si no existe', ['CREATE TABLE IF NOT EXISTS {{tabla}} (', '    id      SERIAL PRIMARY KEY,', '    {{columna}} TEXT', ');'], { k: 'crear si no existe' });
  S('estructura', 'CREATE TABLE con clave foránea', 'Tabla relacionada con otra', ['CREATE TABLE {{hija}} (', '    id          SERIAL PRIMARY KEY,', '    {{padre}}_id  INTEGER NOT NULL REFERENCES {{padre}} (id) ON DELETE CASCADE,', '    {{columna}}     TEXT', ');'], { k: 'foreign key relacion referencia' });
  S('estructura', 'CREATE TEMP TABLE', 'Tabla temporal (se borra al cerrar la sesión)', ['CREATE TEMP TABLE {{temporal}} AS', 'SELECT {{columnas}}', 'FROM {{tabla}};'], { k: 'temporal' });
  S('estructura', 'CREATE TABLE AS', 'Crear una tabla con el resultado de una consulta', ['CREATE TABLE {{nueva}} AS', 'SELECT {{columnas}}', 'FROM {{tabla}}', 'WHERE {{condicion}};'], { k: 'copiar tabla respaldo backup' });
  S('estructura', 'CREATE TABLE (LIKE …)', 'Copiar la estructura de otra tabla', ['CREATE TABLE {{nueva}} (LIKE {{tabla}} INCLUDING ALL);'], { k: 'clonar estructura' });
  S('estructura', 'ALTER TABLE … ADD COLUMN', 'Agregar una columna', ['ALTER TABLE {{tabla}}', 'ADD COLUMN {{columna}} {{VARCHAR(100)}} {{NOT NULL DEFAULT \'\'}};'], { t: 'addc', k: 'agregar columna nueva' });
  S('estructura', 'ALTER TABLE … DROP COLUMN', 'Quitar una columna', ['ALTER TABLE {{tabla}}', 'DROP COLUMN {{columna}};'], { k: 'eliminar columna borrar' });
  S('estructura', 'ALTER COLUMN TYPE', 'Cambiar el tipo de una columna', ['ALTER TABLE {{tabla}}', 'ALTER COLUMN {{columna}} TYPE {{BIGINT}} USING {{columna}}::{{BIGINT}};'], { k: 'cambiar tipo convertir' });
  S('estructura', 'SET NOT NULL / DROP NOT NULL', 'Hacer obligatoria u opcional una columna', ['ALTER TABLE {{tabla}}', 'ALTER COLUMN {{columna}} SET NOT NULL;'], { k: 'obligatorio opcional nulo' });
  S('estructura', 'SET DEFAULT', 'Valor por defecto de una columna', ['ALTER TABLE {{tabla}}', 'ALTER COLUMN {{columna}} SET DEFAULT {{valor}};'], { k: 'predeterminado' });
  S('estructura', 'RENAME COLUMN', 'Renombrar una columna', ['ALTER TABLE {{tabla}}', 'RENAME COLUMN {{actual}} TO {{nueva}};'], { k: 'cambiar nombre columna' });
  S('estructura', 'RENAME TABLE', 'Renombrar una tabla', ['ALTER TABLE {{tabla}}', 'RENAME TO {{nuevo_nombre}};'], { k: 'cambiar nombre tabla' });
  S('estructura', 'ADD PRIMARY KEY', 'Agregar clave primaria', ['ALTER TABLE {{tabla}}', 'ADD CONSTRAINT pk_{{tabla}} PRIMARY KEY ({{columna}});'], { k: 'llave primaria' });
  S('estructura', 'ADD FOREIGN KEY', 'Agregar clave foránea', ['ALTER TABLE {{tabla}}', 'ADD CONSTRAINT fk_{{tabla}}_{{padre}}', '    FOREIGN KEY ({{columna}}) REFERENCES {{padre}} (id)', '    ON DELETE {{CASCADE}};'], { k: 'llave foranea relacion' });
  S('estructura', 'ADD UNIQUE', 'Que una columna no se repita', ['ALTER TABLE {{tabla}}', 'ADD CONSTRAINT uq_{{tabla}}_{{columna}} UNIQUE ({{columna}});'], { k: 'unico no repetir' });
  S('estructura', 'ADD CHECK', 'Regla que deben cumplir los datos', ['ALTER TABLE {{tabla}}', 'ADD CONSTRAINT ck_{{tabla}}_{{columna}} CHECK ({{columna}} > 0);'], { k: 'validar regla restriccion' });
  S('estructura', 'DROP CONSTRAINT', 'Quitar una restricción', ['ALTER TABLE {{tabla}}', 'DROP CONSTRAINT {{nombre_restriccion}};'], { k: 'quitar llave regla' });
  S('estructura', 'DROP TABLE', 'Borrar una tabla', ['DROP TABLE IF EXISTS {{tabla}};'], { k: 'eliminar tabla' });
  S('estructura', 'DROP TABLE … CASCADE', 'Borrar la tabla y lo que depende de ella', ['DROP TABLE IF EXISTS {{tabla}} CASCADE;'], { k: 'eliminar tabla dependencias' });
  S('estructura', 'CREATE INDEX', 'Acelerar búsquedas en una columna', ['CREATE INDEX idx_{{tabla}}_{{columna}}', 'ON {{tabla}} ({{columna}});'], { k: 'indice rapido acelerar' });
  S('estructura', 'CREATE UNIQUE INDEX', 'Índice que además evita repetidos', ['CREATE UNIQUE INDEX uq_{{tabla}}_{{columna}}', 'ON {{tabla}} ({{columna}});'], { k: 'indice unico' });
  S('estructura', 'CREATE INDEX parcial', 'Índice solo de algunas filas', ['CREATE INDEX idx_{{tabla}}_{{columna}}', 'ON {{tabla}} ({{columna}})', 'WHERE {{condicion}};'], { k: 'indice condicion' });
  S('estructura', 'CREATE INDEX GIN (jsonb)', 'Índice para buscar dentro de JSON', ['CREATE INDEX idx_{{tabla}}_{{columna}}_gin', 'ON {{tabla}} USING GIN ({{columna}});'], { k: 'indice json' });
  S('estructura', 'DROP INDEX', 'Borrar un índice', ['DROP INDEX IF EXISTS {{indice}};'], { k: 'eliminar indice' });
  S('estructura', 'REINDEX', 'Reconstruir índices', ['REINDEX TABLE {{tabla}};'], { k: 'reconstruir indice' });
  S('estructura', 'CREATE VIEW', 'Guardar una consulta como vista', ['CREATE OR REPLACE VIEW {{vista}} AS', 'SELECT {{columnas}}', 'FROM {{tabla}}', 'WHERE {{condicion}};'], { k: 'vista guardar consulta' });
  S('estructura', 'DROP VIEW', 'Borrar una vista', ['DROP VIEW IF EXISTS {{vista}};'], { k: 'eliminar vista' });
  S('estructura', 'CREATE MATERIALIZED VIEW', 'Vista que guarda el resultado', ['CREATE MATERIALIZED VIEW {{vista}} AS', 'SELECT {{columnas}}', 'FROM {{tabla}};'], { k: 'vista materializada' });
  S('estructura', 'REFRESH MATERIALIZED VIEW', 'Actualizar una vista materializada', ['REFRESH MATERIALIZED VIEW {{vista}};'], { k: 'refrescar actualizar' });
  S('estructura', 'CREATE SEQUENCE', 'Crear un contador', ['CREATE SEQUENCE {{secuencia}} START WITH {{1}} INCREMENT BY {{1}};'], { k: 'secuencia contador' });
  S('estructura', 'ALTER SEQUENCE RESTART', 'Reiniciar un contador', ['ALTER SEQUENCE {{secuencia}} RESTART WITH {{1}};'], { k: 'reiniciar secuencia' });
  S('estructura', 'CREATE SCHEMA', 'Crear un esquema', ['CREATE SCHEMA IF NOT EXISTS {{esquema}};'], { k: 'esquema carpeta' });
  S('estructura', 'DROP SCHEMA', 'Borrar un esquema', ['DROP SCHEMA IF EXISTS {{esquema}} CASCADE;'], { k: 'eliminar esquema' });
  S('estructura', 'CREATE TYPE (ENUM)', 'Tipo con valores permitidos', ["CREATE TYPE {{estado}} AS ENUM ('{{activo}}', '{{inactivo}}');"], { k: 'enumerado opciones' });
  S('estructura', 'ALTER TYPE ADD VALUE', 'Agregar un valor a un ENUM', ["ALTER TYPE {{estado}} ADD VALUE '{{nuevo}}';"], { k: 'enum agregar' });
  S('estructura', 'CREATE DOMAIN', 'Tipo propio con una regla', ['CREATE DOMAIN {{dominio}} AS {{TEXT}}', '    CHECK (VALUE <> \'\');'], { k: 'tipo propio' });
  S('estructura', 'CREATE EXTENSION', 'Activar una extensión', ['CREATE EXTENSION IF NOT EXISTS {{pgcrypto}};'], { k: 'extension pgcrypto uuid unaccent' });
  S('estructura', 'CREATE DATABASE', 'Crear una base de datos', ['CREATE DATABASE {{basedatos}}', "    ENCODING 'UTF8';"], { k: 'base de datos nueva' });
  S('estructura', 'DROP DATABASE', 'Borrar una base de datos', ['DROP DATABASE IF EXISTS {{basedatos}};'], { k: 'eliminar base de datos' });
  S('estructura', 'COMMENT ON', 'Documentar tablas y columnas', ["COMMENT ON TABLE {{tabla}} IS '{{descripcion}}';", "COMMENT ON COLUMN {{tabla}}.{{columna}} IS '{{descripcion}}';"], { k: 'comentario documentar descripcion' });
  S('estructura', 'Columna generada', 'Columna calculada automáticamente', ['ALTER TABLE {{tabla}}', 'ADD COLUMN {{total}} NUMERIC GENERATED ALWAYS AS ({{precio}} * {{cantidad}}) STORED;'], { k: 'calculada formula' });
  S('estructura', 'Tabla particionada', 'Dividir una tabla grande por rangos', ['CREATE TABLE {{tabla}} (', '    id BIGINT,', '    fecha DATE NOT NULL', ') PARTITION BY RANGE (fecha);', '', 'CREATE TABLE {{tabla}}_{{2026}} PARTITION OF {{tabla}}', "    FOR VALUES FROM ('{{2026-01-01}}') TO ('{{2027-01-01}}');"], { k: 'particion rango' });

  /* ---- Permisos (DCL) ---- */
  S('permisos', 'GRANT en tabla', 'Dar permisos sobre una tabla', ['GRANT SELECT, INSERT, UPDATE, DELETE', 'ON {{tabla}}', 'TO {{usuario}};'], { t: 'gra', k: 'dar permisos otorgar' });
  S('permisos', 'GRANT ALL en esquema', 'Todos los permisos sobre un esquema', ['GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA {{public}} TO {{usuario}};'], { k: 'dar todos los permisos' });
  S('permisos', 'GRANT USAGE', 'Permitir usar un esquema', ['GRANT USAGE ON SCHEMA {{esquema}} TO {{usuario}};'], { k: 'usar esquema' });
  S('permisos', 'REVOKE', 'Quitar permisos', ['REVOKE {{INSERT, UPDATE}} ON {{tabla}} FROM {{usuario}};'], { k: 'quitar permisos revocar' });
  S('permisos', 'CREATE ROLE / USER', 'Crear un usuario', ["CREATE ROLE {{usuario}} WITH LOGIN PASSWORD '{{clave}}';"], { k: 'crear usuario' });
  S('permisos', 'ALTER ROLE (clave)', 'Cambiar la contraseña de un usuario', ["ALTER ROLE {{usuario}} WITH PASSWORD '{{nueva_clave}}';"], { k: 'cambiar contrasena clave password' });
  S('permisos', 'DROP ROLE', 'Borrar un usuario', ['DROP ROLE IF EXISTS {{usuario}};'], { k: 'eliminar usuario' });
  S('permisos', 'GRANT rol a usuario', 'Dar un rol a un usuario', ['GRANT {{rol}} TO {{usuario}};'], { k: 'rol miembro' });
  S('permisos', 'ALTER DEFAULT PRIVILEGES', 'Permisos para tablas futuras', ['ALTER DEFAULT PRIVILEGES IN SCHEMA {{public}}', 'GRANT SELECT ON TABLES TO {{usuario}};'], { k: 'permisos futuros' });

  /* ---- Transacciones (TCL) ---- */
  S('transacciones', 'BEGIN', 'Iniciar una transacción', ['BEGIN;'], { t: 'beg', k: 'iniciar transaccion' });
  S('transacciones', 'COMMIT', 'Confirmar los cambios', ['COMMIT;'], { k: 'confirmar guardar cambios' });
  S('transacciones', 'ROLLBACK', 'Deshacer los cambios', ['ROLLBACK;'], { k: 'deshacer cancelar revertir' });
  S('transacciones', 'SAVEPOINT', 'Punto de retorno dentro de la transacción', ['SAVEPOINT {{punto}};'], { k: 'punto guardado' });
  S('transacciones', 'ROLLBACK TO SAVEPOINT', 'Volver a un punto de retorno', ['ROLLBACK TO SAVEPOINT {{punto}};'], { k: 'volver deshacer parcial' });
  S('transacciones', 'RELEASE SAVEPOINT', 'Descartar un punto de retorno', ['RELEASE SAVEPOINT {{punto}};'], { k: 'liberar' });
  S('transacciones', 'SET TRANSACTION', 'Nivel de aislamiento', ['SET TRANSACTION ISOLATION LEVEL {{SERIALIZABLE}};'], { k: 'aislamiento isolation' });
  S('transacciones', 'Transacción completa', 'BEGIN … COMMIT con tu sentencia en medio', ['BEGIN;', '', '{{sentencia}};', '', 'COMMIT;'], { t: 'trx', k: 'segura probar cambios begin commit' });
  S('transacciones', 'LOCK TABLE', 'Bloquear una tabla', ['LOCK TABLE {{tabla}} IN {{EXCLUSIVE}} MODE;'], { k: 'bloquear' });

  /* ---- Avanzado ---- */
  S('avanzado', 'ROW_NUMBER()', 'Numerar filas por grupo', ['ROW_NUMBER() OVER (PARTITION BY {{grupo}} ORDER BY {{orden}})'], { frag: true, k: 'numerar ventana window' });
  S('avanzado', 'RANK() / DENSE_RANK()', 'Posición con empates', ['RANK() OVER (ORDER BY {{columna}} DESC)'], { frag: true, k: 'ranking puesto ventana' });
  S('avanzado', 'LAG() / LEAD()', 'Valor de la fila anterior o siguiente', ['LAG({{columna}}) OVER (ORDER BY {{fecha}})'], { frag: true, k: 'anterior siguiente ventana' });
  S('avanzado', 'SUM() OVER (acumulado)', 'Total acumulado', ['SUM({{columna}}) OVER (ORDER BY {{fecha}})'], { frag: true, k: 'acumulado running total' });
  S('avanzado', 'NTILE()', 'Dividir en grupos iguales', ['NTILE({{4}}) OVER (ORDER BY {{columna}})'], { frag: true, k: 'cuartiles percentil' });
  S('avanzado', 'Top N por grupo', 'Las N primeras filas de cada grupo', ['WITH ranking AS (', '    SELECT *,', '           ROW_NUMBER() OVER (PARTITION BY {{grupo}} ORDER BY {{orden}} DESC) AS rn', '    FROM {{tabla}}', ')', 'SELECT *', 'FROM ranking', 'WHERE rn <= {{3}};'], { k: 'mejores primeros por grupo top' });
  S('avanzado', 'CREATE FUNCTION (plpgsql)', 'Crear una función', ['CREATE OR REPLACE FUNCTION {{nombre}}({{param}} {{INTEGER}})', 'RETURNS {{INTEGER}}', 'LANGUAGE plpgsql', 'AS $$', 'BEGIN', '    RETURN {{param}} * 2;', 'END;', '$$;'], { t: 'fn', k: 'funcion procedimiento crear' });
  S('avanzado', 'CREATE FUNCTION … RETURNS TABLE', 'Función que devuelve filas', ['CREATE OR REPLACE FUNCTION {{nombre}}({{param}} {{INTEGER}})', 'RETURNS TABLE ({{columna}} {{TEXT}})', 'LANGUAGE sql', 'AS $$', '    SELECT {{columna}}', '    FROM {{tabla}}', '    WHERE {{id}} = {{param}};', '$$;'], { k: 'funcion tabla' });
  S('avanzado', 'CREATE PROCEDURE', 'Crear un procedimiento', ['CREATE OR REPLACE PROCEDURE {{nombre}}({{param}} {{INTEGER}})', 'LANGUAGE plpgsql', 'AS $$', 'BEGIN', '    {{sentencia}};', 'END;', '$$;', '', 'CALL {{nombre}}({{1}});'], { k: 'procedimiento call' });
  S('avanzado', 'CREATE TRIGGER', 'Ejecutar algo automáticamente al cambiar datos', ['CREATE OR REPLACE FUNCTION {{funcion_trigger}}()', 'RETURNS trigger', 'LANGUAGE plpgsql', 'AS $$', 'BEGIN', '    NEW.actualizado_en := NOW();', '    RETURN NEW;', 'END;', '$$;', '', 'CREATE TRIGGER {{nombre_trigger}}', 'BEFORE UPDATE ON {{tabla}}', 'FOR EACH ROW', 'EXECUTE FUNCTION {{funcion_trigger}}();'], { k: 'disparador automatico auditoria' });
  S('avanzado', 'DO (bloque anónimo)', 'Ejecutar código plpgsql sin crear función', ['DO $$', 'DECLARE', '    {{variable}} {{INTEGER}};', 'BEGIN', '    {{sentencia}};', 'END;', '$$;'], { k: 'bloque anonimo script' });
  S('avanzado', 'IF / ELSIF / ELSE', 'Condicional en plpgsql', ['IF {{condicion}} THEN', '    {{sentencia}};', 'ELSIF {{otra_condicion}} THEN', '    {{sentencia2}};', 'ELSE', '    {{sentencia3}};', 'END IF;'], { k: 'si condicional plpgsql' });
  S('avanzado', 'FOR … LOOP', 'Recorrer filas en plpgsql', ['FOR {{fila}} IN SELECT * FROM {{tabla}} LOOP', '    RAISE NOTICE \'%\', {{fila}}.{{columna}};', 'END LOOP;'], { k: 'ciclo recorrer bucle' });
  S('avanzado', 'EXCEPTION (manejo de errores)', 'Capturar errores en plpgsql', ['BEGIN', '    {{sentencia}};', 'EXCEPTION', '    WHEN unique_violation THEN', "        RAISE NOTICE 'Ya existe';", '    WHEN OTHERS THEN', '        RAISE;', 'END;'], { k: 'error try catch' });
  S('avanzado', 'RAISE NOTICE', 'Mostrar un mensaje', ["RAISE NOTICE '{{mensaje}}: %', {{variable}};"], { k: 'mensaje imprimir print' });
  S('avanzado', 'PREPARE / EXECUTE', 'Consulta preparada con parámetros', ['PREPARE {{nombre}} (INTEGER) AS', '    SELECT * FROM {{tabla}} WHERE id = $1;', '', 'EXECUTE {{nombre}}({{1}});'], { k: 'parametros preparada' });
  S('avanzado', 'EXPLAIN ANALYZE', 'Ver cómo se ejecuta y cuánto tarda', ['EXPLAIN (ANALYZE, BUFFERS)', '{{consulta}};'], { t: 'exp', k: 'plan lenta optimizar rendimiento' });
  S('avanzado', 'generate_series', 'Generar una serie de números o fechas', ["SELECT generate_series('{{2026-01-01}}'::date, '{{2026-01-31}}'::date, INTERVAL '1 day') AS dia;"], { k: 'serie fechas numeros calendario' });
  S('avanzado', 'JSONB: leer un campo', 'Sacar un dato de una columna JSON', ["SELECT {{columna}}->>'{{campo}}' AS {{alias}}", 'FROM {{tabla}};'], { k: 'json campo extraer' });
  S('avanzado', 'JSONB: filtrar por contenido', 'Buscar filas cuyo JSON contiene algo', ["SELECT *", 'FROM {{tabla}}', "WHERE {{columna}} @> '{\"{{campo}}\": \"{{valor}}\"}';"], { k: 'json buscar contiene' });
  S('avanzado', 'JSONB: expandir un arreglo', 'Una fila por cada elemento del arreglo JSON', ['SELECT t.id, e.value', 'FROM {{tabla}} t', "CROSS JOIN LATERAL jsonb_array_elements(t.{{columna}}->'{{campo}}') AS e;"], { k: 'json arreglo filas' });
  S('avanzado', 'Búsqueda de texto completo', 'Buscar palabras en un texto largo', ["SELECT *", 'FROM {{tabla}}', "WHERE to_tsvector('spanish', {{columna}}) @@ plainto_tsquery('spanish', '{{texto}}');"], { k: 'fulltext buscar palabras' });
  S('avanzado', 'ARRAY y unnest', 'Trabajar con arreglos', ['SELECT unnest(ARRAY[{{1}}, {{2}}, {{3}}]) AS valor;'], { k: 'arreglo lista array' });

  /* ---- Utilidades y administración ---- */
  S('admin', 'Tablas de un esquema', 'Listar las tablas', ['SELECT table_schema, table_name', 'FROM information_schema.tables', "WHERE table_schema = '{{public}}'", 'ORDER BY table_name;'], { k: 'listar tablas existentes' });
  S('admin', 'Columnas de una tabla', 'Ver nombre, tipo y si admite nulos', ['SELECT column_name, data_type, is_nullable, column_default', 'FROM information_schema.columns', "WHERE table_schema = '{{public}}'", "  AND table_name = '{{tabla}}'", 'ORDER BY ordinal_position;'], { k: 'estructura describir campos' });
  S('admin', 'Buscar una columna por nombre', 'En qué tablas existe una columna', ['SELECT table_schema, table_name, column_name', 'FROM information_schema.columns', "WHERE column_name ILIKE '%{{texto}}%';"], { k: 'encontrar campo' });
  S('admin', 'Tamaño de las tablas', 'Cuánto espacio ocupa cada tabla', ['SELECT relname AS tabla,', '       pg_size_pretty(pg_total_relation_size(relid)) AS tamano', 'FROM pg_catalog.pg_statio_user_tables', 'ORDER BY pg_total_relation_size(relid) DESC;'], { k: 'peso espacio grande' });
  S('admin', 'Tamaño de la base de datos', 'Cuánto pesa la base', ['SELECT pg_size_pretty(pg_database_size(current_database())) AS tamano;'], { k: 'peso espacio' });
  S('admin', 'Filas aproximadas por tabla', 'Conteo rápido de filas', ['SELECT relname AS tabla, n_live_tup AS filas', 'FROM pg_stat_user_tables', 'ORDER BY n_live_tup DESC;'], { k: 'contar filas rapido cuantas' });
  S('admin', 'Índices de una tabla', 'Ver los índices', ['SELECT indexname, indexdef', 'FROM pg_indexes', "WHERE tablename = '{{tabla}}';"], { k: 'indices' });
  S('admin', 'Claves foráneas de una tabla', 'A qué tablas está ligada', ['SELECT tc.table_name, kcu.column_name,', '       ccu.table_name AS tabla_referenciada, ccu.column_name AS columna_referenciada', 'FROM information_schema.table_constraints tc', 'JOIN information_schema.key_column_usage kcu', '    ON tc.constraint_name = kcu.constraint_name', 'JOIN information_schema.constraint_column_usage ccu', '    ON ccu.constraint_name = tc.constraint_name', "WHERE tc.constraint_type = 'FOREIGN KEY'", "  AND tc.table_name = '{{tabla}}';"], { k: 'relaciones foreign key' });
  S('admin', 'Tablas sin clave primaria', 'Detectar tablas sin PK', ['SELECT t.table_schema, t.table_name', 'FROM information_schema.tables t', 'LEFT JOIN information_schema.table_constraints c', '    ON c.table_schema = t.table_schema', '   AND c.table_name = t.table_name', "   AND c.constraint_type = 'PRIMARY KEY'", "WHERE t.table_type = 'BASE TABLE'", "  AND t.table_schema NOT IN ('pg_catalog', 'information_schema')", '  AND c.constraint_name IS NULL;'], { k: 'sin pk llave primaria' });
  S('admin', 'Buscar duplicados', 'Valores repetidos en una columna', ['SELECT {{columna}}, COUNT(*) AS veces', 'FROM {{tabla}}', 'GROUP BY {{columna}}', 'HAVING COUNT(*) > 1', 'ORDER BY veces DESC;'], { t: 'dup', k: 'repetidos duplicados' });
  S('admin', 'Eliminar duplicados (deja uno)', 'Borrar filas repetidas', ['DELETE FROM {{tabla}} a', 'USING {{tabla}} b', 'WHERE a.ctid < b.ctid', '  AND a.{{columna}} = b.{{columna}};'], { k: 'borrar repetidos limpiar' });
  S('admin', 'Sesiones activas', 'Quién está conectado y qué ejecuta', ['SELECT pid, usename, datname, state, query_start, query', 'FROM pg_stat_activity', "WHERE state <> 'idle'", 'ORDER BY query_start;'], { k: 'conexiones procesos consultas corriendo' });
  S('admin', 'Terminar una sesión', 'Cerrar una conexión por su pid', ['SELECT pg_terminate_backend({{pid}});'], { k: 'matar kill cerrar conexion' });
  S('admin', 'Cancelar una consulta', 'Detener la consulta de una sesión', ['SELECT pg_cancel_backend({{pid}});'], { k: 'detener parar' });
  S('admin', 'Bloqueos', 'Quién bloquea a quién', ['SELECT blocked.pid AS bloqueado, blocking.pid AS bloqueador, blocked.query AS consulta_bloqueada', 'FROM pg_stat_activity blocked', 'JOIN pg_stat_activity blocking', '    ON blocking.pid = ANY (pg_blocking_pids(blocked.pid));'], { k: 'lock bloqueado trabado' });
  S('admin', 'Esquemas', 'Listar los esquemas', ['SELECT schema_name', 'FROM information_schema.schemata', 'ORDER BY schema_name;'], { k: 'listar esquemas' });
  S('admin', 'Roles / usuarios', 'Listar los usuarios de la base', ['SELECT rolname, rolsuper, rolcanlogin', 'FROM pg_roles', 'ORDER BY rolname;'], { k: 'usuarios listar' });
  S('admin', 'Permisos de una tabla', 'Quién puede hacer qué', ['SELECT grantee, privilege_type', 'FROM information_schema.role_table_grants', "WHERE table_name = '{{tabla}}';"], { k: 'privilegios grants' });
  S('admin', 'Definición de una vista', 'Ver la consulta de una vista', ["SELECT pg_get_viewdef('{{vista}}'::regclass, TRUE);"], { k: 'ver codigo vista' });
  S('admin', 'Definición de una función', 'Ver el código de una función', ["SELECT pg_get_functiondef('{{funcion}}'::regproc);"], { k: 'ver codigo funcion' });
  S('admin', 'Secuencias', 'Ver el valor actual de las secuencias', ['SELECT schemaname, sequencename, last_value', 'FROM pg_sequences;'], { k: 'contadores ids' });
  S('admin', 'Ajustar secuencia al máximo', 'Corregir el contador de un id', ["SELECT setval(pg_get_serial_sequence('{{tabla}}', '{{id}}'), COALESCE(MAX({{id}}), 1))", 'FROM {{tabla}};'], { k: 'arreglar serial id duplicado key' });
  S('admin', 'Versión, usuario y base', 'Datos de la conexión actual', ['SELECT version(), current_user, current_database(), now();'], { k: 'quien soy info conexion' });
  S('admin', 'VACUUM ANALYZE', 'Limpiar y actualizar estadísticas', ['VACUUM (ANALYZE, VERBOSE) {{tabla}};'], { k: 'limpiar mantenimiento' });
  S('admin', 'ANALYZE', 'Actualizar estadísticas de una tabla', ['ANALYZE {{tabla}};'], { k: 'estadisticas' });
  S('admin', 'SHOW', 'Ver un parámetro de configuración', ['SHOW {{search_path}};'], { k: 'configuracion parametro' });
  S('admin', 'SET search_path', 'Elegir el esquema por defecto', ['SET search_path TO {{esquema}}, public;'], { k: 'esquema por defecto' });
  S('admin', 'SET statement_timeout', 'Límite de tiempo por consulta', ["SET statement_timeout = '{{30s}}';"], { k: 'tiempo maximo timeout' });

  /* ---- Funciones (fragmentos) ---- */
  function F(nombre, desc, code, k) { S('funciones', nombre, desc, code, { frag: true, k: k || '' }); }
  F('COUNT(*)', 'Cuenta filas', 'COUNT(*)', 'contar cantidad total');
  F('COUNT(DISTINCT …)', 'Cuenta valores distintos', 'COUNT(DISTINCT {{columna}})', 'contar unicos');
  F('SUM()', 'Suma', 'SUM({{columna}})', 'sumar total');
  F('AVG()', 'Promedio', 'AVG({{columna}})', 'promedio media');
  F('MIN()', 'Valor mínimo', 'MIN({{columna}})', 'menor minimo');
  F('MAX()', 'Valor máximo', 'MAX({{columna}})', 'mayor maximo');
  F('COUNT(*) FILTER', 'Cuenta solo las que cumplen una condición', 'COUNT(*) FILTER (WHERE {{condicion}})', 'contar condicion');
  F('STRING_AGG()', 'Une textos en uno solo', "STRING_AGG({{columna}}, '{{, }}' ORDER BY {{columna}})", 'concatenar agrupar lista texto');
  F('ARRAY_AGG()', 'Junta valores en un arreglo', 'ARRAY_AGG({{columna}})', 'arreglo agrupar');
  F('BOOL_AND() / BOOL_OR()', 'Todos / alguno verdaderos', 'BOOL_AND({{condicion}})', 'todos alguno');
  F('COALESCE()', 'Primer valor que no sea nulo', "COALESCE({{columna}}, {{valor_por_defecto}})", 'nulo por defecto reemplazar vacio');
  F('NULLIF()', 'NULL si dos valores son iguales', 'NULLIF({{columna}}, {{valor}})', 'evitar division cero');
  F('GREATEST() / LEAST()', 'El mayor / menor de varios', 'GREATEST({{a}}, {{b}})', 'mayor menor varios');
  F('CONCAT()', 'Unir textos', "CONCAT({{a}}, ' ', {{b}})", 'unir juntar texto');
  F('|| (unir textos)', 'Operador para unir textos', "{{a}} || ' ' || {{b}}", 'concatenar unir');
  F('UPPER() / LOWER()', 'Mayúsculas / minúsculas', 'UPPER({{columna}})', 'mayusculas minusculas');
  F('INITCAP()', 'Primera letra en mayúscula', 'INITCAP({{columna}})', 'capitalizar nombre propio');
  F('TRIM()', 'Quitar espacios de los extremos', 'TRIM({{columna}})', 'espacios limpiar');
  F('LENGTH()', 'Cantidad de caracteres', 'LENGTH({{columna}})', 'largo longitud');
  F('SUBSTRING()', 'Parte de un texto', 'SUBSTRING({{columna}} FROM {{1}} FOR {{5}})', 'extraer cortar parte');
  F('LEFT() / RIGHT()', 'Primeros o últimos caracteres', 'LEFT({{columna}}, {{3}})', 'inicio final');
  F('REPLACE()', 'Reemplazar texto', "REPLACE({{columna}}, '{{buscar}}', '{{nuevo}}')", 'cambiar reemplazar');
  F('SPLIT_PART()', 'Parte de un texto separado', "SPLIT_PART({{columna}}, '{{,}}', {{1}})", 'dividir separar');
  F('POSITION()', 'Posición de un texto dentro de otro', "POSITION('{{buscar}}' IN {{columna}})", 'buscar posicion');
  F('LPAD() / RPAD()', 'Rellenar a una longitud', "LPAD({{columna}}::text, {{10}}, '0')", 'ceros rellenar');
  F('REGEXP_REPLACE()', 'Reemplazar con expresión regular', "REGEXP_REPLACE({{columna}}, '{{[^0-9]}}', '', 'g')", 'regex limpiar solo numeros');
  F('FORMAT()', 'Armar un texto con valores', "FORMAT('%s - %s', {{a}}, {{b}})", 'plantilla texto');
  F('MD5()', 'Huella del texto', 'MD5({{columna}})', 'hash');
  F('ROUND()', 'Redondear', 'ROUND({{columna}}, {{2}})', 'redondeo decimales');
  F('CEIL() / FLOOR()', 'Redondear hacia arriba / abajo', 'CEIL({{columna}})', 'techo piso');
  F('ABS()', 'Valor absoluto', 'ABS({{columna}})', 'positivo');
  F('MOD()', 'Residuo de una división', 'MOD({{a}}, {{b}})', 'modulo residuo');
  F('POWER() / SQRT()', 'Potencia / raíz', 'POWER({{base}}, {{2}})', 'potencia raiz');
  F('RANDOM()', 'Número al azar entre 0 y 1', 'RANDOM()', 'aleatorio azar');
  F('NOW()', 'Fecha y hora actual', 'NOW()', 'ahora hoy fecha hora');
  F('CURRENT_DATE', 'Fecha de hoy', 'CURRENT_DATE', 'hoy');
  F('DATE_TRUNC()', 'Cortar una fecha (día, mes, año…)', "DATE_TRUNC('{{month}}', {{fecha}})", 'mes dia ano agrupar por mes');
  F('EXTRACT()', 'Sacar año, mes, día…', 'EXTRACT({{YEAR}} FROM {{fecha}})', 'ano mes dia hora');
  F('AGE()', 'Diferencia entre fechas', 'AGE({{fecha1}}, {{fecha2}})', 'edad diferencia');
  F('TO_CHAR()', 'Fecha o número a texto con formato', "TO_CHAR({{fecha}}, '{{YYYY-MM-DD}}')", 'formato fecha texto');
  F('TO_DATE()', 'Texto a fecha', "TO_DATE('{{2026-01-31}}', 'YYYY-MM-DD')", 'convertir texto fecha');
  F('TO_TIMESTAMP()', 'Texto a fecha y hora', "TO_TIMESTAMP('{{2026-01-31 10:00}}', 'YYYY-MM-DD HH24:MI')", 'convertir');
  F('INTERVAL (sumar tiempo)', 'Sumar o restar días, horas…', "{{fecha}} + INTERVAL '{{7 days}}'", 'sumar dias restar fecha');
  F('CAST()', 'Convertir un valor a otro tipo', 'CAST({{columna}} AS {{INTEGER}})', 'convertir tipo');
  F(':: (convertir tipo)', 'Atajo de CAST', '{{columna}}::{{integer}}', 'convertir tipo cast');
  F('TO_NUMBER()', 'Texto a número', "TO_NUMBER({{columna}}, '{{999999.99}}')", 'convertir numero');
  F('-> y ->> (JSON)', 'Leer un campo de un JSON', "{{columna}}->>'{{campo}}'", 'json campo extraer');
  F('JSONB_BUILD_OBJECT()', 'Armar un objeto JSON', "JSONB_BUILD_OBJECT('{{clave}}', {{valor}})", 'json crear objeto');
  F('JSONB_AGG()', 'Juntar filas en un arreglo JSON', 'JSONB_AGG({{columna}})', 'json agrupar');
  F('JSONB_SET()', 'Cambiar un valor dentro de un JSON', "JSONB_SET({{columna}}, ARRAY['{{campo}}'], '\"{{valor}}\"')", 'json actualizar');
  F('UNNEST()', 'Convierte un arreglo en filas', 'UNNEST({{arreglo}})', 'arreglo filas');
  F('ARRAY_LENGTH()', 'Tamaño de un arreglo', 'ARRAY_LENGTH({{arreglo}}, 1)', 'arreglo largo');
  F('GEN_RANDOM_UUID()', 'Generar un UUID', 'GEN_RANDOM_UUID()', 'uuid identificador unico');
  F('CURRENT_USER / CURRENT_DATABASE()', 'Usuario y base actuales', 'CURRENT_USER', 'quien');
  F('PG_SIZE_PRETTY()', 'Tamaño legible (MB, GB)', 'PG_SIZE_PRETTY({{bytes}})', 'peso tamano');

  /* ---- Tipos de datos ---- */
  function T(nombre, desc, k) { S('tipos', nombre, desc, nombre, { frag: true, k: k || '' }); }
  T('INTEGER', 'Número entero (±2.147 millones)', 'int entero numero');
  T('BIGINT', 'Número entero muy grande', 'entero grande id');
  T('SMALLINT', 'Número entero pequeño', 'entero pequeno');
  T('SERIAL', 'Entero que se autoincrementa', 'autonumerico id contador');
  T('BIGSERIAL', 'Entero grande autoincremental', 'autonumerico id contador');
  T('NUMERIC(10,2)', 'Decimal exacto (dinero, precios)', 'decimal dinero precio');
  T('REAL', 'Decimal aproximado (4 bytes)', 'decimal float');
  T('DOUBLE PRECISION', 'Decimal aproximado (8 bytes)', 'decimal float');
  T('MONEY', 'Valor monetario', 'dinero');
  T('VARCHAR(100)', 'Texto con límite de largo', 'texto cadena string');
  T('CHAR(1)', 'Texto de largo fijo', 'texto fijo');
  T('TEXT', 'Texto de cualquier largo', 'texto cadena string');
  T('BOOLEAN', 'Verdadero o falso', 'logico si no true false');
  T('DATE', 'Solo fecha', 'fecha dia');
  T('TIME', 'Solo hora', 'hora');
  T('TIMESTAMP', 'Fecha y hora (sin zona horaria)', 'fecha hora');
  T('TIMESTAMPTZ', 'Fecha y hora con zona horaria', 'fecha hora zona');
  T('INTERVAL', 'Duración de tiempo', 'duracion periodo');
  T('UUID', 'Identificador único universal', 'identificador unico');
  T('JSON', 'Datos JSON (texto)', 'json objeto');
  T('JSONB', 'Datos JSON binario (indexable)', 'json objeto');
  T('BYTEA', 'Datos binarios (archivos)', 'binario archivo imagen');
  T('INET', 'Dirección IP', 'ip red');
  T('INTEGER[]', 'Arreglo de enteros', 'arreglo lista array');

  /* ------------------------------ búsqueda ------------------------------ */
  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  CATALOGO.forEach(function (c, i) { c.i = i; c._b = norm(c.nombre + ' ' + c.desc + ' ' + c.k + ' ' + c.t); });

  // Busca por varias palabras (todas deben aparecer). cat = id de categoría o 'todas'.
  function buscar(texto, cat) {
    var q = norm(texto).split(/\s+/).filter(Boolean);
    var res = CATALOGO.filter(function (c) {
      if (cat && cat !== 'todas' && c.cat !== cat) return false;
      for (var i = 0; i < q.length; i++) if (c._b.indexOf(q[i]) < 0) return false;
      return true;
    });
    if (q.length) {
      var p = q[0];
      res.sort(function (a, b) {
        function pt(c) { var n = norm(c.nombre); return (n.indexOf(p) === 0 ? 0 : (c.t && c.t.indexOf(p) === 0 ? 1 : (n.indexOf(p) > 0 ? 2 : 3))); }
        return pt(a) - pt(b) || a.i - b.i;
      });
    }
    return res;
  }

  /* ------------------------------ autocompletado ------------------------------ */
  // palabrasTexto: identificadores que ya están escritos en el SQL del usuario
  function sugerencias(prefijo, palabrasTexto, max) {
    var p = String(prefijo || ''), pu = p.toUpperCase(), pl = norm(p), out = [], visto = {}, n = max || 9;
    if (p.length < 1) return out;
    function add(item) { var k = item.tipo + '|' + item.texto; if (visto[k]) return; visto[k] = 1; out.push(item); }

    var kws = Object.keys(KEYWORDS).filter(function (w) { return w.indexOf(pu) === 0 && w !== pu; }).sort();
    var tys = Object.keys(TYPES).filter(function (w) { return w.indexOf(pu) === 0 && w !== pu; }).sort();
    var fns = FUNCS.filter(function (w) { return w.indexOf(pu) === 0 && w !== pu; }).sort();
    var sns = CATALOGO.filter(function (c) { return c.t && c.t.indexOf(pl) === 0 && c.t !== pl || (c.t && c.t === pl); });

    kws.slice(0, 5).forEach(function (w) { add({ tipo: 'kw', texto: w, desc: 'palabra clave' }); });
    sns.slice(0, 3).forEach(function (c) { add({ tipo: 'sn', texto: c.nombre, desc: c.desc, code: c.code, frag: c.frag }); });
    fns.slice(0, 5).forEach(function (w) { add({ tipo: 'fn', texto: w, desc: 'función' }); });
    tys.slice(0, 4).forEach(function (w) { add({ tipo: 'ty', texto: w, desc: 'tipo de datos' }); });
    (palabrasTexto || []).forEach(function (w) {
      if (w.length > p.length && w.toLowerCase().indexOf(p.toLowerCase()) === 0 && !KEYWORDS[w.toUpperCase()] && !TYPES[w.toUpperCase()] && !FUNC_SET[w.toUpperCase()]) add({ tipo: 'id', texto: w, desc: 'en tu SQL' });
    });
    return out.slice(0, n);
  }

  // Clase de color de una palabra (sin el prefijo "tk-"): kw, ty, fn o '' (identificador normal)
  function clasificar(palabra, siguienteEsParentesis, despuesDeCast) {
    var u = palabra.toUpperCase();
    if (despuesDeCast) return TYPES[u] ? 'ty' : '';
    if (TYPES[u] && (!siguienteEsParentesis || !FUNC_SET[u]) && !KEYWORDS[u]) return 'ty';
    if (siguienteEsParentesis && !NO_FUNC[u]) {
      if (TYPES[u]) return 'ty';
      if (FUNC_SET[u] || !KEYWORDS[u] || u === 'LEFT' || u === 'RIGHT' || u === 'REPLACE' || u === 'IF') return 'fn';
    }
    if (KEYWORDS[u]) return 'kw';
    if (FUNC_SET[u] && /^(NOW|CURRENT_DATE|CURRENT_TIMESTAMP)$/.test(u)) return 'fn';
    return '';
  }

  return {
    KEYWORDS: KEYWORDS, TYPES: TYPES, FUNCS: FUNCS, CATS: CATS, CATALOGO: CATALOGO,
    buscar: buscar, sugerencias: sugerencias, clasificar: clasificar, norm: norm
  };
});
