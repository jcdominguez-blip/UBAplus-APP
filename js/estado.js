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

  /* Regla 2: se cursan como máximo 4 materias por cuatrimestre.
     Vale para el CBC y para cada año de la carrera (mismo mecanismo).
     Un "ámbito" es "cbc" o el número de año (1-4). */
  var TOPE_CUATRIMESTRE = 4;

  function materiasDeAmbito(ambito) {
    if (ambito === "cbc") return window.DATA.CBC.materias;
    var anio = window.DATA.CARRERA.anios[ambito - 1];
    return anio ? anio.materias : [];
  }
  /* Materias del ámbito que ya estás llevando (anotadas o cursando) */
  function enCurso(ambito) {
    return materiasDeAmbito(ambito).filter(function (m) {
      var e = estadoMateria(m.id);
      return e === "inscripta" || e === "cursando";
    }).length;
  }
  /* ¿Llegaste al tope de materias por cuatrimestre en este ámbito? */
  function topeAlcanzado(ambito) { return enCurso(ambito) >= TOPE_CUATRIMESTRE; }
  function puedeAnotar(ambito) { return enCurso(ambito) < TOPE_CUATRIMESTRE; }

  /* Compat: el CBC es el ámbito "cbc" */
  function inscriptasCBC() { return enCurso("cbc"); }
  function puedeInscribirCBC() { return puedeAnotar("cbc"); }

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
      // Regla 3: la cátedra de Diseño es vertical. La que elegís —en DG1 o al
      // cambiarte más adelante— pasa a ser la cátedra de la cadena de ahí en más.
      if (info && info.materia && info.materia.area === "diseno") {
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

  /* Materias troncales (muestra) de un año: marcan el avance y el pasaje.
     Las materias extra del año no cuentan para la progresión. */
  function materiasMuestraAnio(numero) {
    var anio = window.DATA.CARRERA.anios[numero - 1];
    if (!anio) return [];
    return anio.materias.filter(function (m) { return m.enMuestra; });
  }
  /* Cuenta aprobadas de la muestra de un año de la carrera */
  function aprobadasAnio(numero) {
    return materiasMuestraAnio(numero).filter(function (m) { return aprobada(m.id); }).length;
  }

  /* Total de materias aprobadas de la carrera, comprimido según la muestra.
     baseAprobadas del año + aprobadas de la muestra de ese año. */
  function totalAprobadasCarrera() {
    var anio = window.DATA.CARRERA.anios[estado.anioActual - 1];
    if (!anio) return 7;
    var aprob = aprobadasAnio(estado.anioActual);
    // Año completo: salta al acumulado total del año (compresión de la muestra)
    if (aprob >= materiasMuestraAnio(estado.anioActual).length) return anio.baseAprobadas + anio.total;
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
      // Regla 4: aprobar todas las troncales (muestra) del año dispara el pasaje
      if (aprobadasAnio(numero) >= materiasMuestraAnio(numero).length) {
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

  /* Regla 5 (visible): al aprobar una materia, ¿qué materias quedan recién
     habilitadas? Devuelve los info {etapa, anio, materia} de las materias que
     esta aprobación destraba (todas sus correlativas ya aprobadas) y que todavía
     no cursaste. Sirve para avisar que la carrera no es lineal. */
  function habilitadasAlAprobar(idAprobada) {
    var info = window.DATA.buscarMateria(idAprobada);
    if (!info || !info.materia.habilita || !info.materia.habilita.length) return [];
    return info.materia.habilita
      .map(function (depId) { return window.DATA.buscarMateria(depId); })
      .filter(function (x) {
        if (!x) return false;
        if (aprobada(x.materia.id)) return false;
        var e = estadoMateria(x.materia.id);
        if (e === "inscripta" || e === "cursando") return false;
        return habilitada(x.materia); // todas sus correlativas ya están aprobadas
      });
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
    enCurso: enCurso,
    topeAlcanzado: topeAlcanzado,
    puedeAnotar: puedeAnotar,
    TOPE_CUATRIMESTRE: TOPE_CUATRIMESTRE,
    inscriptasCBC: inscriptasCBC,
    puedeInscribirCBC: puedeInscribirCBC,
    habilitadasAlAprobar: habilitadasAlAprobar,
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
