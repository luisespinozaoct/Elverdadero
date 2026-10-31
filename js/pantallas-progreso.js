/* =================================================================
   PESTAÑA 2: PROGRESO
   -----------------------------------------------------------------
   Muestra dos cosas:
   1. Los kilos movidos por semana (las últimas 12 semanas).
   2. Una gráfica por grupo muscular: peso máximo y volumen de cada día.
   ================================================================= */
"use strict";

/* La clave de la semana anterior a la de una fecha: "2026-S43" */
function claveSemanaAnterior(iso) {
  const fecha = new Date(iso + "T12:00:00");
  fecha.setDate(fecha.getDate() - 7);
  return claveSemana(fechaATexto(fecha));
}

/* Los puntos de la gráfica de un grupo: uno por cada sesión en la que se
   trabajó ese grupo, con el peso más alto y los kilos movidos. */
function puntosDelGrupo(grupo) {
  const puntos = [];
  estado.sesiones.forEach((sesion) => {
    let maximo = 0, volumen = 0, loTrabajo = false;
    sesion.entradas.forEach((entrada) => {
      if (buscarEjercicio(entrada.ej).grupo !== grupo) return;
      loTrabajo = true;
      entrada.series.forEach((serie) => {
        if (serie.kg > maximo) maximo = serie.kg;
        volumen += serie.kg * serie.reps;
      });
    });
    if (loTrabajo) puntos.push({ fecha: sesion.fecha, max: maximo, vol: volumen });
  });
  return puntos;
}

function pantallaProgreso() {
  cabecera("Progreso");
  if (estado.sesiones.length < 2) {
    hoja.innerHTML =
      '<h2 class="titulo">Progreso</h2>' +
      '<p class="nada">Con 2 entrenamientos registrados empiezan a dibujarse las líneas. Llevas ' + estado.sesiones.length + ".</p>";
    return;
  }

  // 1. Kilos por semana
  const est = calcularEstadisticas();
  const semanas = Object.keys(est.kilosPorSemana)
    .sort()
    .slice(-12)
    .map((clave) => ({ k: clave, kg: est.kilosPorSemana[clave] }));
  const hoy = hoyISO();
  const kilosEstaSemana = est.kilosPorSemana[claveSemana(hoy)] || 0;
  const kilosSemanaAnterior = est.kilosPorSemana[claveSemanaAnterior(hoy)] || 0;

  let html =
    '<h2 class="titulo">Kilos movidos<br>por semana</h2>' +
    '<p class="sub">Peso × repeticiones × series, sumado. Es el trabajo total que hiciste.</p>' +
    '<div class="tarjeta">' + graficaSemanas(semanas) +
    '<div class="fila fila-separada">' +
    '<div class="crece"><div class="mini">Esta semana</div><div class="num numero-display">' + formatoMiles(kilosEstaSemana) + " kg</div></div>" +
    '<div class="a-la-derecha"><div class="mini">Semana anterior</div><div class="num dato-grande">' + formatoMiles(kilosSemanaAnterior) + " kg</div></div>" +
    "</div></div>" +
    '<button class="btn fantasma" data-act="compartirSemana">Compartir mi semana</button>';

  // 2. Una gráfica por cada grupo muscular que se ha trabajado
  html +=
    '<div class="rotulo">Progreso por grupo muscular</div>' +
    '<p class="mini aclaracion-grafica">La línea roja es el peso más alto que moviste ese día. Las barras azules son el volumen. Si la línea no sube en 6 semanas, algo hay que cambiar.</p>';

  const gruposTrabajados = {};
  estado.sesiones.forEach((sesion) => {
    sesion.entradas.forEach((entrada) => {
      gruposTrabajados[buscarEjercicio(entrada.ej).grupo] = true;
    });
  });

  Object.keys(gruposTrabajados).forEach((grupo) => {
    const puntos = puntosDelGrupo(grupo);
    if (!puntos.length) return;
    const diferencia = puntos[puntos.length - 1].max - puntos[0].max;
    const colorDiferencia = diferencia > 0 ? "texto-verde" : diferencia < 0 ? "texto-rojo" : "texto-gris";
    html +=
      '<div class="tarjeta"><div class="fila abajo-8">' +
      '<span class="chip crece ajustado">' + GRUPOS[grupo].ic + " " + GRUPOS[grupo].nombre + "</span>" +
      '<span class="num mini diferencia ' + colorDiferencia + '">' + (diferencia > 0 ? "+" : "") + formatoKg(diferencia) + " kg desde el inicio</span></div>" +
      graficaProgreso(puntos) +
      "</div>";
  });
  hoja.innerHTML = html;
}
