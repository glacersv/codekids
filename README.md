# CodeKids

CodeKids es una aplicación educativa que enseña los primeros pasos de la
programación a niños de primaria. El personaje es **Chispa**, un robot que
camina por una cuadrícula: el alumno arma órdenes con bloques o las escribe en
Python y las prueba para llevar a Chispa hasta la bandera, recogiendo estrellas
por el camino.

Sirve para trabajar secuencias, bucles, condicionales y depuración sin pantallas
complicadas ni cuentas de usuario. El progreso se guarda en el navegador
(`localStorage`, clave `codekids.v3`); no hay servidor ni base de datos.

Además de las lecciones y los retos, incluye:

- **🗺️ Modo Aventura** (entrada principal del inicio, ruta `#/aventura`): 8
  mundos dibujados en Canvas 2D. El alumno **arma su héroe por partes**
  (cabeza, cuerpo, accesorio y color), **lee la misión y la leyenda de
  obstáculos** y escribe reglas `SI veo algo → hago algo`. Empieza con bloques,
  pasa por bloques + código y termina escribiendo Python. Sensores y acciones:
  pared/enemigo/fuego/techo bajo/llave/medicina/persona/puerta → avanzar,
  girar, saltar, disparar, agacharse, recoger, rescatar y tomar medicina.
- **Andamiaje PRIMM** en cada reto: `1 · Investiga`, `2 · Modifica` (programa
  con un error puesto a propósito) y `3 · Crea` (pantalla en blanco).
- **Estudio Chispa** (`#/studio`): editor propio con plantillas, guardado local
  de hasta 8 programas, exportación `.py` y enlaces para compartir.
- **Evaluación «La ruta de Chispa»** (`#/evaluacion`): 4 ejercicios en tableros
  de 10 × 10. El alumno escribe todo en un editor de texto (sin bloques, sin
  pistas, sin botones de ayuda); al ejecutar, las flechas dibujan el recorrido
  de Chispa hasta la bandera. El resultado (aciertos, casillas recorridas y
  código) se guarda en el navegador con la clave `codekids.exam.v1`.
- **Apoyos de atención**: barra AHORA / DESPUÉS, temporizador visual de 10
  minutos, modo calma y sonido apagado por defecto.

---

## Cómo abrirlo

### Opción rápida: doble clic

1. Buscá `index.html` en la raíz del repo.
2. Hacé doble clic. Se abre en tu navegador por defecto.

Funciona con `file://`, sin instalar nada.

### Opción recomendada para clase: servidor local

Si el navegador bloquea algo al abrir con doble clic, o si querés probar como si
fuera una web real:

```bash
# desde la raíz del repo (la carpeta que contiene index.html)
python -m http.server 8765
```

Después abrí en el navegador:

```
http://localhost:8765/
```

Si el puerto 8765 está ocupado, cambiá el número por otro (por ejemplo, 8766) y
usá esa misma dirección. Para cerrar el servidor, presioná `Ctrl + C` en la
terminal.

---

## Requisitos

| Uso | Requisito |
|---|---|
| Abrir y jugar | Un navegador moderno (Chrome, Edge, Firefox o Safari). |
| Servidor local | Python 3 (`python -m http.server`). |
| Pruebas de contenido | Node.js instalado (probado con 22 o superior). |
| Prueba de humo en navegador | **Node.js 22 o superior** y **Google Chrome instalado** (opcional; no hace falta para dar clase). |

No hay que instalar paquetes con `npm`: el repo no usa `package.json`.

---

## Pruebas

### Contenido (la chequeo de siempre)

```bash
node tools/test-missions.js
```

Recorre todas las misiones y lecciones: confirma que cada solución gana, que las
pistas alcanzan, que no hay retos duplicados y que las lecciones no tienen
huecos. Al terminar imprime un resumen como:

```
RESULTADO: 475 bien, 0 mal
```

Si dice `0 mal`, la ruta está sana. Si agregaste contenido, el número de
aserciones va a subir; lo importante es que siga diciendo `0 mal`.

### Evaluación de código

```bash
node tools/test-exam.js
```

Comprueba los 4 tableros de 10 × 10, que cada código de referencia se pueda
digitar y que Chispa recoja todas las estrellas y llegue a la meta. Al terminar
imprime un resumen como `RESULTADO: 90 bien, 0 mal`.

### Modo Aventura

```bash
node tools/test-quest.js
```

Verifica los 8 mundos: que cada uno se pueda ganar con reglas permitidas, que el
código Python generado funcione, que la llave y el rescate sean obligatorios
donde corresponde y que chocar con un enemigo quite vida. Al terminar imprime:

```
RESULTADO: 46 bien, 0 mal
```

### Navegador real (opcional)

```bash
node tools/browser-check.mjs
```

Necesita **Chrome** instalado. Simula lo que hace un alumno: elige lección,
arma bloques, ejecuta, responde la predicción, revisa el progreso y gana el
mundo 1 del Modo Aventura. También comprueba que la capa visual esté activa y
que el tablero se anime. Falla si hay errores de JavaScript. Deja capturas en
`shots/`. Hoy pasa con **45 bien, 0 mal**.

