# Guía docente — Clases 5 a 8

**Curso:** 4 semanas, dos encuentros por semana (lunes y miércoles).
**Horario:** 08:00 a 09:30 (90 minutos). Ya se dictaron las clases 1 a 4.
**Público:** niños con necesidades especiales y estudiantes neurodivergentes;
atención corta; necesidad de rutina y de llevarse algo concreto.

Esta guía cubre las cuatro clases que faltan:

| Clase | Día | Foco | Entregable del niño |
|---|---|---|---|
| 5 | lunes | Secuencia y primeras sentencias | Dibujo del camino + programa de 3 órdenes |
| 6 | miércoles | Depuración y regla `si…` | Error encontrado, arreglado y explicado |
| 7 | lunes | Proyecto propio | Programa propio probado dos veces |
| 8 | miércoles | Muestra y cierre | Hoja con código, captura y explicación |

---

## Estado de las herramientas (leer antes de empezar)

- El **🗺️ Modo Aventura** **ya funciona** y es la puerta principal del inicio
  (`#/aventura`). Tiene **8 mundos** en 2D: los niños arman su héroe por partes,
  leen la misión y la leyenda de obstáculos, y escriben reglas
  **«SI veo algo → hago algo»**. Los mundos **1–3** son de bloques, **4–6**
  mezclan bloques y código, **7–8** son de código Python. Los sensores son
  pared, enemigo, fuego, techo bajo, llave, medicina, persona y puerta; las
  acciones son avanzar, girar, saltar, disparar, agacharse, recoger, rescatar y
  tomar medicina. El progreso y el héroe se guardan solos en el navegador.
- El tablero tiene una **capa visual** que recuerda a un juego real: color
  propio por mundo, partículas suaves, brillo del héroe y movimiento
  interpolado. Es Decoración, no contenidos nuevos: con el **Modo calma**
  activo (por defecto) se reduce casi todo. Si un niño se distrae, comprobar
  que el **Modo calma** siga activo en Ajustes.
- Los **botones PRIMM** (`1 · Investiga` / `2 · Modifica` / `3 · Crea`) **ya
  funcionan** y aparecen arriba del tablero en cada reto. `Modifica` carga un
  programa con **un solo error** para que lo encuentren; `Crea` deja la pantalla
  en blanco. `Investiga` abre tres preguntas guía.
- El **Estudio Chispa** **ya funciona**. Se abre desde el botón «🛠️ Mi Estudio
  Chispa» del inicio (o con `#/studio`). Trae 4 plantillas, guarda hasta 8
  proyectos en el navegador, permite bajar el programa como `.py` y genera un
  enlace para compartirlo. El botón **▶ Probar** carga el programa en el tablero
  libre para ejecutarlo.
- La **barra AHORA / DESPUÉS** y el temporizador de 10 minutos también están en
  cada reto: el temporizador avisa con «🧘 Pausa» al terminar.
- La vista docente con exportación de progreso sigue **en construcción**. El
  seguimiento de estas cuatro clases se hace con una planilla propia o con notas
  al margen de esta guía.

Todo lo que aparece en las rutas de abajo **ya existe** y se puede proyectar:

| Ruta | Para qué sirve |
|---|---|
| `#/aventura` | Selector de los 8 mundos y armador de héroe. |
| `#/aventura/q1` | Castillo: pared delante → girar. Primer mundo, solo bloques. |
| `#/aventura/q2` | Guardia: enemigo delante → saltar o disparar. |
| `#/aventura/q3` | Antorcha: fuego delante → saltar. |
| `#/aventura/q4` | Mina: techo bajo → agacharse. Bloques + código. |
| `#/aventura/q5` | Torre: llave → recoger, después puerta. |
| `#/aventura/q6` | Bosque: medicina → tomar cuando esté herido. |
| `#/aventura/q7` | Rescate: persona perdida → rescatar. Solo código. |
| `#/aventura/q8` | Torre final: todas las reglas juntas. |
| `#/reto/m1` | Secuencia simple: tres avances hasta la bandera. |
| `#/reto/py1` | Primeras sentencias Python: `chispa.avanzar()`. |
| `#/reto/py2` | Avances y un giro en Python. |
| `#/reto/m6` | Depuración: quitar el bloque intruso. |
| `#/reto/py4` | Condicional `if` en Python: si hay pared, girar. |
| `#/libre` | Tablero abierto para crear sin una meta impuesta. |
| `#/reto/space1` | Misión espacial, etapa 1: reto final opcional con teclado. |

