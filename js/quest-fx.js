/* =====================================================================
   CodeKids · quest-fx.js
   Capa visual del Modo Aventura. Traduce ideas de los shaders de Godot
   (tint, scrolling UV, rim, post, flash) a Canvas 2D puro, sin librerías.

   No decide reglas ni mueve al héroe: sólo dibuja. El motor sigue siendo
   quest.js. Respeta el "Modo calma" del app principal (menos partículas,
   movimiento más lento y sin destellos fuertes).
   ===================================================================== */
(function () {
  'use strict';

  var NS = window.CodeKids || (window.CodeKids = {});
  if (NS.QuestFX) return;

  var TAU = Math.PI * 2;

  function now() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }

  function parseHex(hex) {
    var h = String(hex || '#ffffff').replace('#', '');
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16);
    if (!isFinite(n)) n = 0xffffff;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgba(c, a) {
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  /* Mezcla un color con blanco (amt > 0) o con negro (amt < 0). */
  function shade(hex, amt) {
    var c = parseHex(hex);
    var t = amt < 0 ? 0 : 255;
    var k = Math.abs(amt);
    return rgba({
      r: Math.round(lerp(c.r, t, k)),
      g: Math.round(lerp(c.g, t, k)),
      b: Math.round(lerp(c.b, t, k))
    }, 1);
  }

  /* Ruido determinista: mismo mundo = misma "semilla" visual. */
  function seeded(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function calmMode() {
    return !!(document.body && document.body.classList && document.body.classList.contains('calm'));
  }

  var AMBIENT = {
    castillo: 'dust',
    fuego: 'ember',
    bosque: 'leaf',
    final: 'star'
  };

  function create(canvas) {
    var ctx = canvas.getContext('2d');
    var fx = {
      canvas: canvas,
      scene: null,
      world: '',
      kind: 'dust',
      bg: '#2A2440',
      tint: '#FFC94D',
      heroColor: '#5AA9E6',
      calm: calmMode(),
      particles: [],
      sparkles: [],
      tween: null,
      flash: null,
      raf: 0,
      lastT: now(),
      destroyed: false
    };

    fx.buildParticles = function () {
      var count = fx.calm ? 9 : 22;
      var list = [];
      for (var i = 0; i < count; i++) {
        list.push({
          x: seeded(i + 1),
          y: seeded(i + 41),
          speed: 0.018 + seeded(i + 81) * 0.05,
          size: 1.1 + seeded(i + 121) * 2.2,
          phase: seeded(i + 161) * TAU,
          sway: 0.008 + seeded(i + 201) * 0.02
        });
      }
      fx.particles = list;
    };

    /* Lo llama quest-app antes de dibujar: colours del mundo y del héroe. */
    fx.configure = function (world, heroColor, accent, bg) {
      var calm = calmMode();
      world = world || 'castillo';
      if (world !== fx.world || calm !== fx.calm) {
        fx.world = world;
        fx.kind = AMBIENT[world] || 'dust';
        fx.calm = calm;
        fx.buildParticles();
      }
      fx.heroColor = heroColor || fx.heroColor;
      fx.tint = accent || fx.tint;
      fx.bg = bg || fx.bg;
    };

    /* Se llama después de Q.step(): anima el salto de casilla y los golpes. */
    fx.markStep = function (prev, next) {
      if (!prev || !next) return;
      var t = now();
      if (prev.x !== next.x || prev.y !== next.y) {
        fx.tween = { fx: prev.x, fy: prev.y, tx: next.x, ty: next.y, t0: t };
      }
      if (next.hp < prev.hp) {
        fx.flash = { color: { r: 230, g: 80, b: 60 }, t0: t, dur: 360 };
      } else if (next.won && !prev.won) {
        fx.flash = { color: { r: 255, g: 209, b: 102 }, t0: t, dur: 520 };
        fx.burst();
      } else if (next.lost && !prev.lost) {
        fx.flash = { color: { r: 230, g: 80, b: 60 }, t0: t, dur: 460 };
      }
    };

    fx.burst = function () {
      var list = [];
      var count = fx.calm ? 8 : 26;
      for (var i = 0; i < count; i++) {
        list.push({
          x: 0.5 + (seeded(i + 301) - 0.5) * 0.7,
          y: 0.55 + (seeded(i + 331) - 0.5) * 0.35,
          vy: 0.08 + seeded(i + 361) * 0.18,
          vx: (seeded(i + 391) - 0.5) * 0.09,
          life: 0.7 + seeded(i + 421) * 0.5,
          size: 1.6 + seeded(i + 451) * 2.6
        });
      }
      fx.sparkles = list;
    };

    fx.paintBackground = function (w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, shade(fx.bg, 0.16));
      g.addColorStop(1, shade(fx.bg, -0.24));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    /* Equivale al "scrolling UV": el mismo patrón se desplaza con TIME. */
    fx.paintAmbient = function (w, h, t) {
      var tone = parseHex(fx.tint);
      var list = fx.particles;
      var speedScale = fx.calm ? 0.45 : 1;
      ctx.save();
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var x = p.x + Math.sin(t * 0.55 + p.phase) * p.sway;
        var y = p.y - t * p.speed * speedScale;
        if (fx.kind === 'ember') y = p.y - ((t * p.speed * 2.2 * speedScale) % 1.2);
        if (fx.kind === 'leaf') { x += t * 0.02 * speedScale; y += t * 0.012 * speedScale; }
        y = ((y % 1) + 1) % 1;
        x = ((x % 1) + 1) % 1;
        var px = x * w, py = (1 - y) * h;
        var alpha = 0.18 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.6 + p.phase));
        if (fx.kind === 'star') alpha *= 0.6 + 0.4 * Math.sin(t * 2 + p.phase);
        ctx.globalAlpha = Math.max(0.05, alpha) * (fx.calm ? 0.6 : 1);
        ctx.fillStyle = rgba(tone, 1);
        if (fx.kind === 'star') {
          ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    /* Post: viñeta suave, como un shader de pantalla pero en 2D. */
    fx.paintVignette = function (w, h) {
      var r = Math.max(w, h) * 0.72;
      var g = ctx.createRadialGradient(w / 2, h / 2, r * 0.35, w / 2, h / 2, r);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,' + (fx.calm ? 0.2 : 0.34) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    fx.paintFlash = function (t) {
      if (!fx.flash) return;
      var age = (t - fx.flash.t0) / fx.flash.dur;
      if (age >= 1) { fx.flash = null; return; }
      var a = (1 - age) * (fx.calm ? 0.12 : 0.28);
      ctx.fillStyle = rgba(fx.flash.color, a);
      ctx.fillRect(0, 0, fx.canvas.width, fx.canvas.height);
    };

    fx.paintSparkles = function (dt) {
      if (!fx.sparkles.length) return;
      var tone = parseHex(fx.heroColor);
      ctx.save();
      for (var i = fx.sparkles.length - 1; i >= 0; i--) {
        var s = fx.sparkles[i];
        s.x += s.vx * dt;
        s.y -= s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) { fx.sparkles.splice(i, 1); continue; }
        ctx.globalAlpha = clamp01(s.life) * (fx.calm ? 0.5 : 0.9);
        ctx.fillStyle = rgba(tone, 1);
        ctx.beginPath();
        ctx.arc(s.x * fx.canvas.width, s.y * fx.canvas.height, s.size, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    };

    fx.heroGrid = function (t) {
      if (!fx.tween) return null;
      var dur = fx.calm ? 140 : 200;
      var u = clamp01((t - fx.tween.t0) / dur);
      var e = ease(u);
      var p = {
        x: lerp(fx.tween.fx, fx.tween.tx, e),
        y: lerp(fx.tween.fy, fx.tween.ty, e)
      };
      if (u >= 1) fx.tween = null;
      return p;
    };

    fx.render = function () {
      if (fx.destroyed) return;
      if (!fx.canvas.isConnected) { fx.destroy(); return; }
      var t = now();
      var dt = Math.min(0.05, (t - fx.lastT) / 1000);
      fx.lastT = t;
      var w = fx.canvas.width, h = fx.canvas.height;

      fx.paintBackground(w, h);
      if (fx.scene) fx.scene(ctx, fx.heroGrid(t), t);
      /* Las partículas van encima: si se pintan antes, los mosaicos las tapan. */
      fx.paintAmbient(w, h, t / 1000);
      fx.paintVignette(w, h);
      fx.paintFlash(t);
      fx.paintSparkles(dt);

      if (fx.raf) {
        if (window.cancelAnimationFrame) window.cancelAnimationFrame(fx.raf);
        fx.raf = 0;
      }
      if (window.requestAnimationFrame) fx.raf = window.requestAnimationFrame(fx.render);
    };

    fx.destroy = function () {
      fx.destroyed = true;
      if (fx.raf && window.cancelAnimationFrame) window.cancelAnimationFrame(fx.raf);
      fx.raf = 0;
      fx.scene = null;
      fx.sparkles = [];
      fx.tween = null;
      fx.flash = null;
    };

    fx.buildParticles();
    return fx;
  }

  NS.QuestFX = { create: create };
})();
