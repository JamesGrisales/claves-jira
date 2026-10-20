/**
 * Módulo de Autenticación Biométrica (WebAuthn / Windows Hello)
 * Bóveda de Claves
 */

(function(window) {
  'use strict';

  // Utilidades para convertir entre Buffer/ArrayBuffer y Base64URL
  function bufferToBase64url(buffer) {
    var byteView = new Uint8Array(buffer);
    var str = '';
    for (var i = 0; i < byteView.length; i++) {
      str += String.fromCharCode(byteView[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64urlToBuffer(base64url) {
    var padding = '='.repeat((4 - (base64url.length % 4)) % 4);
    var base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  var Biometria = {
    // 1. Verificar si el dispositivo y navegador soportan el estándar WebAuthn
    esCompatible: async function() {
      if (!window.PublicKeyCredential) return false;
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return false;
      return true;
    },

    // 2. Vincular huella digital del usuario actual
    vincular: async function() {
      // Los navegadores (Chrome/Edge) bloquean estrictamente WebAuthn en IPs numéricas como 127.0.0.1
      if (window.location.hostname === '127.0.0.1') {
        var localUrl = window.location.href.replace('127.0.0.1', 'localhost');
        window.location.href = localUrl;
        throw new Error('Redirigiendo a http://localhost:5050 para activar el sensor de Windows Hello...');
      }

      var compatible = await this.esCompatible();
      if (!compatible) {
        throw new Error('Este navegador o dispositivo no soporta el estándar biométrico WebAuthn.');
      }

      // Obtener desafío del servidor
      var res = await fetch('/api/biometria/registro-challenge', {
        headers: { 'Accept': 'application/json' }
      });
      var data = await res.json();
      if (!data.ok || !data.options) {
        throw new Error(data.error || 'No se pudo iniciar el registro de huella.');
      }

      var opts = data.options;
      opts.challenge = base64urlToBuffer(opts.challenge);
      opts.user.id = base64urlToBuffer(opts.user.id);

      // Si el navegador está en localhost o dominio, asegurar rp.id
      if (opts.rp && !opts.rp.id) {
        opts.rp.id = window.location.hostname || 'localhost';
      }

      // Invocar ventana nativa de lectura de huella con Windows Hello
      var cred;
      try {
        cred = await navigator.credentials.create({ publicKey: opts });
      } catch (err) {
        console.error('Error al invocar navigator.credentials.create:', err);
        if (err.name === 'NotAllowedError') {
          throw new Error('Se canceló la lectura biométrica o Windows Hello aún no tiene huellas dactilares configuradas en Windows (Inicio > Configuración > Cuentas > Opciones de inicio de sesión > Reconocimiento de huellas digitales).');
        } else if (err.name === 'SecurityError') {
          throw new Error('Restricción de seguridad del navegador: debes abrir la aplicación desde http://localhost:5050.');
        } else if (err.name === 'InvalidStateError') {
          throw new Error('Esta huella digital ya está vinculada en tu cuenta.');
        } else {
          throw new Error('Error del sensor biométrico: ' + (err.message || err.name));
        }
      }

      if (!cred) {
        throw new Error('No se completó la lectura de la huella.');
      }

      // Enviar credencial registrada al servidor
      var payload = {
        credentialId: cred.id,
        rawId: bufferToBase64url(cred.rawId),
        clientDataJSON: bufferToBase64url(cred.response.clientDataJSON),
        attestationObject: bufferToBase64url(cred.response.attestationObject),
        dispositivo: 'Sensor de Huella (' + (navigator.platform || 'Windows Hello') + ')'
      };

      var saveRes = await fetch('/api/biometria/registro-verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      var saveJson = await saveRes.json();
      if (!saveJson.ok) {
        throw new Error(saveJson.error || 'Error al guardar la credencial biométrica.');
      }

      return saveJson;
    },

    // 3. Iniciar sesión usando la huella digital
    autenticar: async function(username) {
      if (window.location.hostname === '127.0.0.1') {
        var localUrl = window.location.href.replace('127.0.0.1', 'localhost');
        window.location.href = localUrl;
        throw new Error('Redirigiendo a http://localhost:5050 para activar el sensor de Windows Hello...');
      }

      var compatible = await this.esCompatible();
      if (!compatible) {
        throw new Error('Tu equipo no tiene disponible sensor de huella con Windows Hello.');
      }

      var url = '/api/biometria/login-challenge';
      if (username) url += '?username=' + encodeURIComponent(username);

      var res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      var data = await res.json();
      if (!data.ok || !data.options) {
        throw new Error(data.error || 'No se pudo generar el desafío biométrico.');
      }

      var opts = data.options;
      opts.challenge = base64urlToBuffer(opts.challenge);

      if (opts.allowCredentials && opts.allowCredentials.length > 0) {
        opts.allowCredentials = opts.allowCredentials.map(function(c) {
          return {
            id: base64urlToBuffer(c.id),
            type: c.type || 'public-key'
          };
        });
      } else {
        delete opts.allowCredentials;
      }

      // Activar ventana nativa de lectura de huella
      var assertion;
      try {
        assertion = await navigator.credentials.get({ publicKey: opts });
      } catch (err) {
        console.error('Error al invocar navigator.credentials.get:', err);
        if (err.name === 'NotAllowedError') {
          throw new Error('Lectura de huella cancelada o no autorizada.');
        } else if (err.name === 'SecurityError') {
          throw new Error('Restricción de seguridad: debes abrir la aplicación en http://localhost:5050.');
        } else {
          throw new Error('Error biométrico: ' + (err.message || err.name));
        }
      }

      if (!assertion) {
        throw new Error('Lectura de huella cancelada.');
      }

      // Enviar resultado de autenticación
      var payload = {
        credentialId: assertion.id,
        clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
        authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
        signature: bufferToBase64url(assertion.response.signature)
      };

      var authRes = await fetch('/api/biometria/login-verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      var authJson = await authRes.json();
      if (!authJson.ok) {
        throw new Error(authJson.error || 'Huella no reconocida.');
      }

      return authJson;
    },

    // 4. Consultar si hay huellas configuradas
    obtenerEstado: async function() {
      try {
        var res = await fetch('/api/biometria/estado', {
          headers: { 'Accept': 'application/json' }
        });
        return await res.json();
      } catch (e) {
        return { ok: false, tieneHuella: false };
      }
    },

    // 5. Eliminar credencial de huella
    eliminar: async function(id) {
      var url = '/api/biometria';
      if (id) url += '/' + id;
      var res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      return await res.json();
    }
  };

  window.Biometria = Biometria;
})(window);
