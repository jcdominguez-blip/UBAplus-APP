# UBA App — Diseño Gráfico (FADU, Plan 2022)

App móvil de gestión y seguimiento del progreso académico para estudiantes de la UBA.
Prototipo de Figma llevado a **HTML clásico, sin frameworks**. Equipo VN12 · Cátedra Ocampo · DGPC · FADU UBA.

> El detalle completo del proyecto está en `../CONTEXTO-UBA-APP.md`.

## Cómo correrlo

No hay build. Alcanza con servir la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8777
```

Y abrir http://localhost:8777/index.html. (También funciona abriendo `index.html` directo, pero un servidor evita rarezas con rutas relativas.)

## Arquitectura

No son 161 páginas: son **~14 tipos de pantalla con estado**. Una página por tipo, los datos del plan en JS y el progreso del alumno en `localStorage`. Así la persona *avanza de verdad* (se inscribe, cursa, aprueba, pasa de año) en lugar de clickear entre maquetas.

```
/
├── index.html            Onboarding (único HTML en la raíz)
├── pages/                Todas las demás pantallas
│   ├── recorrido.html    Hub de las 3 etapas
│   ├── cbc.html          Dashboard del CBC
│   ├── cbc-materias.html Las 7 materias del CBC
│   ├── materia.html      Ficha de materia — CBC y carrera (?etapa=&id=&vista=)
│   ├── carrera.html · arbol.html · agenda.html · plan.html · perfil.html
│   ├── quedar-libre.html · titulo.html · posgrado.html
├── css/
│   ├── tokens.css        Variables: color, tipografía, espaciado, radios
│   ├── base.css          Reset, escala tipográfica, utilidades
│   ├── layout.css        Shell de pantalla, status bar, navbar, scroll
│   └── components.css     Fila de materia, chips, botones, cards, anillo, árbol, agenda…
├── js/
│   ├── data.js           Plan de estudios: CBC completo + 4 años de la carrera
│   ├── estado.js         Progreso del alumno en localStorage + reglas de negocio
│   ├── ui.js             Iconos y render de componentes repetidos
│   └── app.js            Arranque y lógica por página (router por data-page)
└── img/
```

### Cómo se carga una página

Cada HTML es un shell que carga los 4 CSS y los 4 JS (en orden: `data → estado → ui → app`) y declara su tipo con `<body data-page="…">`. `app.js` enruta por ese atributo y pinta todo adentro de `#app`. Los scripts usan objetos globales (`window.DATA`, `window.ESTADO`, `window.UI`) en vez de ES modules, así funciona igual sobre `file://` o servido.

`index.html` está en la raíz y referencia `css/` y `js/`; las páginas de `pages/` referencian `../css/` y `../js/`. Entre sí, las páginas enlazan por nombre (`cbc.html`), el onboarding entra a `pages/recorrido.html` y el "reiniciar" vuelve a `../index.html`.

### Onboarding

Ocho pantallas, fieles al prototipo: splash (A1, auto-avanza), y cuatro pantallas con barra de dots + "Saltar" — bienvenida con ilustración (`img/ilustracion.png`), **"¿Qué cosas te gustan?" con tags multi-select de colores**, "Te puede interesar FADU" y la jerga —, seguidas de registro, y facultad/carrera como "Paso 1 de 2 / Paso 2 de 2". "Saltar" lleva directo al registro.

## Design system (sección 4 del contexto)

- **Tipografía:** Bricolage Grotesque (display/títulos) + Inter (lectura), vía Google Fonts. Mínimo 16 px para lectura.
- **Dos lenguajes de color que no se mezclan:**
  - **Color de etapa** (dónde estás): CBC lima, carrera azul, posgrado violeta, con un acento por año (celeste/violeta/amarillo/coral). Se aplica con la clase de etapa en `<body>`, que reescribe la variable `--acento`.
  - **Color de estado** (cómo va una materia): no inscripta / inscripta / cursando / aprobada / desaprobada / libre.