Podés pegar la ruta directamente en la barra del navegador, después de la
dirección de la app (por ejemplo, `http://localhost:8765/#/reto/m1`).

---

## Rutina fija de las 4 clases

El orden no cambia nunca. Anuncialo al empezar y tachá cada bloque en el pizarrón
a medida que pasa. La predictibilidad baja la ansiedad: los niños saben qué viene.

| Hora | Bloque | Duración | Qué pasa |
|---|---|---|---|
| 08:00–08:10 | Llegada | 10 min | Recibir, guardar mochilas, elegir lugar, ver el horario visual del día. Sin consigna nueva. |
| 08:10–08:25 | Sin pantalla | 15 min | Tarjeta impresa del día (ver `TARJETAS_UNPLUGGED.md`). El cuerpo y las manos primero. |
| 08:25–08:40 | Pantalla | 15 min | Proyectar la ruta del día. Observar y ejecutar, sin producir todavía. |
| 08:40–08:50 | Pausa | 10 min | Pararse, estirar, ir al baño, agua. Sin pantalla y sin consigna. |
| 08:50–09:05 | Modificar | 15 min | Cambiar **una sola cosa** de un programa ya armado. |
| 09:05–09:20 | Crear | 15 min | Armar algo propio (en papel, en `#/libre` o en parejas). |
| 09:20–09:30 | Cierre | 10 min | Ronda oral, logro del día y guardado del material. |

Regla de oro: **si un bloque se extiende, se acorta el siguiente, nunca el
cierre**. El cierre es donde el niño pone en palabras lo que aprendió.

---

## Acuerdos de aula (neurodivergencia)

Usalos en las cuatro clases, con las mismas palabras.

1. **Predictibilidad.** Mismo orden de bloques, mismos gestos y mismas frases de
   inicio: «Primero miramos, después probamos, después contamos». Mostrá el
   horario visual y avisá con 2 minutos de anticipación cada cambio. Si hay un
   imprevisto, decilo en voz alta y actualizá el horario.
2. **Opciones limitadas.** Nunca «hacé lo que quieras». Ofrecé dos: «¿Probamos
   con 3 o con 4 avances?» o «¿querés cambiar el número o el giro?». Dos opciones
   dan control sin inundar.
3. **El error como detective.** Cuando falla, no digas «está mal». Decí «el
   robot nos dejó una pista: ¿dónde se rompió?». Usá una lupa de juguete o el
   dedo para señalar la orden sospechosa. Cambiar una cosa por vez es el método.
4. **Elogio por esfuerzo, no por resultado.** «Probaste tres veces y seguiste»,
   «te diste cuenta vos», «cambiaste una cosa y volviste a mirar». Evitá «sos el
   más inteligente» o comparar estrellas entre niños.
5. **Parejas piloto / navegador.** Uno es el **piloto** (tiene el mouse o el
   lápiz) y el otro es el **navegador** (lee las órdenes y dice qué pasa). Rotá
   a mitad de bloque con una frase fija: «cambio de rol». Nadie se queda sin
   turno; si hay tres, el tercero es el **detective** y anota el error.
6. **Sin competencia.** No hay ranking, ni «quién llega primero», ni tabla de
   estrellas comparativa. La estrella es de Chispa, no del niño. La meta es
   mejorar el propio programa.

Apoyos que ya trae la app y podés activar en Ajustes: **sonido apagado**, **modo
calma** (menos movimiento, sin confeti) y **paso a paso** (el robot avanza de a
una orden). Usalos por defecto si el grupo lo necesita.

---

## Clase 5 — lunes · Secuencia y primeras sentencias

**Objetivo único:** lograr que Chispa llegue a la bandera con **tres órdenes en
orden**, primero dibujadas en papel y después probadas en la app.

**Pantallas:** `#/reto/m1` → `#/reto/py1` → `#/reto/py2` → `#/libre` (crear).

