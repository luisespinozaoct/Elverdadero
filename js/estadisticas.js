/* =================================================================
   ESTADÍSTICAS Y LOGROS
   -----------------------------------------------------------------
   Aquí se hacen las cuentas a partir de los entrenamientos guardados:
   récords, kilos movidos, semanas seguidas... y con eso se decide
   qué logros de la sala de trofeos ya se desbloquearon.
   ================================================================= */
"use strict";

/* Ejercicios que forman "los tres básicos" del powerlifting */
const SENTADILLA = "pi_sent";
const PESO_MUERTO = "pi_pm";
const PRESS_BANCA = "pe_banca";
const PRESS_MILITAR = "ho_mil";

/* El peso y las repeticiones más altas de cada ejercicio.
   Regresa: { idEjercicio: { kg, reps } }
   Si se da "hastaSesion", solo cuenta las sesiones anteriores a esa posición. */
function maximos(hastaSesion) {
  const resultado = {};
  estado.sesiones.forEach((sesion, posicion) => {
    if (hastaSesion != null && posicion >= hastaSesion) return;
    sesion.entradas.forEach((entrada) => {
      entrada.series.forEach((serie) => {
        if (!resultado[entrada.ej]) resultado[entrada.ej] = { kg: 0, reps: 0 };
        const marca = resultado[entrada.ej];
        if (serie.kg > marca.kg) marca.kg = serie.kg;
        if (serie.reps > marca.reps) marca.reps = serie.reps;
      });
    });
  });
  return resultado;
}

/* La última vez que se hizo un ejercicio: fecha, la serie más pesada y
   cuántas series fueron. Regresa null si nunca se ha hecho. */
function ultimaVez(idEjercicio) {
  for (let i = estado.sesiones.length - 1; i >= 0; i--) {
    const sesion = estado.sesiones[i];
    const entrada = sesion.entradas.find((e) => e.ej === idEjercicio);
    if (entrada && entrada.series.length) {
      let masPesada = entrada.series[0];
      entrada.series.forEach((serie) => {
        if (serie.kg > masPesada.kg) masPesada = serie;
      });
      return { fecha: sesion.fecha, kg: masPesada.kg, reps: masPesada.reps, n: entrada.series.length };
    }
  }
  return null;
}

/* Todas las cuentas que necesitan las pantallas y los logros, de una vez */
function calcularEstadisticas() {
  const est = {
    totalSesiones: estado.sesiones.length,
    maximos: maximos(),
    kilosTotales: 0,
    kilosMejorSesion: 0,
    kilosPorSemana: {}, // { "2026-S44": kilos }
    ejerciciosDistintos: {}, // { idEjercicio: true }
    sesionesPorGrupo: {}, // { pecho: 12, pierna: 10, ... }
    entrenoTemprano: false,
    entrenoNoche: false,
    entrenoDomingo: false,
    semanasSeguidas: 0,
    recordsRotos: 0,
    semanaCompleta: false,
    jaula: false,
    seRegistroPeso: estado.pesos.length > 0,
  };

  // 1. Recorro cada sesión: kilos, horarios y grupos trabajados
  estado.sesiones.forEach((sesion) => {
    const kilos = volumenSesion(sesion);
    est.kilosTotales += kilos;
    if (kilos > est.kilosMejorSesion) est.kilosMejorSesion = kilos;

    const semana = claveSemana(sesion.fecha);
    est.kilosPorSemana[semana] = (est.kilosPorSemana[semana] || 0) + kilos;

    const hora = Number((sesion.hora || "12:00").split(":")[0]);
    if (hora < 7) est.entrenoTemprano = true;
    if (hora >= 22) est.entrenoNoche = true;
    if (new Date(sesion.fecha + "T12:00:00").getDay() === 0) est.entrenoDomingo = true;

    const gruposDeHoy = {};
    sesion.entradas.forEach((entrada) => {
      est.ejerciciosDistintos[entrada.ej] = true;
      gruposDeHoy[buscarEjercicio(entrada.ej).grupo] = true;
    });
    Object.keys(gruposDeHoy).forEach((grupo) => {
      est.sesionesPorGrupo[grupo] = (est.sesionesPorGrupo[grupo] || 0) + 1;
    });
  });

  // 2. Semanas seguidas: cuento lunes consecutivos con al menos un entrenamiento
  const lunesConEntreno = {};
  estado.sesiones.forEach((sesion) => {
    lunesConEntreno[lunesDe(sesion.fecha)] = true;
  });
  const lunes = Object.keys(lunesConEntreno).map(Number).sort((a, b) => a - b);
  let racha = 0;
  lunes.forEach((estaSemana, i) => {
    const pegadaALaAnterior = i > 0 && Math.round((estaSemana - lunes[i - 1]) / MS_POR_DIA) === 7;
    racha = pegadaALaAnterior ? racha + 1 : 1;
    if (racha > est.semanasSeguidas) est.semanasSeguidas = racha;
  });

  // 3. Ejercicios en los que alguna vez superaste tu marca anterior
  const mejorHastaAhora = {};
  const superados = {};
  estado.sesiones.forEach((sesion) => {
    sesion.entradas.forEach((entrada) => {
      let maxDeHoy = 0;
      entrada.series.forEach((serie) => {
        if (serie.kg > maxDeHoy) maxDeHoy = serie.kg;
      });
      const anterior = mejorHastaAhora[entrada.ej];
      if (anterior != null && maxDeHoy > anterior) superados[entrada.ej] = true;
      if (anterior == null || maxDeHoy > anterior) mejorHastaAhora[entrada.ej] = maxDeHoy;
    });
  });
  est.recordsRotos = Object.keys(superados).length;

  // 4. Por semana: ¿hiciste todos los días del plan? ¿hiciste "la jaula"?
  const porSemana = {};
  estado.sesiones.forEach((sesion) => {
    const semana = claveSemana(sesion.fecha);
    if (!porSemana[semana]) porSemana[semana] = { dias: {}, ejercicios: {} };
    if (sesion.diaId) porSemana[semana].dias[sesion.diaId] = true;
    sesion.entradas.forEach((entrada) => {
      porSemana[semana].ejercicios[entrada.ej] = true;
    });
  });
  Object.values(porSemana).forEach((semana) => {
    if (estado.plan.length && Object.keys(semana.dias).length >= estado.plan.length) est.semanaCompleta = true;
    const hizo = semana.ejercicios;
    if (hizo[SENTADILLA] && hizo[PESO_MUERTO] && hizo[PRESS_MILITAR]) est.jaula = true;
  });

  return est;
}

