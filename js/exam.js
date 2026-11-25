/* =====================================================================
   CodeKids · exam.js
   Evaluación «La ruta de Chispa»: 4 ejercicios de 10 columnas × 10 filas.
   Solo código: no hay bloques, pistas ni botones de ayuda.

   Cada ejercicio guarda su solución de referencia en bloques (la usa el
   motor y el test) y el código Python equivalente (que teclea el alumno).
   ===================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CodeKids = root.CodeKids || {};
  root.CodeKids.EXAM = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function m() { return { type: 'move' }; }
  function l() { return { type: 'left' }; }
  function r() { return { type: 'right' }; }
  function rep(times, list) { return { type: 'repeat', times: times, do: list }; }

  var exercises = [
    {
      id: 'e1',
      title: 'Ejercicio 1 · Línea recta',
      concept: 'Secuencia',
      goal: 'Chispa debe recoger la estrella y llegar a la bandera caminando en línea recta.',
      startDir: 'east',
      grid: [
        '..........',
        '..........',
        '..........',
        '..........',
        '.R..*...F.',
        '..........',
        '..........',
        '..........',
        '..........',
        '..........'
      ],
      solution: [m(), m(), m(), m(), m(), m(), m()]
    },
    {
      id: 'e2',
      title: 'Ejercicio 2 · La esquina',
      concept: 'Giros y bucles',
      goal: 'Lleva a Chispa por las dos estrellas hasta la bandera. Debe girar en la esquina.',
      startDir: 'east',
      grid: [
        '##########',
        '.R...*....',
        '..........',
        '..........',
        '..........',
        '........*.',
        '..........',
        '..........',
        '........F.',
        '##########'
      ],
      solution: [rep(7, [m()]), r(), rep(7, [m()])]
    },
    {
      id: 'e3',
      title: 'Ejercicio 3 · El pasillo escondido',
      concept: 'Ruta con obstáculos',
      goal: 'Chispa solo puede pasar por los huecos. Recoge las dos estrellas y llega a la meta.',
      startDir: 'south',
      grid: [
        '##########',
        '#R########',
        '#.###...*#',
        '#.###.##.#',
        '#....*##.#',
        '########.#',
        '########.#',
        '########.#',
        '########F#',
        '##########'
      ],
      solution: [
        rep(3, [m()]), l(),
        rep(4, [m()]), l(),
        rep(2, [m()]), r(),
        rep(3, [m()]), r(),
        rep(6, [m()])
      ]
    },
    {
      id: 'e4',
      title: 'Ejercicio 4 · Vuelta a la plaza',
      concept: 'Ruta larga y estrellas',
      goal: 'Da la vuelta completa, recoge las cinco estrellas y termina en la bandera.',
      startDir: 'east',
      grid: [
        '##########',
        '#R...*...#',
        '#F####...#',
        '#*#####.*#',
        '#.#####..#',
        '#.#####..#',
        '#*#####..#',
        '#.#####..#',
        '#...*....#',
        '##########'
      ],
      solution: [
        rep(7, [m()]), r(),
        rep(7, [m()]), r(),
        rep(7, [m()]), r(),
        rep(6, [m()])
      ]
    }
  ];

  /* Convierte los bloques de referencia al código que escribe el alumno. */
  function codeOf(list, indent) {
    indent = indent || 0;
    var pad = new Array(indent * 4 + 1).join(' ');
    var out = '';
    (list || []).forEach(function (b) {
      if (b.type === 'repeat') {
        out += pad + 'for i in range(' + b.times + '):\n' + codeOf(b.do || [], indent + 1);
      } else if (b.type === 'move') {
        out += pad + 'chispa.avanzar()\n';
      } else if (b.type === 'left') {
        out += pad + 'chispa.girar_izquierda()\n';
      } else if (b.type === 'right') {
        out += pad + 'chispa.girar_derecha()\n';
      }
    });
    return out;
  }

  exercises.forEach(function (e) { e.code = codeOf(e.solution); });

  return { exercises: exercises, codeOf: codeOf };
});
