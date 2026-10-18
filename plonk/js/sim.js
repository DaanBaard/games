/* PLONK! – deterministische simulatie (werkt in browser én Node voor level-tests) */
(function (root) {
  const Matter = root.Matter || (typeof require !== 'undefined' ? require('../lib/matter.min.js') : null);
  const { Engine, Bodies, Body, Composite, Constraint, Events } = Matter;

  const W = 1280, H = 720;
  const STEP = 1000 / 60;
  const MARBLE_R = 20, HEAVY_R = 30, BOBO_R = 58;

  // Onderdelen die de speler kan plaatsen
  const PARTS = {
    plank:   { w: 220, h: 20, rotStep: 15, label: 'Plank' },
    bouncer: { w: 130, h: 24, rotStep: 15, label: 'Trampoline' },
    seesaw:  { w: 260, h: 18, rotStep: 0,  label: 'Wip' },
    domino:  { w: 18,  h: 120, rotStep: 0,  label: 'Domino' },
    fan:     { w: 74,  h: 74, rotStep: 0,  flip: true, label: 'Ventilator' },
    conveyor:{ w: 200, h: 24, rotStep: 0,  flip: true, label: 'Lopende band' },
    // v1.4: nieuwe onderdelen voor wereld 6-10
    sponge:  { w: 140, h: 30, rotStep: 15, label: 'Marshmallow' },          // vangt alles zacht op (snelheid weg)
    bumper:  { w: 68,  h: 68, rotStep: 0,  label: 'Bumper' },               // kaatst alles met vaste snelheid weg vanuit het midden
    portal:  { w: 76,  h: 76, rotStep: 0,  label: 'Portaal' },              // ingang; de uitgang (portalOut) ligt vast in het level
    pump:    { w: 84,  h: 34, rotStep: 0,  label: 'Bellenpomp' },           // stroom omhoog boven de pomp
    cannon:  { w: 96,  h: 48, rotStep: 15, flip: true, label: 'Kanon' },    // vangt de knikker en schiet hem in de looprichting
  };
  const PUMP_H = 440, PUMP_HW = 50;           // hoogte en halve breedte van de bellenstroom
  const BUMP_V = 14, CANNON_V = 17, PUMP_V = 5;

  const rad = d => d * Math.PI / 180;

  function makeBody(it) {
    const a = rad(it.a || 0);
    let b;
    switch (it.type) {
      case 'shelf':
        b = Bodies.rectangle(it.x, it.y, it.w, it.h || 22, { isStatic: true, angle: a, friction: 0.4, restitution: 0.2 });
        break;
      case 'plank':
        b = Bodies.rectangle(it.x, it.y, PARTS.plank.w, PARTS.plank.h, { isStatic: true, angle: a, friction: 0.05, restitution: 0.15 });
        break;
      case 'bouncer':
        b = Bodies.rectangle(it.x, it.y, PARTS.bouncer.w, PARTS.bouncer.h, { isStatic: true, angle: a, friction: 0.2, restitution: 0.6 });
        break;
      case 'conveyor':
        b = Bodies.rectangle(it.x, it.y, PARTS.conveyor.w, PARTS.conveyor.h, { isStatic: true, friction: 0.8, restitution: 0.05 });
        break;
      case 'fan':
        b = Bodies.rectangle(it.x, it.y, PARTS.fan.w, PARTS.fan.h, { isStatic: true, friction: 0.3 });
        break;
      case 'seesaw':
        b = Bodies.rectangle(it.x, it.y, PARTS.seesaw.w, PARTS.seesaw.h, { angle: a, density: 0.003, friction: 0.5, frictionAir: 0.01, restitution: 0.1 });
        break;
      case 'domino':
        b = Bodies.rectangle(it.x, it.y, PARTS.domino.w, PARTS.domino.h, { angle: a, density: 0.004, friction: 0.9, frictionStatic: 1.2, restitution: 0.05 });
        break;
      case 'sponge':
        b = Bodies.rectangle(it.x, it.y, PARTS.sponge.w, PARTS.sponge.h, { isStatic: true, angle: a, friction: 1, restitution: 0 });
        break;
      case 'bumper':
        b = Bodies.circle(it.x, it.y, PARTS.bumper.w / 2 - 2, { isStatic: true, friction: 0, restitution: 0.4 });
        break;
      case 'portal': case 'portalOut':
        b = Bodies.circle(it.x, it.y, 34, { isStatic: true, isSensor: true });
        break;
      case 'pump':
        b = Bodies.rectangle(it.x, it.y, PARTS.pump.w, PARTS.pump.h, { isStatic: true, friction: 0.4 });
        break;
      case 'cannon':
        b = Bodies.rectangle(it.x, it.y, PARTS.cannon.w, PARTS.cannon.h, { isStatic: true, isSensor: true, angle: a });
        break;
      case 'button':
        b = Bodies.rectangle(it.x, it.y, 64, 14, { isStatic: true, isSensor: true, angle: a });   // sensor: rollen eroverheen drukt hem in
        break;
      case 'gate':
        b = Bodies.rectangle(it.x, it.y, it.w || 24, it.h || 160, { isStatic: true, friction: 0.3, restitution: 0.1 });
        break;
      case 'marble':
        b = Bodies.circle(it.x, it.y, MARBLE_R, { density: 0.002, friction: 0.02, frictionAir: 0.002, restitution: 0.35 });
        break;
      case 'heavy':
        b = Bodies.circle(it.x, it.y, HEAVY_R, { density: 0.02, friction: 0.01, frictionAir: 0.0004, restitution: 0.1 });
        break;
      case 'bobo':
        b = Bodies.circle(it.x, it.y, BOBO_R, { isStatic: true, isSensor: true });
        break;
      default:
        return null;
    }
    b.plonk = { type: it.type, item: it };
    return b;
  }

  // Bouw een wereld uit level + plaatsingen van de speler
  function createSim(level, placements) {
    const engine = Engine.create();
    engine.gravity.y = level.gravity || 1;
    engine.positionIterations = 8;
    engine.velocityIterations = 6;
    const items = level.items.concat(placements.map(p => Object.assign({ placed: true }, p)));
    const bodies = [];
    let marble = null, bobo = null;
    const fans = [], bouncers = [], conveyors = [], seesaws = [];
    const pumps = [], portals = [], cannons = [], gates = [];
    let portalOut = null;
    for (const it of items) {
      const b = makeBody(it);
      if (!b) continue;
      bodies.push(b);
      Composite.add(engine.world, b);
      if (it.type === 'marble') marble = b;
      if (it.type === 'bobo') bobo = b;
      if (it.type === 'fan') fans.push(b);
      if (it.type === 'bouncer') bouncers.push(b);
      if (it.type === 'conveyor') conveyors.push(b);
      if (it.type === 'pump') pumps.push(b);
      if (it.type === 'portal') portals.push(b);
      if (it.type === 'portalOut') portalOut = b;
      if (it.type === 'cannon') { b.held = null; b.timer = 0; cannons.push(b); }
      if (it.type === 'gate') gates.push(b);
      if (it.type === 'seesaw') {
        seesaws.push(b);
        const c = Constraint.create({ pointA: { x: it.x, y: it.y }, bodyB: b, pointB: { x: 0, y: 0 }, stiffness: 1, length: 0 });
        Composite.add(engine.world, c);
      }
    }

    const boosts = [], damps = [], bumps = [];
    const events = [];
    Events.on(engine, 'collisionStart', ev => {
      for (const p of ev.pairs) {
        const A = p.bodyA, B = p.bodyB;
        for (const [s, o] of [[A, B], [B, A]]) {
          if (!s.plonk || o.isStatic) continue;
          const ty = s.plonk.type;
          if (ty === 'bouncer') boosts.push([s, o]);
          else if (ty === 'sponge') damps.push([s, o]);
          else if (ty === 'bumper') bumps.push([s, o]);
          else if (ty === 'button' && !sim.gatesOpen) {
            sim.gatesOpen = true;
            for (const g of gates) Composite.remove(engine.world, g);
            events.push({ kind: 'click', x: s.position.x, y: s.position.y, body: s });
          }
        }
        const speed = Math.hypot(A.velocity.x - B.velocity.x, A.velocity.y - B.velocity.y);
        if (speed > 1.2 && !A.isSensor && !B.isSensor) {
          const pt = p.collision.supports && p.collision.supports[0];
          events.push({ kind: 'hit', x: pt ? pt.x : A.position.x, y: pt ? pt.y : A.position.y, speed,
            types: [A.plonk && A.plonk.type, B.plonk && B.plonk.type], ids: [A.id, B.id] });
        }
      }
    });

    const sim = {
      engine, bodies, marble, bobo, fans, conveyors, pumps, portals, portalOut, cannons, gates, events,
      t: 0, frame: 0, state: 'running', stillFrames: 0, winFrame: -1, gatesOpen: false,
      step() {
        if (sim.state !== 'running') return;
        // ventilatoren: horizontale luchtstroom
        for (const f of fans) {
          const dir = f.plonk.item.flip ? -1 : 1;
          for (const b of bodies) {
            if (b.isStatic) continue;
            const dx = (b.position.x - f.position.x) * dir;
            const dy = Math.abs(b.position.y - f.position.y);
            if (dx > 30 && dx < 440 && dy < 80) {
              const fall = 1 - dx / 420;
              Body.applyForce(b, b.position, { x: dir * b.mass * 0.001 * 1.0 * (0.35 + fall), y: -b.mass * 0.001 * 0.25 * fall });
            }
          }
        }
        // bellenpomp: alles in de bellenstroom stijgt rustig en gelijkmatig op (lift), zijwaartse vaart blijft grotendeels behouden
        for (const pm of pumps) {
          for (const b of bodies) {
            if (b.isStatic) continue;
            const dx = b.position.x - pm.position.x, up = pm.position.y - b.position.y;
            if (Math.abs(dx) < PUMP_HW && up > 10 && up < PUMP_H) {
              const v = b.velocity;
              Body.setVelocity(b, { x: v.x * 0.98 - dx * 0.002, y: v.y + (-PUMP_V - v.y) * 0.15 });
            }
          }
        }
        Engine.update(engine, STEP);
        // marshmallow: snelheid bijna helemaal weg (zacht opvangen)
        while (damps.length) {
          const [s, o] = damps.shift();
          Body.setVelocity(o, { x: o.velocity.x * 0.12, y: o.velocity.y * 0.12 }); Body.setAngularVelocity(o, o.angularVelocity * 0.3);
          events.push({ kind: 'squish', x: o.position.x, y: o.position.y, body: s });
        }
        // bumper: wegkaatsen vanuit het midden met vaste snelheid
        while (bumps.length) {
          const [s, o] = bumps.shift();
          let nx = o.position.x - s.position.x, ny = o.position.y - s.position.y; const d = Math.hypot(nx, ny) || 1;
          nx /= d; ny /= d;
          Body.setVelocity(o, { x: nx * BUMP_V, y: ny * BUMP_V });
          events.push({ kind: 'bump', x: s.position.x + nx * 34, y: s.position.y + ny * 34, body: s });
        }
        // portaal: wie de ingang raakt, komt bij de uitgang tevoorschijn met dezelfde snelheid
        if (portals.length && portalOut) for (const b of bodies) {
          if (b.isStatic) continue;
          if (b.warpCool > 0) { b.warpCool--; continue; }
          for (const pt of portals) if (Math.hypot(b.position.x - pt.position.x, b.position.y - pt.position.y) < 40) {
            events.push({ kind: 'warp', x: pt.position.x, y: pt.position.y, x2: portalOut.position.x, y2: portalOut.position.y });
            Body.setPosition(b, { x: portalOut.position.x, y: portalOut.position.y }); b.warpCool = 40; break;
          }
        }
        // kanon: vangt een bal, houdt hem even vast en schiet hem in de looprichting weg
        for (const c of cannons) {
          if (!c.held) {
            for (const b of bodies) {
              if (b.isStatic || b.fireCool > 0 || !['marble', 'heavy'].includes(b.plonk.type)) continue;
              if (Math.hypot(b.position.x - c.position.x, b.position.y - c.position.y) < 40) { c.held = b; c.timer = 18; events.push({ kind: 'load', x: c.position.x, y: c.position.y, body: c }); break; }
            }
          }
          if (c.held) {
            const b = c.held;
            if (--c.timer > 0) { Body.setPosition(b, { x: c.position.x, y: c.position.y }); Body.setVelocity(b, { x: 0, y: 0 }); }
            else {
              const fx = c.plonk.item.flip ? -1 : 1, dx = fx * Math.cos(c.angle), dy = fx * Math.sin(c.angle);
              Body.setPosition(b, { x: c.position.x + dx * 56, y: c.position.y + dy * 56 });
              Body.setVelocity(b, { x: dx * CANNON_V, y: dy * CANNON_V });
              b.fireCool = 30; c.held = null;
              events.push({ kind: 'fire', x: c.position.x + dx * 60, y: c.position.y + dy * 60, dx, dy, body: c });
            }
          }
        }
        for (const b of bodies) if (b.fireCool > 0) b.fireCool--;
        // wip: aanslag op ±34° zodat hij als katapult werkt
        for (const w of seesaws) {
          const base = rad(w.plonk.item.a || 0), lim = 0.6;
          const d = w.angle - base;
          if (d > lim || d < -lim) { Body.setAngle(w, base + Math.sign(d) * lim); Body.setAngularVelocity(w, 0); }
        }
        // lopende banden: trek rakende objecten mee
        if (conveyors.length) for (const pr of engine.pairs.list) {
          if (!pr.isActive) continue;
          const A = pr.bodyA, B = pr.bodyB;
          for (const [c, o] of [[A, B], [B, A]]) {
            if (c.plonk && c.plonk.type === 'conveyor' && !o.isStatic) {
              const dir = c.plonk.item.flip ? -1 : 1;
              Body.setVelocity(o, { x: o.velocity.x + (dir * 5.5 - o.velocity.x) * 0.25, y: o.velocity.y });
            }
          }
        }
        // trampoline: gegarandeerde stuit langs de normaal
        while (boosts.length) {
          const [s, o] = boosts.shift();
          const n = { x: Math.sin(s.angle), y: -Math.cos(s.angle) };
          const side = (o.position.x - s.position.x) * n.x + (o.position.y - s.position.y) * n.y;
          const nn = side >= 0 ? n : { x: -n.x, y: -n.y };
          const v = o.velocity;
          const vn = v.x * nn.x + v.y * nn.y;
          const tx = v.x - vn * nn.x, ty = v.y - vn * nn.y;
          const out = Math.max(13, Math.abs(vn) * 1.05);
          Body.setVelocity(o, { x: tx + nn.x * out, y: ty + nn.y * out });
          events.push({ kind: 'boing', x: o.position.x, y: o.position.y, body: s });
        }
        sim.t += STEP / 1000;
        sim.frame++;
        const m = marble.position;
        if (Math.hypot(m.x - bobo.position.x, m.y - bobo.position.y) < BOBO_R + MARBLE_R - 4) {
          sim.state = 'won'; sim.winFrame = sim.frame;
          events.push({ kind: 'win' });
          return;
        }
        if (m.y > H + 80 || m.y < -200 || m.x < -100 || m.x > W + 100 || sim.t > 20) { sim.state = 'lost'; events.push({ kind: 'lost' }); return; }
        let moving = false;
        for (const b of bodies) if (!b.isStatic && (b.speed > 0.06 || b.angularSpeed > 0.004)) { moving = true; break; }
        if (cannons.some(c => c.held)) moving = true;
        if (!moving && sim.t > 1) { if (++sim.stillFrames > 75) { sim.state = 'lost'; events.push({ kind: 'lost' }); } }
        else sim.stillFrames = 0;
      },
      runToEnd(maxFrames = 1300) { while (sim.state === 'running' && sim.frame < maxFrames) sim.step(); return sim; },
    };
    return sim;
  }

  // Plaatsingscontrole: overlapt het nieuwe onderdeel met iets?
  function overlaps(level, placements, cand, ignoreIndex) {
    const all = level.items.concat(placements.filter((_, i) => i !== ignoreIndex));
    const cb = makeBody(cand);
    if (!cb) return true;
    const pad = 4;
    const bb = cb.bounds;
    if (bb.min.x < 0 || bb.max.x > W || bb.min.y < 60 || bb.max.y > 600) return true;
    for (const it of all) {
      const b = makeBody(it.type === 'bobo' ? Object.assign({}, it) : it);
      if (!b) continue;
      const r = Matter.Collision.collides(cb, b);
      if (r && r.collided && r.depth > pad * 0) return true;
      if ((it.type === 'seesaw' || cand.type === 'seesaw') && !['marble', 'heavy', 'bobo'].includes(it.type)) {
        // houd ruimte vrij rond de draaiende wip
        const d = Math.hypot(cand.x - it.x, cand.y - it.y);
        if (d < 130) return true;
      }
    }
    return false;
  }

  // Domino's 'vallen' bij het neerzetten op het oppervlak eronder (zodat ze precies staan)
  function settle(level, placements, cand, ignoreIndex) {
    if (cand.type !== 'domino') return cand;
    const c = Object.assign({}, cand);
    if (overlaps(level, placements, c, ignoreIndex)) {
      for (let k = 0; k < 24; k++) { c.y -= 1; if (!overlaps(level, placements, c, ignoreIndex)) return c; }
      return cand;
    }
    for (let k = 0; k < 90; k++) { c.y += 1; if (overlaps(level, placements, c, ignoreIndex)) { c.y -= 1; return c; } }
    return cand;
  }

  const api = { createSim, overlaps, settle, makeBody, PARTS, W, H, STEP, MARBLE_R, HEAVY_R, BOBO_R, PUMP_H, PUMP_HW };
  root.PlonkSim = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