/* El récord en kilos de un ejercicio (0 si nunca se ha hecho) */
function kilosMaximos(est, idEjercicio) {
  return (est.maximos[idEjercicio] && est.maximos[idEjercicio].kg) || 0;
}

/* ¿Ya se cumplió este logro? Cada "tipo" de logro tiene su propia regla. */
function logroCumplido(logro, est) {
  const marcas = est.maximos;
  switch (logro.tipo) {
    case "sesiones":
      return est.totalSesiones >= logro.meta;
    case "semanas":
      return est.semanasSeguidas >= logro.meta;
    case "peso":
      return kilosMaximos(est, logro.ejercicio) >= logro.meta;
    case "reps":
      return ((marcas[logro.ejercicio] && marcas[logro.ejercicio].reps) || 0) >= logro.meta;
    case "peso_cual": // en cualquier ejercicio
      return Object.keys(marcas).some((id) => marcas[id].kg >= logro.meta);
    case "combo": // la meta en todos los ejercicios de la lista
      return logro.ejercicio.every((id) => kilosMaximos(est, id) >= logro.meta);
    case "suma3": // sentadilla + peso muerto + banca
      return (
        kilosMaximos(est, SENTADILLA) + kilosMaximos(est, PESO_MUERTO) + kilosMaximos(est, PRESS_BANCA) >= logro.meta
      );
    case "vol_ses":
      return est.kilosMejorSesion >= logro.meta;
    case "vol_sem":
      return Object.values(est.kilosPorSemana).some((kilos) => kilos >= logro.meta);
    case "vol_tot":
      return est.kilosTotales >= logro.meta;
    case "distintos":
      return Object.keys(est.ejerciciosDistintos).length >= logro.meta;
    case "ses_grupo":
      return (est.sesionesPorGrupo[logro.ejercicio] || 0) >= logro.meta;
    case "temprano":
      return est.entrenoTemprano;
    case "tarde":
      return est.entrenoNoche;
    case "domingo":
      return est.entrenoDomingo;
    case "prs":
      return est.recordsRotos >= logro.meta;
    case "sem_completa":
      return est.semanaCompleta;
    case "jaula":
      return est.jaula;
    case "peso_corp":
      return est.seRegistroPeso;
    case "jamas": // "Corazón sin daño": nadie lo desbloquea, es broma
      return false;
  }
  return false;
}

/* Revisa todos los logros y anota con fecha de hoy los que se acaban de
   cumplir. Regresa la lista de los nuevos, para avisarle al usuario. */
function revisarLogros() {
  const est = calcularEstadisticas();
  const nuevos = [];
  LOGROS.forEach((logro) => {
    if (!estado.logros[logro.id] && logroCumplido(logro, est)) {
      estado.logros[logro.id] = hoyISO();
      nuevos.push(logro);
    }
  });
  if (nuevos.length) guardar();
  return nuevos;
}
