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

  var STORE_KEY = 'codekids.v3';

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
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>'
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
    return { name: '', stars: {}, breaks: 0, settings: { sound: true, calm: false, step: false } };
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
      base.breaks = Number(p.breaks) || 0;
      if (p.settings) {
        base.settings.sound = p.settings.sound !== false;
        base.settings.calm = !!p.settings.calm;
        base.settings.step = !!p.settings.step;
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
        if (ctx.state === 'suspended') ctx.resume();
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
  function showView(name) {
    S.view = name;
    ['home', 'lesson', 'mission', 'progress'].forEach(function (v) {
      var node = document.getElementById('view-' + v);
      if (node) node.hidden = (v !== name);
    });
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
        h('p', { class: 'home__sub' }, 'Cuatro lecciones. En cada una lees una idea, ves un ejemplo y resuelves retos. Al final sabrás explicar cómo empieza un programa.')
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
      var card = h('button', {
        class: 'lesson-card' + (lessonDone(l) ? ' is-done' : '') + (isNext ? ' is-next' : ''),
        type: 'button',
        'aria-label': 'Lección ' + l.num + ': ' + l.title
      }, [
        h('span', { class: 'lesson-card__num' }, lessonDone(l) ? '✓' : String(l.num)),
        h('div', { class: 'lesson-card__body' }, [
          h('p', { class: 'lesson-card__kicker' }, l.concept),
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

    var foot = h('div', { class: 'home__foot' }, [
      btn('🎨 Zona libre', 'btn--soft', openFreePlay),
      btn('📊 Mi progreso', 'btn--soft', function () { renderProgress(); showView('progress'); }),
      btn('❓ Cómo se juega', 'btn--soft', openHowTo)
    ]);

    host.appendChild(hero);
    host.appendChild(h('div', { class: 'home__cta' }, [cta]));
    host.appendChild(list);
    host.appendChild(foot);
  }

  /* ==================================================================
     LECCIÓN (Lee · Ejemplo · Retos)
     ================================================================== */
  function openLesson(id, tab) {
    var l = findLesson(id);
    if (!l) l = LESSONS[0];
    S.lesson = l;
    S.lessonTab = tab || 0;
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
        h('p', { class: 'eyebrow' }, 'Lección ' + l.num + ' · ' + l.concept),
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

    var tiles = h('div', { class: 'tiles' });
    tiles.style.gridTemplateColumns = 'repeat(' + level.w + ', 1fr)';
    tiles.style.gridTemplateRows = 'repeat(' + level.h + ', 1fr)';

    for (var y = 0; y < level.h; y++) {
      bag.cells[y] = [];
      for (var x = 0; x < level.w; x++) {
        var wall = E.isWall(level, x, y);
        var cls = 'tile';
        if (wall) cls += ' tile--wall';
        else if ((x + y) % 2 === 1) cls += ' tile--alt';
        var tile = h('div', { class: cls });
        tile.dataset.x = x; tile.dataset.y = y;
        if (!wall && level.starAt[E.key(x, y)]) {
          tile.appendChild(h('div', { class: 'item', html: SVG.star() }));
        }
        if (!wall && level.flag && level.flag.x === x && level.flag.y === y) {
          tile.appendChild(h('div', { class: 'item', html: SVG.flag }));
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
    clearTimeout(S.timer);

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
    S.predictionDone = true;
    S.result = null;
    S.frames = [];
    S.playing = false;
    S.stepping = false;
    S.finished = false;
    S.stepMode = !!store.settings.step;
    clearTimeout(S.timer);

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

    var goalRow = h('div', { class: 'goal__row' }, [
      h('button', { class: 'chip chip--hint', id: 'hint-btn', type: 'button' }, '💡 Pista')
    ]);
    if (!S.free && S.level.par) {
      goalRow.appendChild(h('div', { class: 'goal__meta' }, [
        h('span', { html: SVG.star('#FFC94D') }),
        h('span', {}, 'meta ' + S.level.par + ' bloques')
      ]));
    }

    var goal = h('div', { class: 'goal' }, [
      h('p', { class: 'goal__text' }, m.goal),
      goalRow,
      h('p', { class: 'hint-box', id: 'hint-box', hidden: 'hidden' })
    ]);

    var board = h('div', { class: 'board', id: 'board' });
    var feedback = h('div', { class: 'feedback', id: 'feedback', role: 'status', 'aria-live': 'polite' });

    var stage = h('section', { class: 'stage' }, [
      goal,
      h('div', { class: 'board-wrap' }, [board]),
      feedback
    ]);

    var stepToggle = h('button', {
      class: 'chip chip--mini' + (S.stepMode ? ' is-on' : ''),
      id: 'step-toggle', type: 'button',
      'aria-pressed': S.stepMode ? 'true' : 'false'
    }, '🐢 Paso a paso');

    var coderHead = h('div', { class: 'coder__head' }, [
      h('span', {}, 'Mi programa'),
      h('span', { class: 'counter', id: 'counter' }, '0 bloques'),
      stepToggle
    ]);

    var runBtn = h('button', { class: 'btn btn--primary btn--run', id: 'run-btn', type: 'button' }, [
      h('span', { 'aria-hidden': 'true' }, '▶'), 'Ejecutar'
    ]);

    var coder = h('aside', { class: 'coder' }, [
      coderHead,
      h('div', { class: 'palette', id: 'palette' }),
      h('div', { class: 'prog-scroll' }, [h('div', { class: 'prog', id: 'prog' })]),
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
      }
      resetRunButton();
    });

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

  function renderProgram() {
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
  }

  function renderItem(block, path) {
    var key = path.join('.');

    if (block.type === 'repeat') {
      var focused = S.focus.join('.') === key;
      var head = h('div', { class: 'repeat__head' }, [
        h('span', { html: SVG.repeat }),
        h('span', {}, 'Repetir'),
        h('div', { class: 'stepper' }, [
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
        ]),
        delBtn(function (e) { e.stopPropagation(); removeAt(path); })
      ]);

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
        }, '✓ Listo, salir del bucle')
      ]) : null;

      var rep = h('div', {
        class: 'repeat' + (focused ? ' is-target' : ''),
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

    if (S.attempts >= 4) {
      var hintBox = $('#hint-box');
      if (hintBox && hintBox.hidden) {
        hintBox.hidden = false;
        var hints = S.mission.hints || [];
        hintBox.textContent = hints[Math.min(S.hintsRevealed, hints.length - 1)] || 'Prueba con el modo paso a paso.';
      }
    }
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
        out += pad + 'repetir ' + (b.times || 1) + ' veces:\n';
        var inner = toCode(b.do || [], indent + 1, '');
        out += inner || (pad + '    (nada)\n');
      } else if (b.type === 'ifwall') {
        out += pad + 'si hay pared adelante:\n' + pad + '    girar a la derecha\n';
      } else if (b.type === 'move') {
        out += pad + 'avanzar\n';
      } else if (b.type === 'left') {
        out += pad + 'girar a la izquierda\n';
      } else if (b.type === 'right') {
        out += pad + 'girar a la derecha\n';
      }
    });
    return out;
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
    if (key === 'libre') { openFreePlay(); return true; }
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
