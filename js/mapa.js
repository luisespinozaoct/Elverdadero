/* =================================================================
   MAPA DE EJERCICIOS (el "árbol de habilidades")
   -----------------------------------------------------------------
   Cada grupo muscular tiene su mapa. Los ejercicios básicos salen del
   centro y avanzan hacia la derecha hasta los más pesados, como en un
   videojuego. Un nodo se enciende cuando:
     1) alcanzas la meta de ese ejercicio, y
     2) el nodo anterior ya está encendido (regla de cadena).
   Al final de cada mapa está "Corazón sin daño", que nadie desbloquea.
   ================================================================= */
"use strict";

/* Colores del mapa. Siempre es oscuro, como pantalla de videojuego. */
const COLORES_MAPA = {
  oro: "#F2D35B", // nodo encendido
  oroTenue: "#8A7730", // línea de un nodo "trabado"
  gris: "#7C8CA0", // nodo que ya puedes intentar
  grisIcono: "#AEBCCC",
  apagado: "#303A47", // nodo bloqueado
  apagadoIcono: "#4C5A6B",
  fondoNodo: "#161C25",
  rojo: "#D4584E", // el corazón del final
};

/* Id especial del nodo "Corazón sin daño" */
const NODO_CORAZON = "__corazon";

/* El nodo que el usuario tocó (para mostrar su globo y su tarjeta) */
let nodoSeleccionado = null;

/* Dibujitos de cada nodo, según con qué se hace el ejercicio */
const GLIFOS = {
  barra: '<rect x="-11" y="-1.3" width="22" height="2.6" rx="1.3"></rect><rect x="-9.5" y="-5.5" width="2.8" height="11" rx="1"></rect><rect x="6.7" y="-5.5" width="2.8" height="11" rx="1"></rect>',
  mancuerna: '<rect x="-7" y="-1.3" width="14" height="2.6" rx="1.3"></rect><circle cx="-8.5" cy="0" r="4.2"></circle><circle cx="8.5" cy="0" r="4.2"></circle>',
  maquina: '<rect x="-9" y="-8.5" width="18" height="17" rx="2.5" fill="none" stroke-width="2"></rect><rect x="-4.5" y="-4.5" width="9" height="3" rx="1.2"></rect><rect x="-4.5" y="1.5" width="9" height="3" rx="1.2"></rect>',
  cable: '<circle cx="0" cy="-6.5" r="4" fill="none" stroke-width="2"></circle><path d="M0 -2.5 L0 4.5" fill="none" stroke-width="2"></path><rect x="-6.5" y="4.5" width="13" height="3" rx="1.5"></rect>',
  cuerpo: '<rect x="-10" y="-9.5" width="20" height="2.4" rx="1.2"></rect><circle cx="0" cy="-4" r="2.6"></circle><path d="M0 -1.4 L0 4.6 M0 0.6 L-4.2 7.2 M0 0.6 L4.2 7.2" fill="none" stroke-width="1.9" stroke-linecap="round"></path>',
  roto: '<path d="M0 7 C-9 0.5 -9 -7 -4 -7 C-1.5 -7 0 -4.6 0 -4.6 C0 -4.6 1.5 -7 4 -7 C9 -7 9 0.5 0 7 Z" fill="none" stroke-width="2"></path><path d="M-2 -6 L1.5 -1 L-1.5 1.5 L2 6" fill="none" stroke-width="1.8"></path>',
};

/* Elige el dibujito leyendo el nombre del ejercicio */
function glifoDe(nombre) {
  const n = nombre.toLowerCase();
  if (/dominada|lagartija|fondos en paralela|fondos en banca|fondos con lastre|elevación de piernas|rueda abdominal/.test(n)) {
    return "cuerpo";
  }
  if (/cable|polea|jalón|cuerda|face pull|pull over/.test(n)) return "cable";
  if (/barra|smith/.test(n)) return "barra";
  if (/mancuerna/.test(n)) return "mancuerna";
  return "maquina";
}

