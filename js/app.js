/* =====================================================================
   CodeKids · app.js
   Interfaz del juego. Depende de engine.js, missions.js y lessons.js.

   Recorrido: Inicio -> Lección -> (Lee · Ejemplo · Retos) -> Reto
   El niño nunca cae en un reto sin haber leído la idea y visto un ejemplo.
   ===================================================================== */
(function () {
  'use strict';

  var E = window.CodeKids.Engine;
  var MISSIONS = window.CodeKids.MISSIONS;
  var LESSONS = window.CodeKids.LESSONS;
  var EXAM = window.CodeKids.EXAM;

  var STORE_KEY = 'codekids.v3';
  var STUDIO_KEY = 'codekids.studio.v1';

  /* ==================================================================
     Utilidades
     ================================================================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var seq = 0;
  function uid() { seq += 1; return 'b' + seq; }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function h(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!attrs.hasOwnProperty(k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'dataset') { for (var d in v) n.dataset[d] = v[d]; }
        else n.setAttribute(k, v);
      }
    }
    if (children !== null && children !== undefined) {
      [].concat(children).forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        n.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return n;
  }

  /* ==================================================================
     Dibujos
     ================================================================== */
  var SVG = {
    robot: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="12" y="30" width="13" height="40" rx="6" fill="#26232E"/>' +
      '<rect x="75" y="30" width="13" height="40" rx="6" fill="#26232E"/>' +
      '<rect x="23" y="16" width="54" height="62" rx="19" fill="#3FC1A0" stroke="#26232E" stroke-width="4"/>' +
      '<rect x="33" y="25" width="34" height="21" rx="10" fill="#26232E"/>' +
      '<circle cx="43" cy="35" r="4.2" fill="#8BF0D2"/>' +
      '<circle cx="57" cy="35" r="4.2" fill="#8BF0D2"/>' +
      '<circle cx="50" cy="12" r="6.5" fill="#FFC94D" stroke="#26232E" stroke-width="3.5"/>' +
      '<rect x="40" y="62" width="20" height="5" rx="2.5" fill="#26232E" opacity=".22"/>' +
      '<rect x="40" y="70" width="12" height="4" rx="2" fill="#26232E" opacity=".15"/>' +
      '</svg>',
    star: function (fill) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.46 6.1 20.57l1.13-6.57L2.45 9.34l6.6-.96z" fill="' + (fill || '#FFC94D') + '" stroke="#26232E" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    },
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M6 22V3" stroke="#26232E" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M7 3.5h11l-2.2 4.2L18 12H7z" fill="#FF6B4A" stroke="#26232E" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<circle cx="6" cy="2.6" r="1.6" fill="#26232E"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M12 20V5M6 11l6-6 6 6" fill="none" stroke="#57516A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 1 7.5 7.5"/><path d="M4.5 7.5V12h4.5"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 0-7.5 7.5"/><path d="M19.5 7.5V12H15"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5A5 5 0 0 1 9 4.5h10"/><path d="M15.5 1.5 19 4.5l-3.5 3"/><path d="M20 14.5a5 5 0 0 1-5 5H5"/><path d="M8.5 22.5 5 19.5l3.5-3"/></svg>',
    ifwall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="9" rx="2"/><path d="M3 15.5h18M9 11v4.5M15 15.5V20"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>',
    spaceship: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<polygon points="50,10 75,70 50,60 25,70" fill="#5AA9E6" stroke="#26232E" stroke-width="4" stroke-linejoin="round"/>' +
      '<polygon points="50,22 62,60 50,54 38,60" fill="#FFFFFF"/>' +
      '<circle cx="50" cy="40" r="7" fill="#8BF0D2" stroke="#26232E" stroke-width="2.5"/>' +
      '<polygon points="25,55 12,72 25,68" fill="#FF6B4A" stroke="#26232E" stroke-width="3"/>' +
      '<polygon points="75,55 88,72 75,68" fill="#FF6B4A" stroke="#26232E" stroke-width="3"/>' +
      '<polygon points="45,62 50,88 55,62" fill="#FFC94D"/>' +
      '</svg>',
    meteor: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<polygon points="20,30 50,15 80,32 88,68 62,90 30,85 12,60" fill="#786D88" stroke="#26232E" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="42" cy="40" r="9" fill="#4A4358"/>' +
      '<circle cx="68" cy="62" r="7" fill="#4A4358"/>' +
      '<circle cx="35" cy="68" r="5" fill="#4A4358"/>' +
      '</svg>'
  };

  var BLOCK = {
    move: { label: 'Avanzar', plural: 'avanzar' },
    left: { label: 'Girar izq.', plural: 'girar a la izquierda' },
    right: { label: 'Girar der.', plural: 'girar a la derecha' },
    repeat: { label: 'Repetir', plural: 'repetir' },
    ifwall: { label: 'Si hay pared', plural: 'revisar si hay pared' }
  };

  /* ==================================================================
     Almacenamiento
     ================================================================== */
  function defaults() {
    /* Apoyo por defecto para atención: silencio y modo calma. */
    return {
      name: '', stars: {}, breaks: 0, spaceLives: 8,
      settings: { sound: false, calm: true, step: false, codeMode: 'blocks' }
    };
  }

  var store = (function load() {
    var base = defaults();
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return base;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return base;
      base.name = typeof p.name === 'string' ? p.name.slice(0, 16) : '';
      base.stars = p.stars && typeof p.stars === 'object' ? p.stars : {};
      base.breaks = Math.max(0, Number(p.breaks) || 0);
      base.spaceLives = Number.isFinite(p.spaceLives)
        ? Math.min(8, Math.max(0, Math.floor(p.spaceLives)))
        : 8;
      if (p.settings) {
        base.settings.sound = p.settings.sound === true;
        base.settings.calm = p.settings.calm !== false;
        base.settings.step = !!p.settings.step;
        base.settings.codeMode = p.settings.codeMode === 'text' ? 'text' : 'blocks';
      }
      return base;
    } catch (e) { return base; }
  })();

  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* modo privado */ }
  }

  /* ==================================================================
     Sonido
     ================================================================== */
  var Sound = (function () {
    var ctx = null, on = true;
    function ensure() {
      if (!on) return null;
      try {
        if (!ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          ctx = new AC();
        }
        if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(function () {});
        return ctx;
      } catch (e) { return null; }
    }
    function tone(freq, dur, type, vol, delay) {
      var c = ensure(); if (!c) return;
      var t0 = c.currentTime + (delay || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    }
    return {
      setOn: function (v) { on = !!v; },
      tap: function () { tone(520, 0.06, 'sine', 0.05); },
      place: function () { tone(620, 0.07, 'triangle', 0.06); tone(820, 0.07, 'triangle', 0.04, 0.05); },
      step: function () { tone(330, 0.05, 'sine', 0.03); },
      collect: function () { tone(880, 0.09, 'triangle', 0.06); tone(1320, 0.12, 'triangle', 0.045, 0.07); },
      bump: function () { tone(150, 0.16, 'sawtooth', 0.05); tone(110, 0.18, 'sine', 0.045, 0.04); },
      win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.06, i * 0.1); }); },
      error: function () { tone(300, 0.1, 'sine', 0.045); tone(220, 0.14, 'sine', 0.045, 0.09); }
    };
  })();

  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES'; u.rate = 0.95; u.pitch = 1.05;
      var voices = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < voices.length; i++) {
        if (/^es/i.test(voices[i].lang)) { u.voice = voices[i]; break; }
      }
      window.speechSynthesis.speak(u);
    } catch (e) { /* sin voz */ }
  }

  /* ==================================================================
     Estado
     ================================================================== */
  var S = {
    view: 'home',
    lesson: null,
    lessonTab: 0,
    mission: null,
    level: null,
    free: false,
    board: null,
    program: [],
    focus: [],
    undo: [],
    attempts: 0,
    hintsRevealed: 0,
    prediction: null,
    predictionDone: false,
    result: null,
    frames: [],
    idx: 0,
    playing: false,
    stepping: false,
    finished: false,
    timer: null,
    stepMode: false,
    codeError: false,
    attentionTimer: null,
    escHandler: null
  };

  var EX = { lesson: null, level: null, bag: null, timer: null, running: false };

  /* ==================================================================
     Consultas de la ruta
     ================================================================== */
  function findMission(id) {
    for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === id) return MISSIONS[i];
    return null;
  }
  function findLesson(id) {
    for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i];
    return null;
  }
  function lessonOf(missionId) {
    var m = findMission(missionId);
    return m ? findLesson(m.lesson) : null;
  }
  function lessonDone(l) {
    return l.retos.every(function (id) { return (store.stars[id] || 0) > 0; });
  }
  function lessonProgress(l) {
    return l.retos.filter(function (id) { return (store.stars[id] || 0) > 0; }).length;
  }
  function currentLesson() {
    for (var i = 0; i < LESSONS.length; i++) if (!lessonDone(LESSONS[i])) return LESSONS[i];
    return LESSONS[LESSONS.length - 1];
  }
  function nextRetoOf(missionId) {
    var l = lessonOf(missionId);
    if (!l) return null;
    var i = l.retos.indexOf(missionId);
    if (i >= 0 && i + 1 < l.retos.length) return l.retos[i + 1];
    return null;
  }
  function nextLessonAfter(l) {
    var i = LESSONS.indexOf(l);
    return (i >= 0 && i + 1 < LESSONS.length) ? LESSONS[i + 1] : null;
  }
  function totalStars() {
    return MISSIONS.reduce(function (a, m) { return a + (store.stars[m.id] || 0); }, 0);
  }
  function completedCount() {
    return MISSIONS.filter(function (m) { return (store.stars[m.id] || 0) > 0; }).length;
  }

  /* ==================================================================
     Navegación
     ================================================================== */
  function syncHash(hash) {
    try {
      if (hash) window.history.replaceState(null, '', hash);
      else window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) { /* file:// puede no permitirlo */ }
  }

  function showView(name) {
    if (S.attentionTimer) { clearInterval(S.attentionTimer); S.attentionTimer = null; }
    S.view = name;
    ['home', 'lesson', 'mission', 'progress', 'quiz', 'theory', 'exam', 'dict', 'quest'].forEach(function (v) {
      var node = document.getElementById('view-' + v);
      if (node) node.hidden = (v !== name);
    });
    var staticHash = {
      home: '', progress: '#/progreso', quiz: '#/repaso',
      theory: '#/teoria', dict: '#/diccionario'
    };
    if (Object.prototype.hasOwnProperty.call(staticHash, name)) syncHash(staticHash[name]);
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }

  function starsRow(n) {
    var box = h('div', { class: 'stars-row', 'aria-label': n + ' de 3 estrellas' });
    for (var i = 0; i < 3; i++) {
      box.appendChild(h('span', { class: 'star-slot', html: SVG.star(i < n ? '#FFC94D' : '#EFE4CE') }));
    }
    return box;
  }

  function btn(label, cls, onClick) {
    var b = h('button', { class: 'btn ' + cls, type: 'button' }, label);
    b.addEventListener('click', function () { Sound.tap(); onClick(); });
    return b;
  }

  function iconBtn(label, aria, onClick) {
    var b = h('button', { class: 'icon-btn', type: 'button', 'aria-label': aria, title: aria }, label);
    b.addEventListener('click', function () { Sound.tap(); onClick(); });
    return b;
  }

  function backBtn(onClick) {
    return iconBtn('←', 'Volver', onClick);
  }

  /* ==================================================================
     INICIO
     ================================================================== */
  /* ==================================================================
     APOYOS DE ATENCIÓN  ·  AHORA / DESPUÉS + TEMPORIZADOR
     ================================================================== */
  function attentionWidget(m, lesson, retoIdx) {
    var next = 'tu creación libre';
    if (lesson && retoIdx >= 0 && lesson.retos[retoIdx + 1]) {
      var nm = findMission(lesson.retos[retoIdx + 1]);
      if (nm) next = nm.title;
    }
    var timer = h('button', { class: 'visual-timer', type: 'button', title: 'Inicia un temporizador de 10 minutos' }, '⏱ 10 min');
    timer.addEventListener('click', function () {
      if (S.attentionTimer) {
        clearInterval(S.attentionTimer);
        S.attentionTimer = null;
        timer.textContent = '⏱ 10 min';
        return;
      }
      var end = Date.now() + 10 * 60 * 1000;
      S.attentionTimer = setInterval(function () {
        var left = Math.max(0, Math.ceil((end - Date.now()) / 60000));
        timer.textContent = left ? '⏱ ' + left + ' min' : '🧘 Pausa';
        if (!left) {
          clearInterval(S.attentionTimer);
          S.attentionTimer = null;
          setFeedback('info', '🧘', 'Diez minutos: levanta, estira y respira. Luego seguimos.');
        }
      }, 1000);
    });
    return h('div', { class: 'now-next' }, [
      h('span', { class: 'now-next__now' }, 'AHORA: ' + m.title),
      h('span', { class: 'now-next__sep' }, '→'),
      h('span', {}, 'DESPUÉS: ' + next),
      timer
    ]);
  }

  /* ==================================================================
     PRIMM: Predecir · Ejecutar · Investigar · Modificar · Crear
     ================================================================== */
  function firstBlockOf(list, type) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === type) return list[i];
      if (list[i].do) {
        var found = firstBlockOf(list[i].do, type);
        if (found) return found;
      }
    }
    return null;
  }

  function primmAction(kind) {
    var m = S.mission;
    if (kind === 'investiga') {
      overlay(h('div', { class: 'modal' }, [
        h('p', { class: 'eyebrow' }, 'PRIMM · 3 preguntas'),
        h('h2', {}, 'Investiga como un detective'),
        h('div', { class: 'how-to' }, [
          h('div', { class: 'how-to__step' }, [h('span', { class: 'how-to__n' }, '1'), h('div', {}, [h('b', {}, '¿Qué pasó?'), h('span', {}, 'Cuenta con tus palabras dónde terminó Chispa.')])]),
          h('div', { class: 'how-to__step' }, [h('span', { class: 'how-to__n' }, '2'), h('div', {}, [h('b', {}, '¿Qué bloque lo mandó?'), h('span', {}, 'Busca la orden que hizo que girara o avanzara.')])]),
          h('div', { class: 'how-to__step' }, [h('span', { class: 'how-to__n' }, '3'), h('div', {}, [h('b', {}, '¿Qué cambiarías?'), h('span', {}, 'Sólo UNA cosa. Luego vuelve a probar.')])])
        ]),
        h('div', { class: 'modal__actions' }, [
          h('button', { class: 'btn btn--primary', type: 'button', onclick: closeOverlay }, 'Volver a mi programa')
        ])
      ]));
      return;
    }
    if (kind === 'modifica') {
      var buggy = clone((m && m.solution) || [{ type: 'move' }, { type: 'move' }]);
      var target = firstBlockOf(buggy, 'move');
      if (target) target.type = 'left';
      else {
        target = firstBlockOf(buggy, 'repeat');
        if (target) target.times = Math.max(1, (target.times || 2) - 1);
        else buggy.push({ type: 'right' });
      }
      S.program = withIds(buggy);
      S.focus = [];
      S.undo = [];
      S.codeError = false;
      renderProgram();
      setFeedback('info', '🔎', 'Cambié una sola orden. Encúentrala, corrígela y prueba otra vez.');
      return;
    }
    S.program = [];
    S.focus = [];
    S.undo = [];
    S.codeError = false;
    renderProgram();
    setFeedback('info', '✨', 'Pantalla en blanco. Crea tu propio programa desde cero.');
  }

  /* ==================================================================
     ESTUDIO CHISPA · editor propio, proyectos, exportar y compartir
     ================================================================== */
  var STUDIO_TEMPLATES = [
    { name: 'Camino corto', code: 'chispa.avanzar()\nchispa.avanzar()\nchispa.avanzar()\n' },
    { name: 'Recoge y llega', code: 'chispa.avanzar()\nchispa.avanzar()\nif chispa.hay_pared():\n    chispa.girar_derecha()\nchispa.avanzar()\n' },
    { name: 'Bucle de 3', code: 'for i in range(3):\n    chispa.avanzar()\n' },
    { name: 'Misión espacial', code: 'for i in range(3):\n    chispa.avanzar()\n    if chispa.hay_pared():\n        chispa.girar_derecha()\n' }
  ];

  function studioProjects() {
    try {
      var list = JSON.parse(window.localStorage.getItem(STUDIO_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function saveStudioProjects(list) {
    try { window.localStorage.setItem(STUDIO_KEY, JSON.stringify(list.slice(0, 8))); } catch (e) { /* modo privado */ }
  }

  function encodeCode(code) {
    try {
      var bytes = new TextEncoder().encode(code || '');
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return window.btoa(bin);
    } catch (e) { return ''; }
  }

  function decodeCode(code) {
    try {
      var bin = window.atob(code || '');
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch (e) { return ''; }
  }

  function downloadText(filename, text) {
    try {
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { toast('Tu navegador no permitió descargar el archivo.'); }
  }

  function openStudio(initialCode) {
    var projects = studioProjects();
    var area = h('textarea', {
      class: 'studio__code', id: 'studio-code', spellcheck: false,
      placeholder: 'chispa.avanzar()\nchispa.girar_derecha()'
    });
    area.value = initialCode || STUDIO_TEMPLATES[0].code;
    var status = h('p', { class: 'hint-box', id: 'studio-status', hidden: 'hidden' });
    var nameInput = h('input', {
      class: 'studio__name', id: 'studio-name', type: 'text',
      maxlength: '24', placeholder: 'Nombre de mi programa'
    });
    var projectList = h('div', { class: 'studio__projects' });

    function currentCode() { return area.value; }
    function setStatus(text) {
      status.textContent = text || '';
      status.hidden = !text;
    }
    function refreshList() {
      clear(projectList);
      if (!projects.length) {
        projectList.appendChild(h('p', { class: 'tip-line' }, 'Todavía no guardaste programas. ¡Crea el primero!'));
        return;
      }
      projects.forEach(function (p, i) {
        var row = h('div', { class: 'studio__project' }, [
          h('span', {}, p.name || ('Programa ' + (i + 1))),
          h('button', { class: 'chip chip--mini', type: 'button' }, 'Abrir'),
          h('button', { class: 'chip chip--mini', type: 'button', 'aria-label': 'Borrar ' + (p.name || i) }, '🗑')
        ]);
        row.children[1].addEventListener('click', function () { area.value = p.code; setStatus('Abierto: ' + (p.name || 'Programa ' + (i + 1))); });
        row.children[2].addEventListener('click', function () {
          projects.splice(i, 1);
          saveStudioProjects(projects);
          refreshList();
        });
        projectList.appendChild(row);
      });
    }

    var templateSelect = h('select', { class: 'studio__select', id: 'studio-template', 'aria-label': 'Elige una plantilla' });
    STUDIO_TEMPLATES.forEach(function (t, i) {
      templateSelect.appendChild(h('option', { value: String(i) }, t.name));
    });
    templateSelect.addEventListener('change', function () {
      area.value = STUDIO_TEMPLATES[Number(templateSelect.value)].code;
      setStatus('Plantilla cargada. ¡Cámbiale una cosa!');
    });

    function tryCode() {
      var parsed = parsePython(currentCode());
      if (parsed.errors.length) {
        setStatus('⚠️ Línea ' + parsed.errors[0].line + ': ' + parsed.errors[0].text + '. Corrígela y prueba otra vez.');
        Sound.error();
        return;
      }
      closeOverlay();
      openFreePlay();
      S.program = parsed.program;
      S.focus = [];
      S.undo = [];
      S.codeError = false;
      renderProgram();
      setFeedback('ok', '🚀', 'Tu programa está cargado. Toca Ejecutar para probarlo.');
    }

    function saveProject() {
      var code = currentCode();
      var parsed = parsePython(code);
      if (parsed.errors.length) { setStatus('⚠️ Corrige el código antes de guardar.'); return; }
      var name = (nameInput.value || '').trim() || ('Mi programa ' + (projects.length + 1));
      projects.unshift({ name: name.slice(0, 24), code: code, date: Date.now() });
      saveStudioProjects(projects);
      nameInput.value = name.slice(0, 24);
      refreshList();
      setStatus('✅ Guardado: ' + name);
      Sound.place();
    }

    var panel = h('div', { class: 'modal modal--wide studio' }, [
      h('p', { class: 'eyebrow' }, 'Tu espacio de creación'),
      h('h2', {}, '🛠️ Estudio Chispa'),
      h('p', { class: 'lead' }, 'Escribe órdenes, pruébalas y guarda tu programa. No hay nota: sólo tu idea funcionando.'),
      h('div', { class: 'studio-toolbar' }, [
        templateSelect,
        h('button', { class: 'btn btn--primary', type: 'button', onclick: tryCode }, '▶ Probar'),
        h('button', { class: 'btn btn--soft', type: 'button', onclick: saveProject }, '💾 Guardar'),
        h('button', {
          class: 'btn btn--soft', type: 'button', onclick: function () {
            downloadText((nameInput.value || 'mi-programa').replace(/[^\w-]/g, '_') + '.py', currentCode());
          }
        }, '⬇ Bajar .py'),
        h('button', {
          class: 'btn btn--soft', type: 'button', onclick: function () {
            var hash = '#/studio/' + encodeCode(currentCode());
            syncHash(hash);
            var link = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(link).then(function () { setStatus('🔗 Enlace copiado. Compártelo para abrir tu programa.'); })
                .catch(function () { setStatus('🔗 Enlace listo en la barra del navegador.'); });
            } else setStatus('🔗 Enlace listo en la barra del navegador.');
          }
        }, '🔗 Compartir')
      ]),
      nameInput,
      area,
      status,
      h('div', { class: 'studio__saved' }, [h('h3', {}, 'Mis programas guardados'), projectList]),
      h('div', { class: 'modal__actions' }, [
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: closeOverlay }, 'Cerrar')
      ])
    ]);
    overlay(panel);
    refreshList();
    if (initialCode) setStatus('Programa compartido abierto. Puedes cambiarlo y guardarlo como tuyo.');
    syncHash('#/studio');
  }

  function openQuest() {
    Sound.tap();
    if (window.CodeKids && window.CodeKids.QuestApp) window.CodeKids.QuestApp.open();
    else window.location.hash = '#/aventura';
  }

  function renderHome() {
    var host = $('#view-home .wrap');
    clear(host);
    var name = (store.name || '').trim();
    var cl = currentLesson();
    var allDone = MISSIONS.every(function (m) { return (store.stars[m.id] || 0) > 0; });

    var hero = h('header', { class: 'home__hero' }, [
      h('div', { class: 'home__mascot', html: SVG.robot }),
      h('div', { class: 'home__titles' }, [
        h('p', { class: 'eyebrow' }, 'CodeKids'),
        h('h1', {}, name ? ('Hola, ' + name + ' 👋') : '¡Hola! 👋'),
        h('p', { class: 'home__sub' }, LESSONS.length + ' lecciones y zona de entrenamiento. En cada una lees una idea, ves un ejemplo y resuelves retos. Al final sabrás explicar cómo empieza un programa.')
      ])
    ]);

    var titles = hero.querySelector('.home__titles');
    if (!name) {
      var input = h('input', {
        class: 'name-input', id: 'kid-name', maxlength: '16',
        placeholder: 'Escribe tu nombre', 'aria-label': 'Tu nombre', autocomplete: 'off'
      });
      input.addEventListener('change', function () {
        store.name = input.value.trim().slice(0, 16);
        save(); renderHome();
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
      titles.appendChild(h('div', { class: 'name-row' }, [
        h('label', { for: 'kid-name' }, '¿Cómo te llamas?'), input
      ]));
    } else {
      var rename = h('button', { class: 'btn btn--ghost', type: 'button' }, 'Cambiar nombre');
      rename.style.cssText = 'min-height:34px;padding:4px 10px;font-size:.76rem';
      rename.addEventListener('click', function () { store.name = ''; save(); renderHome(); });
      titles.appendChild(h('div', { class: 'name-row' }, [rename]));
    }

    var cta = h('button', { class: 'btn btn--primary btn--xl', id: 'continue-btn', type: 'button' }, [
      h('span', { 'aria-hidden': 'true' }, '▶'),
      h('span', {}, allDone ? 'Repasar lecciones' : 'Continuar'),
      h('small', {}, allDone ? 'Todo completado' : ('Lección ' + cl.num + ' · ' + cl.title))
    ]);
    cta.addEventListener('click', function () {
      Sound.tap();
      openLesson(cl.id, allDone ? 2 : 0);
    });

    var list = h('section', { class: 'lesson-list', 'aria-label': 'Lecciones' });
    list.appendChild(h('div', { class: 'section-head' }, [
      h('h2', {}, 'Tu ruta de aprendizaje'),
      h('p', {}, completedCount() + ' de ' + MISSIONS.length + ' retos resueltos')
    ]));

    LESSONS.forEach(function (l) {
      var done = lessonProgress(l);
      var isNext = l.id === cl.id && !allDone;
      var isSeason = l.id === 'l_season';
      var isSpaceLesson = l.id === 'l8';
      /* Sin aria-label: el texto visible ya nombra la lección y añadir un
         aria-label más corto rompía "label-content-name-mismatch". */
      var card = h('button', {
        class: 'lesson-card' + (lessonDone(l) ? ' is-done' : '') + (isNext ? ' is-next' : '') + (isSeason ? ' is-season' : '') + (isSpaceLesson ? ' is-space' : ''),
        type: 'button'
      }, [
        h('span', { class: 'lesson-card__num' + (isSeason ? ' is-season-badge' : (isSpaceLesson ? ' is-space-badge' : '')) }, lessonDone(l) ? '✓' : (isSpaceLesson ? '🚀' : String(l.num))),
        h('div', { class: 'lesson-card__body' }, [
          h('p', { class: 'lesson-card__kicker' }, isSeason ? '❄️ Evento Especial' : (isSpaceLesson ? '🌌 Misión Especial: 5 Stages' : l.concept)),
          h('h3', { class: 'lesson-card__title' }, l.title),
          h('p', { class: 'lesson-card__idea' }, l.idea),
          h('div', { class: 'lesson-card__foot' }, [
            h('span', { class: 'lesson-card__steps' }, 'Lee · Ejemplo · ' + l.retos.length + ' retos'),
            h('span', { class: 'lesson-card__count' }, done + '/' + l.retos.length)
          ])
        ]),
        h('span', { class: 'lesson-card__go', 'aria-hidden': 'true' }, '›')
      ]);
      card.addEventListener('click', function () { Sound.tap(); openLesson(l.id, 0); });
      list.appendChild(card);
    });

    var sideNav = h('aside', { class: 'home__sidebar' }, [
      h('div', { class: 'section-head', style: 'margin-bottom:12px' }, [
        h('h2', { style: 'font-size:1.1rem;margin:0' }, '🧭 Recursos y Práctica'),
        h('p', { style: 'font-size:.8rem;margin:0;color:var(--muted)' }, 'Herramientas de aprendizaje')
      ]),
      btn('🗺️ Modo Aventura (8 mundos)', 'btn--primary home__nav-btn', openQuest),
      btn('📖 Teoría & Evaluación', 'btn--soft home__nav-btn', function () { renderTheory(); showView('theory'); }),
      btn('📝 Evaluación · La ruta de Chispa', 'btn--soft home__nav-btn', function () { openExam(0); }),
      btn('📚 Diccionario de Sentencias', 'btn--soft home__nav-btn', function () { renderDict(); showView('dict'); }),
      btn('🧩 Rompecabezas & Repaso', 'btn--soft home__nav-btn', function () { renderQuiz(); showView('quiz'); }),
      btn('🎨 Zona libre de código', 'btn--soft home__nav-btn', openFreePlay),
      btn('🛠️ Mi Estudio Chispa', 'btn--soft home__nav-btn', function () { openStudio(); }),
      btn('📊 Mi progreso', 'btn--soft home__nav-btn', function () { renderProgress(); showView('progress'); }),
      btn('❓ Cómo se juega', 'btn--ghost home__nav-btn', openHowTo)
    ]);

    var mainContent = h('div', { class: 'home__main' }, [
      h('div', { class: 'home__cta' }, [cta]),
      list
    ]);

    var homeLayout = h('div', { class: 'home__layout' }, [
      sideNav,
      mainContent
    ]);

    /* Sin aria-label: el texto visible ya describe la acción y un aria-label
       distinto provoca label-content-name-mismatch en Lighthouse. */
    var questBanner = h('button', {
      class: 'quest-banner', type: 'button'
    }, [
      h('span', { class: 'quest-banner__emoji', 'aria-hidden': 'true' }, '🏰'),
      h('span', { class: 'quest-banner__body' }, [
        h('b', {}, 'NUEVO · Modo Aventura'),
        h('span', {}, 'Elige un mundo, arma a tu héroe y enséñale qué hacer cuando vea un enemigo, fuego o una llave.')
      ]),
      h('span', { class: 'quest-banner__go', 'aria-hidden': 'true' }, '›')
    ]);
    questBanner.addEventListener('click', openQuest);

    host.appendChild(hero);
    host.appendChild(questBanner);
    host.appendChild(homeLayout);
  }

  /* ==================================================================
     LECCIÓN (Lee · Ejemplo · Retos)
     ================================================================== */
  function openLesson(id, tab) {
    var l = findLesson(id);
    if (!l) l = LESSONS[0];
    S.lesson = l;
    S.lessonTab = tab || 0;
    syncHash('#/leccion/' + l.id + '/' + (tab || 0));
    showView('lesson');
    renderLesson();
  }

  function renderLesson() {
    var host = $('#lesson-root');
    var l = S.lesson;
    if (!l || !host) return;
    clear(host);
    clearTimeout(EX.timer);
    EX.running = false;

    var done = lessonProgress(l);

    var top = h('div', { class: 'topbar' }, [
      backBtn(function () { showView('home'); renderHome(); }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, (l.id === 'l_season' ? '❄️ Nivel de Temporada · ' : ('Lección ' + l.num + ' · ')) + l.concept),
        h('h1', { class: 'topbar__title' }, l.title)
      ]),
      h('div', { class: 'topbar__tools' }, [
        iconBtn('🔊', 'Escuchar la lección', function () {
          speak(l.idea + ' ' + (l.read || ''));
        }),
        iconBtn('?', 'Cómo se juega', openHowTo)
      ])
    ]);

    var tabs = h('div', {
      class: 'lesson-tabs', role: 'tablist', 'aria-label': 'Partes de la lección'
    });
    [['1 · Lee', 0], ['2 · Ejemplo', 1], ['3 · Retos', 2]].forEach(function (t) {
      var active = S.lessonTab === t[1];
      var tb = h('button', {
        class: 'lesson-tab' + (active ? ' is-active' : ''),
        type: 'button', role: 'tab', 'aria-selected': active ? 'true' : 'false'
      }, t[0]);
      if (t[1] === 2) tb.appendChild(h('span', { class: 'lesson-tab__badge' }, done + '/' + l.retos.length));
      tb.addEventListener('click', function () {
        S.lessonTab = t[1];
        Sound.tap();
        renderLesson();
      });
      tabs.appendChild(tb);
    });

    var pane = h('div', { class: 'lesson-pane' });
    if (S.lessonTab === 0) pane = paneRead(l);
    else if (S.lessonTab === 1) pane = paneExample(l);
    else pane = paneRetos(l);

    host.appendChild(top);
    host.appendChild(tabs);
    host.appendChild(pane);
  }

  /* ---------- 1) Lee ---------- */
  function paneRead(l) {
    var bullets = h('ul', { class: 'bullets' });
    l.bullets.forEach(function (b) {
      bullets.appendChild(h('li', {}, b));
    });

    var pane = h('div', { class: 'lesson-pane__inner' }, [
      h('p', { class: 'kicker' }, 'La idea'),
      h('h2', { class: 'idea' }, l.idea),
      h('div', { class: 'read-card' }, [
        bullets,
        h('p', { class: 'read' }, l.read)
      ])
    ]);

    pane.appendChild(h('div', { class: 'lesson-cta' }, [
      btn('2 · Ver un ejemplo →', 'btn--primary', function () {
        S.lessonTab = 1; renderLesson();
      })
    ]));

    pane.appendChild(h('p', { class: 'micro-note' }, 'Si algo no se entiende, vuelve a esta página cuando quieras.'));
    return pane;
  }

  /* ---------- 2) Ejemplo ---------- */
  function paneExample(l) {
    var ex = l.example;
    var level = E.parseLevel({ grid: ex.grid, startDir: ex.startDir, solution: null });
    EX.lesson = l;
    EX.level = level;
    EX.running = false;

    var board = h('div', { class: 'board board--example', id: 'ex-board' });
    var programHost = h('div', { class: 'ex-program', id: 'ex-program' });
    var note = h('p', { class: 'ex-note', id: 'ex-note', hidden: 'hidden' });
    var runBn = h('button', { class: 'btn btn--primary', id: 'ex-run', type: 'button' }, [
      h('span', { 'aria-hidden': 'true' }, '▶'), 'Ejecutar'
    ]);
    var fixBn = h('button', { class: 'btn btn--soft', id: 'ex-fix', type: 'button' }, ex.fixLabel || 'Probar la versión corregida');
    fixBn.hidden = true;

    var side = h('div', { class: 'ex-side' }, [
      h('p', { class: 'kicker' }, 'El programa'),
      programHost,
      runBn,
      fixBn,
      note
    ]);

    var pane = h('div', { class: 'lesson-pane__inner' }, [
      h('p', { class: 'kicker' }, 'Ejemplo resuelto'),
      h('h2', { class: 'idea' }, 'Mira este programa'),
      h('p', { class: 'read' }, ex.caption),
      h('div', { class: 'ex-layout' }, [board, side])
    ]);

    pane.appendChild(h('div', { class: 'lesson-cta' }, [
      btn('3 · Ahora tú: ' + l.retos.length + ' retos →', 'btn--primary', function () {
        S.lessonTab = 2; renderLesson();
      })
    ]));

    /* se monta después de insertar en el DOM */
    window.requestAnimationFrame(function () {
      EX.bag = mountBoard(level, $('#ex-board'));
      renderStaticProgram($('#ex-program'), ex.program);
      runBn.addEventListener('click', function () { playExample(ex.program, false); });
      fixBn.addEventListener('click', function () { playExample(ex.fixed, true); });
    });

    EX.note = note;
    EX.runBtn = runBn;
    EX.fixBtn = fixBn;
    return pane;
  }

  function renderStaticProgram(host, program) {
    if (!host) return;
    clear(host);

    function build(list, depth) {
      var box = h('div', { class: depth ? 'ex-inner' : 'ex-root' });
      (list || []).forEach(function (b) {
        if (b.type === 'repeat') {
          box.appendChild(h('div', { class: 'ex-repeat' }, [
            h('div', { class: 'ex-block ex-block--repeat' }, [
              h('span', { html: SVG.repeat }),
              h('b', {}, 'Repetir ' + (b.times || 1) + ' veces')
            ]),
            build(b.do || [], depth + 1)
          ]));
        } else {
          box.appendChild(h('div', { class: 'ex-block', dataset: { type: b.type } }, [
            h('span', { html: SVG[b.type] }),
            h('b', {}, BLOCK[b.type].label)
          ]));
        }
      });
      return box;
    }

    host.appendChild(build(program, 0));
  }

  function playExample(program, isFix) {
    if (!EX.bag || !EX.level || EX.running) return;
    var ex = EX.lesson.example;
    var r = E.run(EX.level, program, { maxSteps: 200 });
    var frames = r.frames;
    clearTimeout(EX.timer);

    EX.bag = mountBoard(EX.level, $('#ex-board'));
    EX.running = true;
    if (EX.runBtn) { EX.runBtn.disabled = true; EX.runBtn.textContent = 'Ejecutando…'; }
    if (EX.fixBtn) EX.fixBtn.hidden = true;

    var i = 0;
    applyFrame(EX.bag, frames[0], null, {});

    function step() {
      i += 1;
      if (i >= frames.length) {
        EX.running = false;
        if (EX.runBtn) { EX.runBtn.disabled = false; EX.runBtn.innerHTML = '<span aria-hidden="true">▶</span> Ejecutar otra vez'; }
        if (r.result === 'win') Sound.win(); else Sound.bump();
        if (EX.note) {
          EX.note.hidden = false;
          EX.note.textContent = isFix ? (ex.fixNote || ex.note) : ex.note;
        }
        if (!isFix && ex.fixed && r.result !== 'win' && EX.fixBtn) EX.fixBtn.hidden = false;
        return;
      }
      var f = frames[i];
      applyFrame(EX.bag, f, frames[i - 1], {});
      EX.timer = setTimeout(step, f.effect === 'bump' ? 520 : 300);
    }
    EX.timer = setTimeout(step, 320);
  }

  /* ---------- 3) Retos ---------- */
  function paneRetos(l) {
    var pane = h('div', { class: 'lesson-pane__inner' }, [
      h('p', { class: 'kicker' }, 'Ahora tú'),
      h('h2', { class: 'idea' }, 'Resuelve ' + l.retos.length + ' retos'),
      h('p', { class: 'read' }, 'Empieza por el primero. Si te trabas, usa la pista: no quita estrellas.')
    ]);

    var list = h('div', { class: 'challenge-list' });
    l.retos.forEach(function (id, i) {
      var m = findMission(id);
      if (!m) return;
      var stars = store.stars[id] || 0;
      var card = h('button', {
        class: 'challenge' + (stars ? ' is-done' : ''),
        type: 'button',
        'aria-label': 'Reto ' + (i + 1) + ': ' + m.title
      }, [
        h('span', { class: 'challenge__num' }, stars ? '✓' : String(i + 1)),
        h('div', { class: 'challenge__body' }, [
          h('b', {}, m.title),
          h('span', {}, m.goal)
        ]),
        h('span', { class: 'challenge__stars' }, starsRow(stars)),
        h('span', { class: 'challenge__go', 'aria-hidden': 'true' }, 'Jugar ›')
      ]);
      card.addEventListener('click', function () { Sound.tap(); openMission(id); });
      list.appendChild(card);
    });

    var nl = nextLessonAfter(l);
    var cta = h('div', { class: 'lesson-cta' }, [
      nl ? btn('Siguiente lección: ' + nl.title + ' →', 'btn--primary', function () { openLesson(nl.id, 0); })
        : btn('Ver mi progreso', 'btn--primary', function () { renderProgress(); showView('progress'); })
    ]);

    pane.appendChild(list);
    pane.appendChild(cta);
    return pane;
  }

  /* ==================================================================
     TABLERO
     ================================================================== */
  function mountBoard(level, host) {
    var bag = { level: level, cells: [], robot: null };
    if (!host) return bag;
    clear(host);
    host.style.setProperty('--ar', (level.w / level.h).toFixed(4));
    var isSpace = !!(S.mission && (S.mission.spaceMission || S.mission.lesson === 'l8'));
    if (isSpace) host.classList.add('board--space');
    else host.classList.remove('board--space');

    var tiles = h('div', { class: 'tiles' });
    tiles.style.gridTemplateColumns = 'repeat(' + level.w + ', 1fr)';
    tiles.style.gridTemplateRows = 'repeat(' + level.h + ', 1fr)';

    for (var y = 0; y < level.h; y++) {
      bag.cells[y] = [];
      for (var x = 0; x < level.w; x++) {
        var wall = E.isWall(level, x, y);
        var cls = 'tile';
        if (wall) cls += isSpace ? ' tile--space-wall' : ' tile--wall';
        else if ((x + y) % 2 === 1) cls += isSpace ? ' tile--space-alt' : ' tile--alt';
        else if (isSpace) cls += ' tile--space-floor';
        var tile = h('div', { class: cls });
        tile.dataset.x = x; tile.dataset.y = y;
        if (wall && isSpace) {
          tile.appendChild(h('div', { class: 'item item--meteor', style: 'opacity:.7', html: SVG.meteor }));
        }
        if (!wall && level.starAt[E.key(x, y)]) {
          tile.appendChild(h('div', { class: 'item', html: SVG.star() }));
        }
        if (!wall && level.flag && level.flag.x === x && level.flag.y === y) {
          tile.appendChild(h('div', { class: 'item', html: isSpace ? SVG.spaceship : SVG.flag }));
        }
        tiles.appendChild(tile);
        bag.cells[y][x] = tile;
      }
    }

    var robot = h('div', { class: 'robot', html: '<div class="robot__inner">' + SVG.robot + '</div>' });
    robot.style.width = (100 / level.w) + '%';
    robot.style.height = (100 / level.h) + '%';
    bag.robot = robot;

    host.appendChild(tiles);
    host.appendChild(robot);
    place(bag, level.start.x, level.start.y, level.start.dir, true);
    return bag;
  }

  function place(bag, x, y, dir, snap) {
    if (!bag || !bag.robot) return;
    if (snap) bag.robot.classList.add('is-snap');
    bag.robot.style.transform = 'translate(' + (x * 100) + '%,' + (y * 100) + '%) rotate(' + (dir * 90) + 'deg)';
    if (snap) {
      void bag.robot.offsetWidth;
      window.requestAnimationFrame(function () { if (bag.robot) bag.robot.classList.remove('is-snap'); });
    }
  }

  function addTrail(bag, x, y, dir) {
    var row = bag.cells[y];
    if (!row) return;
    var tile = row[x];
    if (!tile || tile.querySelector('.trail')) return;
    var t = h('div', { class: 'trail', html: SVG.arrow });
    t.style.transform = 'rotate(' + (dir * 90) + 'deg)';
    tile.appendChild(t);
  }

  function eatStar(bag, key) {
    var parts = String(key).split(',');
    var x = Number(parts[0]), y = Number(parts[1]);
    var tile = bag.cells[y] && bag.cells[y][x];
    if (!tile) return;
    var item = tile.querySelector('.item');
    if (!item) return;
    item.classList.add('is-taken');
    setTimeout(function () { if (item.parentNode) item.parentNode.removeChild(item); }, 420);
  }

  function applyFrame(bag, f, prev, opts) {
    opts = opts || {};
    if (!f || !bag || !bag.robot) return;

    if (f.effect === 'move' && prev) addTrail(bag, prev.x, prev.y, f.dir);
    place(bag, f.x, f.y, f.dir, false);

    if (f.collect && f.collect.length) {
      f.collect.forEach(function (k) { eatStar(bag, k); });
      Sound.collect();
    }

    if (opts.highlight) {
      document.querySelectorAll('.block.is-active, .repeat.is-active').forEach(function (n) {
        n.classList.remove('is-active');
      });
      if (f.path) {
        var node = document.querySelector('[data-path="' + f.path.join('.') + '"]');
        if (node) { node.classList.add('is-active'); revealInList(node); }
      }
    }

    if (f.effect === 'bump') {
      Sound.bump();
      bag.robot.classList.add('is-bump');
      setTimeout(function () { if (bag.robot) bag.robot.classList.remove('is-bump'); }, 440);
      var d = E.DIRS[f.dir];
      var tx = f.x + d.x, ty = f.y + d.y;
      if (E.inside(bag.level, tx, ty) && bag.cells[ty] && bag.cells[ty][tx]) {
        var tile = bag.cells[ty][tx];
        tile.classList.add('tile--hit');
        setTimeout(function () { tile.classList.remove('tile--hit'); }, 480);
      }
      if (opts.highlight && f.path) {
        var bad = document.querySelector('[data-path="' + f.path.join('.') + '"]');
        if (bad) bad.classList.add('is-bad');
      }
    }

    if (f.effect === 'think') {
      bag.robot.classList.add('is-thinking');
      setTimeout(function () { if (bag.robot) bag.robot.classList.remove('is-thinking'); }, 420);
    }
  }

  function revealInList(node) {
    var box = $('.prog-scroll');
    if (!box || !node) return;
    var b = node.getBoundingClientRect();
    var c = box.getBoundingClientRect();
    if (b.top < c.top) box.scrollTop -= (c.top - b.top) + 10;
    else if (b.bottom > c.bottom) box.scrollTop += (b.bottom - c.bottom) + 10;
  }

  /* ==================================================================
     MISIÓN
     ================================================================== */
  function withIds(list) {
    return (list || []).map(function (b) {
      var o = { id: uid(), type: b.type };
      if (b.type === 'repeat') { o.times = b.times || 2; o.do = withIds(b.do); }
      if (b.type === 'ifwall' && b.do && b.do.length) o.do = withIds(b.do);
      return o;
    });
  }

  function openMission(id) {
    var m = findMission(id);
    if (!m) m = MISSIONS[0];

    S.mission = m;
    S.free = false;
    S.level = E.parseLevel(m);
    S.program = withIds(m.startProgram || []);
    S.focus = [];
    S.undo = [];
    S.attempts = 0;
    S.hintsRevealed = 0;
    S.prediction = null;
    S.predictionDone = false;
    S.result = null;
    S.frames = [];
    S.idx = 0;
    S.playing = false;
    S.stepping = false;
    S.finished = false;
    S.stepMode = !!store.settings.step;
    S.codeError = false;
    clearTimeout(S.timer);
    clearTimeout(EX.timer);
    EX.running = false;

    syncHash('#/reto/' + m.id);
    showView('mission');
    renderMission();
  }

  function openFreePlay() {
    var m = freeMission();
    S.mission = m;
    S.free = true;
    S.level = E.parseLevel(m);
    S.program = [];
    S.focus = [];
    S.undo = [];
    S.attempts = 0;
    S.hintsRevealed = 0;
    S.idx = 0;
    S.prediction = null;
    S.predictionDone = true;
    S.result = null;
    S.frames = [];
    S.playing = false;
    S.stepping = false;
    S.finished = false;
    S.stepMode = !!store.settings.step;
    S.codeError = false;
    clearTimeout(S.timer);
    clearTimeout(EX.timer);
    EX.running = false;

    syncHash('#/libre');
    showView('mission');
    renderMission();
  }

  function freeMission() {
    var w = 7, hgt = 5, tries = 0, rows = null;
    while (tries < 60 && !rows) {
      tries++;
      var grid = [];
      for (var y = 0; y < hgt; y++) {
        var row = [];
        for (var x = 0; x < w; x++) row.push('.');
        grid.push(row);
      }
      var placed = 0;
      while (placed < 7) {
        var rx = Math.floor(Math.random() * w);
        var ry = Math.floor(Math.random() * hgt);
        if ((rx === 0 && ry === Math.floor(hgt / 2)) || grid[ry][rx] === '#') continue;
        grid[ry][rx] = '#';
        placed++;
      }
      var fx, fy, okBar = false;
      for (var t = 0; t < 90 && !okBar; t++) {
        fx = 1 + Math.floor(Math.random() * (w - 1));
        fy = Math.floor(Math.random() * hgt);
        if (grid[fy][fx] === '#') continue;
        okBar = reachable(grid, 0, Math.floor(hgt / 2), fx, fy);
      }
      if (!okBar) continue;
      grid[Math.floor(hgt / 2)][0] = 'R';
      grid[fy][fx] = 'F';
      rows = grid.map(function (r) { return r.join(''); });
    }
    if (!rows) rows = ['.......', '.R.....', '.......', '.....F.', '.......'];
    return {
      id: 'free', lesson: null, title: 'Zona libre', concept: 'Explorar',
      goal: 'Programa a Chispa como quieras. Cuando llegue a la bandera puedes probar otro mapa.',
      learn: 'Aquí no hay respuesta correcta: experimenta y observa.',
      tip: 'Puedes usar todos los bloques, incluso dentro de otros bloques.',
      grid: rows, startDir: 'east',
      palette: ['move', 'left', 'right', 'repeat', 'ifwall'],
      maxBlocks: 80, solution: null,
      hints: ['Prueba un bucle para no repetir tantos bloques.', 'El bloque Si hay pared te deja esquivar muros.'],
      praise: 'Llegaste con tus propias órdenes.'
    };
  }

  function reachable(grid, sx, sy, tx, ty) {
    var hgt = grid.length, w = grid[0].length;
    var seen = {}, q = [[sx, sy]];
    seen[sx + ',' + sy] = 1;
    while (q.length) {
      var c = q.shift();
      if (c[0] === tx && c[1] === ty) return true;
      var ds = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < ds.length; i++) {
        var nx = c[0] + ds[i][0], ny = c[1] + ds[i][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= hgt) continue;
        if (grid[ny][nx] === '#') continue;
        if (seen[nx + ',' + ny]) continue;
        seen[nx + ',' + ny] = 1;
        q.push([nx, ny]);
      }
    }
    return false;
  }

  function renderMission() {
    var host = $('#mission-root');
    clear(host);
    var m = S.mission;

    var lesson = m.lesson ? findLesson(m.lesson) : null;
    var retoIdx = lesson ? lesson.retos.indexOf(m.id) : -1;

    var eyebrow = S.free ? 'Juego libre'
      : lesson ? ('Lección ' + lesson.num + ' · Reto ' + (retoIdx + 1) + ' de ' + lesson.retos.length)
        : m.concept;

    var tools = h('div', { class: 'topbar__tools' }, [
      iconBtn('</>', 'Ver el programa escrito en código', openCode),
      iconBtn('🔊', 'Escuchar la misión', function () { speak(m.goal + ' ' + (m.tip || '')); }),
      iconBtn('?', 'Cómo se juega', openHowTo)
    ]);
    if (S.free) tools.insertBefore(iconBtn('🔀', 'Otro mapa', function () { openFreePlay(); }), tools.firstChild);

    var topbar = h('div', { class: 'topbar' }, [
      backBtn(function () {
        clearTimeout(S.timer);
        if (S.free) { showView('home'); renderHome(); }
        else if (lesson) openLesson(lesson.id, 2);
        else { showView('home'); renderHome(); }
      }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, eyebrow),
        h('h1', { class: 'topbar__title' }, m.title)
      ]),
      tools
    ]);

    var isSpaceMission = !!(m.spaceMission || m.lesson === 'l8');
    var isPureTyping = !!m.pureTyping || m.lesson === 'l7' || isSpaceMission;
    var isTextMode = isPureTyping || (m.lesson === 'l6' || store.settings.codeMode === 'text');

    /* Barra de Vidas para la misión espacial (8 vidas) */
    var spaceLivesWidget = null;
    if (isSpaceMission) {
      var livesIcons = [];
      for (var li = 0; li < 8; li++) {
        livesIcons.push(h('span', {
          class: 'heart-icon' + (li < store.spaceLives ? '' : ' is-lost')
        }, li < store.spaceLives ? '❤️' : '🖤'));
      }
      spaceLivesWidget = h('div', { class: 'lives-bar', id: 'space-lives-bar', title: 'Energía de escudos: ' + store.spaceLives + ' de 8 vidas' }, [
        h('span', { class: 'lives-label' }, 'VIDAS:'),
        h('span', { id: 'hearts-list' }, livesIcons)
      ]);
    }

    var goalRow = h('div', { class: 'goal__row' }, [
      h('button', { class: 'chip chip--hint', id: 'hint-btn', type: 'button' }, '💡 Pista')
    ]);
    if (isSpaceMission) {
      goalRow.appendChild(h('span', { class: 'stage-badge' }, 'STAGE ' + (m.stageNum || 1) + '/5'));
      if (spaceLivesWidget) goalRow.appendChild(spaceLivesWidget);
    } else if (!S.free && S.level.par) {
      goalRow.appendChild(h('div', { class: 'goal__meta' }, [
        h('span', { html: SVG.star('#FFC94D') }),
        h('span', {}, 'meta ' + S.level.par + ' bloques')
      ]));
    }

    /* Target Panel para misión espacial con dibujo de la nave averiada */
    var targetPanel = null;
    if (isSpaceMission) {
      targetPanel = h('div', { class: 'stage-target-panel' }, [
        h('div', { class: 'stage-target-icon', html: SVG.spaceship }),
        h('div', { class: 'stage-target-info' }, [
          h('span', { class: 'stage-target-title' }, '🛰️ Objetivo de la Etapa ' + (m.stageNum || 1) + ' (Hasta dónde llegar):'),
          h('span', { class: 'stage-target-text' }, m.targetDesc || 'Rescatar la Nave Nodriza averiada sorteando los peligros espaciales.')
        ])
      ]);
    }

    var goal = h('div', { class: 'goal' }, [
      h('p', { class: 'goal__text' }, m.goal),
      goalRow,
      targetPanel,
      h('p', { class: 'hint-box', id: 'hint-box', hidden: 'hidden' })
    ]);

    var primmRow = h('div', { class: 'primm-actions' }, [
      h('button', { class: 'chip chip--mini', type: 'button' }, '1 · Investiga'),
      h('button', { class: 'chip chip--mini', type: 'button' }, '2 · Modifica'),
      h('button', { class: 'chip chip--mini', type: 'button' }, '3 · Crea')
    ]);
    primmRow.children[0].addEventListener('click', function () { primmAction('investiga'); });
    primmRow.children[1].addEventListener('click', function () { primmAction('modifica'); });
    primmRow.children[2].addEventListener('click', function () { primmAction('crea'); });

    var board = h('div', { class: 'board', id: 'board' });
    var feedback = h('div', { class: 'feedback', id: 'feedback', role: 'status', 'aria-live': 'polite' });

    var stage = h('section', { class: 'stage' }, [
      attentionWidget(m, lesson, retoIdx),
      goal,
      primmRow,
      h('div', { class: 'board-wrap' }, [board]),
      feedback
    ]);

    var stepToggle = h('button', {
      class: 'chip chip--mini' + (S.stepMode ? ' is-on' : ''),
      id: 'step-toggle', type: 'button',
      'aria-pressed': S.stepMode ? 'true' : 'false'
    }, '🐢 Paso a paso');

    var modeBtn = h('button', {
      class: 'chip chip--mini is-on',
      id: 'mode-switch-btn',
      type: 'button',
      style: 'margin-left:auto;font-weight:bold' + (isPureTyping ? ';display:none' : '')
    }, isTextMode ? '⌨️ Digitar Código (Python)' : '🧩 Modo Bloques');

    var coderHead = h('div', { class: 'coder__head' }, [
      h('span', {}, isSpaceMission ? '🚀 Terminal de Vuelo Espacial' : (isPureTyping ? 'Terminal de Código Puro' : (isTextMode ? 'Terminal Python' : 'Mi programa'))),
      h('span', { class: 'counter', id: 'counter' }, '0 líneas'),
      stepToggle,
      modeBtn
    ]);

    var runBtn = h('button', { class: 'btn btn--primary btn--run', id: 'run-btn', type: 'button' }, [
      h('span', { 'aria-hidden': 'true' }, '▶'), 'Ejecutar'
    ]);

    /* Editor de texto para digitar sentencias */
    var codeHelperButtons = h('div', {
      class: 'code-quick-helpers',
      style: (isPureTyping ? 'display:none;' : 'display:flex;') + 'gap:6px;flex-wrap:wrap;margin-bottom:8px'
    }, [
      h('button', { class: 'chip chip--mini', type: 'button', onclick: function () { insertCodeSnippet('chispa.avanzar()\n'); } }, '+ avanzar()'),
      h('button', { class: 'chip chip--mini', type: 'button', onclick: function () { insertCodeSnippet('chispa.girar_derecha()\n'); } }, '+ girar_derecha()'),
      h('button', { class: 'chip chip--mini', type: 'button', onclick: function () { insertCodeSnippet('chispa.girar_izquierda()\n'); } }, '+ girar_izquierda()'),
      h('button', { class: 'chip chip--mini', type: 'button', onclick: function () { insertCodeSnippet('for i in range(3):\n    chispa.avanzar()\n'); } }, '+ bucle for'),
      h('button', { class: 'chip chip--mini', type: 'button', onclick: function () { insertCodeSnippet('if chispa.hay_pared():\n    chispa.girar_derecha()\n'); } }, '+ condicional if')
    ]);

    var pyTextEditor = h('div', {
      class: 'py-full-editor', id: 'py-full-editor',
      style: (isTextMode ? 'display:flex;' : 'display:none;') + 'flex-direction:column;flex:1;background:#26232E;border-radius:var(--r-md);padding:14px;box-shadow:inset 0 2px 6px rgba(0,0,0,.4)'
    }, [
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px' }, [
        h('span', { style: 'font-weight:bold;color:#3FC1A0;font-size:.9rem' }, isPureTyping ? '⌨️ Digita cada orden directamente con el teclado:' : '💻 Escribe tus órdenes en Python:'),
        h('span', { style: 'font-size:.74rem;color:#FFC94D' }, isPureTyping ? '⚡ Sin bloques ni botones de ayuda' : '1 orden por renglón')
      ]),
      codeHelperButtons,
      h('textarea', {
        id: 'code-editor-area',
        spellcheck: false,
        style: 'flex:1;min-height:220px;background:#1A1820;color:#8BF0D2;border:2px solid #3FC1A0;border-radius:10px;padding:12px;font-family:Consolas, Monaco, monospace;font-size:.95rem;line-height:1.5;resize:vertical',
        placeholder: isPureTyping
          ? '# MODO CÓDIGO PURO: Digita aquí sin atajos\nchispa.avanzar()\nchispa.girar_derecha()'
          : '# Digita aquí las órdenes para Chispa:\nchispa.avanzar()\nchispa.avanzar()\nchispa.girar_derecha()'
      }),
      h('div', {
        id: 'code-editor-status',
        style: 'color:#FF6B4A;font-size:.8rem;margin-top:8px;font-weight:bold;display:none;background:#3A1B1F;padding:8px 10px;border-radius:8px'
      })
    ]);

    var blocksWrapper = h('div', {
      id: 'blocks-wrapper',
      style: isTextMode ? 'display:none;' : 'display:flex;flex-direction:column;flex:1;'
    }, [
      h('div', { class: 'palette', id: 'palette' }),
      h('div', { class: 'prog-scroll' }, [h('div', { class: 'prog', id: 'prog' })])
    ]);

    var coder = h('aside', { class: 'coder' }, [
      coderHead,
      pyTextEditor,
      blocksWrapper,
      h('div', { class: 'coder__actions' }, [
        runBtn,
        h('button', { class: 'icon-btn icon-btn--wide', id: 'undo-btn', type: 'button', title: 'Deshacer', 'aria-label': 'Deshacer' }, '↶'),
        h('button', { class: 'icon-btn icon-btn--wide', id: 'clear-btn', type: 'button', title: 'Borrar todo', 'aria-label': 'Borrar todo' }, '🗑')
      ])
    ]);

    host.appendChild(topbar);
    host.appendChild(h('div', { class: 'mission-grid' }, [stage, coder]));

    $('#hint-btn').addEventListener('click', onHint);
    runBtn.addEventListener('click', onRunClick);
    $('#undo-btn').addEventListener('click', onUndo);
    $('#clear-btn').addEventListener('click', onClear);
    stepToggle.addEventListener('click', function () {
      S.stepMode = !S.stepMode;
      store.settings.step = S.stepMode;
      save();
      stepToggle.classList.toggle('is-on', S.stepMode);
      stepToggle.setAttribute('aria-pressed', S.stepMode ? 'true' : 'false');
      if (!S.playing && !S.stepping) {
        setFeedback('info', '🐢', S.stepMode
          ? 'Modo paso a paso: cada toque ejecuta una orden.'
          : 'Modo normal: todo el programa de una vez.');
        resetRunButton();
      }
    });

    modeBtn.addEventListener('click', function () {
      isTextMode = !isTextMode;
      store.settings.codeMode = isTextMode ? 'text' : 'blocks';
      save();
      modeBtn.textContent = isTextMode ? '⌨️ Digitar Código (Python)' : '🧩 Modo Bloques';
      var pyEd = $('#py-full-editor');
      var blkEd = $('#blocks-wrapper');
      if (pyEd) pyEd.style.display = isTextMode ? 'flex' : 'none';
      if (blkEd) blkEd.style.display = isTextMode ? 'none' : 'flex';
      var txtArea = $('#code-editor-area');
      if (txtArea && isTextMode) txtArea.value = toCode(S.program);
      Sound.tap();
      renderProgram();
    });

    var txtArea = $('#code-editor-area');
    if (txtArea) {
      txtArea.value = toCode(S.program);
      txtArea.addEventListener('input', function () {
        var parsed = parsePython(txtArea.value);
        var errBox = $('#code-editor-status');
        if (!errBox) return;
        var limit = S.mission ? (S.mission.maxBlocks || 60) : 60;
        var used = E.countBlocks(parsed.program);
        if (used > limit) {
          parsed.errors.push({ line: 1, text: 'Demasiados bloques (máximo ' + limit + ')' });
        }
        if (parsed.errors.length) {
          /* No ejecutamos el programa anterior sin avisar: bloqueamos Ejecutar. */
          S.codeError = true;
          errBox.style.display = 'block';
          errBox.textContent = '⚠️ Línea ' + parsed.errors[0].line + ': ' + parsed.errors[0].text + '. Corrígela para poder ejecutar.';
          resetRunButton();
        } else {
          S.codeError = false;
          errBox.style.display = 'none';
          pushUndo();
          S.program = parsed.program;
          renderProgram(true);
          resetRunButton();
        }
      });
    }

    function insertCodeSnippet(snippet) {
      if (!txtArea) return;
      var start = txtArea.selectionStart == null ? txtArea.value.length : txtArea.selectionStart;
      var end = txtArea.selectionEnd == null ? txtArea.value.length : txtArea.selectionEnd;
      var prev = txtArea.value;
      txtArea.value = prev.slice(0, start) + snippet + prev.slice(end);
      txtArea.focus();
      txtArea.selectionStart = txtArea.selectionEnd = start + snippet.length;
      var evt = new Event('input', { bubbles: true });
      txtArea.dispatchEvent(evt);
      Sound.place();
    }

    S.board = mountBoard(S.level, board);
    renderPalette();
    renderProgram();

    S.finished = false;
    S.stepping = false;
    resetRunButton();
    setFeedback('info', '💡', m.tip || 'Agrega bloques y toca Ejecutar.');
    if (m.guided) setFeedback('info', '🧩', 'Este programa ya está empezado. Ejecútalo y mira qué le falta.');
  }

  /* ==================================================================
     EDITOR
     ================================================================== */
  function listAt(path) {
    var list = S.program;
    for (var i = 0; i < path.length; i++) {
      var node = list[path[i]];
      if (!node || node.type !== 'repeat') return list;
      if (!node.do) node.do = [];
      list = node.do;
    }
    return list;
  }

  function blockAt(path) {
    if (!path || !path.length) return null;
    var list = S.program, node = null;
    for (var i = 0; i < path.length; i++) {
      node = list[path[i]];
      if (!node) return null;
      list = node.do || [];
    }
    return node;
  }

  function pushUndo() {
    S.undo.push(clone(S.program));
    if (S.undo.length > 24) S.undo.shift();
  }

  function insertBlock(type) {
    if (S.playing || S.stepping) return;
    if (E.countBlocks(S.program) >= (S.mission.maxBlocks || 60)) {
      toast('Ya usaste todos los bloques. Borra uno para seguir.');
      Sound.error();
      return;
    }
    pushUndo();
    var node = { id: uid(), type: type };
    if (type === 'repeat') { node.times = 2; node.do = []; }
    var list = listAt(S.focus);
    list.push(node);
    if (type === 'repeat') S.focus = S.focus.concat(list.length - 1);
    Sound.place();
    renderProgram();
  }

  function removeAt(path) {
    if (S.playing || S.stepping) return;
    pushUndo();
    var parent = listAt(path.slice(0, -1));
    parent.splice(path[path.length - 1], 1);
    S.focus = [];
    Sound.tap();
    renderProgram();
  }

  function onUndo() {
    if (S.playing || S.stepping) return;
    if (!S.undo.length) { toast('No hay nada que deshacer.'); return; }
    S.program = S.undo.pop();
    S.focus = [];
    Sound.tap();
    renderProgram();
  }

  function onClear() {
    if (S.playing || S.stepping) return;
    if (!S.program.length) return;
    pushUndo();
    S.program = [];
    S.focus = [];
    Sound.tap();
    renderProgram();
    setFeedback('info', '🧹', 'Programa borrado. Puedes empezar de nuevo.');
  }

  function renderPalette() {
    var host = $('#palette');
    if (!host) return;
    clear(host);
    var maxed = E.countBlocks(S.program) >= (S.mission.maxBlocks || 60);
    S.mission.palette.forEach(function (type) {
      var b = h('button', {
        class: 'pblock', type: 'button', dataset: { type: type },
        'aria-label': 'Agregar ' + BLOCK[type].label
      }, [h('span', { html: SVG[type] }), h('span', {}, BLOCK[type].label)]);
      if (maxed) b.disabled = true;
      b.addEventListener('click', function () { insertBlock(type); });
      host.appendChild(b);
    });
  }

  function renderProgram(skipTextSync) {
    var host = $('#prog');
    if (!host) return;
    clear(host);
    if (!S.program.length) {
      host.appendChild(h('div', { class: 'prog__empty' }, 'Tu programa está vacío. Toca un bloque de arriba para empezar.'));
    } else {
      S.program.forEach(function (b, i) { host.appendChild(renderItem(b, [i])); });
    }
    var total = E.countBlocks(S.program);
    var counter = $('#counter');
    if (counter) {
      counter.textContent = total + (total === 1 ? ' bloque' : ' bloques');
      counter.classList.toggle('is-over', total >= (S.mission.maxBlocks || 60));
    }
    renderPalette();

    /* Sincronizar el editor de texto de Python */
    if (!skipTextSync) {
      var pyInput = $('#code-editor-area');
      if (pyInput) pyInput.value = toCode(S.program);
    }
  }

  function renderItem(block, path) {
    var key = path.join('.');

    if (block.type === 'repeat' || (block.type === 'ifwall' && block.do && block.do.length)) {
      var isIf = block.type === 'ifwall';
      var focused = S.focus.join('.') === key;
      var headParts = [
        h('span', { html: isIf ? SVG.ifwall : SVG.repeat }),
        h('span', {}, isIf ? 'Si hay pared' : 'Repetir')
      ];
      if (!isIf) {
        headParts.push(h('div', { class: 'stepper' }, [
          stepBtn('−', block.times <= 1, function (e) {
            e.stopPropagation();
            pushUndo();
            block.times = Math.max(1, block.times - 1);
            renderProgram();
          }),
          h('span', {}, String(block.times)),
          stepBtn('+', block.times >= 10, function (e) {
            e.stopPropagation();
            pushUndo();
            block.times = Math.min(10, block.times + 1);
            renderProgram();
          })
        ]));
      }
      headParts.push(delBtn(function (e) { e.stopPropagation(); removeAt(path); }));

      var head = h('div', { class: 'repeat__head' }, headParts);

      var body = h('div', { class: 'repeat__body' });
      if (block.do && block.do.length) {
        block.do.forEach(function (child, i) { body.appendChild(renderItem(child, path.concat(i))); });
      }
      if (focused) body.appendChild(h('div', { class: 'slot' }, '＋ aquí adentro'));
      else if (!block.do || !block.do.length) body.appendChild(h('div', { class: 'slot' }, 'vacío'));

      var foot = focused ? h('div', { class: 'repeat__foot' }, [
        h('button', {
          class: 'btn btn--soft', type: 'button',
          onclick: function () { S.focus = path.slice(0, -1); Sound.tap(); renderProgram(); }
        }, isIf ? '✓ Listo, salir del condicional' : '✓ Listo, salir del bucle')
      ]) : null;

      var rep = h('div', {
        class: 'repeat' + (isIf ? ' repeat--if' : '') + (focused ? ' is-target' : ''),
        dataset: { path: key }
      }, [head, body, foot]);

      head.addEventListener('click', function () {
        if (S.playing || S.stepping) return;
        S.focus = focused ? path.slice(0, -1) : path.slice();
        Sound.tap();
        renderProgram();
      });

      return h('div', { class: 'prog-item' }, [rep]);
    }

    return h('div', { class: 'prog-item' }, [
      h('div', { class: 'block', dataset: { path: key, type: block.type } }, [
        h('span', { html: SVG[block.type] }),
        h('b', {}, BLOCK[block.type].label),
        delBtn(function (e) { e.stopPropagation(); removeAt(path); })
      ])
    ]);
  }

  function stepBtn(label, disabled, onClick) {
    var b = h('button', { type: 'button', 'aria-label': label === '+' ? 'Uno más' : 'Uno menos' }, label);
    b.disabled = !!disabled;
    b.addEventListener('click', onClick);
    return b;
  }

  function delBtn(onClick) {
    var b = h('button', { class: 'block__del', type: 'button', 'aria-label': 'Quitar este bloque', title: 'Quitar' }, '✕');
    b.addEventListener('click', onClick);
    return b;
  }

  /* ==================================================================
     RETROALIMENTACIÓN Y EJECUCIÓN
     ================================================================== */
  function setFeedback(kind, icon, text) {
    var host = $('#feedback');
    if (!host) return;
    clear(host);
    host.className = 'feedback' + (kind ? ' is-' + kind : '');
    host.appendChild(h('div', { class: 'fb' }, [
      h('span', { class: 'fb__icon', 'aria-hidden': 'true' }, icon),
      h('span', {}, text)
    ]));
  }

  function resetRunButton() {
    var b = $('#run-btn');
    if (!b) return;
    b.classList.remove('is-stop');
    clear(b);
    b.appendChild(h('span', { 'aria-hidden': 'true' }, S.stepMode ? '›' : '▶'));
    b.appendChild(document.createTextNode(S.stepMode ? 'Siguiente paso' : 'Ejecutar'));
  }

  function onRunClick() {
    if (S.playing) { stopPlayback(); return; }
    if (S.stepping) { advanceStep(); return; }
    if (!S.program.length) {
      Sound.error();
      setFeedback('info', '✋', 'Primero agrega bloques con los botones de arriba.');
      return;
    }
    if (S.codeError) {
      Sound.error();
      setFeedback('info', '⚠️', 'Corrige la línea marcada en rojo antes de ejecutar.');
      return;
    }
    if (!S.predictionDone && !S.free) { openPrediction(); return; }
    startRun();
  }

  function startRun() {
    S.result = E.run(S.level, S.program, { maxSteps: 400 });
    S.frames = S.result.frames;
    S.idx = 0;
    S.finished = false;
    S.attempts += 1;

    if (S.result.result === 'error') {
      Sound.error();
      setFeedback('info', '🧐', S.result.reason === 'empty'
        ? 'El programa está vacío.'
        : 'El programa es demasiado largo. Prueba con un bucle.');
      return;
    }

    S.board = mountBoard(S.level, $('#board'));
    applyFrame(S.board, S.frames[0], null, { highlight: true });

    if (S.stepMode) {
      S.stepping = true;
      var b = $('#run-btn');
      if (b) { clear(b); b.appendChild(h('span', { 'aria-hidden': 'true' }, '›')); b.appendChild(document.createTextNode('Siguiente paso')); }
      setFeedback('info', '🐢', 'Paso 1 de ' + (S.frames.length - 1) + '. Toca Siguiente para dar la primera orden.');
    } else {
      play();
    }

    if (S.attempts >= 2) {
      var hintBtn = $('#hint-btn');
      if (hintBtn) hintBtn.classList.add('attention');
    }
  }

  function play() {
    S.playing = true;
    var b = $('#run-btn');
    if (b) {
      b.classList.add('is-stop');
      clear(b);
      b.appendChild(h('span', { 'aria-hidden': 'true' }, '⏹'));
      b.appendChild(document.createTextNode('Detener'));
    }
    tick();
  }

  function tick() {
    var f = S.frames[S.idx];
    if (!f) { finish(); return; }
    var delay = f.effect === 'turn' ? 230 : f.effect === 'think' ? 250 : f.effect === 'bump' ? 540 : 320;
    S.timer = setTimeout(function () {
      if (!S.playing) return;
      S.idx += 1;
      if (S.idx >= S.frames.length) { finish(); return; }
      applyFrame(S.board, S.frames[S.idx], S.frames[S.idx - 1], { highlight: true });
      tick();
    }, delay);
  }

  function advanceStep() {
    if (!S.stepping) return;
    S.idx += 1;
    if (S.idx >= S.frames.length) { finish(); return; }
    var f = S.frames[S.idx];
    applyFrame(S.board, f, S.frames[S.idx - 1], { highlight: true });
    var b = blockAt(f.path);
    setFeedback('info', '🐢', 'Paso ' + S.idx + ': ' + (b && BLOCK[b.type] ? BLOCK[b.type].plural : 'una orden') + '.');
  }

  function stopPlayback() {
    S.playing = false;
    clearTimeout(S.timer);
    S.timer = null;
    resetRunButton();
    setFeedback('info', '⏸', 'Detuviste el programa. Mira dónde quedó Chispa y ajusta.');
  }

  function finish() {
    if (S.finished) return;
    S.finished = true;
    S.playing = false;
    S.stepping = false;
    clearTimeout(S.timer);
    S.timer = null;
    resetRunButton();

    var r = S.result;
    if (!r) return;

    if (r.result === 'win') {
      Sound.win();
      var stars = S.free ? 0 : E.starsFor(S.level, r.stats.blocks);
      if (!S.free) {
        var prev = store.stars[S.mission.id] || 0;
        store.stars[S.mission.id] = Math.max(prev, stars);
        store.breaks += 1;
        save();
      }
      if (!S.free) confetti();
      openResult(stars);
      return;
    }

    if (r.result === 'bump') {
      setFeedback('error', '💥', 'Chispa chocó con una pared. Mira el bloque marcado y prueba otra vez.');
    } else if (r.remaining > 0 && r.onFlag) {
      setFeedback('info', '⭐', 'Llegaste a la bandera, pero faltan ' + r.remaining + ' estrella' + (r.remaining === 1 ? '' : 's') + '.');
    } else if (r.remaining > 0) {
      setFeedback('info', '🤔', 'Chispa se detuvo antes de la bandera y faltan estrellas. Revisa el orden.');
    } else {
      setFeedback('info', '🤔', 'Recogiste todo, pero Chispa no llegó a la bandera. ¿Qué orden falta al final?');
    }

    /* En Misión Espacial (Lección 8), restar una vida al fallar */
    if (S.mission && (S.mission.spaceMission || S.mission.lesson === 'l8')) {
      store.spaceLives = Math.max(0, (store.spaceLives !== undefined ? store.spaceLives : 8) - 1);
      save();
      updateSpaceLivesUI();
      if (store.spaceLives <= 0) {
        openGameOverModal();
        return;
      }
    }

    if (S.attempts >= 4) {
      var hintBox = $('#hint-box');
      if (hintBox && hintBox.hidden) {
        hintBox.hidden = false;
        var hints = S.mission.hints || [];
        hintBox.textContent = hints[Math.min(S.hintsRevealed, hints.length - 1)] || 'Prueba con el modo paso a paso.';
      }
    }
  }

  function updateSpaceLivesUI() {
    var bar = $('#space-lives-bar');
    if (!bar) return;
    var list = $('#hearts-list');
    if (!list) return;
    clear(list);
    var lives = store.spaceLives !== undefined ? store.spaceLives : 8;
    for (var i = 0; i < 8; i++) {
      list.appendChild(h('span', {
        class: 'heart-icon' + (i < lives ? '' : ' is-lost')
      }, i < lives ? '❤️' : '🖤'));
    }
    bar.title = 'Energía de escudos: ' + lives + ' de 8 vidas';
  }

  function openGameOverModal() {
    Sound.error();
    var modal = h('div', { class: 'modal', style: 'border:2px solid #FF6B4A' }, [
      h('div', { style: 'font-size:2.8rem;margin-bottom:6px' }, '💥🛸'),
      h('h2', { style: 'color:#FF6B4A' }, '¡Te has quedado sin vidas!'),
      h('p', { class: 'lead' }, 'Los escudos espaciales de Chispa se agotaron al perder las 8 vidas. La nave nodriza no pudo ser rescatada en este intento.'),
      h('p', {}, '¡Pero un buen astronauta nunca se rinde! Puedes recargar las 8 vidas de escudo de inmediato y volver a intentarlo.'),
      h('div', { class: 'modal__actions' }, [
        h('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () {
            store.spaceLives = 8;
            save();
            closeOverlay();
            openMission(S.mission.id);
          }
        }, '⚡ Recargar 8 vidas y reintentar'),
        h('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: function () {
            store.spaceLives = 8;
            save();
            closeOverlay();
            if (S.mission && S.mission.lesson) openLesson(S.mission.lesson, 2);
            else { showView('home'); renderHome(); }
          }
        }, 'Volver a la base')
      ])
    ]);
    overlay(modal);
  }

  /* ==================================================================
     MODALES
     ================================================================== */
  function overlay(node) {
    closeOverlay();
    var root = $('#overlay-root');
    var ov = h('div', { class: 'overlay' }, [node]);
    root.appendChild(ov);
    document.body.style.overflow = 'hidden';
    var first = node.querySelector('button');
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { } }, 60);
    S.escHandler = function (e) { if (e.key === 'Escape') closeOverlay(); };
    document.addEventListener('keydown', S.escHandler);
    return ov;
  }

  function closeOverlay() {
    var root = $('#overlay-root');
    if (root) clear(root);
    document.body.style.overflow = '';
    if (S.escHandler) {
      document.removeEventListener('keydown', S.escHandler);
      S.escHandler = null;
    }
  }

  function openPrediction() {
    var opts = [
      { k: 0, icon: '🏁', label: 'Llega a la bandera' },
      { k: 1, icon: '💥', label: 'Choca con algo' },
      { k: 2, icon: '🤔', label: 'Se queda a mitad de camino' }
    ];
    var list = h('div', { class: 'predict-list' });
    opts.forEach(function (o) {
      var b = h('button', { class: 'predict-btn', type: 'button' }, [
        h('span', { class: 'predict-btn__ico', 'aria-hidden': 'true' }, o.icon),
        h('span', {}, o.label)
      ]);
      b.addEventListener('click', function () {
        S.prediction = o.k;
        S.predictionDone = true;
        closeOverlay();
        startRun();
      });
      list.appendChild(b);
    });
    var skip = h('button', { class: 'btn btn--ghost', type: 'button' }, 'Sólo quiero ejecutar');
    skip.addEventListener('click', function () {
      S.prediction = null;
      S.predictionDone = true;
      closeOverlay();
      startRun();
    });

    overlay(h('div', { class: 'modal' }, [
      h('p', { class: 'eyebrow' }, 'Antes de ejecutar'),
      h('h2', {}, '¿Qué crees que va a pasar?'),
      h('p', { class: 'lead' }, 'Mira tu programa y adivina. Equivocarse también enseña.'),
      list,
      skip
    ]));
  }

  function predictionNote(r) {
    if (S.prediction === null || S.prediction === undefined) return '';
    var actual = r.result === 'win' ? 0 : (r.result === 'bump' ? 1 : 2);
    return S.prediction === actual
      ? '¡Predijiste bien! '
      : 'No pasó lo que pensabas, y eso también enseña. ';
  }

  function toCode(program, indent, out) {
    indent = indent || 0;
    out = out || '';
    var pad = '    '.repeat(indent);
    (program || []).forEach(function (b) {
      if (b.type === 'repeat') {
        out += pad + 'for i in range(' + (b.times || 1) + '):\n';
        var inner = toCode(b.do || [], indent + 1, '');
        out += inner || (pad + '    pass\n');
      } else if (b.type === 'ifwall') {
        out += pad + 'if chispa.hay_pared():\n';
        if (b.do && b.do.length) {
          out += toCode(b.do, indent + 1, '');
        } else {
          out += pad + '    chispa.girar_derecha()\n';
        }
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

  function parsePython(text) {
    var lines = text.split('\n');
    var errors = [];
    function parseBlock(startIdx, minIndent) {
      var list = [];
      var i = startIdx;
      while (i < lines.length) {
        var raw = lines[i];
        var trimmed = raw.trim();
        if (!trimmed || trimmed.indexOf('#') === 0 || trimmed.indexOf('//') === 0) {
          i++;
          continue;
        }
        var indent = raw.search(/\S/);
        if (indent < minIndent) break;
        var clean = trimmed.toLowerCase();
        if (clean === 'chispa.avanzar()' || clean === 'avanzar()' || clean === 'avanzar') {
          list.push({ id: uid(), type: 'move' });
          i++;
        } else if (clean === 'chispa.girar_izquierda()' || clean === 'girar_izquierda()' || clean === 'izquierda()') {
          list.push({ id: uid(), type: 'left' });
          i++;
        } else if (clean === 'chispa.girar_derecha()' || clean === 'girar_derecha()' || clean === 'derecha()') {
          list.push({ id: uid(), type: 'right' });
          i++;
        } else if (clean === 'if chispa.hay_pared():' || clean === 'if chispa.hay_pared()' || clean === 'si_hay_pared()' || clean === 'si hay pared:') {
          /* El cuerpo indentado pertenece al if. Si es sólo girar a la derecha,
             se mantiene como ifwall simple (el motor ya gira por él). */
          var ifRes = parseBlock(i + 1, indent + 1);
          if (ifRes.list.length === 1 && ifRes.list[0].type === 'right') {
            list.push({ id: uid(), type: 'ifwall' });
          } else {
            list.push({ id: uid(), type: 'ifwall', do: ifRes.list });
          }
          i = ifRes.nextIdx;
        } else {
          var loopMatch = clean.match(/^for\s+.*\s+in\s+range\((\d+)\)\s*:?$/) ||
                          clean.match(/^repetir\s+(\d+)\s*(?:veces)?\s*:?$/);
          if (loopMatch) {
            var times = Math.max(1, Math.min(20, parseInt(loopMatch[1], 10) || 1));
            var innerRes = parseBlock(i + 1, indent + 1);
            list.push({ id: uid(), type: 'repeat', times: times, do: innerRes.list });
            i = innerRes.nextIdx;
          } else {
            errors.push({ line: i + 1, text: trimmed });
            i++;
          }
        }
      }
      return { list: list, nextIdx: i };
    }
    var res = parseBlock(0, 0);
    return { program: res.list, errors: errors };
  }

  function codePanel(code, title) {
    return h('div', { class: 'code-wrap' }, [
      h('div', { class: 'code-head' }, h('span', {}, title || 'Tu programa en código')),
      h('pre', { class: 'code' }, h('code', {}, code || '—'))
    ]);
  }

  function openResult(stars) {
    var m = S.mission;
    var r = S.result;
    var isFree = S.free;

    var starsBox = h('div', { class: 'stars-big' });
    for (var i = 0; i < 3; i++) {
      var s = h('span', { class: 'star-slot', html: SVG.star(i < stars ? '#FFC94D' : '#EFE4CE') });
      if (i < stars) { s.classList.add('is-pop'); s.style.animationDelay = (i * 0.12) + 's'; }
      starsBox.appendChild(s);
    }

    var title = isFree ? '¡Llegaste a la bandera!'
      : (stars === 3 ? '¡Programa perfecto!' : '¡Lo lograste!');

    var body = h('div', { class: 'modal__body' }, [
      h('p', { class: 'learn' }, [
        h('span', { class: 'learn__tag' }, 'Lo que aprendiste'),
        h('span', {}, m.learn || '')
      ])
    ]);

    if (!isFree) {
      body.appendChild(h('div', { class: 'result-stats' }, [
        h('div', {}, [h('b', {}, String(r.stats.blocks)), h('span', {}, 'bloques')]),
        h('div', {}, [h('b', {}, String(r.stats.steps)), h('span', {}, 'órdenes')]),
        h('div', {}, [h('b', {}, String(S.level.par || '—')), h('span', {}, 'meta')])
      ]));
    }

    body.appendChild(codePanel(toCode(S.program), 'Tu programa escrito en código'));

    if (!isFree && r.stats.blocks > S.level.par) {
      body.appendChild(h('p', { class: 'tip-line' }, [
        h('span', { class: 'ico' }, '🌟'),
        h('span', {}, 'Con ' + S.level.par + ' bloques alcanzaba. ¿Pruebas el programa más corto?')
      ]));
    }

    var actions = h('div', { class: 'modal__actions' });

    if (isFree) {
      actions.appendChild(h('button', {
        class: 'btn btn--primary', type: 'button',
        onclick: function () { closeOverlay(); openFreePlay(); }
      }, '🔀 Otro mapa'));
      actions.appendChild(h('button', {
        class: 'btn btn--soft', type: 'button',
        onclick: function () { closeOverlay(); }
      }, 'Seguir en este mapa'));
      actions.appendChild(h('button', {
        class: 'btn btn--ghost', type: 'button',
        onclick: function () { closeOverlay(); showView('home'); renderHome(); }
      }, 'Volver al inicio'));
    } else {
      var nid = nextRetoOf(m.id);
      var primaryLabel = nid ? 'Siguiente reto ›' : 'Volver a la lección';
      actions.appendChild(h('button', {
        class: 'btn btn--primary', type: 'button',
        onclick: function () {
          closeOverlay();
          if (nid) openMission(nid);
          else if (m.lesson) openLesson(m.lesson, 2);
          else { showView('home'); renderHome(); }
        }
      }, primaryLabel));

      actions.appendChild(h('button', {
        class: 'btn btn--soft', type: 'button',
        onclick: function () {
          closeOverlay();
          S.attempts = 0;
          S.predictionDone = true;
          S.board = mountBoard(S.level, $('#board'));
          resetRunButton();
          setFeedback('info', '🔁', 'Tu programa sigue ahí. Cámbialo y vuelve a ejecutar.');
        }
      }, '↺ Repetir para mejorar'));

      actions.appendChild(h('button', {
        class: 'btn btn--ghost', type: 'button',
        onclick: function () {
          closeOverlay();
          if (m.lesson) openLesson(m.lesson, 2);
          else { showView('home'); renderHome(); }
        }
      }, 'Volver a la lección'));
    }

    var modal = h('div', { class: 'modal' }, [
      starsBox,
      h('h2', {}, title),
      h('p', { class: 'lead' }, predictionNote(r) + (m.praise || '')),
      body,
      actions
    ]);

    if (!isFree && store.breaks % 3 === 0) {
      modal.appendChild(h('div', { class: 'break-card' }, [
        h('h3', {}, '🌿 Pausa de movimiento'),
        h('p', {}, 'Levanta los brazos, sacude las manos 10 veces y respira hondo. Después seguimos.'),
        h('button', {
          class: 'btn btn--soft', type: 'button',
          onclick: function (e) { var c = e.currentTarget.closest('.break-card'); if (c) c.remove(); Sound.tap(); }
        }, 'Ya lo hice')
      ]));
    }

    overlay(modal);
  }

  function openCode() {
    overlay(h('div', { class: 'modal modal--wide' }, [
      h('p', { class: 'eyebrow' }, 'Bloques y código'),
      h('h2', {}, 'Tu programa escrito en código'),
      h('p', { class: 'lead' }, 'Cada bloque es una línea. El orden es el mismo que en tu programa.'),
      codePanel(toCode(S.program), 'Ahora mismo'),
      h('p', { class: 'tip-line' }, [
        h('span', { class: 'ico' }, '💡'),
        h('span', {}, 'Un bucle se escribe "repetir N veces"; una regla se escribe "si…". Todos los lenguajes usan estas dos ideas.')
      ]),
      h('div', { class: 'modal__actions' }, [
        h('button', { class: 'btn btn--primary', type: 'button', onclick: closeOverlay }, 'Entendido')
      ])
    ]));
  }

  function openHowTo() {
    var steps = [
      ['1', 'Lee', 'Una idea corta por lección. Con eso basta para empezar.'],
      ['2', 'Mira', 'Un ejemplo ya resuelto: ejecútalo y observa qué hace cada bloque.'],
      ['3', 'Ejecuta', 'En los retos, arma tu programa y toca Ejecutar. Chispa hace exactamente lo que escribiste.'],
      ['4', 'Ajusta', 'Si algo falla, cambia UNA cosa y prueba otra vez. Así se programa.']
    ];
    var list = h('div', { class: 'how-to' });
    steps.forEach(function (s) {
      list.appendChild(h('div', { class: 'how-to__step' }, [
        h('span', { class: 'how-to__n' }, s[0]),
        h('div', {}, [h('b', {}, s[1]), h('span', {}, s[2])])
      ]));
    });

    overlay(h('div', { class: 'modal modal--wide' }, [
      h('p', { class: 'eyebrow' }, 'Cómo se juega'),
      h('h2', {}, 'Siempre son los mismos 4 pasos'),
      h('p', { class: 'lead' }, 'Ese es el método: leer, mirar, ejecutar y ajustar. Sirve para este juego y para cualquier programa.'),
      list,
      h('div', { class: 'modal__actions' }, [
        h('button', { class: 'btn btn--primary', type: 'button', onclick: closeOverlay }, '¡A programar!')
      ])
    ]));
  }

  function onHint() {
    if (!S.mission) return;
    var hints = S.mission.hints || [];
    var box = $('#hint-box');
    var b = $('#hint-btn');
    if (b) b.classList.remove('attention');
    if (!hints.length || !box) return;
    var idx = Math.min(S.hintsRevealed, hints.length - 1);
    box.hidden = false;
    box.textContent = hints[idx];
    S.hintsRevealed = Math.min(S.hintsRevealed + 1, hints.length);
    Sound.tap();
  }

  /* ==================================================================
     CONFETI
     ================================================================== */
  function confetti() {
    if (store.settings.calm) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var colors = ['#FF6B4A', '#FFC94D', '#3FC1A0', '#5AA9E6', '#9B8CF0'];
    for (var i = 0; i < 22; i++) {
      var p = document.createElement('div');
      p.className = 'confetti';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.5 + Math.random() * 1.3) + 's';
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      p.style.transform = 'rotate(' + Math.random() * 180 + 'deg)';
      document.body.appendChild(p);
      (function (el) {
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3300);
      })(p);
    }
  }

  /* ==================================================================
     PROGRESO
     ================================================================== */
  function renderProgress() {
    var host = $('#progress-root');
    clear(host);

    var total = totalStars();
    var done = completedCount();

    host.appendChild(h('div', { class: 'topbar' }, [
      backBtn(function () { showView('home'); renderHome(); }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, 'Mi progreso'),
        h('h1', { class: 'topbar__title' }, store.name || 'Mi recorrido')
      ]),
      h('div', { class: 'topbar__tools' }, [iconBtn('?', 'Cómo se juega', openHowTo)])
    ]));

    host.appendChild(h('div', { class: 'progress-card' }, [
      h('h2', {}, done === MISSIONS.length ? '¡Terminaste la ruta completa!' : 'Vas bien'),
      h('p', {}, 'Completaste ' + done + ' de ' + MISSIONS.length + ' retos. Cada lección deja una idea que puedes explicar.'),
      h('div', { class: 'stat-row' }, [
        h('div', { class: 'stat' }, [h('b', {}, String(total)), h('span', {}, 'estrellas de ' + (MISSIONS.length * 3))]),
        h('div', { class: 'stat' }, [h('b', {}, String(done)), h('span', {}, 'retos resueltos')]),
        h('div', { class: 'stat' }, [h('b', {}, String(store.breaks)), h('span', {}, 'programas ejecutados')])
      ])
    ]));

    LESSONS.forEach(function (l) {
      var rows = h('div', {});
      l.retos.forEach(function (id, i) {
        var m = findMission(id);
        if (!m) return;
        var st = store.stars[id] || 0;
        var row = h('div', { class: 'row-item', style: 'cursor:pointer' }, [
          h('span', { class: 'row-item__n' }, i + 1),
          h('div', { class: 'row-item__t' }, [
            h('b', {}, m.title),
            h('span', {}, m.concept + ' · ' + (st ? (st === 3 ? 'dominado' : 'logrado') : 'pendiente'))
          ]),
          starsRow(st)
        ]);
        row.addEventListener('click', function () { openMission(id); });
        rows.appendChild(row);
      });

      host.appendChild(h('div', { class: 'progress-card' }, [
        h('h2', {}, 'Lección ' + l.num + ' · ' + l.title),
        h('p', {}, 'Idea: ' + l.idea),
        rows
      ]));
    });

    host.appendChild(h('div', { class: 'progress-card' }, [
      h('h2', {}, 'Cómo quiero jugar'),
      switchRow('Sonidos', 'Tonos suaves al ejecutar y al ganar', store.settings.sound, function (v) {
        store.settings.sound = v; Sound.setOn(v); save();
      }),
      switchRow('Modo calma', 'Menos movimiento, sin confeti y colores más suaves', store.settings.calm, function (v) {
        store.settings.calm = v; applyCalm(); save();
      }),
      switchRow('Paso a paso', 'Ejecutar una orden a la vez', store.settings.step, function (v) {
        store.settings.step = v; S.stepMode = v; save();
      })
    ]));

    host.appendChild(h('div', { class: 'progress-card' }, [
      h('h2', {}, 'Empezar de nuevo'),
      h('p', {}, 'Borra las estrellas y el nombre guardados en este dispositivo.'),
      h('div', { class: 'modal__actions', style: 'margin-top:12px' }, [
        h('button', {
          class: 'btn btn--soft', type: 'button',
          onclick: function () {
            overlay(h('div', { class: 'modal' }, [
              h('h2', {}, '¿Seguro?'),
              h('p', { class: 'lead' }, 'Se borra el progreso guardado en este dispositivo.'),
              h('div', { class: 'modal__actions', style: 'margin-top:18px' }, [
                h('button', {
                  class: 'btn btn--primary', type: 'button',
                  onclick: function () {
                    store = defaults();
                    Sound.setOn(store.settings.sound);
                    S.stepMode = false;
                    save(); applyCalm(); closeOverlay(); renderProgress();
                    toast('Progreso borrado');
                  }
                }, 'Sí, borrar'),
                h('button', { class: 'btn btn--ghost', type: 'button', onclick: closeOverlay }, 'Mejor no')
              ])
            ]));
          }
        }, 'Borrar mi progreso')
      ])
    ]));
  }

  /* ==================================================================
     REPASO & ROMPECABEZAS (QUIZ)
     ================================================================== */
  var QUIZ_QUESTIONS = [
    {
      type: 'puzzle',
      title: 'Rompecabezas: El orden de la rutina',
      desc: 'Coloca las acciones en el orden correcto en que las hace Chispa:',
      pieces: [
        { id: 'p1', text: '1. Leer la primera orden' },
        { id: 'p2', text: '2. Avanzar hacia adelante' },
        { id: 'p3', text: '3. Si hay pared, girar' },
        { id: 'p4', text: '4. Llegar a la bandera con estrellas' }
      ]
    },
    {
      type: 'multiple',
      question: '¿Qué hace Chispa cuando ejecuta un bloque de «Girar»?',
      options: [
        'Avanza un paso hacia adelante',
        'Cambia la dirección hacia donde mira, pero no se mueve de celda',
        'Recoge una estrella automáticamente'
      ],
      correct: 1,
      explain: '¡Exacto! Girar sólo cambia su orientación (norte, sur, este u oeste), no cambia su posición.'
    },
    {
      type: 'multiple',
      question: 'Si quieres que Chispa avance 6 veces seguidas, ¿qué es mejor usar?',
      options: [
        'Poner 6 bloques de Avanzar uno tras otro',
        'Un bloque de Repetir 6 veces con un Avanzar adentro',
        'Un bloque de Si hay pared'
      ],
      correct: 1,
      explain: '¡Muy bien! Un bucle te ahorra bloques: con 2 bloques haces el trabajo de 6.'
    },
    {
      type: 'multiple',
      question: '¿Para qué sirve el bloque «Si hay pared»?',
      options: [
        'Para romper las paredes y pasar a través de ellas',
        'Para mirar adelante: si hay un muro gira sola, y si el camino está libre no hace nada',
        'Para terminar el juego inmediatamente'
      ],
      correct: 1,
      explain: '¡Correcto! Es una condición: evalúa el entorno antes de decidir si debe girar.'
    },
    {
      type: 'multiple',
      question: '¿Qué es "Depurar" (debugging) en programación?',
      options: [
        'Borrar todo el programa y empezar desde cero cada vez',
        'Ejecutar, observar dónde falla y arreglar sólo lo que está mal',
        'Poner muchos bloques al azar hasta que funcione'
      ],
      correct: 1,
      explain: '¡Excelente! Los programadores leen el código, prueban y ajustan paso a paso.'
    }
  ];

  var quizState = { current: 0, score: 0, answered: {} };

  function renderQuiz() {
    var host = $('#quiz-root');
    if (!host) return;
    clear(host);

    var top = h('div', { class: 'topbar' }, [
      backBtn(function () { showView('home'); renderHome(); }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, 'Zona de Entrenamiento'),
        h('h1', { class: 'topbar__title' }, 'Repaso y Rompecabezas')
      ]),
      h('div', { class: 'topbar__tools' }, [
        iconBtn('🔄', 'Reiniciar repaso', function () {
          quizState = { current: 0, score: 0, answered: {} };
          Sound.tap();
          renderQuiz();
        })
      ])
    ]);

    var q = QUIZ_QUESTIONS[quizState.current];
    var card = h('div', { class: 'progress-card quiz-card' });

    var progressText = h('p', { class: 'kicker' }, 'Pregunta ' + (quizState.current + 1) + ' de ' + QUIZ_QUESTIONS.length);
    card.appendChild(progressText);

    if (q.type === 'puzzle') {
      card.appendChild(h('h2', { style: 'margin-bottom:8px' }, q.title));
      card.appendChild(h('p', { class: 'read' }, q.desc));

      var puzzleBox = h('div', { class: 'quiz-puzzle-box' });
      q.pieces.forEach(function (p) {
        puzzleBox.appendChild(h('div', { class: 'quiz-puzzle-item' }, [
          h('span', { class: 'quiz-puzzle-badge' }, '🧩'),
          h('b', {}, p.text)
        ]));
      });
      card.appendChild(puzzleBox);

      var checkBtn = h('button', { class: 'btn btn--primary', type: 'button', style: 'margin-top:16px' }, '¡Entendido! Siguiente →');
      checkBtn.addEventListener('click', function () {
        Sound.win();
        quizState.score += 1;
        quizState.current += 1;
        renderQuiz();
      });
      card.appendChild(checkBtn);
    } else {
      card.appendChild(h('h2', { style: 'margin-bottom:12px' }, q.question));

      var ansState = quizState.answered[quizState.current];
      var optList = h('div', { class: 'quiz-options' });

      q.options.forEach(function (opt, idx) {
        var optBtn = h('button', {
          class: 'btn btn--soft quiz-opt-btn',
          type: 'button',
          style: 'text-align:left;display:block;width:100%;margin-bottom:10px;padding:12px 16px;white-space:normal;line-height:1.4'
        }, opt);

        if (ansState !== undefined) {
          optBtn.disabled = true;
          if (idx === q.correct) {
            optBtn.style.background = '#3FC1A0';
            optBtn.style.color = '#FFFFFF';
            optBtn.style.borderColor = '#2A9E81';
          } else if (idx === ansState) {
            optBtn.style.background = '#FF6B4A';
            optBtn.style.color = '#FFFFFF';
            optBtn.style.borderColor = '#E0522F';
          }
        } else {
          optBtn.addEventListener('click', function () {
            quizState.answered[quizState.current] = idx;
            if (idx === q.correct) {
              Sound.win();
              quizState.score += 1;
            } else {
              Sound.bump();
            }
            renderQuiz();
          });
        }
        optList.appendChild(optBtn);
      });
      card.appendChild(optList);

      if (ansState !== undefined) {
        var feedback = h('div', {
          class: 'quiz-feedback',
          style: 'margin-top:16px;padding:14px;border-radius:14px;background:' + (ansState === q.correct ? '#E8F8F3' : '#FFF0ED')
        }, [
          h('b', { style: 'display:block;margin-bottom:4px;color:' + (ansState === q.correct ? '#2A9E81' : '#E0522F') },
            ansState === q.correct ? '🎉 ¡Correcto!' : '💡 Pista para recordar:'),
          h('p', { style: 'margin:0;font-size:.9rem;color:#26232E' }, q.explain)
        ]);
        card.appendChild(feedback);

        var nextBtn = h('button', { class: 'btn btn--primary', type: 'button', style: 'margin-top:16px' },
          quizState.current + 1 < QUIZ_QUESTIONS.length ? 'Siguiente reto ›' : 'Ver resultado final 🏆');
        nextBtn.addEventListener('click', function () {
          Sound.tap();
          quizState.current += 1;
          renderQuiz();
        });
        card.appendChild(nextBtn);
      }
    }

    if (quizState.current >= QUIZ_QUESTIONS.length) {
      clear(card);
      card.appendChild(h('h2', {}, '🎉 ¡Repaso completado!'));
      card.appendChild(h('p', { class: 'read' }, 'Has respondido las preguntas sobre Secuencias, Bucles, Condicionales y Depuración.'));
      card.appendChild(h('div', { style: 'font-size:1.5rem;font-weight:bold;margin:16px 0;color:#3FC1A0' },
        'Puntuación: ' + quizState.score + ' de ' + QUIZ_QUESTIONS.length + ' aciertos ⭐'));

      var actions = h('div', { class: 'modal__actions' }, [
        btn('Repetir repaso', 'btn--soft', function () {
          quizState = { current: 0, score: 0, answered: {} };
          renderQuiz();
        }),
        btn('Volver al inicio', 'btn--primary', function () {
          showView('home');
          renderHome();
        })
      ]);
      card.appendChild(actions);
    }

    host.appendChild(top);
    host.appendChild(card);
  }

  /* ==================================================================
     TEORÍA DE INTRODUCCIÓN A LA PROGRAMACIÓN Y EVALUACIÓN
     ================================================================== */
  var THEORY_TOPICS = [
    {
      title: '1. ¿Qué es un Algoritmo y qué es Programar?',
      badge: 'Lógica Básica',
      summary: 'Un programa es una receta de cocina muy precisa que una computadora sigue al pie de la letra.',
      content: [
        'Las computadoras y los robots como **Chispa** no tienen sentido común ni adivinan intenciones: sólo ejecutan instrucciones exactas en un orden determinado.',
        'Un **Algoritmo** es un conjunto de pasos ordenados y finitos para resolver un problema (por ejemplo: levantarse, lavarse los dientes, vestirse y desayunar).',
        '**Programar** es traducir ese algoritmo a un lenguaje que el robot o la máquina pueda entender y procesar sin equivocarse.'
      ],
      blockCorrelation: 'En CodeKids, cada bloque de color que arrastras representa una **instrucción única e indivisible** en el algoritmo de Chispa.'
    },
    {
      title: '2. Estructura Secuencial (El orden importa)',
      badge: 'Secuencia',
      summary: 'Las instrucciones se ejecutan de arriba hacia abajo, una por una.',
      content: [
        'En la programación clásica, el orden cronológico define el resultado final.',
        'Si alteras el orden de dos pasos (por ejemplo, ponerte los zapatos antes de los calcetines), el resultado falla aunque las dos órdenes existan.',
        'En nuestro juego, si le pides a Chispa *Avanzar y luego Girar*, llegará a un lugar muy diferente que si le pides *Girar y luego Avanzar*.'
      ],
      blockCorrelation: 'Correlación de bloques: La columna de bloques apilados verticalmente representa exactamente el flujo secuencial de un programa real en Python o JavaScript.'
    },
    {
      title: '3. Estructuras de Repetición (Bucles / Loops)',
      badge: 'Bucles',
      summary: 'Automatizar tareas repetitivas sin duplicar código inútilmente.',
      content: [
        'Uno de los principios de un buen programador es no repetirse (principio DRY: Don\'t Repeat Yourself).',
        'Un **Bucle (Loop)** permite tomar una o varias instrucciones y ejecutarlas una cantidad determinada de veces (`for` loop) o mientras se cumpla una condición (`while` loop).',
        'Ahorra memoria, hace el programa más corto, más legible y mucho más fácil de modificar.'
      ],
      blockCorrelation: 'Correlación de bloques: El bloque amarillo `Repetir N veces { ... }` encierra otras instrucciones dentro de su cuerpo, igual que las llaves `{ }` o la indentación en los lenguajes de texto profesionales.'
    },
    {
      title: '4. Estructuras de Decisión (Condicionales)',
      badge: 'Condicionales',
      summary: 'Tomar decisiones inteligentes evaluando el estado del entorno.',
      content: [
        'Los programas no siempre siguen un camino fijo; necesitan reaccionar a cambios o eventos inesperados.',
        'Un **Condicional (`if - else`)** evalúa una pregunta lógica (Verdadero o Falso). Si la condición es Verdadera, ejecuta una acción; si es Falsa, continúa o hace otra cosa.',
        'Esto permite que el mismo código sirva para infinitos laberintos sin tener que programar cada paso de memoria.'
      ],
      blockCorrelation: 'Correlación de bloques: El bloque violeta `Si hay pared { girar }` consulta un sensor lógico antes de actuar. Es idéntico a una sentencia `if (sensor.hasWall()) robot.turnRight();`.'
    },
    {
      title: '5. La Correlación: De Bloques a Código Real',
      badge: 'Código Real',
      summary: 'La programación visual por bloques utiliza los mismos conceptos que los lenguajes profesionales.',
      content: [
        'Lenguajes visuales como Scratch o Blockly funcionan con la misma arquitectura que lenguajes como Python, JavaScript, Java o C++.',
        'Los bloques eliminan la frustración de equivocarse en la puntuación (puntos y comas, paréntesis), permitiendo que te concentres al 100% en la **lógica algorítmica**.',
        'Una vez que dominas la lógica (Secuencia + Bucles + Condiciones), aprender la sintaxis escrita de cualquier lenguaje es pan comido.'
      ],
      blockCorrelation: 'Aprender a pensar en bloques entrena tu mente como ingeniero de software: abstraer problemas, dividirlos en piezas y depurar errores.'
    },
    {
      title: '6. Sentencias, Sintaxis y Lenguajes',
      badge: 'Sintaxis & Sentencias',
      summary: 'Cómo se escriben las órdenes en texto y las reglas que las gobiernan.',
      content: [
        'Una **Sentencia (Statement)** es una instrucción completa en un lenguaje de programación. Es el equivalente a una oración con sujeto y predicado en español.',
        'La **Sintaxis** es el conjunto de reglas gramaticales y ortográficas del lenguaje. En Python, si olvidas un paréntesis `()` o los dos puntos `:`, se produce un **Error de Sintaxis (Syntax Error)** y el programa no puede arrancar.',
        'Los lenguajes como **Python** usan indentación (espacios hacia la derecha) para indicar qué órdenes van dentro de un bucle o de una condición.'
      ],
      blockCorrelation: 'Correlación: Mientras que en los bloques encajas una pieza dentro de otra visualmente, en Python colocas 4 espacios de sangría para indicar que una sentencia pertenece a un bloque superior.'
    },
    {
      title: '7. Lenguajes Compilados vs Lenguajes Interpretados',
      badge: 'Compilado vs Interpretado',
      summary: 'Cómo las computadoras traducen el código humano a ceros y unos.',
      content: [
        'Las computadoras sólo entienden lenguaje de máquina (ceros y unos: binario). Para que entiendan nuestro código, existen dos métodos principales:',
        '**Lenguaje Interpretado (como Python o JavaScript):** Un programa llamado *Intérprete* lee el código línea por línea y lo ejecuta al instante. Si hay un error en la línea 10, ejecutará las primeras 9 y se detendrá al llegar a la 10.',
        '**Lenguaje Compilado (como C++ o Rust):** Un programa llamado *Compilador* traduce TODO el archivo a ceros y unos antes de ejecutarlo. Si hay un solo error en cualquier lugar, no genera el ejecutable hasta que lo corrijas.'
      ],
      blockCorrelation: 'En CodeKids, Chispa actúa como un intérprete en tiempo real: lee cada sentencia de Python o bloque uno tras otro y lo reproduce de inmediato en el mapa.'
    }
  ];

  var THEORY_EVAL_QUESTIONS = [
    {
      topic: 'Lógica & Algoritmos',
      question: '¿Qué es exactamente un "algoritmo" en informática?',
      options: [
        'Una pieza física dentro del robot',
        'Una serie de pasos ordenados y finitos para resolver un problema o tarea',
        'Un error que hace que el computador se apague'
      ],
      correct: 1,
      explain: 'Un algoritmo es la receta lógica: una secuencia de pasos claros que resuelven una meta.'
    },
    {
      topic: 'Estructuras de Control',
      question: '¿Por qué en programación se usan bucles en vez de escribir la misma instrucción 100 veces?',
      options: [
        'Porque la computadora se cansa si ve muchas letras',
        'Para evitar duplicar código, reducir errores y hacer el programa eficiente y legible',
        'Porque los bucles hacen que el robot avance más rápido físicamente'
      ],
      correct: 1,
      explain: 'Los bucles permiten reutilizar la lógica, ahorran espacio y facilitan el mantenimiento del código.'
    },
    {
      topic: 'Condicionales & Lógica',
      question: 'En la lógica de control, ¿cuándo se ejecuta el código dentro de un condicional `Si ...`?',
      options: [
        'Siempre se ejecuta, sin importar lo que pase',
        'Únicamente cuando la condición evaluada resulta ser Verdadera (True)',
        'Solo cuando el usuario presiona un botón rojo'
      ],
      correct: 1,
      explain: 'El condicional inspecciona una condición; si es Verdadera actúa, si es Falsa se la salta.'
    },
    {
      topic: 'Correlación Bloques vs Código',
      question: '¿Qué ventaja principal tiene aprender lógica con bloques antes de escribir código en texto?',
      options: [
        'Permite enfocarse en la lógica computacional sin tropezar con errores de tipeo y sintaxis',
        'Los bloques tienen más funciones que los lenguajes reales',
        'Los bloques no usan matemáticas ni lógica'
      ],
      correct: 0,
      explain: 'Los bloques enseñan las estructuras de control puras. La lógica aprendida es 100% transferible a Python, JavaScript o C++.'
    },
    {
      topic: 'Secuencia & Flujo de Ejecución',
      question: 'Si un programa tiene las órdenes: 1) Girar Derecha, 2) Avanzar, 3) Girar Derecha. ¿En qué orden las realiza la máquina?',
      options: [
        'Las hace todas al mismo tiempo en un milisegundo',
        'En orden cronológico secuencial: paso 1, luego paso 2 y por último paso 3',
        'Empieza por la última y termina por la primera'
      ],
      correct: 1,
      explain: 'Las máquinas ejecutan los programas de forma secuencial, paso a paso, de arriba hacia abajo.'
    },
    {
      topic: 'Depuración (Debugging)',
      question: '¿Qué actitud define el pensamiento computacional al encontrar un fallo en el programa?',
      options: [
        'Borrar todo el código y abandonar la tarea',
        'Rastrear la ejecución paso a paso para aislar la instrucción errónea y corregirla',
        'Culpar a la computadora porque ella inventó el error'
      ],
      correct: 1,
      explain: 'La depuración es un proceso analítico: seguir el rastro, encontrar la anomalía y corregirla con precisión.'
    },
    {
      topic: 'Sintaxis y Sentencias',
      question: '¿Qué ocurre en un lenguaje como Python si olvidas escribir los paréntesis `()` en `chispa.avanzar()`?',
      options: [
        'El robot avanza el doble de rápido',
        'Ocurre un error de sintaxis y la computadora no ejecuta la orden como una acción',
        'La computadora inventa los paréntesis por sí sola'
      ],
      correct: 1,
      explain: 'La sintaxis exige los paréntesis () para ejecutar un método o función; sin ellos, la orden no se realiza.'
    },
    {
      topic: 'Compilado vs Interpretado',
      question: '¿Cuál es la diferencia clave entre un lenguaje interpretado (como Python) y uno compilado (como C++)?',
      options: [
        'El interpretado lee y ejecuta línea por línea; el compilado traduce todo el código a binario antes de ejecutarlo',
        'Los compilados solo funcionan en teléfonos y los interpretados en computadoras',
        'No hay ninguna diferencia, son exactamente iguales'
      ],
      correct: 0,
      explain: 'Python utiliza un intérprete que traduce y corre cada instrucción sobre la marcha.'
    }
  ];

  var theoryState = {
    tab: 'read', // 'read' | 'eval'
    currentTopic: 0,
    evalCurrent: 0,
    evalScore: 0,
    evalAnswers: {}
  };

  function renderTheory() {
    var host = $('#theory-root');
    if (!host) return;
    clear(host);

    var top = h('div', { class: 'topbar' }, [
      backBtn(function () { showView('home'); renderHome(); }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, 'Fundamentos Computacionales'),
        h('h1', { class: 'topbar__title' }, 'Introducción a la Programación')
      ]),
      h('div', { class: 'topbar__tools' }, [
        iconBtn('🔄', 'Reiniciar', function () {
          theoryState = { tab: 'read', currentTopic: 0, evalCurrent: 0, evalScore: 0, evalAnswers: {} };
          Sound.tap();
          renderTheory();
        })
      ])
    ]);

    var tabs = h('div', { class: 'lesson-tabs', role: 'tablist' }, [
      h('button', {
        class: 'lesson-tab' + (theoryState.tab === 'read' ? ' is-active' : ''),
        type: 'button',
        onclick: function () { theoryState.tab = 'read'; Sound.tap(); renderTheory(); }
      }, '📖 1. Conceptos y Teoría'),
      h('button', {
        class: 'lesson-tab' + (theoryState.tab === 'eval' ? ' is-active' : ''),
        type: 'button',
        onclick: function () { theoryState.tab = 'eval'; Sound.tap(); renderTheory(); }
      }, '✍️ 2. Evaluación de Lógica (' + Object.keys(theoryState.evalAnswers).length + '/' + THEORY_EVAL_QUESTIONS.length + ')')
    ]);

    var content = h('div', { class: 'lesson-pane' });

    if (theoryState.tab === 'read') {
      content.appendChild(renderTheoryReading());
    } else {
      content.appendChild(renderTheoryEvaluation());
    }

    host.appendChild(top);
    host.appendChild(tabs);
    host.appendChild(content);
  }

  function renderTheoryReading() {
    var pane = h('div', { class: 'lesson-pane__inner' });

    var navList = h('div', {
      style: 'display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;scrollbar-width:thin'
    });

    THEORY_TOPICS.forEach(function (t, idx) {
      var active = theoryState.currentTopic === idx;
      var btnTopic = h('button', {
        class: 'btn ' + (active ? 'btn--primary' : 'btn--soft'),
        style: 'flex:none;font-size:.82rem;padding:6px 14px;border-radius:999px',
        type: 'button',
        onclick: function () {
          theoryState.currentTopic = idx;
          Sound.tap();
          renderTheory();
        }
      }, t.badge);
      navList.appendChild(btnTopic);
    });

    pane.appendChild(navList);

    var topic = THEORY_TOPICS[theoryState.currentTopic];
    var card = h('div', { class: 'progress-card', style: 'padding:24px' }, [
      h('p', { class: 'kicker' }, topic.badge),
      h('h2', { style: 'font-size:1.35rem;margin:6px 0 12px;color:var(--ink)' }, topic.title),
      h('p', { class: 'lead', style: 'font-weight:700;color:var(--coral);margin-bottom:16px' }, topic.summary)
    ]);

    topic.content.forEach(function (paragraph) {
      var pElem = h('p', { class: 'read', style: 'margin-bottom:12px;line-height:1.6' });
      pElem.innerHTML = paragraph.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      card.appendChild(pElem);
    });

    var correlBox = h('div', {
      style: 'margin-top:18px;padding:14px 18px;background:#EDFBF5;border-left:4px solid #3FC1A0;border-radius:8px'
    }, [
      h('b', { style: 'display:block;margin-bottom:4px;color:#10624E;font-size:.9rem' }, '🧩 Correlación con la programación visual:'),
      h('p', { style: 'margin:0;font-size:.88rem;color:#26232E;line-height:1.5' }, topic.blockCorrelation)
    ]);
    card.appendChild(correlBox);

    var ctaRow = h('div', { style: 'display:flex;gap:12px;margin-top:20px;flex-wrap:wrap' });

    if (theoryState.currentTopic < THEORY_TOPICS.length - 1) {
      ctaRow.appendChild(btn('Siguiente tema: ' + THEORY_TOPICS[theoryState.currentTopic + 1].badge + ' →', 'btn--soft', function () {
        theoryState.currentTopic += 1;
        renderTheory();
      }));
    }

    ctaRow.appendChild(btn('Ir a la Evaluación de Lógica ✍️', 'btn--primary', function () {
      theoryState.tab = 'eval';
      renderTheory();
    }));

    card.appendChild(ctaRow);
    pane.appendChild(card);
    return pane;
  }

  function renderTheoryEvaluation() {
    var pane = h('div', { class: 'lesson-pane__inner' });
    var qIdx = theoryState.evalCurrent;
    var q = THEORY_EVAL_QUESTIONS[qIdx];

    var card = h('div', { class: 'progress-card quiz-card', style: 'padding:24px' });

    if (qIdx >= THEORY_EVAL_QUESTIONS.length) {
      card.appendChild(h('h2', { style: 'color:#3FC1A0;margin-bottom:8px' }, '🏆 ¡Evaluación Finalizada!'));
      card.appendChild(h('p', { class: 'read' }, 'Has demostrado tus conocimientos sobre algoritmos, estructuras de control, condicionales y correlación de bloques.'));

      var pct = Math.round((theoryState.evalScore / THEORY_EVAL_QUESTIONS.length) * 100);
      var resultBadge = h('div', {
        style: 'font-size:1.6rem;font-weight:900;margin:18px 0;padding:16px;background:#FFF7EC;border-radius:14px;border:2px solid var(--line);text-align:center;color:var(--ink)'
      }, [
        h('span', { style: 'display:block;font-size:1rem;color:var(--muted);font-weight:700;margin-bottom:4px' }, 'Calificación Obtenida:'),
        theoryState.evalScore + ' de ' + THEORY_EVAL_QUESTIONS.length + ' aciertos (' + pct + '%) ' + (pct >= 80 ? '🌟 Sobresaliente' : '👍 Buen esfuerzo')
      ]);
      card.appendChild(resultBadge);

      var actions = h('div', { class: 'modal__actions', style: 'margin-top:16px' }, [
        btn('Repetir Evaluación', 'btn--soft', function () {
          theoryState.evalCurrent = 0;
          theoryState.evalScore = 0;
          theoryState.evalAnswers = {};
          renderTheory();
        }),
        btn('Repasar Teoría', 'btn--soft', function () {
          theoryState.tab = 'read';
          renderTheory();
        }),
        btn('Volver al Inicio', 'btn--primary', function () {
          showView('home');
          renderHome();
        })
      ]);
      card.appendChild(actions);
      pane.appendChild(card);
      return pane;
    }

    card.appendChild(h('p', { class: 'kicker' }, 'Pregunta ' + (qIdx + 1) + ' de ' + THEORY_EVAL_QUESTIONS.length + ' · ' + q.topic));
    card.appendChild(h('h2', { style: 'font-size:1.25rem;margin:8px 0 16px;color:var(--ink)' }, q.question));

    var answeredIdx = theoryState.evalAnswers[qIdx];
    var optList = h('div', { class: 'quiz-options' });

    q.options.forEach(function (optText, idx) {
      var optBtn = h('button', {
        class: 'btn btn--soft quiz-opt-btn',
        type: 'button',
        style: 'text-align:left;display:block;width:100%;margin-bottom:10px;padding:12px 16px;white-space:normal;line-height:1.4'
      }, optText);

      if (answeredIdx !== undefined) {
        optBtn.disabled = true;
        if (idx === q.correct) {
          optBtn.style.background = '#3FC1A0';
          optBtn.style.color = '#FFFFFF';
          optBtn.style.borderColor = '#2A9E81';
        } else if (idx === answeredIdx) {
          optBtn.style.background = '#FF6B4A';
          optBtn.style.color = '#FFFFFF';
          optBtn.style.borderColor = '#E0522F';
        }
      } else {
        optBtn.addEventListener('click', function () {
          theoryState.evalAnswers[qIdx] = idx;
          if (idx === q.correct) {
            Sound.win();
            theoryState.evalScore += 1;
          } else {
            Sound.bump();
          }
          renderTheory();
        });
      }
      optList.appendChild(optBtn);
    });

    card.appendChild(optList);

    if (answeredIdx !== undefined) {
      var isCorrect = (answeredIdx === q.correct);
      var feedbackBox = h('div', {
        style: 'margin-top:16px;padding:14px;border-radius:14px;background:' + (isCorrect ? '#E8F8F3' : '#FFF0ED')
      }, [
        h('b', { style: 'display:block;margin-bottom:4px;color:' + (isCorrect ? '#2A9E81' : '#E0522F') },
          isCorrect ? '✅ ¡Respuesta Correcta!' : '❌ Respuesta Incorrecta:'),
        h('p', { style: 'margin:0;font-size:.88rem;color:#26232E;line-height:1.4' }, q.explain)
      ]);
      card.appendChild(feedbackBox);

      var nextBtn = h('button', {
        class: 'btn btn--primary',
        type: 'button',
        style: 'margin-top:16px'
      }, qIdx + 1 < THEORY_EVAL_QUESTIONS.length ? 'Siguiente Pregunta →' : 'Finalizar y Ver Calificación 🏆');

      nextBtn.addEventListener('click', function () {
        Sound.tap();
        theoryState.evalCurrent += 1;
        renderTheory();
      });
      card.appendChild(nextBtn);
    }

    pane.appendChild(card);
    return pane;
  }

  /* ==================================================================
     EVALUACIÓN · LA RUTA DE CHISPA
     Tableros de 10x10, editor de código puro (sin bloques ni pistas).
     La ruta queda dibujada con flechas hasta la bandera.
     ================================================================== */
  var EXAM_KEY = 'codekids.exam.v1';
  var examState = null;

  function loadExamAnswers() {
    try {
      var raw = window.localStorage.getItem(EXAM_KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (data && Array.isArray(data.answers)) return data.answers;
    } catch (e) { /* file:// o almacenamiento bloqueado */ }
    return [];
  }

  function saveExamAnswers() {
    try {
      window.localStorage.setItem(EXAM_KEY, JSON.stringify({ answers: examState.answers }));
    } catch (e) { /* no se puede guardar: la evaluación sigue funcionando */ }
  }

  function examReset() {
    examState = {
      i: 0,
      answers: loadExamAnswers(),
      frames: [],
      idx: 0,
      result: null,
      playing: false,
      board: null,
      timer: null
    };
  }

  function restartExam() {
    try { window.localStorage.removeItem(EXAM_KEY); } catch (e) {}
    examReset();
    openExam(0);
  }

  function openExam(index) {
    if (!EXAM || !EXAM.exercises.length) return;
    if (!examState) examReset();
    clearTimeout(examState.timer);
    examState.playing = false;
    examState.i = Math.max(0, Math.min(EXAM.exercises.length, Number(index) || 0));
    renderExam();
  }

  function markExamTiles(bag) {
    if (!bag) return;
    var s = bag.level.start;
    var f = bag.level.flag;
    if (bag.cells[s.y] && bag.cells[s.y][s.x]) bag.cells[s.y][s.x].classList.add('tile--start');
    if (f && bag.cells[f.y] && bag.cells[f.y][f.x]) bag.cells[f.y][f.x].classList.add('tile--goal');
  }

  function examStatus(node, kind, icon, text) {
    if (!node) return;
    node.className = 'exam-status' + (kind === 'ok' ? ' is-ok' : kind === 'error' ? ' is-error' : '');
    node.textContent = icon + ' ' + text;
  }

  function renderExam() {
    var host = $('#exam-root');
    if (!host) return;
    showView('exam');
    clear(host);

    var total = EXAM.exercises.length;
    var top = h('div', { class: 'topbar' }, [
      backBtn(function () {
        clearTimeout(examState.timer);
        examState.playing = false;
        showView('home');
        renderHome();
      }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, 'Evaluación · solo código · sin pistas'),
        h('h1', { class: 'topbar__title' }, 'La ruta de Chispa')
      ]),
      h('div', { class: 'topbar__tools' }, [
        h('span', { class: 'chip' }, 'Tablero 10 × 10'),
        examState.i < total ? h('span', { class: 'chip' }, 'Ejercicio ' + (examState.i + 1) + ' de ' + total) : null,
        iconBtn('🔄', 'Reiniciar evaluación', restartExam)
      ])
    ]);
    host.appendChild(top);

    if (examState.i >= total) {
      renderExamSummary(host);
      syncHash('#/evaluacion/final');
      return;
    }

    var e = EXAM.exercises[examState.i];
    var level = E.parseLevel({ grid: e.grid, startDir: e.startDir, solution: e.solution });
    S.mission = null;  // el tablero de examen nunca usa el aspecto espacial
    var saved = examState.answers[examState.i];

    var boardEl = h('div', { class: 'board exam-board', id: 'exam-board' });
    var statusEl = h('div', {
      class: 'exam-status', id: 'exam-status', role: 'status', 'aria-live': 'polite'
    }, 'Escribe tu código y ejecútalo para ver la ruta de Chispa.');

    var area = h('textarea', {
      id: 'exam-code',
      class: 'exam-code',
      spellcheck: 'false',
      autocapitalize: 'off',
      autocomplete: 'off',
      placeholder: '# Escribe aquí tus órdenes con Python'
    });
    area.value = saved && typeof saved.code === 'string' ? saved.code : '';

    var errEl = h('div', { class: 'exam-error', id: 'exam-error', hidden: 'hidden' });
    var runBtn = h('button', { class: 'btn btn--primary', id: 'exam-run', type: 'button' }, '▶ Ejecutar ruta');
    var nextBtn = h('button', { class: 'btn btn--soft', id: 'exam-next', type: 'button' },
      examState.i + 1 < total ? 'Siguiente ejercicio →' : 'Ver resultado final 🏆');

    host.appendChild(h('div', { class: 'exam-grid' }, [
      h('section', { class: 'exam-panel' }, [
        h('p', { class: 'kicker' }, e.concept),
        h('h2', { class: 'exam-title' }, e.title),
        h('p', { class: 'exam-goal' }, e.goal),
        boardEl,
        h('div', { class: 'exam-legend' }, [
          h('span', {}, '🟡 Inicio'),
          h('span', {}, '🏁 Meta'),
          h('span', {}, '➡️ Ruta recorrida'),
          h('span', {}, '⭐ Estrellas')
        ]),
        statusEl
      ]),
      h('aside', { class: 'exam-editor' }, [
        h('h2', { class: 'exam-title' }, '⌨️ Tu código'),
        h('p', { class: 'exam-note' }, 'Sin bloques. Sin pistas. Escribe cada orden.'),
        area,
        errEl,
        h('div', { class: 'exam-actions' }, [runBtn, nextBtn])
      ])
    ]));

    examState.board = mountBoard(level, boardEl);
    markExamTiles(examState.board);

    runBtn.addEventListener('click', function () { runExam(level, area, errEl, statusEl, runBtn); });
    nextBtn.addEventListener('click', examNext);
    syncHash('#/evaluacion/' + (examState.i + 1));
  }

  function runExam(level, area, errEl, statusEl, runBtn) {
    if (examState.playing) return;
    clearTimeout(examState.timer);
    var parsed = parsePython(area.value || '');

    if (parsed.errors.length || !parsed.program.length) {
      errEl.hidden = false;
      errEl.textContent = parsed.errors.length
        ? '⚠️ Línea ' + parsed.errors[0].line + ': sintaxis no válida. Corrígela para ejecutar.'
        : '✋ Escribe al menos una orden antes de ejecutar.';
      examStatus(statusEl, 'error', '⌨️', 'El código todavía no se puede ejecutar.');
      Sound.error();
      return;
    }
    errEl.hidden = true;

    var result = E.run(level, parsed.program, { maxSteps: 400 });
    if (result.result === 'error') {
      examStatus(statusEl, 'error', '⚠️', 'El programa es demasiado largo. Prueba con un bucle.');
      Sound.error();
      return;
    }

    examState.frames = result.frames;
    examState.idx = 0;
    examState.result = result;
    examState.playing = true;
    runBtn.disabled = true;

    examState.board = mountBoard(level, $('#exam-board'));
    markExamTiles(examState.board);
    applyFrame(examState.board, result.frames[0], null, { highlight: false });
    examStatus(statusEl, 'info', '▶️', 'Chispa está recorriendo el tablero…');
    examTick(statusEl, runBtn);
  }

  function examTick(statusEl, runBtn) {
    var frames = examState.frames;
    if (examState.idx >= frames.length - 1) { finishExamRun(statusEl, runBtn); return; }
    var effect = frames[examState.idx].effect;
    var delay = effect === 'turn' ? 180 : effect === 'think' ? 200 : effect === 'bump' ? 460 : 230;
    if (document.body.classList.contains('calm')) delay = Math.max(120, delay - 60);
    examState.timer = setTimeout(function () {
      if (!examState.playing) return;
      examState.idx += 1;
      applyFrame(examState.board, frames[examState.idx], frames[examState.idx - 1], { highlight: false });
      if (examState.idx >= frames.length - 1) finishExamRun(statusEl, runBtn);
      else examTick(statusEl, runBtn);
    }, delay);
  }

  function finishExamRun(statusEl, runBtn) {
    if (!examState.playing) return;
    examState.playing = false;
    examState.timer = null;
    runBtn.disabled = false;

    var r = examState.result;
    var moves = r.frames.filter(function (f) { return f.effect === 'move'; }).length;
    var stars = examState.board ? examState.board.level.stars.length : 0;
    var area = $('#exam-code');
    var passed = r.result === 'win';
    examState.answers[examState.i] = { code: area ? area.value : '', passed: passed, steps: moves };
    saveExamAnswers();

    if (passed) {
      var flag = examState.board.level.flag;
      var tile = examState.board.cells[flag.y] && examState.board.cells[flag.y][flag.x];
      if (tile) tile.classList.add('is-reached');
      examStatus(statusEl, 'ok', '✅', '¡Ruta completada! Chispa recorrió ' + moves + ' casillas, recogió ' + stars + ' estrellas y llegó a la meta.');
      Sound.win();
      return;
    }

    var msg;
    if (r.result === 'bump') msg = 'Chispa chocó con una pared y su ruta se detuvo antes de la meta.';
    else if (r.remaining > 0 && r.onFlag) msg = 'Chispa llegó a la bandera, pero faltaban ' + r.remaining + ' estrellas en la ruta.';
    else msg = 'Chispa se detuvo antes de la meta. Prueba otra ruta.';
    examStatus(statusEl, 'error', '🔎', msg + ' Casillas recorridas: ' + moves + '.');
    Sound.bump();
  }

  function examNext() {
    clearTimeout(examState.timer);
    examState.playing = false;
    var area = $('#exam-code');
    if (area) {
      var prev = examState.answers[examState.i] || {};
      var unchanged = prev.code === area.value;
      examState.answers[examState.i] = {
        code: area.value,
        passed: !!(unchanged && prev.passed),
        steps: unchanged ? (prev.steps || 0) : 0
      };
      saveExamAnswers();
    }
    examState.i += 1;
    renderExam();
  }

  function renderExamSummary(host) {
    var total = EXAM.exercises.length;
    var score = examState.answers.filter(function (a) { return !!(a && a.passed); }).length;
    var card = h('div', { class: 'exam-summary' }, [
      h('p', { class: 'kicker' }, 'Evaluación finalizada'),
      h('h2', {}, score === total ? '🏆 ¡Ruta completa!' : '📝 Resultado de la evaluación'),
      h('div', { class: 'exam-score' }, score + ' / ' + total + ' ejercicios con ruta completada'),
      h('p', { class: 'exam-goal' }, score === total
        ? 'Chispa llegó a la meta en los cuatro tableros.'
        : 'Puedes repetir la evaluación para intentar los ejercicios que faltaron.')
    ]);

    var list = h('div', { class: 'exam-summary__list' });
    EXAM.exercises.forEach(function (e, i) {
      var a = examState.answers[i] || {};
      list.appendChild(h('div', { class: 'exam-summary__row' + (a.passed ? ' is-ok' : '') }, [
        h('span', {}, a.passed ? '✅' : '⬜'),
        h('span', {}, e.title),
        h('span', {}, a.passed ? (a.steps + ' casillas') : 'sin meta')
      ]));
    });
    card.appendChild(list);
    card.appendChild(h('div', { class: 'exam-actions' }, [
      btn('Repetir evaluación', 'btn--soft', restartExam),
      btn('Volver al inicio', 'btn--primary', function () { showView('home'); renderHome(); })
    ]));
    host.appendChild(card);
  }

  /* ==================================================================
     DICCIONARIO DE SENTENCIAS (LENGUAJE COMÚN vs PYTHON)
     ================================================================== */
  var SENTENCE_DICTIONARY = [
    {
      category: 'Movimiento y Dirección',
      common: 'Avanzar un paso hacia adelante',
      python: 'chispa.avanzar()',
      syntaxDesc: 'chispa es el objeto (robot), .avanzar() es el método de acción. Los paréntesis ejecutan la orden.',
      blockIcon: 'move',
      example: 'chispa.avanzar()'
    },
    {
      category: 'Movimiento y Dirección',
      common: 'Girar hacia la izquierda (sin avanzar)',
      python: 'chispa.girar_izquierda()',
      syntaxDesc: 'Cambia la orientación 90° en sentido antihorario. No cambia las coordenadas x, y del robot.',
      blockIcon: 'left',
      example: 'chispa.girar_izquierda()\nchispa.avanzar()'
    },
    {
      category: 'Movimiento y Dirección',
      common: 'Girar hacia la derecha (sin avanzar)',
      python: 'chispa.girar_derecha()',
      syntaxDesc: 'Cambia la orientación 90° en sentido horario.',
      blockIcon: 'right',
      example: 'chispa.girar_derecha()\nchispa.avanzar()'
    },
    {
      category: 'Estructuras de Repetición (Bucles)',
      common: 'Repetir una acción N veces',
      python: 'for i in range(N):\n    # acciones sangradas...',
      syntaxDesc: 'for i in range(N): inicia el bucle. range(N) define la cantidad de ciclos. Los dos puntos : y 4 espacios de sangría encierran las órdenes repetidas.',
      blockIcon: 'repeat',
      example: 'for i in range(4):\n    chispa.avanzar()\n    chispa.girar_derecha()'
    },
    {
      category: 'Estructuras de Decisión (Condicionales)',
      common: 'Si hay pared adelante, girar; si no, seguir libre',
      python: 'if chispa.hay_pared():\n    chispa.girar_derecha()',
      syntaxDesc: 'if evalúa una condición booleana. chispa.hay_pared() devuelve True si hay obstáculo. Si es True, ejecuta el bloque indentado.',
      blockIcon: 'ifwall',
      example: 'for i in range(8):\n    chispa.avanzar()\n    if chispa.hay_pared():\n        chispa.girar_derecha()'
    },
    {
      category: 'Comentarios y Documentación',
      common: 'Escribir notas que la computadora no ejecuta',
      python: '# Esto es un comentario',
      syntaxDesc: 'Todo lo que comience con el símbolo almohadilla # es ignorado por el intérprete de Python. Sirve para que los humanos expliquen el código.',
      blockIcon: null,
      example: '# Paso 1: Recoger la primera estrella\nchispa.avanzar()'
    }
  ];

  function renderDict() {
    var host = $('#dict-root');
    if (!host) return;
    clear(host);

    var top = h('div', { class: 'topbar' }, [
      backBtn(function () { showView('home'); renderHome(); }),
      h('div', { class: 'topbar__mid' }, [
        h('p', { class: 'eyebrow' }, 'Referencia y Traducción'),
        h('h1', { class: 'topbar__title' }, 'Diccionario de Sentencias')
      ]),
      h('div', { class: 'topbar__tools' }, [
        btn('Probar en Reto 6 🐍', 'btn--primary', function () { openMission('py1'); })
      ])
    ]);

    var intro = h('div', { class: 'progress-card', style: 'padding:20px;margin-bottom:16px' }, [
      h('h2', { style: 'margin-bottom:6px' }, '📖 De lenguaje natural a Python'),
      h('p', { class: 'read' }, 'Este diccionario compara cómo pensamos una orden en lenguaje común y cómo se escribe con la sintaxis exacta de Python que entiende Chispa.')
    ]);

    var list = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    SENTENCE_DICTIONARY.forEach(function (item) {
      var card = h('div', {
        class: 'progress-card',
        style: 'padding:18px 20px;border-left:5px solid #3FC1A0'
      }, [
        h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px' }, [
          h('span', { class: 'kicker', style: 'margin:0' }, item.category),
          item.blockIcon ? h('span', {
            style: 'background:#FDEFDD;padding:2px 8px;border-radius:999px;font-size:.76rem;font-weight:bold;color:#26232E'
          }, 'Bloque ' + BLOCK[item.blockIcon].label) : null
        ]),
        h('h3', { style: 'font-size:1.12rem;margin:4px 0 10px;color:var(--ink)' }, '🗣️ ' + item.common),
        h('div', {
          style: 'background:#26232E;color:#8BF0D2;padding:12px 14px;border-radius:10px;font-family:Consolas, Monaco, monospace;font-size:.9rem;line-height:1.4;margin-bottom:8px'
        }, [
          h('span', { style: 'color:#8A8299;display:block;font-size:.74rem;margin-bottom:2px' }, '🐍 Sintaxis en Python:'),
          h('code', {}, item.python)
        ]),
        h('p', { style: 'font-size:.86rem;color:var(--ink-soft);margin:6px 0 0;line-height:1.4' }, item.syntaxDesc)
      ]);
      list.appendChild(card);
    });

    host.appendChild(top);
    host.appendChild(intro);
    host.appendChild(list);
  }

  function switchRow(title, sub, value, onChange) {
    var sw = h('button', {
      class: 'switch', type: 'button', role: 'switch',
      'aria-checked': value ? 'true' : 'false', 'aria-label': title
    });
    sw.addEventListener('click', function () {
      var next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', next ? 'true' : 'false');
      onChange(next);
      Sound.tap();
    });
    return h('div', { class: 'settings-row' }, [
      h('div', { class: 'settings-row__t' }, [h('b', {}, title), h('span', {}, sub)]),
      sw
    ]);
  }

  /* ==================================================================
     ARRANQUE
     ================================================================== */
  function applyCalm() {
    document.body.classList.toggle('calm', !!store.settings.calm);
  }

  /* ==================================================================
     RUTAS DIRECTAS
     #/leccion/l1/0   #/reto/m4   #/progreso   #/libre
     Sirven para proyectar una pantalla concreta y para revisar el sitio.
     ================================================================== */
  function routeFromHash() {
    var hash = String(window.location.hash || '').replace(/^#\/?/, '');
    if (!hash) return false;
    var parts = hash.split('/');
    var key = parts[0];
    if (key === 'reto' && parts[1] && findMission(parts[1])) { openMission(parts[1]); return true; }
    if ((key === 'leccion' || key === 'lesson') && parts[1] && findLesson(parts[1])) {
      openLesson(parts[1], Number(parts[2] || 0));
      return true;
    }
    if (key === 'progreso') { renderProgress(); showView('progress'); return true; }
    if (key === 'teoria' || key === 'theory') { renderTheory(); showView('theory'); return true; }
    if (key === 'evaluacion' || key === 'eval' || key === 'exam') {
      var examIndex = parts[1] === 'final'
        ? (EXAM ? EXAM.exercises.length : 0)
        : (parseInt(parts[1], 10) || 1) - 1;
      openExam(examIndex);
      return true;
    }
    if (key === 'diccionario' || key === 'dict') { renderDict(); showView('dict'); return true; }
    if (key === 'repaso' || key === 'quiz') { renderQuiz(); showView('quiz'); return true; }
    if (key === 'libre') { openFreePlay(); return true; }
    if (key === 'aventura' || key === 'adventure') {
      /* quest-app.js se carga después de app.js: si todavía no está listo,
         él mismo abre el mundo cuando termina de cargar. */
      if (window.CodeKids && window.CodeKids.QuestApp) window.CodeKids.QuestApp.open(parts[1] || '');
      return true;
    }
    if (key === 'studio') { openStudio(parts[1] ? decodeCode(parts[1]) : ''); return true; }
    return false;
  }

  function boot() {
    Sound.setOn(store.settings.sound);
    applyCalm();
    S.stepMode = !!store.settings.step;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlay(); });
    if (!routeFromHash()) { renderHome(); showView('home'); }
    window.addEventListener('hashchange', function () {
      if (!routeFromHash()) { renderHome(); showView('home'); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
