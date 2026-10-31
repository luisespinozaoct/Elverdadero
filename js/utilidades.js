/* =================================================================
   UTILIDADES
   -----------------------------------------------------------------
   Funciones chicas que se usan en toda la app: buscar ejercicios,
   manejar fechas, dar formato a los números, proteger el texto que
   escribe el usuario y elegir frases al azar.
   ================================================================= */
"use strict";

/* ---------- Ejercicios ---------- */

/* Busca un ejercicio por su id, en el catálogo o en los que agregó el
   usuario. Si no existe (por ejemplo, de un respaldo viejo), regresa uno
   "de relleno" para que la app no truene. */
function buscarEjercicio(id) {
  return (
    CATALOGO.find((ejercicio) => ejercicio.id === id) ||
    estado.propios.find((ejercicio) => ejercicio.id === id) || {
      id: id,
      nombre: id,
      grupo: "abdomen",
      meta: 0,
      unidad: "kg",
      nivel: 0,
      req: null,
    }
  );
}

/* El catálogo más los ejercicios que agregó el usuario */
function todosLosEjercicios() {
  return CATALOGO.concat(estado.propios);
}

/* Total de series que llevan unas entradas: [{ ej, series: [...] }] */
function contarSeries(entradas) {
  return entradas.reduce((total, entrada) => total + entrada.series.length, 0);
}

/* Kilos movidos en una sesión: peso × repeticiones de cada serie, sumado */
function volumenSesion(sesion) {
  let total = 0;
  sesion.entradas.forEach((entrada) => {
    entrada.series.forEach((serie) => {
      total += (serie.kg || 0) * (serie.reps || 0);
    });
  });
  return total;
}

/* ---------- Fechas ----------
   Las fechas se guardan como texto "AAAA-MM-DD" (por ejemplo "2026-10-30").
   Al convertirlas a fecha se usa el mediodía ("T12:00:00") para que el
   cambio de horario nunca las mueva al día anterior o al siguiente. */

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/* Convierte una fecha a texto "AAAA-MM-DD", según la hora del teléfono */
function fechaATexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return fecha.getFullYear() + "-" + mes + "-" + dia;
}

/* La fecha de hoy como texto "AAAA-MM-DD" */
function hoyISO() {
  return fechaATexto(new Date());
}

/* La hora actual como texto "HH:MM" */
function horaAhora() {
  const ahora = new Date();
  return String(ahora.getHours()).padStart(2, "0") + ":" + String(ahora.getMinutes()).padStart(2, "0");
}

/* "2026-10-30" → "30 oct" */
function fechaCorta(iso) {
  const partes = iso.split("-");
  return Number(partes[2]) + " " + MESES_CORTOS[Number(partes[1]) - 1];
}

/* Cuántos días pasaron desde esa fecha hasta hoy */
function diasDesde(iso) {
  const antes = new Date(iso + "T12:00:00");
  const hoy = new Date(hoyISO() + "T12:00:00");
  return Math.round((hoy - antes) / MS_POR_DIA);
}

/* "hoy", "ayer", "hace 3 días", "hace 2 sem", "hace 4 meses" */
function haceCuanto(iso) {
  const dias = diasDesde(iso);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return "hace " + dias + " días";
  if (dias < 30) return "hace " + Math.floor(dias / 7) + " sem";
  return "hace " + Math.floor(dias / 30) + " meses";
}

/* Clave de la semana ISO a la que pertenece una fecha: "2026-S44".
   Sirve para agrupar los entrenamientos por semana (de lunes a domingo). */
function claveSemana(iso) {
  const fecha = new Date(iso + "T12:00:00");
  // El jueves de esa semana decide a qué año pertenece (regla ISO 8601)
  const jueves = new Date(fecha);
  jueves.setDate(jueves.getDate() + 4 - ((jueves.getDay() + 6) % 7));
  const primeroDeEnero = new Date(jueves.getFullYear(), 0, 1);
  const numero = Math.ceil(((jueves - primeroDeEnero) / MS_POR_DIA + 1) / 7);
  return jueves.getFullYear() + "-S" + String(numero).padStart(2, "0");
}

/* El lunes de la semana de esa fecha, en milisegundos */
function lunesDe(iso) {
  const fecha = new Date(iso + "T12:00:00");
  fecha.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7));
  fecha.setHours(12, 0, 0, 0);
  return fecha.getTime();
}

/* ---------- Números ---------- */

/* Kilos con un decimal como máximo: 52.5 → "52.5", 50 → "50" */
function formatoKg(numero) {
  return (Math.round(numero * 10) / 10).toString().replace(/\.0$/, "");
}

/* Número redondo con comas de miles: 12345.6 → "12,346" */
function formatoMiles(numero) {
  return Math.round(numero).toLocaleString("es-MX");
}

/* ---------- Texto ---------- */

/* Protege el texto que escribe el usuario antes de meterlo en la página.
   Así, si alguien escribe "<b>" en su apodo, se ve tal cual y no se
   convierte en código. Se usa en TODO texto que viene del usuario. */
function escaparHtml(texto) {
  const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto == null ? "" : texto).replace(/[&<>"']/g, (letra) => reemplazos[letra]);
}

/* Primera letra en mayúscula: "eso pesa" → "Eso pesa" */
function primeraMayuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* Un elemento cualquiera de una lista */
function alAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
