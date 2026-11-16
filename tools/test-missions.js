/* Pruebas automáticas del contenido.
   Uso:  node tools/test-missions.js
   Comprueba que cada reto se pueda ganar, que los ejemplos de cada lección
   hagan lo que dicen y que la ruta no tenga huecos. */
'use strict';

const E = require('../js/engine.js');
const { MISSIONS } = require('../js/missions.js');
const { LESSONS } = require('../js/lessons.js');

let pass = 0, fail = 0;

function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  ->  ' + JSON.stringify(extra) : '')); }
}

function blocksOf(list, out) {
  out = out || [];
  for (const b of list) {
    out.push(b.type);
    if (b.type === 'repeat') blocksOf(b.do || [], out);
  }
  return out;
}

console.log('\n== CodeKids · contenido ==\n');
console.log('-- Retos --');

for (const m of MISSIONS) {
  const level = E.parseLevel(m);
  const tag = `${m.id} ${m.title}`;

  ok(`${tag}: cuadrícula y actores`, !!level.start && !!level.flag && level.w === m.grid[0].length,
    { w: level.w, row0: m.grid[0] });
  ok(`${tag}: bandera fuera de pared`, !E.isWall(level, level.flag.x, level.flag.y));
  ok(`${tag}: solución usa la paleta`, blocksOf(m.solution).every(t => m.palette.includes(t)),
    { uses: [...new Set(blocksOf(m.solution))], palette: m.palette });
  ok(`${tag}: meta = bloques de la solución`, level.par === E.countBlocks(m.solution));

  const r = E.run(level, m.solution);
  ok(`${tag}: la solución GANA`, r.result === 'win', { result: r.result, remaining: r.remaining });
  ok(`${tag}: sin estrellas pendientes`, r.result === 'win' && r.remaining === 0);
  ok(`${tag}: 3 estrellas con la solución`, E.starsFor(level, r.stats.blocks) === 3);

  ok(`${tag}: programa vacío controlado`, E.run(level, []).result === 'error');

  const spam = E.run(level, Array.from({ length: 40 }, () => ({ type: 'move' })));
  ok(`${tag}: 40 avances no rompen nada`, ['win', 'bump', 'incomplete'].includes(spam.result));

  let flooded = false;
  try {
    E.run(level, [{ type: 'repeat', times: 20, do: [{ type: 'repeat', times: 20, do: [{ type: 'repeat', times: 20, do: [{ type: 'move' }] }] }] }], { maxSteps: 50 });
  } catch (e) { flooded = true; }
  ok(`${tag}: bucles anidados se cortan`, !flooded);

  if (m.guided) {
    ok(`${tag}: el programa precargado NO gana`, E.run(level, m.startProgram).result !== 'win');
  }
  ok(`${tag}: meta <= máximo de bloques`, level.par <= m.maxBlocks, { par: level.par, max: m.maxBlocks });
  ok(`${tag}: 2 pistas mínimo`, m.hints.length >= 2);
  ok(`${tag}: pertenece a una lección`, LESSONS.some(l => l.id === m.lesson));
  console.log('');
}

console.log('-- Lecciones --');

for (const l of LESSONS) {
  const tag = `L${l.num} ${l.title}`;
  ok(`${tag}: idea y lectura`, typeof l.idea === 'string' && l.idea.length > 20 && typeof l.read === 'string');
  ok(`${tag}: 3 pistas de lectura`, Array.isArray(l.bullets) && l.bullets.length === 3);
  ok(`${tag}: tiene retos`, l.retos.length >= 2);
  ok(`${tag}: todos los retos existen`, l.retos.every(id => MISSIONS.some(m => m.id === id)),
    { retos: l.retos });

  const ex = l.example;
  ok(`${tag}: ejemplo con cuadrícula`, !!ex && Array.isArray(ex.grid) && ex.grid.length > 1);
  const lv = E.parseLevel({ grid: ex.grid, startDir: ex.startDir });
  ok(`${tag}: ejemplo tiene robot y bandera`, !!lv.start && !!lv.flag);
  const rEx = E.run(lv, ex.program);
  ok(`${tag}: el ejemplo se ejecuta`, ['win', 'bump', 'incomplete'].includes(rEx.result), { r: rEx.result });

  if (l.id === 'l4') {
    ok(`${tag}: el ejemplo MALO falla (choca)`, rEx.result === 'bump', { r: rEx.result });
    const rFix = E.run(lv, ex.fixed);
    ok(`${tag}: la corrección GANA`, rFix.result === 'win', { r: rFix.result });
  } else {
    ok(`${tag}: el ejemplo GANA`, rEx.result === 'win', { r: rEx.result });
  }
  console.log('');
}

console.log('-- Ruta completa --');
ok('cada reto aparece en una sola lección',
  MISSIONS.length === LESSONS.reduce((a, l) => a + l.retos.length, 0));
ok('sin retos duplicados',
  new Set(LESSONS.flatMap(l => l.retos)).size === MISSIONS.length);
ok('ids de lección únicos', new Set(LESSONS.map(l => l.id)).size === LESSONS.length);
ok('todas las misiones tienen elogio', MISSIONS.every(m => typeof m.praise === 'string' && m.praise.length > 5));
ok('todas tienen "learn"', MISSIONS.every(m => typeof m.learn === 'string' && m.learn.length > 20));

const lvl = E.parseLevel(MISSIONS[0]);
ok('starsFor nunca baja de 1', [0, 1, 5, 20, 99].every(n => E.starsFor(lvl, n) >= 1));
ok('starsFor da 3 con el par exacto', E.starsFor(lvl, lvl.par) === 3);

console.log(`\nRESULTADO: ${pass} bien, ${fail} mal\n`);
process.exit(fail ? 1 : 0);
