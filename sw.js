/* =================================================================
   MODO SIN INTERNET (service worker)
   -----------------------------------------------------------------
   Es un ayudante que el navegador instala junto con la app.
   1. La primera vez que se abre la app con internet, guarda una copia
      de todos sus archivos dentro del teléfono.
   2. Las siguientes veces, la app se abre desde esa copia, haya o no
      haya señal.
   Los datos del usuario (entrenamientos, logros...) NO pasan por aquí:
   esos viven en localStorage (ver js/guardado.js).

   ⚠️ CADA VEZ QUE CAMBIES ALGÚN ARCHIVO DE LA APP, CAMBIA "VERSION".
      Así los teléfonos se enteran de que hay algo nuevo y bajan la
      copia nueva. Si no la cambias, seguirán viendo la versión vieja.
   ================================================================= */
"use strict";

const VERSION = "el-verdadero-2026-10-30-1";

/* Los archivos que se guardan en el teléfono. Si agregas un archivo
   nuevo a la app, agrégalo también a esta lista. */
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./js/datos-ejercicios.js",
  "./js/datos-logros.js",
  "./js/datos-frases.js",
  "./js/guardado.js",
  "./js/utilidades.js",
  "./js/estadisticas.js",
  "./js/graficas.js",
  "./js/navegacion.js",
  "./js/mapa.js",
  "./js/pantallas-alta.js",
  "./js/pantallas-workout.js",
  "./js/pantallas-progreso.js",
  "./js/pantallas-usuario.js",
  "./js/compartir.js",
  "./js/acciones.js",
  "./js/ejemplo.js",
  "./js/arranque.js",
];

/* Las tipografías vienen de Google. No se pueden guardar por adelantado,
   pero sí la primera vez que se usan; después también funcionan sin señal. */
const SERVIDORES_DE_TIPOGRAFIAS = ["fonts.googleapis.com", "fonts.gstatic.com"];

/* 1) Al instalarse: guarda la copia de todos los archivos */
self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(VERSION).then((copia) => copia.addAll(ARCHIVOS)));
  self.skipWaiting(); // la versión nueva entra sin esperar a que se cierre la app
});

/* 2) Al activarse: borra las copias de versiones anteriores */
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((nombre) => nombre !== VERSION).map((nombre) => caches.delete(nombre))))
      .then(() => self.clients.claim()),
  );
});

/* 3) Cada vez que la app pide un archivo: primero la copia guardada;
      si no está, se pide a internet (y si es una tipografía, se guarda). */
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const direccion = new URL(pedido.url);
  const esDeLaApp = direccion.origin === self.location.origin;
  const esTipografia = SERVIDORES_DE_TIPOGRAFIAS.includes(direccion.hostname);
  if (!esDeLaApp && !esTipografia) return;

  evento.respondWith(
    caches.match(pedido, { ignoreSearch: esDeLaApp }).then((guardado) => {
      if (guardado) return guardado;
      return fetch(pedido)
        .then((respuesta) => {
          if (esTipografia) {
            const copiaDeRespuesta = respuesta.clone();
            caches.open(VERSION).then((copia) => copia.put(pedido, copiaDeRespuesta));
          }
          return respuesta;
        })
        .catch(() => {
          // Sin internet y pidiendo una página: se muestra la app
          if (pedido.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
    }),
  );
});
