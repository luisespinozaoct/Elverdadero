/* =================================================================
   ACCIONES: QUÉ PASA AL TOCAR CADA BOTÓN
   -----------------------------------------------------------------
   En lugar de ponerle un "escucha" a cada botón, hay uno solo para
   toda la página. Cada botón dice qué hace con dos atributos:
     data-act = la acción ("guardarSesion", "tab", "avatar"...)
     data-v   = un dato extra (qué pestaña, qué avatar...)
   La tabla ACCIONES de abajo relaciona cada acción con su función.
   ================================================================= */
"use strict";

/* Cambia de paso en el alta y redibuja */
function irAlPaso(paso) {
  estado.paso = paso;
  guardar();
  pintarPantalla();
  window.scrollTo(0, 0);
}

/* Lee un número de una casilla. Vacía o inválida = 0. */
function numeroDe(idCasilla) {
  const casilla = document.getElementById(idCasilla);
  return Number((casilla && casilla.value) || 0);
}

/* Arma los días del plan a partir de grupos musculares, con los
   ejercicios sugeridos de cada grupo ya marcados */
function armarPlan(dias) {
  return dias.map((dia, i) => ({
    id: "d" + (i + 1),
    nombre: dia.nombre,
    grupos: dia.grupos,
    ejercicios: dia.grupos.flatMap((grupo) => SUGERIDOS[grupo] || []),
  }));
}

/* ---------- Alta ---------- */

function elegirTipoDeRutina(tipo) {
  estado.tmp.tipo = tipo;
  if (tipo === "preset") {
    estado.plan = armarPlan(RUTINAS_PRECREADAS);
    estado.paso = "ejercicios";
  } else {
    estado.tmp.dias = [{ grupos: [] }];
    estado.paso = "manual";
  }
  guardar();
  pintarPantalla();
}

function marcarGrupoDelDia(numeroDia, grupo) {
  const grupos = estado.tmp.dias[numeroDia].grupos;
  const posicion = grupos.indexOf(grupo);
  if (posicion >= 0) grupos.splice(posicion, 1);
  else grupos.push(grupo);
  guardar();
  pintarPantalla();
}

/* Pasa los días armados a mano al plan (los días vacíos se descartan) */
function confirmarRutinaManual() {
  const diasConGrupos = estado.tmp.dias
    .filter((dia) => dia.grupos.length)
    .map((dia) => ({ nombre: dia.grupos.map((grupo) => GRUPOS[grupo].nombre).join(" y "), grupos: dia.grupos }));
  estado.plan = armarPlan(diasConGrupos);
  estado.paso = "ejercicios";
  guardar();
  pintarPantalla();
}

/* El punto de partida se guarda como una primera sesión, marcada con
   base: true. Solo cuentan los ejercicios con peso y repeticiones. */
function guardarPuntoDePartida() {
  const entradas = [];
  estado.plan.forEach((dia) => {
    dia.ejercicios.forEach((id) => {
      const kg = numeroDe("b_kg_" + id);
      const reps = numeroDe("b_rp_" + id);
      if (kg > 0 && reps > 0) entradas.push({ ej: id, series: [{ kg: kg, reps: reps }] });
    });
  });
  if (entradas.length) {
    estado.sesiones.push({
      id: "s" + Date.now(),
      fecha: hoyISO(),
      hora: horaAhora(),
      diaId: estado.plan[0].id,
      entradas: entradas,
      base: true,
    });
  }
  irAlPaso("perfil");
}

/* Lee el apodo, la edad y el entrenador de las casillas. "prefijo" es
   "p" en el alta y "a" en Ajustes (así se llaman las casillas). */
function leerPerfil(prefijo) {
  estado.perfil.nick = document.getElementById(prefijo + "_nick").value.trim() || "El Verdadero";
  estado.perfil.edad = document.getElementById(prefijo + "_edad").value || "";
  estado.perfil.entrenador = document.getElementById(prefijo + "_ent").value.trim();
}

function terminarAlta() {
  leerPerfil("p");
  const pesoCorporal = numeroDe("p_peso");
  if (pesoCorporal > 0) estado.pesos.push({ fecha: hoyISO(), kg: pesoCorporal });
  estado.paso = "listo";
  estado.tab = "workout";
  revisarLogros();
  guardar();
  vista = { n: "", p: null };
  pintarPantalla();
}

/* Marca o desmarca un ejercicio de un día del plan */
function marcarEjercicioDelPlan(numeroDia, idEjercicio, accion) {
  const ejercicios = estado.plan[numeroDia].ejercicios;
  const posicion = ejercicios.indexOf(idEjercicio);
  if (posicion >= 0) ejercicios.splice(posicion, 1);
  else ejercicios.push(idEjercicio);
  guardar();

  // La casilla ya cambió sola. En el alta además se actualiza el total del botón.
  if (accion === "toggleEj") {
    const total = totalEjerciciosDelPlan();
    const boton = document.querySelector('[data-act="paso"][data-v="base"]');
    if (boton) {
      boton.disabled = !total;
      boton.textContent = "Continuar (" + total + " ejercicios)";
    }
  }
}

