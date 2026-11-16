/* Verificación en navegador real (Chrome + protocolo DevTools).
   Uso:  node tools/browser-check.mjs
   Hace lo que haría un niño: elige una lección, agrega bloques, ejecuta,
   responde la predicción y mira el resultado. Falla si hay errores de JS.
   Deja capturas en shots/. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9337;
const ROOT = 'C:/codekids';
const BASE = 'file:///C:/codekids/index.html';
const SHOTS = path.join(ROOT, 'shots');

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

/* ---------- lanzar Chrome ---------- */
fs.mkdirSync(SHOTS, { recursive: true });
const profile = path.join(ROOT, '.chrome-check');
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--disable-crash-reporter', '--disable-extensions', '--mute-audio',
  '--user-data-dir=' + profile,
  '--remote-debugging-port=' + PORT,
  '--window-size=1280,900',
  'about:blank'
], { stdio: 'ignore' });

async function cleanup(code) {
  try { chrome.kill(); } catch (e) { }
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { }
  process.exit(code);
}

/* ---------- cliente CDP ---------- */
let wsUrl = null;
const ready = await waitFor(async () => {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const list = await r.json();
  const page = list.find(t => t.type === 'page');
  if (page && page.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; return true; }
  return false;
}, 15000);

if (!ready) { console.log('No se pudo conectar con Chrome'); await cleanup(2); }

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let msgId = 0;
const pending = new Map();
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

async function goto(hash) {
  await send('Page.navigate', { url: BASE + (hash || '') });
  await sleep(700);
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');

console.log('\n== CodeKids · prueba en navegador ==\n');

/* ---------- 1. Inicio ---------- */
await goto('');
await sleep(400);
ok('el inicio carga 4 lecciones', await js('document.querySelectorAll(".lesson-card").length') === 4);
ok('hay botón de continuar', await js('!!document.querySelector("#continue-btn")'));
ok('el nombre se puede escribir', await js('!!document.querySelector("#kid-name")'));

/* ---------- 2. Lección: pestañas ---------- */
await goto('#/leccion/l2/0');
ok('la pestaña Lee muestra la idea', await js('!!document.querySelector(".idea")'));
ok('las 3 pestañas existen', await js('document.querySelectorAll(".lesson-tab").length') === 3);
ok('la meta del bucle se lee', (await js('document.querySelector(".idea").textContent') || '').includes('bucle'));

await goto('#/leccion/l2/1');
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
await goto('#/reto/m1');
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

/* siguiente reto */
console.log('       [modal abierto] ' + await js('!!document.querySelector(".modal")'));
await js('document.querySelector(".modal__actions .btn--primary").click(); true');
await sleep(700);
const nextTitle = await js('document.querySelector(".topbar__title") ? document.querySelector(".topbar__title").textContent : "(sin barra)"');
console.log('       [título tras siguiente] ' + nextTitle);
console.log('       [modal tras siguiente] ' + await js('!!document.querySelector(".modal")'));
ok('el botón siguiente abre el reto 2', (nextTitle || '').includes('El giro'), nextTitle);

/* ---------- 4. Programa equivocado ---------- */
await goto('#/reto/m3');
await sleep(400);
console.log('       [reto m3] título=' + await js('document.querySelector(".topbar__title").textContent') +
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
const fb = await waitFor(() => {
  const el = document.querySelector('#feedback .fb');
  return el && el.textContent.length > 10 ? el.textContent : false;
}, 8000);
console.log('       [feedback] ' + JSON.stringify(fb));
ok('un programa incompleto da pista en palabras', typeof fb === 'string' && fb.length > 10, fb);
ok('no se muestra modal de victoria', await js('!document.querySelector(".modal h2")'));

/* ---------- 5. Bucle con contador ---------- */
await goto('#/reto/m10');
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
await goto('#/reto/m6');
ok('el reto de depuración trae 4 bloques', await js('document.querySelectorAll("#prog .block").length') === 4);
await js('document.querySelectorAll("#prog .block .block__del")[2].click(); true');
ok('se puede borrar un bloque', await js('document.querySelectorAll("#prog .block").length') === 3);
await js('document.querySelector("#undo-btn").click(); true');
ok('deshacer lo recupera', await js('document.querySelectorAll("#prog .block").length') === 4);

/* ---------- 7. Revisión de consola ---------- */
await goto('#/progreso');
ok('el progreso suma estrellas', (await js('document.querySelectorAll(".stat b")[0].textContent')) !== '0');

await goto('#/libre');
ok('la zona libre genera un mapa', await js('!!document.querySelector("#board .robot")'));

ok('sin errores de JavaScript', errors.length === 0, errors.slice(0, 4));

console.log(`\nRESULTADO: ${pass} bien, ${fail} mal`);
if (errors.length) { console.log('\nErrores capturados:'); errors.forEach(e => console.log('  - ' + e)); }
console.log('');

await cleanup(fail ? 1 : 0);
