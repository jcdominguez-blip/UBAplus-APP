/* ============================================================
   ui.js — Render de componentes repetidos y helpers de UI
   Expone window.UI. Sin dependencias.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Iconos (inline SVG, stroke currentColor) ---------------- */
  var ICONOS = {
    atras:    '<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron:  '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    check:    '<path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    reloj:    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    libro:    '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    lupa:     '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    arbol:    '<circle cx="12" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5v4m0 0c0 2-2 2.5-4.5 4.5M12 11.5c0 2 2 2.5 4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    calendario:'<rect x="4" y="5" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    plan:     '<path d="M8 6h11M8 12h11M8 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/>',
    persona:  '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    inicio:   '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    diploma:  '<path d="M12 4L2 9l10 5 8-4v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11.5V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    campana:  '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
    info:     '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    alerta:   '<path d="M12 3l9 16H3L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    candado:  '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>',
    flecha:   '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    pin:      '<path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>',
    bus:      '<rect x="4" y="5" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M8 17v2M16 17v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/>',
    mail:     '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    enlace:   '<path d="M10 14a4 4 0 0 0 6 0l2-2a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-2 2a4 4 0 0 0 6 6l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    wifi:     '<path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.3" fill="currentColor"/>',
    senal:    '<rect x="3" y="14" width="3" height="6" rx="1" fill="currentColor"/><rect x="8" y="10" width="3" height="10" rx="1" fill="currentColor"/><rect x="13" y="6" width="3" height="14" rx="1" fill="currentColor"/><rect x="18" y="3" width="3" height="17" rx="1" fill="currentColor"/>',
    bateria:  '<rect x="2" y="7" width="18" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="9" width="12" height="6" rx="1" fill="currentColor"/><rect x="21" y="10" width="1.6" height="4" rx="0.8" fill="currentColor"/>',
    mas:      '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    cruz:     '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    punto:    '<circle cx="12" cy="12" r="3" fill="currentColor"/>',
    grid:     '<rect x="4" y="4" width="7" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="4" width="7" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="13" width="7" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="7" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="2"/>',
    anilloNav:'<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/><path d="M12 4a8 8 0 0 1 7 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
  };

  function icono(nombre, clase) {
    var contenido = ICONOS[nombre] || "";
    return '<svg viewBox="0 0 24 24"' + (clase ? ' class="' + clase + '"' : "") +
           ' aria-hidden="true">' + contenido + "</svg>";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- Status bar ---------------- */
  function statusBar() {
    return '<div class="status-bar">' +
      '<span class="hora">9:41</span>' +
      '<span class="iconos">' + icono("senal") + icono("wifi") + icono("bateria") + "</span>" +
      "</div>";
  }

  /* ---------------- Botón de atrás (history.back — regla 2) ---------------- */
  function headerAtras(titulo, accionHTML) {
    return '<header class="app-header">' +
      '<button class="btn-atras" type="button" data-atras aria-label="Volver">' + icono("atras") + "</button>" +
      (titulo ? '<span class="titulo-header">' + esc(titulo) + "</span>" : "") +
      (accionHTML ? '<div class="accion-header">' + accionHTML + "</div>" : "") +
      "</header>";
  }

  /* ---------------- Navbar según etapa (regla 3: nunca salta de etapa) ---------------- */
  var NAVS = {
    cbc: [
      { id: "progreso", label: "Progreso", icono: "anilloNav", href: "cbc.html" },
      { id: "materias", label: "Materias", icono: "grid", href: "cbc-materias.html" },
      { id: "agenda",   label: "Agenda",   icono: "calendario", href: "agenda.html?etapa=cbc" },
      { id: "plan",     label: "Plan",     icono: "plan", href: "plan.html?etapa=cbc" },
      { id: "perfil",   label: "Perfil",   icono: "persona", href: "perfil.html?etapa=cbc" }
    ],
    carrera: [
      { id: "progreso", label: "Progreso", icono: "anilloNav", href: "carrera.html" },
      { id: "arbol",    label: "Árbol",    icono: "arbol", href: "arbol.html" },
      { id: "agenda",   label: "Agenda",   icono: "calendario", href: "agenda.html?etapa=carrera" },
      { id: "plan",     label: "Plan",     icono: "plan", href: "plan.html?etapa=carrera" },
      { id: "perfil",   label: "Perfil",   icono: "persona", href: "perfil.html?etapa=carrera" }
    ],
    graduado: [
      { id: "inicio",    label: "Inicio",    icono: "inicio", href: "titulo.html" },
      { id: "titulo",    label: "Título",    icono: "diploma", href: "titulo.html?tab=tramite" },
      { id: "posgrados", label: "Posgrados", icono: "diploma", href: "posgrado.html" },
      { id: "perfil",    label: "Perfil",    icono: "persona", href: "perfil.html?etapa=graduado" }
    ],
    posgradoCursada: [
      { id: "cursada",    label: "Mi cursada", icono: "anilloNav", href: "posgrado.html?v=cursada" },
      { id: "seminarios", label: "Seminarios", icono: "grid", href: "posgrado.html?v=seminarios" },
      { id: "final",      label: "Final",      icono: "plan", href: "posgrado.html?v=final" },
      { id: "perfil",     label: "Perfil",     icono: "persona", href: "perfil.html?etapa=posgrado" }
    ]
  };

  function navbar(etapa, activo, anio) {
    var items = NAVS[etapa] || NAVS.carrera;
    var html = '<nav class="navbar" aria-label="Navegación principal">';
    items.forEach(function (it) {
      var href = it.href;
      if (etapa === "carrera" && anio && it.href.indexOf("?") === -1) {
        href += "?anio=" + anio;
      }
      var actual = it.id === activo ? ' aria-current="page"' : "";
      html += '<a class="nav-item" href="' + href + '"' + actual + ">" +
        icono(it.icono) + "<span>" + esc(it.label) + "</span></a>";
    });
    html += "</nav>";
    return html;
  }

  /* ---------------- Chip de estado ---------------- */
  var ESTADO_LABEL = {
    "no-inscripta": "Sin anotar",
    "inscripta": "Anotada",
    "cursando": "Cursando",
    "aprobada": "Aprobada",
    "desaprobada": "Desaprobada",
    "libre": "Libre"
  };
  function chipEstado(estado) {
    var label = ESTADO_LABEL[estado] || "No inscripta";
    var icn = estado === "aprobada" ? icono("check") :
              estado === "cursando" ? icono("reloj") :
              estado === "inscripta" ? icono("check") : "";
    return '<span class="chip chip-' + estado + '">' + icn + esc(label) + "</span>";
  }

  /* Glifo de estado para el cuadrado líder de la fila (patrón del prototipo) */
  var ESTADO_GLIFO = {
    "no-inscripta": "mas",
    "inscripta": "check",
    "cursando": "reloj",
    "aprobada": "check",
    "desaprobada": "cruz",
    "libre": "punto"
  };

  /* ---------------- Fila de materia (el componente más repetido) ----------------
     Replica el prototipo: cuadrado con glifo de estado, código en el nombre,
     chip + meta en la segunda línea, chevron o candado al final.
     opts: { href, atenuada, bloqueada, codigoPrefijo, meta, mostrarChip } */
  function filaMateria(materia, estado, opts) {
    opts = opts || {};
    var clases = "fila-materia";
    if (opts.atenuada) clases += " atenuada";
    if (opts.bloqueada) clases += " bloqueada";

    var glifo = opts.bloqueada ? "candado" : (ESTADO_GLIFO[estado] || "mas");
    var nombre = (opts.codigoPrefijo ? esc(materia.codigo) + ". " : "") + esc(materia.nombre);
    var meta = opts.meta != null ? opts.meta : materia.cursada;
    var chip = (opts.mostrarChip === false || opts.bloqueada) ? "" : chipEstado(estado);
    var trailing = opts.bloqueada ? icono("candado") : icono("chevron");

    var cuerpo =
      '<span class="glifo" data-estado="' + estado + '">' + icono(glifo) + "</span>" +
      '<span class="info">' +
        '<span class="nombre">' + nombre + "</span>" +
        '<span class="metarow">' + chip + (meta ? '<span class="meta">' + esc(meta) + "</span>" : "") + "</span>" +
      "</span>" +
      '<span class="chevron">' + trailing + "</span>";

    var tag = opts.href && !opts.bloqueada && !opts.atenuada ? "a" : "div";
    var attrs = 'class="' + clases + '" data-estado="' + estado + '"';
    if (tag === "a") attrs += ' href="' + opts.href + '"';
    if (opts.bloqueada) attrs += ' aria-disabled="true"';
    return "<" + tag + " " + attrs + ">" + cuerpo + "</" + tag + ">";
  }

  /* ---------------- Header de dashboard (saludo + etapa + campana) ---------------- */
  function headerDashboard(saludo, sub) {
    return '<header class="app-header header-dash">' +
      '<div class="dash-titulos"><div class="t-h1">' + esc(saludo) + "</div>" +
      '<div class="t-chico muted dash-sub">' + esc(sub) + "</div></div>" +
      '<button class="btn-campana" type="button" aria-label="Notificaciones">' + icono("campana") +
      '<span class="punto-noti"></span></button>' +
      "</header>";
  }

  /* ---------------- Anillo de progreso ---------------- */
  function anillo(hechas, total, etiqueta) {
    var r = 50, c = 2 * Math.PI * r;
    var frac = total > 0 ? hechas / total : 0;
    var offset = c * (1 - frac);
    return '<div class="anillo">' +
      '<svg viewBox="0 0 112 112">' +
        '<circle class="pista" cx="56" cy="56" r="' + r + '"/>' +
        '<circle class="avance" cx="56" cy="56" r="' + r + '" ' +
          'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '"/>' +
      "</svg>" +
      '<div class="centro">' +
        '<span class="grande">' + hechas + "</span>" +
        '<span class="chico">de ' + total + (etiqueta ? " " + esc(etiqueta) : "") + "</span>" +
      "</div></div>";
  }

  /* ---------------- Barra de progreso ---------------- */
  function barra(hechas, total) {
    var pct = total > 0 ? Math.round((hechas / total) * 100) : 0;
    return '<div class="barra"><div class="relleno" style="width:' + pct + '%"></div></div>';
  }

  /* ---------------- Armado del shell completo de una pantalla ---------------- */
  /* cfg: { etapa, clase, header(html), main(html), cta(html), nav{etapa,activo,anio} } */
  function montarApp(contenedor, cfg) {
    var app = document.createElement("div");
    app.className = "app";
    if (cfg.cta) app.setAttribute("data-cta", "true");
    app.setAttribute("data-nav", cfg.nav ? "true" : "false");

    var html = statusBar();
    if (cfg.header) html += cfg.header;
    html += '<main class="app-main">' + (cfg.main || "") + "</main>";
    if (cfg.cta) html += '<div class="cta-bar">' + cfg.cta + "</div>";
    if (cfg.nav) html += navbar(cfg.nav.etapa, cfg.nav.activo, cfg.nav.anio);
    app.innerHTML = html;

    contenedor.innerHTML = "";
    contenedor.appendChild(app);
    cablearAtras(app);
    return app;
  }

  /* Cablea todos los botones [data-atras] a history.back (regla 2) */
  function cablearAtras(root) {
    (root || document).querySelectorAll("[data-atras]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "recorrido.html";
      });
    });
  }

  window.UI = {
    icono: icono,
    esc: esc,
    statusBar: statusBar,
    headerAtras: headerAtras,
    headerDashboard: headerDashboard,
    navbar: navbar,
    chipEstado: chipEstado,
    filaMateria: filaMateria,
    anillo: anillo,
    barra: barra,
    montarApp: montarApp,
    cablearAtras: cablearAtras,
    ESTADO_LABEL: ESTADO_LABEL
  };
})();
