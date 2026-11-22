/* =====================================================================
   CodeKids · quest-app.js
   Interfaz del Modo Aventura: selector de 8 mundos, héroe armado por
   partes, reglas SI → ACCIÓN en bloques o Python y tablero Canvas 2D.
   Depende de quest.js. No modifica el motor de los retos clásicos.
   ===================================================================== */
(function () {
  'use strict';

  var Q = window.CodeKids && window.CodeKids.Quest;
  if (!Q) return;
  var QFX = window.CodeKids && window.CodeKids.QuestFX; /* capa visual opcional */

  var HERO_KEY = 'codekids.hero.v1';
  var PROGRESS_KEY = 'codekids.quest.v1';

  var HEADS = [
    { name: 'Explorador', face: '🙂', hat: false },
    { name: 'Valiente', face: '😎', hat: false },
    { name: 'Mago', face: '🧙', hat: true },
    { name: 'Robot', face: '🤖', hat: false }
  ];
  var BODIES = [
    { name: 'Traje', shape: 'suit' },
    { name: 'Armadura', shape: 'armor' },
    { name: 'Capa', shape: 'cape' },
    { name: 'Astronauta', shape: 'space' }
  ];
  var GEARS = [
    { name: 'Ninguno', icon: '·' },
    { name: 'Escudo', icon: '🛡️' },
    { name: 'Espada', icon: '⚔️' },
    { name: 'Mochila', icon: '🎒' }
  ];
  var COLORS = [
    { name: 'Coral', value: '#FF6B4A' },
    { name: 'Menta', value: '#3FC1A0' },
    { name: 'Cielo', value: '#5AA9E6' },
    { name: 'Lavanda', value: '#9B8CF0' }
  ];

  var PALETTES = {
    castillo: { bg: '#2A2440', floor: '#5D5470', wall: '#3A3450', accent: '#FFC94D', hazard: '#E46B4A' },
    fuego: { bg: '#3A1E22', floor: '#7A3B32', wall: '#5A2626', accent: '#FF8A3D', hazard: '#FF5A36' },
    bosque: { bg: '#17332A', floor: '#3F7A5A', wall: '#24523C', accent: '#A6F0D8', hazard: '#E46B4A' },
    final: { bg: '#241B3A', floor: '#6B5A9A', wall: '#453672', accent: '#FFD166', hazard: '#FF6B8A' }
  };

  var S = {
    stageIndex: 0,
    stage: null,
    rules: [],
    mode: 'blocks',
    state: null,
    timer: null,
    running: false,
    finished: false,
    hero: loadHero(),
    progress: loadProgress(),
    modal: null,
    fx: null
  };

  function loadHero() {
    try {
      var p = JSON.parse(localStorage.getItem(HERO_KEY) || 'null');
      if (p && typeof p === 'object') {
        return {
          name: typeof p.name === 'string' ? p.name.slice(0, 14) : 'Héroe',
          head: clamp(p.head, 0, HEADS.length - 1), body: clamp(p.body, 0, BODIES.length - 1),
          gear: clamp(p.gear, 0, GEARS.length - 1), color: clamp(p.color, 0, COLORS.length - 1)
        };
      }
    } catch (e) { /* perfil nuevo */ }
    return { name: 'Héroe', head: 0, body: 0, gear: 0, color: 0 };
  }

  function loadProgress() {
    try {
      var p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
      if (p && Array.isArray(p.cleared)) return { cleared: p.cleared };
    } catch (e) { /* perfil nuevo */ }
    return { cleared: [] };
  }

  function saveHero() { try { localStorage.setItem(HERO_KEY, JSON.stringify(S.hero)); } catch (e) {} }
  function saveProgress() { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(S.progress)); } catch (e) {} }
  function clamp(v, a, b) { v = Number(v); return isFinite(v) ? Math.max(a, Math.min(b, Math.floor(v))) : a; }
  function hexA(hex, a) {
    var h = String(hex || '#ffffff').replace('#', '');
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16);
    if (!isFinite(n)) return 'rgba(255,255,255,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    if (!Array.isArray(kids)) kids = (kids === null || kids === undefined) ? [] : [kids];
    kids.forEach(function (c) {
      if (!c && c !== 0) return;
      n.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return n;
  }

  function overlay(node) {
    closeOverlay();
    var ov = el('div', { class: 'q-overlay' }, [node]);
    document.body.appendChild(ov);
    S.modal = ov;
    var first = $('button', ov);
    if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 40);
    return ov;
  }

  function closeOverlay() {
    if (S.modal && S.modal.parentNode) S.modal.parentNode.removeChild(S.modal);
    S.modal = null;
  }

  /* ==================================================================
     DIBUJO 2D EN CANVAS
     ================================================================== */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTile(ctx, t, px, py, tw, th, pal) {
    if (t === '#') {
      ctx.fillStyle = pal.wall;
      ctx.fillRect(px, py, tw, th);
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(px + 2, py + 2, tw - 4, 4);
      ctx.globalAlpha = 1;
      return;
    }
    ctx.fillStyle = pal.floor;
    ctx.fillRect(px, py, tw, th);
    ctx.strokeStyle = 'rgba(0,0,0,.12)';
    ctx.strokeRect(px + 0.5, py + 0.5, tw - 1, th - 1);

    var cx = px + tw / 2, cy = py + th / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = Math.floor(tw * 0.62) + 'px system-ui, sans-serif';
    if (t === 'E') ctx.fillText('👾', cx, cy);
    else if (t === 'F') ctx.fillText('🔥', cx, cy);
    else if (t === 'B') {
      ctx.fillStyle = pal.wall;
      ctx.fillRect(px, py, tw, th * 0.42);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(px + 3, py + th * 0.42 - 3, tw - 6, 3);
    } else if (t === 'K') ctx.fillText('🔑', cx, cy);
    else if (t === 'M') ctx.fillText('💊', cx, cy);
    else if (t === 'P') ctx.fillText('🧍', cx, cy);
    else if (t === 'D') {
      ctx.fillStyle = pal.accent;
      roundRect(ctx, px + tw * 0.18, py + th * 0.12, tw * 0.64, th * 0.88, 6);
      ctx.fill();
      ctx.fillStyle = '#2A2440';
      roundRect(ctx, px + tw * 0.28, py + th * 0.3, tw * 0.44, th * 0.7, 4);
      ctx.fill();
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(px + tw * 0.64, py + th * 0.66, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHero(ctx, hero, px, py, tw, th, dir, jumping, glowColor) {
    var pal = COLORS[hero.color];
    var flip = dir === 2 || dir === 3;
    var lift = jumping ? th * 0.28 : 0;
    ctx.save();
    /* Rim suave: el mismo color del héroe lo recorta del fondo. */
    if (glowColor) {
      var gx = px + tw / 2, gy = py + th * 0.52;
      var gr = ctx.createRadialGradient(gx, gy, 1, gx, gy, tw * 0.72);
      gr.addColorStop(0, hexA(glowColor, 0.5));
      gr.addColorStop(1, hexA(glowColor, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(gx - tw, gy - th, tw * 2, th * 2);
    }
    if (flip) { ctx.translate(px * 2 + tw, 0); ctx.scale(-1, 1); }
    if (jumping) {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath();
      ctx.ellipse(px + tw / 2, py + th * 0.95, tw * 0.28, th * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    var bx = px + tw * 0.26, by = py + th * 0.38 - lift, bw = tw * 0.48, bh = th * 0.4;

    if (hero.body === 2) {
      ctx.fillStyle = pal.value;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.7, by + 2);
      ctx.lineTo(bx + bw * 1.25, by + bh);
      ctx.lineTo(bx + bw * 0.7, by + bh);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = pal.value;
    roundRect(ctx, bx, by, bw, bh, Math.min(10, bw / 3));
    ctx.fill();
    if (hero.body === 1) {
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by + 3);
      ctx.lineTo(bx + bw / 2, by + bh - 3);
      ctx.stroke();
    } else if (hero.body === 3) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath();
      ctx.arc(bx + bw * 0.72, by + bh * 0.42, bw * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    var hx = px + tw / 2, hy = py + th * 0.32 - lift, hr = tw * 0.21;
    ctx.fillStyle = '#F6C8A0';
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#26232E';
    ctx.beginPath(); ctx.arc(hx + hr * 0.38, hy - hr * 0.1, 1.8, 0, Math.PI * 2); ctx.fill();
    if (HEADS[hero.head].hat) {
      ctx.fillStyle = pal.value;
      ctx.beginPath();
      ctx.moveTo(hx - hr * 1.2, hy - hr * 0.6);
      ctx.lineTo(hx, hy - hr * 2.5);
      ctx.lineTo(hx + hr * 1.2, hy - hr * 0.6);
      ctx.closePath(); ctx.fill();
    } else if (hero.head === 1) {
      ctx.fillStyle = '#26232E';
      ctx.fillRect(hx - hr, hy - hr * 1.25, hr * 2, hr * 0.55);
    }

    if (hero.gear === 1) {
      ctx.fillStyle = '#EADFCB';
      ctx.beginPath();
      ctx.arc(bx - 2, by + bh * 0.55, bw * 0.28, 0, Math.PI * 2);
      ctx.fill();
    } else if (hero.gear === 2) {
      ctx.strokeStyle = '#EADFCB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + bw + 2, by + bh);
      ctx.lineTo(bx + bw + 10, by - bh * 0.4);
      ctx.stroke();
    } else if (hero.gear === 3) {
      ctx.fillStyle = '#B5834A';
      roundRect(ctx, bx - bw * 0.35, by + 2, bw * 0.34, bh * 0.8, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBoard() {
    var canvas = $('#quest-canvas');
    if (!canvas || !S.state) return;
    var grid = S.state.grid;
    var rows = grid.length, cols = grid[0].length;
    var pal = PALETTES[S.stage.world] || PALETTES.castillo;
    var tw = Math.floor(canvas.width / cols);
    var th = Math.floor(canvas.height / rows);
    var ox = Math.floor((canvas.width - tw * cols) / 2);
    var oy = Math.floor((canvas.height - th * rows) / 2);
    var heroColor = (COLORS[S.hero.color] || COLORS[0]).value;

    var paintScene = function (ctx, heroGrid) {
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          drawTile(ctx, grid[y][x], ox + x * tw, oy + y * th, tw, th, pal);
        }
      }
      var hx = heroGrid ? heroGrid.x : S.state.x;
      var hy = heroGrid ? heroGrid.y : S.state.y;
      drawHero(ctx, S.hero, ox + hx * tw, oy + hy * th, tw, th, S.state.dir, !!S.state.jumpFx, heroColor);
      if (S.state.shotFx) {
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ox + (hx + 0.5) * tw, oy + (hy + 0.5) * th);
        ctx.lineTo(ox + (S.state.shotFx.x + 0.5) * tw, oy + (S.state.shotFx.y + 0.5) * th);
        ctx.stroke();
      }
    };

    var fx = ensureFX(canvas);
    if (!fx) {
      /* Sin la capa visual el tablero sigue funcionando igual que antes. */
      var plain = canvas.getContext('2d');
      plain.fillStyle = pal.bg;
      plain.fillRect(0, 0, canvas.width, canvas.height);
      paintScene(plain, null);
      return;
    }
    fx.configure(S.stage.world, heroColor, pal.accent, pal.bg);
    fx.scene = paintScene;
    fx.render();
  }

  function ensureFX(canvas) {
    if (!QFX) return null;
    if (!S.fx || S.fx.canvas !== canvas || S.fx.destroyed) {
      destroyFX();
      S.fx = QFX.create(canvas);
    }
    return S.fx;
  }

  function destroyFX() {
    if (!S.fx) return;
    try { S.fx.destroy(); } catch (e) {}
    S.fx = null;
  }

  function runSnapshot() {
    if (!S.state) return null;
    return { x: S.state.x, y: S.state.y, hp: S.state.hp, won: !!S.state.won, lost: !!S.state.lost };
  }

  function markFX(prev) {
    if (S.fx && prev) S.fx.markStep(prev, runSnapshot());
  }

  /* ==================================================================
     PANTALLA 1 — ELEGIR MUNDO + ARMAR HÉROE
     ================================================================== */
  function heroBuilder() {
    function picker(label, list, key, renderItem) {
      var row = el('div', { class: 'q-hero-row' }, [el('span', { class: 'q-hero-label', text: label })]);
      var opts = el('div', { class: 'q-hero-opts' });
      list.forEach(function (item, i) {
        var safeRender = item && typeof renderItem === 'function' ? renderItem(item, i) : '';
        var b = el('button', {
          class: 'q-hero-opt' + (S.hero[key] === i ? ' is-on' : ''),
          type: 'button', title: item && item.name ? item.name : '',
          'aria-label': label + ': ' + (item && item.name ? item.name : ''),
          'aria-pressed': S.hero[key] === i ? 'true' : 'false',
          onclick: function () {
            S.hero[key] = i;
            saveHero();
            /* Actualizamos sólo esta fila: no reconstruimos la pantalla para
               no perder el nombre escrito ni el scroll. Antes había aquí una
               llamada a render() que en realidad invocaba al renderizador
               del emoji con it === undefined y rompía la selección. */
            Array.prototype.forEach.call(opts.children, function (btn, j) {
              var on = j === i;
              btn.classList.toggle('is-on', on);
              btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
          }
        }, [safeRender]);
        opts.appendChild(b);
      });
      row.appendChild(opts);
      return row;
    }

    var panel = el('div', { class: 'q-builder' }, [
      el('h2', {}, '🧒 Arma a tu héroe'),
      el('label', { class: 'q-name-label' }, [
        el('span', {}, 'Nombre: '),
        el('input', {
          class: 'q-hero-name', type: 'text', maxlength: '14',
          value: S.hero.name, 'aria-label': 'Nombre del héroe',
          oninput: function (e) { S.hero.name = e.target.value.slice(0, 14); saveHero(); }
        })
      ]),
      picker('Cabeza', HEADS, 'head', function (it) { return it.face; }),
      picker('Cuerpo', BODIES, 'body', function (it, i) { return ['👕', '🛡️', '🥋', '🚀'][i]; }),
      picker('Accesorio', GEARS, 'gear', function (it) { return it.icon; }),
      picker('Color', COLORS, 'color', function (it) {
        return el('span', { class: 'q-swatch', style: 'background:' + it.value, title: it.name });
      })
    ]);
    return panel;
  }

  function renderSelect() {
    var host = $('#quest-root');
    if (!host) return;
    destroyFX();
    clear(host);
    hideOtherViews();

    host.appendChild(el('div', { class: 'q-topbar' }, [
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Volver al inicio', onclick: goHome }, '←'),
      el('div', {}, [
        el('p', { class: 'eyebrow' }, 'MODO AVENTURA'),
        el('h1', { class: 'topbar__title' }, 'Elige tu mundo')
      ]),
      el('span', { class: 'q-badge' }, S.progress.cleared.length + ' / ' + Q.STAGES.length + ' mundos')
    ]));

    var layout = el('div', { class: 'q-select-layout' }, [
      heroBuilder(),
      el('div', { class: 'q-stage-list' })
    ]);
    var list = $('.q-stage-list', layout);

    Q.STAGES.forEach(function (stage, i) {
      var done = S.progress.cleared.indexOf(stage.id) >= 0;
      var unlocked = i === 0 || S.progress.cleared.indexOf(Q.STAGES[i - 1].id) >= 0;
      /* Sin aria-label: el texto visible ya nombra el mundo. El estado se
         añade como texto oculto para lectores de pantalla. */
      var card = el('button', {
        class: 'q-stage-card' + (done ? ' is-done' : '') + (unlocked ? '' : ' is-locked'),
        type: 'button',
        onclick: function () {
          if (!unlocked) { toast('Termina el mundo anterior para desbloquear este.'); return; }
          openStage(i);
        }
      }, [
        el('span', { class: 'q-stage-emoji' }, stage.emoji),
        el('span', { class: 'q-stage-body' }, [
          el('b', {}, (i + 1) + '. ' + stage.name),
          el('small', {}, stage.brief.slice(0, 78) + '…'),
          el('span', { class: 'q-stage-meta' }, stage.mode === 'blocks' ? '🧩 Bloques' : stage.mode === 'both' ? '🧩 + 🐍' : '🐍 Código')
        ]),
        el('span', { class: 'q-stage-go' }, done ? '✓' : unlocked ? '›' : '🔒'),
        done ? el('span', { class: 'q-sr-only' }, '. Completado.') : null,
        !unlocked ? el('span', { class: 'q-sr-only' }, '. Bloqueado.') : null
      ]);
      list.appendChild(card);
    });

    host.appendChild(layout);
    host.appendChild(el('p', { class: 'q-footnote' }, 'Primero juegas con bloques. En los últimos mundos escribes las reglas con palabras de Python.'));
  }

  /* ==================================================================
     PANTALLA 2 — JUGAR
     ================================================================== */
  function openStage(index) {
    destroyFX();
    stop();
    S.stageIndex = index;
    S.stage = Q.STAGES[index];
    S.mode = S.stage.mode === 'text' ? 'text' : 'blocks';
    S.rules = starterRules(S.stage);
    S.state = Q.createRun(S.stage, S.hero);
    S.finished = false;
    location.hash = '#/aventura/' + S.stage.id;
    renderPlay();
  }

  function starterRules(stage) {
    var first = stage.sensors[0];
    var action = stage.actions.indexOf('avanzar') >= 0 ? 'avanzar' : stage.actions[0];
    return [{ when: first, do: [action] }];
  }

  function hideOtherViews() {
    Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) {
      if (v.id !== 'view-quest') v.hidden = true;
    });
    var q = $('#view-quest');
    if (q) q.hidden = false;
  }

  function goHome() {
    destroyFX();
    stop();
    closeOverlay();
    var q = $('#view-quest');
    if (q) q.hidden = true;
    var home = $('#view-home');
    if (home) home.hidden = false;
    location.hash = '';
    window.dispatchEvent(new Event('hashchange'));
    window.scrollTo(0, 0);
  }

  var TILE_NAMES = {
    E: '👾 Guardia', F: '🔥 Fuego', B: '⬇️ Techo bajo',
    K: '🔑 Llave', M: '💊 Medicina', P: '🧍 Persona perdida', D: '🚪 Puerta'
  };

  function obstacleLegend(stage) {
    var seen = {}, found = [];
    stage.grid.join('').split('').forEach(function (t) {
      if (TILE_NAMES[t] && !seen[t]) { seen[t] = true; found.push(TILE_NAMES[t]); }
    });
    var host = el('div', { class: 'q-legend' });
    host.appendChild(el('b', {}, 'En este mundo ves: '));
    found.forEach(function (name) { host.appendChild(el('span', {}, name)); });
    return host;
  }

  function renderPlay() {
    var host = $('#quest-root');
    if (!host || !S.stage) return;
    clear(host);
    hideOtherViews();
    var stage = S.stage;

    host.appendChild(el('div', { class: 'q-topbar' }, [
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Elegir otro mundo', onclick: renderSelect }, '←'),
      el('div', {}, [
        el('p', { class: 'eyebrow' }, 'Mundo ' + (S.stageIndex + 1) + ' de ' + Q.STAGES.length + ' · ' + stage.emoji + ' ' + (stage.world === 'castillo' ? 'Castillo' : stage.world === 'fuego' ? 'Fuego' : stage.world === 'bosque' ? 'Bosque' : 'Torre final')),
        el('h1', { class: 'topbar__title' }, stage.name)
      ]),
      el('span', { class: 'q-badge' }, '❤️ ' + S.state.hp + ' / ' + S.state.maxHp)
    ]));

    var left = el('div', { class: 'q-panel q-left' }, [
      el('h2', { class: 'q-section-title' }, '📜 La misión'),
      el('p', { class: 'q-brief' }, stage.brief),
      obstacleLegend(stage),
      el('canvas', { id: 'quest-canvas', width: '640', height: '240', class: 'q-canvas' }),
      el('div', { class: 'q-sensors' }),
      el('p', { class: 'q-log', id: 'quest-log', role: 'status', 'aria-live': 'polite' }, 'Arma tus reglas y toca Ejecutar.')
    ]);

    var right = el('div', { class: 'q-panel q-right' }, [
      el('div', { class: 'q-mode-switch' }, [
        el('button', {
          class: 'chip' + (S.mode === 'blocks' ? ' is-on' : ''), type: 'button',
          'aria-pressed': S.mode === 'blocks' ? 'true' : 'false',
          onclick: function () { if (S.mode !== 'blocks') { var p = Q.parsePython($('#quest-python').value); if (p.errors.length) { toast('Corrige el código antes de cambiar.'); return; } S.rules = p.rules; } S.mode = 'blocks'; renderPlay(); }
        }, '🧩 Bloques'),
        el('button', {
          class: 'chip' + (S.mode === 'text' ? ' is-on' : ''), type: 'button',
          'aria-pressed': S.mode === 'text' ? 'true' : 'false',
          onclick: function () { S.mode = 'text'; renderPlay(); }
        }, '🐍 Código')
      ]),
      el('div', { class: 'q-rules' })
    ]);

    if (S.mode === 'blocks') renderBlockEditor($('.q-rules', right));
    else renderTextEditor($('.q-rules', right));

    right.appendChild(el('div', { class: 'q-controls' }, [
      el('button', { class: 'btn btn--primary', type: 'button', onclick: play, id: 'quest-run' }, '▶ Ejecutar'),
      el('button', { class: 'btn btn--soft', type: 'button', onclick: singleStep }, '⏭ Paso'),
      el('button', { class: 'btn btn--soft', type: 'button', onclick: function () { S.state = Q.createRun(S.stage, S.hero); S.finished = false; renderPlay(); } }, '↺ Reiniciar')
    ]));

    host.appendChild(el('div', { class: 'q-play-layout' }, [left, right]));
    drawBoard();
    renderSensors();
  }

  function renderBlockEditor(host) {
    clear(host);
    host.appendChild(el('h2', { class: 'q-section-title' }, '⚙️ Tus reglas'));
    host.appendChild(el('p', { class: 'q-hint' }, 'El héroe lee las reglas de arriba hacia abajo y obedece la primera que pueda.'));

    S.rules.forEach(function (rule, i) {
      var sensorSel = el('select', { class: 'q-select', 'aria-label': 'Sensor de la regla ' + (i + 1), onchange: function (e) { rule.when = e.target.value; } });
      S.stage.sensors.forEach(function (id) {
        var meta = findById(Q.SENSORS, id);
        sensorSel.appendChild(el('option', { value: id }, meta ? meta.icon + ' ' + meta.label : id));
      });
      sensorSel.value = rule.when;

      var actionSel = el('select', { class: 'q-select', 'aria-label': 'Acción de la regla ' + (i + 1), onchange: function (e) { rule.do = [e.target.value]; } });
      S.stage.actions.forEach(function (id) {
        var meta = findById(Q.ACTIONS, id);
        actionSel.appendChild(el('option', { value: id }, meta ? meta.icon + ' ' + meta.label : id));
      });
      actionSel.value = rule.do[0];

      host.appendChild(el('div', { class: 'q-rule' + (S.state.lastRule === i ? ' is-active' : '') }, [
        el('span', { class: 'q-rule-n' }, String(i + 1)),
        el('span', { class: 'q-rule-if' }, 'SI'),
        sensorSel,
        el('span', { class: 'q-rule-arrow' }, '→'),
        actionSel,
        el('button', {
          class: 'q-del', type: 'button', 'aria-label': 'Borrar regla ' + (i + 1),
          onclick: function () { S.rules.splice(i, 1); renderPlay(); }
        }, '🗑')
      ]));
    });

    host.appendChild(el('button', {
      class: 'btn btn--soft q-add', type: 'button',
      onclick: function () {
        var sensor = S.stage.sensors[S.rules.length % S.stage.sensors.length];
        var action = S.stage.actions.indexOf('avanzar') >= 0 ? 'avanzar' : S.stage.actions[0];
        S.rules.push({ when: sensor, do: [action] });
        renderPlay();
      }
    }, '＋ Agregar regla'));
  }

  function renderTextEditor(host) {
    clear(host);
    host.appendChild(el('h2', { class: 'q-section-title' }, '🐍 Escribe tus reglas'));
    host.appendChild(el('p', { class: 'q-hint' }, 'Escribe "si chispa.algo():" y debajo, con 4 espacios, qué debe hacer.'));
    var area = el('textarea', { id: 'quest-python', class: 'q-python', spellcheck: 'false', 'aria-label': 'Reglas en Python' });
    area.value = Q.rulesToPython(S.rules);
    area.addEventListener('input', function () {
      var p = Q.parsePython(area.value);
      var box = $('#quest-python-status');
      if (p.errors.length) {
        box.hidden = false;
        box.textContent = '⚠️ Línea ' + p.errors[0].line + ': ' + p.errors[0].text;
        S.codeError = true;
      } else {
        box.hidden = true;
        S.rules = p.rules;
        S.codeError = false;
      }
    });
    host.appendChild(area);
    host.appendChild(el('p', { class: 'q-status', id: 'quest-python-status', hidden: 'hidden' }));
    host.appendChild(el('p', { class: 'q-hint' }, 'Sensores disponibles: ' + S.stage.sensors.map(function (s) { return 'chispa.' + s + '()'; }).join(', ')));
    host.appendChild(el('p', { class: 'q-hint' }, 'Acciones: ' + S.stage.actions.map(function (a) { return 'chispa.' + a + '()'; }).join(', ')));
  }

  function renderSensors() {
    var host = $('.q-sensors');
    if (!host) return;
    clear(host);
    S.stage.sensors.forEach(function (id) {
      var on = Q.sensorValue(S.state, id);
      var meta = findById(Q.SENSORS, id);
      host.appendChild(el('span', {
        class: 'q-sensor' + (on ? ' is-on' : ''),
        title: meta ? meta.label : id
      }, (meta ? meta.icon : '·') + ' ' + id.replace(/_/g, ' ')));
    });
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ==================================================================
     EJECUCIÓN
     ================================================================== */
  function singleStep() {
    if (!S.state || S.finished) return;
    var errs = Q.validateRules(S.stage, S.rules);
    if (errs.length) { toast(errs[0]); return; }
    var prev = runSnapshot();
    Q.step(S.state, S.stage, S.rules);
    markFX(prev);
    refreshRun();
    if (S.state.won || S.state.lost) finish();
  }

  function refreshRun() {
    drawBoard();
    renderSensors();
    var log = $('#quest-log');
    if (log) log.textContent = S.state.log.join(' ') || 'Pensando…';
    var badge = $('.q-badge');
    if (badge) badge.textContent = '❤️ ' + S.state.hp + ' / ' + S.state.maxHp;
    Array.prototype.forEach.call(document.querySelectorAll('.q-rule'), function (n, i) {
      n.classList.toggle('is-active', i === S.state.lastRule);
    });
  }

  function play() {
    if (S.running) { stop(); return; }
    if (S.finished) return;
    var errs = Q.validateRules(S.stage, S.rules);
    if (errs.length) { toast(errs[0]); return; }
    S.running = true;
    var btn = $('#quest-run');
    if (btn) btn.textContent = '⏸ Pausar';
    S.timer = setInterval(function () {
      if (!S.state || S.finished) { stop(); return; }
      var prev = runSnapshot();
      Q.step(S.state, S.stage, S.rules);
      markFX(prev);
      refreshRun();
      if (S.state.won || S.state.lost) { stop(); finish(); }
    }, 520);
  }

  function stop() {
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
    S.running = false;
    var btn = $('#quest-run');
    if (btn) btn.textContent = '▶ Ejecutar';
  }

  function finish() {
    S.finished = true;
    var won = S.state.won;
    if (won && S.progress.cleared.indexOf(S.stage.id) < 0) {
      S.progress.cleared.push(S.stage.id);
      saveProgress();
    }
    var last = S.stageIndex === Q.STAGES.length - 1;
    overlay(el('div', { class: 'q-modal' }, [
      el('p', { class: 'eyebrow' }, won ? 'MISIÓN CUMPLIDA' : 'INTÉNTALO OTRA VEZ'),
      el('h2', {}, won ? (last ? '👑 ¡Dueño de la torre!' : '🎉 ¡Lo lograste!') : '💥 El héroe se cansó'),
      el('p', { class: 'q-modal-lead' }, won ? S.stage.praise : 'Tu héroe perdió todas las vidas. Mira qué regla falló y cambia una sola cosa.'),
      el('div', { class: 'q-modal-stats' }, [
        el('span', {}, 'Pasos: ' + S.state.steps),
        el('span', {}, 'Vidas: ' + S.state.hp),
        el('span', {}, 'Llaves: ' + S.state.keys)
      ]),
      el('div', { class: 'q-modal-actions' }, [
        won && !last ? el('button', {
          class: 'btn btn--primary', type: 'button',
          onclick: function () { closeOverlay(); openStage(S.stageIndex + 1); }
        }, 'Siguiente mundo ›') : null,
        el('button', {
          class: 'btn btn--soft', type: 'button',
          onclick: function () {
            closeOverlay();
            S.state = Q.createRun(S.stage, S.hero);
            S.finished = false;
            renderPlay();
          }
        }, '↺ Jugar otra vez'),
        el('button', { class: 'btn btn--ghost', type: 'button', onclick: function () { closeOverlay(); renderSelect(); } }, 'Elegir otro mundo')
      ])
    ]));
  }

  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }

  /* ==================================================================
     INTEGRACIÓN
     ================================================================== */
  function open(stageId) {
    hideOtherViews();
    if (stageId) {
      var stage = Q.findStage(stageId);
      if (stage) {
        /* openStage() escribe el hash y eso dispara hashchange. Si no lo
           ignoramos, el router vuelve a entrar y pierde las reglas que el
           niño acaba de escribir. */
        if (S.stage && S.stage.id === stage.id) return;
        openStage(Q.STAGES.indexOf(stage));
        return;
      }
    }
    renderSelect();
  }

  window.CodeKids = window.CodeKids || {};
  window.CodeKids.QuestApp = {
    open: open,
    renderSelect: renderSelect,
    stop: stop
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.modal) { closeOverlay(); }
  });

  /* Si se abre directo con #/aventura, el router de app.js delega aquí. */
  if (String(location.hash || '').indexOf('#/aventura') === 0) {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    setTimeout(function () { open(parts[1]); }, 0);
  }
})();
