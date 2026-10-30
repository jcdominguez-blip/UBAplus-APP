/* ============================================================
   estado.js — Progreso del alumno en localStorage
   Expone window.ESTADO con la API de lectura/escritura y las
   reglas de negocio (sección 9 del contexto).
   ============================================================ */
(function () {
  "use strict";

  var CLAVE = "uba-app:progreso";

  var INICIAL = {
    nombre: "Juan Pérez",
    iniciales: "JP",
    legajo: "1.234.567/26",
    facultad: "fadu",
    carrera: "dg",
    etapa: "onboarding",   // "onboarding" | "cbc" | "carrera" | "graduado"
    anioActual: 1,
    catedraDiseno: null,   // se fija al elegir en DG1 y ya no cambia
    materias: {}           // { dg1: { estado, catedra, comision, notas } }
  };

  // Estados posibles de una materia:
  // "no-inscripta" | "inscripta" | "cursando" | "aprobada" | "desaprobada" | "libre"

  function cargar() {
    try {
      var raw = localStorage.getItem(CLAVE);
      if (!raw) return clonar(INICIAL);
      var guardado = JSON.parse(raw);
      // Merge defensivo por si cambia el shape
      return Object.assign(clonar(INICIAL), guardado);
    } catch (e) {
      return clonar(INICIAL);
    }
  }

  function guardar(estado) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch (e) { /* almacenamiento no disponible: la app sigue funcionando en memoria */ }
  }

  function clonar(obj) { return JSON.parse(JSON.stringify(obj)); }

  var estado = cargar();

  /* ---------------- Lectura ---------------- */
  function get() { return estado; }

  function estadoMateria(id) {
    var m = estado.materias[id];
    return m ? m.estado : "no-inscripta";
  }

  function datosMateria(id) {
    return estado.materias[id] || { estado: "no-inscripta" };
  }

  /* ¿Está aprobada? */
  function aprobada(id) { return estadoMateria(id) === "aprobada"; }

  /* Regla 1: una materia se habilita sólo si todas sus correlativas están aprobadas */
  function habilitada(materia) {
    if (!materia.correlativas || materia.correlativas.length === 0) return true;
    return materia.correlativas.every(aprobada);
  }

  /* Regla 2: en el CBC, máximo 3 materias inscriptas por cuatrimestre */
  function inscriptasCBC() {
    return window.DATA.CBC.materias.filter(function (m) {
      var e = estadoMateria(m.id);
      return e === "inscripta" || e === "cursando";
    }).length;
  }
  function puedeInscribirCBC() { return inscriptasCBC() < 3; }

  /* ---------------- Escritura ---------------- */
  function setMateria(id, patch) {
    estado.materias[id] = Object.assign(datosMateria(id), patch);
    guardar(estado);
  }

  function inscribir(id, seleccion) {
    var info = window.DATA.buscarMateria(id);
    var patch = { estado: "inscripta" };
    if (info && info.etapa === "cbc") {
      patch.comision = seleccion;
    } else {
      patch.catedra = seleccion;
      // Regla 3: la cátedra de Diseño se fija en DG1 y se arrastra
      if (id === "dg1" && !estado.catedraDiseno) {
        estado.catedraDiseno = seleccion;
      }
    }
    setMateria(id, patch);
  }

  function empezarCursada(id) { setMateria(id, { estado: "cursando" }); }

  function aprobar(id) {
    setMateria(id, { estado: "aprobada" });
    return revisarHitos(id);
  }

  function desaprobar(id) { setMateria(id, { estado: "desaprobada" }); }

  function quedarLibre(id) { setMateria(id, { estado: "libre" }); }

  function recursar(id, nuevaCatedra) {
    var patch = { estado: "inscripta" };
    if (nuevaCatedra) patch.catedra = nuevaCatedra;
    setMateria(id, patch);
  }

  /* ---------------- Hitos y avance de etapa ---------------- */

  /* Materias de la muestra del CBC (las interactivas) */
  function muestraCBC() {
    return window.DATA.CBC.materias.filter(function (m) { return m.enMuestra; });
  }
  function aprobadasMuestraCBC() {
    return muestraCBC().filter(function (m) { return aprobada(m.id); }).length;
  }
  /* El CBC se cierra al aprobar las 3 de la muestra (compresión de las 7) */
  function cbcCompleto() {
    return aprobadasMuestraCBC() >= muestraCBC().length;
  }
  /* Para el dashboard: muestra "X de 7". Salta a 7 cuando están las 3. */
  function aprobadasCBC() {
    return cbcCompleto() ? window.DATA.CBC.total : aprobadasMuestraCBC();
  }

  /* Cuenta aprobadas de un año de la carrera (de la muestra) */
  function aprobadasAnio(numero) {
    var anio = window.DATA.CARRERA.anios[numero - 1];
    if (!anio) return 0;
    return anio.materias.filter(function (m) { return aprobada(m.id); }).length;
  }

  /* Total de materias aprobadas de la carrera, comprimido según la muestra.
     baseAprobadas del año + aprobadas de la muestra de ese año. */
  function totalAprobadasCarrera() {
    var anio = window.DATA.CARRERA.anios[estado.anioActual - 1];
    if (!anio) return 7;
    var aprob = aprobadasAnio(estado.anioActual);
    // Año completo: salta al acumulado total del año (compresión de la muestra)
    if (aprob >= anio.materias.length) return anio.baseAprobadas + anio.total;
    return anio.baseAprobadas + aprob;
  }

  /* Devuelve el id del hito disparado al aprobar, o null */
  function revisarHitos(idAprobada) {
    var info = window.DATA.buscarMateria(idAprobada);
    if (!info) return null;

    if (info.etapa === "cbc") {
      // Aprobar las 3 de la muestra cierra el CBC (compresión de las 7)
      if (cbcCompleto()) {
        return { tipo: "cierre-cbc" };
      }
      return null;
    }

    if (info.etapa === "carrera") {
      var numero = info.anio;
      var anio = window.DATA.CARRERA.anios[numero - 1];
      // Regla 4: aprobar la 3ra materia de la muestra del año dispara el pasaje
      if (aprobadasAnio(numero) >= anio.materias.length) {
        var materia = info.materia;
        if (materia.ultima) {
          // Regla 5: aprobar las 33 lleva a graduado
          return { tipo: "fin-carrera" };
        }
        if (numero < 4) {
          return { tipo: "pasaje-anio", desde: numero, hacia: numero + 1 };
        }
      }
      return null;
    }
    return null;
  }

  /* Cierra el CBC y habilita la carrera */
  function cerrarCBC() {
    estado.etapa = "carrera";
    estado.anioActual = 1;
    guardar(estado);
  }

  /* Pasa al año siguiente */
  function pasarAnio(hacia) {
    estado.anioActual = hacia;
    if (estado.etapa === "cbc") estado.etapa = "carrera";
    guardar(estado);
  }

  /* Marca al alumno como graduado */
  function graduarse() {
    estado.etapa = "graduado";
    guardar(estado);
  }

  /* Avanza de onboarding a CBC */
  function empezarCBC() {
    estado.etapa = "cbc";
    guardar(estado);
  }

  /* Reinicia todo el progreso (para demo) */
  function reiniciar() {
    estado = clonar(INICIAL);
    guardar(estado);
  }

  /* Setea la etapa directamente (navegación del hub) */
  function setEtapa(etapa) {
    estado.etapa = etapa;
    guardar(estado);
  }

  window.ESTADO = {
    get: get,
    estadoMateria: estadoMateria,
    datosMateria: datosMateria,
    aprobada: aprobada,
    habilitada: habilitada,
    inscriptasCBC: inscriptasCBC,
    puedeInscribirCBC: puedeInscribirCBC,
    aprobadasCBC: aprobadasCBC,
    cbcCompleto: cbcCompleto,
    aprobadasAnio: aprobadasAnio,
    totalAprobadasCarrera: totalAprobadasCarrera,
    inscribir: inscribir,
    empezarCursada: empezarCursada,
    aprobar: aprobar,
    desaprobar: desaprobar,
    quedarLibre: quedarLibre,
    recursar: recursar,
    cerrarCBC: cerrarCBC,
    pasarAnio: pasarAnio,
    graduarse: graduarse,
    empezarCBC: empezarCBC,
    setEtapa: setEtapa,
    reiniciar: reiniciar
  };
})();