/* Parte un nombre largo en máximo dos renglones, para que quepa bajo el nodo */
function parteNombre(nombre, maxLetras) {
  const renglones = [];
  let actual = "";
  nombre.split(" ").forEach((palabra) => {
    if (!actual) actual = palabra;
    else if ((actual + " " + palabra).length <= maxLetras) actual = actual + " " + palabra;
    else {
      renglones.push(actual);
      actual = palabra;
    }
  });
  if (actual) renglones.push(actual);

  // Si salieron más de dos renglones, junto el resto en el segundo y lo corto con "…"
  if (renglones.length > 2) {
    const resto = renglones.slice(1).join(" ");
    renglones.length = 1;
    renglones.push(resto.length > maxLetras ? resto.slice(0, maxLetras - 1) + "…" : resto);
  }
  return renglones.map((r) => (r.length > maxLetras + 3 ? r.slice(0, maxLetras + 2) + "…" : r));
}

/* ¿Tu récord ya llega a la meta de este ejercicio? */
function cumpleMeta(ejercicio, marcas) {
  const marca = marcas[ejercicio.id];
  if (!marca) return false;
  return ejercicio.unidad === "reps" ? marca.reps >= ejercicio.meta : marca.kg >= ejercicio.meta;
}

/* Estado de un nodo:
   - "on"       encendido
   - "trabado"  ya cumpliste la meta, pero falta encender el anterior
   - "libre"    lo puedes intentar, aún no llegas a la meta
   - "apagado"  ni cumples la meta ni está listo el anterior
   "profundidad" evita que la cadena se busque infinitamente si un
   respaldo trae datos raros. */
function estadoNodo(id, marcas, profundidad = 0) {
  const ejercicio = buscarEjercicio(id);
  const anterior = ejercicio.req && profundidad < 12 ? buscarEjercicio(ejercicio.req) : null;
  const anteriorEncendido = !anterior || estadoNodo(anterior.id, marcas, profundidad + 1) === "on";
  if (cumpleMeta(ejercicio, marcas)) return anteriorEncendido ? "on" : "trabado";
  return anteriorEncendido ? "libre" : "apagado";
}

/* Línea en ángulo recto entre dos puntos (horizontal, vertical, horizontal) */
function lineaMapa(x1, y1, x2, y2, color, grosor) {
  const enMedio = (x1 + x2) / 2;
  return (
    '<path d="M' + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + enMedio.toFixed(1) + " " + y1.toFixed(1) +
    " L" + enMedio.toFixed(1) + " " + y2.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1) +
    '" fill="none" stroke="' + color + '" stroke-width="' + grosor + '" stroke-linejoin="round"></path>'
  );
}