- Tokens, radios y áreas táctiles (48 px mínimo, 54 px el botón principal) en `css/tokens.css`.

## Reglas de interacción implementadas (sección 5)

1. **El navbar nunca desaparece** — salvo onboarding y pantallas de celebración.
2. **La flecha de atrás usa `history.back()`** — vuelve a la pantalla anterior real.
3. **Nunca se salta de etapa** — Agenda y Plan son siempre de la etapa en la que estás; el salto sólo pasa en el hub.
4. **Todas las pantallas scrollean**; sólo la barra de CTA queda fija al pie.
5. **El estado se ve**: al aprobar, el dashboard muestra check, fondo verde, chip y el anillo sube.
6. **Inscripción en 3 pasos** con el botón desactivado hasta elegir (ficha → comisiones/cátedras → check → activo → inscripto).
7. **Usuario logueado:** Juan Pérez (JP).

## Reglas de negocio (`js/estado.js`)

- Una materia se habilita sólo si todas sus correlativas están aprobadas.
- En el CBC, máximo 3 materias inscriptas por cuatrimestre.
- La cátedra de Diseño se fija al inscribirse a DG1 y se arrastra a DG2–DG4 (cátedras verticales).
- Aprobar la 3ª materia de la muestra del año dispara el hito de pasaje de año.
- Aprobar las 33 lleva al estado graduado.

Para reiniciar el progreso de la demo: botón "Reiniciar progreso" en el hub, o borrar la clave `uba-app:progreso` del localStorage.

## Estado de la construcción

Todas las páginas tipo están construidas y verificadas en el navegador:

| Página | Qué cubre |
|---|---|
| `index.html` | Onboarding A1–A8 (splash, bienvenida, interés, FADU, jerga, registro, facultad + hoja de info, carrera) |
| `recorrido.html` | Hub de las 3 etapas (único lugar de salto de etapa) |
| `cbc.html` · `cbc-materias.html` | Dashboard del CBC + las 7 materias |
| `materia.html` | Ficha de materia con la máquina de 7 estados (CBC y carrera): ficha → comisiones/cátedras → inscripta → cursando → aprobada / desaprobada / libre, con hitos de cierre y pasaje de año |
| `carrera.html` | Dashboard por año (`?anio=1..4`) con selector de año y anillo sobre 33 |
| `arbol.html` | Árbol de correlatividades **por año** (`?anio=1..4`): grilla de nodos con conectores, leyenda y acento del año. El estado real de las materias se superpone sobre el diseño base |
| `agenda.html` · `plan.html` | Agenda (semana + próximas fechas) y plan (categorías + regla DG 2022) **por etapa/año**, con el acento correspondiente; nunca saltan de etapa |
| `perfil.html` | Perfil por etapa con progreso y cátedra vertical fijada |
| `quedar-libre.html` | Flujo CL1–CL3 (confirmar → libre → rendir libre / recursar) |
| `titulo.html` · `posgrado.html` | Graduado: "sos diseñador gráfico", trámite del título, posgrados y ficha de especialización |

Los datos no confirmados (aranceles, seminarios, pasos del trámite) van en cards con borde punteado "Falta confirmar", nunca inventados (sección 8).

### Para afinar contra Figma
El design system y el mapa de pantallas salieron del `CONTEXTO-UBA-APP.md`. Para comparar pixel a pixel con los frames del prototipo hay que conectar el conector de Figma desde `/mcp` (requiere autorización del usuario).

## Accesibilidad (sección 10)

HTML semántico, `aria-current` en el tab activo, `aria-pressed` en filas seleccionables, `aria-disabled` + `disabled` en el botón de inscripción, foco visible, contraste navy sobre lima/pasteles, `prefers-reduced-motion`, y el color nunca es el único portador de significado (siempre hay ícono + etiqueta).
