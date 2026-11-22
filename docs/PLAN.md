# CodeKids — Plan de entrega (4 clases restantes)

**Contexto:** curso de 4 semanas, 2 sesiones/semana (lunes y miércoles), 08:00–09:30.
Ya se dictaron las clases 1–4. Clase 5: lunes. Público: niños con necesidades
especiales y estudiantes neurodivergentes; atención corta; objetivo final que
construyan su propio programa y puedan probarlo y llevarlo.

**Rol de gestión:** Big Pickle (planificación, seguimiento y ejecución).
**Estado actual:** ver tabla debajo. Actualizado: 2026-11-22.

## Principios de alcance

1. La ruta clásica se **cura**; el **Modo Aventura** se agregó por pedido
   explícito del docente y es ahora la entrada principal.
2. Toda pantalla nueva debe ser **predecible**: mismos botones, mismos lugares.
3. Ningún cambio puede romper las 475 aserciones de `tools/test-missions.js` ni
   las 46 de `tools/test-quest.js`.
4. Los cambios de UI se validan en navegador y con Lighthouse antes de cada clase.

## Hitos

| Hito | Entregable | Responsable | Estado | Evidencia |
|---|---|---|---|---|
| **M0 — Impacto lunes** | Parser `if`, bucles vacíos, error de sintaxis, `maxBlocks`, accesibilidad | Big Pickle | ✅ | `if` con cuerpo indentado se mantiene dentro del condicional (verificado en navegador); 9 bucles vacíos fallan en ~10 ms; error de sintaxis bloquea Ejecutar; Lighthouse **1.00 / 1.00 / 1.00** sin fallos; tests 475/475 |
| **M1 — Verificación lunes 07:30** | Smoke test en navegador + guía impresa | Big Pickle | ✅ | Carga sin errores de consola; `m1` y `py1` resueltos de principio a fin con predicción y victoria; progreso en `localStorage`; guía y tarjetas listas para imprimir |
| **M2 — Miércoles (clase 6)** | Andamiaje PRIMM + apoyos de atención | Big Pickle | ✅ | Botones `Investiga` / `Modifica` / `Crea` en cada reto; barra AHORA / DESPUÉS; temporizador de 10 min; calma y sonido **off por defecto en perfiles nuevos** |
| **M3 — Miércoles (clase 6/7)** | Estudio Chispa (modo Crear) | Big Pickle | ✅ | 4 plantillas; guardar/abrir/borrar proyectos; bajar `.py`; compartir por URL; galería local; «▶ Probar» carga en `#/libre`. Flujo completo verificado en navegador |
| **M4 — Semana 4** | Vista docente con export CSV/JSON | Big Pickle | ⏳ | La cooperación ya está cubierta por el laboratorio de `#/aventura/q8` con roles rotativos en la guía; falta solo el export del progreso. No bloquea las clases 5–8 |
| **M5 — Cierre** | README + guía docente + tarjetas sin pantalla | Docs (agente) | ✅ | `README.md`, `docs/GUIA_DOCENTE.md` (actualizada con PRIMM/Estudio ya disponibles), `docs/TARJETAS_UNPLUGGED.md` |
| **M6 — Infraestructura** | `tools/browser-check.mjs` funcional en este workspace | Tools (agente) | ✅ | Ejecutado de punta a punta: **43 bien, 0 mal**, sin errores de JavaScript. Raíz derivada de `import.meta.url`, conteos desde `LESSONS`/`MISSIONS`, espera por `readyState` + hash (file:// no emitía `loadEventFired`), limpieza de Chrome en `finally`. Deja capturas en `shots/` |
| **M7 — Modo Aventura (pedido del docente)** | 8 mundos 2D, héroe armado por partes, reglas SI → ACCIÓN, progresión bloques → código | Big Pickle | ✅ | `js/quest.js` + `js/quest-app.js`; 8 mundos ganables con reglas permitidas (46/46 tests); verificado en navegador: mundo 1 con bloques y torre final con Python; incluido en el smoke test (43/43); Lighthouse **1.00 / 1.00 / 1.00** en selector, bloques y código; cero errores de consola |

## Correcciones incluidas (además de los hitos)

- Textos de estrellas corregidos en `m11` (6), `m13` (5) y `s1` (8).
- `codeMode` se guarda y se restaura; `spaceLives` se sanea al cargar.
- Los snippets se insertan en la posición 0 del cursor correctamente.
- La predicción no se filtra del reto anterior a «Juego libre».
- El interruptor «Paso a paso» ya no desincroniza la etiqueta del botón.
- Navegación por botones sincronizada con el hash; timers del ejemplo cancelados.
- `missions.js` y `lessons.js` se pueden importar directamente desde Node.
- `.gitignore` cubre `.chrome-check/`, `node_modules/` y entornos.
- `index.html` sube el cache-busting a `?v=13` para que las tabletas tomen todos los cambios.
- El router ignora el `hashchange` que él mismo provoca, para no borrar reglas recién escritas.
- Las tarjetas de mundo y el banner llevan el texto visible como nombre accesible (sin `aria-label` duplicado).

## Riesgos

- **Tiempo:** queda 1 día para la clase 5. M0–M3, M5 y M7 están listos; M4 no es bloqueante.
- **Parsing del `if`:** afecta L6–L8. Verificado en navegador con cuerpo de una y de dos líneas.
- **Perfil ya existente:** el docente debe activar manualmente «modo calma» y «sonido off» si el navegador tiene un perfil anterior; los defaults nuevos solo aplican a perfiles limpios.
- **Sin backend:** el Estudio usa `localStorage` + URL; no necesita servidor. Si se cambia de navegador o dispositivo, el programa se lleva con `.py` o con el enlace compartido.

## Secuencia de clases acordada

| Clase | Foco | Entregable del niño |
|---|---|---|
| 5 (lunes) | Secuencia + primeras sentencias (`py1`, `py2`) | Dibujo del camino + programa de 3 órdenes |
| 6 (miércoles) | Depuración + aventura `q1`–`q3` (SI → acción) | Error explicado y mundo 2 ganado |
| 7 (lunes) | Los niños eligen mundo `q4`–`q6` y pasan a código | Programo guardado y `.py` bajado |
| 8 (miércoles) | Laboratorio cooperativo `q7`–`q8` + galería | Torre final entre todos, captura y certificado |

## Comandos de verificación

```bash
node tools/test-missions.js   # 475 aserciones de la ruta clásica
node tools/test-quest.js      # 46 aserciones de los 8 mundos
python -m http.server 8765    # desde la raíz del repo
```

Rutas rápidas para proyectar: `#/aventura`, `#/aventura/q1` … `#/aventura/q8`,
`#/reto/m1`, `#/reto/py4`, `#/studio`.