> El script detecta solo la raíz del repo y la ruta de Chrome; no necesita
> configuración. Para validar el contenido alcanza con
> `node tools/test-missions.js` y `node tools/test-quest.js`.

---

## Estructura de carpetas

```
codekids/
├── index.html              # pantalla única: se abre con doble clic
├── css/
│   └── app.css             # estilos de la interfaz
├── js/
│   ├── app.js              # interfaz, navegación por #/rutas y guardado
│   ├── engine.js           # motor: ejecuta órdenes y decide si gana/choca
│   ├── missions.js         # los retos (cuadrículas, paletas, soluciones)
│   ├── lessons.js          # las lecciones (Lee → Ejemplo → Retos)
│   ├── exam.js             # evaluación: 4 tableros de 10x10 y soluciones de referencia
│   ├── quest.js            # motor del Modo Aventura (sensores, acciones, 8 mundos)
│   ├── quest-fx.js         # capa visual Canvas 2D: tint, partículas, rim, viñeta
│   └── quest-app.js        # interfaz 2D: héroe por partes, reglas y Canvas
├── tools/
│   ├── test-missions.js    # pruebas de contenido (node)
│   ├── test-exam.js        # pruebas de la evaluación de 4 ejercicios (node)
│   ├── test-quest.js       # pruebas de los 8 mundos (node)
│   └── browser-check.mjs   # prueba de humo en Chrome
├── docs/
│   ├── PLAN.md                  # plan de entrega de las 4 clases restantes
│   ├── GUIA_DOCENTE.md          # guía de las clases 5 a 8
│   └── TARJETAS_UNPLUGGED.md    # 8 actividades sin pantalla
└── shots/                  # capturas generadas por browser-check
```

Las pantallas se cambian por la URL con `#`. Ejemplos ya disponibles:
`#/aventura`, `#/aventura/q1` … `#/aventura/q8`, `#/reto/m1`, `#/reto/py1`,
`#/reto/py4`, `#/reto/space1`, `#/evaluacion/1` … `#/evaluacion/4`,
`#/evaluacion/final`, `#/libre` y `#/studio`. Podés pegarlas directamente
en la barra del navegador para proyectar una pantalla concreta. Los enlaces
compartidos desde el Estudio tienen el formato `#/studio/<código-en-base64>` y se
abren solos.

---

## Modo Aventura: cómo funciona

Cada mundo es un objeto en `js/quest.js` con un mapa `grid` y tres listas:
`sensors` (lo que el héroe puede ver), `actions` (lo que puede hacer) y `mode`
(`blocks`, `both` o `text`). El niño armará reglas con la forma:

```python
si chispa.ve_enemigo():
    chispa.saltar()
si chispa.no_hay_nada():
    chispa.avanzar()
```

El motor lee las reglas **de arriba hacia abajo** y obedece la primera cuyo
sensor se cumple. Por eso el orden importa: las reglas de peligro van primero y
la de «avanzar» al final. En pantalla, las reglas activas se resaltan y los
sensores que están sonando se iluminan en verde.

| Símbolo del mapa | Significado |
|---|---|
| `R` | inicio del héroe |
| `#` | pared |
| `.` | piso libre |
| `E` | guardia / enemigo |
| `F` | fuego |
| `B` | techo bajo (humo) |
| `K` | llave |
| `M` | medicina |
| `P` | persona perdida |
| `D` | puerta (meta) |

Progresión de los 8 mundos: **1–3** solo bloques, **4–6** bloques + código,
**7–8** solo código. El progreso se guarda en `localStorage` con la clave
`codekids.quest.v1` y el héroe elegido en `codekids.hero.v1`.

### Capa visual (estilo «shader» en Canvas 2D)

`js/quest-fx.js` da acabado de juego sin librerías ni WebGL, traduciendo ideas
de los shaders de Godot al Canvas 2D: degradado/tint por mundo, partículas que
se desplazan con el tiempo (polvo, brasas, hojas, estrellas), resplandor del
color elegido para el héroe, viñeta suave, destello al perder vida y chispas al
ganar. También interpola el movimiento entre casillas para que no «salte».

El motor `quest.js` sigue siendo el dueño de las reglas: la capa sólo dibuja.
Si el archivo no se carga, el tablero se pinta igual que antes. Con el **Modo
calma** activo (valor por defecto) hay menos partículas, van más despacio y no
hay sacudidas ni destellos fuertes.

---

## Evaluación · La ruta de Chispa

Se abre desde el botón «📝 Evaluación · La ruta de Chispa» del inicio o con
`#/evaluacion/1` (también se puede saltar a `#/evaluacion/4` o al resumen con
`#/evaluacion/final`). Son 4 ejercicios, todos en cuadrículas de 10 columnas
por 10 filas:

| Ejercicio | Idea que mide |
|---|---|
| 1 · Línea recta | Secuencia de órdenes escritas |
| 2 · La esquina | Giros y bucles `for i in range(n):` |
| 3 · El pasillo escondido | Ruta con paredes y varios giros |
| 4 · Vuelta a la plaza | Ruta larga con cinco estrellas |