/* ---------- Sesión de entrenamiento ---------- */

/* Abre la libreta de un día. Si ya había un borrador de ese mismo día,
   se sigue con él; si no, se empieza uno nuevo. */
function abrirSesion(idDia) {
  if (!estado.borrador || estado.borrador.diaId !== idDia) {
    estado.borrador = {
      diaId: idDia,
      fecha: hoyISO(),
      entradas: buscarDia(idDia).ejercicios.map((id) => ({ ej: id, series: [] })),
    };
  }
  guardar();
  irA("sesion");
}

/* Botones + y −: el peso sube de 2.5 en 2.5 kg, las repeticiones de 1 en 1 */
function cambiarCasilla(boton, sube) {
  const esPeso = boton.dataset.t === "kg";
  const casilla = document.getElementById((esPeso ? "s_kg_" : "s_rp_") + boton.dataset.v);
  const paso = esPeso ? 2.5 : 1;
  const nuevo = Math.max(0, Number(casilla.value || 0) + (sube ? paso : -paso));
  casilla.value = esPeso ? formatoKg(nuevo) : Math.round(nuevo);
}

/* Anota una serie con lo que hay en las casillas de ese ejercicio */
function agregarSerie(posicion) {
  const kg = Math.max(0, numeroDe("s_kg_" + posicion));
  const reps = Math.max(0, numeroDe("s_rp_" + posicion));
  if (reps <= 0) {
    document.getElementById("s_rp_" + posicion).focus();
    return;
  }
  estado.borrador.fecha = document.getElementById("f_fecha").value || hoyISO();
  estado.borrador.entradas[posicion].series.push({ kg: kg, reps: reps });
  guardar();
  pantallaSesion();
  const tarjeta = document.querySelectorAll(".ej")[posicion];
  if (tarjeta) tarjeta.scrollIntoView({ block: "center", behavior: "smooth" });
}

function quitarSerie(posicionEjercicio, posicionSerie) {
  estado.borrador.entradas[posicionEjercicio].series.splice(posicionSerie, 1);
  guardar();
  pantallaSesion();
}

/* Guarda la sesión. Si rompiste un récord, muestra la tarjeta para
   presumirlo; si no, un aviso de "Guardado". También avisa de logros. */
function guardarSesion() {
  const marcasAntes = maximos();
  const entradas = estado.borrador.entradas.filter((entrada) => entrada.series.length);
  if (!entradas.length) return;

  const sesion = {
    id: "s" + Date.now(),
    fecha: estado.borrador.fecha || hoyISO(),
    hora: horaAhora(),
    diaId: estado.borrador.diaId,
    entradas: entradas,
  };
  estado.sesiones.push(sesion);
  // Se ordenan por fecha, por si se registró un entrenamiento de días atrás
  estado.sesiones.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  estado.borrador = null;
  const logrosNuevos = revisarLogros();
  guardar();

  // ¿Rompiste algún récord? Me quedo con el que más subió.
  let mejorRecord = null;
  entradas.forEach((entrada) => {
    entrada.series.forEach((serie) => {
      const antes = marcasAntes[entrada.ej] ? marcasAntes[entrada.ej].kg : 0;
      const subio = serie.kg - antes;
      if (serie.kg > antes && (!mejorRecord || subio > mejorRecord.subio)) {
        mejorRecord = { ej: entrada.ej, kg: serie.kg, reps: serie.reps, subio: subio, antes: antes };
      }
    });
  });

  estado.tab = "workout";
  vista = { n: "", p: null };
  pintarPantalla();

  // Solo es récord si ya había una marca anterior (la primera vez no cuenta)
  if (mejorRecord && mejorRecord.antes > 0) {
    mostrarTarjeta(() => ({
      titulo: "Récord personal",
      grande: tituloRecord(buscarEjercicio(mejorRecord.ej).nombre, mejorRecord.kg, mejorRecord.reps),
      detalle: "Subiste " + formatoKg(mejorRecord.subio) + " kg desde tu marca anterior. " + equivalencia(mejorRecord.kg),
    }));
  } else {
    hoja.insertAdjacentHTML(
      "afterbegin",
      '<div class="aviso ok pop"><b>Guardado</b>' + formatoMiles(volumenSesion(sesion)) + " kg movidos el " + fechaCorta(sesion.fecha) + ".</div>",
    );
  }

  if (logrosNuevos.length) {
    const titulo = logrosNuevos.length === 1 ? "Logro desbloqueado" : logrosNuevos.length + " logros desbloqueados";
    hoja.insertAdjacentHTML(
      "afterbegin",
      '<div class="aviso dorado pop"><b>' + titulo + "</b>" +
        logrosNuevos.map((logro) => logro.icono + " " + escaparHtml(logro.nombre)).join(" · ") + "</div>",
    );
  }
  window.scrollTo(0, 0);
}

