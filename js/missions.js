/* =====================================================================
   CodeKids · missions.js
   10 retos agrupados por lección. El orden de este arreglo es el orden en
   que se juegan.

   Cuadrícula (una cadena por renglón):
     '.' piso   '#' pared   'R' robot   '*' estrella   'F' bandera

   Campos:
     lesson    lección a la que pertenece
     title     nombre corto
     concept   concepto (Secuencia, Bucle, Condicional, Depuración)
     goal      qué debe lograr, en una frase
     learn     idea que se lleva (se muestra al ganar)
     tip       ayuda del primer intento
     grid      mapa
     palette   bloques disponibles
     solution  programa de referencia (calcula la meta y valida las pruebas)
     hints     pistas de la más suave a la más directa
     praise    elogio concreto al ganar
     guided    true si empieza con un programa a medias
   ===================================================================== */
(function (root) {
  'use strict';

  var E = root.CodeKids.Engine;

  function mk(m) {
    m.par = E.countBlocks(m.solution || []);
    return m;
  }

  var MISSIONS = [

    /* ================= LECCIÓN 1 · Secuencia ================= */
    mk({
      id: 'm1',
      lesson: 'l1',
      title: 'Un paso a la vez',
      concept: 'Secuencia',
      goal: 'Lleva a Chispa hasta la bandera.',
      learn: 'Un programa es una lista de órdenes. Chispa las hace en orden, de arriba hacia abajo, una por una.',
      tip: 'Toca un bloque para agregarlo. Luego toca Ejecutar.',
      grid: ['.....', '.R..F', '.....'],
      startDir: 'east',
      palette: ['move'],
      maxBlocks: 20,
      solution: [{ type: 'move' }, { type: 'move' }, { type: 'move' }],
      hints: [
        'Toca tres veces el bloque Avanzar.',
        'Cada bloque es una orden. Chispa hace una orden por vez, en orden.'
      ],
      praise: 'Tres órdenes en fila. Eso ya es un programa.'
    }),

    mk({
      id: 'm2',
      lesson: 'l1',
      title: 'El giro',
      concept: 'Secuencia',
      goal: 'Chispa mira hacia la derecha, pero la bandera está arriba.',
      learn: 'Girar cambia hacia dónde mira Chispa, pero no la mueve. Antes de avanzar, mira hacia dónde está mirando.',
      tip: 'Girar no avanza: sólo cambia la dirección.',
      grid: ['..F..', '.....', '..R..'],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 20,
      solution: [{ type: 'left' }, { type: 'move' }, { type: 'move' }],
      hints: [
        'Primero gira a la izquierda: así Chispa mira hacia arriba.',
        'Después de girar, avanza dos veces.'
      ],
      praise: 'Giraste primero y avanzaste después. Ese orden es el correcto.'
    }),

    mk({
      id: 'm3',
      lesson: 'l1',
      title: 'La estrella escondida',
      concept: 'Secuencia',
      goal: 'Recoge la estrella y llega a la bandera.',
      learn: 'Un programa puede tener muchas órdenes y cada una cambia algo del mundo: dónde está Chispa o qué estrellas recogió.',
      tip: 'El programa termina cuando Chispa pisa la bandera con todas las estrellas recogidas.',
      grid: ['......', '...F..', '.R*...', '......'],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 24,
      solution: [
        { type: 'move' }, { type: 'left' }, { type: 'move' },
        { type: 'right' }, { type: 'move' }
      ],
      hints: [
        'Avanza una vez para recoger la estrella.',
        'Luego sube (gira a la izquierda y avanza) y gira a la derecha para llegar a la bandera.'
      ],
      praise: 'Recogiste la estrella y llegaste a la meta. Ya piensas en varios pasos.'
    }),

    mk({
      id: 'm15',
      lesson: 'l1',
      title: 'El gran zigzag',
      concept: 'Secuencia',
      goal: 'Recorre el camino en zigzag recogiendo las 4 estrellas hasta la bandera.',
      learn: 'Una secuencia larga requiere planificar cada giro y paso con paciencia. ¡El orden exacto lo es todo!',
      tip: 'Fíjate cuándo girar a la derecha y cuándo a la izquierda en cada escalón.',
      grid: [
        '......',
        '.R*...',
        '..**..',
        '...*F.',
        '......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 24,
      solution: [
        { type: 'move' }, { type: 'right' }, { type: 'move' },
        { type: 'left' }, { type: 'move' }, { type: 'right' },
        { type: 'move' }, { type: 'left' }, { type: 'move' }
      ],
      hints: [
        'Avanza, gira a la derecha y avanza para bajar el primer escalón.',
        'Luego gira a la izquierda y repite el mismo ritmo hasta llegar a la meta.'
      ],
      praise: '¡9 órdenes seguidas sin equivocarte! Dominas la secuencia al 100%.'
    }),

    /* ================= LECCIÓN 2 · Bucle ================= */
    mk({
      id: 'm4',
      lesson: 'l2',
      title: 'El truco del bucle',
      concept: 'Bucle',
      goal: 'Recoge las tres estrellas y llega a la bandera.',
      learn: 'Un bucle repite las mismas órdenes varias veces. Con 2 bloques puedes hacer el trabajo de 6.',
      tip: 'El bloque Repetir hace lo mismo varias veces sin que lo escribas otra vez.',
      grid: ['........', '.R***.F.', '........', '........'],
      startDir: 'east',
      palette: ['move', 'repeat'],
      maxBlocks: 14,
      solution: [{ type: 'repeat', times: 5, do: [{ type: 'move' }] }],
      hints: [
        'Si pones Avanzar dentro de Repetir 5 veces, Chispa avanza cinco veces.',
        'Repetir 5 veces + Avanzar: 6 bloques convertidos en 2.'
      ],
      praise: '¡Usaste un bucle! Con 2 bloques hiciste el trabajo de 6.'
    }),

    mk({
      id: 'm5',
      lesson: 'l2',
      title: 'La vuelta completa',
      concept: 'Bucle',
      goal: 'Da una vuelta, recoge las 4 estrellas y sube a la bandera.',
      learn: 'Dentro de un bucle puede haber varias órdenes: se repiten todas juntas, como un paquete.',
      tip: 'Este programa ya está empezado. Ejecútalo y mira qué le falta.',
      grid: ['.F....', '.R*...', '.*.*..', '..*...', '......'],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 18,
      guided: true,
      startProgram: [
        { type: 'repeat', times: 2, do: [{ type: 'move' }, { type: 'move' }, { type: 'right' }] }
      ],
      solution: [
        { type: 'repeat', times: 4, do: [{ type: 'move' }, { type: 'move' }, { type: 'right' }] },
        { type: 'left' },
        { type: 'move' }
      ],
      hints: [
        'El programa ya está casi listo. Ejecútalo y mira qué le falta.',
        'Cambia el 2 por el 4 con los botones + y –, y al final agrega Girar izquierda y Avanzar.'
      ],
      praise: 'Ajustaste un bucle que ya existía. Eso es leer código de otra persona.'
    }),

    mk({
      id: 'm8',
      lesson: 'l2',
      title: 'La espiral',
      concept: 'Bucle',
      goal: 'Recoge las tres estrellas dando una vuelta y termina en la bandera.',
      learn: 'Un patrón que se repite se puede escribir una sola vez dentro de un bucle, aunque tenga varias órdenes.',
      tip: 'Mira el patrón: avanza, avanza, gira. ¿Cuántas veces se repite?',
      grid: ['R*.', '..*', 'F*.'],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 16,
      solution: [
        { type: 'repeat', times: 3, do: [{ type: 'move' }, { type: 'move' }, { type: 'right' }] }
      ],
      hints: [
        'El patrón es: avanzar, avanzar, girar a la derecha.',
        'Ese patrón se repite 3 veces. Ponlo dentro de un Repetir 3.'
      ],
      praise: 'Encontraste el patrón escondido. Eso es lo que hace un bucle.'
    }),

    mk({
      id: 'm11',
      lesson: 'l2',
      title: 'El gran circuito',
      concept: 'Bucle',
      goal: 'Recorre la pista, recoge las 5 estrellas y llega a la meta.',
      learn: 'Un bucle largo ahorra decenas de bloques. En vez de 12 órdenes, sólo escribes 4 dentro de Repetir.',
      tip: 'Chispa debe avanzar tres veces y girar a la derecha. ¿Cuántas veces hace eso?',
      grid: ['......', '.R**..', '....*.', '....*.', '.F**..', '......'],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 16,
      solution: [
        { type: 'repeat', times: 3, do: [
          { type: 'move' }, { type: 'move' }, { type: 'move' }, { type: 'right' }
        ]}
      ],
      hints: [
        'Mira cada lado del circuito: son 3 pasos adelante y un giro a la derecha.',
        'Pon ese paquete dentro de Repetir 3 veces.'
      ],
      praise: '¡Completaste el gran circuito con 5 bloques! Eso es aprovechar los bucles.'
    }),

    /* ================= LECCIÓN 3 · Condicional ================= */
    mk({
      id: 'm7',
      lesson: 'l3',
      title: 'El robot que esquiva',
      concept: 'Condicional',
      goal: 'Chispa debe girar sola cuando encuentre una pared.',
      learn: 'Una regla "si pasa esto, haz aquello" sirve para muchos caminos distintos, no sólo para uno.',
      tip: 'El bloque Si hay pared mira adelante: si hay muro, gira a la derecha; si no, no hace nada.',
      grid: ['......', '.R..#.', '...F..', '......', '......'],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 18,
      solution: [{ type: 'repeat', times: 3, do: [{ type: 'move' }, { type: 'ifwall' }] }],
      hints: [
        'Repite dos cosas: Avanzar y Si hay pared.',
        'Con Repetir 3 veces alcanza: la cuarta vez ya estarías en la bandera.'
      ],
      praise: 'Le diste a Chispa una regla, no una lista. Eso es un condicional.'
    }),

    mk({
      id: 'm9',
      lesson: 'l3',
      title: 'Dos paredes',
      concept: 'Condicional',
      goal: 'Hay dos muros en el camino. La misma regla debe servir para los dos.',
      learn: 'Una regla se revisa en cada paso. Por eso el mismo programa resuelve esquinas que no habías previsto.',
      tip: 'Repite Avanzar y Si hay pared. La regla decide sola cuándo girar.',
      grid: ['......', '.R*.#.', 'F..*..', '...#..', '......'],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 18,
      solution: [{ type: 'repeat', times: 6, do: [{ type: 'move' }, { type: 'ifwall' }] }],
      hints: [
        'Repite Avanzar y Si hay pared seis veces.',
        'La primera pared la esquiva girando a la derecha. La segunda también.'
      ],
      praise: 'Una sola regla y dos esquinas resueltas. Eso es pensar con condiciones.'
    }),

    mk({
      id: 'm12',
      lesson: 'l3',
      title: 'El laberinto de tres muros',
      concept: 'Condicional',
      goal: 'Hay tres muros en el camino. Una sola regla debe llevar a Chispa hasta el centro.',
      learn: 'Un bucle con condicional puede recorrer cualquier camino delimitado por paredes, sin importar cuántos giros tenga.',
      tip: 'Repite Avanzar y Si hay pared. La regla gira sola en cada pared.',
      grid: [
        '.......',
        '.R.*.#.',
        '..F..#.',
        '.#*..#.',
        '....#..',
        '.......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 18,
      solution: [{ type: 'repeat', times: 8, do: [{ type: 'move' }, { type: 'ifwall' }] }],
      hints: [
        'Pon Avanzar y Si hay pared dentro de un bloque Repetir.',
        'Pon 8 repeticiones para que recorra todo el espiral hasta la bandera.'
      ],
      praise: '¡Tres esquinas superadas con una sola regla! Eso es programar con lógica.'
    }),

    /* ================= LECCIÓN 4 · Depuración ================= */
    mk({
      id: 'm6',
      lesson: 'l4',
      title: 'El bloque intruso',
      concept: 'Depuración',
      goal: 'Este programa está mal. Quita un bloque para que Chispa llegue.',
      learn: 'Cuando algo falla no se borra todo: se ejecuta, se mira dónde se rompe y se quita sólo lo que sobra.',
      tip: 'Ejecuta y mira dónde se rompe. Después borra el bloque que sobra.',
      grid: ['....', '.R..', '#...', '.F..'],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 10,
      guided: true,
      startProgram: [{ type: 'right' }, { type: 'move' }, { type: 'right' }, { type: 'move' }],
      solution: [{ type: 'right' }, { type: 'move' }, { type: 'move' }],
      hints: [
        'El robot choca contra la pared de la izquierda. Algo lo hizo girar dos veces.',
        'Borra el segundo bloque Girar derecha. Con uno solo alcanza.'
      ],
      praise: 'Encontraste el error leyendo el código. Eso es depurar.'
    }),

    mk({
      id: 'm10',
      lesson: 'l4',
      title: 'El número equivocado',
      concept: 'Depuración',
      goal: 'El bucle repite muy pocas veces. Corrige el número y llega a la bandera.',
      learn: 'Los números de un programa también se ajustan. Si repites de menos, el robot se queda a mitad de camino.',
      tip: 'Ejecuta y cuenta cuántas estrellas quedaron sin recoger.',
      grid: ['.......', '.R***F.', '.......'],
      startDir: 'east',
      palette: ['move', 'repeat', 'left', 'right'],
      maxBlocks: 12,
      guided: true,
      startProgram: [{ type: 'repeat', times: 2, do: [{ type: 'move' }] }],
      solution: [{ type: 'repeat', times: 4, do: [{ type: 'move' }] }],
      hints: [
        'Recogiste dos estrellas y te detuviste. Faltan una estrella y la bandera.',
        'Pulsa + en el bucle hasta que diga 4.'
      ],
      praise: 'Cambiaste un número y el programa funcionó. Eso es ajustar.'
    }),

    mk({
      id: 'm16',
      lesson: 'l4',
      title: 'El laberinto con errores',
      concept: 'Depuración',
      goal: 'El programa tiene un giro equivocado y faltan pasos. ¡Prueba, depura y llega a la meta!',
      learn: 'Encontrar varios fallos en un programa requiere observar con calma paso a paso. ¡Gran trabajo de depuración!',
      tip: 'Ejecuta el código actual y mira por qué Chispa gira hacia la pared.',
      grid: [
        '.....',
        '.R*..',
        '#..*.',
        '.F*..',
        '.....'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 18,
      guided: true,
      startProgram: [
        { type: 'move' }, { type: 'move' }, { type: 'left' },
        { type: 'move' }, { type: 'move' }, { type: 'right' }
      ],
      solution: [
        { type: 'move' }, { type: 'move' }, { type: 'right' },
        { type: 'move' }, { type: 'move' }, { type: 'right' },
        { type: 'move' }, { type: 'move' }
      ],
      hints: [
        'Chispa debe bajar hacia la derecha, pero el programa le dice girar a la izquierda.',
        'Cambia el giro a la izquierda por la derecha y añade los últimos pasos para recoger la estrella y llegar a F.'
      ],
      praise: '¡Corregiste múltiples errores y completaste la misión! Eres un detective del código.'
    }),

    /* ================= LECCIÓN 5 · Desafío Final ================= */
    mk({
      id: 'm13',
      lesson: 'l5',
      title: 'La isla de las estrellas',
      concept: 'Maestría',
      goal: 'Recorre el camino alrededor de la isla, recoge las 4 estrellas y llega a la bandera.',
      learn: 'Uniendo un bucle con una regla condicional puedes recorrer cualquier circuito cerrado con pocas líneas de código.',
      tip: 'Usa Repetir con Avanzar y Si hay pared para girar en cada esquina.',
      grid: [
        '#######',
        '#R*..*#',
        '#.###.#',
        '#F###*#',
        '#*...*#',
        '#######'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 18,
      solution: [{ type: 'repeat', times: 12, do: [{ type: 'move' }, { type: 'ifwall' }] }],
      hints: [
        'Pon Avanzar y Si hay pared adentro de un bloque Repetir.',
        'Pon el bucle en 12 repeticiones para que dé la vuelta entera a la isla.'
      ],
      praise: '¡Completaste la vuelta completa a la isla! Lógica pura de programación.'
    }),

    mk({
      id: 'm14',
      lesson: 'l5',
      title: 'El giro invertido',
      concept: 'Maestría',
      goal: 'Alguien programó el robot con un giro al revés y choca. ¡Encuentra el fallo y arréglalo!',
      learn: 'La maestría de un programador está en observar, entender la lógica y corregir el bloque exacto sin desesperar.',
      tip: 'Ejecuta el programa para ver en qué dirección gira mal y cámbialo.',
      grid: [
        '.......',
        '.R**...',
        '....*..',
        '....*..',
        '.F**...',
        '.......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 16,
      guided: true,
      startProgram: [
        { type: 'repeat', times: 3, do: [
          { type: 'move' }, { type: 'move' }, { type: 'move' }, { type: 'left' }
        ]}
      ],
      solution: [
        { type: 'repeat', times: 3, do: [
          { type: 'move' }, { type: 'move' }, { type: 'move' }, { type: 'right' }
        ]}
      ],
      hints: [
        'Chispa intenta girar a la izquierda y se sale del camino hacia arriba.',
        'Cambia el bloque Girar izquierda por Girar derecha dentro del bucle.'
      ],
      praise: '¡Descubriste el bloque equivocado y salvaste a Chispa! ¡Eres todo un programador!'
    }),

    /* ================= ESPECIAL DE TEMPORADA · Festival de Invierno ================= */
    mk({
      id: 's1',
      lesson: 'l_season',
      title: 'El Paseo Nevado',
      concept: 'Temporada',
      goal: 'Recorre la plaza del pueblo nevado, recoge las 6 estrellas brillantes y llega a la meta.',
      learn: '¡Un recorrido festivo impecable! Los bucles coordinados te permiten hacer coreografías completas.',
      tip: 'Chispa debe avanzar 4 pasos por cada lado y girar a la derecha.',
      grid: [
        '.......',
        '.R*.**.',
        '.....*.',
        '.......',
        '.....*.',
        '.F*.**.',
        '.......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 16,
      solution: [
        { type: 'repeat', times: 3, do: [
          { type: 'move' }, { type: 'move' }, { type: 'move' }, { type: 'move' }, { type: 'right' }
        ]}
      ],
      hints: [
        'Mira la distancia: son 4 pasos hacia adelante antes de doblar cada esquina.',
        'Pon 4 bloques de Avanzar y un Girar derecha dentro de Repetir 3 veces.'
      ],
      praise: '¡Completaste el paseo nevado recogiendo todas las estrellas de la temporada!'
    }),

    mk({
      id: 's2',
      lesson: 'l_season',
      title: 'El Castillo de Hielo',
      concept: 'Temporada',
      goal: 'Los bloques de hielo bloquean el camino. Usa una regla para esquivarlos y llegar a la corona.',
      learn: 'Las reglas condicionales funcionan en cualquier terreno: en laberintos de piedra, en el espacio o en castillos de hielo.',
      tip: 'Repite Avanzar y Si hay pared para que Chispa no choque con el hielo.',
      grid: [
        '......',
        '.R*.#.',
        '..F*.#',
        '...#..',
        '......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 16,
      solution: [{ type: 'repeat', times: 4, do: [{ type: 'move' }, { type: 'ifwall' }] }],
      hints: [
        'Pon Avanzar y Si hay pared dentro de Repetir.',
        'Con 4 repeticiones, Chispa gira automáticamente en los bloques de hielo y entra a la meta.'
      ],
      praise: '¡Cruzaste el castillo de hielo usando la lógica pura de la programación! ❄️👑'
    }),

    /* ================= LECCIÓN 6 · Programación en Python ================= */
    mk({
      id: 'py1',
      lesson: 'l6',
      title: 'Hola, Python: Primeras Sentencias',
      concept: 'Sintaxis Python',
      goal: 'Escribe o arma las sentencias chispa.avanzar() para recoger las 2 estrellas y llegar a la bandera.',
      learn: 'En Python cada orden termina con paréntesis (). Las sentencias se ejecutan en orden hacia abajo.',
      tip: 'Cada paso adelante se escribe como chispa.avanzar().',
      grid: [
        '.....',
        '.R**F',
        '.....'
      ],
      startDir: 'east',
      palette: ['move'],
      maxBlocks: 10,
      solution: [
        { type: 'move' }, { type: 'move' }, { type: 'move' }
      ],
      hints: [
        'Necesitas avanzar 3 veces: chispa.avanzar() tres veces seguidas.',
        'Mira cómo el panel lateral traduce tus bloques a código real de Python.'
      ],
      praise: '¡Tus primeras líneas de Python en acción! Ya estás programando en código real.'
    }),

    mk({
      id: 'py2',
      lesson: 'l6',
      title: 'Girar con Métodos en Python',
      concept: 'Sintaxis Python',
      goal: 'Combina avances y un giro a la derecha en código para llegar a la bandera.',
      learn: 'Para cambiar de dirección en código usamos funciones o métodos: chispa.girar_derecha().',
      tip: 'Avanza dos veces, gira a la derecha y avanza otras dos veces.',
      grid: [
        '.....',
        '.R.*.',
        '...*.',
        '...F.',
        '.....'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 12,
      solution: [
        { type: 'move' }, { type: 'move' }, { type: 'right' },
        { type: 'move' }, { type: 'move' }
      ],
      hints: [
        'En Python: chispa.avanzar(), chispa.avanzar(), chispa.girar_derecha()...',
        'Los paréntesis () le indican a la computadora que ejecute la acción.'
      ],
      praise: '¡Coordinaste movimientos y giros con sintaxis de Python!'
    }),

    mk({
      id: 'py3',
      lesson: 'l6',
      title: 'El Bucle `for` en Python',
      concept: 'Sintaxis Python',
      goal: 'Usa un bucle for de Python para recorrer todo el pasillo de estrellas con pocas líneas.',
      learn: 'En Python el bucle se escribe "for i in range(5):" y las órdenes de adentro llevan sangría (indentación).',
      tip: 'En vez de escribir 5 avances, un bucle for lo hace en 2 líneas de código.',
      grid: [
        '.......',
        '.R****F',
        '.......'
      ],
      startDir: 'east',
      palette: ['move', 'repeat'],
      maxBlocks: 10,
      solution: [
        { type: 'repeat', times: 5, do: [{ type: 'move' }] }
      ],
      hints: [
        'Pon un bucle Repetir con 5 repeticiones y Avanzar dentro.',
        'Mira al lado cómo se escribe en Python: for i in range(5): chispa.avanzar().'
      ],
      praise: '¡Dominaste el bucle for de Python! El principio DRY en su máxima expresión.'
    }),

    mk({
      id: 'py4',
      lesson: 'l6',
      title: 'Condicional `if` en Código',
      concept: 'Sintaxis Python',
      goal: 'Usa una sentencia if en Python para que Chispa esquive la pared automáticamente.',
      learn: 'Una sentencia "if chispa.hay_pared():" consulta un sensor y sólo se ejecuta si es Verdadero.',
      tip: 'Repite avanzar y si hay pared. El condicional if decide solo cuándo doblar.',
      grid: [
        '......',
        '.R..#.',
        '...F..',
        '......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 16,
      solution: [
        { type: 'repeat', times: 3, do: [{ type: 'move' }, { type: 'ifwall' }] }
      ],
      hints: [
        'Repite Avanzar y Si hay pared 3 veces.',
        'En Python se lee: if chispa.hay_pared(): chispa.girar_derecha().'
      ],
      praise: '¡Estructura de decisión completada! Uniste for e if como un programador profesional.'
    }),

    /* ================= LECCIÓN 7 · Modo Hacker: Solo Digitar (Sin Asistencias) ================= */
    mk({
      id: 'type1',
      lesson: 'l7',
      title: 'Solo Teclado: El Camino Escalonado',
      concept: 'Escritura Pura',
      goal: 'No hay botones de ayuda ni bloques. Digita línea por línea las sentencias exactas para recoger las 4 estrellas.',
      learn: '¡Escribiste código real desde cero! Cuando programas con el teclado adquieres la velocidad de un verdadero desarrollador.',
      tip: 'Digita chispa.avanzar() y los giros chispa.girar_derecha() o chispa.girar_izquierda().',
      grid: [
        '......',
        '.R**..',
        '...**.',
        '....F.',
        '......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right'],
      maxBlocks: 16,
      pureTyping: true,
      solution: [
        { type: 'move' }, { type: 'move' }, { type: 'right' },
        { type: 'move' }, { type: 'left' }, { type: 'move' },
        { type: 'right' }, { type: 'move' }
      ],
      hints: [
        'Escribe en orden: dos avances, giro a la derecha, avance, giro a la izquierda, avance, giro a la derecha y avance.',
        'Recuerda colocar los paréntesis () al final de cada método.'
      ],
      praise: '¡8 líneas de código escritas a mano sin fallar! Eres todo un programador.'
    }),

    mk({
      id: 'type2',
      lesson: 'l7',
      title: 'Solo Teclado: Bucle for sin Ayuda',
      concept: 'Escritura Pura',
      goal: 'Digita un bucle for en Python con su sangría de 4 espacios para recorrer la pista y recoger las estrellas.',
      learn: 'Escribir bucles a mano y respetar los dos puntos : y la sangría es la habilidad central en Python.',
      tip: 'Escribe: for i in range(3): y abajo con sangría: chispa.avanzar(), chispa.avanzar(), chispa.girar_derecha().',
      grid: [
        '.....',
        '.R*..',
        '...*.',
        '.F*..',
        '.....'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat'],
      maxBlocks: 16,
      pureTyping: true,
      solution: [
        { type: 'repeat', times: 3, do: [
          { type: 'move' }, { type: 'move' }, { type: 'right' }
        ]}
      ],
      hints: [
        'Línea 1: for i in range(3):',
        'Líneas con espacios: chispa.avanzar(), chispa.avanzar(), chispa.girar_derecha().'
      ],
      praise: '¡Digitaste un bucle for impecable con sangría y dos puntos!'
    }),

    mk({
      id: 'type3',
      lesson: 'l7',
      title: 'Solo Teclado: El Centinela Inteligente',
      concept: 'Escritura Pura',
      goal: 'Digita un bucle con un if condicional adentro para sortear el muro y ganar la misión.',
      learn: 'Has programado estructuras anidadas (un if dentro de un for) directamente desde el teclado.',
      tip: 'Combina for i in range(4): con chispa.avanzar() y if chispa.hay_pared(): chispa.girar_derecha().',
      grid: [
        '......',
        '.R*.#.',
        '..#F..',
        '......'
      ],
      startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 16,
      pureTyping: true,
      solution: [
        { type: 'repeat', times: 4, do: [
          { type: 'move' }, { type: 'ifwall' }
        ]}
      ],
      hints: [
        'Digita el for en la primera línea.',
        'Dentro del for digita chispa.avanzar() y luego if chispa.hay_pared(): con chispa.girar_derecha().'
      ],
      praise: '¡Completaste el reto supremo de código escrito! Código puro, sin bloques, sin trampas. ¡Felicitaciones!'
    })
  ];

  root.CodeKids.MISSIONS = MISSIONS;
  if (typeof module === 'object' && module.exports) module.exports = { MISSIONS: MISSIONS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
