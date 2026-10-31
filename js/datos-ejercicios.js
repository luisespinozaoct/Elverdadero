/* =================================================================
   DATOS: GRUPOS MUSCULARES Y CATÁLOGO DE EJERCICIOS
   -----------------------------------------------------------------
   Este archivo solo tiene datos, no hace nada por sí mismo.
   Si quieres agregar un ejercicio al catálogo, este es el lugar.
   ================================================================= */
"use strict";

/* Los 8 grupos musculares. "ic" es el emoji que se muestra junto al nombre. */
const GRUPOS = {
  pierna:   {nombre:"Pierna",   color:"#2F6B45", ic:"🦵"},
  espalda:  {nombre:"Espalda",  color:"#1F3FA8", ic:"🔙"},
  pecho:    {nombre:"Pecho",    color:"#B3261E", ic:"🫁"},
  hombro:   {nombre:"Hombro",   color:"#8A5B00", ic:"🪖"},
  bicep:    {nombre:"Bíceps",   color:"#6A3DA8", ic:"💪"},
  tricep:   {nombre:"Tríceps",  color:"#0E6B74", ic:"🔱"},
  trapecio: {nombre:"Trapecio", color:"#7A4A1E", ic:"⛰️"},
  abdomen:  {nombre:"Abdomen",  color:"#555045", ic:"🧱"}
};

/* -----------------------------------------------------------------
   CATÁLOGO DE EJERCICIOS
   Cada renglón es un ejercicio, en este orden:
     [id, nombre, grupo, meta, unidad, nivel, requisito]

   - id:        clave corta e interna. NO se debe cambiar, porque los
                entrenamientos guardados en el celular la usan.
   - meta:      el peso (o las repeticiones) que hay que alcanzar
                para que su nodo se encienda en el mapa.
   - unidad:    "kg" si la meta es de peso, "reps" si es de repeticiones.
   - nivel:     la columna del mapa (0 = básico, 3 = avanzado).
   - requisito: el id del ejercicio que va antes en el mapa
                (null si es de los iniciales).
   ----------------------------------------------------------------- */
