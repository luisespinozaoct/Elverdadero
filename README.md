# El Verdadero

Libreta de gimnasio para celular. Anotas el peso y las repeticiones de cada
serie, y la app te dice la verdad sobre tu progreso con datos duros.

- Es una **app web instalable (PWA)**: se abre en el navegador y se puede
  agregar a la pantalla de inicio del celular como si fuera una app.
- **Funciona sin internet** después de abrirla una vez (ver `sw.js`).
- **No hay servidor ni cuentas.** Todo se guarda en el teléfono de cada
  usuario (`localStorage`).
- **Sin librerías ni frameworks:** HTML, CSS y JavaScript puros. Las gráficas
  y el mapa se dibujan a mano como SVG.

---

## Cómo está organizada

```
ELVERDADERO/
├── index.html             La estructura: barra de arriba, hoja y pestañas
├── styles.css             Cómo se ve (colores, letras, tarjetas, mapa)
├── sw.js                  Modo sin internet (service worker)
├── manifest.webmanifest   Nombre e ícono para instalarla en el celular
├── icon.svg, icon-*.png   El ícono en varios tamaños
└── js/                    Cómo funciona, dividido por temas
```

### Los archivos de `js/`, en el orden en que se cargan

El orden importa: cada archivo usa cosas de los que van antes.

| Archivo | Qué hace |
|---|---|
| **Datos** (solo información, no hacen nada solos) | |
| `datos-ejercicios.js` | Los 8 grupos musculares y los 88 ejercicios del catálogo |
| `datos-logros.js` | Los 56 logros de la sala de trofeos |
| `datos-frases.js` | Las frases y comparaciones de la tarjeta para compartir |
| **Lógica** | |
| `guardado.js` | El estado de la app, cómo se guarda y cómo se revisa un respaldo |
| `utilidades.js` | Fechas, formato de números, protección del texto del usuario |
| `estadisticas.js` | Récords, kilos movidos, semanas seguidas y reglas de los logros |
| `graficas.js` | Las dos gráficas (por semana y por grupo muscular) |
| **Pantallas** | |
| `navegacion.js` | Decide qué pantalla dibujar |
| `mapa.js` | El mapa de ejercicios (árbol de habilidades por grupo) |
| `pantallas-alta.js` | Las pantallas de la primera vez (bienvenida → perfil) |
| `pantallas-workout.js` | Pestaña 1: registrar entrenamientos |
| `pantallas-progreso.js` | Pestaña 2: gráficas de progreso |
| `pantallas-usuario.js` | Pestaña 3: perfil, trofeos, mapa, plan y ajustes |
| `compartir.js` | La tarjeta para presumir un récord o una semana |
| **Arranque** | |
| `acciones.js` | Qué pasa al tocar cada botón |
| `ejemplo.js` | Los datos de ejemplo (10 semanas inventadas) |
| `arranque.js` | Carga los datos y dibuja la primera pantalla |

---

## Ideas clave para leer el código

**1. Todo vive en una variable: `estado`.** Tiene el perfil, el plan, los
entrenamientos, los logros, etc. Cada vez que algo cambia se llama a
`guardar()`, que lo escribe en `localStorage`. La lista completa de campos
está explicada en `js/guardado.js`.

> Los nombres de los campos guardados (`nick`, `ej`, `kg`, `reps`...) no se
> deben cambiar: así están en los celulares de quien ya usa la app.

**2. Cada pantalla es una función que escribe HTML.** Por ejemplo,
`pantallaWorkout()` arma un texto con el HTML de la pantalla y lo pone dentro
de `<main id="app">`. Para cambiar de pantalla se llama a `irA("nombre")`.

**3. Un solo escucha de clics para toda la app.** Los botones no tienen su
propio `onclick`; dicen lo que hacen con el atributo `data-act`:

```html
<button data-act="guardarSesion">Guardar entrenamiento</button>
```

Al final de `js/acciones.js` hay una tabla (`ACCIONES`) que dice qué función
corre cada acción.

**4. El texto del usuario siempre pasa por `escaparHtml()`** antes de entrar
a la página. Así, si alguien escribe `<b>` en su apodo, se ve tal cual y no se
convierte en código.

**5. El mapa sigue una regla de cadena.** Un nodo se enciende cuando alcanzas
su meta **y** el nodo anterior ya está encendido (ver `estadoNodo()` en
`js/mapa.js`).

---

## Cómo probarla

**En la Mac:** doble clic en `index.html`. Para verla como en un celular:
clic derecho → *Inspeccionar* → el botón de celular del panel.

> Abierta así funciona todo menos el modo sin internet, que solo se activa
> cuando la app está publicada en una dirección `https://`.

**En el celular:** se publica la carpeta completa en un servicio gratuito
(Netlify, GitHub Pages) y se abre la dirección en el celular. Después:
- iPhone (Safari): Compartir → *Agregar a inicio*.
- Android (Chrome): menú ⋮ → *Instalar app*.

---

## Al hacer cambios

1. Edita los archivos que necesites.
2. Abre `sw.js` y **cambia el texto de `VERSION`** (por ejemplo, súbele el
   número del final). Si no, los celulares siguen mostrando la copia vieja.
3. Si agregaste un archivo nuevo, agrégalo también a la lista `ARCHIVOS` de
   `sw.js` y al final de `index.html`.
4. Vuelve a publicar la carpeta.

---

## Historial

**30 de octubre de 2026: revisión del código**
- El código pasó de un solo archivo de 1,674 líneas a 17 archivos por tema,
  con nombres en español que explican qué es cada cosa y comentarios en
  cada sección.
- Los estilos que estaban escritos dentro del código ahora son clases en
  `styles.css`.
- **Arreglado:** al tocar un nodo del mapa, la tarjeta de abajo no se
  actualizaba (y después el botón "Nombres" dejaba de responder).
- **Arreglado:** "Semana anterior" en Progreso mostraba la última semana
  con entrenamientos, aunque no fuera la anterior.
- **Arreglado:** restaurar un respaldo dañado podía dejar la app sin
  funcionar. Ahora se revisa antes y, si está mal, no se toca nada.
- **Nuevo:** funciona sin internet (`sw.js`).
- **Nuevo:** ícono correcto para la pantalla de inicio del iPhone.
- Se verificó con un recorrido automático de 74 pasos por todas las
  pantallas: los datos guardados y lo que se ve son idénticos a la versión
  anterior, salvo los arreglos de arriba.
