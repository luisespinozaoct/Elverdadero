/* =================================================================
   DATOS: FRASES PARA LA TARJETA DE COMPARTIR
   -----------------------------------------------------------------
   Aquí viven todas las frases que salen al presumir un récord o una
   semana. Se eligen al azar para que nunca salga dos veces lo mismo.
   Las marcas {n}, {k}, {r} y {e} se reemplazan por los datos reales.
   ================================================================= */
"use strict";

/* Comparaciones para presumir un peso: [kilos, singular, plural] */
const COSAS = [
  [2,"una gallina","gallinas"], [3,"un pollo entero","pollos enteros"],
  [5,"una sandía","sandías"], [5,"un galón de pintura","galones de pintura"],
  [6,"un gato bien comido","gatos bien comidos"], [8,"una caja de herramientas","cajas de herramientas"],
  [10,"una llanta de coche","llantas de coche"], [12,"una bicicleta","bicicletas"],
  [14,"un bulto de croquetas","bultos de croquetas"], [15,"un microondas","microondas"],
  [18,"una caja de jitomates","cajas de jitomates"], [20,"un garrafón de agua","garrafones de agua"],
  [22,"una silla de oficina","sillas de oficina"], [25,"un bulto de arena","bultos de arena"],
  [25,"un costal de maíz","costales de maíz"], [28,"un niño de ocho años","niños de ocho años"],
  [30,"un perro labrador","perros labradores"], [30,"un tanque de gas lleno","tanques de gas llenos"],
  [35,"una maleta hasta el tope","maletas hasta el tope"], [40,"un becerro","becerros"],
  [45,"una puerta de madera","puertas de madera"], [50,"un costal de cemento","costales de cemento"],
  [60,"un colchón matrimonial","colchones matrimoniales"], [70,"una lavadora","lavadoras"],
  [75,"tu compa flaco","compas flacos"], [80,"un refrigerador","refrigeradores"],
  [90,"un luchador","luchadores"], [100,"una motoneta","motonetas"],
  [110,"un sillón de tres plazas","sillones de tres plazas"], [150,"un cerdo adulto","cerdos adultos"],
  [200,"un piano vertical","pianos verticales"]
];
/* Para los kilos de toda una semana hacen falta cosas más grandes */
const COSAS_GRANDES = [
  [500,"un caballo","caballos"], [700,"una vaca","vacas"],
  [1200,"un coche compacto","coches compactos"], [2500,"una camioneta","camionetas"],
  [5000,"un elefante","elefantes"], [12000,"un camión de carga","camiones de carga"],
  [15000,"un autobús","autobuses"], [40000,"un tráiler cargado","tráileres cargados"]
];
/* Formas de decir la comparación de un peso. {n} es la cosa: "3 sandías" */
const MODOS = [
  "Eso es como cargar {n}.", "Eso pesa lo mismo que {n}.",
  "Levantaste el equivalente a {n}.", "Imagínate {n} colgando de la barra.",
  "Es como si te hubieras echado {n} encima.", "Eso equivale a {n}.",
  "Por si el número no te dice nada: {n}.", "Lo mismo que {n}, pero por repeticiones.",
  "Ponlo así: {n}.", "Traducido a cosas reales: {n}."
];
/* Igual, pero cuando se compara lo que cargas en cada mano */
const MODOS_MANO = [
  "{n} en cada mano.", "Como traer {n} en cada brazo.",
  "{n} en cada hombro.", "{n} por mano. Literal.", "Una mano con {n}, la otra igual."
];
/* Igual, pero para los kilos de toda una semana */
const MODOS_SEMANA = [
  "Eso es mover {n} en una semana.", "En siete días levantaste {n}.",
  "Si lo juntas todo: {n}.", "Esa semana pesó {n}.", "{n}. Eso moviste esta semana."
];
/* Frases para rematar la tarjeta */
const FRASES = [
  "Felicidades. Eso no se regala.",
  "Eres un titán.",
  "¿Te rompieron el corazón o qué?",
  "Esto no fue suerte, fue libreta.",
  "El de hace tres meses no podía con esto.",
  "Nadie te vio hacerlo. Aquí sí quedó.",
  "Tu plan está funcionando.",
  "Un número más alto que el anterior. Eso es todo lo que importa.",
  "Lo escribiste, lo levantaste, lo rompiste.",
  "Escribir sí sirve. Ahí está la prueba.",
  "La barra no sabe de excusas y hoy tú tampoco.",
  "Esto se llama progreso y tiene fecha.",
  "Ayer era tu techo. Hoy es tu piso.",
  "De novato ya no te queda nada.",
  "Nadie te aplaudió en el gym. Aquí sí.",
  "Te estás volviendo un problema.",
  "Eso ya no es entrenar, es construir.",
  "Tu yo de enero no te reconocería.",
  "Sin fotos y sin filtros: puro número.",
  "La máquina no miente y tú tampoco.",
  "En el espejo todavía no se nota. En la libreta sí.",
  "Tres meses más de esto y se te va a notar hasta en la camisa.",
  "El peso subió. Punto.",
  "Récord. Ahora ese es tu mínimo.",
  "Felicidades: acabas de subirte tu propia vara.",
  "Esto ya no cabe en un «voy empezando».",
  "Que alguien revise esa barra, la veo doblada.",
  "Nadie nace fuerte. Se anota.",
  "El que entrena sin anotar sigue en el mismo peso. Tú no.",
  "Hoy ganaste. Mañana otra vez.",
  "¿Seguro que ese es tu peso? Se te vio cómodo.",
  "Lo pesado se te hizo normal. Eso es progresar.",
  "Tu constancia pesa más que tus ganas.",
  "Los días que no querías ir también están en este número.",
  "Esto se construyó serie por serie.",
  "El progreso no se siente. Se mide.",
  "Ponle fecha: esto ya no es tu límite.",
  "Las ganas van y vienen. La libreta se queda.",
  "Súbele al peso, ya se te hizo chico.",
  "De esto se trataba."
];
/* Formas de anunciar un récord. {k} = kilos, {r} = repeticiones, {e} = ejercicio */
const TITULOS_RECORD = [
  "Récord personal: {r} reps con {k} kg en {e}",
  "Nuevo máximo: {k} kg en {e}, {r} veces",
  "{k} kg en {e}. {r} repeticiones.",
  "Rompí mi récord: {e} con {k} kg",
  "{e}: {k} kg por {r}. Récord nuevo.",
  "Hoy sí: {k} kg en {e}",
  "Marca nueva en {e}: {k} kg × {r}"
];
/* Formas de anunciar la semana. {k} = kilos de la semana */
const TITULOS_SEMANA = [
  "Moví {k} kg esta semana",
  "{k} kg levantados en siete días",
  "Esta semana: {k} kg en total",
  "Sumé {k} kg esta semana",
  "{k} kg. Eso cargué esta semana."
];
