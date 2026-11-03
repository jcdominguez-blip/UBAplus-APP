/* ============================================================
   data.js — Plan de estudios de Diseño Gráfico (FADU, Plan 2022)
   Datos verificados del contexto. Se expone en window.DATA.
   No usa ES modules para funcionar también sobre file://
   ============================================================ */
(function () {
  "use strict";

  /* ---- Las 11 cátedras verticales de Diseño Gráfico ---- */
  var CATEDRAS_DISENO = [
    { nombre: "Melón",              turno: "Mañana" },
    { nombre: "Ex Mazzeo",          turno: "Mañana" },
    { nombre: "Meygide Carpintero", turno: "Mañana" },
    { nombre: "Pujol",              turno: "Mañana" },
    { nombre: "Díaz Colodrero",     turno: "Tarde"  },
    { nombre: "Ex Belluccia",       turno: "Noche"  },
    { nombre: "Diseño Transforma",  turno: "Noche"  },
    { nombre: "Gabriele",           turno: "Noche"  },
    { nombre: "Ex Rico",            turno: "Noche"  },
    { nombre: "Salomone",           turno: "Noche"  },
    { nombre: "Ex Wolkowicz",       turno: "Noche"  }
  ];

  /* Cátedras genéricas por turno para materias que no son Diseño */
  var CATEDRAS_GENERICAS = [
    { nombre: "Cátedra A", turno: "Mañana" },
    { nombre: "Cátedra B", turno: "Tarde"  },
    { nombre: "Cátedra C", turno: "Noche"  }
  ];

  /* ============================================================
     CBC — Ciclo Básico Común de Diseño Gráfico (7 materias, 4 en la muestra).
     Composición verificada: Proyectual I y II + Taller de Dibujo (específicas),
     Filosofía y Matemática (orientación DG/Arq), ICSE e IPC (comunes).
     Se cursan hasta 4 materias por cuatrimestre (tope del CBC).
     ============================================================ */
  var CBC = {
    id: "cbc",
    nombre: "Ciclo Básico Común",
    color: "lima",
    total: 7,
    topeCuatrimestre: 4,
    materias: [
      {
        id: "icp1", codigo: "ICP I", nombre: "Intr. al Conocimiento Proyectual I",
        corto: "Conocimiento Proyectual I", cursada: "Cuatrimestral", horas: "8 hs semanales",
        enMuestra: true, evalTipo: "taller",
        descripcion: "Es el taller del CBC: la primera materia en la que vas a proyectar. Se trabaja con ejercicios prácticos y la corrección es en clase, así que la asistencia pesa.",
        evaluacion: "No lleva parciales: se cursa con tres trabajos prácticos —uno al inicio, uno a mitad de cuatrimestre y una entrega final integradora—. La carpeta y la asistencia son parte de la nota. Promocionás con 7.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Lunes y miércoles" },
          { sede: "Ciudad Universitaria", turno: "Turno noche",  dias: "Martes y jueves" },
          { sede: "San Isidro",           turno: "Turno tarde",  dias: "Lunes y miércoles" },
          { sede: "Paternal",             turno: "Turno mañana", dias: "Martes y jueves" }
        ]
      },
      {
        id: "td", codigo: "TD", nombre: "Taller de Dibujo",
        corto: "Taller de Dibujo", cursada: "Anual", horas: "4 hs semanales",
        enMuestra: true, evalTipo: "taller",
        descripcion: "La única materia anual del CBC. Se dibuja todas las clases y la carpeta de trabajos es parte de la evaluación. Es la antesala de los talleres de la carrera. En Diseño Gráfico sólo se dicta en Ciudad Universitaria y San Isidro.",
        evaluacion: "No lleva parciales: son tres entregas de trabajos prácticos a lo largo del año —inicial, de mitad de año y una final—, más la carpeta completa. Promocionás con 7.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Lunes y miércoles" },
          { sede: "Ciudad Universitaria", turno: "Turno tarde",  dias: "Martes y jueves" },
          { sede: "San Isidro",           turno: "Turno noche",  dias: "Lunes y miércoles" }
        ]
      },
      {
        id: "ipc", codigo: "IPC", nombre: "Intr. al Pensamiento Científico",
        corto: "Pensamiento Científico", cursada: "Cuatrimestral", horas: "4 hs semanales",
        enMuestra: true, evalTipo: "parcial",
        descripcion: "Materia teórica común a todas las carreras de la UBA. Te da herramientas para leer textos, argumentar y distinguir ciencia de lo que no lo es.",
        evaluacion: "Dos parciales teóricos. Aprobás con 4 y promocionás con 7. Hay recuperatorio por parcial.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Lunes y miércoles" },
          { sede: "San Isidro",           turno: "Turno tarde",  dias: "Martes y jueves" },
          { sede: "Avellaneda",           turno: "Turno noche",  dias: "Lunes y miércoles" }
        ]
      },
      {
        id: "icse", codigo: "ICSE", nombre: "Intr. al Conoc. de la Sociedad y el Estado",
        corto: "Sociedad y Estado", cursada: "Cuatrimestral", horas: "4 hs semanales",
        enMuestra: true, evalTipo: "parcial",
        descripcion: "Materia teórica común de la UBA. Mira cómo se formaron el Estado argentino y la sociedad en la que vas a ejercer como diseñador.",
        evaluacion: "Dos parciales teóricos. Aprobás con 4 y promocionás con 7. Hay recuperatorio por parcial.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Martes y jueves" },
          { sede: "San Isidro",           turno: "Turno tarde",  dias: "Lunes y miércoles" },
          { sede: "Avellaneda",           turno: "Turno noche",  dias: "Martes y jueves" }
        ]
      },
      {
        id: "icp2", codigo: "ICP II", nombre: "Intr. al Conocimiento Proyectual II",
        corto: "Conocimiento Proyectual II", cursada: "Cuatrimestral", horas: "8 hs semanales",
        enMuestra: false, evalTipo: "taller",
        descripcion: "La continuación del taller proyectual. Se encadena con Proyectual I y profundiza los ejercicios de composición y forma.",
        evaluacion: "No lleva parciales: tres trabajos prácticos —inicial, de proceso y entrega final—. Promocionás con 7.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Lunes y miércoles" },
          { sede: "San Isidro",           turno: "Turno tarde",  dias: "Martes y jueves" },
          { sede: "Paternal",             turno: "Turno noche",  dias: "Lunes y miércoles" }
        ]
      },
      {
        id: "fil", codigo: "FIL", nombre: "Filosofía",
        corto: "Filosofía", cursada: "Cuatrimestral", horas: "4 hs semanales",
        enMuestra: false, evalTipo: "parcial",
        descripcion: "Es la materia de orientación del CBC para Diseño Gráfico y Arquitectura. Introduce las grandes preguntas del pensamiento y te da herramientas para fundamentar tus proyectos.",
        evaluacion: "Dos parciales teóricos. Aprobás con 4 y promocionás con 7. Hay recuperatorio por parcial.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Martes y jueves" },
          { sede: "San Isidro",           turno: "Turno tarde",  dias: "Lunes y miércoles" },
          { sede: "Avellaneda",           turno: "Turno noche",  dias: "Martes y jueves" }
        ]
      },
      {
        id: "mat", codigo: "MAT", nombre: "Matemática",
        corto: "Matemática", cursada: "Cuatrimestral", horas: "6 hs semanales",
        enMuestra: false, evalTipo: "parcial",
        descripcion: "La otra materia de orientación para Diseño Gráfico. Ordena las herramientas de cálculo y geometría que vas a reencontrar en Morfología.",
        evaluacion: "Dos parciales. Aprobás con 4 y promocionás con 7. Hay recuperatorio por parcial.",
        comisiones: [
          { sede: "Ciudad Universitaria", turno: "Turno mañana", dias: "Lunes y miércoles" },
          { sede: "San Isidro",           turno: "Turno noche",  dias: "Martes y jueves" },
          { sede: "Avellaneda",           turno: "Turno tarde",  dias: "Lunes y miércoles" }
        ]
      }
    ]
  };

  /* ============================================================
     CARRERA — Diseño Gráfico. Cada año tiene 3 materias troncales de muestra
     (enMuestra: true: marcan el avance y el pasaje de año) más materias extra
     registrables. Se cursan hasta 4 por cuatrimestre: al llegar al tope, las
     demás del año se bloquean (igual que el CBC).
     ============================================================ */
  function materiaDiseno(id, codigo, nombre, habilita, correlativas, vertical) {
    return {
      id: id, codigo: codigo, nombre: nombre, cursada: "Anual", horas: "120 hs",
      area: "diseno", evalTipo: "taller", enMuestra: true,
      correlativas: correlativas || [],
      habilita: habilita || [],
      promocionDirecta: true,
      seleccionCatedra: vertical ? "vertical" : "elegir",
      catedras: CATEDRAS_DISENO,
      descripcion: "Taller troncal de la carrera. La cátedra que elegís en Diseño Gráfico I te acompaña hasta Diseño Gráfico IV: es una cátedra vertical.",
      evaluacion: "No lleva parciales: tres trabajos prácticos por año —uno al arranque, uno de mitad de cursada y la entrega final integradora—. Se promociona con 7; con 4 a 6 vas a entrega final."
    };
  }

  /* Materia extra del año (no troncal): registrable y sujeta al tope, pero no
     marca el pasaje de año. Da cuerpo a la grilla para ver el tope de 4. */
  function materiaExtra(id, codigo, nombre, evalTipo, descripcion) {
    return {
      id: id, codigo: codigo, nombre: nombre, cursada: "Anual", horas: "60 hs",
      area: "teorico", evalTipo: evalTipo || "parcial", enMuestra: false,
      correlativas: [], habilita: [], promocionDirecta: true,
      seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
      descripcion: descripcion,
      evaluacion: evalTipo === "taller"
        ? "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
        : evalTipo === "final"
          ? "Se aprueba con un trabajo final, según la cátedra que elijas."
          : "Dos parciales. Aprobás con 4 y promocionás con 7. Hay recuperatorio por parcial."
    };
  }

  var CARRERA = {
    id: "carrera",
    nombre: "Diseño Gráfico",
    plan: "2022",
    totalMaterias: 33,
    anios: [
      {
        numero: 1, ciclo: "Formación Inicial", acento: "celeste", total: 7, baseAprobadas: 7,
        materias: [
          materiaDiseno("dg1", "DG1", "Diseño Gráfico I", ["dg2"], [], false),
          {
            id: "tip1", codigo: "TIP1", nombre: "Tipografía I", cursada: "Anual", horas: "90 hs",
            area: "teorico", evalTipo: "taller", enMuestra: true, correlativas: [], habilita: ["tip2"], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Primera materia específica de tipografía: anatomía de la letra, familias y composición de texto.",
            evaluacion: "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
          },
          {
            id: "m1", codigo: "M1", nombre: "Morfología I", cursada: "Anual", horas: "90 hs",
            area: "teorico", evalTipo: "taller", enMuestra: true, correlativas: [], habilita: ["m2"], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Estudio de la forma, el espacio y la percepción visual aplicados al diseño.",
            evaluacion: "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
          },
          materiaExtra("c1", "C1", "Comunicación I", "parcial", "Teorías de la comunicación aplicadas al diseño: emisor, mensaje y audiencia."),
          materiaExtra("h1", "H1", "Historia I", "parcial", "Panorama histórico del diseño y la cultura visual, del siglo XIX a hoy.")
        ]
      },
      {
        numero: 2, ciclo: "Formación Media", acento: "violeta", total: 7, baseAprobadas: 14,
        materias: [
          materiaDiseno("dg2", "DG2", "Diseño Gráfico II", ["dg3"], ["dg1"], true),
          {
            id: "tip2", codigo: "TIP2", nombre: "Tipografía II", cursada: "Anual", horas: "90 hs",
            area: "teorico", evalTipo: "taller", enMuestra: true, correlativas: ["tip1"], habilita: [], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Tipografía aplicada a sistemas, editorial y pantalla.",
            evaluacion: "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
          },
          {
            id: "m2", codigo: "M2", nombre: "Morfología II", cursada: "Anual", horas: "90 hs",
            area: "teorico", evalTipo: "taller", enMuestra: true, correlativas: ["m1"], habilita: [], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Morfología aplicada a estructuras tridimensionales y sistemas visuales.",
            evaluacion: "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
          },
          materiaExtra("c2", "C2", "Comunicación II", "parcial", "Comunicación aplicada a campañas y sistemas de mensajes."),
          materiaExtra("h2", "H2", "Historia II", "parcial", "Historia del diseño gráfico argentino y latinoamericano.")
        ]
      },
      {
        numero: 3, ciclo: "Formación Superior", acento: "amarillo", total: 6, baseAprobadas: 21,
        materias: [
          materiaDiseno("dg3", "DG3", "Diseño Gráfico III", ["dg4"], ["dg2"], true),
          {
            id: "me2", codigo: "ME2", nombre: "Medios Expresivos II", cursada: "Anual", horas: "90 hs",
            area: "teorico", evalTipo: "taller", enMuestra: true, correlativas: [], habilita: [], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Recursos expresivos y técnicas de representación para proyectos de diseño.",
            evaluacion: "Materia de taller: tres trabajos prácticos —inicial, de proceso y entrega final—. Promoción con 7."
          },
          {
            id: "leg", codigo: "LEG", nombre: "Legislación", cursada: "Cuatrimestral", horas: "60 hs",
            area: "teorico", evalTipo: "parcial", enMuestra: true, correlativas: [], habilita: [], promocionDirecta: false,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Marco legal del ejercicio profesional: derechos de autor, propiedad intelectual y contratos.",
            evaluacion: "Dos parciales teóricos y final obligatorio."
          },
          materiaExtra("c3", "C3", "Comunicación III", "parcial", "Comunicación estratégica y análisis de públicos para proyectos de marca."),
          materiaExtra("h3", "H3", "Historia III", "parcial", "Movimientos contemporáneos y debates actuales del diseño.")
        ]
      },
      {
        numero: 4, ciclo: "Formación Profesional", acento: "coral", total: 6, baseAprobadas: 27,
        materias: [
          materiaDiseno("dg4", "DG4", "Diseño Gráfico IV", [], ["dg3"], true),
          {
            id: "eo1", codigo: "EO1", nombre: "Electiva Orientada I", cursada: "Cuatrimestral", horas: "60 hs",
            area: "electiva", evalTipo: "final", enMuestra: true, correlativas: [], habilita: [], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Materia electiva: elegís un recorte temático dentro de la oferta de la carrera.",
            evaluacion: "Trabajo final según la cátedra elegida."
          },
          {
            id: "eo2", codigo: "EO2", nombre: "Electiva Orientada II", cursada: "Cuatrimestral", horas: "60 hs",
            area: "electiva", evalTipo: "final", enMuestra: true, correlativas: [], habilita: [], promocionDirecta: true,
            seleccionCatedra: "turnos", catedras: CATEDRAS_GENERICAS,
            descripcion: "Segunda electiva orientada. Es la última materia del plan: al aprobarla te recibís.",
            evaluacion: "Trabajo final según la cátedra elegida.",
            ultima: true
          },
          materiaExtra("opt1", "OPT1", "Optativa I", "final", "Materia optativa: elegís un tema de la oferta general de la facultad."),
          materiaExtra("sem1", "SEM1", "Seminario I", "final", "Seminario de investigación breve sobre un tema de la carrera.")
        ]
      }
    ]
  };

  /* ============================================================
     DATOS INSTITUCIONALES VERIFICADOS (sección 7)
     ============================================================ */
  var FADU = {
    direccion: "Intendente Güiraldes 2160, Pabellón III, Ciudad Universitaria, CABA",
    colectivos: ["28", "33", "34", "37", "42", "55", "107", "160", "166"],
    trenes: ["Belgrano Norte (est. Ciudad Universitaria)", "Mitre ramal Tigre (Belgrano C)"],
    ecobici: true,
    carreras: 7
  };

  var CALENDARIO_2026 = [
    { fecha: "10–19 mar", mes: "MAR", dia: "10", tipo: "inscripcion", titulo: "Inscripción general", cuando: "10 al 19 de marzo" },
    { fecha: "30 abr",    mes: "ABR", dia: "30", tipo: "inicio",      titulo: "Inicio 1er cuatrimestre", cuando: "Jueves 30 de abril" },
    { fecha: "4–5 may",   mes: "MAY", dia: "04", tipo: "inscripcion", titulo: "Inscripción a mesas de examen", cuando: "4 y 5 de mayo" },
    { fecha: "11–22 may", mes: "MAY", dia: "11", tipo: "final",       titulo: "Exámenes finales", cuando: "11 al 22 de mayo" },
    { fecha: "3–4 ago",   mes: "AGO", dia: "03", tipo: "inscripcion", titulo: "Inscripción 2do cuatrimestre", cuando: "3 y 4 de agosto" },
    { fecha: "10 ago",    mes: "AGO", dia: "10", tipo: "inicio",      titulo: "Inicio 2do cuatrimestre", cuando: "Lunes 10 de agosto" }
  ];

  var TITULO = {
    online: true,
    contacto: "titulos.fadu@uba.ar",
    oficina: "Planta baja. Consultas martes de 11 a 13 y de 14 a 19.",
    instructivos: ["Instructivo de solicitud", "Instructivo de pago"]
  };

  var POSGRADO = {
    totales: { maestrias: 14, especializaciones: 19 },
    especializacion: {
      nombre: "Especialización en Diseño y Gestión de Marcas y Sistemas de Identidad",
      documentacion: [
        "Ficha de inscripción firmada",
        "Normas firmadas",
        "Foto 4×4",
        "Fotocopia de DNI",
        "Dos fotocopias A4 del título legalizadas sólo por Rectorado"
      ],
      legalizacion: "Rectorado UBA: José E. Uriburu 950, subsuelo, de 9 a 16, con turno por internet."
    }
  };

  /* La jerga del CBC (A5) */
  var JERGA = [
    { palabra: "Cátedra", def: "El equipo de docentes que dicta una materia con su propia mirada. En la carrera elegís entre varias." },
    { palabra: "Comisión", def: "El grupo y horario puntual en el que cursás. En el CBC elegís sede y turno, todavía no cátedra." },
    { palabra: "Correlativa", def: "Una materia que tenés que tener aprobada para poder anotarte en otra." }
  ];

  /* Facultades de la UBA (A7): sólo FADU habilitada */
  var FACULTADES = [
    { id: "fadu", nombre: "Arquitectura, Diseño y Urbanismo", sigla: "FADU", habilitada: true },
    { id: "fce",  nombre: "Ciencias Económicas", sigla: "FCE", habilitada: false },
    { id: "fd",   nombre: "Derecho", sigla: "Derecho", habilitada: false },
    { id: "fmed", nombre: "Medicina", sigla: "Medicina", habilitada: false },
    { id: "fcen", nombre: "Ciencias Exactas y Naturales", sigla: "Exactas", habilitada: false },
    { id: "ffyl", nombre: "Filosofía y Letras", sigla: "Filo", habilitada: false },
    { id: "fsoc", nombre: "Ciencias Sociales", sigla: "Sociales", habilitada: false },
    { id: "fpsi", nombre: "Psicología", sigla: "Psico", habilitada: false }
  ];

  /* Carreras de FADU (A8) */
  var CARRERAS_FADU = [
    { id: "dg",  nombre: "Diseño Gráfico", habilitada: true },
    { id: "arq", nombre: "Arquitectura", habilitada: false },
    { id: "di",  nombre: "Diseño Industrial", habilitada: false },
    { id: "din", nombre: "Diseño de Indumentaria", habilitada: false },
    { id: "dis", nombre: "Diseño de Imagen y Sonido", habilitada: false },
    { id: "du",  nombre: "Diseño del Paisaje", habilitada: false },
    { id: "pu",  nombre: "Planificación Urbana", habilitada: false }
  ];

  /* ============================================================
     ÁRBOL de correlatividades por año (estados base: ap/cu/ha/bl)
     El render superpone el estado real de las materias que se trackean.
     ============================================================ */
  var ARBOL_ANIOS = {
    1: {
      acento: "celeste",
      filas: [
        [{ c: "DG1", s: "ha" }, { c: "M1", s: "ha" }, { c: "TIP1", s: "ha" }],
        [{ c: "C1", s: "ha" }, { c: "H1", s: "ha" }, { c: "TEC1", s: "ha" }],
        [{ c: "DG2", s: "bl" }, { c: "M2", s: "bl" }, { c: "TIP2", s: "bl" }],
        [null, { c: "DG3", s: "bl" }, null]
      ],
      callout: { t: "Todo 1º está habilitado", x: "En el primer año no hay correlativas entre materias: se te abre todo junto. Lo que se traba es 2º." }
    },
    2: {
      acento: "violeta",
      filas: [
        [{ c: "DG1", s: "ap" }, { c: "M1", s: "ap" }, { c: "TIP1", s: "ap" }],
        [{ c: "DG2", s: "cu" }, { c: "M2", s: "cu" }, { c: "TIP2", s: "ha" }],
        [{ c: "C2", s: "ha" }, { c: "H2", s: "ha" }, { c: "TEC2", s: "ha" }],
        [null, { c: "DG3", s: "bl" }, null]
      ],
      callout: { t: "Acá se traba por primera vez", x: "DG3 no se abre hasta que apruebes DG2. Por eso DG2 es la materia que ordena todo tu año." }
    },
    3: {
      acento: "amarillo",
      filas: [
        [{ c: "DG1", s: "ap" }, { c: "M1", s: "ap" }, { c: "TIP1", s: "ap" }],
        [{ c: "DG2", s: "ap" }, { c: "M2", s: "ap" }, { c: "TIP2", s: "ap" }],
        [{ c: "DG3", s: "cu" }, { c: "LEG", s: "cu" }, { c: "ME2", s: "ha" }],
        [null, { c: "DG4", s: "bl" }, null]
      ],
      callout: { t: "Queda una sola traba", x: "DG4 espera a DG3. Todo lo demás de este año lo podés cursar en el orden que quieras." }
    },
    4: {
      acento: "coral",
      sinLineas: true,
      filas: [
        [null, { c: "DG4", s: "cu" }, null],
        [{ c: "EO1", s: "cu" }, { c: "EO2", s: "ha" }, { c: "OPT1", s: "ap" }],
        [{ c: "OPT2", s: "ap" }, { c: "SEM1", s: "ap" }, { c: "SEM2", s: "ha" }],
        [null, { c: "SEM3", s: "ha" }, null]
      ],
      callout: { t: "Acá ya no hay correlativas", x: "DG4 es la última troncal. El resto son electivas, optativas y seminarios: el orden lo elegís vos." }
    }
  };

  /* ============================================================
     AGENDA por año (semana + próximas fechas)
     ============================================================ */
  var AGENDA_ANIOS = {
    1: {
      mes: "Marzo 2027",
      semana: [{ d: 8 }, { d: 9, on: 1 }, { d: 10, on: 1 }, { d: 11, on: 1 }, { d: 12, on: 1 }, { d: 13 }, { d: 14 }],
      eventos: [
        { fecha: "10 al 19", mes: "MAR", titulo: "Inscripción general a materias", sub: "Primera inscripción de tu carrera", destacado: true },
        { fecha: "22", mes: "MAR", titulo: "Arranca la cursada", sub: "DG1, M1 y TIP1 son anuales" },
        { fecha: "4 y 5", mes: "MAY", titulo: "Inscripción a mesas de mayo", sub: "Exámenes del 11 al 22" }
      ]
    },
    2: {
      mes: "Abril 2028",
      semana: [{ d: 3, on: 1 }, { d: 4 }, { d: 5, on: 1 }, { d: 6 }, { d: 7 }, { d: 8 }, { d: 9 }],
      eventos: [
        { fecha: "30", mes: "ABR", titulo: "Inscripción al 1er cuatrimestre", sub: "Último llamado", destacado: true },
        { fecha: "11 al 22", mes: "MAY", titulo: "Exámenes de mayo", sub: "Historia I si quedó pendiente" },
        { fecha: "10", mes: "AGO", titulo: "Inicio del 2do cuatrimestre", sub: "" }
      ]
    },
    3: {
      mes: "Marzo 2029",
      semana: [{ d: 5, on: 1 }, { d: 6 }, { d: 7, on: 1 }, { d: 8 }, { d: 9, on: 1 }, { d: 10 }, { d: 11 }],
      eventos: [
        { fecha: "10 al 19", mes: "MAR", titulo: "Inscripción general a materias", sub: "Acá podés sumar optativas", destacado: true },
        { fecha: "6 al 10", mes: "ABR", titulo: "Prórroga de trabajos prácticos", sub: "Si venís justo con DG3" },
        { fecha: "11 al 22", mes: "MAY", titulo: "Exámenes de mayo", sub: "" }
      ]
    },
    4: {
      mes: "Agosto 2030",
      semana: [{ d: 5, on: 1 }, { d: 6 }, { d: 7, on: 1 }, { d: 8, on: 1 }, { d: 9 }, { d: 10 }, { d: 11 }],
      eventos: [
        { fecha: "3 y 4", mes: "AGO", titulo: "Inscripción al 2do cuatrimestre", sub: "Limitada a dos asignaturas", destacado: true },
        { fecha: "10", mes: "AGO", titulo: "Inicio del 2do cuatrimestre", sub: "Último cuatrimestre de la carrera" },
        { fecha: "9 al 22", mes: "DIC", titulo: "Exámenes de diciembre", sub: "Si cerrás acá, te recibís" }
      ]
    }
  };

  /* ============================================================
     PLAN por año (callout + categorías + regla DG 2022)
     ============================================================ */
  var PLAN_REGLA = "2 electivas orientadas + 2 optativas + 3 seminarios + 1 socio-humanística para recibirte.";
  var PLAN_ANIOS = {
    1: {
      acento: "celeste",
      titulo: "Te faltan 26 materias",
      texto: "Son cuatro años. Este primero son 7 materias: tres anuales y cuatro cuatrimestrales.",
      cats: [{ n: "Obligatorias", h: 7, t: 26 }, { n: "Electivas orientadas", h: 0, t: 2 }, { n: "Optativas", h: 0, t: 2 }, { n: "Seminarios", h: 0, t: 3 }]
    },
    2: {
      acento: "violeta",
      titulo: "Vas por la mitad",
      texto: "Catorce materias cerradas de 33. Este año son siete y dos son anuales.",
      cats: [{ n: "Obligatorias", h: 14, t: 26 }, { n: "Electivas orientadas", h: 0, t: 2 }, { n: "Optativas", h: 0, t: 2 }, { n: "Seminarios", h: 0, t: 3 }]
    },
    3: {
      acento: "amarillo",
      titulo: "Te faltan 12 materias",
      texto: "Ya cerraste dos años. Desde acá conviene adelantar optativas y seminarios para descomprimir 4º.",
      cats: [{ n: "Obligatorias", h: 21, t: 26 }, { n: "Electivas orientadas", h: 0, t: 2 }, { n: "Optativas", h: 1, t: 2 }, { n: "Seminarios", h: 0, t: 3 }]
    },
    4: {
      acento: "coral",
      titulo: "Te faltan 6",
      texto: "Son DG4, una electiva orientada, dos seminarios y la socio-humanística. Nada más.",
      cats: [{ n: "Obligatorias", h: 26, t: 26 }, { n: "Electivas orientadas", h: 1, t: 2 }, { n: "Optativas", h: 2, t: 2 }, { n: "Seminarios", h: 1, t: 3 }]
    }
  };

  /* ---- Índice plano de todas las materias por id ---- */
  var INDICE = {};
  CBC.materias.forEach(function (m) { INDICE[m.id] = { etapa: "cbc", materia: m }; });
  CARRERA.anios.forEach(function (a) {
    a.materias.forEach(function (m) { INDICE[m.id] = { etapa: "carrera", anio: a.numero, materia: m }; });
  });

  window.DATA = {
    CBC: CBC,
    CARRERA: CARRERA,
    CATEDRAS_DISENO: CATEDRAS_DISENO,
    FADU: FADU,
    CALENDARIO_2026: CALENDARIO_2026,
    TITULO: TITULO,
    POSGRADO: POSGRADO,
    JERGA: JERGA,
    FACULTADES: FACULTADES,
    CARRERAS_FADU: CARRERAS_FADU,
    ARBOL_ANIOS: ARBOL_ANIOS,
    AGENDA_ANIOS: AGENDA_ANIOS,
    PLAN_ANIOS: PLAN_ANIOS,
    PLAN_REGLA: PLAN_REGLA,
    INDICE: INDICE,
    /* Helper: devuelve { etapa, anio?, materia } o null */
    buscarMateria: function (id) { return INDICE[id] || null; }
  };
})();