/* [id, nombre, grupo, meta, unidad, nivel, req] */
const CATALOGO = [
  // ---------- PIERNA ----------
  ["pi_ext","Extensión de cuádriceps","pierna",30,"kg",0,null],
  ["pi_fem_s","Femoral sentado","pierna",30,"kg",0,null],
  ["pi_fem_a","Femoral acostado","pierna",25,"kg",0,null],
  ["pi_gob","Sentadilla con mancuerna (goblet)","pierna",20,"kg",0,null],
  ["pi_pant","Pantorrilla en máquina (de pie)","pierna",50,"kg",0,null],
  ["pi_adu","Aductor (interno)","pierna",40,"kg",0,null],
  ["pi_abd","Abductor (externo)","pierna",40,"kg",0,null],
  ["pi_pant_s","Pantorrilla sentado","pierna",40,"kg",1,"pi_pant"],
  ["pi_prensa","Prensa sentado","pierna",100,"kg",1,"pi_ext"],
  ["pi_prensa_a","Prensa acostado","pierna",100,"kg",1,"pi_ext"],
  ["pi_hack","Sentadilla en máquina (hack)","pierna",60,"kg",1,"pi_gob"],
  ["pi_smith","Sentadilla en smith","pierna",60,"kg",1,"pi_gob"],
  ["pi_zanc_m","Zancadas con mancuernas","pierna",15,"kg",1,"pi_gob"],
  ["pi_pm_man","Peso muerto con mancuerna","pierna",25,"kg",1,"pi_fem_s"],
  ["pi_rum_man","Peso muerto rumano con mancuerna","pierna",25,"kg",1,"pi_fem_s"],
  ["pi_sent","Sentadilla libre con barra","pierna",60,"kg",2,"pi_smith"],
  ["pi_pm","Peso muerto con barra","pierna",80,"kg",2,"pi_pm_man"],
  ["pi_rum","Peso muerto rumano con barra","pierna",60,"kg",2,"pi_rum_man"],
  ["pi_hip","Hip thrust con barra","pierna",80,"kg",2,"pi_prensa"],
  ["pi_zanc_b","Zancadas con barra","pierna",40,"kg",2,"pi_zanc_m"],
  ["pi_bulg","Búlgaras con mancuerna","pierna",20,"kg",2,"pi_zanc_m"],
  ["pi_front","Sentadilla frontal con barra","pierna",60,"kg",3,"pi_sent"],
  ["pi_sumo","Peso muerto sumo","pierna",100,"kg",3,"pi_pm"],
  // ---------- ESPALDA ----------
  ["es_jalon","Jalón al pecho (abierto)","espalda",40,"kg",0,null],
  ["es_jalon_sup","Jalón cerrado supino","espalda",35,"kg",0,null],
  ["es_jalon_neu","Jalón neutro","espalda",40,"kg",0,null],
  ["es_remo_maq","Remo en máquina","espalda",40,"kg",0,null],
  ["es_remo_cab","Remo en cable (bajo)","espalda",40,"kg",0,null],
  ["es_pullover","Pull over con cable","espalda",25,"kg",0,null],
  ["es_hiper","Hiperextensión lumbar (con disco)","espalda",10,"kg",0,null],
  ["es_dom_as","Dominadas asistidas","espalda",8,"reps",1,"es_jalon"],
  ["es_remo_man","Remo con mancuerna","espalda",25,"kg",1,"es_remo_maq"],
  ["es_remo_t","Remo T","espalda",40,"kg",1,"es_remo_cab"],
  ["es_remo_barra","Remo con barra libre","espalda",50,"kg",2,"es_remo_man"],
  ["es_dom","Dominadas libres","espalda",5,"reps",2,"es_dom_as"],
  ["es_pendlay","Remo Pendlay","espalda",60,"kg",3,"es_remo_barra"],
  ["es_dom_lastre","Dominadas con lastre","espalda",10,"kg",3,"es_dom"],
  // ---------- PECHO ----------
  ["pe_maq","Press de pecho en máquina","pecho",40,"kg",0,null],
  ["pe_pecfly","Pec fly (contractor)","pecho",30,"kg",0,null],
  ["pe_lagar","Lagartijas","pecho",15,"reps",0,null],
  ["pe_cable_ar","Cruce de cables (de arriba abajo)","pecho",15,"kg",0,null],
  ["pe_cable_ab","Cruce de cables (de abajo arriba)","pecho",12,"kg",0,null],
  ["pe_man_plano","Press con mancuerna plano","pecho",20,"kg",1,"pe_maq"],
  ["pe_man_inc","Press con mancuerna inclinado","pecho",18,"kg",1,"pe_maq"],
  ["pe_man_dec","Press con mancuerna declinado","pecho",18,"kg",1,"pe_maq"],
  ["pe_aper","Aperturas con mancuerna","pecho",12,"kg",1,"pe_pecfly"],
  ["pe_banca","Press de banca con barra (plano)","pecho",50,"kg",2,"pe_man_plano"],
  ["pe_banca_inc","Press de banca inclinado con barra","pecho",40,"kg",2,"pe_man_inc"],
  ["pe_banca_dec","Press de banca declinado con barra","pecho",45,"kg",2,"pe_man_dec"],
  ["pe_fondos","Fondos en paralelas","pecho",10,"reps",2,"pe_lagar"],
  ["pe_fondos_l","Fondos con lastre","pecho",10,"kg",3,"pe_fondos"],
  // ---------- HOMBRO ----------
  ["ho_maq","Press de hombro en máquina","hombro",30,"kg",0,null],
  ["ho_lat_man","Elevaciones laterales con mancuerna","hombro",8,"kg",0,null],
  ["ho_lat_cab","Elevaciones laterales en cable","hombro",8,"kg",0,null],
  ["ho_front","Elevaciones frontales","hombro",8,"kg",0,null],
  ["ho_post","Posterior en máquina","hombro",25,"kg",0,null],
  ["ho_facepull","Face pull","hombro",20,"kg",0,null],
  ["ho_man","Press de hombro con mancuerna","hombro",16,"kg",1,"ho_maq"],
  ["ho_paj","Pájaros con mancuerna","hombro",8,"kg",1,"ho_post"],
  ["ho_mil","Press militar con barra","hombro",40,"kg",2,"ho_man"],
  ["ho_arnold","Press Arnold","hombro",14,"kg",2,"ho_man"],
  ["ho_push","Push press con barra","hombro",50,"kg",3,"ho_mil"],
  // ---------- BÍCEPS ----------
  ["bi_maq","Curl en máquina","bicep",20,"kg",0,null],
  ["bi_cable","Curl en cable","bicep",20,"kg",0,null],
  ["bi_man","Curl con mancuerna alterno","bicep",10,"kg",0,null],
  ["bi_mart","Curl martillo","bicep",12,"kg",0,null],
  ["bi_z","Curl con barra Z","bicep",25,"kg",1,"bi_maq"],
  ["bi_conc","Curl concentrado","bicep",10,"kg",1,"bi_man"],
  ["bi_recta","Curl con barra recta","bicep",30,"kg",2,"bi_z"],
  ["bi_pred","Curl predicador (Scott)","bicep",20,"kg",2,"bi_z"],
  ["bi_ara","Curl araña (banco inclinado)","bicep",10,"kg",2,"bi_conc"],
  // ---------- TRÍCEPS ----------
  ["tr_polea","Extensión en polea con cuerda","tricep",25,"kg",0,null],
  ["tr_polea_b","Extensión en polea con barra","tricep",30,"kg",0,null],
  ["tr_banca","Fondos en banca","tricep",12,"reps",0,null],
  ["tr_maq","Fondos en máquina","tricep",30,"kg",0,null],
  ["tr_ext_maq","Extensión en máquina","tricep",30,"kg",0,null],
  ["tr_patada","Patada de tríceps","tricep",8,"kg",0,null],
  ["tr_frances","Press francés con barra Z","tricep",20,"kg",1,"tr_polea_b"],
  ["tr_cabeza","Extensión sobre la cabeza con mancuerna","tricep",12,"kg",1,"tr_polea"],
  ["tr_cerrado","Press cerrado con barra","tricep",40,"kg",2,"tr_frances"],
  // ---------- TRAPECIO ----------
  ["ta_man","Encogimientos con mancuerna","trapecio",20,"kg",0,null],
  ["ta_maq","Encogimientos en máquina","trapecio",40,"kg",0,null],
  ["ta_barra","Encogimientos con barra","trapecio",60,"kg",1,"ta_maq"],
  ["ta_menton","Remo al mentón","trapecio",25,"kg",1,"ta_man"],
  // ---------- ABDOMEN ----------
  ["ab_maq","Abdominal en máquina","abdomen",30,"kg",0,null],
  ["ab_polea","Crunch en polea","abdomen",25,"kg",0,null],
  ["ab_piernas","Elevación de piernas colgado","abdomen",10,"reps",0,null],
  ["ab_rueda","Rueda abdominal","abdomen",8,"reps",1,"ab_piernas"]
].map(([id, nombre, grupo, meta, unidad, nivel, requisito]) => ({
  id, nombre, grupo, meta, unidad, nivel,
  req: requisito, // se llama "req" porque así se guarda en los respaldos
}));

/* Ejercicios que se marcan solos cuando eliges una rutina pre-creada */
const SUGERIDOS = {
  pecho:["pe_banca","pe_man_inc","pe_pecfly","pe_cable_ar"],
  hombro:["ho_man","ho_lat_man","ho_post"],
  tricep:["tr_polea","tr_frances","tr_banca"],
  espalda:["es_jalon","es_remo_barra","es_remo_man","es_pullover"],
  bicep:["bi_z","bi_mart","bi_conc"],
  trapecio:["ta_man","ta_barra"],
  pierna:["pi_sent","pi_pm_man","pi_rum","pi_prensa","pi_ext","pi_fem_a","pi_pant"],
  abdomen:["ab_polea","ab_piernas"]
};

/* Las tres rutinas pre-creadas (la división clásica de 3 días) */
const RUTINAS_PRECREADAS = [
  {nombre:"Pecho, hombro y tríceps", grupos:["pecho","hombro","tricep"]},
  {nombre:"Espalda, bíceps y trapecio", grupos:["espalda","bicep","trapecio"]},
  {nombre:"Pierna completa", grupos:["pierna"]}
];
