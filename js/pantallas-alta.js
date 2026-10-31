/* =================================================================
   PANTALLAS DEL ALTA (la primera vez que se abre la app)
   -----------------------------------------------------------------
   El alta va en este orden:
     bienvenida → modo → tipo de rutina → (días manuales) →
     ejercicios → punto de partida → perfil → ¡listo!
   En qué paso va el usuario se guarda en estado.paso.
   ================================================================= */
"use strict";

/* Los avatares que se pueden elegir (en el alta y en Ajustes) */
const AVATARES = ["🦍", "🐺", "🐂", "🦅", "🐅", "🦏", "🐻", "🦈", "🐍", "🦌", "🐗", "🦬"];

/* La fila de botones para elegir avatar, con el actual marcado */
function botonesAvatar() {
  return AVATARES.map(
    (avatar) =>
      '<button class="opcion avatar' + (estado.perfil.avatar === avatar ? " activa" : "") +
      '" data-act="avatar" data-v="' + avatar + '">' + avatar + "</button>",
  ).join("");
}

/* Un botón por grupo muscular, que se marca y desmarca al tocarlo */
function chipGrupo(grupo, elegido, atributos) {
  return (
    '<button class="chip chip-elegible' + (elegido ? " elegido" : "") + '" ' + atributos + ">" +
    GRUPOS[grupo].ic + " " + GRUPOS[grupo].nombre + "</button>"
  );
}

/* Elige qué pantalla del alta dibujar */
function pintarAlta() {
  barraPestanas.hidden = true;
  const pantallas = {
    bienvenida: altaBienvenida,
    modo: altaModo,
    tipo: altaTipo,
    manual: altaManual,
    ejercicios: altaEjercicios,
    base: altaBase,
    perfil: altaPerfil,
  };
  if (pantallas[estado.paso]) pantallas[estado.paso]();
}

function altaBienvenida() {
  cabecera("El Verdadero");
  hoja.innerHTML =
    '<h2 class="titulo">Tu libreta<br>del gimnasio</h2>' +
    '<p class="sub">Anota cada serie: peso, repeticiones y fecha. En unos meses la gráfica te dice la verdad, no tu memoria.</p>' +
    '<div class="tarjeta rayada margen">' +
    '<p class="sin-margen abajo-6"><b>Lo que hace:</b></p>' +
    '<p class="mini sin-margen">Te recuerda con cuánto entrenaste la vez pasada, dibuja tu progreso por grupo muscular y guarda tus récords en una sala de trofeos. Todo se queda en este teléfono.</p>' +
    "</div>" +
    '<button class="btn" data-act="paso" data-v="modo">Empezar</button>' +
    '<button class="btn fantasma" data-act="demo">Ver un ejemplo con 10 semanas llenas</button>' +
    '<p class="mini centro">El ejemplo lo puedes borrar después con un botón.</p>';
}

function altaModo() {
  cabecera("¿Cómo lo usarás?", "bienvenida");
  hoja.innerHTML =
    '<h2 class="titulo">¿Cómo lo usarás?</h2>' +
    '<p class="sub">Esto no se puede cambiar a medias después, así que elige con calma.</p>' +
    '<button class="opcion" data-act="modo" data-v="individual"><b>Individual</b><span>Haces tu propio plan y llevas tus propios números.</span></button>' +
    '<button class="opcion" disabled><b>Entrenador</b><span>Para medir el progreso, las métricas y los pesos de tus alumnos en asesorías en línea. <span class="chip">Próximamente</span></span></button>';
}

function altaTipo() {
  cabecera("Tu plan", "modo");
  hoja.innerHTML =
    '<h2 class="titulo">¿Cómo armas tu rutina?</h2>' +
    '<p class="sub">Primero defines qué músculos trabajas juntos. Después eliges los ejercicios.</p>' +
    '<button class="opcion" data-act="tipo" data-v="preset"><b>Pre-creado</b><span>La división de siempre: pecho/hombro/tríceps · espalda/bíceps/trapecio · pierna completa.</span></button>' +
    '<button class="opcion" data-act="tipo" data-v="manual"><b>Manual</b><span>Tú decides qué músculos van juntos cada día.</span></button>' +
    '<div class="aviso"><b>Piénsalo bien</b>Para progresar necesitas sostener el mismo plan al menos 3 o 4 meses. Si lo cambias cada rato, las gráficas no te van a decir nada.</div>';
}

/* Rutina manual: el usuario arma cada día eligiendo grupos musculares */
function altaManual() {
  cabecera("Arma tus días", "tipo");
  const dias = estado.tmp.dias;
  let html = '<h2 class="titulo">Arma tus días</h2>' + '<p class="sub">Agrupa los músculos que vas a trabajar en la misma sesión.</p>';

  dias.forEach((dia, i) => {
    html +=
      '<div class="tarjeta"><div class="fila abajo-8">' +
      '<b class="crece dia-titulo">Día ' + (i + 1) + "</b>" +
      '<button class="quitar" data-act="quitarDia" data-v="' + i + '" aria-label="Quitar día">✕</button></div>' +
      "<div>" +
      Object.keys(GRUPOS)
        .map((grupo) =>
          chipGrupo(grupo, dia.grupos.includes(grupo), 'data-act="toggleGrupo" data-v="' + i + '" data-g="' + grupo + '"'),
        )
        .join("") +
      "</div></div>";
  });

  const algunDiaTieneGrupos = dias.some((dia) => dia.grupos.length);
  html +=
    '<button class="btn fantasma" data-act="agregarDia">+ Agregar otro día</button>' +
    '<div class="aviso"><b>Piénsalo bien</b>Vas a sostener este plan 3 o 4 meses. Es lo que tarda en notarse el progreso real.</div>' +
    '<button class="btn" data-act="confirmarManual"' + (algunDiaTieneGrupos ? "" : " disabled") + ">Continuar</button>";
  hoja.innerHTML = html;
}

