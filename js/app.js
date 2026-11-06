/* ============================================================
   app.js — Arranque y lógica por página
   Enrutamiento simple por <body data-page="…">. Usa DATA, ESTADO, UI.
   ============================================================ */
(function () {
  "use strict";

  var D = window.DATA, E = window.ESTADO, U = window.UI;

  /* ---------------- Helpers ---------------- */
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function go(href) { window.location.href = href; }
  function el(id) { return document.getElementById(id); }
  var APP = function () { return el("app"); };
  /* Host de overlays: el .app (position:relative), para cubrir sólo el teléfono */
  function overlayHost() { return document.querySelector(".app") || APP(); }

  /* Fila de materia del seguimiento, con tope por cuatrimestre y correlatividad.
     ambito: "cbc" o el número de año de la carrera. La materia se bloquea si le
     falta una correlativa (bloqueadaCorrel) o si ya llegaste al tope de 4 y
     todavía no la estás llevando. Las que ya anotaste/cursás/aprobaste no se tocan. */
  function filaMateriaSeguimiento(m, ambito, opts) {
    opts = opts || {};
    var est = E.estadoMateria(m.id);
    var registrada = est !== "no-inscripta";
    var bloqCorrel = opts.bloqueadaCorrel === true;
    var bloqTope = !registrada && !bloqCorrel && E.topeAlcanzado(ambito);
    var bloqueada = bloqCorrel || bloqTope;
    var meta;
    if (bloqCorrel) meta = "Te falta la correlativa";
    else if (bloqTope) meta = "Máximo " + E.TOPE_CUATRIMESTRE + " por cuatrimestre";
    else {
      var cuenta = (ambito === "cbc")
        ? (m.comisiones ? m.comisiones.length + " comisiones" : null)
        : (m.catedras ? m.catedras.length + " cátedras" : null);
      meta = m.cursada + (cuenta ? " · " + cuenta : "");
    }
    var etapaQS = (ambito === "cbc") ? "cbc" : "carrera";
    return U.filaMateria(m, est, {
      href: bloqueada ? null : ("materia.html?etapa=" + etapaQS + "&id=" + m.id),
      bloqueada: bloqueada,
      codigoPrefijo: opts.codigoPrefijo === true,
      meta: meta
    });
  }

  /* Instancias de evaluación de una materia según su carácter (ajuste 4).
     Taller → tres trabajos prácticos (inicio, mitad, final); teórica → parciales;
     electiva → un trabajo final. */
  function instanciasEvaluacion(m) {
    var tipo = m.evalTipo || "parcial";
    if (tipo === "taller") {
      return {
        titulo: "Trabajos prácticos",
        nota: "Es una materia de taller: no lleva parciales. Se promociona con las tres entregas; la carpeta y la asistencia cuentan.",
        instancias: [
          { key: "tp1", titulo: "TP1 · Inicio de cursada" },
          { key: "tp2", titulo: "TP2 · Mitad de cursada" },
          { key: "tpf", titulo: "TP Final · Entrega integradora" }
        ]
      };
    }
    if (tipo === "final") {
      return {
        titulo: "Evaluación",
        nota: "Se aprueba con un trabajo final, según la cátedra que elijas.",
        instancias: [
          { key: "tf", titulo: "Trabajo final" }
        ]
      };
    }
    return {
      titulo: "Parciales",
      nota: "Aprobás con 4 en cada parcial y promocionás con 7. Si desaprobás uno, hay recuperatorio.",
      instancias: [
        { key: "p1", titulo: "1er parcial" },
        { key: "p2", titulo: "2do parcial" }
      ]
    };
  }

  /* Aplica la clase de etapa/año al <body> para que --acento se reescriba */
  function pintarEtapa(etapa, anio) {
    var b = document.body;
    b.classList.remove("etapa-cbc", "etapa-carrera", "etapa-posgrado",
                       "anio-1", "anio-2", "anio-3", "anio-4");
    if (etapa === "cbc") b.classList.add("etapa-cbc");
    else if (etapa === "graduado") b.classList.add("etapa-carrera");
    else if (etapa === "posgrado") b.classList.add("etapa-posgrado");
    else { b.classList.add("etapa-carrera"); if (anio) b.classList.add("anio-" + anio); }
  }

  /* ============================================================
     PÁGINA: Onboarding (index.html)
     Splash → bienvenida → interés → FADU → jerga → registro →
     facultad → carrera. Un stepper simple en una sola página.
     ============================================================ */
  function pageOnboarding() {
    pintarEtapa("cbc");
    var paso = 0;
    var pasos = [splash, bienvenida, interes, interesFadu, jerga, registro, facultad, carrera];

    function avanzar() { paso++; if (paso < pasos.length) pasos[paso](); }

    function montar(cfg) {
      cfg.nav = null;
      U.montarApp(APP(), cfg);
    }

    /* Barra superior de las 4 pantallas con dots + Saltar */
    function topDots(idx) {
      var dots = "";
      for (var i = 0; i < 4; i++) dots += '<span class="dot' + (i === idx ? " on" : "") + '"></span>';
      return '<header class="app-header onboarding-top">' +
        '<div class="dots">' + dots + "</div>" +
        '<button class="saltar" type="button" data-saltar>Saltar</button></header>';
    }
    function cablearSaltar() {
      var b = document.querySelector("[data-saltar]");
      if (b) b.onclick = function () { paso = 5; pasos[paso](); }; // salta a registro
    }

    function splash() {
      montar({
        main:
          '<div class="splash">' +
          '<img src="img/LOGO-ACRO-INV.svg" alt="UBA+" class="splash-logo">' +
          '<div class="splash-tagline">Tu recorrido universitario</div>' +
          "</div>"
      });
      setTimeout(avanzar, 1800);
    }

    function bienvenida() {
      montar({
        header: topDots(0),
        main:
          '<figure class="onb-ilustracion"><img src="img/ilustracion.png" alt="" width="330" height="220"></figure>' +
          '<h1 class="t-display-l" style="margin-bottom:16px">Saliste del secundario. Y ahora, ¿qué?</h1>' +
          '<p class="t-base muted">La UBA tiene 13 facultades y más de cien carreras, y nadie te explicó cómo ' +
          "funciona ninguna. Esta app te acompaña desde el primer día del CBC hasta el día que retirás tu título: " +
          "es tu mapa para entender y seguir la carrera, no te inscribe a las materias.</p>",
        cta:
          '<button class="btn btn-etapa" id="cta">Dale, empecemos</button>' +
          '<p class="t-caption muted center" style="margin-top:10px">Son cuatro pantallas. Te lleva un minuto.</p>'
      });
      el("cta").onclick = avanzar;
      cablearSaltar();
    }

    function interes() {
      var afinidades = [
        "Películas y series", "Dibujo y arte", "Construcciones", "Computadoras",
        "Animales", "Salud", "Números", "Leer y escribir", "Naturaleza",
        "Gente y sociedad", "Armar cosas"
      ];
      // Paleta que se asigna a los tags elegidos, en orden
      var paleta = ["lima", "naranja", "lavanda", "celeste", "amarillo", "rosa"];
      montar({
        header: topDots(1),
        main:
          '<h1 class="t-h1">¿Qué cosas te gustan?</h1>' +
          '<p class="t-base muted" style="margin:8px 0 20px">Elegí las que vayan con vos. ' +
          "No es un test vocacional: es un punto de partida.</p>" +
          '<div class="tags" id="tags">' +
          afinidades.map(function (a, i) {
            return '<button class="tag" type="button" aria-pressed="false" data-i="' + i + '">' + U.esc(a) + "</button>";
          }).join("") +
          "</div>",
        cta: '<button class="btn btn-etapa" id="cta" disabled aria-disabled="true">Ver qué me puede gustar</button>'
      });

      var seleccionados = [];
      var tags = el("tags");
      tags.querySelectorAll(".tag").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = b.getAttribute("data-i");
          var pos = seleccionados.indexOf(i);
          if (pos >= 0) {
            seleccionados.splice(pos, 1);
            b.setAttribute("aria-pressed", "false");
            b.removeAttribute("data-color");
          } else {
            seleccionados.push(i);
            b.setAttribute("aria-pressed", "true");
            b.setAttribute("data-color", paleta[(seleccionados.length - 1) % paleta.length]);
          }
          var c = el("cta");
          var hay = seleccionados.length > 0;
          c.disabled = !hay;
          c.setAttribute("aria-disabled", hay ? "false" : "true");
        });
      });
      el("cta").onclick = avanzar;
      cablearSaltar();
    }

    function interesFadu() {
      var cierres = [
        { id: "dg",  color: "--c-lima",    nombre: "Diseño Gráfico", sub: "Marcas, tipografía, editorial, packaging" },
        { id: "dis", color: "--c-naranja", nombre: "Diseño de Imagen y Sonido", sub: "Cine, sonido, montaje, audiovisual" },
        { id: "arq", color: "--c-lavanda", nombre: "Arquitectura", sub: "Espacios, obra, ciudad" }
      ];
      montar({
        header: topDots(2),
        main:
          '<h1 class="t-h1">Te puede interesar FADU</h1>' +
          '<p class="t-base muted" style="margin:8px 0 20px">Si te gustan las películas, el arte y el diseño, ' +
          "Arquitectura, Diseño y Urbanismo es un buen lugar para mirar. Son siete carreras y todas tienen " +
          "que ver con proyectar algo.</p>" +
          '<div class="t-h3" style="margin-bottom:12px">Tres que te pueden cerrar</div>' +
          '<p class="t-chico muted" style="margin:-4px 0 12px">Tocá la <strong>ⓘ</strong> para ver de qué va cada una.</p>' +
          '<div class="stack-12" id="carreras-sug">' +
          cierres.map(function (c) {
            return '<div class="carrera-sugerida">' +
              '<span class="punto-color" style="background:var(' + c.color + ')"></span>' +
              '<span class="info"><span class="t-base-fuerte">' + U.esc(c.nombre) + "</span>" +
              '<span class="t-chico muted">' + U.esc(c.sub) + "</span></span>" +
              '<button class="btn-info-carrera" type="button" data-carrera="' + c.id + '" ' +
              'aria-label="Más info de ' + U.esc(c.nombre) + '">' + U.icono("info") + "</button></div>";
          }).join("") +
          "</div>",
        cta: '<button class="btn btn-etapa" id="cta">Me interesa, seguir</button>'
      });
      var cont = el("carreras-sug");
      if (cont) cont.querySelectorAll(".btn-info-carrera").forEach(function (b) {
        b.onclick = function () { abrirInfoCarrera(b.getAttribute("data-carrera")); };
      });
      el("cta").onclick = avanzar;
      cablearSaltar();
    }

    function jerga() {
      var palabras = [
        { color: "--c-lima", palabra: "Correlativa",
          def: "Una materia que tenés que tener aprobada o regular para poder anotarte en otra. Si falta, la materia te aparece bloqueada." },
        { color: "--c-naranja", palabra: "Anual o cuatrimestral",
          def: "Anual dura todo el año; cuatrimestral, medio. En Diseño las materias troncales son anuales." },
        { color: "--c-celeste", palabra: "Cátedra",
          def: "La misma materia se dicta en varias versiones, cada una con su equipo docente y su horario. Vos elegís con cuál cursar, desde el CBC." }
      ];
      montar({
        header: topDots(3),
        main:
          '<h1 class="t-h1" style="margin-bottom:20px">Tres palabras que vas a escuchar todo el tiempo</h1>' +
          '<div class="stack-12">' +
          palabras.map(function (j, i) {
            return '<div class="card jerga-card">' +
              '<div class="jerga-top"><span class="jerga-num" style="background:var(' + j.color + ')">' + (i + 1) + "</span>" +
              '<span class="t-h3">' + U.esc(j.palabra) + "</span></div>" +
              '<p class="t-chico muted" style="margin-top:10px">' + U.esc(j.def) + "</p></div>";
          }).join("") +
          "</div>",
        cta: '<button class="btn btn-etapa" id="cta">Crear mi cuenta</button>'
      });
      el("cta").onclick = avanzar;
      cablearSaltar();
    }

    function registro() {
      montar({
        header: U.headerAtras("Volver"),
        main:
          '<h1 class="t-h1">Creá tu cuenta</h1>' +
          '<p class="t-base muted" style="margin:8px 0 20px">Guardamos tu avance para que no tengas ' +
          "que cargarlo de nuevo cada vez.</p>" +
          '<div class="stack-16">' +
          campo("Nombre y apellido", "Juan Pérez", "text") +
          campo("Mail", "carlos@mail.com", "email") +
          campo("Contraseña", "", "password") +
          "</div>",
        cta:
          '<button class="btn btn-etapa" id="cta" style="margin-bottom:10px">Crear cuenta</button>' +
          '<button class="btn btn-secundario" id="ya">Ya tengo cuenta</button>'
      });
      el("cta").onclick = avanzar;
      el("ya").onclick = avanzar;
      cablearAtrasPaso();
    }

    function facultad() {
      montar({
        header: U.headerAtras("Paso 1 de 2"),
        main:
          '<h1 class="t-h1" style="margin-bottom:16px">¿En qué facultad vas a estudiar?</h1>' +
          '<div class="buscador">' + U.icono("lupa") +
          '<input type="text" placeholder="Buscá tu facultad" aria-label="Buscá tu facultad"></div>' +
          '<div class="stack-12" style="margin-top:16px" id="grupo-fac">' +
          cardFaduSel() +
          D.FACULTADES.filter(function (f) { return !f.habilitada; }).map(function (f) {
            return '<div class="fila-opcion atenuada" aria-disabled="true">' +
              '<span class="info"><span class="titulo">' + U.esc(f.nombre) + "</span></span>" +
              '<span class="chip chip-pronto">Pronto</span></div>';
          }).join("") +
          "</div>",
        cta: '<button class="btn btn-etapa" id="cta">Continuar con FADU</button>'
      });
      var info = document.querySelector("[data-info]");
      if (info) info.addEventListener("click", function (e) { e.stopPropagation(); abrirInfoFadu(); });
      el("cta").onclick = avanzar;
      cablearAtrasPaso();
    }

    function carrera() {
      var carreras = [
        { id: "dg",  nombre: "Diseño Gráfico", plan: "Plan 2022 · CBC + 4 años", activa: true },
        { id: "dis", nombre: "Diseño de Imagen y Sonido", plan: "Plan IS17" },
        { id: "arq", nombre: "Arquitectura" },
        { id: "di",  nombre: "Diseño Industrial" },
        { id: "din", nombre: "Diseño de Indumentaria" },
        { id: "dtx", nombre: "Diseño Textil" }
      ];
      montar({
        header: U.headerAtras("Paso 2 de 2"),
        main:
          '<h1 class="t-h1" style="margin-bottom:16px">¿Qué carrera vas a cursar?</h1>' +
          '<div class="stack-12">' +
          carreras.map(function (c) {
            if (c.activa) {
              return '<div class="fila-opcion activa"><span class="info">' +
                '<span class="titulo">' + U.esc(c.nombre) + "</span>" +
                '<span class="sub">' + U.esc(c.plan) + "</span></span>" +
                '<span class="radio check">' + U.icono("check") + "</span></div>";
            }
            return '<div class="fila-opcion inerte"><span class="info">' +
              '<span class="titulo">' + U.esc(c.nombre) + "</span>" +
              (c.plan ? '<span class="sub">' + U.esc(c.plan) + "</span>" : "") + "</span>" +
              '<span class="chevron">' + U.icono("chevron") + "</span></div>";
          }).join("") +
          "</div>",
        cta: '<button class="btn btn-etapa" id="cta">Continuar</button>'
      });
      el("cta").onclick = function () { E.empezarCBC(); go("pages/recorrido.html"); };
      cablearAtrasPaso();
    }

    /* utilidades del onboarding */
    function campo(label, placeholder, tipo) {
      var val = tipo === "password" ? ' value="demodemo12"' : "";
      return '<label class="campo"><span class="t-etiqueta muted">' + U.esc(label) + "</span>" +
        '<input class="input" type="' + (tipo || "text") + '" placeholder="' + U.esc(placeholder) + '"' + val + "></label>";
    }
    function cardFaduSel() {
      var f = D.FADU;
      return '<div class="fila-opcion activa fac-sel" data-fac="fadu">' +
        '<span class="info"><span class="titulo">Arquitectura, Diseño y Urbanismo</span>' +
        '<span class="sub">FADU · ' + f.carreras + " carreras · Ciudad Universitaria</span></span>" +
        '<span class="row" style="gap:8px">' +
        '<span class="radio check">' + U.icono("check") + "</span>" +
        '<button class="chip chip-info" type="button" data-info>+ INFO</button>' +
        "</span></div>";
    }
    function cablearAtrasPaso() {
      var b = document.querySelector("[data-atras]");
      if (!b) return;
      // Clonamos el botón para quitarle el handler global (history.back) que le
      // puso montarApp: en el onboarding el "atrás" es sólo paso-a-paso y nunca
      // debe salir al rótulo grupal.
      var nb = b.cloneNode(true);
      b.parentNode.replaceChild(nb, b);
      nb.onclick = function () { if (paso > 0) { paso--; pasos[paso](); } };
    }

    splash();
  }

  /* Hoja inferior A7b — info de FADU */
  function abrirInfoFadu() {
    var f = D.FADU;
    var overlay = document.createElement("div");
    overlay.className = "hoja-overlay";
    overlay.innerHTML =
      '<div class="hoja" role="dialog" aria-label="Información de FADU">' +
      '<div class="asa"></div>' +
      '<div class="t-h2">FADU</div>' +
      '<p class="t-chico muted" style="margin:4px 0 16px">Facultad de Arquitectura, Diseño y Urbanismo</p>' +
      '<div class="callout" style="margin-bottom:12px">' + U.icono("pin") +
        '<span class="texto">' + U.esc(f.direccion) + "</span></div>" +
      '<div class="callout" style="margin-bottom:12px">' + U.icono("bus") +
        '<span class="texto"><strong>Colectivos:</strong> ' + f.colectivos.join(", ") + "</span></div>" +
      '<div class="callout" style="margin-bottom:12px">' + U.icono("senal") +
        '<span class="texto"><strong>Tren:</strong> ' + f.trenes.join(" · ") + ". También Ecobici.</span></div>" +
      '<button class="btn btn-primario" id="cerrar-hoja" style="margin-top:8px">Cerrar</button>' +
      "</div>";
    overlayHost().appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("abierta"); });
    function cerrar() { overlay.classList.remove("abierta"); setTimeout(function () { overlay.remove(); }, 260); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    el("cerrar-hoja").onclick = cerrar;
  }

  /* Hoja de review de una carrera (ícono de info en "Te puede interesar FADU") */
  function abrirInfoCarrera(id) {
    var c = D.CARRERAS_INFO[id];
    if (!c) return;
    function dato(k, v) {
      return '<div class="dato"><span class="k">' + U.esc(k) + '</span><span class="v" style="max-width:200px;text-align:right">' + U.esc(v) + "</span></div>";
    }
    var overlay = document.createElement("div");
    overlay.className = "hoja-overlay";
    overlay.innerHTML =
      '<div class="hoja" role="dialog" aria-label="Sobre la carrera">' +
      '<div class="asa"></div>' +
      '<div class="t-caption muted">CARRERA DE FADU</div>' +
      '<div class="t-h1" style="margin:2px 0 4px">' + U.esc(c.nombre) + "</div>" +
      '<p class="t-chico muted" style="margin-bottom:16px">' + U.esc(c.resumen) + "</p>" +
      '<div class="card" style="margin-bottom:16px">' +
        dato("Título", c.titulo) +
        dato("Duración", c.duracion) +
        dato("Plan", c.materias) +
      "</div>" +
      '<div class="callout" style="margin-bottom:16px">' + U.icono("info") +
        '<span class="texto"><strong>Cómo se cursa.</strong> ' + U.esc(c.carga) + "</span></div>" +
      '<div class="t-h3" style="margin-bottom:10px">Salida laboral</div>' +
      '<div class="stack-12">' +
        c.salida.map(function (s) {
          return '<div class="pg-bono"><span class="pg-bono-check">' + U.icono("check") + "</span>" +
            '<div class="info"><div class="t-base-fuerte">' + U.esc(s) + "</div></div></div>";
        }).join("") +
      "</div>" +
      '<div class="card-pendiente" style="margin-top:16px"><div class="encabezado">' + U.icono("alerta") + "Confirmá el plan vigente</div>" +
        "<p class=\"t-chico\">Es un resumen para orientarte. El plan completo, las materias y la carga horaria " +
        "los publica FADU en fadu.uba.ar/carreras.</p></div>" +
      '<button class="btn btn-primario" id="cerrar-hoja" style="margin-top:16px">Cerrar</button>' +
      "</div>";
    overlayHost().appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("abierta"); });
    function cerrar() { overlay.classList.remove("abierta"); setTimeout(function () { overlay.remove(); }, 260); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    el("cerrar-hoja").onclick = cerrar;
  }

  /* Hoja de detalle de una cátedra (ícono de info en la selección) */
  function abrirInfoCatedra(cat, materia) {
    var horarios = {
      "Mañana": { hs: "8 a 12 hs", dias: "Lunes y miércoles" },
      "Tarde":  { hs: "14 a 18 hs", dias: "Martes y jueves" },
      "Noche":  { hs: "19 a 23 hs", dias: "Lunes y jueves" }
    };
    var h = horarios[cat.turno] || horarios["Mañana"];
    var slug = "catedra" + cat.nombre.toLowerCase().replace(/^ex\s+/, "").replace(/[^a-z]/g, "") + ".com.ar";
    var cadena = ["DG1", "DG2", "DG3", "DG4"];
    var codigoBase = (materia && materia.codigo) ? materia.codigo : "DG1";

    var overlay = document.createElement("div");
    overlay.className = "hoja-overlay";
    overlay.innerHTML =
      '<div class="hoja" role="dialog" aria-label="Detalle de la cátedra">' +
      '<div class="asa"></div>' +
      '<div class="t-caption muted">CÁTEDRA</div>' +
      '<div class="t-h1" style="margin:2px 0 14px">' + U.esc(cat.nombre) + "</div>" +
      '<div class="chips-row" style="margin:0 0 16px">' +
        '<span class="chip chip-dato">Turno ' + U.esc(cat.turno.toLowerCase()) + "</span>" +
        '<span class="chip chip-dato">' + U.esc(h.hs) + "</span>" +
        '<span class="chip chip-dato">' + U.esc(h.dias) + "</span>" +
      "</div>" +
      (materia && materia.area === "diseno"
        ? '<div class="card" style="margin-bottom:16px"><div class="t-h3" style="margin-bottom:12px">Cursarías acá cuatro años</div>' +
          '<div class="row" style="gap:6px;flex-wrap:wrap">' +
          cadena.map(function (c) {
            var activo = c === codigoBase;
            return '<span class="chip" style="min-height:40px;padding:8px 16px;background:' +
              (activo ? "var(--c-navy)" : "var(--c-n200)") + ";color:" + (activo ? "var(--c-blanco)" : "var(--c-n600)") + '">' + c + "</span>";
          }).join("") + "</div>" +
          '<p class="t-chico muted" style="margin-top:12px">En esta cátedra, DG4 cursa los ' +
          (cat.turno === "Noche" ? "jueves" : cat.turno === "Tarde" ? "jueves" : "miércoles") + ".</p></div>"
        : '<div class="card" style="margin-bottom:16px"><div class="t-h3" style="margin-bottom:8px">Sobre la cátedra</div>' +
          '<p class="t-chico muted">Cursás ' + U.esc(materia ? materia.nombre : "esta materia") + " con la cátedra " +
          U.esc(cat.nombre) + ", en turno " + U.esc(cat.turno.toLowerCase()) +
          ". Es una materia independiente: la elegís por única vez, no es vertical.</p></div>") +
      '<div class="t-h3" style="margin-bottom:10px">Dónde encontrarla</div>' +
      '<div class="stack-12">' +
        enlaceExterno("Sitio web", slug, "enlace") +
        enlaceExterno("Ficha de " + codigoBase + " en fadu.uba.ar", "Horarios y turnos oficiales", "enlace") +
      "</div>" +
      '<div class="card-pendiente" style="margin-top:16px"><div class="encabezado">' + U.icono("alerta") + "Qué publica FADU y qué no</div>" +
        "<p class=\"t-chico\">De cada cátedra se publica nombre, turno, día, horario y un link. " +
        "Mail, docentes y programa hay que pedirlos a la cátedra.</p></div>" +
      '<button class="btn btn-primario" id="cerrar-hoja" style="margin-top:16px">Cerrar</button>' +
      "</div>";
    overlayHost().appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("abierta"); });
    function cerrar() { overlay.classList.remove("abierta"); setTimeout(function () { overlay.remove(); }, 260); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    el("cerrar-hoja").onclick = cerrar;
  }

  function enlaceExterno(titulo, sub, icn) {
    return '<div class="fila-opcion" style="border-color:var(--c-n200)">' +
      '<span class="info"><span class="titulo">' + U.esc(titulo) + "</span>" +
      '<span class="sub">' + U.esc(sub) + "</span></span>" +
      '<span class="chevron" style="color:var(--c-n400)">' + U.icono(icn || "enlace") + "</span></div>";
  }

  /* Hoja de notificaciones (ícono de campana) */
  function abrirNotificaciones() {
    if (document.querySelector(".hoja-overlay")) return; // evita duplicados
    var overlay = document.createElement("div");
    overlay.className = "hoja-overlay";
    overlay.innerHTML =
      '<div class="hoja" role="dialog" aria-label="Notificaciones">' +
      '<div class="asa"></div>' +
      '<div class="t-h2" style="margin-bottom:16px">Notificaciones</div>' +
      '<div class="noti-item">' +
      '<span class="noti-ic">' + U.icono("calendario") + "</span>" +
      '<div class="info"><div class="t-base-fuerte">Se abre una mesa de examen</div>' +
      '<div class="t-chico muted" style="margin-top:2px">Inscribite el 4 y 5 de mayo. Los exámenes van del 11 al 22.</div>' +
      '<div class="t-caption muted" style="margin-top:6px">Hace 2 h</div></div></div>' +
      '<button class="btn btn-primario" id="cerrar-hoja" style="margin-top:20px">Listo</button>' +
      "</div>";
    overlayHost().appendChild(overlay);
    // apaga el puntito rojo de la campana
    var punto = document.querySelector(".punto-noti");
    if (punto) punto.style.display = "none";
    requestAnimationFrame(function () { overlay.classList.add("abierta"); });
    function cerrar() { overlay.classList.remove("abierta"); setTimeout(function () { overlay.remove(); }, 260); }
    el("cerrar-hoja").onclick = cerrar;
    // Diferido: evita que un evento final del gesto de apertura la cierre al toque
    setTimeout(function () {
      overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    }, 120);
  }

  /* Pop-up de correlatividad: al aprobar una materia se habilita otra (ajuste 5).
     Muestra la/s materia/s destrabada/s y recuerda que la carrera no es lineal. */
  function mostrarPopupHabilita(materiaAprobada, habilitadas, onClose) {
    var lista = habilitadas.map(function (x) {
      var mm = x.materia;
      var anioTxt = x.anio ? (x.anio + "º año") : "la carrera";
      // Correlativas que pedía (por código): ahora están todas cumplidas.
      // Un grupo "uno u otro" se muestra como "X o Y".
      var reqs = (mm.correlativas || []).map(function (req) {
        var ids = Array.isArray(req) ? req : [req];
        return ids.map(function (cid) {
          var info = D.buscarMateria(cid);
          return info ? info.materia.codigo : cid.toUpperCase();
        }).join(" o ");
      });
      var reqTxt = reqs.length
        ? '<div class="t-caption muted" style="margin-top:4px">Pedía: ' + U.esc(reqs.join(" · ")) + "</div>"
        : "";
      return '<div class="noti-item" style="background:var(--c-pastel-celeste)">' +
        '<span class="noti-ic">' + U.icono("flecha") + "</span>" +
        '<div class="info"><div class="t-base-fuerte">' + U.esc(mm.nombre) + "</div>" +
        '<div class="t-chico muted" style="margin-top:2px">Se habilitó · ' + U.esc(anioTxt) + "</div>" +
        reqTxt + "</div></div>";
    }).join("");

    var overlay = document.createElement("div");
    overlay.className = "hoja-overlay";
    overlay.innerHTML =
      '<div class="hoja" role="dialog" aria-label="Materia habilitada">' +
      '<div class="asa"></div>' +
      '<div class="popup-icono">' + U.icono("arbol") + "</div>" +
      '<div class="t-h1" style="margin-bottom:6px">¡Cumpliste una correlativa!</div>' +
      '<p class="t-chico muted" style="margin-bottom:16px">Con <strong>' + U.esc(materiaAprobada.nombre) +
      "</strong> ya tenés aprobadas todas las correlativas de:</p>" +
      '<div class="stack-12">' + lista + "</div>" +
      '<div class="callout callout-lavanda" style="margin-top:16px">' + U.icono("info") +
      '<span class="texto">La carrera <strong>no es lineal</strong>: una materia se habilita recién cuando ' +
      "aprobás <strong>todas</strong> sus correlativas, aunque sean de años distintos.</span></div>" +
      '<button class="btn btn-primario" id="cerrar-hoja" style="margin-top:16px">Entendido</button>' +
      "</div>";
    overlayHost().appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("abierta"); });
    function cerrar() {
      overlay.classList.remove("abierta");
      setTimeout(function () { overlay.remove(); if (onClose) onClose(); }, 260);
    }
    el("cerrar-hoja").onclick = cerrar;
    // Diferido: evita que el gesto que abrió la hoja la cierre al toque
    setTimeout(function () {
      overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    }, 120);
  }

  /* ============================================================
     PÁGINA: Hub de recorrido (recorrido.html)
     ============================================================ */
  function pageRecorrido() {
    pintarEtapa("cbc");
    var est = E.get();
    var aprobCBC = E.aprobadasCBC();
    var cbcListo = aprobCBC >= D.CBC.total;
    var carreraListo = est.etapa === "graduado";

    function etapaCard(cfg) {
      // cfg: { num, color, titulo, sub, estado(html), href, abierta, bloqueoTxt }
      var abierta = cfg.abierta;
      var tag = abierta ? "a" : "div";
      var clase = "etapa-card" + (abierta ? " abierta" : " cerrada");
      var hrefAttr = abierta ? ' href="' + cfg.href + '"' : "";
      var txt = cfg.color === "--c-lima" ? "--c-navy" : "--c-blanco";
      var icono = abierta
        ? '<span class="etapa-num" style="background:var(' + cfg.color + ');color:var(' + txt + ')">' + cfg.num + "</span>"
        : '<span class="etapa-num bloq">' + U.icono("candado") + "</span>";
      var trailing = abierta
        ? '<span class="chevron">' + U.icono("chevron") + "</span>"
        : "";
      return "<" + tag + ' class="' + clase + '"' + hrefAttr + ">" +
        '<div class="etapa-top">' + icono +
        '<div class="etapa-info"><div class="t-h3">' + U.esc(cfg.titulo) + "</div>" +
        '<div class="t-chico muted">' + U.esc(cfg.sub) + "</div></div>" + trailing + "</div>" +
        (cfg.estado ? '<div class="etapa-estado">' + cfg.estado + "</div>" : "") +
        "</" + tag + ">";
    }

    var cbcEstado = cbcListo
      ? '<span class="chip chip-aprobada">' + U.icono("check") + "Cerrado · 7 de 7</span>"
      : '<span class="chip" style="background:var(--c-naranja);color:var(--c-navy)">' +
        (aprobCBC === 0 ? "Sin empezar · 0 de 7" : "En curso · " + aprobCBC + " de 7") + "</span>";

    U.montarApp(APP(), {
      header:
        '<header class="app-header header-dash"><div class="dash-titulos"><div class="t-h1">Mi recorrido</div>' +
        '<div class="t-chico muted dash-sub">Diseño Gráfico · FADU · UBA</div></div></header>',
      main:
        '<div class="stack-16">' +
        etapaCard({ num: "1", color: "--c-lima", titulo: "El CBC",
          sub: cbcListo ? "7 materias · ¡las aprobaste todas!" : "7 materias · todavía no registraste ninguna",
          estado: cbcEstado, href: "cbc.html", abierta: true }) +
        etapaCard({ num: "2", color: "--c-azul", titulo: "La carrera", sub: "4 años · 33 materias y seminarios",
          estado: cbcListo ? '<span class="chip chip-inscripta">Disponible</span>' : '<span class="etapa-bloqueo">Se abre al terminar el CBC</span>',
          href: "carrera.html", abierta: cbcListo }) +
        etapaCard({ num: "3", color: "--c-violeta", titulo: "Título y posgrado", sub: "Trámite del diploma y qué sigue",
          estado: carreraListo ? '<span class="chip chip-inscripta">Disponible</span>' : '<span class="etapa-bloqueo">Se abre al terminar de cursar</span>',
          href: "titulo.html", abierta: carreraListo }) +
        "</div>" +
        '<div class="callout callout-lavanda" style="margin-top:20px">' + U.icono("info") +
        '<span class="texto"><strong>Una etapa por vez.</strong> Cada etapa se abre cuando cerrás la anterior. ' +
        "Así no te marea todo junto desde el primer día.</span></div>" +
        '<div class="callout" style="margin-top:12px">' + U.icono("enlace") +
        '<span class="texto"><strong>No reemplaza al SIU Guaraní.</strong> Es tu mapa para seguir la carrera: ' +
        "registrás lo que cursás y ves cómo vas. La inscripción oficial la seguís haciendo por el SIU.</span></div>",
      nav: null
    });
  }

  /* ============================================================
     PÁGINA: Dashboard del CBC (cbc.html)
     ============================================================ */
  function pageCBC() {
    pintarEtapa("cbc");
    if (E.get().etapa === "onboarding") E.empezarCBC();
    var aprob = E.aprobadasCBC();
    var cerrado = aprob >= D.CBC.total;
    var tope = E.topeAlcanzado("cbc");

    var muestra = D.CBC.materias.filter(function (m) { return m.enMuestra; });
    var otras   = D.CBC.materias.filter(function (m) { return !m.enMuestra; });
    var filasMuestra = muestra.map(function (m) { return filaMateriaSeguimiento(m, "cbc", { bloqueadaCorrel: !E.habilitada(m) }); }).join("");
    var filasOtras   = otras.map(function (m) { return filaMateriaSeguimiento(m, "cbc", { bloqueadaCorrel: !E.habilitada(m) }); }).join("");

    var helper = cerrado ? "¡Aprobaste las 7! Ya podés empezar la carrera." :
                 aprob === 0 ? "Todavía no registraste ninguna. Es el momento." :
                 "Seguí así, te faltan " + (D.CBC.total - aprob) + ".";

    var avisoTope = (tope && !cerrado)
      ? '<div class="callout" style="margin-bottom:16px">' + U.icono("alerta") +
        '<span class="texto"><strong>Llegaste al máximo de ' + E.TOPE_CUATRIMESTRE + ' materias</strong> de este ' +
        "cuatrimestre. Las demás se liberan cuando aprobás alguna de las que estás cursando.</span></div>"
      : "";

    U.montarApp(APP(), {
      header: U.headerDashboard("Hola, Juan", "Etapa 1 · El CBC"),
      main:
        '<div class="hero-etapa"><div class="t-display-l">' + aprob + " de " + D.CBC.total + "</div>" +
        '<div class="t-base-fuerte" style="margin:6px 0 16px">materias del CBC aprobadas</div>' +
        U.barra(aprob, D.CBC.total) +
        '<p class="t-chico" style="margin-top:14px;opacity:.85">' + U.esc(helper) + "</p></div>" +
        (cerrado
          ? '<button class="btn btn-primario" id="empezar-carrera" style="margin-bottom:20px">Empezar la carrera' + U.icono("flecha") + "</button>"
          : '<a class="btn btn-naranja" href="cbc-materias.html" style="margin-bottom:20px">' +
            (aprob === 0 ? "Registrar mis primeras materias" : "Registrar más materias") + U.icono("flecha") + "</a>") +
        '<div class="callout callout-celeste">' + U.icono("info") +
        '<span class="texto"><strong>¿Cómo funciona el CBC?</strong> Son 7 materias y cursás hasta ' +
        E.TOPE_CUATRIMESTRE + " por cuatrimestre. Elegís sede y comisión, registrás tu cursada acá para seguirla, " +
        "y cuando aprobás las 7 entrás a Diseño Gráfico.</span></div>" +
        '<div class="seccion-titulo"><h2>Tus 7 materias</h2>' +
        '<span class="conteo">Hasta ' + E.TOPE_CUATRIMESTRE + " por cuatrimestre</span></div>" +
        avisoTope +
        '<div class="lista-materias">' + filasMuestra + "</div>" +
        '<div class="t-etiqueta muted" style="margin:18px 0 8px">Otras materias del CBC</div>' +
        '<div class="lista-materias">' + filasOtras + "</div>",
      nav: { etapa: "cbc", activo: "progreso" }
    });

    if (cerrado) {
      el("empezar-carrera").onclick = function () { mostrarHito({ tipo: "cierre-cbc" }); };
    }
  }

  /* ============================================================
     Pantalla de hito — transición animada de pasaje de etapa/año
     tipo: "cierre-cbc" | "pasaje-anio" (hacia) | "fin-carrera"
     ============================================================ */
  function configHito(hito) {
    var total = D.CARRERA.totalMaterias; // 33
    if (hito.tipo === "cierre-cbc") {
      return {
        color: "--c-celeste", tituloColor: "--c-navy",
        ilustracion: "entraste-en-carrera.svg", iluHex: null,
        titulo: "Entraste<br>a la carrera",
        sub: "Cerraste el CBC. Desde hoy cursás en FADU y elegís cátedra, no comisión.",
        num: 7, chip: "CBC completo", helper: "Te faltan " + (total - 7) + " materias para recibirte.",
        cta: "Ver mi primer año",
        onCta: function () { E.cerrarCBC(); go("carrera.html?anio=1"); }
      };
    }
    if (hito.tipo === "fin-carrera") {
      return {
        color: "--c-azul", tituloColor: "--c-azul",
        ilustracion: "recibido.svg", iluHex: null,
        titulo: "Terminaste<br>de cursar",
        sub: "33 materias, 3 seminarios y 5 años. Ya no te queda nada por rendir: lo que sigue es el papel.",
        etapaCard: { num: 3, titulo: "Se abrió la etapa 3", sub: "Título y posgrado" },
        cta: "Ir al trámite de título",
        onCta: function () { E.graduarse(); go("titulo.html"); }
      };
    }
    // pasaje-anio. La ilustración "pasaste-de-año" se recolorea según el año:
    // la ropa (violeta base #6B4EF0) toma el color del año que empezás.
    var destino = hito.hacia;
    var panel      = { 2: "--c-violeta", 3: "--c-amarillo",    4: "--c-naranja-fuerte" };
    var tituloCols = { 2: "--c-violeta", 3: "--c-navy",        4: "--c-naranja-fuerte" };
    var iluHexMap  = { 2: null,          3: "#FFC53D",         4: "#F97316" };
    var anioObj = D.CARRERA.anios[destino - 1];
    var acum = anioObj.baseAprobadas; // acumulado al empezar el año destino
    var subs = {
      2: "Aprobaste las siete de primero. Te quedan " + (total - acum) + " materias para recibirte.",
      3: "Aprobaste DG2 y se te abrió DG3. Te quedan " + (total - acum) + " materias para recibirte.",
      4: "Último año. Aprobaste DG3 y DG4 ya está habilitada."
    };
    var helpers = {
      2: "Para pasar a 3º necesitás aprobar DG2.",
      3: "Para pasar a 4º necesitás aprobar DG3.",
      4: "Te faltan " + (total - acum) + " unidades para terminar de cursar."
    };
    return {
      color: panel[destino], tituloColor: tituloCols[destino],
      ilustracion: "pasaste-de-ano.svg", iluHex: iluHexMap[destino],
      titulo: "Empezaste<br>" + destino + "º año",
      sub: subs[destino],
      num: acum, chip: (destino - 1) + "º completo", helper: helpers[destino],
      cta: "Ver mi " + (destino === 2 ? "segundo" : destino === 3 ? "tercer" : "último") + " año",
      onCta: function () { E.pasarAnio(destino); go("carrera.html?anio=" + destino); }
    };
  }

  function mostrarHito(hito) {
    var c = configHito(hito);
    var total = D.CARRERA.totalMaterias;

    var tarjeta, pct = null;
    if (c.etapaCard) {
      tarjeta =
        '<div class="hito-card hito-card-etapa">' +
        '<span class="hito-etapa-num">' + c.etapaCard.num + "</span>" +
        '<div><div class="t-base-fuerte">' + U.esc(c.etapaCard.titulo) + "</div>" +
        '<div class="t-chico muted">' + U.esc(c.etapaCard.sub) + "</div></div></div>";
    } else {
      pct = Math.round((c.num / total) * 100);
      tarjeta =
        '<div class="hito-card">' +
        '<div class="hito-card-top"><span class="t-h2">' + c.num + " de " + total + "</span>" +
        '<span class="chip chip-aprobada">' + U.esc(c.chip) + "</span></div>" +
        '<div class="barra" style="margin:14px 0 12px"><div class="relleno hito-fill" style="width:0"></div></div>' +
        '<p class="t-chico muted">' + U.esc(c.helper) + "</p></div>";
    }

    var esGraduacion = hito.tipo === "fin-carrera";
    var cel = document.createElement("div");
    cel.className = "hito-pantalla" + (esGraduacion ? " hito-graduacion" : "");
    cel.setAttribute("data-nav", "false");
    cel.style.setProperty("--hito-color", "var(" + c.color + ")");
    cel.style.setProperty("--hito-titulo", "var(" + c.tituloColor + ")");
    cel.innerHTML =
      (esGraduacion ? confetiHTML() : "") +
      '<div class="hito-top">' +
        '<h1 class="t-display-l hito-titulo">' + c.titulo + "</h1>" +
        '<p class="t-base-fuerte hito-sub">' + U.esc(c.sub) + "</p>" +
        '<div class="hito-ilustracion"></div>' +
      "</div>" +
      '<div class="hito-panel">' +
        tarjeta +
        '<button class="btn btn-primario hito-cta" id="hito-cta">' + U.esc(c.cta) + "</button>" +
      "</div>";
    overlayHost().appendChild(cel);
    cargarIlustracion(cel.querySelector(".hito-ilustracion"), c.ilustracion, c.iluHex);
    requestAnimationFrame(function () { cel.classList.add("entra"); });
    if (pct !== null) setTimeout(function () {
      var f = cel.querySelector(".hito-fill");
      if (f) f.style.width = pct + "%";
    }, 450);
    el("hito-cta").onclick = c.onCta;
  }

  /* Carga la ilustración del hito. Primero pone un <img> (funciona siempre,
     también sobre file://); si puede, la inyecta inline para recolorear la
     ropa según el año (reemplaza el violeta base por el color del año). */
  function cargarIlustracion(holder, archivo, hex) {
    if (!holder || !archivo) return;
    var url = encodeURI("../img/" + archivo);
    holder.innerHTML = '<img src="' + url + '" alt="">';
    if (!window.fetch) return;
    fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (svg) {
      if (hex) svg = svg.replace(/#6b4ef0/gi, hex);
      holder.innerHTML = svg;
    }).catch(function () { /* queda el <img> */ });
  }

  /* Confeti de celebración (sólo al recibirse). Puro DOM + CSS. */
  function confetiHTML() {
    var cols = ["--c-lima", "--c-violeta", "--c-amarillo", "--c-naranja-fuerte", "--c-celeste", "--c-blanco"];
    var piezas = "";
    for (var i = 0; i < 30; i++) {
      var col = cols[i % cols.length];
      var left = Math.round(Math.random() * 100);
      var delay = (Math.random() * 0.6).toFixed(2);
      var dur = (1.9 + Math.random() * 1.4).toFixed(2);
      var w = 6 + Math.round(Math.random() * 5);
      piezas += '<span class="confeti" style="left:' + left + "%;width:" + w + "px;background:var(" + col +
        ");animation-delay:" + delay + "s;animation-duration:" + dur + 's"></span>';
    }
    return '<div class="confeti-capa" aria-hidden="true">' + piezas + "</div>";
  }

  /* ============================================================
     PÁGINA: Las 7 materias del CBC (cbc-materias.html)
     ============================================================ */
  function pageCBCMaterias() {
    pintarEtapa("cbc");
    var filas = D.CBC.materias.map(function (m) {
      return filaMateriaSeguimiento(m, "cbc", { bloqueadaCorrel: !E.habilitada(m) });
    }).join("");

    U.montarApp(APP(), {
      header: '<header class="app-header"><div class="t-h1">Materias del CBC</div></header>',
      main:
        '<p class="t-base muted" style="margin-bottom:16px">Siete materias. Registrás las que estás cursando ' +
        "para seguir tu avance; llevás hasta " + E.TOPE_CUATRIMESTRE + " por cuatrimestre.</p>" +
        '<div class="lista-materias">' + filas + "</div>",
      nav: { etapa: "cbc", activo: "materias" }
    });
  }

  /* ============================================================
     PÁGINA: Ficha de materia (materia.html) — máquina de 7 estados
     ?etapa=cbc|carrera  &id=…  [&vista=comisiones|catedras]
     ============================================================ */
  function pageMateria() {
    var id = qs("id");
    var info = D.buscarMateria(id);
    if (!info) { go("recorrido.html"); return; }
    var etapa = info.etapa;
    var anio = info.anio;
    var m = info.materia;
    var ambito = etapa === "cbc" ? "cbc" : anio;
    pintarEtapa(etapa, anio);

    var est = E.estadoMateria(id);
    var vista = qs("vista");
    var navCfg = etapa === "cbc"
      ? { etapa: "cbc", activo: "materias" }
      : { etapa: "carrera", activo: "progreso", anio: anio };

    /* ---- Paso de selección (comisiones / cátedras) ---- */
    if (vista === "seleccion") { return vistaSeleccion(); }

    /* ---- Router por estado ---- */
    if (est === "no-inscripta") return vistaFicha();
    if (est === "inscripta")   return vistaInscripta();
    if (est === "cursando")    return vistaCursando();
    if (est === "aprobada")    return vistaAprobada();
    if (est === "desaprobada") return vistaDesaprobada();
    if (est === "libre")       return vistaLibre();
    return vistaFicha();

    /* ---------- a) No inscripta ---------- */
    function vistaFicha() {
      var esCBC = etapa === "cbc";
      var cuenta = esCBC ? (m.comisiones ? m.comisiones.length : 0) : (m.catedras ? m.catedras.length : 0);
      var selTitulo = cuenta + (esCBC ? " comisiones" : " cátedras");
      var selSub = esCBC ? "Elegís sede y turno" : (m.id === "dg1" ? "Elegís tu cátedra vertical" : "Según el listado de FADU");
      var topeBloq = E.topeAlcanzado(ambito);

      U.montarApp(APP(), {
        header: U.headerAtras(esCBC ? "Materia del CBC" : "Materia de " + anio + "º año"),
        main:
          '<div class="t-h1">' + U.esc(m.nombre) + "</div>" +
          '<div class="chips-row">' +
            U.chipEstado("no-inscripta") +
            '<span class="chip chip-dato">' + U.esc(m.cursada) + "</span>" +
            '<span class="chip chip-dato">' + U.esc(m.horas) + "</span>" +
          "</div>" +
          '<div class="card card-celeste"><div class="t-h3">¿De qué se trata?</div>' +
          '<p class="t-chico" style="margin-top:8px">' + U.esc(m.descripcion || "") + "</p></div>" +
          '<div class="card card-lima" style="margin-top:12px"><div class="t-h3">Cómo se aprueba</div>' +
          '<p class="t-chico" style="margin-top:8px">' + U.esc(m.evaluacion || "") + "</p></div>" +
          (topeBloq
            ? '<div class="callout" style="margin-top:16px">' + U.icono("alerta") +
              '<span class="texto">Ya estás llevando ' + E.TOPE_CUATRIMESTRE + " materias este cuatrimestre, " +
              "el máximo. Aprobá alguna para poder sumar esta.</span></div>"
            : '<button class="selector-card" id="ir-seleccion">' +
              '<span class="sel-icono">' + U.icono(esCBC ? "pin" : "libro") + "</span>" +
              '<span class="info"><span class="t-base-fuerte">' + U.esc(selTitulo) + "</span>" +
              '<span class="t-chico muted">' + U.esc(selSub) + "</span></span>" +
              '<span class="chevron">' + U.icono("chevron") + "</span></button>"),
        cta: topeBloq
          ? '<button class="btn btn-primario" disabled aria-disabled="true">Máximo ' + E.TOPE_CUATRIMESTRE + " por cuatrimestre</button>"
          : '<button class="btn btn-primario" id="anotarme">Registrar esta materia' + U.icono("flecha") + "</button>",
        nav: navCfg
      });
      if (!topeBloq) {
        var irSel = function () { go("materia.html?etapa=" + etapa + "&id=" + id + "&vista=seleccion"); };
        el("anotarme").onclick = irSel;
        el("ir-seleccion").onclick = irSel;
      }
    }

    /* ---------- b/b2) Selección de comisión o cátedra ---------- */
    function vistaSeleccion() {
      var esCBC = etapa === "cbc";
      var cambiar = qs("cambiar");
      // Cátedra vertical de Diseño ya fijada (DG2–DG4): no deja elegir...
      // salvo que vengas en modo "cambiar" (te inscribiste a otra cátedra).
      var verticalFija = !esCBC && m.seleccionCatedra === "vertical" && E.get().catedraDiseno && !cambiar;

      if (verticalFija) return vistaVertical();

      var opciones = esCBC ? m.comisiones : m.catedras;
      var titulo = esCBC ? "Elegí tu comisión" : (cambiar ? "Cambiar de cátedra" : "Elegí tu cátedra");
      var sub = esCBC
        ? "En el CBC se elige sede y turno."
        : (cambiar
            ? "Elegí la cátedra en la que te inscribiste. La cadena de Diseño va a seguir con esta."
            : (m.id === "dg1"
                ? "Ojo: la cátedra que elijas en Diseño Gráfico I te acompaña hasta Diseño Gráfico IV."
                : "Las cátedras se agrupan por turno. Los nombres salen del listado oficial de FADU."));

      var filasHTML = opciones.map(function (o, i) {
        var titu = esCBC ? o.sede : o.nombre;
        var subt = esCBC ? (o.turno + " · " + o.dias) : ("Turno " + o.turno.toLowerCase());
        var infoBtn = esCBC ? "" :
          '<span class="btn-info-catedra" role="button" tabindex="0" data-info-i="' + i + '" aria-label="Info de la cátedra">' +
          U.icono("info") + "</span>";
        return '<button class="fila-opcion" type="button" aria-pressed="false" data-i="' + i + '" ' +
          'data-valor="' + U.esc(titu) + '">' +
          '<span class="info"><span class="titulo">' + U.esc(titu) + "</span>" +
          '<span class="sub">' + U.esc(subt) + "</span></span>" +
          infoBtn +
          '<span class="radio">' + U.icono("check") + "</span></button>";
      }).join("");

      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          '<div class="t-h1">' + U.esc(titulo) + "</div>" +
          '<p class="t-base muted" style="margin:8px 0 14px">' + U.esc(sub) + "</p>" +
          '<div class="callout callout-lavanda" style="margin-bottom:16px">' + U.icono("info") +
          '<span class="texto">Esto <strong>registra tu elección</strong> para hacer el seguimiento. ' +
          "La inscripción oficial la hacés por el SIU Guaraní.</span></div>" +
          (esCBC ? "" : noteFADU()) +
          '<div class="grupo-opciones stack-12" id="grupo-sel">' + filasHTML + "</div>",
        cta:
          '<div id="leyenda" class="t-caption muted center" style="margin-bottom:8px">' +
          "Elegí una " + (esCBC ? "comisión" : "cátedra") + " para continuar</div>" +
          '<button class="btn btn-etapa" id="inscribirme" disabled aria-disabled="true">Registrar en mi seguimiento</button>',
        nav: navCfg
      });

      var elegido = null;
      var grupo = el("grupo-sel");
      grupo.classList.remove("con-eleccion");
      grupo.querySelectorAll(".fila-opcion").forEach(function (b) {
        b.addEventListener("click", function (ev) {
          // El ícono de info abre el detalle, no selecciona
          if (ev.target.closest("[data-info-i]")) {
            var iInfo = ev.target.closest("[data-info-i]").getAttribute("data-info-i");
            abrirInfoCatedra(opciones[iInfo], m);
            return;
          }
          grupo.querySelectorAll(".fila-opcion").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          grupo.classList.add("con-eleccion");
          elegido = b.getAttribute("data-valor");
          var c = el("inscribirme");
          c.disabled = false; c.setAttribute("aria-disabled", "false");
          var leyenda = el("leyenda"); if (leyenda) leyenda.style.display = "none";
        });
      });
      el("inscribirme").onclick = function () {
        if (!elegido) return;
        E.inscribir(id, elegido);
        go("materia.html?etapa=" + etapa + "&id=" + id);
      };
    }

    /* ---------- b) Vertical fija (DG2–DG4) ---------- */
    function vistaVertical() {
      var cat = E.get().catedraDiseno;
      var cadena = ["dg1", "dg2", "dg3", "dg4"];
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          '<div class="t-h1">Tu cátedra</div>' +
          '<p class="t-base muted" style="margin:8px 0 20px">En Diseño Gráfico la cátedra es vertical: ' +
          "seguís con la que elegiste en DG1.</p>" +
          '<div class="card-acento" style="margin-bottom:16px"><div class="t-caption">TU CÁTEDRA</div>' +
          '<div class="t-h2" style="margin-top:4px">' + U.esc(cat) + "</div></div>" +
          '<div class="t-etiqueta muted" style="margin-bottom:8px">La cadena de Diseño Gráfico</div>' +
          '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:16px">' +
          cadena.map(function (c, i) {
            var activo = c === id;
            return '<span class="chip" style="background:' + (activo ? "var(--acento)" : "var(--c-n200)") +
              ';color:' + (activo ? "var(--c-blanco)" : "var(--c-n600)") + '">' + c.toUpperCase() + "</span>" +
              (i < 3 ? '<span class="muted">→</span>' : "");
          }).join("") + "</div>" +
          '<div class="callout callout-lavanda" style="margin-bottom:12px">' + U.icono("info") +
          '<span class="texto"><strong>¿Me puedo cambiar?</strong> Sí, y no hace falta pedirlo ' +
          "en la cátedra. Sólo tené en cuenta dos cosas.</span></div>" +
          '<div class="stack-12" style="margin-bottom:16px">' +
          itemCambio(1, "La cátedra a la que quieras pasarte puede no tener cupo.") +
          itemCambio(2, "Tenés que anotarte en la fecha de la inscripción general.") +
          "</div>" +
          '<div class="callout">' + U.icono("enlace") +
          '<span class="texto">Te recomendamos seguir con tu cátedra, pero si te inscribiste a otra ' +
          "podés ajustarlo acá. Recordá que esto es una <strong>herramienta de seguimiento</strong>, " +
          "no de inscripción.</span></div>",
        cta:
          '<button class="btn btn-etapa" id="inscribirme" style="margin-bottom:10px">Seguir con esta cátedra</button>' +
          '<button class="btn btn-secundario" id="cambiar">Me inscribí a otra cátedra</button>',
        nav: navCfg
      });
      el("inscribirme").onclick = function () {
        E.inscribir(id, cat);
        go("materia.html?etapa=" + etapa + "&id=" + id);
      };
      el("cambiar").onclick = function () {
        go("materia.html?etapa=" + etapa + "&id=" + id + "&vista=seleccion&cambiar=1");
      };
    }

    /* Item numerado para las salvedades de cambio de cátedra */
    function itemCambio(n, texto) {
      return '<div class="card" style="display:flex;gap:12px;align-items:flex-start">' +
        '<span class="jerga-num" style="flex:0 0 auto;background:var(--acento-anio,var(--c-azul))">' + n + "</span>" +
        '<p class="t-chico" style="margin:0">' + U.esc(texto) + "</p></div>";
    }

    /* ---------- c) Inscripta ---------- */
    /* Aviso + CTA para deshacer una anotación mal hecha.
       Aparece en todas las pantallas de seguimiento (anotada / cursando). */
    function bloqueSacarSeguimiento() {
      return '<div class="callout callout-lavanda" style="margin-top:20px">' + U.icono("info") +
        '<span class="texto"><strong>¿Anotaste mal la materia que estás cursando?</strong> ' +
        "No pasa nada: podés sacarla de tu seguimiento y volver a empezar.</span></div>" +
        '<button class="btn btn-fantasma t-chico" id="sacar-seg" ' +
        'style="min-height:40px;margin-top:10px;color:var(--c-coral)">Sacar del seguimiento</button>';
    }
    function cablearSacarSeguimiento() {
      var b = el("sacar-seg");
      if (!b) return;
      b.onclick = function () {
        if (confirm("¿Sacar esta materia de tu seguimiento? Se borra lo que registraste de ella.")) {
          E.sacarSeguimiento(id);
          go(etapa === "cbc" ? "cbc.html" : "carrera.html?anio=" + anio);
        }
      };
    }

    function vistaInscripta() {
      var dm = E.datosMateria(id);
      var sel = dm.comision || dm.catedra || "—";
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          encabezadoMateria("inscripta") +
          '<div class="card-acento" style="margin-top:16px;display:flex;gap:12px;align-items:center">' +
          '<span class="check-estado" style="background:var(--c-navy);color:var(--c-blanco);width:36px;height:36px">' + U.icono("check") + "</span>" +
          '<div><div class="t-base-fuerte">¡Anotada en tu seguimiento!</div>' +
          '<div class="t-chico muted">' + (etapa === "cbc" ? "Comisión" : "Cátedra") + ": " + U.esc(sel) + "</div></div></div>" +
          '<div class="card" style="margin-top:12px"><div class="t-h3">Lo que viene</div>' +
          '<p class="t-chico muted" style="margin-top:8px">Guardamos tu ' + (etapa === "cbc" ? "comisión" : "cátedra") +
          ". Cuando arranques las clases, pasala a <strong>Cursando</strong> y registrá tus entregas y notas acá.</p></div>" +
          bloqueSacarSeguimiento(),
        cta: '<button class="btn btn-etapa" id="cursar">Empezar a cursar' + U.icono("flecha") + "</button>",
        nav: navCfg
      });
      el("cursar").onclick = function () {
        // Al empezar a cursar, volvés al dashboard con la materia en "cursando".
        // Tocando la card ahí aparecen "La aprobé / No la aprobé / Dejé de cursar".
        E.empezarCursada(id);
        go(etapa === "cbc" ? "cbc.html" : "carrera.html?anio=" + anio);
      };
      cablearSacarSeguimiento();
    }

    /* ---------- d) Cursando ---------- */
    function vistaCursando() {
      var ev = instanciasEvaluacion(m);
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          encabezadoMateria("cursando") +
          '<div class="seccion-titulo"><h2>' + ev.titulo + "</h2>" +
          '<span class="conteo">Cargá tu nota</span></div>' +
          '<div class="stack-12">' +
          ev.instancias.map(evalCard).join("") +
          "</div>" +
          '<div class="callout" style="margin-top:16px">' + U.icono("info") +
          '<span class="texto">' + ev.nota + "</span></div>" +
          bloqueSacarSeguimiento(),
        cta:
          '<div class="row" style="gap:10px;margin-bottom:10px">' +
          '<button class="btn btn-etapa" id="aprobe" style="flex:1">La aprobé</button>' +
          '<button class="btn btn-peligro" id="no-aprobe" style="flex:1">No la aprobé</button>' +
          "</div>" +
          '<button class="btn btn-fantasma t-chico" id="deje" style="min-height:40px">Dejé de cursar</button>',
        nav: navCfg
      });
      cablearSacarSeguimiento();
      cablearNotas();
      el("aprobe").onclick = function () {
        var destino = "materia.html?etapa=" + etapa + "&id=" + id;
        var hito = E.aprobar(id);
        // ¿Esta aprobación destrabó alguna materia (de otro año)? (ajuste 5)
        var habil = (etapa === "carrera") ? E.habilitadasAlAprobar(id) : [];
        if (hito) {
          // Cerró el año/CBC: pantalla de transición animada (tiene prioridad)
          mostrarHito(hito);
        } else if (habil.length) {
          // La carrera no es lineal: avisamos qué materia se habilitó
          mostrarPopupHabilita(m, habil, function () { go(destino); });
        } else {
          // Aprobación normal: volver al dashboard tildado
          go(destino);
        }
      };
      el("no-aprobe").onclick = function () { E.desaprobar(id); go("materia.html?etapa=" + etapa + "&id=" + id); };
      el("deje").onclick = function () { go("quedar-libre.html?id=" + id); };
    }

    /* ---------- e) Aprobada — notificación + volver al dashboard ---------- */
    function vistaAprobada() {
      var dashHref = etapa === "cbc" ? "cbc.html" : "carrera.html?anio=" + anio;
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          encabezadoMateria("aprobada") +
          '<div class="aprobada-noti">' +
          '<span class="noti-check">' + U.icono("check") + "</span>" +
          '<div><div class="t-h3">¡Aprobaste la materia!</div>' +
          '<p class="t-chico" style="margin-top:4px">' + U.esc(m.codigo) +
          " quedó registrada con check en tu dashboard.</p></div></div>",
        cta: '<a class="btn btn-etapa" id="volver" href="' + dashHref + '">Volver al dashboard</a>',
        nav: navCfg
      });
    }

    /* ---------- f) Desaprobada ---------- */
    function vistaDesaprobada() {
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          encabezadoMateria("desaprobada") +
          '<div class="card" style="margin-top:16px;border-left:4px solid var(--c-coral)">' +
          '<div class="t-h3" style="color:var(--c-coral)">Perdiste el final, no la cursada</div>' +
          '<p class="t-chico muted" style="margin-top:8px">La cursada sigue valiendo. ' +
          "Alcanza con rendir de nuevo en la próxima mesa de examen.</p></div>" +
          '<div class="callout" style="margin-top:12px">' + U.icono("info") +
          '<span class="texto">Distinto de quedar <strong>libre</strong>: ahí sí perdés la regularidad ' +
          "y tenés que rendir libre o recursar.</span></div>",
        cta:
          '<button class="btn btn-etapa" id="recuperatorio" style="margin-bottom:10px">Volver a rendir</button>' +
          '<button class="btn btn-secundario" id="recursar">Recursar la materia</button>',
        nav: navCfg
      });
      el("recuperatorio").onclick = function () { E.empezarCursada(id); go("materia.html?etapa=" + etapa + "&id=" + id); };
      el("recursar").onclick = function () { E.recursar(id); go("materia.html?etapa=" + etapa + "&id=" + id + "&vista=seleccion"); };
    }

    /* ---------- Libre ---------- */
    function vistaLibre() {
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          encabezadoMateria("libre") +
          '<div class="card" style="margin-top:16px;border-left:4px solid var(--c-magenta)">' +
          '<div class="t-h3" style="color:var(--c-magenta)">Quedaste libre</div>' +
          '<p class="t-chico muted" style="margin-top:8px">Perdiste la regularidad de la cursada. ' +
          "Podés rendir libre o volver a cursar.</p></div>",
        cta:
          '<button class="btn btn-etapa" id="rendir" style="margin-bottom:10px">Rendir libre</button>' +
          '<button class="btn btn-secundario" id="recursar">Volver a cursar</button>',
        nav: navCfg
      });
      el("rendir").onclick = function () { E.empezarCursada(id); go("materia.html?etapa=" + etapa + "&id=" + id); };
      el("recursar").onclick = function () { E.recursar(id); go("materia.html?etapa=" + etapa + "&id=" + id + "&vista=seleccion"); };
    }

    /* ---------- utilidades de la materia ---------- */
    function encabezadoMateria(estadoActual) {
      return '<div class="row" style="gap:14px;align-items:flex-start">' +
        '<span class="fila-materia" style="display:none"></span></div>' +
        '<div class="stack-8"><div class="row-between"><div class="t-caption muted">' +
        (etapa === "cbc" ? "CBC" : anio + "º AÑO · " + (D.CARRERA.anios[anio - 1].ciclo)) + "</div>" +
        U.chipEstado(estadoActual) + "</div>" +
        '<div class="t-h1">' + U.esc(m.nombre) + "</div>" +
        '<div class="t-chico muted">' + U.esc(m.cursada + " · " + m.horas) + "</div></div>";
    }
    /* Card de instancia de evaluación con input para que el alumno cargue
       la nota (herramienta de seguimiento). Se guarda por materia. */
    function evalCard(i) {
      var nota = E.getNota(id, i.key);
      var tiene = nota !== "";
      return '<div class="eval-card" data-eval="' + i.key + '">' +
        '<span class="glifo"' + (tiene ? ' data-estado="aprobada"' : "") + ">" +
          U.icono(tiene ? "check" : "reloj") + "</span>" +
        '<div class="eval-body"><span class="nombre">' + U.esc(i.titulo) + "</span>" +
          '<div class="eval-nota-row">' +
            '<input class="eval-input" type="text" inputmode="decimal" maxlength="4" placeholder="Nota" ' +
              'aria-label="Nota de ' + U.esc(i.titulo) + '" value="' + U.esc(nota) + '" data-nota>' +
            '<button class="eval-guardar" type="button" data-guardar>Guardar</button>' +
          "</div></div></div>";
    }

    function cablearNotas() {
      document.querySelectorAll(".eval-card").forEach(function (card) {
        var clave = card.getAttribute("data-eval");
        var input = card.querySelector("[data-nota]");
        var btn = card.querySelector("[data-guardar]");
        var glifo = card.querySelector(".glifo");
        var timer;
        function guardar() {
          var val = E.setNota(id, clave, input.value);
          input.value = val;
          if (val !== "") { glifo.setAttribute("data-estado", "aprobada"); glifo.innerHTML = U.icono("check"); }
          else { glifo.removeAttribute("data-estado"); glifo.innerHTML = U.icono("reloj"); }
          btn.textContent = "Guardado";
          btn.classList.add("ok");
          clearTimeout(timer);
          timer = setTimeout(function () { btn.textContent = "Guardar"; btn.classList.remove("ok"); }, 1500);
        }
        if (btn) btn.addEventListener("click", guardar);
        if (input) input.addEventListener("blur", function () {
          if (input.value.trim() !== E.getNota(id, clave)) guardar();
        });
      });
    }
    function cardHito(titulo, texto, botonTxt, onClick) {
      var htmlId = "hito-cta";
      setTimeout(function () { var b = el(htmlId); if (b) b.onclick = onClick; }, 0);
      return '<div class="card-oscura" style="margin-top:16px">' +
        '<div class="row" style="gap:10px;margin-bottom:8px">' +
        '<span style="color:var(--c-lima)">' + U.icono("campana") + "</span>" +
        '<span class="t-h3" style="color:var(--c-blanco)">' + U.esc(titulo) + "</span></div>" +
        '<p class="t-chico" style="opacity:.85;margin-bottom:14px">' + U.esc(texto) + "</p>" +
        '<button class="btn btn-etapa" id="' + htmlId + '">' + U.esc(botonTxt) + U.icono("flecha") + "</button></div>";
    }
    function noteFADU() {
      return '<div class="callout" style="margin-bottom:16px">' + U.icono("enlace") +
        '<span class="texto">FADU publica de cada cátedra sólo nombre, turno, día, horario y un link. ' +
        "No publica mails ni equipo docente.</span></div>";
    }
  }

  /* Anillo de arco (sin número en el centro) para el hero de la carrera */
  function anilloArco(pct) {
    var r = 42, c = 2 * Math.PI * r;
    var offset = c * (1 - pct / 100);
    return '<div class="anillo-arco"><svg viewBox="0 0 100 100">' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="9"/>' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="var(--acento-anio)" stroke-width="9" ' +
      'stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) +
      '" transform="rotate(-90 50 50)"/></svg></div>';
  }

  /* ============================================================
     PÁGINA: Dashboard de año de la carrera (carrera.html?anio=1..4)
     ============================================================ */
  function pageCarrera() {
    var est = E.get();
    var anio = parseInt(qs("anio"), 10) || est.anioActual || 1;
    if (anio < 1) anio = 1; if (anio > 4) anio = 4;
    pintarEtapa("carrera", anio);
    var anioObj = D.CARRERA.anios[anio - 1];
    var aprobGlobal = anioObj.baseAprobadas + E.aprobadasAnio(anio);

    var mkFila = function (m) {
      return filaMateriaSeguimiento(m, anio, {
        codigoPrefijo: true,
        bloqueadaCorrel: !E.habilitada(m)
      });
    };
    // Bloque 1: troncales (cabecera del año). Bloque 2: el resto.
    var secundarias  = anioObj.materias.filter(function (m) { return !m.troncal; });
    var filasMuestra = anioObj.materias.filter(function (m) { return m.troncal; }).map(mkFila).join("");
    var filasOtras   = secundarias.map(mkFila).join("");
    // Si las secundarias son obligatorias (teóricas que gatillan correlativas),
    // el bloque se titula "Teóricas del año"; si son opcionales, "Otras materias".
    var tituloOtras  = secundarias.some(function (m) { return m.enMuestra; })
      ? "Teóricas del año" : "Otras materias del año";

    var pct = Math.round((aprobGlobal / D.CARRERA.totalMaterias) * 100);
    var helper = pct < 25 ? "Recién entraste. Las anuales troncales son las que marcan el año." :
                 pct < 80 ? "Vas en camino. Seguí con los talleres troncales." :
                 "Estás cerca de recibirte.";
    var avisoTopeCar = E.topeAlcanzado(anio)
      ? '<div class="callout" style="margin:16px 0 0">' + U.icono("alerta") +
        '<span class="texto"><strong>Estás en el máximo de ' + E.TOPE_CUATRIMESTRE + ' materias</strong> ' +
        "del cuatrimestre. Aprobá alguna para liberar las demás.</span></div>"
      : "";

    var selectorAnios = '<div class="selector-anios">' +
      [1, 2, 3, 4].map(function (n) {
        var activo = n === anio;
        var bloqueado = n > est.anioActual;
        var cls = "pill-anio" + (activo ? " activo" : "") + (bloqueado ? " bloqueado" : "");
        var inner = (bloqueado ? U.icono("candado") : "") +
          '<span class="pill-num">' + n + "º</span>" +
          (activo ? '<span class="pill-dot"></span>' : "");
        return bloqueado
          ? '<span class="' + cls + '" aria-disabled="true">' + inner + "</span>"
          : '<a href="carrera.html?anio=' + n + '" class="' + cls + '"' + (activo ? ' aria-current="true"' : "") + ">" + inner + "</a>";
      }).join("") + "</div>";

    U.montarApp(APP(), {
      header: U.headerDashboard("Hola, Juan", "Etapa 2 · " + anio + "º año · " + anioObj.ciclo),
      main:
        '<div class="hero-etapa"><div class="hero-row">' +
          anilloArco(pct) +
          '<div class="hero-texto"><div class="t-display-l">' + pct + "%</div>" +
          '<div class="t-base-fuerte">de la carrera</div>' +
          '<div class="t-chico" style="opacity:.8">' + aprobGlobal + " de 33 materias</div></div>" +
        "</div><hr class=\"hero-divisor\">" +
        '<p class="t-chico" style="opacity:.9">' + U.esc(helper) + "</p></div>" +
        selectorAnios +
        '<div class="seccion-titulo"><h2>Materias del año</h2>' +
        '<span class="conteo">Hasta ' + E.TOPE_CUATRIMESTRE + " por cuatrimestre</span></div>" +
        avisoTopeCar +
        '<div class="lista-materias">' + filasMuestra + "</div>" +
        (filasOtras
          ? '<div class="t-etiqueta muted" style="margin:18px 0 8px">' + tituloOtras + "</div>" +
            '<div class="lista-materias">' + filasOtras + "</div>"
          : "") +
        '<a href="arbol.html?anio=' + anio + '" class="btn btn-secundario" style="margin-top:16px">' +
        U.icono("arbol") + "Ver árbol de correlatividades</a>",
      nav: { etapa: "carrera", activo: "progreso", anio: anio }
    });
  }

  /* ============================================================
     PÁGINA: Árbol de correlatividades (arbol.html?anio=)
     ============================================================ */
  function pageArbol() {
    var est = E.get();
    var anio = parseInt(qs("anio"), 10) || est.anioActual || 1;
    if (anio < 1) anio = 1; if (anio > 4) anio = 4;
    pintarEtapa("carrera", anio);
    var spec = D.ARBOL_ANIOS[anio];

    // Estado real superpuesto sobre el estado base del diseño
    function resolver(celda) {
      var base = { ap: "aprobada", cu: "cursando", ha: "habilitada", bl: "bloqueada" }[celda.s];
      var info = D.buscarMateria(celda.c.toLowerCase());
      if (info) {
        var real = E.estadoMateria(celda.c.toLowerCase());
        if (real === "aprobada") return "aprobada";
        if (real === "cursando") return "cursando";
        if (real === "inscripta") return "habilitada";
      }
      return base;
    }

    // Grid de nodos con conectores verticales
    var grid = '<div class="arbol-grid' + (spec.sinLineas ? " sin-lineas" : "") + '">';
    spec.filas.forEach(function (fila, r) {
      fila.forEach(function (celda, col) {
        if (!celda) { grid += '<span class="arbol-celda"></span>'; return; }
        var e = resolver(celda);
        var abajo = spec.filas[r + 1] && spec.filas[r + 1][col];
        var conecta = !spec.sinLineas && abajo ? ' data-conecta="1"' : "";
        var tracked = D.buscarMateria(celda.c.toLowerCase());
        var inner = '<span class="arbol-nodo" data-estado="' + e + '"' + conecta + ">" + U.esc(celda.c) + "</span>";
        if (tracked && e !== "bloqueada") {
          grid += '<a class="arbol-celda" href="materia.html?etapa=carrera&id=' + celda.c.toLowerCase() + '">' + inner + "</a>";
        } else {
          grid += '<span class="arbol-celda">' + inner + "</span>";
        }
      });
    });
    grid += "</div>";

    U.montarApp(APP(), {
      header: U.headerAtras("Árbol de correlatividades"),
      main:
        arbolSelector(anio, est.anioActual) +
        '<div class="arbol-panel">' + grid + "</div>" +
        '<div class="arbol-leyenda">' +
        '<span><span class="punto-leyenda ap"></span>Aprobada</span>' +
        '<span><span class="punto-leyenda ha"></span>Habilitada</span>' +
        '<span><span class="punto-leyenda bl"></span>Bloqueada</span></div>' +
        '<div class="callout callout-anio"><div class="texto"><strong>' + U.esc(spec.callout.t) + "</strong><br>" +
        U.esc(spec.callout.x) + "</div></div>",
      nav: { etapa: "carrera", activo: "arbol", anio: anio }
    });
  }

  /* Selector de años para el árbol: activo navy, cerrados lima, bloqueados candado */
  function arbolSelector(actual, anioActual) {
    return '<div class="selector-anios arbol-selector">' +
      [1, 2, 3, 4].map(function (n) {
        var activo = n === actual;
        var bloqueado = n > anioActual;
        var cerrado = n < anioActual || (n === anioActual && n !== actual);
        var cls = "pill-anio pill-anio-arbol" + (activo ? " activo" : bloqueado ? " bloqueado" : cerrado ? " cerrado" : "");
        var inner = (bloqueado ? U.icono("candado") : "") + '<span class="pill-num">' + n + "º año</span>";
        return bloqueado
          ? '<span class="' + cls + '" aria-disabled="true">' + inner + "</span>"
          : '<a href="arbol.html?anio=' + n + '" class="' + cls + '"' + (activo ? ' aria-current="true"' : "") + ">" + inner + "</a>";
      }).join("") + "</div>";
  }

  /* ============================================================
     PÁGINA: Agenda (agenda.html?etapa=cbc|carrera) — regla 3
     ============================================================ */
  function pageAgenda() {
    var etapa = qs("etapa") || (E.get().etapa === "cbc" ? "cbc" : "carrera");
    var anio = E.get().anioActual;
    pintarEtapa(etapa, etapa === "carrera" ? anio : null);

    var sub, data;
    if (etapa === "cbc") {
      sub = "CBC · Ciclo Básico Común";
      data = {
        mes: "Marzo 2026",
        semana: [{ d: 9 }, { d: 10, on: 1 }, { d: 11, on: 1 }, { d: 12, on: 1 }, { d: 13 }, { d: 14 }, { d: 15 }],
        eventos: [
          { fecha: "10 al 19", mes: "MAR", titulo: "Inscripción general", sub: "Tu primera inscripción", destacado: true },
          { fecha: "30", mes: "ABR", titulo: "Inicio 1er cuatrimestre", sub: "Arrancan las clases" },
          { fecha: "4 y 5", mes: "MAY", titulo: "Inscripción a mesas", sub: "Exámenes del 11 al 22" }
        ]
      };
    } else {
      sub = anio + "º año · " + D.CARRERA.anios[anio - 1].ciclo;
      data = D.AGENDA_ANIOS[anio];
    }

    var letras = ["L", "M", "M", "J", "V", "S", "D"];
    var semana = '<div class="semana">' + data.semana.map(function (dia, i) {
      return '<div class="dia-sem' + (dia.on ? " on" : "") + '">' +
        '<span class="dia-letra">' + letras[i] + "</span>" +
        '<span class="dia-num">' + dia.d + "</span></div>";
    }).join("") + "</div>";

    var eventos = data.eventos.map(function (ev) {
      return '<div class="evento' + (ev.destacado ? " destacado" : "") + '">' +
        '<span class="evento-fecha">' + U.esc(ev.fecha) + "<br>" + U.esc(ev.mes) + "</span>" +
        '<div class="evento-info"><div class="t-base-fuerte">' + U.esc(ev.titulo) + "</div>" +
        (ev.sub ? '<div class="t-chico muted">' + U.esc(ev.sub) + "</div>" : "") + "</div></div>";
    }).join("");

    U.montarApp(APP(), {
      header:
        '<header class="app-header cabecera-seccion"><div class="t-display-l">Agenda</div>' +
        '<div class="t-chico muted" style="margin-top:2px">' + U.esc(sub) + "</div></header>",
      main:
        '<div class="agenda-mes"><span class="t-h3">' + U.esc(data.mes) + "</span>" +
        '<span class="agenda-flechas">' + U.icono("atras") + U.icono("chevron") + "</span></div>" +
        semana +
        '<h2 class="t-h2" style="margin:24px 0 14px">Próximas fechas</h2>' +
        '<div class="stack-12">' + eventos + "</div>",
      nav: { etapa: etapa === "cbc" ? "cbc" : "carrera", activo: "agenda", anio: anio }
    });
  }

  /* ============================================================
     PÁGINA: Plan de estudios (plan.html?etapa=) — regla 3
     ============================================================ */
  function pagePlan() {
    var etapa = qs("etapa") || (E.get().etapa === "cbc" ? "cbc" : "carrera");
    var anio = E.get().anioActual;
    pintarEtapa(etapa, etapa === "carrera" ? anio : null);

    var cuerpo;
    if (etapa === "cbc") {
      var aprobCbc = E.aprobadasCBC();
      cuerpo =
        '<div class="callout callout-anio"><div class="texto"><strong>El Ciclo Básico Común</strong><br>' +
        "Siete materias cuatrimestrales (y Taller de Dibujo, anual). Al aprobarlas entrás a Diseño Gráfico.</div></div>" +
        '<div class="plan-cat" style="margin-top:16px"><div class="plan-cat-top">' +
        '<span class="t-base-fuerte">Materias del CBC</span><span class="t-chico muted">' + aprobCbc + " de 7</span></div>" +
        '<div class="barra"><div class="relleno" style="width:' + Math.round((aprobCbc / 7) * 100) + '%"></div></div></div>' +
        '<div class="lista-materias" style="margin-top:16px">' +
        D.CBC.materias.map(function (m) {
          return U.filaMateria(m, E.estadoMateria(m.id), {
            href: m.enMuestra ? "materia.html?etapa=cbc&id=" + m.id : null,
            atenuada: !m.enMuestra, mostrarChip: false, meta: m.cursada
          });
        }).join("") + "</div>";
    } else {
      var pd = D.PLAN_ANIOS[anio];
      var cats = pd.cats.map(function (c) {
        var pct = c.t > 0 ? Math.round((c.h / c.t) * 100) : 0;
        return '<div class="plan-cat"><div class="plan-cat-top">' +
          '<span class="t-base-fuerte">' + U.esc(c.n) + "</span>" +
          '<span class="t-chico muted">' + c.h + " de " + c.t + "</span></div>" +
          '<div class="barra"><div class="relleno" style="width:' + pct + '%"></div></div></div>';
      }).join("");
      cuerpo =
        '<div class="callout callout-anio"><div class="texto"><strong class="t-h3" style="display:block;margin-bottom:4px">' +
        U.esc(pd.titulo) + "</strong>" + U.esc(pd.texto) + "</div></div>" +
        '<div class="stack-12" style="margin-top:16px">' + cats + "</div>" +
        '<div class="callout callout-lavanda" style="margin-top:16px"><div class="texto">' +
        '<strong>La regla del plan DG 2022</strong><br>' + U.esc(D.PLAN_REGLA) + "</div></div>";
    }

    U.montarApp(APP(), {
      header: U.headerAtras("Mi plan"),
      main: cuerpo,
      nav: { etapa: etapa === "cbc" ? "cbc" : "carrera", activo: "plan", anio: anio }
    });
  }

  /* ============================================================
     PÁGINA: Perfil (perfil.html?etapa=) — regla 3
     ============================================================ */
  function pagePerfil() {
    var est = E.get();
    var etapa = qs("etapa") || est.etapa;
    var anio = est.anioActual;
    pintarEtapa(etapa === "cbc" ? "cbc" : (etapa === "graduado" ? "graduado" : "carrera"),
                etapa === "carrera" ? anio : null);

    var resumen, navEtapa, activo;
    if (etapa === "cbc") {
      resumen = resumenProgreso("CBC", E.aprobadasCBC(), D.CBC.total);
      navEtapa = "cbc"; activo = "perfil";
    } else if (etapa === "graduado") {
      resumen = resumenProgreso("Carrera", 33, 33);
      navEtapa = "graduado"; activo = "perfil";
    } else {
      var aprobGlobal = D.CARRERA.anios[anio - 1].baseAprobadas + E.aprobadasAnio(anio);
      resumen = resumenProgreso(anio + "º año", aprobGlobal, 33);
      navEtapa = "carrera"; activo = "perfil";
    }

    var catedra = est.catedraDiseno
      ? '<div class="dato"><span class="k">Cátedra de Diseño</span><span class="v">' + U.esc(est.catedraDiseno) + "</span></div>"
      : "";

    U.montarApp(APP(), {
      header: '<header class="app-header"><div class="t-h1">Perfil</div></header>',
      main:
        '<div class="center" style="padding:8px 0 20px">' +
        '<div class="avatar" style="margin:0 auto 12px;width:88px;height:88px;font-size:32px">JP</div>' +
        '<div class="t-h2">' + U.esc(est.nombre) + "</div>" +
        '<div class="t-chico muted">Diseño Gráfico · FADU</div></div>' +
        resumen +
        '<div class="card" style="margin-top:16px">' +
        '<div class="dato"><span class="k">Legajo</span><span class="v">' + U.esc(est.legajo) + "</span></div>" +
        '<div class="dato"><span class="k">Facultad</span><span class="v">FADU · UBA</span></div>' +
        '<div class="dato"><span class="k">Plan</span><span class="v">2022</span></div>' +
        catedra +
        "</div>" +
        botonCerrarSesion(),
      nav: { etapa: navEtapa, activo: activo, anio: anio }
    });
    cablearCerrarSesion();
  }

  function resumenProgreso(etiqueta, hechas, total) {
    return '<div class="card-acento" style="display:flex;align-items:center;gap:16px">' +
      U.anillo(hechas, total, "") +
      '<div class="stack-4"><div class="t-caption">TU PROGRESO EN ' + U.esc(etiqueta.toUpperCase()) + "</div>" +
      '<div class="t-h2">' + hechas + " de " + total + "</div>" +
      '<div class="t-chico">materias aprobadas</div></div></div>';
  }

  /* ============================================================
     PÁGINA: Quedar libre (quedar-libre.html?id=) — CL1/CL2/CL3
     ============================================================ */
  function pageQuedarLibre() {
    var id = qs("id");
    var info = D.buscarMateria(id);
    if (!info) { go("recorrido.html"); return; }
    var m = info.materia, etapa = info.etapa, anio = info.anio;
    pintarEtapa(etapa, etapa === "carrera" ? anio : null);
    var navCfg = etapa === "cbc" ? { etapa: "cbc", activo: "materias" }
                                  : { etapa: "carrera", activo: "progreso", anio: anio };
    var paso = qs("paso") || "1";

    if (paso === "1") return cl1();
    if (paso === "2") return cl2();
    if (paso === "3") return cl3();

    function cl1() {
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          '<div class="t-h1">¿Dejás de cursar ' + U.esc(m.codigo) + "?</div>" +
          '<p class="t-base muted" style="margin:8px 0 20px">Antes de confirmar, mirá qué implica.</p>' +
          '<div class="card" style="border-left:4px solid var(--c-magenta);margin-bottom:12px">' +
          '<div class="t-h3" style="color:var(--c-magenta)">Vas a quedar libre</div>' +
          '<p class="t-chico muted" style="margin-top:8px">Perdés la regularidad de la cursada. ' +
          "No es lo mismo que desaprobar el final: ahí la cursada sigue valiendo.</p></div>" +
          '<div class="callout">' + U.icono("info") +
          '<span class="texto">Después vas a poder <strong>rendir libre</strong> o <strong>recursar</strong> ' +
          "la materia (con la misma cátedra u otra).</span></div>",
        cta:
          '<button class="btn btn-peligro" id="confirmar" style="margin-bottom:10px">Sí, dejar de cursar</button>' +
          '<button class="btn btn-secundario" id="cancelar">No, seguir cursando</button>',
        nav: navCfg
      });
      el("confirmar").onclick = function () { E.quedarLibre(id); go("quedar-libre.html?id=" + id + "&paso=2"); };
      el("cancelar").onclick = function () { history.back(); };
    }

    function cl2() {
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          '<div class="card-acento" style="text-align:center;background:var(--c-pastel-rosa)">' +
          '<div class="emoji" style="font-size:40px">📄</div>' +
          '<div class="t-h2" style="color:var(--c-magenta)">Quedaste libre en ' + U.esc(m.codigo) + "</div>" +
          '<p class="t-chico" style="margin-top:6px">Elegí cómo seguir.</p></div>' +
          '<div class="stack-12" style="margin-top:16px">' +
          caminoCard("Rendir libre", "Preparás toda la materia y la rendís en una mesa de examen, sin cursar de nuevo.", "libro", "rendir") +
          caminoCard("Volver a cursar", "Te reinscribís y cursás de nuevo, con la misma cátedra u otra.", "arbol", "recursar") +
          "</div>",
        nav: navCfg
      });
      el("via-rendir").onclick = function () { E.empezarCursada(id); go("materia.html?etapa=" + etapa + "&id=" + id); };
      el("via-recursar").onclick = function () { go("quedar-libre.html?id=" + id + "&paso=3"); };
    }

    function cl3() {
      U.montarApp(APP(), {
        header: U.headerAtras(m.codigo),
        main:
          '<div class="t-h1">Volver a cursar</div>' +
          '<p class="t-base muted" style="margin:8px 0 20px">' +
          (etapa === "carrera" && m.area === "diseno"
            ? "En Diseño podés seguir con tu cátedra vertical o cambiarte."
            : "Elegí con qué cátedra o comisión recursás.") + "</p>" +
          '<div class="stack-12">' +
          caminoCard("Misma " + (etapa === "cbc" ? "comisión" : "cátedra"),
            "Seguís donde estabas. Es lo más común.", "persona", "misma") +
          caminoCard("Elegir otra", "Volvés a elegir " + (etapa === "cbc" ? "sede y turno" : "cátedra") + ".", "lupa", "otra") +
          "</div>",
        nav: navCfg
      });
      el("via-misma").onclick = function () {
        var dm = E.datosMateria(id);
        E.recursar(id, dm.catedra || dm.comision || null);
        go("materia.html?etapa=" + etapa + "&id=" + id);
      };
      el("via-otra").onclick = function () { go("materia.html?etapa=" + etapa + "&id=" + id + "&vista=seleccion"); };
    }

    function caminoCard(titulo, texto, icn, via) {
      return '<button class="card" id="via-' + via + '" style="display:flex;gap:14px;align-items:center;text-align:left;width:100%">' +
        '<span style="flex:0 0 auto;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;' +
        'background:var(--acento-suave)">' + U.icono(icn) + "</span>" +
        '<span class="info" style="flex:1"><span class="t-base-fuerte" style="display:block">' + U.esc(titulo) + "</span>" +
        '<span class="t-chico muted">' + U.esc(texto) + "</span></span>" +
        '<span class="chevron">' + U.icono("chevron") + "</span></button>";
    }
  }

  /* ============================================================
     PÁGINA: Título — graduado (titulo.html?tab=)
     ============================================================ */
  function pageTitulo() {
    var est = E.get();
    pintarEtapa("graduado");
    var tab = qs("tab");

    if (tab === "tramite") return tramite();
    if (tab === "cierre")  return cierre();
    return inicio();

    function inicio() {
      var pgId = E.getPosgradoInscripto();
      var pg = pgId ? buscarPosgrado(pgId) : null;
      var notifOn = E.getNotifPosgrados();
      U.montarApp(APP(), {
        header:
          '<header class="app-header"><div style="flex:1"><div class="t-caption muted">03 · TÍTULO Y POSGRADO</div>' +
          '<div class="t-h1">Juan, sos<br>diseñador gráfico</div></div></header>',
        main:
          '<div class="hero-etapa" style="text-align:center"><div class="emoji emoji-recibido" style="font-size:48px">🎓</div>' +
          '<div class="t-h2">¡Te recibiste!</div>' +
          '<p class="t-chico" style="opacity:.9;margin-top:6px">Aprobaste las 33 materias del Plan 2022. ' +
          "Lo que sigue es el trámite del título.</p></div>" +
          (pg ? tarjetaCursando(pg) : "") +
          '<div class="stack-12">' +
          enlaceCard("Tramitar el título", "Checklist del trámite, 100% online.", "diploma", "titulo.html?tab=tramite") +
          enlaceCard(pg ? "Ver otros posgrados" : "Posgrados de FADU", "14 maestrías y 19 especializaciones.", "libro", "posgrado.html") +
          enlaceCard("Cierre de tu recorrido", "Mirá todo lo que hiciste desde el CBC.", "check", "titulo.html?tab=cierre") +
          "</div>" +
          switchNotif(notifOn),
        nav: { etapa: "graduado", activo: "inicio" }
      });
      cablearSwitchNotif();
    }

    function buscarPosgrado(id) {
      var l = D.POSGRADO.lista;
      for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
      return l[0];
    }

    /* Card de estado del posgrado que estás cursando (seguimiento) */
    function tarjetaCursando(pg) {
      return '<a class="card-cursando" href="posgrado.html?p=' + pg.id + '&v=seminarios">' +
        '<div class="row-between" style="margin-bottom:10px">' +
        '<span class="chip" style="background:var(--c-lavanda);color:var(--c-violeta)">Cohorte 2026</span>' +
        '<span class="chip" style="background:var(--c-lima);color:var(--c-navy)">En curso</span></div>' +
        '<div class="t-chico" style="color:var(--c-blanco);opacity:.85">Estás cursando</div>' +
        '<div class="t-h3" style="color:var(--c-blanco);margin:2px 28px 14px 0">' + U.esc(pg.nombre) + "</div>" +
        '<div class="barra" style="background:rgba(255,255,255,.25)"><div class="relleno" style="width:56%;background:var(--c-lima)"></div></div>' +
        '<div class="row-between" style="margin-top:8px">' +
        '<span class="t-chico" style="color:var(--c-blanco);opacity:.85">5 de 9 seminarios</span>' +
        '<span class="t-chico" style="color:var(--c-blanco);opacity:.7">Seguimiento, no inscripción</span></div>' +
        '<span class="card-cursando-chev">' + U.icono("chevron") + "</span></a>";
    }

    /* Switch: avisar cuando abran nuevos posgrados */
    function switchNotif(on) {
      return '<button class="switch-row" type="button" role="switch" id="switch-notif" aria-checked="' + on + '">' +
        '<span class="switch-info"><span class="t-base-fuerte">Avisarme de nuevos posgrados</span>' +
        '<span class="t-chico muted">Te notificamos cuando FADU abra nuevas inscripciones.</span></span>' +
        '<span class="switch-track"><span class="switch-thumb"></span></span></button>';
    }
    function cablearSwitchNotif() {
      var b = el("switch-notif");
      if (!b) return;
      b.addEventListener("click", function () {
        var on = E.setNotifPosgrados(b.getAttribute("aria-checked") !== "true");
        b.setAttribute("aria-checked", on);
      });
    }

    /* Trámite del título como checklist interactivo (se guarda solo) */
    function tramite() {
      var t = D.TITULO;
      var clave = "titulo-tramite";
      var pasos = t.pasos;
      var total = pasos.length;
      var hechos = E.checklistHechos(clave, pasos.map(function (p) { return p.id; }));
      var pct = Math.round((hechos / total) * 100);

      U.montarApp(APP(), {
        header: U.headerAtras("Trámite del título"),
        main:
          '<h1 class="t-h1">Tu trámite, paso a paso</h1>' +
          '<p class="t-base muted" style="margin:8px 0 16px">Es <strong>100% online</strong>. ' +
          "Marcá cada paso a medida que lo hacés: se guarda solo.</p>" +
          '<div class="check-progreso"><div class="row-between" style="margin-bottom:8px">' +
          '<span class="t-base-fuerte" id="check-conteo">' + hechos + " de " + total + " pasos</span>" +
          '<span class="t-chico muted" id="check-pct">' + pct + "%</span></div>" +
          '<div class="barra"><div class="relleno" id="check-barra" style="width:' + pct + '%;background:var(--c-violeta)"></div></div></div>' +
          '<div class="stack-12" id="check-lista" style="margin-top:18px">' +
          pasos.map(filaCheck).join("") + "</div>" +
          '<div class="check-listo" id="check-listo"' + (hechos >= total ? "" : " hidden") + ">" +
          U.icono("check") + "<span>¡Completaste todos los pasos! Ya podés retirar tu diploma.</span></div>" +
          '<div class="card" style="margin-top:18px"><div class="t-h3">Contacto</div>' +
          '<div class="dato"><span class="k">Mail</span><span class="v">' + U.esc(t.contacto) + "</span></div>" +
          '<div class="dato"><span class="k">Oficina</span><span class="v" style="max-width:180px">' + U.esc(t.oficina) + "</span></div></div>" +
          '<div class="card-pendiente" style="margin-top:12px"><div class="encabezado">' + U.icono("alerta") + "Confirmá en el instructivo</div>" +
          "<p class=\"t-chico\">Estos son los pasos generales del diploma en la UBA. " +
          "El detalle fino lo fija el instructivo oficial de FADU.</p></div>",
        nav: { etapa: "graduado", activo: "titulo" }
      });
      cablearChecklist(clave, total);

      function filaCheck(p) {
        var hecho = E.itemCheck(clave, p.id);
        return '<button class="check-item" type="button" data-id="' + p.id + '" aria-pressed="' + hecho + '">' +
          '<span class="check-box">' + U.icono("check") + "</span>" +
          '<span class="info"><span class="t-base-fuerte">' + U.esc(p.t) + "</span>" +
          '<span class="t-chico muted">' + U.esc(p.s) + "</span></span></button>";
      }
    }

    function cablearChecklist(clave, total) {
      var lista = el("check-lista");
      if (!lista) return;
      lista.querySelectorAll(".check-item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var ahora = E.toggleChecklist(clave, btn.getAttribute("data-id"));
          btn.setAttribute("aria-pressed", ahora);
          var hechos = lista.querySelectorAll('.check-item[aria-pressed="true"]').length;
          var pct = Math.round((hechos / total) * 100);
          var c = el("check-conteo"); if (c) c.textContent = hechos + " de " + total + " pasos";
          var pp = el("check-pct");   if (pp) pp.textContent = pct + "%";
          var b = el("check-barra");  if (b) b.style.width = pct + "%";
          var listo = el("check-listo");
          if (listo) { if (hechos >= total) listo.removeAttribute("hidden"); else listo.setAttribute("hidden", ""); }
        });
      });
    }

    /* Cierre: recap emocional de todo el recorrido */
    function cierre() {
      var total = D.CARRERA.totalMaterias; // 33
      U.montarApp(APP(), {
        header: U.headerAtras("Cierre de tu recorrido"),
        main:
          '<div class="hero-etapa" style="text-align:center">' +
          '<div class="emoji emoji-recibido" style="font-size:44px">🎓</div>' +
          '<div class="t-h2">Cerrás una etapa</div>' +
          '<p class="t-chico" style="opacity:.9;margin-top:6px">Empezaste sin saber qué era una cátedra. ' +
          "Hoy sos diseñador gráfico de la UBA.</p></div>" +
          '<div class="cierre-stats">' +
          statCard(total, "materias y<br>seminarios") +
          statCard("5", "años de<br>recorrido") +
          statCard("1", "título en<br>camino") +
          "</div>" +
          '<h2 class="t-h3" style="margin:24px 0 12px">Todo lo que recorriste</h2>' +
          '<div class="stack-12">' +
          hitoCierre("El CBC", "7 materias · cerrado", true) +
          hitoCierre("La carrera", "33 materias · 4 años · cerrado", true) +
          hitoCierre("Título y posgrado", "Trámite en curso", false) +
          "</div>" +
          '<div class="card-oscura" style="margin-top:20px;text-align:center">' +
          '<p class="t-base-fuerte" style="color:var(--c-blanco)">Gracias por recorrerlo con UBA+.</p>' +
          '<p class="t-chico" style="opacity:.8;margin-top:6px">Fue una herramienta de seguimiento: ' +
          "el diploma lo firma la UBA.</p></div>",
        nav: { etapa: "graduado", activo: "inicio" }
      });

      function statCard(num, label) {
        return '<div class="cierre-stat"><div class="cierre-stat-num">' + num + "</div>" +
          '<div class="t-chico muted">' + label + "</div></div>";
      }
      function hitoCierre(titulo, sub, hecho) {
        return '<div class="fila-materia" style="box-shadow:none;background:var(--c-blanco);border:1.5px solid var(--c-n200)">' +
          '<span class="glifo" data-estado="' + (hecho ? "aprobada" : "cursando") + '">' + U.icono(hecho ? "check" : "reloj") + "</span>" +
          '<span class="info"><span class="nombre">' + U.esc(titulo) + "</span>" +
          '<span class="metarow"><span class="meta">' + U.esc(sub) + "</span></span></span></div>";
      }
    }

    function enlaceCard(titulo, texto, icn, href) {
      return '<a class="card" href="' + href + '" style="display:flex;gap:14px;align-items:center">' +
        '<span style="flex:0 0 auto;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;' +
        'background:var(--acento-suave)">' + U.icono(icn) + "</span>" +
        '<span class="info" style="flex:1"><span class="t-base-fuerte" style="display:block">' + U.esc(titulo) + "</span>" +
        '<span class="t-chico muted">' + U.esc(texto) + "</span></span>" +
        '<span class="chevron">' + U.icono("chevron") + "</span></a>";
    }
  }

  /* ============================================================
     PÁGINA: Posgrados (posgrado.html?ficha=1)
     ============================================================ */
  function pagePosgrado() {
    pintarEtapa("graduado"); // navbar azul como en el prototipo
    var v = qs("v");
    var sel = posgradoSel();
    if (v === "inscripcion") return inscripcion(sel);
    if (v === "aranceles")   return aranceles(sel);
    if (v === "contacto")    return contacto(sel);
    if (v === "seminarios")  return seminarios(sel);
    if (v === "final")       return final(sel);
    if (qs("p"))             return ficha(sel);
    return listado();

    /* Posgrado elegido por query (?p=), con fallback al primero */
    function posgradoSel() {
      var id = qs("p");
      var lista = D.POSGRADO.lista;
      for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
      return lista[0];
    }

    /* Helpers de posgrado */
    function chipLav(txt) { return '<span class="chip" style="background:var(--c-lavanda);color:var(--c-violeta)">' + U.esc(txt) + "</span>"; }
    function linkCard(titulo, sub, href) {
      return '<a class="selector-card" href="' + href + '" style="border-color:var(--c-n200);margin-top:0">' +
        '<span class="info"><span class="t-base-fuerte">' + U.esc(titulo) + "</span>" +
        (sub ? '<span class="t-chico muted">' + U.esc(sub) + "</span>" : "") + "</span>" +
        '<span class="chevron">' + U.icono("chevron") + "</span></a>";
    }
    function linkColor(bg, iconBg, icn, eyebrow, titulo, href) {
      return '<a class="pg-link" href="' + href + '" style="background:var(' + bg + ')">' +
        '<span class="pg-link-ic" style="background:var(' + iconBg + ')">' + U.icono(icn) + "</span>" +
        '<span class="info"><span class="t-caption muted">' + U.esc(eyebrow) + "</span>" +
        '<span class="t-base-fuerte">' + U.esc(titulo) + "</span></span>" +
        '<span class="chevron">' + U.icono("chevron") + "</span></a>";
    }
    function itemNum(n, titulo, sub, color) {
      return '<div class="paso-item"><span class="paso-num" style="background:var(' + (color || "--c-lavanda") + ')">' + n + "</span>" +
        '<div class="info"><div class="t-base-fuerte">' + U.esc(titulo) + "</div>" +
        (sub ? '<div class="t-chico muted">' + U.esc(sub) + "</div>" : "") + "</div></div>";
    }

    /* ---------- D3 · Lista seleccionable de posgrados ---------- */
    function listado() {
      var lista = D.POSGRADO.lista;
      var tot = D.POSGRADO.totales;
      function cardPg(p) {
        return '<a class="pg-opcion" href="posgrado.html?p=' + p.id + '">' +
          '<div class="pg-opcion-top">' + chipLav(p.tipo) +
          (p.recomendado ? '<span class="chip pg-reco">Recomendado para vos</span>' : "") + "</div>" +
          '<div class="t-base-fuerte pg-opcion-nombre">' + U.esc(p.nombre) + "</div>" +
          '<div class="t-chico muted">' + U.esc(p.duracion) + "</div>" +
          '<span class="pg-opcion-chev">' + U.icono("chevron") + "</span></a>";
      }
      var esp = lista.filter(function (p) { return p.tipo === "Especialización"; });
      var mae = lista.filter(function (p) { return p.tipo === "Maestría"; });
      U.montarApp(APP(), {
        header:
          '<header class="app-header"><div style="flex:1"><div class="t-caption muted">POSGRADOS · FADU</div>' +
          '<div class="t-h1">¿Y ahora<br>qué sigue?</div></div></header>',
        main:
          '<p class="t-base muted" style="margin-bottom:18px">FADU tiene ' + tot.especializaciones +
          " especializaciones y " + tot.maestrias + " maestrías. Estas son las más afines a Diseño Gráfico.</p>" +
          '<div class="t-caption muted" style="margin-bottom:10px">ESPECIALIZACIONES · más cortas</div>' +
          '<div class="stack-12">' + esp.map(cardPg).join("") + "</div>" +
          '<div class="t-caption muted" style="margin:22px 0 10px">MAESTRÍAS · con tesis</div>' +
          '<div class="stack-12">' + mae.map(cardPg).join("") + "</div>" +
          '<div class="card-pendiente" style="margin-top:18px"><div class="encabezado">' + U.icono("alerta") + "Confirmá la oferta vigente</div>" +
          "<p class=\"t-chico\">Programa, cupos y fechas los fija la Secretaría de Posgrado cada año. " +
          "Esta lista es una guía, no el reglamento oficial.</p></div>",
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }

    /* ---------- D4 · Ficha del posgrado elegido ---------- */
    function ficha(p) {
      var q = "p=" + p.id;
      U.montarApp(APP(), {
        header: U.headerAtras("Posgrado"),
        main:
          '<div class="chips-row" style="margin-bottom:12px">' + chipLav(p.tipo) + chipLav("FADU") + chipLav("Posgrado") + "</div>" +
          '<h1 class="t-h1">' + U.esc(p.nombre) + "</h1>" +
          '<div class="t-chico muted" style="margin:6px 0 16px">' + U.esc(p.duracion) + "</div>" +
          '<div class="card-oscura"><div class="t-h3" style="color:var(--c-blanco)">Por qué te puede servir</div>' +
          '<p class="t-chico" style="opacity:.85;margin-top:8px">' + U.esc(p.porque) + "</p></div>" +
          '<h2 class="t-h3" style="margin:22px 0 12px">Dónde informarte</h2>' +
          '<div class="stack-12">' +
          linkCard("Cómo me inscribo", "Requisitos y documentación", "posgrado.html?" + q + "&v=inscripcion") +
          linkCard("Aranceles y bonificaciones", "", "posgrado.html?" + q + "&v=aranceles") +
          linkCard("Contacto de Posgrado", "Cursada y requisitos", "posgrado.html?" + q + "&v=contacto") +
          "</div>" +
          '<div class="card-pendiente" style="margin-top:16px"><div class="encabezado">' + U.icono("alerta") + "Confirmá antes de decidir</div>" +
          "<p class=\"t-chico\">Programa, cupos y fechas los fija la Secretaría de Posgrado cada año. " +
          "Esta ficha es una guía, no el reglamento oficial.</p></div>",
        cta: '<button class="btn btn-primario" type="button" id="cta-inscribir-pg">Ya me inscribí · seguir esta cursada</button>',
        nav: { etapa: "graduado", activo: "posgrados" }
      });
      var btn = el("cta-inscribir-pg");
      if (btn) btn.onclick = function () { E.inscribirPosgrado(p.id); go("titulo.html"); };
    }

    /* ---------- D5 · Inscripción ---------- */
    function inscripcion(p) {
      var items = D.POSGRADO.documentacion;
      U.montarApp(APP(), {
        header: U.headerAtras("Dónde informarte"),
        main:
          '<h1 class="t-h1">Cómo me inscribo</h1>' +
          '<p class="t-base muted" style="margin:8px 0 18px">' + U.esc(p.nombre) + "</p>" +
          '<div class="card-oscura" style="background:var(--c-violeta)"><div class="row" style="gap:10px;margin-bottom:8px">' +
          '<span style="color:var(--c-blanco)">' + U.icono("calendario") + "</span>" +
          '<span class="t-h3" style="color:var(--c-blanco)">La inscripción abre en marzo</span></div>' +
          '<p class="t-chico" style="opacity:.85">El cierre lo fija Posgrado cada año. Activá el aviso y te llega cuando abra.</p></div>' +
          '<h2 class="t-h3" style="margin:22px 0 12px">Lo que tenés que llevar</h2>' +
          '<div class="stack-12">' +
          items.map(function (it, i) { return itemNum(i + 1, it, ""); }).join("") + "</div>" +
          (p.tipo === "Maestría" ?
            '<div class="callout" style="margin-top:14px">' + U.icono("info") +
            '<span class="texto">Las maestrías suelen pedir además una <strong>entrevista de admisión</strong> ' +
            "y un anteproyecto de tesis.</span></div>" : ""),
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }

    /* ---------- D6 · Aranceles ---------- */
    function aranceles(p) {
      var bonos = [
        { t: "Graduados de la UBA", s: "Suele haber una bonificación sobre el arancel general." },
        { t: "Docentes de la FADU", s: "Con cargo vigente en la facultad." },
        { t: "Becas de posgrado", s: "La UBA y la FADU abren convocatorias." }
      ];
      U.montarApp(APP(), {
        header: U.headerAtras("Dónde informarte"),
        main:
          '<h1 class="t-h1">Aranceles y bonificaciones</h1>' +
          '<p class="t-base muted" style="margin:8px 0 18px">Cómo se paga una especialización de FADU.</p>' +
          '<div class="card-oscura" style="background:var(--c-violeta)"><div class="t-base-fuerte" style="color:var(--c-blanco);margin-bottom:12px">La cuenta tiene dos partes</div>' +
          '<div class="pg-subcard"><div class="t-base-fuerte">Matrícula</div><div class="t-chico muted">Se paga una vez, al inscribirte</div></div>' +
          '<div class="pg-subcard" style="margin-top:10px"><div class="t-base-fuerte">Cuotas</div><div class="t-chico muted">Mensuales, durante la cursada</div></div></div>' +
          '<h2 class="t-h3" style="margin:22px 0 12px">Quiénes pagan menos</h2>' +
          '<div class="stack-12">' +
          bonos.map(function (b) {
            return '<div class="pg-bono"><span class="pg-bono-check">' + U.icono("check") + "</span>" +
              '<div class="info"><div class="t-base-fuerte">' + U.esc(b.t) + "</div>" +
              '<div class="t-chico muted">' + U.esc(b.s) + "</div></div></div>";
          }).join("") + "</div>" +
          '<div class="card-pendiente" style="margin-top:16px"><div class="encabezado">' + U.icono("alerta") + "Falta confirmar</div>" +
          "<p class=\"t-chico\">Los montos cambian por cuatrimestre. No los inventamos: los publica la Secretaría de Posgrado.</p></div>",
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }

    /* ---------- D7 · Contacto ---------- */
    function contacto(p) {
      var f = D.FADU;
      var q = "p=" + p.id + "&v=contacto";
      U.montarApp(APP(), {
        header: U.headerAtras("Dónde informarte"),
        main:
          '<h1 class="t-h1">Hablar con Posgrado</h1>' +
          '<p class="t-base muted" style="margin:8px 0 18px">' + U.esc(p.nombre) + " · FADU UBA</p>" +
          '<div class="stack-12">' +
          linkColor("--c-lavanda", "--c-blanco", "mail", "Escribir un mail", p.contacto, "posgrado.html?" + q) +
          linkColor("--c-pastel-celeste", "--c-blanco", "pin", "Ir en persona", "Pabellón III, Ciudad Universitaria", "posgrado.html?" + q) +
          linkColor("--c-pastel-amarillo", "--c-blanco", "enlace", "Sitio de Posgrado", "Programas, fechas y aranceles", "posgrado.html?" + q) +
          "</div>" +
          '<div class="card-oscura" style="margin-top:16px"><div class="t-h3" style="color:var(--c-blanco)">Cómo llegar</div>' +
          '<p class="t-chico" style="opacity:.8;margin:8px 0 12px">' + U.esc(f.direccion) + "</p>" +
          '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
          f.colectivos.slice(0, 6).map(function (c) {
            return '<span class="chip" style="background:var(--c-blanco);color:var(--c-navy)">' + c + "</span>";
          }).join("") + "</div>" +
          '<p class="t-chico" style="opacity:.8">Tren Belgrano Norte, estación Ciudad Universitaria.</p></div>',
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }

    /* ---------- D9 · Seminarios (detalle, misma navbar graduado) ---------- */
    function seminarios(p) {
      var sem = [
        { n: 1, bloque: "formacion", estado: "aprobada", nota: "9" },
        { n: 2, bloque: "formacion", estado: "aprobada", nota: "8" },
        { n: 3, bloque: "formacion", estado: "aprobada", nota: "9" },
        { n: 4, bloque: "especializacion", estado: "aprobada", nota: "8" },
        { n: 5, bloque: "especializacion", estado: "aprobada", nota: "10" },
        { n: 6, bloque: "especializacion", estado: "cursando" },
        { n: 7, bloque: "especializacion", estado: "no-inscripta" },
        { n: 8, bloque: "especializacion", estado: "no-inscripta" },
        { n: 9, bloque: "especializacion", estado: "no-inscripta" }
      ];
      function filaSem(s) {
        var glifo = s.estado === "aprobada" ? "check" : s.estado === "cursando" ? "reloj" : "punto";
        var meta = s.estado === "aprobada" ? "Aprobado · " + s.nota :
                   s.estado === "cursando" ? "Cursando" : "Pendiente";
        return '<div class="fila-materia" style="box-shadow:none;background:var(--c-blanco);border:1.5px solid var(--c-n200)">' +
          '<span class="glifo" data-estado="' + s.estado + '">' + U.icono(glifo) + "</span>" +
          '<span class="info"><span class="nombre">Seminario ' + s.n + "</span>" +
          '<span class="metarow"><span class="meta">' + meta + "</span></span></span></div>";
      }
      var form = sem.filter(function (s) { return s.bloque === "formacion"; });
      var esp = sem.filter(function (s) { return s.bloque === "especializacion"; });
      U.montarApp(APP(), {
        header: U.headerAtras("Tu cursada"),
        main:
          '<h1 class="t-h1">Mis seminarios</h1>' +
          '<p class="t-chico muted" style="margin:6px 0 2px">' + U.esc(p.nombre) + "</p>" +
          '<div class="row-between" style="margin:12px 0 10px"><span class="t-base-fuerte">5 de 9 aprobados</span>' +
          '<span class="chip" style="background:var(--c-lavanda);color:var(--c-violeta)">Cohorte 2026</span></div>' +
          '<div class="barra" style="background:var(--c-n200);margin-bottom:22px"><div class="relleno" style="width:56%;background:var(--c-violeta)"></div></div>' +
          '<div class="t-caption muted" style="margin-bottom:10px">BLOQUE DE FORMACIÓN</div>' +
          '<div class="stack-12">' + form.map(filaSem).join("") + "</div>" +
          '<div class="t-caption muted" style="margin:22px 0 10px">BLOQUE DE ESPECIALIZACIÓN</div>' +
          '<div class="stack-12">' + esp.map(filaSem).join("") + "</div>" +
          '<div class="stack-12" style="margin-top:22px">' +
          linkCard("Trabajo Final Integrador", "Sin empezar", "posgrado.html?p=" + p.id + "&v=final") +
          "</div>" +
          '<div class="callout" style="margin-top:14px">' + U.icono("info") +
          "<span class=\"texto\">Es una herramienta de <strong>seguimiento</strong>, no de inscripción. " +
          "Te anotás a cada seminario por los canales de Posgrado.</span></div>",
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }

    /* ---------- D10 · Trabajo Final Integrador ---------- */
    function final(p) {
      var pasos = [
        { t: "Elegir el tema y el director", s: "Un docente de la carrera dirige el trabajo." },
        { t: "Presentar el plan", s: "Se entrega en Posgrado para su aprobación." },
        { t: "Escribirlo", s: "Con el seguimiento de tu director." },
        { t: "Defenderlo", s: "Ante un jurado de la especialización." }
      ];
      U.montarApp(APP(), {
        header: U.headerAtras("Mi posgrado"),
        main:
          '<h1 class="t-h1">Trabajo Final Integrador</h1>' +
          '<p class="t-base muted" style="margin:8px 0 18px">Es lo último que te separa del título de especialista.</p>' +
          '<div class="callout" style="background:var(--c-pastel-coral);color:var(--c-navy)">' +
          '<span style="color:var(--c-coral)">' + U.icono("alerta") + "</span>" +
          '<span class="texto"><strong>Todavía no lo empezaste.</strong> Podés presentar el tema cuando tengas ' +
          "aprobados 6 de los 9 seminarios. Te falta uno.</span></div>" +
          '<h2 class="t-h3" style="margin:22px 0 12px">Los cuatro pasos</h2>' +
          '<div class="stack-12">' +
          pasos.map(function (paso, i) { return itemNum(i + 1, paso.t, paso.s, "--c-n200"); }).join("") + "</div>",
        nav: { etapa: "graduado", activo: "posgrados" }
      });
    }
  }

  /* Selección simple en un grupo de .fila-opcion: marca una, atenúa
     las demás y habilita el CTA. onConfirm corre al tocar el CTA. */
  function cablearSeleccionSimple(grupoId, ctaId, onConfirm) {
    var grupo = el(grupoId);
    var cta = el(ctaId);
    if (!grupo || !cta) return;
    var elegido = null;
    grupo.querySelectorAll(".fila-opcion[data-i]").forEach(function (b) {
      b.addEventListener("click", function () {
        grupo.querySelectorAll(".fila-opcion").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        grupo.classList.add("con-eleccion");
        elegido = b.getAttribute("data-i");
        cta.disabled = false;
        cta.setAttribute("aria-disabled", "false");
      });
    });
    cta.onclick = function () { if (elegido !== null) onConfirm(elegido); };
  }

  /* ============================================================
     Reinicio de demo (compartido)
     ============================================================ */
  function botonCerrarSesion() {
    return '<button class="btn btn-fantasma t-chico" id="cerrar-sesion" ' +
      'style="min-height:44px;margin-top:24px;color:var(--c-coral)">Cerrar sesión</button>';
  }
  function cablearCerrarSesion() {
    var b = el("cerrar-sesion");
    if (b) b.onclick = function () {
      if (confirm("¿Cerrar sesión? Vas a volver al inicio y se borra el progreso de esta cuenta.")) {
        E.reiniciar(); go("../index.html");
      }
    };
  }

  /* ============================================================
     Dispatcher
     ============================================================ */
  var PAGES = {
    onboarding: pageOnboarding,
    recorrido: pageRecorrido,
    cbc: pageCBC,
    "cbc-materias": pageCBCMaterias,
    materia: pageMateria,
    carrera: pageCarrera,
    arbol: pageArbol,
    agenda: pageAgenda,
    plan: pagePlan,
    perfil: pagePerfil,
    "quedar-libre": pageQuedarLibre,
    titulo: pageTitulo,
    posgrado: pagePosgrado
  };

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (PAGES[page]) PAGES[page]();
    // La campana (en cualquier pantalla) abre las notificaciones
    document.addEventListener("click", function (e) {
      if (e.target.closest(".btn-campana")) abrirNotificaciones();
    });
  });

  window.APP_HELPERS = { qs: qs, go: go, pintarEtapa: pintarEtapa, botonCerrarSesion: botonCerrarSesion, cablearCerrarSesion: cablearCerrarSesion };
})();
