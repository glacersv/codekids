/* =====================================================================
   CodeKids · lessons.js
   Cada lección tiene TRES partes, siempre en el mismo orden:
     1. Lee      una idea, tres pistas y un párrafo corto
     2. Ejemplo  un programa ya resuelto que el niño ejecuta y observa
     3. Retos    dos o tres problemas que resuelve él

   El ejemplo usa el mismo motor que los retos, así que lo que ve es
   exactamente lo que va a hacer después.
   ===================================================================== */
(function (root) {
  'use strict';

  var LESSONS = [

    /* ==================== 1 ==================== */
    {
      id: 'l1',
      num: 1,
      title: 'Las órdenes van en orden',
      concept: 'Secuencia',
      idea: 'Un programa es una lista de órdenes. Chispa las hace de arriba hacia abajo, una por una.',
      bullets: [
        'Cada bloque es una orden.',
        'El orden manda: si cambias dos bloques de lugar, cambia el resultado.',
        'Girar cambia hacia dónde mira Chispa. No la mueve.'
      ],
      read: 'Chispa no adivina nada. Si tu programa dice «avanzar, girar, avanzar», eso hará. Si el resultado no es el que querías, el programa estaba mal escrito, no Chispa. Por eso se prueba y se ajusta.',
      example: {
        caption: 'Cuatro bloques que llevan a Chispa hasta la bandera.',
        grid: ['....', '..F.', 'R...'],
        startDir: 'east',
        program: [
          { type: 'move' },
          { type: 'move' },
          { type: 'left' },
          { type: 'move' }
        ],
        note: 'Fíjate en el orden: avanzó dos veces y después giró. Si hubiera girado antes, Chispa no llegaba.'
      },
      retos: ['m1', 'm2', 'm3']
    },

    /* ==================== 2 ==================== */
    {
      id: 'l2',
      num: 2,
      title: 'Hacer lo mismo sin repetir',
      concept: 'Bucle',
      idea: 'Si una orden se repite muchas veces, usa un bucle: la escribes una vez y la repites N veces.',
      bullets: [
        'Repetir 5 veces { Avanzar } es lo mismo que cinco bloques de Avanzar.',
        'Dentro del bucle pueden ir varias órdenes.',
        'Menos bloques, mismo trabajo.'
      ],
      read: 'Los programadores buscan patrones: ¿qué se repite? Cuando lo encuentran, lo meten en un bucle. Así el programa es más corto y más fácil de corregir.',
      example: {
        caption: 'Un bucle de 4 repeticiones. Mira cuántos bloques ahorra.',
        grid: ['........', '.R...F..', '........'],
        startDir: 'east',
        program: [
          { type: 'repeat', times: 4, do: [{ type: 'move' }] }
        ],
        note: 'Sin bucle harían falta cuatro bloques de Avanzar. Con bucle son dos. El resultado es el mismo.'
      },
      retos: ['m4', 'm5', 'm8', 'm11']
    },

    /* ==================== 3 ==================== */
    {
      id: 'l3',
      num: 3,
      title: 'Si pasa esto, haz aquello',
      concept: 'Condicional',
      idea: 'Un condicional es una regla que mira el mundo antes de actuar: si pasa esto, haz aquello.',
      bullets: [
        '«Si hay pared, gira» funciona aunque la pared esté en otro lugar.',
        'La regla se revisa cada vez que se ejecuta.',
        'Con reglas puedes cruzar caminos que no conoces.'
      ],
      read: 'Una lista de órdenes sólo sirve para un camino. Una regla sirve para muchos. El bloque «Si hay pared» mira la celda de adelante: si hay muro, gira; si está libre, no hace nada.',
      example: {
        caption: 'La misma regla se repite tres veces. No sabe dónde está la pared: la descubre.',
        grid: ['......', '......', '.R..#.', '...F..', '......'],
        startDir: 'east',
        program: [
          { type: 'repeat', times: 3, do: [{ type: 'move' }, { type: 'ifwall' }] }
        ],
        note: 'La primera vez no había pared y no giró. La segunda sí, y giró sola. Eso es una regla.'
      },
      retos: ['m7', 'm9', 'm12']
    },

    /* ==================== 4 ==================== */
    {
      id: 'l4',
      num: 4,
      title: 'Si falla, ajusta una cosa',
      concept: 'Depuración',
      idea: 'Cuando algo falla, no borres todo. Ejecuta, mira dónde se rompe y cambia una sola cosa.',
      bullets: [
        'El error te dice dónde mirar.',
        'Cambia una cosa por vez y vuelve a ejecutar.',
        'Leer tu propio programa también es programar.'
      ],
      read: 'Todos los programas fallan, también los de los expertos. Lo que cambia es el método: probar, mirar el resultado y ajustar. Si cambias muchas cosas a la vez, no sabrás cuál funcionó.',
      example: {
        caption: 'Este programa tiene un error. Ejecútalo y míralo fallar.',
        grid: ['....', '.R..', '#...', '.F..'],
        startDir: 'east',
        program: [
          { type: 'right' },
          { type: 'move' },
          { type: 'right' },
          { type: 'move' }
        ],
        fixed: [
          { type: 'right' },
          { type: 'move' },
          { type: 'move' }
        ],
        fixLabel: 'Quitar el segundo giro',
        note: 'Chispa giró dos veces y terminó mirando a la pared. Por eso chocó.',
        fixNote: 'Ahora sí: con un solo giro llega a la bandera. Ese bloque era el que sobraba.'
      },
      retos: ['m6', 'm10']
    },

    /* ==================== 5 ==================== */
    {
      id: 'l5',
      num: 5,
      title: 'El Gran Desafío Final',
      concept: 'Maestría',
      idea: 'Un verdadero programador combina todo: secuencias, bucles, reglas y depuración para resolver cualquier misión.',
      bullets: [
        'Los bucles con condicionales resuelven caminos complejos con muy pocos bloques.',
        'La depuración te permite analizar programas de otros y arreglarlos.',
        '¡Ahora tienes todas las herramientas para pensar como un programador!'
      ],
      read: 'Has aprendido las cuatro bases de la programación: el orden de los pasos, la magia de no repetirte, las decisiones automáticas y el arte de encontrar y arreglar errores. En esta última lección pondrás a prueba todo tu ingenio.',
      example: {
        caption: 'Un bucle con condicional resuelve un recorrido con esquinas desconocidas.',
        grid: ['......', '.R.*#.', '..F.#.', '...#..', '......'],
        startDir: 'east',
        program: [
          { type: 'repeat', times: 4, do: [{ type: 'move' }, { type: 'ifwall' }] }
        ],
        note: 'Chispa avanza y si encuentra un muro gira a la derecha sola, recogiendo la estrella y llegando a la meta.'
      },
      retos: ['m13', 'm14']
    }
  ];

  root.CodeKids.LESSONS = LESSONS;
  if (typeof module === 'object' && module.exports) module.exports = { LESSONS: LESSONS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
