/* Verificación en navegador real (Chrome + protocolo DevTools).
   Uso:  node tools/browser-check.mjs
   Hace lo que haría un niño: elige una lección, agrega bloques, ejecuta,
   responde la predicción y mira el resultado. Falla si hay errores de JS.
   Deja capturas en shots/. */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = pathToFileURL(path.join(ROOT, 'index.html')).href;
const SHOTS = path.join(ROOT, 'shots');
const PORT = 9337;
const profile = path.join(ROOT, '.chrome-check');

const require = createRequire(import.meta.url);
require('../js/engine.js'); // missions.js espera CodeKids.Engine en globalThis
const { LESSONS } = require('../js/lessons.js');
const { MISSIONS } = require('../js/missions.js');
const { exercises: EXAM_EXERCISES } = require('../js/exam.js');

let pass = 0, fail = 0;
const errors = [];

function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  ->  ' + JSON.stringify(extra) : '')); }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitFor(fn, timeout = 8000, every = 100) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    try { const v = await fn(); if (v) return v; } catch (e) { /* sigue */ }
    await sleep(every);
  }
  return false;
}

/* ---------- localizar el navegador ---------- */
function findChrome() {
  const known = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  const fromEnv = [
    process.env.CHROME_PATH, process.env.CHROME, process.env.CHROME_BIN,
    process.env.CHROMIUM_PATH, process.env.MSEDGE_PATH, process.env.EDGE_PATH
  ];
  const commands = ['chrome', 'chrome.exe', 'msedge', 'google-chrome', 'chromium'];

  for (const candidate of [...known, ...fromEnv, ...commands]) {
    if (!candidate) continue;
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (fs.existsSync(candidate)) return candidate;
    } else {
      const probe = spawnSync(candidate, ['--version'], { stdio: 'ignore', windowsHide: true });
      if (!probe.error && probe.status === 0) return candidate;
    }
  }
  throw new Error('No se encontró Chrome/Edge. Instalá Chrome o definí CHROME_PATH con la ruta al ejecutable.');
}

/* ---------- estado compartido (para limpiar siempre) ---------- */
let chrome = null;
let ws = null;
let msgId = 0;
const pending = new Map();

function rejectPending(reason) {
  for (const { rej } of pending.values()) rej(reason);
  pending.clear();
}

async function cleanup(code) {
  pending.clear();
  try { if (ws && ws.readyState === 1) ws.close(); } catch (e) { }
  try { if (chrome) chrome.kill(); } catch (e) { }
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { }
  process.exitCode = code;
}

/* ---------- cliente CDP ---------- */
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function js(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true, userGesture: true
  });
  if (r.exceptionDetails) {
    errors.push(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return null;
  }
  return r.result.value;
}

async function waitForSelector(selector, timeout = 8000) {
  const found = await waitFor(() => js(`!!document.querySelector(${JSON.stringify(selector)})`), timeout);
  if (!found) throw new Error('No apareció el selector ' + selector);
}

async function goto(hash, selector = '#app') {
  const expected = hash || '';
  await send('Page.navigate', { url: BASE + expected });
  /* Con file:// no siempre llega Page.loadEventFired, así que esperamos a que
     el documento esté listo Y a que el router haya aplicado el hash pedido. */
  const ready = await waitFor(async () => {
    const state = await js('document.readyState');
    const current = await js('location.hash');
    return state === 'complete' && current === expected;
  }, 15000);
  if (!ready) throw new Error('Timeout esperando la carga de la página');
  await waitForSelector(selector);
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64'));
}

