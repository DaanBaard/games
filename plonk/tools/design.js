// Level-ontwerptool: controleert elk level en meet de moeilijkheid.
//  - zonder onderdelen mag het level NIET winnen
//  - de opgeslagen oplossing moet winnen, en elk onderdeel ervan moet nodig zijn
//  - 'ruimte' = aantal winnende posities voor het laatste onderdeel (meer = makkelijker)
// Gebruik: node tools/design.js [ids...]      (parallel per level)
const { fork } = require('child_process');
const path = require('path');
const S = require('../js/sim.js');
const LEVELS = require('../js/levels.js');

function wins(L, pl) { return S.createSim(L, pl).runToEnd().state === 'won'; }
function analyse(L) {
  const out = { id: L.id, name: L.name };
  out.empty = wins(L, []);
  // geen bal mag bij de start in een plank steken
  const M = require('../lib/matter.min.js');
  out.startOK = L.items.filter(i => ['heavy', 'marble'].includes(i.type)).every(d => L.items.filter(i => i.type === 'shelf').every(st => { const r = M.Collision.collides(S.makeBody(d), S.makeBody(st)); return !(r && r.collided); }));
  const sim = S.createSim(L, L.solution).runToEnd();
  out.sol = sim.state; out.t = +sim.t.toFixed(2);
  out.valid = L.solution.every((p, i) => !S.overlaps(L, L.solution, p, i));
  out.needAll = L.solution.length < 2 || L.solution.every((_, i) => !wins(L, L.solution.filter((__, j) => j !== i)));
  const base = L.solution.slice(0, -1), last = L.solution[L.solution.length - 1], P = S.PARTS[last.type];
  const angles = P.rotStep ? [-60, -45, -30, -15, 0, 15, 30, 45, 60] : [0];
  const flips = P.flip ? [false, true] : [false];
  const found = [];
  for (let x = 40; x <= 1240; x += 20) for (let y = 80; y <= 580; y += 20) for (const a of angles) for (const flip of flips) {
    const c = { type: last.type, x, y, a, flip };
    if (S.overlaps(L, base, c, -1)) continue;
    if (wins(L, base.concat([c]))) found.push(c);
  }
  out.room = found.length;
  // robuustheid van gevonden oplossingen (buren die ook winnen)
  const key = c => `${c.x},${c.y},${c.a},${c.flip}`; const set = new Set(found.map(key));
  const scored = found.map(c => ({ c, r: [[-20, 0], [20, 0], [0, -20], [0, 20]].filter(([dx, dy]) => set.has(key({ ...c, x: c.x + dx, y: c.y + dy }))).length }));
  scored.sort((a, b) => b.r - a.r);
  out.best = scored.slice(0, 3).map(o => `${o.c.x},${o.c.y},a${o.c.a}${o.c.flip ? ',flip' : ''} r${o.r}`);
  return out;
}

if (process.argv[2] === '--worker') {
  const L = LEVELS.find(l => l.id === +process.argv[3]);
  process.send(analyse(L)); process.exit(0);
} else {
  const ids = process.argv.slice(2).map(Number);
  const todo = LEVELS.filter(l => !ids.length || ids.includes(l.id));
  const res = []; let running = 0, i = 0;
  const max = require('os').cpus().length;
  const next = () => {
    while (running < max && i < todo.length) {
      const L = todo[i++]; running++;
      const ch = fork(path.join(__dirname, 'design.js'), ['--worker', String(L.id)]);
      ch.on('message', m => res.push(m));
      ch.on('exit', () => { running--; if (i < todo.length) next(); else if (!running) done(); });
    }
  };
  const done = () => {
    res.sort((a, b) => a.id - b.id);
    for (const r of res) {
      const ok = !r.empty && r.sol === 'won' && r.valid && r.needAll && r.startOK;
      console.log(`${ok ? 'OK  ' : 'FOUT'} L${r.id} ${r.name.padEnd(18)} sol=${r.sol} t=${r.t} empty=${r.empty} valid=${r.valid} nodigAlles=${r.needAll} start=${r.startOK ? 'ok' : 'IN PLANK'} ruimte=${r.room}  ${r.best.join(' | ')}`);
    }
  };
  next();
}
