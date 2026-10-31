/* =================================================================
   DATOS DE EJEMPLO
   -----------------------------------------------------------------
   El botón "Ver un ejemplo" llena la app con 10 semanas de
   entrenamientos inventados, para ver cómo se ve todo lleno desde el
   primer minuto. Se borran con el botón de Ajustes.
   ================================================================= */
"use strict";

/* Peso inicial (en kg) de cada ejercicio de la rutina pre-creada */
const PESOS_INICIALES_EJEMPLO = {
  pe_banca: 50, pe_man_inc: 18, pe_pecfly: 30, pe_cable_ar: 12,
  ho_man: 14, ho_lat_man: 7, ho_post: 25,
  tr_polea: 22, tr_frances: 18, tr_banca: 0,
  es_jalon: 40, es_remo_barra: 40, es_remo_man: 22, es_pullover: 22,
  bi_z: 20, bi_mart: 10, bi_conc: 9,
  ta_man: 18, ta_barra: 50,
  pi_sent: 60, pi_pm_man: 24, pi_rum: 50, pi_prensa: 100, pi_ext: 35, pi_fem_a: 25, pi_pant: 50,
};

function generarEjemplo() {
  estado = estadoNuevo();
  estado.modo = "individual";
  estado.ejemplo = true;
  estado.perfil = { nick: "El Verdadero", avatar: "🦍", edad: "29", entrenador: "" };
  estado.plan = armarPlan(RUTINAS_PRECREADAS);

  // 10 semanas, de la más vieja (9) a la actual (0). Cada día del plan
  // cae cada dos días: lunes, miércoles, viernes... de esa semana.
  const hoy = new Date();
  for (let semana = 9; semana >= 0; semana--) {
    estado.plan.forEach((dia, numeroDia) => {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - semana * 7 + numeroDia * 2);
      if (fecha > hoy) return; // no se inventan entrenamientos en el futuro
      const iso = fechaATexto(fecha);

      const entradas = dia.ejercicios.map((id) => {
        const inicial = PESOS_INICIALES_EJEMPLO[id] || 20;
        const progreso = inicial * 0.035 * (9 - semana); // sube lento y realista
        const diaMalo = (((semana * 7 + id.length) % 3) - 1) * (inicial * 0.02); // a veces baja un poco
        const kg = Math.max(2.5, Math.round((inicial + progreso + diaMalo) / 2.5) * 2.5); // de 2.5 en 2.5, como los discos
        const numeroDeSeries = 2 + ((id.length + semana) % 2);
        const series = [];
        for (let k = 0; k < numeroDeSeries; k++) {
          series.push({ kg: kg, reps: Math.max(5, 10 - k - ((semana + k) % 2)) });
        }
        return { ej: id, series: series };
      });

      estado.sesiones.push({ id: "s" + iso + numeroDia, fecha: iso, hora: numeroDia % 2 ? "07:40" : "19:10", diaId: dia.id, entradas: entradas });
    });
  }

  estado.sesiones.sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  estado.pesos = [{ fecha: hoyISO(), kg: 78 }];
  estado.paso = "listo";
  estado.tab = "workout";
  revisarLogros();
  guardar();
  vista = { n: "", p: null };
  pintarPantalla();
  window.scrollTo(0, 0);
}
