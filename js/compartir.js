/* =================================================================
   TARJETA PARA COMPARTIR (récords y semanas)
   -----------------------------------------------------------------
   Arma una tarjeta oscura para presumir, con frases al azar y una
   comparación con cosas reales: "Eso pesa lo mismo que 3 sandías".
   Las frases están en datos-frases.js.
   ================================================================= */
"use strict";

/* Busca una cosa que pese parecido y la regresa ya contada: "3 sandías".
   Solo usa cosas que quepan entre 1 y 12 veces (redondeando), para que
   la comparación se entienda. */
function unaCosaQuePeseParecido(kg, lista = COSAS) {
  const posibles = lista.filter(([pesoCosa]) => kg / pesoCosa >= 1.2 && kg / pesoCosa <= 12);
  if (!posibles.length) return null;
  const [pesoCosa, singular, plural] = alAzar(posibles);
  const cuantas = Math.round(kg / pesoCosa);
  return cuantas === 1 ? singular : cuantas + " " + plural;
}

/* Comparación de un peso. A veces (35%) compara lo que va en cada mano. */
function equivalencia(kg) {
  if (Math.random() < 0.35) {
    const enCadaMano = unaCosaQuePeseParecido(kg / 2);
    if (enCadaMano) return primeraMayuscula(alAzar(MODOS_MANO).replace("{n}", enCadaMano));
  }
  const todo = unaCosaQuePeseParecido(kg);
  if (!todo) return "Ese número habla solo.";
  return primeraMayuscula(alAzar(MODOS).replace("{n}", todo));
}

/* Comparación de los kilos de una semana (con cosas más grandes) */
function equivalenciaSemana(kg) {
  const cosa = unaCosaQuePeseParecido(kg, COSAS_GRANDES) || unaCosaQuePeseParecido(kg);
  if (!cosa) return "Todavía falta semana.";
  return primeraMayuscula(alAzar(MODOS_SEMANA).replace("{n}", cosa));
}

/* Frase de remate. Nunca sale la misma dos veces seguidas. */
let fraseAnterior = "";
function fraseDeRemate() {
  let frase = alAzar(FRASES);
  let intentos = 0;
  while (FRASES.length > 1 && frase === fraseAnterior && intentos < 8) {
    frase = alAzar(FRASES);
    intentos++;
  }
  fraseAnterior = frase;
  return frase;
}

function tituloRecord(nombreEjercicio, kg, reps) {
  const plantilla = alAzar(TITULOS_RECORD);
  return primeraMayuscula(plantilla.replace("{e}", nombreEjercicio.toLowerCase()).replace("{k}", formatoKg(kg)).replace("{r}", reps));
}

function tituloSemana(kg) {
  return alAzar(TITULOS_SEMANA).replace("{k}", formatoMiles(kg));
}

/* La tarjeta recibe una función que arma su contenido (título, texto
   grande y detalle). Así, cada vez que se toca "Otra versión", la función
   se vuelve a llamar y salen frases distintas. */
let armarContenidoTarjeta = null;

function mostrarTarjeta(armarContenido) {
  armarContenidoTarjeta = armarContenido;
  pintarTarjeta();
}

/* Tarjeta de un récord personal en un ejercicio */
function tarjetaDeRecord(idEjercicio) {
  mostrarTarjeta(() => {
    const marca = maximos()[idEjercicio];
    return {
      titulo: "Récord personal",
      grande: tituloRecord(buscarEjercicio(idEjercicio).nombre, marca.kg, marca.reps),
      detalle: equivalencia(marca.kg),
    };
  });
}

/* Tarjeta de los kilos de esta semana */
function tarjetaDeSemana() {
  mostrarTarjeta(() => {
    const kg = calcularEstadisticas().kilosPorSemana[claveSemana(hoyISO())] || 0;
    return { titulo: "Esta semana", grande: tituloSemana(kg), detalle: equivalenciaSemana(kg) };
  });
}

function pintarTarjeta() {
  const anterior = document.getElementById("cartelCaja");
  if (anterior) anterior.remove();

  const contenido = armarContenidoTarjeta();
  const remate = fraseDeRemate();
  const apodo = estado.perfil.nick || "El Verdadero";
  // El texto que se copia. Los saltos de línea se guardan como "¶"
  // porque un atributo de HTML no puede llevar saltos de línea.
  const textoParaCopiar = contenido.grande + "\n" + contenido.detalle + "\n" + remate + "\n— " + apodo;

  hoja.insertAdjacentHTML(
    "afterbegin",
    '<div id="cartelCaja">' +
      '<div class="compartir pop">' +
      '<div class="quien">' + escaparHtml(estado.perfil.avatar) + " " + escaparHtml(apodo) + " · " + escaparHtml(contenido.titulo) + "</div>" +
      '<div class="grande">' + escaparHtml(contenido.grande) + "</div>" +
      '<div class="frase">' + escaparHtml(contenido.detalle) + "</div>" +
      '<div class="frase tenue">' + escaparHtml(remate) + "</div>" +
      '<div class="pie">El Verdadero · libreta de gimnasio</div>' +
      "</div>" +
      '<div class="fila abajo-16">' +
      '<button class="btn chico fantasma crece sin-margen" data-act="copiarTexto" data-v="' + escaparHtml(textoParaCopiar.replace(/\n/g, "¶")) + '">Copiar</button>' +
      '<button class="btn chico fantasma crece sin-margen" data-act="otraVersion">Otra versión</button>' +
      '<button class="btn chico gris crece sin-margen" data-act="cerrarCartel">Cerrar</button>' +
      "</div></div>",
  );
  window.scrollTo(0, 0);
}

/* Copia un texto al portapapeles y avisa en el mismo botón */
function copiarAlPortapapeles(texto, boton) {
  try {
    navigator.clipboard.writeText(texto).then(
      () => {
        boton.textContent = "¡Copiado!";
      },
      () => copiarALaAntigua(texto, boton),
    );
  } catch (error) {
    copiarALaAntigua(texto, boton);
  }
}

/* Plan B para navegadores que no dejan usar el portapapeles moderno */
function copiarALaAntigua(texto, boton) {
  const caja = document.createElement("textarea");
  caja.value = texto;
  caja.style.position = "fixed";
  caja.style.opacity = "0";
  document.body.appendChild(caja);
  caja.select();
  try {
    document.execCommand("copy");
    boton.textContent = "¡Copiado!";
  } catch (error) {
    boton.textContent = "Selecciónalo y cópialo";
  }
  document.body.removeChild(caja);
}