En cada ejercicio hay un solo `textarea`: no hay paleta de bloques, botones de
atajo, pistas, modo paso a paso ni predicción. Al ejecutar, Chispa recorre el
tablero y deja una flecha en cada casilla visitada; al llegar a la bandera con
todas las estrellas, la meta se ilumina y el panel dice cuántas casillas se
recorrieron. Si choca o se queda corta, el panel lo explica sin dar la
solución. El botón «Siguiente ejercicio» guarda el código y el resultado; al
final se muestra el puntaje sobre 4.

Los ejercicios y sus respuestas de referencia viven en `js/exam.js`. El código
que acepta el editor es el mismo Python-like de los retos:
`chispa.avanzar()`, `chispa.girar_izquierda()`, `chispa.girar_derecha()`,
`for i in range(n):` e `if chispa.hay_pared():`.

---

## Formato de una misión

Cada reto es un objeto en `js/missions.js`, envuelto en `mk({ ... })` (esa
función calcula automáticamente la meta de estrellas según la solución).

El campo `grid` es una lista de cadenas: **una cadena por fila**, todas del
mismo ancho.

| Símbolo | Significado |
|---|---|
| `.` | piso: Chispa puede caminar |
| `#` | pared: Chispa choca |
| `R` | posición inicial de Chispa (una sola por mapa) |
| `*` | estrella que hay que recoger |
| `F` | bandera: meta final (una sola por mapa) |

Ejemplo real (`m1`, "Un paso a la vez"):

```js
mk({
  id: 'm1',
  lesson: 'l1',
  title: 'Un paso a la vez',
  concept: 'Secuencia',
  goal: 'Lleva a Chispa hasta la bandera.',
  learn: 'Un programa es una lista de órdenes. Chispa las hace en orden.',
  tip: 'Toca un bloque para agregarlo. Luego toca Ejecutar.',
  grid: ['.....', '.R..F', '.....'],
  startDir: 'east',
  palette: ['move'],
  maxBlocks: 20,
  solution: [{ type: 'move' }, { type: 'move' }, { type: 'move' }],
  hints: [
    'Toca tres veces el bloque Avanzar.',
    'Cada bloque es una orden. Chispa hace una por vez, en orden.'
  ],
  praise: 'Tres órdenes en fila. Eso ya es un programa.'
})
```

Campos que conviene completar siempre:

- `id`: único, sin repetir.
- `lesson`: id de la lección a la que pertenece (debe existir en `lessons.js`).
- `title`, `concept`, `goal`, `learn`, `tip`: textos que ve el alumno.
- `grid` y `startDir`: mapa y dirección inicial (`east`, `north`, `west`, `south`).
- `palette`: bloques permitidos (`move`, `left`, `right`, `repeat`, `ifwall`).
- `solution`: programa de referencia. Debe ganar y usar solo bloques de la paleta.
- `hints`: al menos 2, de la más suave a la más directa.
- `praise`: elogio concreto al ganar.
- `maxBlocks`: límite de bloques; la meta calculada debe ser menor o igual.
- Opcionales: `guided: true` + `startProgram` para retos que arrancan a medias
  (el programa precargado **no** debe ganar).

---

## Cómo agregar una lección o una misión

1. **Agregar el reto.** Poné un objeto `mk({ ... })` nuevo en `js/missions.js`,
   dentro del bloque de la lección que corresponda. Usá un `id` nuevo.
2. **Si es una lección nueva, agregala en `js/lessons.js`** con `id`, `num`,
   `title`, `concept`, `idea`, tres `bullets`, `read`, un `example` con
   `grid`/`startDir`/`program` (el ejemplo debe ejecutarse y, salvo en
   depuración, ganar) y la lista de `retos` con los ids de `missions.js`.
3. **Conectá el reto.** El `id` tiene que aparecer en el arreglo `retos` de una
   sola lección. La suma de retos de todas las lecciones debe ser igual al
   total de misiones.
4. **Actualizá los tests.** Corré:

   ```bash
   node tools/test-missions.js
   ```

   Si la salida termina en `0 mal`, está listo. Si falla, el mensaje indica qué
   revisar: solución que no gana, paleta que no incluye un bloque, pistas que
   faltan, reto sin lección, ids duplicados, etc.
5. **Probalo en pantalla.** Abrí `index.html` y navegá a `#/reto/<id>` (o a la
   lección con `#/leccion/<id>/0`). Si el cambio tocó la interfaz, pedí también
   la verificación en Chrome con `node tools/browser-check.mjs`.

Regla práctica: si cambiás `js/engine.js` o la lógica de una lección ya
dictada, corré las pruebas **antes y después** para confirmar que no se rompió
ningún reto existente.

---

## Documentación para la clase

- `docs/GUIA_DOCENTE.md`: plan minuto a minuto de las clases 5 a 8.
- `docs/TARJETAS_UNPLUGGED.md`: 8 actividades de 10–12 minutos sin pantalla.
- `docs/PLAN.md`: hitos, responsables y estado del proyecto.