/* Elegir los ejercicios de cada día, entre los del catálogo */
function altaEjercicios() {
  cabecera("Tus ejercicios", "tipo");
  let html =
    '<h2 class="titulo">¿Qué ejercicios harás?</h2>' +
    '<p class="sub">Marca los que de verdad hay en tu gimnasio. Puedes agregar otros después.</p>';

  estado.plan.forEach((dia, i) => {
    html += '<div class="rotulo">Día ' + (i + 1) + ": " + escaparHtml(dia.nombre) + "</div>";
    dia.grupos.forEach((grupo) => {
      html += '<div class="tarjeta"><div class="fila abajo-4"><span class="chip">' + GRUPOS[grupo].ic + " " + GRUPOS[grupo].nombre + "</span></div>";
      CATALOGO.filter((e) => e.grupo === grupo).forEach((ejercicio) => {
        const marcado = dia.ejercicios.includes(ejercicio.id);
        html +=
          '<label class="chk"><input type="checkbox" data-act="toggleEj" data-v="' + i + '" data-e="' + ejercicio.id + '"' +
          (marcado ? " checked" : "") + ">" + '<span class="nom">' + escaparHtml(ejercicio.nombre) + "</span></label>";
      });
      html += "</div>";
    });
  });

  const total = totalEjerciciosDelPlan();
  html += '<button class="btn" data-act="paso" data-v="base"' + (total ? "" : " disabled") + ">Continuar (" + total + " ejercicios)</button>";
  hoja.innerHTML = html;
}

/* Cuántos ejercicios tiene el plan, sumando todos los días */
function totalEjerciciosDelPlan() {
  return estado.plan.reduce((total, dia) => total + dia.ejercicios.length, 0);
}

/* Punto de partida: con cuánto entrena hoy en cada ejercicio */
function altaBase() {
  cabecera("Tu punto de partida", "ejercicios");
  let html =
    '<h2 class="titulo">¿Con cuánto entrenas hoy?</h2>' +
    '<p class="sub">Anota tu peso actual aproximado en cada ejercicio. Esto es la línea de salida: sin ella, la primera gráfica no tiene con qué compararse. Si no sabes uno, déjalo vacío.</p>';

  estado.plan.forEach((dia) => {
    html += '<div class="rotulo">' + escaparHtml(dia.nombre) + '</div><div class="tarjeta">';
    dia.ejercicios.forEach((id) => {
      const nombre = escaparHtml(buscarEjercicio(id).nombre);
      html +=
        '<div class="renglon-base">' +
        '<div class="nombre-base">' + nombre + "</div>" +
        '<div class="captura">' +
        '<input type="number" min="0" inputmode="decimal" placeholder="kg" id="b_kg_' + id + '" aria-label="Peso en ' + nombre + '">' +
        '<input type="number" min="0" inputmode="numeric" placeholder="reps" id="b_rp_' + id + '" aria-label="Repeticiones en ' + nombre + '">' +
        "</div></div>";
    });
    html += "</div>";
  });

  html +=
    '<button class="btn" data-act="guardarBase">Guardar mi punto de partida</button>' +
    '<button class="btn gris" data-act="paso" data-v="perfil">Saltar por ahora</button>';
  hoja.innerHTML = html;
}

/* Perfil: apodo, edad, peso, entrenador y avatar */
function altaPerfil() {
  cabecera("Tu perfil", "base");
  const perfil = estado.perfil;
  hoja.innerHTML =
    '<h2 class="titulo">¿Quién entrena?</h2>' +
    '<p class="sub">El apodo es el que aparece cuando compartes tus récords.</p>' +
    '<label class="campo"><span>Apodo</span><input type="text" id="p_nick" maxlength="20" placeholder="El Verdadero" value="' + escaparHtml(perfil.nick) + '"></label>' +
    '<label class="campo"><span>Edad</span><input type="number" min="0" inputmode="numeric" id="p_edad" placeholder="25" value="' + escaparHtml(perfil.edad) + '"></label>' +
    '<label class="campo"><span>Peso corporal de hoy (kg)</span><input type="number" min="0" inputmode="decimal" id="p_peso" placeholder="78"></label>' +
    '<label class="campo"><span>Entrenador (opcional)</span><input type="text" id="p_ent" placeholder="Nombre de tu coach" value="' + escaparHtml(perfil.entrenador) + '"></label>' +
    '<div class="rotulo">Tu avatar</div>' +
    '<div class="fila junta">' + botonesAvatar() + "</div>" +
    '<button class="btn arriba-16" data-act="terminarAlta">Entrar a mi libreta</button>';
}
