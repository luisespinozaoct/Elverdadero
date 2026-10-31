/* =================================================================
   GUARDADO EN EL CELULAR
   -----------------------------------------------------------------
   Todo lo que anota el usuario vive en una sola variable, "estado",
   y se guarda en el almacenamiento del navegador (localStorage).
   No hay servidor ni cuentas: los datos nunca salen del teléfono.

   IMPORTANTE: los nombres de los campos del estado (nick, ej, kg,
   reps...) NO se deben cambiar. Así están guardados en los
   celulares y en los respaldos; si se cambian, la app ya no podría
   leer los datos de quien ya la usa.
   ================================================================= */
"use strict";

/* Nombre del cajón donde se guarda todo en el navegador */
const CLAVE_GUARDADO = "el_verdadero_v1";

/* Versión del formato de datos. Si algún día cambia la forma de
   guardar, este número sube y se puede convertir lo viejo a lo nuevo. */
const VERSION_DATOS = 1;

/* Meta que se le pone a los ejercicios que agrega el usuario ("OTRO").
   Es inalcanzable a propósito: esos ejercicios no tienen nodo que
   encender en el mapa, solo cuentan para las gráficas. */
const SIN_META = 999999;

/* Todos los datos del usuario. Se llena al arrancar (ver arranque.js). */
let estado = null;

/* Cómo se ve el estado de alguien que acaba de instalar la app.

   Campos que se guardan:
   - v:          versión del formato (ver VERSION_DATOS)
   - paso:       en qué pantalla del alta va ("bienvenida" ... "listo")
   - modo:       "individual" (el modo entrenador todavía no existe)
   - tab:        la pestaña abierta: "workout", "progreso" o "usuario"
   - perfil:     apodo (nick), avatar, edad y entrenador
   - plan:       los días de la rutina: [{ id, nombre, grupos, ejercicios }]
   - propios:    ejercicios que el usuario agregó con el botón OTRO
   - sesiones:   los entrenamientos guardados, del más viejo al más nuevo:
                 [{ id, fecha, hora, diaId, entradas: [{ ej, series: [{ kg, reps }] }] }]
   - logros:     { idDelLogro: "fecha en que se desbloqueó" }
   - pesos:      registros de peso corporal: [{ fecha, kg }]
   - borrador:   el entrenamiento que se está llenando y no se ha guardado
   - ejemplo:    true si son los datos de ejemplo
   - tmp:        apuntes temporales del alta manual
   - verNombres: si el mapa muestra los nombres bajo cada nodo        */
function estadoNuevo() {
  return {
    v: VERSION_DATOS,
    paso: "bienvenida",
    modo: null,
    tab: "workout",
    perfil: { nick: "", avatar: "🦍", edad: "", entrenador: "" },
    plan: [],
    propios: [],
    sesiones: [],
    logros: {},
    pesos: [],
    borrador: null,
    ejemplo: false,
    tmp: { tipo: null, dias: [] },
  };
}

/* Guarda el estado completo en el navegador */
function guardar() {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado));
  } catch (error) {
    // Pasa si el teléfono no tiene espacio o el navegador está en modo
    // privado. La app sigue funcionando; solo no se guarda esta vez.
  }
}

/* Lee el estado guardado. Si no hay nada (primera vez) o está dañado,
   regresa un estado nuevo. */
function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE_GUARDADO);
    if (texto) {
      const datos = completarEstado(JSON.parse(texto));
      if (datos) return datos;
    }
  } catch (error) {
    // Datos ilegibles: se empieza de cero en lugar de que la app truene.
  }
  return estadoNuevo();
}

/* Revisa que unos datos (guardados o de un respaldo) tengan la forma
   correcta. Si les falta algún campo, se lo pone con su valor inicial.
   Regresa null si de plano no son datos de esta app. */
function completarEstado(datos) {
  if (!datos || typeof datos !== "object" || datos.v !== VERSION_DATOS) return null;

  const base = estadoNuevo();
  const listas = ["plan", "propios", "sesiones", "pesos"];
  for (const campo of listas) {
    if (datos[campo] !== undefined && !Array.isArray(datos[campo])) return null;
  }
  const completo = Object.assign(base, datos);
  completo.perfil = Object.assign(estadoNuevo().perfil, datos.perfil);
  completo.tmp = Object.assign(estadoNuevo().tmp, datos.tmp);
  if (!completo.logros || typeof completo.logros !== "object") completo.logros = {};

  // Cada sesión necesita su lista de ejercicios, y cada ejercicio su lista de series
  const sesionesBien = completo.sesiones.every(
    (sesion) =>
      sesion &&
      typeof sesion.fecha === "string" &&
      Array.isArray(sesion.entradas) &&
      sesion.entradas.every((entrada) => entrada && Array.isArray(entrada.series)),
  );
  if (!sesionesBien) return null;

  // Cada día del plan necesita su lista de grupos y de ejercicios
  const planBien = completo.plan.every((dia) => dia && Array.isArray(dia.grupos) && Array.isArray(dia.ejercicios));
  if (!planBien) return null;

  // Un borrador dañado no vale la pena: se descarta y ya
  if (completo.borrador && !Array.isArray(completo.borrador.entradas)) completo.borrador = null;

  return completo;
}
