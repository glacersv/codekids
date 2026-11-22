/* Pruebas del Modo Aventura (motor quest.js).
   Uso: node tools/test-quest.js
   Comprueba que los 8 mundos se puedan ganar con reglas permitidas, que el
   parser de Python funciona y que el héroe pierde vida cuando corresponde. */
'use strict';

var Q = require('../js/quest.js');

var good = 0, bad = 0;
function ok(cond, msg) {
  if (cond) { good++; }
  else { bad++; console.log('  FAIL: ' + msg); }
}

/* Reglas correctas para cada mundo, escritas como un niño las armaría. */
var SOLUTIONS = {
  q1: [
    { when: 've_pared', do: ['girar'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q2: [
    { when: 've_enemigo', do: ['saltar'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q3: [
    { when: 've_fuego', do: ['saltar'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q4: [
    { when: 've_techo_bajo', do: ['agacharse'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q5: [
    { when: 've_llave', do: ['recoger'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q6: [
    { when: 've_fuego', do: ['saltar'] },
    { when: 've_medicina', do: ['tomar_medicina'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q7: [
    { when: 've_enemigo', do: ['saltar'] },
    { when: 've_persona', do: ['rescatar'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ],
  q8: [
    { when: 've_enemigo', do: ['saltar'] },
    { when: 've_fuego', do: ['saltar'] },
    { when: 've_techo_bajo', do: ['agacharse'] },
    { when: 've_llave', do: ['recoger'] },
    { when: 'no_hay_nada', do: ['avanzar'] }
  ]
};

console.log('MODO AVENTURA — 8 mundos\n');

ok(Q.STAGES.length === 8, 'debe haber 8 mundos');

Q.STAGES.forEach(function (stage) {
  var sol = SOLUTIONS[stage.id];
  ok(!!sol, stage.id + ': tiene solución de referencia');
  if (!sol) return;

  var errs = Q.validateRules(stage, sol);
  ok(errs.length === 0, stage.id + ': reglas permitidas → ' + errs.join('; '));

  var res = Q.run(stage, { name: 'Prueba' }, sol, 120);
  ok(res.ok, stage.id + ': se puede ganar (' + res.state.steps + ' pasos, ' + res.state.log.join(' / ') + ')');
  ok(res.state.hp > 0, stage.id + ': el héroe termina con vida');
  if (stage.requiresKey) ok(res.state.keys >= 1, stage.id + ': recogió la llave');
  if (stage.requiresRescue) ok(res.state.rescued >= 1, stage.id + ': rescató a la persona');
});

/* Progresión: bloques → ambos → código. */
ok(Q.STAGES[0].mode === 'blocks', 'el primer mundo es de bloques');
ok(Q.STAGES.some(function (s) { return s.mode === 'both'; }), 'hay mundos mixtos');
ok(Q.STAGES[Q.STAGES.length - 1].mode === 'text', 'el último mundo es de código');

/* Parser de Python. */
var parsed = Q.parsePython('si chispa.ve_enemigo():\n    chispa.saltar()\nsi chispa.no_hay_nada():\n    chispa.avanzar()\n');
ok(parsed.errors.length === 0, 'parser sin errores');
ok(parsed.rules.length === 2, 'parser produce 2 reglas');
ok(parsed.rules[0].when === 've_enemigo' && parsed.rules[0].do[0] === 'saltar', 'parser respeta el cuerpo indentado');

var parsedQ8 = Q.parsePython(Q.rulesToPython(SOLUTIONS.q8));
ok(parsedQ8.errors.length === 0, 'ida y vuelta Python → reglas sin errores');
ok(Q.run(Q.STAGES[7], null, parsedQ8.rules, 120).ok, 'el código generado gana el mundo 8');

var badParse = Q.parsePython('chispa.avanzar()\n');
ok(badParse.errors.length > 0, 'rechaza acción sin "si" previo');

/* Enemigo: si el niño manda avanzar directo, el héroe se hace daño. */
var risk = Q.run(Q.STAGES[1], null, [
  { when: 've_enemigo', do: ['avanzar'] },
  { when: 'no_hay_nada', do: ['avanzar'] }
], 30);
ok(risk.state.hp < 3 || risk.state.lost, 'chocar con el enemigo quita vida');

console.log('\nRESULTADO: ' + good + ' bien, ' + bad + ' mal');
process.exitCode = bad ? 1 : 0;
