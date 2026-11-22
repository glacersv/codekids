/* =====================================================================
   CodeKids · quest.js
   Motor del "Modo Aventura": un héroe recorre mundos en 2D por casillas,
   lee sensores y ejecuta reglas SI → ACCIÓN escritas por el niño.

   Es lógica pura: no toca el DOM. La interfaz vive en quest-app.js.
   Se puede probar con `node tools/test-quest.js`.
   ===================================================================== */
(function (root) {
  'use strict';

  root.CodeKids = root.CodeKids || {};

  /* Derechos: este, sur, oeste, norte. Girar = siguiente en sentido horario. */
  var DIRS = [
    { x: 1, y: 0, n: 'east' },
    { x: 0, y: 1, n: 'south' },
    { x: -1, y: 0, n: 'west' },
    { x: 0, y: -1, n: 'north' }
  ];

  var SENSORS = [
    { id: 've_pared', label: 'Hay pared delante', icon: '🧱' },
    { id: 'no_hay_nada', label: 'No hay nada delante', icon: '⬜' },
    { id: 've_enemigo', label: 'Hay un enemigo', icon: '👾' },
    { id: 've_fuego', label: 'Hay fuego', icon: '🔥' },
    { id: 've_techo_bajo', label: 'Hay techo bajo', icon: '⬇️' },
    { id: 've_llave', label: 'Hay una llave', icon: '🔑' },
    { id: 've_medicina', label: 'Hay medicina', icon: '💊' },
    { id: 've_persona', label: 'Hay una persona', icon: '🧍' },
    { id: 've_puerta', label: 'Hay una puerta', icon: '🚪' },
    { id: 'herido', label: 'Estoy herido', icon: '❤️' },
    { id: 'tiene_llave', label: 'Tengo la llave', icon: '🗝️' }
  ];

  var ACTIONS = [
    { id: 'avanzar', label: 'Avanzar', icon: '➡️' },
    { id: 'girar', label: 'Girar a la derecha', icon: '↻' },
    { id: 'saltar', label: 'Saltar', icon: '⬆️' },
    { id: 'disparar', label: 'Disparar', icon: '💥' },
    { id: 'agacharse', label: 'Agacharse', icon: '🔽' },
    { id: 'recoger', label: 'Recoger', icon: '✋' },
    { id: 'rescatar', label: 'Rescatar', icon: '🤝' },
    { id: 'tomar_medicina', label: 'Tomar medicina', icon: '💊' }
  ];

  /* Ocho mundos. Cada uno introduce una idea nueva y reutiliza las anteriores.
     mode: bloques → ambos → código, para que la transición sea gradual. */
  var STAGES = [
    {
      id: 'q1', name: 'El pasillo del castillo', world: 'castillo', emoji: '🏰',
      brief: 'El castillo tiene un pasillo con una esquina. Camina hasta la puerta. Mira la pared antes de mover.',
      grid: ['#######', '#R....#', '#####.#', '#D....#', '#######'],
      sensors: ['ve_pared', 'no_hay_nada'],
      actions: ['avanzar', 'girar'],
      mode: 'blocks', startHp: 3,
      praise: '¡Recorriste el pasillo! Miraste la pared y decidiste. Eso es programar.'
    },
    {
      id: 'q2', name: 'El guardia', world: 'castillo', emoji: '🛡️',
      brief: 'Un guardia bloquea el pasillo. Si lo ves, puedes saltarlo o disparar. Luego llega a la puerta.',
      grid: ['########', '#R.E..D#', '########'],
      sensors: ['ve_pared', 'no_hay_nada', 've_enemigo'],
      actions: ['avanzar', 'girar', 'saltar', 'disparar'],
      mode: 'blocks', startHp: 3,
      praise: '¡Esquivaste al guardia! Tu regla miró y actuó antes de chocar.'
    },
    {
      id: 'q3', name: 'La antorcha', world: 'castillo', emoji: '🔥',
      brief: 'Una antorcha cae al paso. Si ves fuego, salta. No corras directo hacia él.',
      grid: ['########', '#R.F..D#', '########'],
      sensors: ['no_hay_nada', 've_fuego', 've_pared'],
      actions: ['avanzar', 'saltar', 'disparar', 'girar'],
      mode: 'blocks', startHp: 3,
      praise: '¡Saltaste el fuego! Tu héroe no se quema porque tú lo dijiste primero.'
    },
    {
      id: 'q4', name: 'Humo en la mina', world: 'fuego', emoji: '🌋',
      brief: 'En la mina hay humo bajo. Agáchate para pasar por debajo y llega a la salida.',
      grid: ['#########', '#R.B...D#', '#########'],
      sensors: ['no_hay_nada', 've_techo_bajo', 've_pared'],
      actions: ['avanzar', 'agacharse', 'girar'],
      mode: 'both', startHp: 3,
      praise: '¡Pasaste agachado! Cada obstáculo tiene su propia respuesta.'
    },
    {
      id: 'q5', name: 'La llave de la torre', world: 'fuego', emoji: '🔑',
      brief: 'La puerta está cerrada. Recoge la llave y después abre la puerta.',
      grid: ['#########', '#R.K...D#', '#########'],
      sensors: ['no_hay_nada', 've_llave', 'tiene_llave', 've_puerta'],
      actions: ['avanzar', 'recoger', 'girar'],
      mode: 'both', startHp: 3, requiresKey: true,
      praise: '¡Abriste la torre! Recoger antes de llegar es parte del plan.'
    },
    {
      id: 'q6', name: 'La medicina', world: 'bosque', emoji: '🌲',
      brief: 'Tu héroe empieza herido. Cuando veas medicina, tómala para recuperar una vida.',
      grid: ['##########', '#R.F.M..D#', '##########'],
      sensors: ['no_hay_nada', 've_fuego', 've_medicina', 'herido'],
      actions: ['avanzar', 'saltar', 'tomar_medicina', 'girar'],
      mode: 'both', startHp: 2,
      praise: '¡Te curaste a tiempo! Tu regla supo cuándo el héroe necesitaba ayuda.'
    },
    {
      id: 'q7', name: 'El rescate', world: 'bosque', emoji: '🧍',
      brief: 'Hay una persona perdida. Esquiva al enemigo, rescátala y lleva a los dos a la salida.',
      grid: ['##########', '#R.E.P..D#', '##########'],
      sensors: ['no_hay_nada', 've_enemigo', 've_persona', 've_pared'],
      actions: ['avanzar', 'saltar', 'rescatar', 'girar'],
      mode: 'text', startHp: 3, requiresRescue: true,
      praise: '¡Rescataste a tu compañero! Esa es una regla con propósito.'
    },
    {
      id: 'q8', name: 'La torre final', world: 'final', emoji: '👑',
      brief: 'Todo junto: esquiva al enemigo, salta el fuego, agáchate bajo el techo, recoge la llave y llega a la puerta.',
      grid: ['############', '#R.E.F.B.KD#', '############'],
      sensors: ['ve_enemigo', 've_fuego', 've_techo_bajo', 've_llave', 'tiene_llave', 'no_hay_nada', 've_puerta'],
      actions: ['avanzar', 'saltar', 'agacharse', 'recoger', 'girar', 'disparar'],
      mode: 'text', startHp: 3, requiresKey: true,
      praise: '¡Venciste la torre! Tus reglas ya son un programa de verdad.'
    }
  ];

  function tileAt(grid, x, y) {
    if (y < 0 || y >= grid.length) return '#';
    var row = grid[y];
    if (x < 0 || x >= row.length) return '#';
    return row[x];
  }

  function setTile(grid, x, y, value) {
    if (y < 0 || y >= grid.length) return;
    var row = grid[y];
    if (x < 0 || x >= row.length) return;
    /* parseGrid devuelve arreglos de caracteres: concatenar convertiría la
       fila en un string con comas (array + string => "a,b,c"). */
    if (Object.prototype.toString.call(row) === '[object Array]') row[x] = value;
    else grid[y] = row.slice(0, x) + value + row.slice(x + 1);
  }

  function parseGrid(stage) {
    return stage.grid.map(function (row) { return row.split(''); });
  }

  function createRun(stage, hero) {
    var grid = parseGrid(stage);
    var sx = 1, sy = 1;
    for (var y = 0; y < grid.length; y++) {
      for (var x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 'R') { sx = x; sy = y; }
      }
    }
    return {
      hero: hero || { name: 'Héroe', head: 0, body: 0, gear: 0, color: 0 },
      grid: grid, x: sx, y: sy, dir: 0,
      hp: stage.startHp || 3, maxHp: 3,
      keys: 0, rescued: 0,
      steps: 0, won: false, lost: false,
      lastRule: -1, log: [], jumpFx: null, shotFx: null
    };
  }

  function front(state) {
    var d = DIRS[state.dir];
    return { x: state.x + d.x, y: state.y + d.y };
  }

  function sensorValue(state, id) {
    var f = front(state);
    var t = tileAt(state.grid, f.x, f.y);
    var here = tileAt(state.grid, state.x, state.y);
    switch (id) {
      case 've_pared': return t === '#';
      /* Puerta y casilla libre cuentan como "nada que esquivar": así el niño
         necesita menos reglas para avanzar. Los peligros van antes en la lista. */
      case 'no_hay_nada': return t === '.' || t === 'D';
      case 've_enemigo': return t === 'E';
      case 've_fuego': return t === 'F';
      case 've_techo_bajo': return t === 'B';
      case 've_llave': return t === 'K' || here === 'K';
      case 've_medicina': return t === 'M' || here === 'M';
      case 've_persona': return t === 'P';
      case 've_puerta': return t === 'D';
      case 'herido': return state.hp < state.maxHp;
      case 'tiene_llave': return state.keys > 0;
      default: return false;
    }
  }

  function move(state, dx, dy, msg) {
    var nx = state.x + dx, ny = state.y + dy;
    var t = tileAt(state.grid, nx, ny);
    if (t === '#') { state.log.push('Hay una pared: no puedo pasar.'); return false; }
    if (t === 'E' || t === 'F') {
      state.hp -= 1;
      setTile(state.grid, nx, ny, '.');
      state.log.push(t === 'E' ? '¡Choqué con el enemigo! Me hice daño.' : '¡Me quemé con el fuego! Me hice daño.');
      if (state.hp <= 0) state.lost = true;
      return false;
    }
    state.x = nx; state.y = ny;
    state.log.push(msg || 'Avancé una casilla.');
    return true;
  }

  function applyAction(state, stage, action) {
    var d = DIRS[state.dir];
    var f = front(state);
    var t = tileAt(state.grid, f.x, f.y);
    switch (action) {
      case 'avanzar':
        move(state, d.x, d.y);
        break;
      case 'girar':
        state.dir = (state.dir + 1) % 4;
        state.log.push('Giré a la derecha.');
        break;
      case 'saltar': {
        var mid = { x: state.x + d.x, y: state.y + d.y };
        var land = { x: state.x + d.x * 2, y: state.y + d.y * 2 };
        var mt = tileAt(state.grid, mid.x, mid.y);
        var lt = tileAt(state.grid, land.x, land.y);
        if (lt === '#' || mt === '#') { state.log.push('No puedo saltar: no hay espacio.'); break; }
        state.x = land.x; state.y = land.y;
        state.jumpFx = { x: mid.x, y: mid.y };
        state.log.push('¡Salté y esquivé el obstáculo!');
        break;
      }
      case 'disparar':
        if (t === 'E' || t === 'F') {
          setTile(state.grid, f.x, f.y, '.');
          state.shotFx = { x: f.x, y: f.y };
          state.log.push(t === 'E' ? '¡Desapareció el enemigo!' : '¡Apagué el fuego!');
        } else state.log.push('Disparé, pero no había nada delante.');
        break;
      case 'agacharse':
        if (t === '#' || t === 'E' || t === 'F') { state.log.push('No puedo agacharme ahí.'); break; }
        move(state, d.x, d.y, 'Pasé agachado por debajo.');
        break;
      case 'recoger':
        if (t === 'K' || tileAt(state.grid, state.x, state.y) === 'K') {
          if (t === 'K') setTile(state.grid, f.x, f.y, '.');
          else setTile(state.grid, state.x, state.y, '.');
          state.keys += 1;
          state.log.push('¡Recogí la llave!');
        } else state.log.push('No hay nada para recoger aquí.');
        break;
      case 'rescatar':
        if (t === 'P') {
          setTile(state.grid, f.x, f.y, '.');
          state.rescued += 1;
          state.log.push('¡Rescaté a la persona!');
        } else state.log.push('No hay nadie para rescatar aquí.');
        break;
      case 'tomar_medicina':
        if (state.hp >= state.maxHp) { state.log.push('Estoy bien, no necesito medicina.'); break; }
        if (t === 'M' || tileAt(state.grid, state.x, state.y) === 'M') {
          if (t === 'M') setTile(state.grid, f.x, f.y, '.');
          else setTile(state.grid, state.x, state.y, '.');
          state.hp = Math.min(state.maxHp, state.hp + 1);
          state.log.push('¡Tomé medicina! Recuperé una vida.');
        } else state.log.push('No hay medicina aquí.');
        break;
      default:
        state.log.push('Acción desconocida: ' + action);
    }

    if (tileAt(state.grid, state.x, state.y) === 'D') {
      if (stage.requiresKey && state.keys < 1) state.log.push('La puerta está cerrada. Necesito la llave.');
      else if (stage.requiresRescue && state.rescued < 1) state.log.push('No puedo irme sin rescatar a la persona.');
      else state.won = true;
    }
  }

  /* Ejecuta una regla (la primera cuyo sensor se cumple). Devuelve el estado. */
  function step(state, stage, rules) {
    if (state.won || state.lost) return state;
    state.log = [];
    state.jumpFx = null;
    state.shotFx = null;
    var picked = -1;
    for (var i = 0; i < rules.length; i++) {
      if (sensorValue(state, rules[i].when)) { picked = i; break; }
    }
    state.lastRule = picked;
    if (picked < 0) {
      state.log.push('No tengo ninguna regla para lo que veo.');
      state.steps += 1;
      return state;
    }
    var acts = rules[picked].do || [];
    for (var a = 0; a < acts.length; a++) {
      applyAction(state, stage, acts[a]);
      if (state.won || state.lost) break;
    }
    state.steps += 1;
    return state;
  }

  function run(stage, hero, rules, maxSteps) {
    maxSteps = maxSteps || 120;
    var state = createRun(stage, hero);
    var frames = [];
    while (!state.won && !state.lost && state.steps < maxSteps) {
      step(state, stage, rules);
      frames.push({
        x: state.x, y: state.y, dir: state.dir, hp: state.hp,
        keys: state.keys, rescued: state.rescued,
        lastRule: state.lastRule, log: state.log.slice()
      });
    }
    return { state: state, frames: frames, ok: state.won };
  }

  /* --- Reglas ↔ Python ------------------------------------------------ */

  function norm(word) {
    return String(word || '').trim().replace(/^chispa\./, '').replace(/[():]/g, '').trim();
  }

  function parsePython(text) {
    var rules = [], errors = [], cur = null;
    var lines = String(text || '').split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (!raw.trim() || /^\s*#/.test(raw)) continue;
      var indent = /^\s/.test(raw);
      var clean = raw.trim();
      var when = clean.match(/^si\s+(.+?)\s*:\s*$/i);
      if (when) {
        var sensor = norm(when[1]);
        if (!SENSORS.some(function (s) { return s.id === sensor; })) {
          errors.push({ line: i + 1, text: 'No conozco el sensor "' + when[1] + '"' });
          cur = null;
          continue;
        }
        cur = { when: sensor, do: [] };
        rules.push(cur);
        continue;
      }
      var act = clean.match(/^chispa\.([a-z_]+)\(\)\s*$/i);
      if (act) {
        var action = act[1].toLowerCase();
        if (!ACTIONS.some(function (a) { return a.id === action; })) {
          errors.push({ line: i + 1, text: 'No conozco la acción "' + act[1] + '"' });
          continue;
        }
        if (!cur) { errors.push({ line: i + 1, text: 'Falta una línea "si ...:" antes' }); continue; }
        if (!indent) { errors.push({ line: i + 1, text: 'La acción debe ir indentada (4 espacios)' }); continue; }
        cur.do.push(action);
        continue;
      }
      errors.push({ line: i + 1, text: 'No entiendo esta línea' });
    }
    return { rules: rules, errors: errors };
  }

  function rulesToPython(rules) {
    var out = '';
    (rules || []).forEach(function (r) {
      out += 'si chispa.' + r.when + '():\n';
      (r.do || []).forEach(function (a) { out += '    chispa.' + a + '()\n'; });
      if (!r.do || !r.do.length) out += '    pass\n';
    });
    return out;
  }

  function validateRules(stage, rules) {
    var errs = [];
    if (!rules || !rules.length) errs.push('Agrega al menos una regla.');
    (rules || []).forEach(function (r, i) {
      if (stage.sensors.indexOf(r.when) < 0) errs.push('Regla ' + (i + 1) + ': ese sensor no aparece en este mundo.');
      if (!r.do || !r.do.length) errs.push('Regla ' + (i + 1) + ': falta una acción.');
      (r.do || []).forEach(function (a) {
        if (stage.actions.indexOf(a) < 0) errs.push('Regla ' + (i + 1) + ': esa acción no está permitida aquí.');
      });
    });
    return errs;
  }

  root.CodeKids.Quest = {
    DIRS: DIRS, SENSORS: SENSORS, ACTIONS: ACTIONS, STAGES: STAGES,
    tileAt: tileAt, parseGrid: parseGrid, createRun: createRun,
    sensorValue: sensorValue, step: step, run: run,
    parsePython: parsePython, rulesToPython: rulesToPython,
    validateRules: validateRules,
    findStage: function (id) {
      for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
      return null;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.CodeKids.Quest;
})(typeof window !== 'undefined' ? window : globalThis);
