/* =================================================================
   PESTAÑA 1: WORKOUT (registrar entrenamientos)
   -----------------------------------------------------------------
   - pantallaWorkout:    inicio, con los últimos entrenamientos
   - pantallaElegirDia:  qué día del plan toca hoy
   - pantallaSesion:     la libreta: se anotan las series de cada ejercicio
   Mientras se llena una sesión, se guarda como "borrador", así no se
   pierde nada si se cierra la app a medias.
   ================================================================= */
"use strict";

/* Busca un día del plan por su id */
function buscarDia(idDia) {
  return estado.plan.find((dia) => dia.id === idDia);
}

function pantallaWorkout() {
  cabecera("Workout");
  let html =
    '<h2 class="titulo">Registro de<br>entrenamiento</h2>' +
    '<p class="sub">Llénalo en el gimnasio o en tu casa. Lo importante es que quede escrito.</p>' +
    '<button class="btn" data-act="irElegirDia">Registrar entrenamiento</button>';

  // Aviso de que hay un entrenamiento a medias
  if (estado.borrador) {
    const dia = buscarDia(estado.borrador.diaId);
    html +=
      '<div class="aviso ok"><b>Tienes uno a medias</b>' + escaparHtml(dia ? dia.nombre : "Sesión") + " · " +
      contarSeries(estado.borrador.entradas) + " series anotadas. " +
      '<button class="btn chico arriba-8" data-act="seguirBorrador">Seguir donde iba</button></div>';
  }

  // Los últimos 8 entrenamientos, del más nuevo al más viejo
  html += '<div class="rotulo">Últimos entrenamientos</div>';
  if (!estado.sesiones.length) {
    html += '<p class="nada">Todavía no hay nada escrito. El primer registro es el más importante: es con el que te vas a comparar.</p>';
  } else {
    estado.sesiones.slice(-8).reverse().forEach((sesion) => {
      const dia = buscarDia(sesion.diaId);
      html +=
        '<div class="tarjeta"><div class="fila">' +
        '<div class="crece"><b>' + escaparHtml(dia ? dia.nombre : "Sesión libre") + "</b>" +
        '<div class="mini num">' + fechaCorta(sesion.fecha) + " · " + haceCuanto(sesion.fecha) + "</div></div>" +
        '<div class="a-la-derecha"><div class="num dato-grande">' + formatoMiles(volumenSesion(sesion)) + " kg</div>" +
        '<div class="mini">' + sesion.entradas.length + " ejercicios · " + contarSeries(sesion.entradas) + " series</div></div>" +
        "</div></div>";
    });
    html += '<p class="mini centro">Llevas ' + estado.sesiones.length + " entrenamientos escritos.</p>";
  }
  hoja.innerHTML = html;
}

function pantallaElegirDia() {
  cabecera("¿Qué toca hoy?", "workout");
  let html = '<h2 class="titulo">¿Qué entrenas?</h2><p class="sub">Elige el grupo con el que vas a trabajar esta sesión.</p>';
  estado.plan.forEach((dia) => {
    const ultima = estado.sesiones.filter((sesion) => sesion.diaId === dia.id).slice(-1)[0];
    html +=
      '<button class="opcion" data-act="abrirSesion" data-v="' + dia.id + '"><b>' + escaparHtml(dia.nombre) + "</b>" +
      "<span>" + dia.ejercicios.length + " ejercicios · " + (ultima ? "última vez " + haceCuanto(ultima.fecha) : "nunca registrado") + "</span></button>";
  });
  hoja.innerHTML = html;
}

/* La libreta del día. Cada ejercicio muestra lo que hiciste la vez pasada,
   las series que llevas hoy y dos casillas (peso y reps) para anotar otra. */