/* Dibuja el mapa completo de un grupo muscular */
function mapaEjercicios(grupo) {
  const lista = todosLosEjercicios().filter((e) => e.grupo === grupo);
  if (!lista.length) return '<p class="nada">No hay ejercicios de este grupo.</p>';

  const marcas = maximos();
  const estadoDe = (ejercicio) => estadoNodo(ejercicio.id, marcas);

  /* 1. Armo el árbol: quién viene de quién */
  const porId = {};
  lista.forEach((e) => {
    porId[e.id] = e;
  });
  const hijos = {};
  lista.forEach((e) => {
    if (e.req && porId[e.req]) (hijos[e.req] = hijos[e.req] || []).push(e.id);
  });
  const raices = lista.filter((e) => !e.req || !porId[e.req]).map((e) => e.id);

  /* 2. Acomodo: cada rama que termina ocupa su propio renglón, y cada
        nodo queda a la altura promedio de sus hijos */
  const renglonDe = {}, columnaDe = {}, nombreDelRenglon = [];
  let totalRenglones = 0, columnaMaxima = 0;
  function acomodar(id, columna) {
    columnaDe[id] = columna;
    if (columna > columnaMaxima) columnaMaxima = columna;
    const susHijos = hijos[id] || [];
    if (!susHijos.length) {
      renglonDe[id] = totalRenglones;
      nombreDelRenglon[totalRenglones] = porId[id].nombre;
      totalRenglones++;
      return renglonDe[id];
    }
    let suma = 0;
    susHijos.forEach((hijo) => {
      suma += acomodar(hijo, columna + 1);
    });
    renglonDe[id] = suma / susHijos.length;
    return renglonDe[id];
  }
  raices.forEach((raiz) => acomodar(raiz, 0));

  /* 3. Medidas del dibujo (con nombres visibles todo se separa más) */
  const conNombres = !!estado.verNombres;
  const anchoColumna = conNombres ? 126 : 94;
  const altoRenglon = conNombres ? 86 : 56;
  const RADIO = 17, X_INICIO = 118, MARGEN_ARRIBA = 26;
  const xNodo = (id) => X_INICIO + anchoColumna * columnaDe[id];
  const yNodo = (id) => MARGEN_ARRIBA + altoRenglon * renglonDe[id] + altoRenglon / 2;
  const ALTO = Math.max(190, MARGEN_ARRIBA * 2 + altoRenglon * totalRenglones);
  const xEtiquetas = X_INICIO + anchoColumna * (columnaMaxima + 1);
  const xCorazon = xEtiquetas + (conNombres ? 30 : 190);
  const ANCHO = xCorazon + 90;
  const xCentro = 48, yCentro = ALTO / 2;

  /* 4. Las líneas entre nodos */
  const colorLinea = (s) =>
    s === "on" ? COLORES_MAPA.oro : s === "trabado" ? COLORES_MAPA.oroTenue : s === "libre" ? COLORES_MAPA.gris : COLORES_MAPA.apagado;
  let lineas = "";
  raices.forEach((id) => {
    const s = estadoDe(porId[id]);
    lineas += lineaMapa(xCentro + 27, yCentro, xNodo(id) - RADIO, yNodo(id), colorLinea(s), s === "on" ? 2.2 : 1.6);
  });
  lista.forEach((e) => {
    if (!e.req || !porId[e.req]) return;
    const s = estadoDe(e);
    lineas += lineaMapa(xNodo(e.req) + RADIO, yNodo(e.req), xNodo(e.id) - RADIO, yNodo(e.id), colorLinea(s), s === "on" ? 2.2 : 1.6);
  });

  /* 5. Los nodos */
  const textoEstado = { on: "encendido", trabado: "falta el anterior", libre: "lo puedes intentar", apagado: "bloqueado" };
  let nodos = "";
  lista.forEach((e) => {
    const s = estadoDe(e);
    const encendido = s === "on";
    const dorado = s === "on" || s === "trabado";
    const colorAro = dorado ? COLORES_MAPA.oro : s === "libre" ? COLORES_MAPA.gris : COLORES_MAPA.apagado;
    const colorIcono = encendido
      ? "#1B1405"
      : s === "trabado" ? COLORES_MAPA.oro : s === "libre" ? COLORES_MAPA.grisIcono : COLORES_MAPA.apagadoIcono;
    const relleno = encendido ? COLORES_MAPA.oro : COLORES_MAPA.fondoNodo;
    const x = xNodo(e.id), y = yNodo(e.id);

    nodos +=
      '<g data-act="nodo" data-v="' + e.id + '" role="button" tabindex="0" aria-label="' +
      escaparHtml(e.nombre) + " · " + textoEstado[s] + '">' +
      // círculo invisible más grande, para que sea fácil de tocar con el dedo
      '<circle cx="' + x + '" cy="' + y + '" r="26" fill="transparent"></circle>' +
      (dorado
        ? '<circle cx="' + x + '" cy="' + y + '" r="' + (RADIO + 5) + '" fill="' + COLORES_MAPA.oro + '" opacity="' + (encendido ? "0.14" : "0.07") + '"></circle>'
        : "") +
      '<circle id="aro_' + e.id + '" cx="' + x + '" cy="' + y + '" r="' + RADIO + '" fill="' + relleno + '" stroke="' + colorAro +
      '" stroke-width="' + (encendido ? 2.5 : 1.8) + '"' + (encendido ? ' filter="url(#brillo)"' : "") + "></circle>" +
      '<g transform="translate(' + x + "," + y + ') scale(0.82)" fill="' + colorIcono + '" stroke="' + colorIcono + '" stroke-width="0">' +
      GLIFOS[glifoDe(e.nombre)] + "</g>" +
      (conNombres
        ? parteNombre(e.nombre, 17)
            .map(
              (renglon, k) =>
                '<text x="' + x + '" y="' + (y + RADIO + 14 + k * 11) + '" text-anchor="middle" font-size="9.5" ' +
                'font-family="var(--dato)" fill="' + (dorado ? "#E6D9A8" : "#8A96A6") + '">' + escaparHtml(renglon) + "</text>",
            )
            .join("")
        : "") +
      (nodoSeleccionado === e.id
        ? '<circle cx="' + x + '" cy="' + y + '" r="' + (RADIO + 7) + '" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.85"></circle>'
        : "") +
      "</g>";
  });

  /* 6. Nombre de cada rama en la orilla derecha (solo con los nombres ocultos) */
  let etiquetas = "";
  if (!conNombres) {
    nombreDelRenglon.forEach((nombre, renglon) => {
      if (!nombre) return;
      const y = MARGEN_ARRIBA + altoRenglon * renglon + altoRenglon / 2;
      const corto = nombre.length > 24 ? nombre.slice(0, 23) + "…" : nombre;
      etiquetas +=
        '<text x="' + xEtiquetas + '" y="' + (y + 4) + '" font-size="11" font-family="var(--dato)" font-weight="600" ' +
        'letter-spacing="1" fill="#6F7C8C">' + escaparHtml(corto).toUpperCase() + "</text>";
    });
  }

  /* 7. El nodo del centro (el grupo muscular) */
  const centro =
    "<g>" +
    '<circle cx="' + xCentro + '" cy="' + yCentro + '" r="30" fill="' + COLORES_MAPA.oro + '" opacity="0.10"></circle>' +
    '<circle cx="' + xCentro + '" cy="' + yCentro + '" r="26" fill="#131A24" stroke="' + COLORES_MAPA.oro + '" stroke-width="2.5" filter="url(#brillo)"></circle>' +
    '<text x="' + xCentro + '" y="' + (yCentro + 9) + '" text-anchor="middle" font-size="24">' + GRUPOS[grupo].ic + "</text>" +
    '<text x="' + xCentro + '" y="' + (yCentro + 46) + '" text-anchor="middle" font-size="10.5" font-family="var(--dato)" ' +
    'font-weight="700" letter-spacing="1.2" fill="#8A96A6">' + GRUPOS[grupo].nombre.toUpperCase() + "</text></g>";

  /* 8. El logro imposible del final: Corazón sin daño */
  const corazon =
    lineaMapa(xCorazon - 70, yCentro, xCorazon - 24, yCentro, "#3A2A2A", 1.6) +
    '<g data-act="nodo" data-v="' + NODO_CORAZON + '" role="button" tabindex="0" aria-label="Corazón sin daño">' +
    '<circle cx="' + xCorazon + '" cy="' + yCentro + '" r="26" fill="transparent"></circle>' +
    '<circle id="aro_' + NODO_CORAZON + '" cx="' + xCorazon + '" cy="' + yCentro + '" r="' + RADIO + '" fill="' + COLORES_MAPA.fondoNodo +
    '" stroke="' + COLORES_MAPA.rojo + '" stroke-width="1.8" stroke-dasharray="3 3"></circle>' +
    '<g transform="translate(' + xCorazon + "," + yCentro + ') scale(0.8)" fill="none" stroke="' + COLORES_MAPA.rojo + '" stroke-width="0">' +
    GLIFOS.roto + "</g>" +
    '<text x="' + xCorazon + '" y="' + (yCentro + RADIO + 15) + '" text-anchor="middle" font-size="10" font-family="var(--dato)" ' +
    'font-weight="700" letter-spacing="1" fill="' + COLORES_MAPA.rojo + '">CORAZÓN SIN DAÑO</text></g>';

  /* 9. Globo con el nombre completo del nodo que tocaste */
  let globo = "";
  if (nodoSeleccionado) {
    const esCorazon = nodoSeleccionado === NODO_CORAZON;
    const nombre = esCorazon ? "Corazón sin daño" : porId[nodoSeleccionado] ? porId[nodoSeleccionado].nombre : "";
    if (nombre) {
      const xPunto = esCorazon ? xCorazon : xNodo(nodoSeleccionado);
      const yPunto = esCorazon ? yCentro : yNodo(nodoSeleccionado);
      // El globo mide según el nombre y nunca se sale del dibujo
      const anchoGlobo = Math.min(nombre.length * 6.9 + 26, ANCHO - 16);
      let xGlobo = xPunto - anchoGlobo / 2;
      if (xGlobo < 8) xGlobo = 8;
      if (xGlobo + anchoGlobo > ANCHO - 8) xGlobo = ANCHO - 8 - anchoGlobo;
      // Va arriba del nodo si cabe; si no, abajo
      const encima = yPunto - RADIO - 42 > 4;
      const yGlobo = encima ? yPunto - RADIO - 40 : yPunto + RADIO + 14;
      const xPico = Math.max(xGlobo + 14, Math.min(xPunto, xGlobo + anchoGlobo - 14));
      const yBasePico = encima ? yGlobo + 32 : yGlobo;
      const yPuntaPico = encima ? yGlobo + 40 : yGlobo - 8;
      globo =
        '<g id="globo" pointer-events="none">' +
        '<path d="M' + (xPico - 7) + " " + yBasePico + " L" + xPico + " " + yPuntaPico + " L" + (xPico + 7) + " " + yBasePico +
        ' Z" fill="' + COLORES_MAPA.oro + '"></path>' +
        '<rect x="' + xGlobo.toFixed(1) + '" y="' + yGlobo + '" width="' + anchoGlobo.toFixed(1) + '" height="32" rx="9" fill="' + COLORES_MAPA.oro + '"></rect>' +
        '<text x="' + (xGlobo + anchoGlobo / 2).toFixed(1) + '" y="' + (yGlobo + 21) + '" text-anchor="middle" font-size="13" ' +
        'font-family="var(--cuerpo)" font-weight="600" fill="#1B1405">' + escaparHtml(nombre) + "</text></g>";
    }
  }

  /* 10. Efectos: el brillo de los nodos encendidos y el fondo con niebla */
  const efectos =
    '<defs><filter id="brillo" x="-60%" y="-60%" width="220%" height="220%">' +
    '<feGaussianBlur stdDeviation="3.2" result="b"></feGaussianBlur>' +
    '<feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>' +
    '</filter><radialGradient id="niebla" cx="25%" cy="50%" r="80%">' +
    '<stop offset="0%" stop-color="#19212C"></stop><stop offset="100%" stop-color="#0E1116"></stop>' +
    "</radialGradient></defs>";

  /* 11. Todo junto, con su barra de arriba y la explicación de colores abajo */
  const encendidos = lista.filter((e) => estadoDe(e) === "on").length;
  const trabados = lista.filter((e) => estadoDe(e) === "trabado").length;
  return (
    '<div class="mapa">' +
    '<div class="mapa-barra"><span>' + encendidos + " de " + lista.length + " encendidos" +
    (trabados ? " · " + trabados + " por destrabar" : "") + "</span>" +
    '<button data-act="verNombres" aria-pressed="' + (conNombres ? "true" : "false") + '">Nombres</button></div>' +
    '<div class="lienzo"><svg width="' + ANCHO + '" height="' + ALTO + '" viewBox="0 0 ' + ANCHO + " " + ALTO + '" role="img" ' +
    'aria-label="Mapa de ejercicios de ' + GRUPOS[grupo].nombre + '">' + efectos +
    '<rect width="' + ANCHO + '" height="' + ALTO + '" fill="url(#niebla)"></rect>' +
    lineas + etiquetas + centro + nodos + corazon + globo + "</svg></div>" +
    '<div class="mapa-pie">' +
    '<span><i class="punto-encendido"></i>Encendido</span>' +
    '<span><i class="punto-trabado"></i>Ya lo lograste, falta el anterior</span>' +
    '<span><i class="punto-libre"></i>Lo puedes intentar</span>' +
    '<span><i class="punto-bloqueado"></i>Bloqueado</span>' +
    "</div></div>"
  );
}

