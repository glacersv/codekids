/* =====================================================================
   CodeKids · engine.js
   Lógica pura del juego: nada de DOM aquí.
   Se puede probar con Node (tools/test-missions.mjs).

   Un "programa" es una lista de bloques:
     { id, type:'move' }
     { id, type:'left' }
     { id, type:'right' }
     { id, type:'ifwall' }            si hay pared adelante -> gira a la derecha
     { id, type:'repeat', times:n, do:[ ...bloques... ] }

   Ejecutar un programa produce "frames": una foto del estado por cada
   paso. La interfaz sólo reproduce frames, así que la simulación es
   verificable y la animación nunca se desincroniza.
   ===================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CodeKids = root.CodeKids || {};
  root.CodeKids.Engine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* Direcciones: 0 = norte (arriba), 1 = este, 2 = sur, 3 = oeste.
     Recorrido en sentido horario para que "derecha" sea +1. */
  var DIRS = [
    { x: 0, y: -1, name: 'norte' },
    { x: 1, y: 0, name: 'este' },
    { x: 0, y: 1, name: 'sur' },
    { x: -1, y: 0, name: 'oeste' }
  ];

  var START_DIRS = { north: 0, east: 1, south: 2, west: 3 };

  function key(x, y) { return x + ',' + y; }

  /* ------------------------------------------------------------------
     Niveles
     Caracteres: '#' pared · '.' piso · 'R' robot · '*' estrella · 'F' bandera
     ------------------------------------------------------------------ */
  function parseLevel(mission) {
    var rows = mission.grid;
    var h = rows.length;
    var w = 0;
    for (var i = 0; i < h; i++) w = Math.max(w, rows[i].length);

    var level = {
      w: w,
      h: h,
      walls: {},
      stars: [],
      starAt: {},
      flag: null,
      start: { x: 0, y: 0, dir: 1 }
    };

    for (var y = 0; y < h; y++) {
      var row = rows[y];
      for (var x = 0; x < w; x++) {
        var ch = row.charAt(x) || '.';
        if (ch === '#') {
          level.walls[key(x, y)] = true;
        } else if (ch === '*') {
          var s = { x: x, y: y };
          level.stars.push(s);
          level.starAt[key(x, y)] = s;
        } else if (ch === 'F') {
          level.flag = { x: x, y: y };
          if (ch === 'F') level.walls[key(x, y)] = level.walls[key(x, y)] || false;
        } else if (ch === 'R') {
          level.start = { x: x, y: y, dir: START_DIRS[mission.startDir] || 1 };
        }
      }
    }
    level.start.dir = START_DIRS[mission.startDir] || level.start.dir || 1;

    /* Cuántos bloques se necesitan como mínimo según la solución de referencia. */
    level.par = mission.solution ? countBlocks(mission.solution) : null;
    return level;
  }

  function inside(level, x, y) {
    return x >= 0 && y >= 0 && x < level.w && y < level.h;
  }

  function isWall(level, x, y) {
    return !inside(level, x, y) || level.walls[key(x, y)] === true;
  }

  /* ------------------------------------------------------------------
     Programas
     ------------------------------------------------------------------ */
  function countBlocks(list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) {
      n += 1;
      if (list[i].type === 'repeat') n += countBlocks(list[i].do || []);
    }
    return n;
  }

  /* Aplana bucles a una lista de pasos ejecutables.
     Cada paso recuerda su ruta dentro del programa (para poder iluminar
     el bloque exacto que se está ejecutando en la interfaz). */
  function expand(program, maxSteps) {
    maxSteps = maxSteps || 400;
    var steps = [];
    var tooLong = false;

    function walk(list, path) {
      if (tooLong) return;
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var p = path.concat(i);
        if (b.type === 'repeat') {
          var times = Math.max(0, Math.min(20, Number(b.times) || 0));
          for (var k = 0; k < times; k++) {
            walk(b.do || [], p);
            if (tooLong) return;
          }
        } else {
          if (steps.length >= maxSteps) { tooLong = true; return; }
          steps.push({ type: b.type, path: p });
        }
      }
    }

    walk(program, []);
    return { ok: !tooLong, steps: steps };
  }

  /* ------------------------------------------------------------------
     Ejecución
     ------------------------------------------------------------------ */
  function snapshot(level) {
    return {
      x: level.start.x,
      y: level.start.y,
      dir: level.start.dir,
      effect: 'start',
      path: null,
      index: -1,
      collect: [],
      facing: DIRS[level.start.dir].name
    };
  }

  function frame(st, effect, path, index, extra) {
    var f = {
      x: st.x,
      y: st.y,
      dir: st.dir,
      effect: effect,
      path: path || null,
      index: typeof index === 'number' ? index : -1,
      collect: [],
      facing: DIRS[st.dir].name
    };
    if (extra) for (var k in extra) f[k] = extra[k];
    return f;
  }

  function run(level, program, options) {
    options = options || {};
    var maxSteps = options.maxSteps || 400;
    var blocks = countBlocks(program);
    var stats = { blocks: blocks, steps: 0, loop: false, cond: false };

    var ex = expand(program, maxSteps);
    var first = snapshot(level);

    if (!ex.ok) {
      return {
        result: 'error',
        reason: 'too-long',
        frames: [first],
        stats: stats,
        remaining: level.stars.length,
        onFlag: false
      };
    }

    if (ex.steps.length === 0) {
      return {
        result: 'error',
        reason: 'empty',
        frames: [first],
        stats: stats,
        remaining: level.stars.length,
        onFlag: false
      };
    }

    var st = { x: level.start.x, y: level.start.y, dir: level.start.dir };
    var remaining = {};
    level.stars.forEach(function (s) { remaining[key(s.x, s.y)] = s; });
    var frames = [first];
    var result = 'incomplete';
    var hit = null;

    stats.steps = ex.steps.length;

    outer:
    for (var i = 0; i < ex.steps.length; i++) {
      var step = ex.steps[i];
      var path = step.path;

      if (path.length > 1) stats.loop = true;

      switch (step.type) {
        case 'move': {
          var d = DIRS[st.dir];
          var nx = st.x + d.x;
          var ny = st.y + d.y;
          if (isWall(level, nx, ny)) {
            frames.push(frame(st, 'bump', path, i));
            result = 'bump';
            hit = { path: path, x: nx, y: ny };
            break outer;
          }
          st.x = nx; st.y = ny;
          var collected = [];
          var kk = key(nx, ny);
          if (remaining[kk]) {
            collected.push(kk);
            delete remaining[kk];
          }
          frames.push(frame(st, 'move', path, i, { collect: collected }));

          var left = Object.keys(remaining).length;
          if (level.flag && st.x === level.flag.x && st.y === level.flag.y && left === 0) {
            result = 'win';
            frames.push(frame(st, 'win', path, i));
            break outer;
          }
          break;
        }
        case 'left':
          st.dir = (st.dir + 3) % 4;
          frames.push(frame(st, 'turn', path, i));
          break;
        case 'right':
          st.dir = (st.dir + 1) % 4;
          frames.push(frame(st, 'turn', path, i));
          break;
        case 'ifwall': {
          stats.cond = true;
          var dd = DIRS[st.dir];
          var px = st.x + dd.x;
          var py = st.y + dd.y;
          if (isWall(level, px, py)) {
            st.dir = (st.dir + 1) % 4;
            frames.push(frame(st, 'turn', path, i, { conditional: 'wall' }));
          } else {
            frames.push(frame(st, 'think', path, i, { conditional: 'clear' }));
          }
          break;
        }
        default:
          frames.push(frame(st, 'noop', path, i));
      }
    }

    var remainingCount = Object.keys(remaining).length;
    var onFlag = !!(level.flag && st.x === level.flag.x && st.y === level.flag.y);

    if (result === 'incomplete') {
      if (remainingCount > 0 && !onFlag) result = 'incomplete';
      else if (remainingCount > 0) result = 'incomplete';
      else result = 'incomplete';
    }

    return {
      result: result,          // 'win' | 'bump' | 'incomplete' | 'error'
      reason: result,          // alias legible
      frames: frames,
      stats: stats,
      remaining: remainingCount,
      onFlag: onFlag,
      hit: hit
    };
  }

  /* Estrellas de eficiencia: nunca quitan la estrella de "lo lograste". */
  function starsFor(level, blocks) {
    if (!level.par) return 3;
    if (blocks <= level.par) return 3;
    if (blocks <= Math.max(level.par + 3, Math.ceil(level.par * 1.6))) return 2;
    return 1;
  }

  return {
    DIRS: DIRS,
    START_DIRS: START_DIRS,
    key: key,
    parseLevel: parseLevel,
    inside: inside,
    isWall: isWall,
    countBlocks: countBlocks,
    expand: expand,
    run: run,
    starsFor: starsFor
  };
});
