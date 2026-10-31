/* =================================================================
   PESTAÑA 3: USUARIO
   -----------------------------------------------------------------
   - pantallaUsuario:  perfil, peso, kilos totales, calendario y récords
   - pantallaTrofeos:  la sala de trofeos (los 56 logros)
   - pantallaMapa:     el mapa de ejercicios (ver mapa.js)
   - pantallaVerPlan:  agregar o quitar ejercicios de cada día
   - pantallaAjustes:  editar perfil, respaldo y borrar todo
   ================================================================= */
"use strict";

function pantallaUsuario() {
  cabecera("Usuario");
  const est = calcularEstadisticas();
  const perfil = estado.perfil;
  const logrosDesbloqueados = Object.keys(estado.logros).length;
  const ultimoPeso = estado.pesos.length ? estado.pesos[estado.pesos.length - 1] : null;
  const tresMejores = Object.keys(est.maximos)
    .map((id) => ({ id: id, kg: est.maximos[id].kg }))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, 3);

  // Tarjeta del perfil
  let html =
    '<div class="tarjeta"><div class="fila">' +
    '<div class="avatar-grande">' + escaparHtml(perfil.avatar) + "</div>" +
    '<div class="crece"><div class="apodo">' + escaparHtml(perfil.nick || "Sin apodo") + "</div>" +
    '<div class="mini">' + (perfil.edad ? escaparHtml(perfil.edad) + " años · " : "") + estado.sesiones.length + " entrenamientos" +
    (perfil.entrenador ? " · coach: " + escaparHtml(perfil.entrenador) : "") + "</div></div>" +
    '<button class="btn chico gris sin-margen" data-act="ver" data-v="ajustes">Editar</button>' +
    "</div></div>";

  // Peso corporal y kilos totales
  html +=
    '<div class="fila junta abajo-12">' +
    '<div class="tarjeta crece centro sin-margen"><div class="mini">Peso corporal</div>' +
    '<div class="num numero-display">' + (ultimoPeso ? formatoKg(ultimoPeso.kg) + " kg" : "—") + "</div>" +
    '<button class="btn chico fantasma sin-margen arriba-6" data-act="pesarme">Anotar hoy</button></div>' +
    '<div class="tarjeta crece centro sin-margen"><div class="mini">Kilos movidos en total</div>' +
    '<div class="num numero-display">' + formatoMiles(est.kilosTotales) + "</div>" +
    '<div class="mini">' + (est.kilosTotales > 0 ? formatoKg(est.kilosTotales / 1000) + " toneladas" : "desde que empezaste") + "</div></div>" +
    "</div>";

  // Calendario del mes
  html += '<div class="rotulo">Días que entrenaste este mes</div><div class="tarjeta">' + calendarioDelMes() + "</div>";

  // Los tres récords más pesados
  html += '<div class="rotulo">Tus récords personales</div>';
  if (!tresMejores.length || !tresMejores[0].kg) {
    html += '<p class="nada">Cuando registres pesos aparecerán aquí tus marcas más altas.</p>';
  } else {
    tresMejores.forEach((record) => {
      html +=
        '<div class="tarjeta"><div class="fila">' +
        '<div class="crece"><b>' + escaparHtml(buscarEjercicio(record.id).nombre) + '</b><div class="mini num">' + formatoKg(record.kg) + " kg</div></div>" +
        '<button class="btn chico fantasma sin-margen" data-act="compartirRecord" data-v="' + record.id + '">Compartir</button></div></div>';
    });
  }

  // Accesos a las demás pantallas
  html +=
    '<div class="rotulo">Tu colección</div>' +
    '<button class="opcion" data-act="ver" data-v="trofeos"><b>🏅 Sala de trofeos</b><span>' + logrosDesbloqueados + " de " + LOGROS.length + " logros desbloqueados</span></button>" +
    '<button class="opcion" data-act="ver" data-v="mapa"><b>🕸️ Mapa de ejercicios</b><span>Tu telaraña: de lo básico a lo pesado, grupo por grupo</span></button>' +
    '<button class="opcion" data-act="ver" data-v="plan"><b>📋 Mi plan</b><span>' + estado.plan.length + " días · ver y agregar ejercicios</span></button>" +
    '<button class="opcion" data-act="ver" data-v="ajustes"><b>⚙️ Ajustes y respaldo</b><span>Apodo, avatar, copia de seguridad</span></button>';
  hoja.innerHTML = html;
}

/* Calendario del mes actual, con los días entrenados marcados.
   La semana empieza en lunes. */
function calendarioDelMes() {
  const hoy = new Date();
  const anio = hoy.getFullYear(), mes = hoy.getMonth();
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const huecosAlInicio = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes = 0

  const entrenados = {};
  estado.sesiones.forEach((sesion) => {
    const fecha = new Date(sesion.fecha + "T12:00:00");
    if (fecha.getFullYear() === anio && fecha.getMonth() === mes) entrenados[fecha.getDate()] = true;
  });

  let html = '<div class="cal">' + ["L", "M", "M", "J", "V", "S", "D"].map((letra) => '<div class="dow">' + letra + "</div>").join("");
  for (let i = 0; i < huecosAlInicio; i++) html += '<div class="d vacio"></div>';
  for (let dia = 1; dia <= diasDelMes; dia++) {
    const clases = "d" + (entrenados[dia] ? " hecho" : "") + (dia === hoy.getDate() ? " hoy" : "");
    html += '<div class="' + clases + '">' + dia + "</div>";
  }
  html += '</div><p class="mini centro sin-margen arriba-10">' + Object.keys(entrenados).length + " días este mes</p>";
  return html;
}

