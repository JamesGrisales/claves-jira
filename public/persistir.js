/* Guarda lo que escribes en cada pantalla (SQL, XML/JSON, Listas, notas nuevas)
 * para que no se pierda al cambiar de pestaña, recargar o cerrar el navegador.
 * Se borra al guardar la nota, al pulsar «Limpiar» y al cerrar sesión.
 * Las claves de empresas NO se guardan aquí. */
(function () {
  'use strict';

  var usuario = document.body.getAttribute('data-user') || '';
  var ruta = location.pathname.replace(/\/+$/, '') || '/';
  var PREF = 'boveda-borrador:' + usuario + ':';
  var MAX = 800000;                        // caracteres por campo (para no llenar el almacenamiento del navegador)
  var NOTA = 'form[action$="/agregar"] [name=';

  var CAMPOS = {
    '/sql': ['#entrada', '#lsEntrada'],
    '/visor': ['#entrada'],
    '/listas': ['#entrada', '#sep', '#comillas', '#parent', '#union', '#porLinea', '#trim', '#vacios', '#dups', '#nums', '#mayus', '#orden'],
    '/notas': [NOTA + 'categoria]', NOTA + 'titulo]', NOTA + 'contenido]'],
    '/jaivana': [NOTA + 'categoria]', NOTA + 'titulo]', NOTA + 'contenido]']
  };
  var sels = CAMPOS[ruta];
  if (!sels) return;

  var ultimo = {};        // lo último que se guardó de cada campo
  var suspendido = false; // true mientras se envía un formulario

  function clave(sel) { return PREF + ruta + ':' + sel; }
  function valor(e) { return e.type === 'checkbox' ? (e.checked ? '1' : '0') : e.value; }
  function poner(e, v) { if (e.type === 'checkbox') e.checked = v === '1'; else e.value = v; }
  function esTexto(e) { return e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && e.type !== 'checkbox'); }

  function guardar(sel) {
    var e = document.querySelector(sel);
    if (!e || suspendido) return;
    var v = valor(e);
    if (ultimo[sel] === v) return;
    ultimo[sel] = v;
    try {
      if (esTexto(e) && (v === '' || v.length > MAX)) localStorage.removeItem(clave(sel));
      else localStorage.setItem(clave(sel), v);
    } catch (err) { /* sin espacio: se ignora */ }
  }

  function restaurar() {
    sels.forEach(function (sel) {
      var e = document.querySelector(sel), v = null;
      if (!e) return;
      try { v = localStorage.getItem(clave(sel)); } catch (err) {}
      if (v === null) { ultimo[sel] = valor(e); return; }
      if (esTexto(e) && e.value !== '') { ultimo[sel] = e.value; return; }   // ya trae contenido propio
      if (valor(e) === v) { ultimo[sel] = v; return; }
      poner(e, v);
      ultimo[sel] = v;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      if (!esTexto(e)) e.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function guardarTodo() { sels.forEach(guardar); }

  // al escribir
  ['input', 'change'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      for (var i = 0; i < sels.length; i++) { if (e.target.matches && e.target.matches(sels[i])) { guardar(sels[i]); return; } }
    }, true);
  });
  // cambios hechos desde el código (Limpiar, abrir archivo, buscar y reemplazar…)
  setInterval(guardarTodo, 1200);
  window.addEventListener('pagehide', guardarTodo);
  document.addEventListener('visibilitychange', function () { if (document.hidden) guardarTodo(); });

  // al guardar una nota, el borrador ya no hace falta
  document.addEventListener('submit', function (e) {
    var f = e.target;
    sels.forEach(function (sel) {
      var c = document.querySelector(sel);
      if (c && f.contains && f.contains(c)) { suspendido = true; try { localStorage.removeItem(clave(sel)); } catch (err) {} }
    });
  }, true);

  // al cerrar sesión se borran todos los borradores
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="/logout"]');
    if (!a) return;
    suspendido = true;
    try {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf('boveda-borrador:') === 0) localStorage.removeItem(k); });
    } catch (err) {}
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restaurar);
  else restaurar();
})();