**Materiales:** tarjetas 1 y 2 impresas, papel cuadriculado, lápiz, 3 fichas por
pareja.

### Minuto a minuto

| Hora | Bloque | Actividad concreta |
|---|---|---|
| 08:00–08:10 | Llegada | Recibir en la puerta, mostrar el horario de hoy y decir la frase fija. Cada pareja toma su hoja cuadriculada. |
| 08:10–08:25 | Sin pantalla | **Tarjeta 1 (robot humano)** y **Tarjeta 2 (dibuja el camino)**. Un niño da órdenes, el otro camina. Después dibujan el recorrido con flechas. |
| 08:25–08:40 | Pantalla | Proyectar `#/reto/m1`. Sin tocar nada todavía: contar en voz alta las tres casillas entre `R` y `F`, ejecutar la solución de referencia si hace falta y mirar cómo Chispa obedece. Después pasar a `#/reto/py1` y leer en voz alta `chispa.avanzar()`. |
| 08:40–08:50 | Pausa | A pararse. Guardar la hoja boca arriba para retomarla. |
| 08:50–09:05 | Modificar | En `#/reto/py2`, cambiar **una sola cosa**: cambiar el giro o agregar/quitar un avance. Pilotos y navegadores rotan a mitad de bloque. |
| 09:05–09:20 | Crear | Tocar **`3 · Crea`** en el reto (pantalla en blanco) o abrir `#/libre` y armar un camino propio de exactamente 3 órdenes. Si el grupo está cansado, se arma en papel y se dibuja el resultado. |
| 09:20–09:30 | Cierre | Cada pareja dice su programa con «primero…, después…, al final…». Pegar el dibujo en la carpeta. |

### Qué decir / qué NO decir

| Decí | No digas |
|---|---|
| «Chispa no adivina: hace lo que le escribimos, de arriba hacia abajo.» | «Adiviná qué quiere hacer el robot.» |
| «Una orden por vez. Contemos: una, dos, tres.» | «Hacelo rápido, ya sabés.» |
| «En Python la orden se escribe `chispa.avanzar()`. Los paréntesis le dicen que actúe.» | «Esto es difícil, no lo van a entender.» |
| «Probamos, miramos y ajustamos una cosa.» | «Está mal, empezá de cero.» |

### Logro del día

Cada niño **señala en su dibujo las 3 órdenes**, logra que Chispa llegue a la
bandera en `#/reto/py1` (o en su tablero de `#/libre`) y dice la secuencia con
palabras de orden. Se lleva el dibujo del camino + el programa de 3 órdenes.

---

## Clase 6 — miércoles · Depuración y regla `si…`

**Objetivo único:** encontrar un bloque que sobra, sacarlo y **explicar por qué**
el programa funcionó después; usar la regla `si hay pared, gira` como ejemplo de
error y de decisión.

**Pantallas:** `#/reto/m6` (detective) → `#/aventura/q1` → `#/aventura/q2` →
`#/aventura/q3` (reglas) → `#/reto/py4` (puente al código).

**Materiales:** tarjetas 5 y 7 impresas, lupa de juguete (opcional), papel,
lápiz.

### Minuto a minuto

| Hora | Bloque | Actividad concreta |
|---|---|---|
| 08:00–08:10 | Llegada | Horario visual y frase fija. Recordar la regla de la clase pasada: «una orden por vez». |
| 08:10–08:25 | Sin pantalla | **Tarjeta 5 (detective de errores)**: armar un programa con un giro de más, ejecutarlo con el robot humano, encontrar el bloque intruso y sacar solo ese. Después **Tarjeta 7 (condicional con semáforo)**. |
| 08:25–08:40 | Pantalla | Proyectar `#/reto/m6` y ejecutar sin corregir: Chispa choca. Preguntar «¿dónde se rompió?». Después abrir `#/aventura/q1`: armar el héroe entre todos, **leer la misión y la leyenda de obstáculos** y mirar cómo la regla `SI hay pared → girar` evita el choque. Si queda tiempo, mostrar `#/reto/py4` como puente a `if chispa.hay_pared():`. |
| 08:40–08:50 | Pausa | A pararse. Sin pantalla, sin consigna nueva. |
| 08:50–09:05 | Modificar | En `#/aventura/q2`, cambiar **una sola regla**: de «SI hay enemigo → avanzar» a «SI hay enemigo → saltar». Ejecutar con ⏭ Paso para ver la regla activa resaltada. Rotar piloto/navegador. Si grupo necesita el error clásico, usar **`2 · Modifica`** en `#/reto/m6`. |
| 09:05–09:20 | Crear | En `#/aventura/q3`, agregar la regla «SI hay fuego → saltar» y dejar «SI no hay nada → avanzar» al final. Si no sale, dibujar la regla en papel con un cartelito. `1 · Investiga` en los retos sirve si necesitan las tres preguntas guía. |
| 09:20–09:30 | Cierre | Ronda: cada niño dice «el error era ___, saqué ___, y pasó ___». Guardar la hoja del detective. |

