/* Pruebas de contenido de la evaluación «La ruta de Chispa».
   Uso: node tools/test-exam.js */
'use strict';

var E = require('../js/engine.js');
var EXAM = require('../js/exam.js');

var ok = 0;
var bad = 0;

function check(cond, msg) {
  if (cond) { ok += 1; return; }
  bad += 1;
  console.error('MAL: ' + msg);
}

/* Parser mínimo del mismo Python-like que acepta app.js (solo lo que
   necesitan las respuestas de referencia). */
function parseCode(text) {
  var lines = text.split('\n');

  function parseBlock(start, minIndent) {
    var list = [];
    var i = start;
    while (i < lines.length) {
      var raw = lines[i];
      var trimmed = raw.trim();
      if (!trimmed || trimmed.charAt(0) === '#') { i += 1; continue; }
      var indent = raw.search(/\S/);
      if (indent < minIndent) break;
      var clean = trimmed.toLowerCase();

      if (clean === 'chispa.avanzar()') {
        list.push({ type: 'move' });
        i += 1;
      } else if (clean === 'chispa.girar_izquierda()') {
        list.push({ type: 'left' });
        i += 1;
      } else if (clean === 'chispa.girar_derecha()') {
        list.push({ type: 'right' });
        i += 1;
      } else {
        var loop = clean.match(/^for\s+.*\s+in\s+range\((\d+)\)\s*:?$/);
        if (!loop) throw new Error('línea ' + (i + 1) + ': ' + trimmed);
        var inner = parseBlock(i + 1, indent + 1);
        list.push({ type: 'repeat', times: parseInt(loop[1], 10), do: inner.list });
        i = inner.next;
      }
    }
    return { list: list, next: i };
  }

  return parseBlock(0, 0).list;
}

check(EXAM.exercises.length >= 4, 'debe haber al menos 4 ejercicios');
check(new Set(EXAM.exercises.map(function (e) { return e.id; })).size === EXAM.exercises.length,
  'los ids de los ejercicios no se repiten');

EXAM.exercises.forEach(function (e) {
  check(e.grid.length === 10, e.id + ': el tablero debe tener 10 filas');
  e.grid.forEach(function (row, y) {
    check(row.length === 10, e.id + ': la fila ' + (y + 1) + ' debe tener 10 columnas');
  });

  var joined = e.grid.join('');
  check(/^[.#R*F]+$/.test(joined), e.id + ': símbolos de mapa no válidos');
  check((joined.match(/R/g) || []).length === 1, e.id + ': debe haber un solo inicio (R)');
  check((joined.match(/F/g) || []).length === 1, e.id + ': debe haber una sola meta (F)');
  check((joined.match(/\*/g) || []).length > 0, e.id + ': debe haber estrellas');

  check(EXAM.codeOf(e.solution) === e.code, e.id + ': el código no coincide con la solución');

  var blocks = null;
  try {
    blocks = parseCode(e.code);
    check(true, e.id + ': el código se puede digitar y parsear');
  } catch (err) {
    check(false, e.id + ': ' + err.message);
  }
  if (!blocks) return;

  check(JSON.stringify(blocks) === JSON.stringify(e.solution),
    e.id + ': el código escrito produce la solución de referencia');

  var level = E.parseLevel(e);
  var run = E.run(level, blocks, { maxSteps: 400 });
  check(run.result === 'win', e.id + ': la ruta de referencia debe llegar a la meta (' + run.result + ')');
  check(run.remaining === 0, e.id + ': deben recogerse todas las estrellas');

  var moves = run.frames.filter(function (f) { return f.effect === 'move'; }).length;
  check(moves > 0, e.id + ': la ruta debe tener movimientos');
  var last = run.frames[run.frames.length - 1];
  check(last.x === level.flag.x && last.y === level.flag.y,
    e.id + ': Chispa debe terminar sobre la bandera');
});

console.log('RESULTADO: ' + ok + ' bien, ' + bad + ' mal');
process.exit(bad ? 1 : 0);