/* ---------- cuerpo principal ---------- */
try {
  const CHROME = findChrome();
  fs.mkdirSync(SHOTS, { recursive: true });
  chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--disable-crash-reporter', '--disable-extensions', '--mute-audio',
    '--user-data-dir=' + profile,
    '--remote-debugging-port=' + PORT,
    '--window-size=1280,900',
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  const ready = await waitFor(async () => {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await r.json();
    const page = list.find(t => t.type === 'page');
    if (page && page.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; return true; }
    return false;
  }, 15000);

  if (!ready) throw new Error('No se pudo conectar con Chrome');

  ws = new WebSocket(wsUrl);
  ws.onclose = () => rejectPending(new Error('Conexión WebSocket cerrada'));
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(JSON.stringify(m.error)));
      else res(m.result);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push(d.exception ? (d.exception.description || d.text) : d.text);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    }
  };

  await new Promise((res, rej) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      rej(new Error('Timeout al conectar con el WebSocket de Chrome'));
    }, 10000);
    ws.onopen = () => { if (done) return; done = true; clearTimeout(timer); res(); };
    ws.onerror = () => { if (done) return; done = true; clearTimeout(timer); rej(new Error('Error al conectar con el WebSocket de Chrome')); };
  });

  await send('Page.enable');
  await send('Page.setLifecycleEventsEnabled', { enabled: true });
  await send('Runtime.enable');

  console.log('\n== CodeKids · prueba en navegador ==\n');

  /* ---------- 1. Inicio ---------- */
  await goto('', '.lesson-card');
  const lessonCount = await js('document.querySelectorAll(".lesson-card").length');
  ok('el inicio carga ' + LESSONS.length + ' lecciones', lessonCount === LESSONS.length, lessonCount);
  const missionCount = await js(`(function(){
    var p = document.querySelector('.lesson-list .section-head p');
    if (!p) return -1;
    var parts = p.textContent.split(' ');
    return Number(parts[parts.length - 3]);
  })()`);
  ok('el inicio ofrece ' + MISSIONS.length + ' retos', missionCount === MISSIONS.length, missionCount);
  ok('hay botón de continuar', await js('!!document.querySelector("#continue-btn")'));
  ok('el nombre se puede escribir', await js('!!document.querySelector("#kid-name")'));

  /* ---------- 2. Lección: pestañas ---------- */
  await goto('#/leccion/l2/0', '.lesson-tab');
  ok('la pestaña Lee muestra la idea', await js('!!document.querySelector(".idea")'));
  ok('las 3 pestañas existen', await js('document.querySelectorAll(".lesson-tab").length') === 3);
  ok('la meta del bucle se lee', (await js('document.querySelector(".idea").textContent') || '').includes('bucle'));

  await goto('#/leccion/l2/1', '#ex-board .robot');
  ok('el ejemplo monta el tablero', await js('!!document.querySelector("#ex-board .robot")'));
  ok('el ejemplo lista el bucle', await js('document.querySelectorAll("#ex-program .ex-block").length') === 2);
  ok('el bucle anida su bloque', await js('!!document.querySelector(".ex-repeat .ex-block")'));

  /* ejecutar el ejemplo */
  await js('document.querySelector("#ex-run").click(); true');
  const noteShown = await waitFor(() => js('!!document.querySelector("#ex-note") && !document.querySelector("#ex-note").hidden'), 8000);
  ok('el ejemplo se ejecuta y explica', noteShown);
  const exTransform = await js('document.querySelector("#ex-board .robot").style.transform');
  console.log('       [transform del ejemplo] ' + exTransform);
  ok('el robot del ejemplo se movió', !!exTransform && !exTransform.includes('translate(100%'), exTransform);
  await shot('check-ejemplo');

  /* ---------- 3. Reto: armar y ejecutar ---------- */
  await goto('#/reto/m1', '#board .robot');
  ok('el reto carga el tablero', await js('!!document.querySelector("#board .robot")'));
  ok('la paleta tiene 1 bloque', await js('document.querySelectorAll(".pblock").length') === 1);
  ok('el programa empieza vacío', await js('document.querySelectorAll("#prog .block").length') === 0);

  /* tres clics en Avanzar */
  await js(`(function(){
    var b = document.querySelector('.pblock[data-type="move"]');
    b.click(); b.click(); b.click();
    return true;
  })()`);
  ok('tres clics agregan tres bloques', await js('document.querySelectorAll("#prog .block").length') === 3);
  ok('el contador lo refleja', (await js('document.querySelector("#counter").textContent') || '').includes('3'));

  /* ejecutar -> aparece la predicción */
  await js('document.querySelector("#run-btn").click(); true');
  const predictShown = await waitFor(() => js('!!document.querySelector(".predict-list")'), 4000);
  ok('antes de ejecutar pregunta qué pasará', predictShown);
  await shot('check-prediccion');

  await js('document.querySelectorAll(".predict-btn")[0].click(); true');

  const won = await waitFor(() => js('!!document.querySelector(".modal h2")'), 10000);
  ok('el programa correcto GANA', won);
  ok('el título celebra', (await js('document.querySelector(".modal h2").textContent') || '').includes('¡'));
  ok('se muestran 3 estrellas', await js('document.querySelectorAll(".stars-big svg").length') === 3);
  ok('dice lo que aprendió', (await js('document.querySelector(".modal .learn").textContent') || '').includes('programa'));
  ok('muestra el programa en código', (await js('document.querySelector(".code").textContent') || '').includes('avanzar'));
  ok('el progreso se guarda', await js('JSON.parse(localStorage.getItem("codekids.v3")).stars.m1 >= 1'));
  await shot('check-gana');

  /* siguiente reto: elegir por texto, no por clase (puede haber más de un modal) */
  const nextLabel = await js(`(function(){
    var b = Array.from(document.querySelectorAll('.modal__actions button'))
      .find(function (x) { return x.textContent.indexOf('Siguiente reto') >= 0; });
    if (!b) return null;
    b.click();
    return b.textContent;
  })()`);
  ok('el modal ofrece Siguiente reto', !!nextLabel, nextLabel);
  await sleep(700);
  /* La vista de lección queda en el DOM con su título viejo: hay que leer
     solo la vista visible, si no el test lee el título equivocado. */
  const nextTitle = await js('(document.querySelector(".view:not([hidden]) .topbar__title") || {}).textContent || "(sin barra)"');
  const nextId = LESSONS.find(l => l.retos.includes('m1')).retos[1];
  const expectedNext = MISSIONS.find(m => m.id === nextId).title;
  console.log('       [título tras siguiente] ' + nextTitle);
  ok('el botón siguiente abre el reto 2', (nextTitle || '').includes(expectedNext), { nextTitle, expectedNext });

  /* ---------- 4. Programa equivocado ---------- */
  await goto('#/reto/m3', '#board .robot');
  await sleep(400);
  console.log('       [reto m3] título=' + await js('(document.querySelector(".view:not([hidden]) .topbar__title") || {}).textContent') +
    ' bloques=' + await js('document.querySelectorAll("#prog .block").length') +
    ' modal=' + await js('!!document.querySelector(".modal")'));
  await js(`(function(){
    var b = document.querySelector('.pblock[data-type="move"]');
    b.click();
    return true;
  })()`);
  console.log('       [tras clic paleta] bloques=' + await js('document.querySelectorAll("#prog .block").length'));
  await js('document.querySelector("#run-btn").click(); true');
  const predShown2 = await waitFor(() => js('!!document.querySelector(".predict-list")'), 4000);
  console.log('       [predicción visible] ' + predShown2);
  await js('document.querySelectorAll(".predict-btn")[0].click(); true');
  const fb = await waitFor(() => js(`(function(){
    var el = document.querySelector('#feedback .fb');
    return el && el.textContent.length > 10 ? el.textContent : false;
  })()`), 8000);
  console.log('       [feedback] ' + JSON.stringify(fb));
  ok('un programa incompleto da pista en palabras', typeof fb === 'string' && fb.length > 10, fb);
  ok('no se muestra modal de victoria', await js('!document.querySelector(".modal h2")'));

  /* ---------- 5. Bucle con contador ---------- */
  await goto('#/reto/m10', '.repeat');
  ok('el reto guiado trae programa', await js('!!document.querySelector(".repeat")'));
  ok('el contador del bucle se ve', (await js('document.querySelector(".stepper span").textContent') || '') === '2');
  await js('document.querySelector(".stepper button[aria-label=\'Uno más\']").click(); true');
  await js('document.querySelector(".stepper button[aria-label=\'Uno más\']").click(); true');
  ok('el contador sube a 4', (await js('document.querySelector(".stepper span").textContent') || '') === '4');

  await js('document.querySelector("#run-btn").click(); true');
  await waitFor(() => js('!!document.querySelector(".predict-list")'), 4000);
  await js('document.querySelectorAll(".predict-btn")[1].click(); true');
  const won2 = await waitFor(() => js('!!document.querySelector(".modal h2")'), 10000);
  ok('corregir el número gana el reto', won2);
  await shot('check-bucle');

  /* ---------- 6. Depuración: borrar bloque ---------- */
  await goto('#/reto/m6', '#prog .block');
  ok('el reto de depuración trae 4 bloques', await js('document.querySelectorAll("#prog .block").length') === 4);
  await js('document.querySelectorAll("#prog .block .block__del")[2].click(); true');
  ok('se puede borrar un bloque', await js('document.querySelectorAll("#prog .block").length') === 3);
  await js('document.querySelector("#undo-btn").click(); true');
  ok('deshacer lo recupera', await js('document.querySelectorAll("#prog .block").length') === 4);

  /* ---------- 7. Modo Aventura ---------- */
  await goto('#/aventura', '.q-stage-card');
  ok('el modo aventura ofrece 8 mundos', await js('document.querySelectorAll(".q-stage-card").length') === 8);
  ok('el héroe se arma por partes', await js('document.querySelectorAll(".q-hero-opt").length') === 16);
  await js('document.querySelector(".q-stage-card").click(); true');
  await waitForSelector('#quest-canvas');
  ok('la misión se lee antes del código', await js('!!document.querySelector(".q-brief") && !!document.querySelector(".q-legend")'));
  ok('la capa visual tipo shader está activa', await js('!!(window.CodeKids && window.CodeKids.QuestFX)'));
  const canvasHash = `(function(){
    var c = document.querySelector('#quest-canvas');
    var d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    var s = 0;
    for (var i = 0; i < d.length; i += 4) s = (s * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) | 0;
    return s;
  })()`;
  const hashA = await js(canvasHash);
  await sleep(350);
  const hashB = await js(canvasHash);
  ok('el tablero tiene animación ambiental', hashA !== hashB, { hashA, hashB });
  await js(`(function(){
    var s = document.querySelector('.q-rule').querySelectorAll('select');
    s[0].value = 've_pared'; s[0].dispatchEvent(new Event('change', { bubbles: true }));
    s[1].value = 'girar'; s[1].dispatchEvent(new Event('change', { bubbles: true }));
    Array.from(document.querySelectorAll('button'))
      .find(function (b) { return b.textContent.indexOf('Agregar regla') >= 0; }).click();
    var step = Array.from(document.querySelectorAll('.q-controls button'))
      .find(function (b) { return b.textContent.indexOf('Paso') >= 0; });
    for (var i = 0; i < 40 && !document.querySelector('.q-modal'); i++) step.click();
    return true;
  })()`);
  ok('las reglas ganan el mundo 1', await js('!!document.querySelector(".q-modal")'));
  ok('el progreso de aventura se guarda', await js('JSON.parse(localStorage.getItem("codekids.quest.v1") || "{}").cleared.indexOf("q1") >= 0'));
  await shot('check-aventura');

  /* ---------- 8. Evaluación: tablero 10x10, código puro y ruta visible ---------- */
  await goto('#/evaluacion/1', '#exam-board .robot');
  ok('la evaluación muestra un tablero de 100 casillas',
    await js('document.querySelectorAll("#exam-board .tile").length') === 100);
  ok('no hay bloques ni botones de pista en el examen',
    await js('document.querySelectorAll("#exam-root .pblock, #exam-root .chip--hint, #exam-root .primm-actions").length') === 0);
  ok('el único editor es de texto', await js('document.querySelectorAll("#exam-root textarea").length') === 1);
  ok('hay 4 ejercicios', EXAM_EXERCISES.length === 4);
  ok('la ruta objetivo aparece antes de escribir código',
    await js('document.querySelectorAll("#exam-board .exam-route").length') === 7);
  ok('los pasos de la ruta están numerados',
    await js('document.querySelector("#exam-board .exam-route__num").textContent') === '1');
  ok('la ruta también se lista con flechas', (await js(
    'document.querySelector(".exam-route-line").textContent') || '').includes('→'));
  ok('las flechas objetivo son visibles', await js(`(function(){
    var a = document.querySelector('#exam-board .exam-route__arrow svg');
    if (!a) return false;
    var r = a.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && getComputedStyle(a.parentElement).opacity !== '0';
  })()`));

  await js(`(function(){
    var t = document.querySelector('#exam-code');
    t.value = ${JSON.stringify(EXAM_EXERCISES[0].code)};
    document.querySelector('#exam-run').click();
    return true;
  })()`);
  const examWon = await waitFor(() => js(`(function(){
    var el = document.querySelector('#exam-status');
    return el && el.textContent.indexOf('Ruta completada') >= 0;
  })()`), 15000);
  ok('el código escrito lleva a Chispa a la meta', examWon);
  ok('la ruta queda dibujada con flechas', await js('document.querySelectorAll("#exam-board .trail").length') > 0);
  ok('la ruta objetivo sigue visible al terminar',
    await js('document.querySelectorAll("#exam-board .exam-route").length') === 7);
  ok('las flechas de la ruta son visibles', await js(`(function(){
    var t = document.querySelector('#exam-board .trail svg');
    if (!t) return false;
    var r = t.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && getComputedStyle(t.parentElement).opacity !== '0';
  })()`));
  ok('la meta se marca como alcanzada', await js('!!document.querySelector("#exam-board .tile--goal.is-reached")'));
  ok('el resultado se guarda', await js(
    'JSON.parse(localStorage.getItem("codekids.exam.v1") || "{}").answers[0].passed === true'));
  await shot('check-evaluacion');

  await js('document.querySelector("#exam-next").click(); true');
  ok('avanza al ejercicio 2', await js('!!document.querySelector("#exam-code") && location.hash === "#/evaluacion/2"'));
  await goto('#/evaluacion/final', '.exam-summary');
  ok('el resumen final muestra la nota', (await js('document.querySelector(".exam-score").textContent') || '').includes('1 / 4'));

  /* ---------- 9. Revisión de consola ---------- */
  await goto('#/progreso', '.progress-card');
  ok('el progreso suma estrellas', (await js('document.querySelectorAll(".stat b")[0].textContent')) !== '0');

  await goto('#/libre', '#board .robot');
  ok('la zona libre genera un mapa', await js('!!document.querySelector("#board .robot")'));

  ok('sin errores de JavaScript', errors.length === 0, errors.slice(0, 4));
} catch (e) {
  fail++;
  console.log('  FAIL error inesperado -> ' + (e && e.message ? e.message : String(e)));
} finally {
  console.log(`\nRESULTADO: ${pass} bien, ${fail} mal`);
  if (errors.length) { console.log('\nErrores capturados:'); errors.forEach(e => console.log('  - ' + e)); }
  console.log('');

  await cleanup(fail ? 1 : 0);
}