function pantallaTrofeos() {
  cabecera("Sala de trofeos", "usuario");
  const desbloqueados = Object.keys(estado.logros).length;
  let html =
    '<h2 class="titulo">Sala de trofeos</h2><p class="sub">' + desbloqueados + " de " + LOGROS.length +
    ' desbloqueados. Se quedan para siempre.</p><div class="trofeos">';
  LOGROS.forEach((logro) => {
    const fecha = estado.logros[logro.id];
    html +=
      '<div class="trofeo' + (fecha ? " on" : "") + (logro.tipo === "jamas" ? " jamas" : "") + '">' +
      '<div class="ic">' + logro.icono + '</div><div class="nm">' + escaparHtml(logro.nombre) + "</div>" +
      '<div class="ds">' + escaparHtml(logro.descripcion) + "</div>" +
      (fecha ? '<div class="mini num arriba-4">' + fechaCorta(fecha) + "</div>" : "") +
      "</div>";
  });
  html += "</div>";
  hoja.innerHTML = html;
}

function pantallaMapa() {
  cabecera("Mapa de ejercicios", "usuario");
  const grupoActual = vista.p || "pierna";
  let html =
    '<h2 class="titulo">Mapa de ejercicios</h2>' +
    '<p class="sub">Cada nodo se enciende cuando llegas al peso que pide. Arranca en el centro y avanza hacia la derecha. Desliza el mapa con el dedo.</p>' +
    '<div class="fila abajo-12">';
  Object.keys(GRUPOS).forEach((grupo) => {
    html += chipGrupo(grupo, grupo === grupoActual, 'data-act="mapaGrupo" data-v="' + grupo + '"');
  });
  html +=
    '</div><div id="cajaMapa">' + mapaEjercicios(grupoActual) + "</div>" +
    '<div class="tarjeta" id="detalleNodo">' + detalleNodo() + "</div>";
  hoja.innerHTML = html;
}

/* Mi plan: aquí se pueden marcar o desmarcar ejercicios de cada día */
function pantallaVerPlan() {
  cabecera("Mi plan", "usuario");
  let html = '<h2 class="titulo">Mi plan</h2><p class="sub">Agrega ejercicios cuando tu gimnasio tenga algo nuevo. No cambies los días cada semana.</p>';
  estado.plan.forEach((dia, i) => {
    html += '<div class="rotulo">' + escaparHtml(dia.nombre) + '</div><div class="tarjeta">';
    dia.grupos.forEach((grupo) => {
      html += '<div class="fila separado-6"><span class="chip">' + GRUPOS[grupo].ic + " " + GRUPOS[grupo].nombre + "</span></div>";
      todosLosEjercicios()
        .filter((e) => e.grupo === grupo)
        .forEach((ejercicio) => {
          html +=
            '<label class="chk"><input type="checkbox" data-act="togglePlan" data-v="' + i + '" data-e="' + ejercicio.id + '"' +
            (dia.ejercicios.includes(ejercicio.id) ? " checked" : "") + ">" +
            '<span class="nom">' + escaparHtml(ejercicio.nombre) + "</span></label>";
        });
    });
    html += "</div>";
  });
  hoja.innerHTML = html;
}

function pantallaAjustes() {
  cabecera("Ajustes", "usuario");
  const perfil = estado.perfil;
  const textoBorrar = estado.ejemplo ? "Borrar el ejemplo y empezar de cero" : "Borrar todo y empezar de cero";
  hoja.innerHTML =
    '<h2 class="titulo">Ajustes</h2>' +
    '<label class="campo"><span>Apodo</span><input type="text" id="a_nick" maxlength="20" value="' + escaparHtml(perfil.nick) + '"></label>' +
    '<label class="campo"><span>Edad</span><input type="number" min="0" inputmode="numeric" id="a_edad" value="' + escaparHtml(perfil.edad) + '"></label>' +
    '<label class="campo"><span>Entrenador</span><input type="text" id="a_ent" value="' + escaparHtml(perfil.entrenador) + '"></label>' +
    '<div class="rotulo">Avatar</div><div class="fila junta">' + botonesAvatar() + "</div>" +
    '<button class="btn arriba-14" data-act="guardarAjustes">Guardar cambios</button>' +
    '<div class="rotulo">Copia de seguridad</div>' +
    '<p class="mini">Tus datos viven solo en este teléfono. Copia este texto y guárdalo en tus notas: con él puedes recuperar todo.</p>' +
    '<textarea id="a_json" readonly>' + escaparHtml(JSON.stringify(estado)) + "</textarea>" +
    '<button class="btn fantasma" data-act="copiarJson">Copiar mi respaldo</button>' +
    '<button class="btn gris" data-act="pedirRestaurar">Restaurar desde un respaldo</button>' +
    '<div class="rotulo">Zona de riesgo</div>' +
    '<button class="btn peligro" data-act="borrarTodo">' + textoBorrar + "</button>";
}
