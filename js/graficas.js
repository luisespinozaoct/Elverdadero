/* =================================================================
   GRÁFICAS
   -----------------------------------------------------------------
   Las gráficas se dibujan a mano como SVG (un formato de dibujo que
   entiende el navegador), sin librerías externas. Cada función recibe
   los datos y regresa el texto del dibujo listo para meter en la página.
   ================================================================= */
"use strict";

/* Etiqueta de texto pequeña con la letra de los datos */
function textoGrafica(x, y, contenido, alineacion) {
  return (
    '<text x="' + x + '" y="' + y + '"' + (alineacion ? ' text-anchor="' + alineacion + '"' : "") +
    ' font-size="11" fill="var(--tinta-2)" font-family="var(--dato)">' + contenido + "</text>"
  );
}

/* Progreso de un grupo muscular a lo largo del tiempo.
   puntos: [{ fecha, max, vol }] → max = peso más alto del día, vol = kilos movidos
   Dibuja una línea roja con el peso máximo y barras azules con el volumen. */
function graficaProgreso(puntos) {
  if (puntos.length < 2) {
    return '<p class="nada">Necesitas al menos 2 entrenamientos de este grupo para ver la línea.</p>';
  }

  // Tamaño del dibujo y márgenes: izquierda, derecha, arriba, abajo
  const ANCHO = 480, ALTO = 200;
  const IZQ = 36, DER = 10, ARRIBA = 16, ABAJO = 26;
  const altoUtil = ALTO - ARRIBA - ABAJO;

  const maxKg = Math.max(...puntos.map((p) => p.max)) || 1;
  const maxVol = Math.max(...puntos.map((p) => p.vol)) || 1;
  const techoKg = Math.ceil(maxKg / 10) * 10; // redondeado a la decena de arriba

  // Convierten un dato en su posición dentro del dibujo
  const posX = (i) => IZQ + (ANCHO - IZQ - DER) * (i / (puntos.length - 1));
  const posY = (kg) => ARRIBA + altoUtil * (1 - kg / techoKg);
  const anchoBarra = Math.max(3, Math.min(16, ((ANCHO - IZQ - DER) / puntos.length) * 0.5));

  let barras = "", linea = "", circulos = "";
  puntos.forEach((p, i) => {
    const x = posX(i).toFixed(1);
    const y = posY(p.max).toFixed(1);
    const altoBarra = altoUtil * (p.vol / maxVol);
    barras +=
      '<rect x="' + (posX(i) - anchoBarra / 2).toFixed(1) + '" y="' + (ALTO - ABAJO - altoBarra).toFixed(1) +
      '" width="' + anchoBarra.toFixed(1) + '" height="' + altoBarra.toFixed(1) +
      '" fill="var(--pluma)" opacity="0.16" rx="2"></rect>';
    linea += (i ? " L" : "M") + x + " " + y;
    circulos += '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="var(--rojo)"></circle>';
  });

  // Cinco rayas horizontales con su número de kilos
  let rayas = "";
  for (let paso = 0; paso <= 4; paso++) {
    const kg = (techoKg * paso) / 4;
    const y = posY(kg);
    rayas +=
      '<line x1="' + IZQ + '" y1="' + y.toFixed(1) + '" x2="' + (ANCHO - DER) + '" y2="' + y.toFixed(1) +
      '" stroke="var(--raya)" stroke-width="1"></line>' +
      textoGrafica(IZQ - 6, (y + 4).toFixed(1), formatoKg(kg), "end");
  }

  const primeraFecha = fechaCorta(puntos[0].fecha);
  const ultimaFecha = fechaCorta(puntos[puntos.length - 1].fecha);

  return (
    '<svg class="gfx" viewBox="0 0 ' + ANCHO + " " + ALTO + '" role="img" aria-label="Progreso del grupo muscular">' +
    rayas + barras +
    '<path d="' + linea + '" fill="none" stroke="var(--rojo)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>' +
    circulos +
    textoGrafica(IZQ, ALTO - 7, primeraFecha) +
    textoGrafica(ANCHO - DER, ALTO - 7, ultimaFecha, "end") +
    "</svg>" +
    '<div class="leyenda">' +
    '<span><i class="leyenda-linea"></i>Peso máximo (kg)</span>' +
    '<span><i class="leyenda-barra"></i>Volumen por sesión (tope: ' + formatoMiles(maxVol) + " kg)</span>" +
    "</div>"
  );
}

/* Kilos movidos por semana, en barras.
   semanas: [{ k: "2026-S44", kg }] de la más vieja a la más nueva.
   La semana actual (la última) va en rojo. */
function graficaSemanas(semanas) {
  if (!semanas.length) return '<p class="nada">Aún no hay semanas registradas.</p>';

  const ANCHO = 480, ALTO = 180;
  const IZQ = 42, DER = 8, ARRIBA = 14, ABAJO = 30;
  const altoUtil = ALTO - ARRIBA - ABAJO;

  const maximo = Math.max(...semanas.map((s) => s.kg)) || 1;
  const techo = Math.ceil(maximo / 1000) * 1000 || 1000; // redondeado al millar de arriba
  const espacio = (ANCHO - IZQ - DER) / semanas.length; // lo que le toca a cada barra

  let barras = "", etiquetas = "";
  semanas.forEach((semana, i) => {
    const alto = altoUtil * (semana.kg / techo);
    const x = IZQ + espacio * i + espacio * 0.15;
    const ancho = espacio * 0.7;
    const esLaUltima = i === semanas.length - 1;
    barras +=
      '<rect x="' + x.toFixed(1) + '" y="' + (ALTO - ABAJO - alto).toFixed(1) + '" width="' + ancho.toFixed(1) +
      '" height="' + Math.max(1, alto).toFixed(1) + '" rx="3" fill="' + (esLaUltima ? "var(--rojo)" : "var(--pluma)") +
      '" opacity="' + (esLaUltima ? 1 : 0.8) + '"></rect>';
    // El número de semana, una sí y una no (para que no se encimen), y siempre la última
    if (i % 2 === 0 || esLaUltima) {
      etiquetas +=
        '<text x="' + (x + ancho / 2).toFixed(1) + '" y="' + (ALTO - 10) +
        '" text-anchor="middle" font-size="10" fill="var(--tinta-2)" font-family="var(--dato)">' +
        semana.k.split("-S")[1] + "</text>";
    }
  });

  // Tres rayas horizontales: cero, la mitad y el techo
  let rayas = "";
  for (let paso = 0; paso <= 2; paso++) {
    const kilos = (techo * paso) / 2;
    const y = ARRIBA + altoUtil * (1 - paso / 2);
    rayas +=
      '<line x1="' + IZQ + '" y1="' + y.toFixed(1) + '" x2="' + (ANCHO - DER) + '" y2="' + y.toFixed(1) +
      '" stroke="var(--raya)"></line>' +
      textoGrafica(IZQ - 6, (y + 4).toFixed(1), formatoMiles(kilos), "end");
  }

  return (
    '<svg class="gfx" viewBox="0 0 ' + ANCHO + " " + ALTO + '" role="img" aria-label="Kilos movidos por semana">' +
    rayas + barras + etiquetas +
    '<text x="' + IZQ + '" y="' + (ALTO - 1) + '" font-size="10" fill="var(--tinta-2)" font-family="var(--dato)">número de semana del año</text>' +
    "</svg>"
  );
}
