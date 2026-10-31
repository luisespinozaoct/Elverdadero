/* =================================================================
   NAVEGACIÓN: QUÉ PANTALLA SE DIBUJA
   -----------------------------------------------------------------
   La app es una sola página. Cada "pantalla" es una función que
   escribe su contenido dentro de <main id="app">. Aquí se decide cuál
   toca dibujar según la pestaña abierta y la sub-pantalla ("vista").
   ================================================================= */
"use strict";

/* Las tres zonas fijas del index.html */
const hoja = document.getElementById("app"); // donde se dibuja cada pantalla
const barraSuperior = document.getElementById("barra"); // título y botón "Atrás"
const barraPestanas = document.getElementById("nav"); // Workout · Progreso · Usuario

/* La sub-pantalla abierta dentro de la pestaña.
   n: nombre ("sesion", "mapa", "ajustes"...; vacío = la principal)
   p: dato extra (por ejemplo, el grupo muscular del mapa) */
let vista = { n: "", p: null };

/* Abre una sub-pantalla y sube al inicio de la página */
function irA(pantalla, dato) {
  vista = { n: pantalla, p: dato || null };
  pintarPantalla();
  window.scrollTo(0, 0);
}

/* Regresa a la pantalla principal de la pestaña actual */
function irAlInicioDeLaPestana() {
  vista = { n: "", p: null };
  pintarPantalla();
  window.scrollTo(0, 0);
}

/* Dibuja la pantalla que toca */
function pintarPantalla() {
  // Mientras no termine el alta, se muestran las pantallas de bienvenida
  if (estado.paso !== "listo") {
    pintarAlta();
    return;
  }

  barraPestanas.hidden = false;
  barraPestanas.querySelectorAll("button").forEach((boton) => {
    boton.setAttribute("aria-current", boton.dataset.v === estado.tab ? "true" : "false");
  });

  if (estado.tab === "workout") {
    if (vista.n === "sesion") pantallaSesion();
    else if (vista.n === "elegirDia") pantallaElegirDia();
    else pantallaWorkout();
  } else if (estado.tab === "progreso") {
    pantallaProgreso();
  } else if (estado.tab === "usuario") {
    if (vista.n === "trofeos") pantallaTrofeos();
    else if (vista.n === "mapa") pantallaMapa();
    else if (vista.n === "ajustes") pantallaAjustes();
    else if (vista.n === "plan") pantallaVerPlan();
    else pantallaUsuario();
  }
}

/* Escribe el título de arriba. Si se da "volverA", agrega el botón "Atrás"
   que regresa a esa pantalla. */
function cabecera(titulo, volverA) {
  const botonAtras =
    volverA != null ? '<button class="volver" data-act="volver" data-v="' + escaparHtml(volverA) + '">‹ Atrás</button>' : "";
  barraSuperior.innerHTML = botonAtras + "<h1>" + escaparHtml(titulo) + "</h1>";
}