function pantallaSesion() {
  const borrador = estado.borrador;
  const dia = buscarDia(borrador.diaId);
  cabecera(dia ? dia.nombre : "Sesión", "elegirDia");
  const marcas = maximos();

  let html =
    '<div class="tarjeta"><label class="campo sin-margen"><span>Fecha del entrenamiento</span>' +
    '<input type="date" id="f_fecha" value="' + borrador.fecha + '" data-act="cambiarFecha"></label></div>' +
    '<p class="mini aclaracion">Si una máquina está ocupada, salta al siguiente ejercicio y regresa luego. Todo se queda anotado.</p>';

  borrador.entradas.forEach((entrada, i) => {
    const ejercicio = buscarEjercicio(entrada.ej);
    const anterior = ultimaVez(entrada.ej);

    html +=
      '<div class="ej"><div class="fila alineado-arriba">' +
      '<div class="crece"><h3>' + escaparHtml(ejercicio.nombre) + "</h3>" +
      '<p class="ultima">' +
      (anterior
        ? "La vez pasada: <b>" + formatoKg(anterior.kg) + " kg × " + anterior.reps + "</b> (" + anterior.n + " series) · " + haceCuanto(anterior.fecha)
        : "Sin registro todavía") +
      "</p></div>" +
      '<span class="chip sin-encoger">' + GRUPOS[ejercicio.grupo].ic + "</span></div>";

    // Las series que ya se anotaron hoy. Si una supera el récord, dice RÉCORD.
    if (entrada.series.length) {
      html += '<ul class="series">';
      entrada.series.forEach((serie, j) => {
        const esRecord = marcas[entrada.ej] ? serie.kg > marcas[entrada.ej].kg : serie.kg > 0;
        html +=
          '<li><span class="n">Serie ' + (j + 1) + '</span><span class="v">' + formatoKg(serie.kg) + " kg × " + serie.reps + "</span>" +
          (esRecord ? '<span class="pr">RÉCORD</span>' : "") +
          '<button class="quitar" data-act="quitarSerie" data-v="' + i + '" data-j="' + j + '" aria-label="Quitar serie">✕</button></li>';
      });
      html += "</ul>";
    }

    // Las casillas empiezan con la última serie de hoy, o con la de la vez pasada
    const ultimaSerie = entrada.series[entrada.series.length - 1];
    const kgSugerido = ultimaSerie ? ultimaSerie.kg : anterior ? anterior.kg : "";
    const repsSugeridas = ultimaSerie ? ultimaSerie.reps : anterior ? anterior.reps : "";

    html +=
      '<div class="captura">' +
      '<div><div class="cap-tit">Peso (kg)</div><div class="paso">' +
      '<button data-act="menos" data-t="kg" data-v="' + i + '" aria-label="Menos peso">–</button>' +
      '<input class="crece" type="number" min="0" inputmode="decimal" step="0.5" id="s_kg_' + i + '" value="' + kgSugerido + '" placeholder="0">' +
      '<button data-act="mas" data-t="kg" data-v="' + i + '" aria-label="Más peso">+</button>' +
      "</div></div>" +
      '<div><div class="cap-tit">Repeticiones</div><div class="paso">' +
      '<button data-act="menos" data-t="rp" data-v="' + i + '" aria-label="Menos reps">–</button>' +
      '<input class="crece" type="number" min="0" inputmode="numeric" id="s_rp_' + i + '" value="' + repsSugeridas + '" placeholder="0">' +
      '<button data-act="mas" data-t="rp" data-v="' + i + '" aria-label="Más reps">+</button>' +
      "</div></div></div>" +
      '<button class="btn chico fantasma ancho-completo sin-margen arriba-8" data-act="agregarSerie" data-v="' + i + '">+ Anotar serie</button>' +
      "</div>";
  });

  const series = contarSeries(borrador.entradas);
  html +=
    '<button class="btn btn-otro" data-act="otroEjercicio">⚠ OTRO ⚠<small>Solo para casos especiales: una máquina nueva o algo que no está en tu plan</small></button>' +
    '<button class="btn" data-act="guardarSesion"' + (series ? "" : " disabled") + ">Guardar entrenamiento (" + series + " series)</button>" +
    '<button class="btn peligro" data-act="tirarBorrador">Tirar este registro</button>';
  hoja.innerHTML = html;
}
