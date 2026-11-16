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
    })
  ];

  root.CodeKids.MISSIONS = MISSIONS;
  if (typeof module === 'object' && module.exports) module.exports = { MISSIONS: MISSIONS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