/* Marca el nodo tocado. Redibuja el mapa (para mostrar el globo) sin
   perder lo que ya habías deslizado con el dedo. */
function seleccionarNodo(id) {
  if (nodoSeleccionado === id) return;
  nodoSeleccionado = id;
  const caja = document.getElementById("cajaMapa");
  const lienzo = document.querySelector(".mapa .lienzo");
  const scrollX = lienzo ? lienzo.scrollLeft : 0;
  const scrollY = lienzo ? lienzo.scrollTop : 0;
  if (caja) {
    caja.innerHTML = mapaEjercicios(vista.p || "pierna");
    const nuevo = caja.querySelector(".lienzo");
    if (nuevo) {
      nuevo.scrollLeft = scrollX;
      nuevo.scrollTop = scrollY;
    }
  }
  const tarjeta = document.getElementById("detalleNodo");
  if (tarjeta) tarjeta.innerHTML = detalleNodo();
}

/* La tarjeta de abajo del mapa: explica el nodo que tocaste */
function detalleNodo() {
  if (nodoSeleccionado === NODO_CORAZON) {
    return (
      '<b class="texto-rojo">Corazón sin daño</b>' +
      '<div class="mini">Nadie puede desbloquear esto. Nadie. Está ahí nada más para que lo veas.</div>'
    );
  }
  if (!nodoSeleccionado) {
    return '<div class="mini">Toca cualquier nodo del mapa para ver cuánto pide y cómo vas.</div>';
  }

  const ejercicio = buscarEjercicio(nodoSeleccionado);
  if (ejercicio.meta >= SIN_META) {
    return (
      "<b>" + escaparHtml(ejercicio.nombre) + "</b>" +
      '<div class="mini">Ejercicio que tú agregaste. No tiene meta, pero sí cuenta en tus gráficas.</div>'
    );
  }

  const marcas = maximos();
  const marca = marcas[nodoSeleccionado];
  const unidad = ejercicio.unidad === "reps" ? "reps" : "kg";
  const tuMaximo = marca ? (ejercicio.unidad === "reps" ? marca.reps : marca.kg) : 0;
  const s = estadoNodo(nodoSeleccionado, marcas);
  const falta = Math.max(0, ejercicio.meta - tuMaximo);
  const anterior = ejercicio.req ? buscarEjercicio(ejercicio.req).nombre : "";

  let etiqueta = "", nota = "";
  if (s === "on") {
    etiqueta = '<span class="chip oro sin-encoger">Encendido</span>';
  } else if (s === "trabado") {
    etiqueta = '<span class="chip oro sin-encoger">Falta el anterior</span>';
    nota =
      '<div class="mini nota-nodo">Ya cumpliste los ' + ejercicio.meta + " " + unidad + " que pide. " +
      "Para que encienda, antes tienes que encender <b>" + escaparHtml(anterior) + "</b>.</div>";
  } else if (s === "libre") {
    etiqueta = '<span class="chip sin-encoger">Te faltan ' + formatoKg(falta) + " " + unidad + "</span>";
  } else {
    etiqueta = '<span class="chip sin-encoger">Bloqueado</span>';
    nota =
      '<div class="mini nota-nodo">Primero enciende <b>' + escaparHtml(anterior) + "</b>. " +
      "Aquí te faltan " + formatoKg(falta) + " " + unidad + ".</div>";
  }

  return (
    "<b>" + escaparHtml(ejercicio.nombre) + "</b>" +
    '<div class="fila nota-nodo-fila">' +
    '<div class="crece"><div class="mini">Pide</div><div class="num dato-grande">' + ejercicio.meta + " " + unidad + "</div></div>" +
    '<div class="crece"><div class="mini">Tu máximo</div><div class="num dato-grande">' +
    (marca ? formatoKg(tuMaximo) + " " + unidad : "—") + "</div></div>" +
    etiqueta +
    "</div>" +
    nota
  );
}
