/* =================================================================
   ARRANQUE
   -----------------------------------------------------------------
   Este archivo va al final porque usa todo lo de los anteriores.
   Lee los datos guardados, dibuja la primera pantalla y prepara la
   app para funcionar sin internet.
   ================================================================= */
"use strict";

estado = cargar();
if (estado.paso === "listo") revisarLogros();
pintarPantalla();

/* Modo sin internet. Solo funciona cuando la app está publicada en una
   dirección https (como Netlify). Abierta como archivo en la Mac no hace
   nada, y así siempre ves tus cambios al momento. Ver sw.js. */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Si falla, la app sigue funcionando normal con internet
    });
  });
}