/* Botón OTRO: agrega a la sesión un ejercicio que no está en el catálogo */
function agregarOtroEjercicio() {
  if (document.getElementById("otro_form")) return;
  const opciones = Object.keys(GRUPOS)
    .map((grupo) => '<option value="' + grupo + '">' + GRUPOS[grupo].nombre + "</option>")
    .join("");
  document.querySelector(".btn-otro").insertAdjacentHTML(
    "afterend",
    '<div class="tarjeta" id="otro_form">' +
      '<label class="campo"><span>Nombre del ejercicio</span><input type="text" id="o_nom" placeholder="Ej: Prensa nueva horizontal"></label>' +
      '<label class="campo"><span>Grupo muscular</span><select id="o_gru">' + opciones + "</select></label>" +
      '<button class="btn chico ancho-completo sin-margen" id="o_ok">Agregar a esta sesión</button></div>',
  );

  document.getElementById("o_ok").addEventListener("click", () => {
    const nombre = document.getElementById("o_nom").value.trim();
    if (!nombre) {
      document.getElementById("o_nom").focus();
      return;
    }
    const id = "x" + Date.now(); // los ejercicios propios empiezan con "x"
    estado.propios.push({ id: id, nombre: nombre, grupo: document.getElementById("o_gru").value, meta: SIN_META, unidad: "kg", nivel: 0, req: null });
    estado.borrador.entradas.push({ ej: id, series: [] });
    guardar();
    pantallaSesion();
    const tarjetas = document.querySelectorAll(".ej");
    if (tarjetas.length) tarjetas[tarjetas.length - 1].scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

/* ---------- Usuario ---------- */

/* Anotar el peso corporal de hoy */
function anotarPesoCorporal() {
  if (document.getElementById("peso_form")) return;
  hoja.insertAdjacentHTML(
    "afterbegin",
    '<div class="tarjeta pop" id="peso_form"><label class="campo"><span>Tu peso corporal hoy (kg)</span>' +
      '<input type="number" min="0" inputmode="decimal" id="pc_kg" placeholder="78"></label>' +
      '<button class="btn chico ancho-completo sin-margen" id="pc_ok">Guardar</button></div>',
  );
  document.getElementById("pc_kg").focus();
  document.getElementById("pc_ok").addEventListener("click", () => {
    const kg = numeroDe("pc_kg");
    if (kg > 0) {
      estado.pesos.push({ fecha: hoyISO(), kg: kg });
      revisarLogros();
      guardar();
    }
    irA("");
  });
}

function guardarAjustes() {
  leerPerfil("a");
  guardar();
  irA("");
}

/* Restaurar: el usuario pega el texto de su respaldo y reemplaza todo */
function pedirRespaldo(boton) {
  if (document.getElementById("rest_form")) return;
  boton.insertAdjacentHTML(
    "afterend",
    '<div class="tarjeta" id="rest_form"><p class="mini">Pega aquí tu respaldo. Esto reemplaza todo lo que tienes ahora.</p>' +
      '<textarea id="r_json" placeholder="Pega el texto del respaldo"></textarea>' +
      '<button class="btn chico peligro ancho-completo sin-margen arriba-8" id="r_ok">Reemplazar mis datos</button></div>',
  );
  document.getElementById("r_ok").addEventListener("click", () => {
    let datos = null;
    try {
      datos = completarEstado(JSON.parse(document.getElementById("r_json").value));
    } catch (error) {
      datos = null; // el texto no es un respaldo válido
    }
    if (!datos) {
      document.getElementById("r_ok").textContent = "Ese texto no se pudo leer. Revisa que esté completo.";
      return;
    }
    estado = datos;
    guardar();
    irAlInicioDeLaPestana();
  });
}

/* Borrar todo pide confirmación: el primer toque cambia el texto del
   botón y solo el segundo borra. */
function borrarTodo(boton) {
  if (boton.dataset.seguro === "1") {
    estado = estadoNuevo();
    guardar();
    irAlInicioDeLaPestana();
    return;
  }
  boton.dataset.seguro = "1";
  boton.textContent = "Toca otra vez para borrar TODO (no se puede deshacer)";
}

/* ---------- La tabla de acciones ----------
   Cada función recibe el botón tocado (boton) y su data-v (valor). */
const ACCIONES = {
  // Navegación
  tab: (boton, valor) => {
    estado.tab = valor;
    vista = { n: "", p: null };
    guardar();
    pintarPantalla();
    window.scrollTo(0, 0);
  },
  volver: (boton, valor) => {
    if (estado.paso !== "listo") return irAlPaso(valor);
    // "usuario" y "workout" son las pantallas principales de su pestaña
    if (valor === "usuario" || valor === "workout") irAlInicioDeLaPestana();
    else irA(valor);
  },
  ver: (boton, valor) => irA(valor),
  paso: (boton, valor) => irAlPaso(valor),

  // Alta
  modo: (boton, valor) => {
    estado.modo = valor;
    estado.paso = "tipo";
    guardar();
    pintarPantalla();
  },
  tipo: (boton, valor) => elegirTipoDeRutina(valor),
  agregarDia: () => {
    estado.tmp.dias.push({ grupos: [] });
    guardar();
    pintarPantalla();
  },
  quitarDia: (boton, valor) => {
    estado.tmp.dias.splice(Number(valor), 1);
    guardar();
    pintarPantalla();
  },
  toggleGrupo: (boton, valor) => marcarGrupoDelDia(Number(valor), boton.dataset.g),
  confirmarManual: () => confirmarRutinaManual(),
  guardarBase: () => guardarPuntoDePartida(),
  avatar: (boton, valor) => {
    estado.perfil.avatar = valor;
    guardar();
    pintarPantalla();
  },
  terminarAlta: () => terminarAlta(),
  demo: () => generarEjemplo(),
  toggleEj: (boton, valor) => marcarEjercicioDelPlan(Number(valor), boton.dataset.e, "toggleEj"),
  togglePlan: (boton, valor) => marcarEjercicioDelPlan(Number(valor), boton.dataset.e, "togglePlan"),

  // Sesión
  irElegirDia: () => irA("elegirDia"),
  seguirBorrador: () => irA("sesion"),
  abrirSesion: (boton, valor) => abrirSesion(valor),
  cambiarFecha: () => {}, // la fecha se guarda al cambiarla (ver abajo, evento "change")
  mas: (boton) => cambiarCasilla(boton, true),
  menos: (boton) => cambiarCasilla(boton, false),
  agregarSerie: (boton, valor) => agregarSerie(Number(valor)),
  quitarSerie: (boton, valor) => quitarSerie(Number(valor), Number(boton.dataset.j)),
  otroEjercicio: () => agregarOtroEjercicio(),
  tirarBorrador: () => {
    estado.borrador = null;
    guardar();
    irA("");
  },
  guardarSesion: () => guardarSesion(),

  // Usuario
  mapaGrupo: (boton, valor) => {
    nodoSeleccionado = null;
    irA("mapa", valor);
  },
  nodo: (boton, valor) => seleccionarNodo(valor),
  verNombres: () => {
    estado.verNombres = !estado.verNombres;
    guardar();
    irA("mapa", vista.p || "pierna");
  },
  pesarme: () => anotarPesoCorporal(),
  guardarAjustes: () => guardarAjustes(),
  copiarJson: (boton) => copiarAlPortapapeles(JSON.stringify(estado), boton),
  copiarTexto: (boton, valor) => copiarAlPortapapeles(valor.replace(/¶/g, "\n"), boton),
  pedirRestaurar: (boton) => pedirRespaldo(boton),
  borrarTodo: (boton) => borrarTodo(boton),

  // Tarjeta para compartir
  cerrarCartel: () => pintarPantalla(),
  otraVersion: () => pintarTarjeta(),
  compartirRecord: (boton, valor) => tarjetaDeRecord(valor),
  compartirSemana: () => tarjetaDeSemana(),
};

/* El único escucha de clics de toda la app */
document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-act]");
  if (!boton) return;
  const accion = ACCIONES[boton.dataset.act];
  if (accion) accion(boton, boton.dataset.v);
});

/* Ninguna casilla de número acepta negativos: no existe hacer -4 repeticiones */
document.addEventListener("input", (evento) => {
  const casilla = evento.target;
  if (casilla && casilla.type === "number" && casilla.value.includes("-")) {
    casilla.value = casilla.value.replace(/-/g, "");
  }
});

/* Si llegas a un nodo del mapa con el teclado, se marca igual que al tocarlo */
document.addEventListener("focusin", (evento) => {
  const nodo = evento.target.closest ? evento.target.closest('[data-act="nodo"]') : null;
  if (nodo) seleccionarNodo(nodo.dataset.v);
});

/* La fecha de la sesión se guarda en el borrador en cuanto se cambia */
document.addEventListener("change", (evento) => {
  if (evento.target.id === "f_fecha" && estado.borrador) {
    estado.borrador.fecha = evento.target.value || hoyISO();
    guardar();
  }
});