### Qué decir / qué NO decir

| Decí | No digas |
|---|---|
| «El error es una pista, no un castigo. Todos los programas fallan.» | «Te equivocaste otra vez.» |
| «Cambiemos una sola cosa y volvamos a mirar.» | «Borrá todo y empezá de nuevo.» |
| «¿Qué miró Chispa antes de girar?» | «El robot es tonto, no entiende.» |
| «Leíste el programa y encontraste el bloque. Eso es depurar.» | «Es fácil, ¿no ves que sobra?» |

### Logro del día

Cada niño **explica una regla del Modo Aventura con un «porque»** («salto porque
veo al guardia») y gana al menos el mundo 2. Si además señala el bloque intruso
en `#/reto/m6`, mejor. El entregable es el error encontrado, arreglado y
explicado.

---

## Clase 7 — lunes · Proyecto propio

**Objetivo único:** construir un programa propio de 4 a 6 órdenes con una meta
elegida, probarlo dos veces y explicar una decisión que tomó.

**Pantallas:** `#/aventura` (los niños **eligen el mundo**, de q4 a q6) y
`#/studio` (Estudio Chispa para llevarse el programa). El botón «▶ Probar» del
Estudio lleva al tablero libre (`#/libre`) con el programa cargado.

**Materiales:** tarjetas 6 y 8 impresas, papel cuadriculado, lápices, cinta.

### Minuto a minuto

| Hora | Bloque | Actividad concreta |
|---|---|---|
| 08:00–08:10 | Llegada | Horario visual. Anunciar: «hoy cada uno elige su camino; hay dos opciones: con estrella o con pared». |
| 08:10–08:25 | Sin pantalla | **Tarjeta 8 (cuenta la historia)** para imaginar el recorrido y **Tarjeta 6 (bucle con palmas)** para comprimir repeticiones. Dibujar el mapa en papel. |
| 08:25–08:40 | Pantalla | Abrir `#/aventura` proyectado: cada pareja **elige un mundo** entre los que tiene desbloqueados (q4 mina, q5 torre, q6 bosque). Leer juntos la misión, la leyenda de obstáculos y probar con ⏭ Paso. Mostrar cómo el interruptor **🐍 Código** revela las mismas reglas en Python. |
| 08:40–08:50 | Pausa | A pararse. Dejar el mapa en el lugar de cada pareja. |
| 08:50–09:05 | Modificar | Revisar el mapa dibujado: cambiar una sola cosa (la cantidad de pasos o un giro) para que el recorrido sea más claro. |
| 09:05–09:20 | Crear | Cada pareja gana su mundo elegido, pasa a **🐍 Código**, copia sus reglas y las pega en `#/studio`. Les da un nombre, toca **💾 Guardar** y **⬇ Bajar .py**. Si sobra tiempo, **🔗 Compartir** y copiar el enlace. También pueden quedarse en el mundo y seguir ajustando reglas. |
| 09:20–09:30 | Cierre | Cada pareja muestra su mapa y dice: «elegimos ___ porque ___». Se guarda la hoja y el enlace del programa en la carpeta de la clase. |

### Qué decir / qué NO decir

