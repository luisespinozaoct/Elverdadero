/* =================================================================
   DATOS: LOS 56 LOGROS DE LA SALA DE TROFEOS
   -----------------------------------------------------------------
   Cada logro tiene:
   - id:          clave interna. NO se debe cambiar: el celular guarda
                  qué logros desbloqueaste usando este id.
   - icono, nombre, descripcion: lo que se ve en la sala de trofeos.
   - tipo:        qué regla revisa (ver "logroCumplido" en estadisticas.js).
   - meta:        el número que hay que alcanzar (si la regla lo usa).
   - ejercicio:   el ejercicio o grupo al que se refiere (si aplica).
   ================================================================= */
"use strict";

const LOGROS = [
  { id: "l_1", icono: "✍️", nombre: "Primera anotación", descripcion: "Guardaste tu primer entrenamiento", tipo: "sesiones", meta: 1 },
  { id: "l_2", icono: "🗓️", nombre: "¡Primera semana!", descripcion: "3 entrenamientos registrados", tipo: "sesiones", meta: 3 },
  { id: "l_3", icono: "🔟", nombre: "Diez veces", descripcion: "10 entrenamientos", tipo: "sesiones", meta: 10 },
  { id: "l_4", icono: "📒", nombre: "Libreta a medias", descripcion: "25 entrenamientos", tipo: "sesiones", meta: 25 },
  { id: "l_5", icono: "🧱", nombre: "Cincuenta", descripcion: "50 entrenamientos", tipo: "sesiones", meta: 50 },
  { id: "l_6", icono: "💯", nombre: "Cien sesiones", descripcion: "100 entrenamientos", tipo: "sesiones", meta: 100 },
  { id: "l_7", icono: "🏛️", nombre: "Doscientas", descripcion: "200 entrenamientos", tipo: "sesiones", meta: 200 },
  { id: "l_8", icono: "🌪️", nombre: "365", descripcion: "365 entrenamientos registrados", tipo: "sesiones", meta: 365 },
  { id: "l_9", icono: "📌", nombre: "Un mes sin fallar", descripcion: "4 semanas seguidas entrenando", tipo: "semanas", meta: 4 },
  { id: "l_10", icono: "⏳", nombre: "Ahora sí cuenta", descripcion: "12 semanas seguidas: ya es un plan", tipo: "semanas", meta: 12 },
  { id: "l_11", icono: "🧭", nombre: "Medio año", descripcion: "26 semanas seguidas", tipo: "semanas", meta: 26 },
  { id: "l_12", icono: "👑", nombre: "Un año entero", descripcion: "52 semanas seguidas", tipo: "semanas", meta: 52 },
  { id: "l_13", icono: "🦵", nombre: "Primeros 60 en sentadilla", descripcion: "60 kg en sentadilla libre", tipo: "peso", ejercicio: "pi_sent", meta: 60 },
  { id: "l_14", icono: "🦵", nombre: "¡Primeros 100 en sentadilla!", descripcion: "100 kg en sentadilla libre", tipo: "peso", ejercicio: "pi_sent", meta: 100 },
  { id: "l_15", icono: "🤨", nombre: "¿Estás dañado?", descripcion: "120 kg en sentadilla libre", tipo: "peso", ejercicio: "pi_sent", meta: 120 },
  { id: "l_16", icono: "🚨", nombre: "Alguien llame a su mamá", descripcion: "140 kg en sentadilla libre", tipo: "peso", ejercicio: "pi_sent", meta: 140 },
  { id: "l_17", icono: "🛸", nombre: "Sentadilla de otro planeta", descripcion: "180 kg en sentadilla libre", tipo: "peso", ejercicio: "pi_sent", meta: 180 },
  { id: "l_18", icono: "🪨", nombre: "Primeros 100 en peso muerto", descripcion: "100 kg en peso muerto", tipo: "peso", ejercicio: "pi_pm", meta: 100 },
  { id: "l_19", icono: "🪨", nombre: "Peso muerto de 140", descripcion: "140 kg en peso muerto", tipo: "peso", ejercicio: "pi_pm", meta: 140 },
  { id: "l_20", icono: "🛵", nombre: "Levantaste una motoneta", descripcion: "180 kg en peso muerto", tipo: "peso", ejercicio: "pi_pm", meta: 180 },
  { id: "l_21", icono: "🐘", nombre: "Doscientos", descripcion: "200 kg en peso muerto", tipo: "peso", ejercicio: "pi_pm", meta: 200 },
  { id: "l_22", icono: "🛏️", nombre: "Primeros 60 en banca", descripcion: "60 kg en press de banca", tipo: "peso", ejercicio: "pe_banca", meta: 60 },
  { id: "l_23", icono: "🔥", nombre: "¡Primeros 100 en banca!", descripcion: "100 kg en press de banca", tipo: "peso", ejercicio: "pe_banca", meta: 100 },
  { id: "l_24", icono: "🗜️", nombre: "Banca de 120", descripcion: "120 kg en press de banca", tipo: "peso", ejercicio: "pe_banca", meta: 120 },
  { id: "l_25", icono: "☠️", nombre: "Banca de 140", descripcion: "140 kg en press de banca", tipo: "peso", ejercicio: "pe_banca", meta: 140 },
  { id: "l_26", icono: "😈", nombre: "Los tres delirios", descripcion: "100 kg en sentadilla, peso muerto y banca", tipo: "combo", ejercicio: ["pi_sent","pi_pm","pe_banca"], meta: 100 },
  { id: "l_27", icono: "3️⃣", nombre: "Club de los 300", descripcion: "Suma 300 kg entre sentadilla, peso muerto y banca", tipo: "suma3", meta: 300 },
  { id: "l_28", icono: "4️⃣", nombre: "Club de los 400", descripcion: "Suma 400 kg entre los tres básicos", tipo: "suma3", meta: 400 },
  { id: "l_29", icono: "5️⃣", nombre: "Club de los 500", descripcion: "Suma 500 kg entre los tres básicos", tipo: "suma3", meta: 500 },
  { id: "l_30", icono: "🪖", nombre: "Militar de 40", descripcion: "40 kg en press militar con barra", tipo: "peso", ejercicio: "ho_mil", meta: 40 },
  { id: "l_31", icono: "🎖️", nombre: "Militar de 60", descripcion: "60 kg en press militar con barra", tipo: "peso", ejercicio: "ho_mil", meta: 60 },
  { id: "l_32", icono: "🧗", nombre: "Tu primera dominada", descripcion: "1 dominada libre registrada", tipo: "reps", ejercicio: "es_dom", meta: 1 },
  { id: "l_33", icono: "🦅", nombre: "Diez dominadas", descripcion: "10 dominadas en una serie", tipo: "reps", ejercicio: "es_dom", meta: 10 },
  { id: "l_34", icono: "⛓️", nombre: "Con lastre", descripcion: "10 kg extra en dominadas", tipo: "peso", ejercicio: "es_dom_lastre", meta: 10 },
  { id: "l_35", icono: "🏋️", nombre: "Prensa de 200", descripcion: "200 kg en prensa", tipo: "peso", ejercicio: "pi_prensa", meta: 200 },
  { id: "l_36", icono: "🍑", nombre: "Hip thrust de 100", descripcion: "100 kg en hip thrust", tipo: "peso", ejercicio: "pi_hip", meta: 100 },
  { id: "l_37", icono: "🚣", nombre: "Remo de 60", descripcion: "60 kg en remo con barra", tipo: "peso", ejercicio: "es_remo_barra", meta: 60 },
  { id: "l_38", icono: "📦", nombre: "5 toneladas en un día", descripcion: "5,000 kg movidos en una sola sesión", tipo: "vol_ses", meta: 5000 },
  { id: "l_39", icono: "🚚", nombre: "10 toneladas en un día", descripcion: "10,000 kg movidos en una sola sesión", tipo: "vol_ses", meta: 10000 },
  { id: "l_40", icono: "🗓️", nombre: "Semana pesada", descripcion: "20,000 kg movidos en una semana", tipo: "vol_sem", meta: 20000 },
  { id: "l_41", icono: "⚓", nombre: "100 toneladas", descripcion: "100,000 kg movidos en total", tipo: "vol_tot", meta: 100000 },
  { id: "l_42", icono: "🚢", nombre: "Medio millón", descripcion: "500,000 kg movidos en total", tipo: "vol_tot", meta: 500000 },
  { id: "l_43", icono: "🌋", nombre: "Un millón de kilos", descripcion: "1,000,000 kg movidos en total", tipo: "vol_tot", meta: 1000000 },
  { id: "l_44", icono: "🧊", nombre: "Dos refrigeradores", descripcion: "160 kg en cualquier ejercicio", tipo: "peso_cual", meta: 160 },
  { id: "l_45", icono: "🐄", nombre: "Un becerro por hombro", descripcion: "80 kg en cualquier ejercicio", tipo: "peso_cual", meta: 80 },
  { id: "l_46", icono: "🧰", nombre: "Todo el gimnasio", descripcion: "30 ejercicios distintos registrados", tipo: "distintos", meta: 30 },
  { id: "l_47", icono: "🛐", nombre: "El del banco", descripcion: "50 sesiones de pecho", tipo: "ses_grupo", ejercicio: "pecho", meta: 50 },
  { id: "l_48", icono: "🦿", nombre: "Nunca saltó pierna", descripcion: "50 sesiones de pierna", tipo: "ses_grupo", ejercicio: "pierna", meta: 50 },
  { id: "l_49", icono: "🌅", nombre: "Antes que el sol", descripcion: "Entrenaste antes de las 7 de la mañana", tipo: "temprano" },
  { id: "l_50", icono: "🌙", nombre: "Turno nocturno", descripcion: "Entrenaste después de las 10 de la noche", tipo: "tarde" },
  { id: "l_51", icono: "🙏", nombre: "Sin excusas", descripcion: "Entrenaste un domingo", tipo: "domingo" },
  { id: "l_52", icono: "📈", nombre: "Récord roto", descripcion: "Superaste tu marca en 10 ejercicios distintos", tipo: "prs", meta: 10 },
  { id: "l_53", icono: "✅", nombre: "Semana completa", descripcion: "Hiciste todos los días de tu plan en una semana", tipo: "sem_completa" },
  { id: "l_54", icono: "🔗", nombre: "Dueño de la jaula", descripcion: "Sentadilla, peso muerto y militar en la misma semana", tipo: "jaula" },
  { id: "l_55", icono: "⚖️", nombre: "Hasta tú te pesaste", descripcion: "Registraste tu peso corporal", tipo: "peso_corp" },
  { id: "l_56", icono: "💔", nombre: "Corazón sin daño", descripcion: "Nadie puede desbloquear esto. Nadie.", tipo: "jamas" }
];