| Decí | No digas |
|---|---|
| «Elijan entre dos caminos: con estrella o con pared.» | «Hagan cualquier cosa.» |
| «Su programa es suyo: puede ser corto si hace lo que querían.» | «El que tenga más bloques ganó.» |
| «Contanos una decisión que tomaron.» | «Copiá el ejemplo para que salga bien.» |
| «Si falla, ya sabemos qué hacer: mirar y cambiar una cosa.» | «Si no sale perfecto, no sirve.» |

### Logro del día

Cada niño muestra **su mundo elegido** en `#/aventura`, **ejecuta sus reglas dos
veces seguidas con el mismo resultado** y nombra una decisión que tomó («puso la
regla del fuego antes que la de avanzar»). El programa queda guardado en el
Estudio con su nombre, bajado como `.py` y respaldado en la hoja de papel.

---

## Clase 8 — miércoles · Muestra y cierre

**Objetivo único:** contar a otros qué programa se armó y cómo se arregló un
error, usando las palabras aprendidas en las cuatro clases.

**Pantallas:** `#/aventura/q7` y `#/aventura/q8` (laboratorio cooperativo:
entre todos escriben las reglas en código) y `#/studio` (galería «Mis programas
guardados» y muestra de los proyectos). `#/reto/space1` queda como reto final
opcional.

**Materiales:** tarjetas 5 y 8 impresas, hoja final por niño, lápiz, certificado
de papel (opcional).

### Minuto a minuto

| Hora | Bloque | Actividad concreta |
|---|---|---|
| 08:00–08:10 | Llegada | Horario visual. Avisar: «hoy mostramos, no comparamos». |
| 08:10–08:25 | Sin pantalla | **Tarjeta 8 (cuenta la historia)** con el programa propio de cada uno; **Tarjeta 5 (detective)** para recordar un error ya arreglado. Preparar la hoja final. |
| 08:25–08:40 | Pantalla | Ronda de muestra desde `#/studio`: cada pareja abre su programa guardado, toca «▶ Probar» y cuenta con «primero, después, al final». Después abrir `#/aventura/q7` en pantalla compartida: entre todos leen la misión y escriben las reglas en código. |
| 08:40–08:50 | Pausa | A pararse. Sin pantalla. Preparar los certificados. |
| 08:50–09:05 | Modificar | Cada niño escribe en su hoja final una frase: «cuando falló, hice ___». Si quiere, ajusta una última orden en su programa. |
| 09:05–09:20 | Crear | Laboratorio cooperativo en `#/aventura/q8`: rotar roles cada 4 minutos —**lector** (lee la misión y la leyenda), **escritor** (escribe una regla), **probador** (toca ⏭ Paso y dice qué pasó)**. Entre todos completan la torre final. Después armar la carpeta: dibujo (clase 5), detective (clase 6), mapa propio (clase 7) y hoja final con el código. |
| 09:20–09:30 | Cierre | Ronda breve sin competencia: cada niño dice una cosa que aprendió. Entregar el certificado de papel y despedir. |

### Qué decir / qué NO decir

| Decí | No digas |
|---|---|
| «Hoy mostramos lo que cada uno construyó. No hay ganadores.» | «A ver quién tiene más estrellas.» |
| «Contá qué probaste y qué cambiaste.» | «Contá solo si te salió perfecto.» |
| «Tu programa se puede seguir mejorando.» | «Ya terminaste, no hay más para hacer.» |
| «Gracias por explicar con calma.» | «Apurate, que los demás esperan.» |

### Logro del día

Cada niño entrega **su archivo `.py` o enlace del Estudio, una captura o dibujo
de su tablero y la frase «cuando falló, hice…»**, y la cuenta en voz alta (o con
la pareja) durante la ronda. Ese es el cierre del curso.

---

## Si sobra tiempo o falta tiempo

- **Sobra tiempo:** repetir la tarjeta sin pantalla del día con una variante
  difícil; o probar `#/reto/space1` en parejas, sin presión de vidas.
- **Falta tiempo:** mantener llegada, pausa y cierre. Recortar «pantalla» y
  «crear»; nunca eliminar el cierre ni el momento de contar el logro.
- **Un niño se frustra:** volver a la opción limitada («¿avanzamos o giramos?»),
  bajar a la variante fácil de la tarjeta y ofrecer el rol de navegador en vez
  del de piloto. El objetivo es que vuelva a probar, no que termine igual que
  los demás.
