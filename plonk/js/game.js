/* PLONK! v0.1 – game, rendering en interactie */
(function () {
  'use strict';
  const tr = (k, v) => window.I18N.t(k, v);   // vertaling (zie js/i18n.js)
  const lname = L => tr('l' + L.id), ltip = L => tr('t' + L.id), wname = Wd => tr('world.' + Wd.id), pname = ty => tr('part.' + ty), oname = o => tr('outfit.' + o.id);
  const S = window.PlonkSim, LEVELS = window.PLONK_LEVELS, WORLDS = window.PLONK_WORLDS, SFX = window.SFX, Poki = window.Poki;
  const W = 1280, H = 720, GRID = 10, PLAY_TOP = 60, PLAY_BOTTOM = 600;
  const FONT = "'Baloo 2','Nunito','Arial Rounded MT Bold','Trebuchet MS',system-ui,sans-serif";
  const VERSION = 'v1.3';

  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  let RS = 1, scale = 1, offX = 0, offY = 0, cssW = 0, cssH = 0;

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const back = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rad = d => d * Math.PI / 180;
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
  function rg(c, x0, y0, r0, x1, y1, r1, stops) { const g = c.createRadialGradient(x0, y0, r0, x1, y1, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
  const OUT = '#24123A';
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- sprite cache ----------
  const sprites = new Map();
  function sprite(key, w, h, pad, draw) {
    let s = sprites.get(key);
    if (s && s.rs === RS) return s;
    const c = document.createElement('canvas');
    c.width = Math.ceil((w + pad * 2) * RS); c.height = Math.ceil((h + pad * 2) * RS);
    const x = c.getContext('2d');
    x.scale(RS, RS); x.translate(w / 2 + pad, h / 2 + pad);
    draw(x);
    // gebakken schaduw
    const sc = document.createElement('canvas');
    sc.width = c.width + 60 * RS; sc.height = c.height + 60 * RS;
    const sx = sc.getContext('2d');
    sx.shadowColor = 'rgba(14,6,40,0.55)'; sx.shadowBlur = 16 * RS; sx.shadowOffsetX = 10000;
    sx.drawImage(c, 30 * RS - 10000, 30 * RS);
    s = { c, sc, w, h, pad, rs: RS };
    sprites.set(key, s);
    return s;
  }
  function drawSprite(s, x, y, a = 0, alpha = 1, sxs = 1, sys = 1, shadow = true, sh = 9) {
    const fw = s.w + s.pad * 2, fh = s.h + s.pad * 2;
    if (shadow) {
      ctx.save(); ctx.globalAlpha = alpha * 0.9; ctx.translate(x + sh * 0.6, y + sh); ctx.rotate(a); ctx.scale(sxs, sys);
      ctx.drawImage(s.sc, -fw / 2 - 30, -fh / 2 - 30, fw + 60, fh + 60); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(a); ctx.scale(sxs, sys);
    ctx.drawImage(s.c, -fw / 2, -fh / 2, fw, fh); ctx.restore();
  }

  // ---------- part art ----------
  function screw(c, x, y, r = 4.5) {
    c.fillStyle = rg(c, x - r * 0.4, y - r * 0.4, 0, x, y, r, [[0, '#FFFFFF'], [0.5, '#C9C6D8'], [1, '#6E6890']]);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,30,70,.7)'; c.lineWidth = 1.2; c.stroke();
    c.beginPath(); c.moveTo(x - r * 0.6, y + r * 0.3); c.lineTo(x + r * 0.6, y - r * 0.3); c.stroke();
  }
  const MATS = {
    wood: { g: ['#E9AE6C', '#C98447', '#8E5226'], grain: '110,55,20', hi: 'rgba(255,236,200,.55)' },
    butcher: { g: ['#FFE2B0', '#E8B878', '#B07A3C'], grain: '140,80,30', hi: 'rgba(255,248,225,.6)' },
    rustic: { g: ['#C4935F', '#8E5E36', '#563720'], grain: '50,25,10', hi: 'rgba(255,220,170,.35)' },
    metal: { g: ['#EEF2FB', '#A3AEC8', '#5B6688'], grain: null, hi: 'rgba(255,255,255,.7)' },
  };
  function artShelf(w, h, mat = 'wood') {
    const M = MATS[mat];
    return c => {
      const vert = h > w;
      rr(c, -w / 2, -h / 2, w, h, 7);
      c.fillStyle = vert ? lg(c, -w / 2, 0, w / 2, 0, [[0, M.g[0]], [0.45, M.g[1]], [1, M.g[2]]]) : lg(c, 0, -h / 2, 0, h / 2, [[0, M.g[0]], [0.45, M.g[1]], [1, M.g[2]]]);
      c.fill();
      c.save(); rr(c, -w / 2, -h / 2, w, h, 7); c.clip();
      if (vert) c.rotate(Math.PI / 2);
      const L = vert ? h : w, T = vert ? w : h;
      seed = Math.floor(w * 13 + h * 7);
      if (M.grain) {
        for (let i = 0; i < Math.max(3, T / 5); i++) {
          const yy = -T / 2 + rnd() * T; c.strokeStyle = `rgba(${M.grain},${0.12 + rnd() * 0.18})`; c.lineWidth = 0.8 + rnd() * 1.4;
          c.beginPath(); c.moveTo(-L / 2, yy);
          for (let xx = -L / 2; xx <= L / 2; xx += 12) c.lineTo(xx, yy + Math.sin(xx * 0.04 + i) * 1.6);
          c.stroke();
        }
        for (let i = 0; i < L / 120; i++) {
          const kx = -L / 2 + 30 + rnd() * (L - 60), ky = -T / 2 + T * (0.3 + rnd() * 0.4);
          c.strokeStyle = `rgba(${M.grain},.35)`; c.lineWidth = 1; c.beginPath(); c.ellipse(kx, ky, 7, Math.min(3, T / 5), 0, 0, 7); c.stroke();
        }
      } else {
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1;
        for (let xx = -L / 2; xx < L / 2; xx += 7) { c.beginPath(); c.moveTo(xx, -T / 2); c.lineTo(xx + T * 0.6, T / 2); c.stroke(); }
        if (L > 120) { c.fillStyle = 'rgba(255,200,40,.85)'; c.fillRect(-L / 2, -T / 2, 22, T); c.fillRect(L / 2 - 22, -T / 2, 22, T);
          c.fillStyle = 'rgba(30,20,40,.85)'; for (const sx of [-L / 2, L / 2 - 22]) for (let k = -1; k < 3; k++) { c.beginPath(); c.moveTo(sx + k * 10, T / 2); c.lineTo(sx + k * 10 + 5, T / 2); c.lineTo(sx + k * 10 + 5 + T * 0.5, -T / 2); c.lineTo(sx + k * 10 + T * 0.5, -T / 2); c.fill(); } }
      }
      c.fillStyle = M.hi; c.fillRect(-L / 2, -T / 2, L, Math.min(5, T * 0.22));
      c.fillStyle = 'rgba(30,15,20,.35)'; c.fillRect(-L / 2, T / 2 - 4, L, 4);
      c.restore();
      rr(c, -w / 2, -h / 2, w, h, 7); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
      if (w > 60) { screw(c, -w / 2 + 14, 0); screw(c, w / 2 - 14, 0); }
      else if (h > 60) { screw(c, 0, -h / 2 + 14); screw(c, 0, h / 2 - 14); }
    };
  }
  function artConveyor(c) {
    const { w, h } = S.PARTS.conveyor;
    rr(c, -w / 2, -h / 2, w, h, h / 2);
    c.fillStyle = lg(c, 0, -h / 2, 0, h / 2, [[0, '#4A4560'], [0.5, '#2B2840'], [1, '#17152A']]); c.fill();
    for (const ex of [-w / 2 + h / 2, w / 2 - h / 2]) {
      c.fillStyle = rg(c, ex - 3, -3, 1, ex, 0, h / 2 - 2, [[0, '#FFFFFF'], [0.5, '#B7B4CC'], [1, '#5E5A78']]);
      c.beginPath(); c.arc(ex, 0, h / 2 - 3, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,.25)'; rr(c, -w / 2 + h, -h / 2 + 2, w - 2 * h, 3, 1.5); c.fill();
    rr(c, -w / 2, -h / 2, w, h, h / 2); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
  function drawConveyorArrows(x, y, flip, t, alpha) {
    const { w } = S.PARTS.conveyor, dir = flip ? -1 : 1;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
    ctx.beginPath(); ctx.rect(-w / 2 + 24, -8, w - 48, 16); ctx.clip();
    ctx.fillStyle = '#FFC93C';
    const off = ((t * 60) % 26) * dir;
    for (let k = -6; k < 7; k++) { const ax = k * 26 + off; ctx.beginPath(); ctx.moveTo(ax - 5 * dir, -6); ctx.lineTo(ax + 3 * dir, 0); ctx.lineTo(ax - 5 * dir, 6); ctx.lineTo(ax - 1 * dir, 6); ctx.lineTo(ax + 7 * dir, 0); ctx.lineTo(ax - 1 * dir, -6); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  function artPlank(c) {
    const { w, h } = S.PARTS.plank;
    rr(c, -w / 2, -h / 2, w, h, h / 2);
    c.fillStyle = lg(c, 0, -h / 2, 0, h / 2, [[0, '#9BE6FF'], [0.4, '#45B6F5'], [1, '#1D6FC2']]); c.fill();
    c.save(); rr(c, -w / 2, -h / 2, w, h, h / 2); c.clip();
    c.fillStyle = 'rgba(255,255,255,.5)'; rr(c, -w / 2 + 8, -h / 2 + 2, w - 16, 4, 2); c.fill();
    c.restore();
    for (let x = -w / 2 + 16; x <= w / 2 - 15; x += 21) {
      c.fillStyle = rg(c, x, 1, 0, x, 0, 5, [[0, '#0E3E7A'], [1, '#2A7FD0']]);
      c.beginPath(); c.arc(x, 0.5, 4.2, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.arc(x, 0.5, 4.8, 0.2, 2.6); c.stroke();
    }
    rr(c, -w / 2, -h / 2, w, h, h / 2); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
  function artBouncer(c) {
    const { w, h } = S.PARTS.bouncer;
    // basis
    rr(c, -w / 2 + 6, h / 2 - 8, w - 12, 9, 4); c.fillStyle = lg(c, 0, h / 2 - 8, 0, h / 2, [[0, '#5A4A8A'], [1, '#2B2050']]); c.fill();
    c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    // veren
    for (const sx of [-w / 2 + 22, 0, w / 2 - 22]) {
      c.strokeStyle = lg(c, sx - 6, 0, sx + 6, 0, [[0, '#8C8AA6'], [0.5, '#FFFFFF'], [1, '#77738F']]);
      c.lineWidth = 3; c.beginPath(); c.moveTo(sx - 6, h / 2 - 8);
      for (let i = 0; i < 4; i++) c.lineTo(sx + (i % 2 ? -6 : 6), h / 2 - 8 - (i + 1) * 2.4);
      c.stroke();
    }
    // pad
    rr(c, -w / 2, -h / 2 - 2, w, 13, 6.5);
    c.fillStyle = lg(c, 0, -h / 2, 0, -h / 2 + 13, [[0, '#FFB1A1'], [0.35, '#FF6B5B'], [1, '#D23A3A']]); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; rr(c, -w / 2 + 10, -h / 2, w - 20, 3.5, 2); c.fill();
    c.strokeStyle = OUT; c.lineWidth = 3; rr(c, -w / 2, -h / 2 - 2, w, 13, 6.5); c.stroke();
  }
  function artSeesaw(c) {
    const { w, h } = S.PARTS.seesaw;
    rr(c, -w / 2, -h / 2, w, h, 6);
    c.fillStyle = lg(c, 0, -h / 2, 0, h / 2, [[0, '#FFE893'], [0.45, '#FFC93C'], [1, '#D88A0E']]); c.fill();
    c.save(); rr(c, -w / 2, -h / 2, w, h, 6); c.clip();
    c.fillStyle = 'rgba(160,80,0,.22)';
    for (let x = -w / 2 - 20; x < w / 2; x += 26) { c.beginPath(); c.moveTo(x, h / 2); c.lineTo(x + 12, -h / 2); c.lineTo(x + 22, -h / 2); c.lineTo(x + 10, h / 2); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-w / 2, -h / 2, w, 3.5);
    c.restore();
    rr(c, -w / 2, -h / 2, w, h, 6); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
    for (const ex of [-w / 2 + 8, w / 2 - 8]) { c.fillStyle = '#FF6B5B'; rr(c, ex - 5, -h / 2 - 3, 10, h + 6, 4); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); }
    screw(c, 0, 0, 5.5);
  }
  function artPivot(c) {
    c.beginPath(); c.moveTo(0, -30); c.lineTo(30, 24); c.lineTo(-30, 24); c.closePath();
    c.fillStyle = lg(c, -30, -30, 30, 24, [[0, '#C79BFF'], [0.5, '#9B5DE5'], [1, '#5C2BA8']]); c.fill();
    c.lineJoin = 'round'; c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-2, -18); c.lineTo(-20, 18); c.lineTo(-12, 18); c.closePath(); c.fill();
    rr(c, -38, 20, 76, 10, 5); c.fillStyle = '#4B2A88'; c.fill(); c.stroke();
  }
  function artDomino(c) {
    const { w, h } = S.PARTS.domino;
    rr(c, -w / 2, -h / 2, w, h, 6);
    c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, [[0, '#FFFFFF'], [0.55, '#F6F0E1'], [1, '#CFC3A6']]); c.fill();
    c.strokeStyle = 'rgba(60,40,80,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w / 2 + 3, 0); c.lineTo(w / 2 - 3, 0); c.stroke();
    c.fillStyle = '#2B2050';
    for (const [px, py] of [[0, -h / 4 - 9], [0, -h / 4 + 9], [0, h / 4 - 14], [0, h / 4], [0, h / 4 + 14]]) { c.beginPath(); c.arc(px, py, 3, 0, 7); c.fill(); }
    rr(c, -w / 2, -h / 2, w, h, 6); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
  function artFan(c) {
    const s = S.PARTS.fan.w;
    rr(c, -s / 2, -s / 2, s, s, 16);
    c.fillStyle = lg(c, 0, -s / 2, 0, s / 2, [[0, '#7FF5E6'], [0.45, '#2CCFC0'], [1, '#12858C']]); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, -s / 2 + 8, -s / 2 + 4, s - 16, 5, 3); c.fill();
    // neus/uitblaas
    rr(c, s / 2 - 6, -18, 14, 36, 6); c.fillStyle = '#0F6E74'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.arc(0, 0, 25, 0, 7); c.fillStyle = '#0B3E52'; c.fill();
    c.strokeStyle = 'rgba(150,255,245,.35)'; c.lineWidth = 1.5;
    for (let r = 10; r <= 22; r += 6) { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }
    rr(c, -s / 2, -s / 2, s, s, 16); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
  function artBlades(c) {
    for (let i = 0; i < 4; i++) {
      c.save(); c.rotate(i * Math.PI / 2);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -12, 21, -2); c.quadraticCurveTo(12, 4, 0, 0);
      c.fillStyle = 'rgba(235,255,252,.92)'; c.fill(); c.restore();
    }
    c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fillStyle = '#FF6B5B'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
  }
  function artMarble(c) {
    const r = S.MARBLE_R;
    c.beginPath(); c.arc(0, 0, r, 0, 7);
    c.fillStyle = rg(c, -6, -7, 1, 0, 0, r, [[0, '#FFF6C8'], [0.35, '#FFD24A'], [0.85, '#F09A10'], [1, '#B86200']]); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip();
    c.strokeStyle = 'rgba(255,120,30,.55)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-r, 4); c.bezierCurveTo(-6, -12, 6, 16, r, -4); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-r, 9); c.bezierCurveTo(-6, -6, 6, 21, r, 2); c.stroke();
    c.restore();
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.strokeStyle = '#7A3A00'; c.lineWidth = 2.5; c.stroke();
  }
  function artHeavy(c) {
    const r = S.HEAVY_R;
    c.beginPath(); c.arc(0, 0, r, 0, 7);
    c.fillStyle = rg(c, -10, -10, 2, 0, 0, r, [[0, '#8E9BFF'], [0.3, '#4A55C8'], [0.8, '#1F2470'], [1, '#0F1140']]); c.fill();
    c.fillStyle = 'rgba(8,8,30,.85)';
    for (const [x, y, rr2] of [[6, -10, 4.5], [14, -2, 4.5], [4, 2, 5.5]]) { c.beginPath(); c.arc(x, y, rr2, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(160,170,255,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r - 6, 2.2, 3.6); c.stroke();
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.strokeStyle = '#090A28'; c.lineWidth = 3; c.stroke();
  }
  function artSpec(r) {
    return c => {
      c.fillStyle = rg(c, -r * 0.35, -r * 0.45, 0, -r * 0.35, -r * 0.45, r * 0.55, [[0, 'rgba(255,255,255,.95)'], [1, 'rgba(255,255,255,0)']]);
      c.beginPath(); c.ellipse(-r * 0.32, -r * 0.42, r * 0.45, r * 0.3, -0.6, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(r * 0.38, r * 0.45, r * 0.18, r * 0.09, -0.6, 0, 7); c.fill();
    };
  }

  function partSprite(type, it) {
    switch (type) {
      case 'shelf': { const w = it.w, h = it.h || 22, m = THEMES[curTheme()].shelf; return sprite(`shelf${w}x${h}${m}`, w, h, 6, artShelf(w, h, m)); }
      case 'conveyor': return sprite('conveyor', S.PARTS.conveyor.w, S.PARTS.conveyor.h, 6, artConveyor);
      case 'plank': return sprite('plank', S.PARTS.plank.w, S.PARTS.plank.h, 6, artPlank);
      case 'bouncer': return sprite('bouncer', S.PARTS.bouncer.w, S.PARTS.bouncer.h, 8, artBouncer);
      case 'seesaw': return sprite('seesaw', S.PARTS.seesaw.w, S.PARTS.seesaw.h, 8, artSeesaw);
      case 'domino': return sprite('domino', S.PARTS.domino.w, S.PARTS.domino.h, 6, artDomino);
      case 'fan': return sprite('fan', S.PARTS.fan.w + 10, S.PARTS.fan.h, 6, artFan);
      case 'marble': return sprite('marble', 40, 40, 4, artMarble);
      case 'heavy': return sprite('heavy', 60, 60, 4, artHeavy);
    }
  }

  // ---------- achtergronden per wereld ----------
  const THEMES = {
    playroom: { floor: ['#3B2A78', '#22194F'], mote: 'rgba(255,235,200,.5)', moteKind: 'dust', shelf: 'wood', accent: '#9B5DE5', card: ['#8E78F0', '#5A3FC0'] },
    kitchen: { floor: ['#5B6A8A', '#323C58'], mote: 'rgba(255,255,255,.35)', moteKind: 'steam', shelf: 'butcher', accent: '#2CCFC0', card: ['#4FD1C5', '#1C7F8C'] },
    garden: { floor: ['#2F7A3E', '#1A4A26'], mote: 'rgba(220,255,140,.9)', moteKind: 'firefly', shelf: 'rustic', accent: '#8AE234', card: ['#9BDB5A', '#3D8A2A'] },
    lab: { floor: ['#2A3A5C', '#151F36'], mote: 'rgba(120,255,240,.6)', moteKind: 'bubble', shelf: 'metal', accent: '#4CC9F0', card: ['#5AA8F0', '#2A4FB0'] },
    space: { floor: ['#2A2440', '#120F24'], mote: 'rgba(255,255,255,.9)', moteKind: 'star', shelf: 'metal', accent: '#FF6B8A', card: ['#C77BE8', '#5A2A9A'] },
  };
  function curTheme() { const inLevel = G.level && !['title', 'levels', 'wardrobe'].includes(G.screen); return inLevel ? (WORLDS[G.level.world - 1] || WORLDS[0]).theme : (WORLDS[G.screen === 'levels' ? (G.world || 0) : 0] || WORLDS[0]).theme; }
  function window_(x, X, Y, w, h, sky, border, moon) {
    x.save(); rr(x, X, Y, w, h, h / 2); x.fillStyle = lg(x, 0, Y, 0, Y + h, sky); x.fill(); x.clip();
    seed = 42; x.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 22; i++) { x.globalAlpha = 0.3 + rnd() * 0.7; x.beginPath(); x.arc(X + rnd() * w, Y + rnd() * h, rnd() * 1.5 + 0.4, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    if (moon) { x.fillStyle = rg(x, X + w * 0.7, Y + h * 0.35, 0, X + w * 0.7, Y + h * 0.35, 70, [[0, 'rgba(255,240,200,.35)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(X, Y, w, h);
      x.fillStyle = '#FFF2CC'; x.beginPath(); x.arc(X + w * 0.7, Y + h * 0.35, 22, 0, 7); x.fill(); }
    x.restore();
    rr(x, X, Y, w, h, h / 2); x.strokeStyle = border; x.lineWidth = 9; x.stroke();
    x.fillStyle = border; x.fillRect(X + w / 2 - 3, Y, 6, h); x.fillRect(X, Y + h / 2 - 3, w, 6);
  }
  function bgPlayroom(x) {
    x.fillStyle = lg(x, 0, 0, 0, H, [[0, '#2A2470'], [0.55, '#4A3A9E'], [1, '#6C4AAE']]); x.fillRect(0, 0, W, H);
    x.fillStyle = rg(x, 160, 40, 0, 160, 40, 700, [[0, 'rgba(255,200,140,.30)'], [1, 'rgba(255,200,140,0)']]); x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.035)';
    for (let yy = 20; yy < H; yy += 34) for (let xx = (yy / 34 % 2) * 17; xx < W; xx += 34) { x.beginPath(); x.arc(xx, yy, 2.2, 0, 7); x.fill(); }
    x.globalAlpha = 0.75; window_(x, 960, 80, 210, 160, [[0, '#1B1A55'], [1, '#3C2F8F']], '#C9B8F0', true); x.globalAlpha = 1;
    x.fillStyle = 'rgba(255,240,210,.04)'; x.beginPath(); x.moveTo(970, 235); x.lineTo(1160, 235); x.lineTo(900, 720); x.lineTo(560, 720); x.closePath(); x.fill();
    x.fillStyle = 'rgba(30,22,90,.55)'; rr(x, 40, 300, 260, 10, 4); x.fill(); rr(x, 360, 120, 300, 10, 4); x.fill();
    x.fillStyle = 'rgba(40,30,110,.6)';
    rr(x, 60, 250, 46, 50, 6); x.fill(); rr(x, 110, 266, 34, 34, 6); x.fill(); rr(x, 84, 216, 34, 34, 6); x.fill();
    x.beginPath(); x.moveTo(220, 300); x.lineTo(220, 230); x.quadraticCurveTo(240, 190, 260, 230); x.lineTo(260, 300); x.closePath(); x.fill();
    for (let i = 0; i < 6; i++) { rr(x, 380 + i * 18, 120 - (54 + (i % 3) * 10), 15, 54 + (i % 3) * 10, 3); x.fill(); }
    x.beginPath(); x.arc(560, 86, 24, 0, 7); x.arc(560, 46, 18, 0, 7); x.arc(546, 32, 7, 0, 7); x.arc(574, 32, 7, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,210,170,.18)'; x.fillRect(40, 300, 260, 2); x.fillRect(360, 120, 300, 2);
  }
  function bgKitchen(x) {
    x.fillStyle = lg(x, 0, 0, 0, H, [[0, '#0F3148'], [0.6, '#1B5468'], [1, '#2A6F7C']]); x.fillRect(0, 0, W, H);
    // metrotegels
    for (let yy = 0; yy < 600; yy += 30) for (let xx = (yy / 30 % 2) * 30 - 30; xx < W; xx += 60) {
      x.fillStyle = 'rgba(255,255,255,.035)'; rr(x, xx + 2, yy + 2, 56, 26, 6); x.fill();
      x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(xx + 6, yy + 4, 46, 2);
    }
    // hanglamp met warm licht
    x.fillStyle = rg(x, 640, 70, 0, 640, 70, 520, [[0, 'rgba(255,214,150,.38)'], [1, 'rgba(255,214,150,0)']]); x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(10,25,40,.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(640, 0); x.lineTo(640, 40); x.stroke();
    x.fillStyle = 'rgba(10,25,40,.8)'; x.beginPath(); x.moveTo(600, 70); x.quadraticCurveTo(640, 20, 680, 70); x.closePath(); x.fill();
    x.fillStyle = '#FFE2A8'; x.beginPath(); x.ellipse(640, 72, 16, 6, 0, 0, 7); x.fill();
    // pannen aan de wand
    x.fillStyle = 'rgba(8,24,38,.55)';
    x.fillRect(60, 70, 300, 6);
    for (const [px, r] of [[110, 34], [200, 26], [280, 30]]) { x.fillRect(px - 2, 76, 4, 30); x.beginPath(); x.arc(px, 106 + r, r, 0, 7); x.fill(); }
    // plank met potten
    x.fillRect(880, 160, 320, 8);
    for (const [px, w, h] of [[910, 40, 60], [970, 46, 46], [1040, 36, 70], [1100, 50, 52], [1160, 30, 40]]) { rr(x, px, 160 - h, w, h, 8); x.fill(); x.fillRect(px + 4, 160 - h - 8, w - 8, 9); }
    // klok
    x.beginPath(); x.arc(760, 210, 34, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 3; x.beginPath(); x.moveTo(760, 210); x.lineTo(760, 186); x.moveTo(760, 210); x.lineTo(776, 216); x.stroke();
  }
  function bgGarden(x) {
    x.fillStyle = lg(x, 0, 0, 0, 600, [[0, '#1F1650'], [0.45, '#5A2E78'], [0.8, '#C2507A'], [1, '#F59A5D']]); x.fillRect(0, 0, W, H);
    // zon achter de heuvels
    x.fillStyle = rg(x, 900, 520, 0, 900, 520, 330, [[0, 'rgba(255,210,120,.55)'], [1, 'rgba(255,210,120,0)']]); x.fillRect(0, 0, W, H);
    x.fillStyle = '#FFD27A'; x.beginPath(); x.arc(900, 520, 70, 0, 7); x.fill();
    seed = 9; x.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 40; i++) { x.globalAlpha = rnd() * 0.6; x.beginPath(); x.arc(rnd() * W, rnd() * 260, rnd() * 1.4 + 0.3, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    const hill = (col, base, amp, f, ph) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 600); for (let xx = 0; xx <= W; xx += 20) x.lineTo(xx, base - Math.sin(xx * f + ph) * amp - Math.sin(xx * f * 2.3 + ph) * amp * 0.3); x.lineTo(W, 600); x.closePath(); x.fill(); };
    hill('#5B3478', 470, 40, 0.004, 1); hill('#3E2766', 520, 30, 0.006, 3); hill('#2A1E52', 560, 20, 0.009, 5);
    // hekje
    x.fillStyle = 'rgba(20,12,45,.75)';
    for (let xx = 10; xx < W; xx += 34) { x.beginPath(); x.moveTo(xx, 600); x.lineTo(xx, 548); x.lineTo(xx + 9, 538); x.lineTo(xx + 18, 548); x.lineTo(xx + 18, 600); x.fill(); }
    x.fillRect(0, 560, W, 6); x.fillRect(0, 584, W, 6);
    // bloemen
    seed = 3; for (let i = 0; i < 18; i++) { const fx = rnd() * W, fy = 600 - rnd() * 20; x.fillStyle = 'rgba(20,12,45,.8)'; x.fillRect(fx, fy - 30, 2, 30);
      x.fillStyle = ['rgba(255,120,150,.7)', 'rgba(255,220,120,.7)', 'rgba(200,160,255,.7)'][i % 3]; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(fx + 1 + Math.cos(k * 1.26) * 5, fy - 32 + Math.sin(k * 1.26) * 5, 4, 0, 7); x.fill(); } }
  }
  function bgLab(x) {
    x.fillStyle = lg(x, 0, 0, 0, H, [[0, '#0B1630'], [0.6, '#132A4C'], [1, '#1A3558']]); x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(120,200,255,.06)'; x.lineWidth = 2;
    for (let xx = 0; xx < W; xx += 160) { x.strokeRect(xx + 4, 4, 152, 592); }
    for (let xx = 0; xx < W; xx += 160) for (const yy of [20, 580]) { x.fillStyle = 'rgba(150,200,255,.12)'; x.beginPath(); x.arc(xx + 14, yy, 3, 0, 7); x.arc(xx + 146, yy, 3, 0, 7); x.fill(); }
    // buizen bovenin
    x.fillStyle = 'rgba(40,70,110,.8)'; rr(x, 0, 64, W, 16, 8); x.fill(); rr(x, 300, 64, 16, 120, 8); x.fill(); rr(x, 300, 170, 200, 14, 7); x.fill();
    // monitoren met grafiek
    for (const [mx, my] of [[880, 120], [1060, 120]]) {
      rr(x, mx, my, 150, 96, 10); x.fillStyle = '#0A2238'; x.fill(); x.strokeStyle = 'rgba(80,140,200,.5)'; x.lineWidth = 3; x.stroke();
      x.fillStyle = rg(x, mx + 75, my + 48, 0, mx + 75, my + 48, 100, [[0, 'rgba(60,255,220,.18)'], [1, 'rgba(60,255,220,0)']]); x.fillRect(mx - 40, my - 40, 230, 176);
      x.strokeStyle = 'rgba(90,255,220,.75)'; x.lineWidth = 2; x.beginPath();
      for (let i = 0; i <= 13; i++) x.lineTo(mx + 10 + i * 10, my + 60 - Math.sin(i * 0.9 + mx) * 18 - i * 1.5); x.stroke();
    }
    // erlenmeyers met gloeiende vloeistof
    for (const [fx, col] of [[80, '90,255,160'], [160, '255,110,200'], [230, '120,200,255']]) {
      x.fillStyle = 'rgba(20,40,70,.85)'; x.beginPath(); x.moveTo(fx - 8, 210); x.lineTo(fx + 8, 210); x.lineTo(fx + 8, 240); x.lineTo(fx + 30, 290); x.lineTo(fx - 30, 290); x.lineTo(fx - 8, 240); x.closePath(); x.fill();
      x.fillStyle = `rgba(${col},.65)`; x.beginPath(); x.moveTo(fx - 19, 266); x.lineTo(fx + 19, 266); x.lineTo(fx + 28, 287); x.lineTo(fx - 28, 287); x.closePath(); x.fill();
      x.fillStyle = rg(x, fx, 275, 0, fx, 275, 60, [[0, `rgba(${col},.25)`], [1, `rgba(${col},0)`]]); x.fillRect(fx - 60, 215, 120, 120);
    }
    x.fillStyle = 'rgba(20,40,70,.85)'; x.fillRect(40, 290, 240, 8);
  }
  function bgSpace(x) {
    x.fillStyle = lg(x, 0, 0, 0, H, [[0, '#05041A'], [0.6, '#140C38'], [1, '#22104A']]); x.fillRect(0, 0, W, H);
    for (const [nx, ny, r, col] of [[300, 200, 380, '200,80,220'], [1000, 160, 320, '60,120,255'], [700, 450, 300, '255,90,140']]) {
      x.fillStyle = rg(x, nx, ny, 0, nx, ny, r, [[0, `rgba(${col},.22)`], [1, `rgba(${col},0)`]]); x.fillRect(0, 0, W, H);
    }
    seed = 77; for (let i = 0; i < 160; i++) { x.globalAlpha = 0.2 + rnd() * 0.8; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(rnd() * W, rnd() * 600, rnd() * 1.4 + 0.2, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    // planeet met ring
    x.save(); x.translate(1110, 150);
    x.fillStyle = rg(x, -20, -20, 4, 0, 0, 60, [[0, '#FFB38A'], [0.6, '#E0606E'], [1, '#6A2A6A']]); x.beginPath(); x.arc(0, 0, 56, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,220,180,.55)'; x.lineWidth = 6; x.beginPath(); x.ellipse(0, 0, 100, 22, -0.3, 0, 7); x.stroke();
    x.restore();
    x.globalAlpha = 0.7; x.fillStyle = rg(x, 74, 452, 2, 80, 460, 22, [[0, '#E8E4FF'], [1, '#8A84C0']]); x.beginPath(); x.arc(80, 460, 18, 0, 7); x.fill();
    x.fillStyle = 'rgba(90,80,140,.5)'; x.beginPath(); x.arc(74, 455, 4, 0, 7); x.arc(86, 466, 3, 0, 7); x.fill(); x.globalAlpha = 1;
  }
  const bgCache = {};
  function buildBackground(theme) {
    const c = document.createElement('canvas'); c.width = W * RS; c.height = H * RS;
    const x = c.getContext('2d'); x.scale(RS, RS);
    ({ playroom: bgPlayroom, kitchen: bgKitchen, garden: bgGarden, lab: bgLab, space: bgSpace })[theme](x);
    const T = THEMES[theme];
    // vloer
    x.fillStyle = lg(x, 0, 600, 0, H, [[0, T.floor[0]], [1, T.floor[1]]]); x.fillRect(0, 600, W, 120);
    x.fillStyle = 'rgba(255,240,220,.12)'; x.fillRect(0, 600, W, 2);
    if (theme === 'lab' || theme === 'space') { x.fillStyle = 'rgba(255,200,60,.22)'; for (let xx = -20; xx < W; xx += 40) { x.beginPath(); x.moveTo(xx, 602); x.lineTo(xx + 20, 602); x.lineTo(xx + 10, 614); x.lineTo(xx - 10, 614); x.fill(); } }
    else for (let xx = 0; xx < W; xx += 160) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(xx, 602, 2, 118); }
    // vignet
    x.fillStyle = rg(x, W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, W * 0.75, [[0, 'rgba(10,5,30,0)'], [1, 'rgba(10,5,30,.55)']]); x.fillRect(0, 0, W, H);
    bgCache[theme] = { c, rs: RS };
  }
  const motes = Array.from({ length: 44 }, () => ({ x: Math.random() * W, y: Math.random() * 600, r: 0.6 + Math.random() * 1.8, s: 0.1 + Math.random() * 0.35, p: Math.random() * 6 }));
  function drawBackground(t) {
    const theme = curTheme(), T = THEMES[theme];
    if (!bgCache[theme] || bgCache[theme].rs !== RS) buildBackground(theme);
    ctx.drawImage(bgCache[theme].c, 0, 0, W, H);
    ctx.fillStyle = T.mote;
    for (const m of motes) {
      const k = T.moteKind;
      if (k === 'star') { ctx.globalAlpha = Math.max(0, Math.sin(t * 2 + m.p * 3)) * 0.9; star5(ctx, m.x, m.y * 0.9, m.r * 2.2, 0.35); ctx.fill(); continue; }
      m.y -= m.s * (k === 'steam' ? 0.6 : k === 'bubble' ? 0.9 : 0.3); m.x += Math.sin(t * (k === 'firefly' ? 1.4 : 0.6) + m.p) * (k === 'firefly' ? 0.6 : 0.15);
      if (m.y < 40) { m.y = 600; m.x = Math.random() * W; }
      if (k === 'firefly') { ctx.globalAlpha = Math.max(0, Math.sin(t * 2.2 + m.p * 2)) * 0.9; ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 1, 0, 7); ctx.fill(); ctx.globalAlpha *= 0.25; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, 7); ctx.fill(); }
      else if (k === 'bubble') { ctx.globalAlpha = 0.35; ctx.strokeStyle = T.mote; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 2.2, 0, 7); ctx.stroke(); }
      else if (k === 'steam') { ctx.globalAlpha = 0.07 + 0.05 * Math.sin(t + m.p); ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 9, 0, 7); ctx.fill(); }
      else { ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.5 + m.p); ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Bobo ----------
  const bobo = { mood: 'idle', blink: 0, nextBlink: 2, look: { x: 0, y: 0 }, mouth: 0.15, chomp: 0, squash: 0, happy: 0, sad: 0, t: 0 };
  function drawBobo(x, y, R, t, target, opts = {}) {
    const b = bobo;
    const breathe = Math.sin(t * 2.4) * 0.025;
    let sq = breathe + b.squash * Math.sin(t * 28) * Math.exp(-b.chomp * 0) * 0.0;
    const hop = b.happy > 0 ? Math.abs(Math.sin(t * 9)) * 16 * Math.min(1, b.happy) : 0;
    const sadDrop = b.sad > 0 ? 6 * Math.min(1, b.sad) : 0;
    const chomp = b.chomp;
    const sx = 1 + sq + chomp * 0.08 + (b.happy > 0 ? Math.sin(t * 18) * 0.04 : 0), sy = 1 - sq - chomp * 0.06;
    const cy = y - hop + sadDrop;
    // glow + schaduw
    ctx.save();
    ctx.fillStyle = rg(ctx, x, cy, R * 0.6, x, cy, R * 2.1, [[0, 'rgba(255,215,90,.30)'], [1, 'rgba(255,215,90,0)']]);
    ctx.beginPath(); ctx.arc(x, cy, R * 2.1, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(10,5,35,.35)'; ctx.beginPath(); ctx.ellipse(x, y + R * 0.95, R * (0.95 - hop / 80), R * 0.18, 0, 0, 7); ctx.fill();
    ctx.translate(x, cy + R * 0.9); ctx.scale(sx, sy); ctx.translate(0, -R * 0.9);
    // lijf (wiebelende blob)
    ctx.beginPath();
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const a = i / N * Math.PI * 2;
      const wob = 1 + Math.sin(a * 3 + t * 3.1) * 0.018 + Math.sin(a * 5 - t * 2.3) * 0.012;
      let rx = R * wob, ry = R * wob * (a > 0 && a < Math.PI ? 0.92 : 1.0);
      const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = rg(ctx, -R * 0.3, -R * 0.4, R * 0.1, 0, 0, R * 1.05, [[0, '#FFF59A'], [0.45, '#FFD93D'], [0.85, '#FFAE1F'], [1, '#F08A12']]);
    ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#7A3A08'; ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,140,20,.35)'; ctx.beginPath(); ctx.ellipse(0, R * 0.75, R * 0.95, R * 0.45, 0, 0, 7); ctx.fill();
    ctx.restore();
    // blaadje
    ctx.save(); ctx.translate(4, -R * 0.95); ctx.rotate(Math.sin(t * 2) * 0.15 + 0.2);
    ctx.strokeStyle = '#3E7A1A'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(0, 6); ctx.quadraticCurveTo(-2, -6, 4, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -14); ctx.quadraticCurveTo(24, -28, 30, -10); ctx.quadraticCurveTo(14, -2, 4, -14);
    ctx.fillStyle = lg(ctx, 4, -24, 30, -6, [[0, '#B8F56A'], [1, '#5FB82A']]); ctx.fill(); ctx.strokeStyle = '#2E5A12'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
    // ogen
    const lk = b.look;
    for (const ex of [-R * 0.36, R * 0.36]) {
      const ey = -R * 0.18;
      const blinkS = b.blink > 0 ? 0.1 : (b.happy > 0 ? 0.0 : 1);
      ctx.save(); ctx.translate(ex, ey);
      if (b.happy > 0 && b.blink <= 0) { // ^ ^ ogen
        ctx.strokeStyle = '#2A1240'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-11, 4); ctx.quadraticCurveTo(0, -12, 11, 4); ctx.stroke();
      } else {
        ctx.scale(1, blinkS);
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.22, R * 0.26, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#7A3A08'; ctx.lineWidth = 3; ctx.stroke();
        const px = lk.x * R * 0.09, py = lk.y * R * 0.1;
        ctx.fillStyle = '#2A1240'; ctx.beginPath(); ctx.arc(px, py, R * 0.12, 0, 7); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(px - R * 0.04, py - R * 0.05, R * 0.04, 0, 7); ctx.fill();
        if (b.sad > 0) { ctx.strokeStyle = '#7A3A08'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, -R * 0.32 + (ex < 0 ? 6 : 0)); ctx.lineTo(14, -R * 0.32 + (ex < 0 ? 0 : 6)); ctx.stroke(); }
      }
      ctx.restore();
    }
    // wangen
    ctx.fillStyle = 'rgba(255,100,110,.45)';
    ctx.beginPath(); ctx.ellipse(-R * 0.62, R * 0.12, R * 0.14, R * 0.08, 0, 0, 7); ctx.ellipse(R * 0.62, R * 0.12, R * 0.14, R * 0.08, 0, 0, 7); ctx.fill();
    // mond
    const mo = clamp(b.mouth, 0, 1) * (1 - chomp);
    ctx.save(); ctx.translate(0, R * 0.28);
    if (b.sad > 0) {
      ctx.strokeStyle = '#2A1240'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-R * 0.22, R * 0.08); ctx.quadraticCurveTo(0, -R * 0.12, R * 0.22, R * 0.08); ctx.stroke();
    } else if (mo < 0.12 || chomp > 0.5) {
      ctx.strokeStyle = '#2A1240'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      const wdt = chomp > 0.5 ? R * 0.3 : R * 0.26;
      ctx.beginPath(); ctx.moveTo(-wdt, -2); ctx.quadraticCurveTo(0, R * 0.2, wdt, -2); ctx.stroke();
      if (chomp > 0.5) { ctx.fillStyle = '#FF6B8A'; ctx.beginPath(); ctx.ellipse(R * 0.1, R * 0.12, 6, 4, 0, 0, 7); ctx.fill(); }
    } else {
      const mw = R * (0.26 + mo * 0.16), mh = R * (0.1 + mo * 0.42);
      ctx.beginPath(); ctx.ellipse(0, mh * 0.35, mw, mh, 0, 0, 7);
      ctx.fillStyle = '#5A1430'; ctx.fill(); ctx.strokeStyle = '#2A1240'; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#FF6B8A'; ctx.beginPath(); ctx.ellipse(0, mh * 1.05, mw * 0.7, mh * 0.55, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; rr(ctx, -mw * 0.45, mh * 0.35 - mh, mw * 0.9, mh * 0.28, 4); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // glans
    ctx.fillStyle = rg(ctx, -R * 0.45, -R * 0.55, 0, -R * 0.45, -R * 0.55, R * 0.45, [[0, 'rgba(255,255,255,.85)'], [1, 'rgba(255,255,255,0)']]);
    ctx.beginPath(); ctx.ellipse(-R * 0.45, -R * 0.55, R * 0.32, R * 0.2, -0.5, 0, 7); ctx.fill();
    const hat = opts.outfit || save.outfit;
    if (hat && hat !== 'none') drawHat(hat, R);
    ctx.restore();
  }
  function updateBobo(dt, x, y, target) {
    const b = bobo;
    b.t += dt;
    b.nextBlink -= dt; if (b.nextBlink < 0) { b.blink = 0.12; b.nextBlink = 2 + Math.random() * 3; }
    b.blink -= dt;
    let lx = 0, ly = 0, mouthT = 0.15;
    if (target) {
      const dx = target.x - x, dy = target.y - y, d = Math.hypot(dx, dy) || 1;
      lx = dx / d; ly = dy / d;
      mouthT = d < 360 ? clamp(1 - (d - 70) / 290, 0.15, 1) : 0.15;
    }
    b.look.x = lerp(b.look.x, lx, 0.15); b.look.y = lerp(b.look.y, ly, 0.15);
    b.mouth = lerp(b.mouth, mouthT, 0.2);
    if (b.chomp > 0 && b.mood !== 'won') b.chomp = Math.max(0, b.chomp - dt * 2);
    if (b.mood === 'won') b.chomp = Math.min(1, b.chomp + dt * 8);
    b.happy = b.mood === 'won' ? b.happy + dt : 0;
    b.sad = b.mood === 'lost' ? b.sad + dt : 0;
  }

  // ---------- particles ----------
  const parts = [];
  const CONF = ['#FF6B5B', '#FFC93C', '#4CC9F0', '#8AE234', '#C79BFF', '#FFFFFF'];
  function puff(x, y, n = 6, col = 'rgba(255,255,255,.7)') {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 0.5 + Math.random() * 2; parts.push({ k: 'puff', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, r: 4 + Math.random() * 6, life: 0.5 + Math.random() * 0.3, t: 0, col }); }
  }
  function sparkle(x, y, n = 10) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 2 + Math.random() * 5; parts.push({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 4 + Math.random() * 5, life: 0.6 + Math.random() * 0.4, t: 0, col: Math.random() < 0.5 ? '#FFF2A8' : '#FFFFFF' }); }
  }
  function confetti(x, y, n = 90) {
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, s = 6 + Math.random() * 10; parts.push({ k: 'conf', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 2.2 + Math.random(), t: 0, col: CONF[i % CONF.length] }); }
  }
  function ring(x, y, col = 'rgba(255,255,255,.9)') { parts.push({ k: 'ring', x, y, life: 0.45, t: 0, col }); }
  function wind(x, y, dir) { parts.push({ k: 'wind', x: x + dir * 40, y: y + (Math.random() - 0.5) * 70, vx: dir * (6 + Math.random() * 4), vy: 0, len: 20 + Math.random() * 30, life: 0.5 + Math.random() * 0.3, t: 0 }); }
  function updateParticles(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt;
      if (p.t > p.life) { parts.splice(i, 1); continue; }
      if (p.k === 'conf') { p.vy += 0.35; p.vx *= 0.985; p.vy *= 0.985; p.rot += p.vr; p.x += p.vx; p.y += p.vy; }
      else if (p.vx !== undefined) { p.x += p.vx; p.y += p.vy; if (p.k !== 'wind') { p.vx *= 0.93; p.vy *= 0.93; } }
    }
  }
  function star5(c, x, y, r, inner = 0.45) {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
    c.closePath();
  }
  function drawParticles() {
    for (const p of parts) {
      const k = 1 - p.t / p.life;
      if (p.k === 'puff') { ctx.globalAlpha = k * 0.8; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - k * 0.6), 0, 7); ctx.fill(); }
      else if (p.k === 'spark') { ctx.globalAlpha = k; ctx.fillStyle = p.col; star5(ctx, p.x, p.y, p.r * k + 1, 0.4); ctx.fill(); }
      else if (p.k === 'conf') { ctx.globalAlpha = Math.min(1, k * 2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.rot * 2)); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
      else if (p.k === 'ring') { ctx.globalAlpha = k; ctx.strokeStyle = p.col; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.ellipse(p.x, p.y, 20 + (1 - k) * 60, 8 + (1 - k) * 24, 0, 0, 7); ctx.stroke(); }
      else if (p.k === 'text') { ctx.globalAlpha = Math.min(1, k * 2.5); textOut(p.text, p.x, p.y, p.size, '#FFE66B', OUT, 5); }
      else if (p.k === 'wind') { ctx.globalAlpha = k * 0.5; ctx.strokeStyle = '#DFFFFB'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - Math.sign(p.vx) * p.len, p.y); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- game state ----------
  const save = { stars: {}, best: {}, fails: {}, skipped: {}, outfit: 'none', daily: { done: {}, count: 0 }, seenParts: {} };
  try { Object.assign(save, JSON.parse(localStorage.getItem('plonk_save') || '{}')); } catch (e) {}
  for (const k of ['stars', 'best', 'fails', 'skipped', 'seenParts']) if (!save[k] || typeof save[k] !== 'object') save[k] = {};
  if (!save.daily || typeof save.daily !== 'object') save.daily = {};
  if (!save.daily.done || typeof save.daily.done !== 'object') save.daily.done = {};
  if (!save.daily.pick || typeof save.daily.pick !== 'object') save.daily.pick = {};
  if (typeof save.daily.count !== 'number') save.daily.count = 0;
  if (typeof save.outfit !== 'string') save.outfit = 'none';
  function persist() { try { localStorage.setItem('plonk_save', JSON.stringify(save)); } catch (e) {} }

  const G = {
    screen: 'title', t: 0, levelIdx: 0, level: null, placements: [], sim: null,
    drag: null, selected: -1, hint: null, hintsUsed: 0, toast: null, shake: 0, winAt: 0, result: null,
    slow: 1, banner: 0, eaten: 0, parTime: {}, fanSpin: 0, buttons: [], hover: null,
  };
  for (const L of LEVELS) { const s = S.createSim(L, L.solution).runToEnd(); G.parTime[L.id] = Math.ceil(s.t * 1.25 * 10) / 10; }

  function lastOpenWorld() { let w = 0; for (let k = 0; k < WORLDS.length; k++) if (worldOpen(k)) w = k; return w; }
  function unlocked(i) { return i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0 || !!save.skipped[LEVELS[i - 1].id]; }
  function remaining(type) { return (G.level.inventory[type] || 0) - G.placements.filter(p => p.type === type).length; }
  function boboItem() { return G.level.items.find(i => i.type === 'bobo'); }


  // ---------- meta: outfits, dagpuzzel, hulp ----------
  // Outfits = verzamelbare beloning (goal-gradient + endowed progress: de eerste komt al na level 1)
  const OUTFITS = [
    { id: 'none', name: 'Gewoon Bobo', need: 0 },
    { id: 'party', name: 'Feesthoedje', need: 3 },
    { id: 'chef', name: 'Koksmuts', need: 12 },
    { id: 'flower', name: 'Bloemenkrans', need: 22 },
    { id: 'goggles', name: 'Labbril', need: 34 },
    { id: 'helmet', name: 'Ruimtehelm', need: 48 },
    { id: 'crown', name: 'Gouden kroon', need: 66 },
    { id: 'shades', name: 'Zonnebril', daily: 3 },
  ];
  const totalStars = () => LEVELS.reduce((a, L) => a + (save.stars[L.id] || 0), 0);
  const outfitOpen = o => (o.daily ? (save.daily.count || 0) >= o.daily : totalStars() >= o.need);
  const nextOutfit = () => OUTFITS.filter(o => !o.daily && !outfitOpen(o))[0] || null;
  function dateKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function dailyChallenge() {
    const solved = LEVELS.map((L, i) => ({ L, i })).filter(o => (save.stars[o.L.id] || 0) > 0 && !o.L.tutorial);
    if (solved.length < 2) return null;
    const key = dateKey(); let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    let pi = save.daily.pick[key];
    if (!(pi >= 0 && pi < LEVELS.length)) { pi = solved[h % solved.length].i; save.daily.pick = { [key]: pi }; persist(); } // vastleggen voor vandaag
    const pick = { i: pi, L: LEVELS[pi] };
    return { key, i: pick.i, L: pick.L, goal: Math.round(G.parTime[pick.L.id] * 0.9 * 10) / 10, done: !!save.daily.done[key] };
  }
  // welke onderdeeltypes zijn nieuw in dit level? (nieuwsgierigheid: 'Nieuw onderdeel!')
  function newPartsIn(idx) {
    const before = new Set(); for (let k = 0; k < idx; k++) Object.keys(LEVELS[k].inventory).forEach(t => before.add(t));
    return Object.keys(LEVELS[idx].inventory).filter(t => !before.has(t));
  }
  function drawHat(id, R) {
    ctx.save(); ctx.lineJoin = 'round';
    if (id === 'party') {
      ctx.translate(R * 0.18, -R * 0.82); ctx.rotate(0.25);
      ctx.beginPath(); ctx.moveTo(-R * 0.34, 0); ctx.lineTo(0, -R * 0.8); ctx.lineTo(R * 0.34, 0); ctx.closePath();
      ctx.fillStyle = lg(ctx, -R * 0.3, 0, R * 0.3, -R * 0.6, [[0, '#FF6B8A'], [1, '#FFB3C4']]); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#FFE66B'; for (const [x, y] of [[-8, -10], [6, -26], [-2, -42], [10, -8]]) { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); } ctx.restore();
      ctx.fillStyle = '#4CC9F0'; ctx.beginPath(); ctx.arc(0, -R * 0.82, 7, 0, 7); ctx.fill(); ctx.stroke();
    } else if (id === 'chef') {
      ctx.translate(0, -R * 0.78);
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = OUT; ctx.lineWidth = 3;
      rr(ctx, -R * 0.42, -R * 0.12, R * 0.84, R * 0.28, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-R * 0.26, -R * 0.32, R * 0.26, 0, 7); ctx.arc(R * 0.26, -R * 0.32, R * 0.26, 0, 7); ctx.arc(0, -R * 0.5, R * 0.3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(-R * 0.26, -R * 0.32, R * 0.26, 2.2, 5.6); ctx.stroke(); ctx.beginPath(); ctx.arc(R * 0.26, -R * 0.32, R * 0.26, 3.8, 1); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -R * 0.5, R * 0.3, 3.4, 6.0); ctx.stroke();
    } else if (id === 'flower') {
      for (let k = 0; k < 7; k++) {
        const a = Math.PI + 0.35 + k * (Math.PI - 0.7) / 6, fx = Math.cos(a) * R * 0.86, fy = Math.sin(a) * R * 0.8;
        ctx.fillStyle = ['#FF6B8A', '#FFE66B', '#C79BFF', '#FFFFFF'][k % 4];
        for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.arc(fx + Math.cos(q * 1.26) * 6, fy + Math.sin(q * 1.26) * 6, 5.5, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#F08A12'; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, 7); ctx.fill();
      }
    } else if (id === 'goggles') {
      ctx.strokeStyle = '#2A1240'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -R * 0.1, R * 0.98, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      for (const gx of [-R * 0.34, R * 0.34]) { ctx.beginPath(); ctx.arc(gx, -R * 0.62, R * 0.2, 0, 7); ctx.fillStyle = 'rgba(120,255,240,.75)'; ctx.fill(); ctx.strokeStyle = '#5B6688'; ctx.lineWidth = 5; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(gx - 5, -R * 0.68, 4, 0, 7); ctx.fill(); }
    } else if (id === 'helmet') {
      ctx.beginPath(); ctx.arc(0, 0, R * 1.22, 0, 7); ctx.fillStyle = 'rgba(180,230,255,.18)'; ctx.fill();
      ctx.strokeStyle = 'rgba(220,245,255,.85)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-R * 0.6, -R * 0.7, R * 0.22, R * 0.1, -0.7, 0, 7); ctx.fill();
      rr(ctx, -R * 0.9, R * 0.92, R * 1.8, R * 0.26, 8); ctx.fillStyle = '#E8ECF6'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    } else if (id === 'crown') {
      ctx.translate(0, -R * 0.82);
      ctx.beginPath(); ctx.moveTo(-R * 0.48, 0); ctx.lineTo(-R * 0.52, -R * 0.42); ctx.lineTo(-R * 0.24, -R * 0.2); ctx.lineTo(0, -R * 0.52); ctx.lineTo(R * 0.24, -R * 0.2); ctx.lineTo(R * 0.52, -R * 0.42); ctx.lineTo(R * 0.48, 0); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, -R * 0.5, 0, 0, [[0, '#FFF59A'], [0.5, '#FFC93C'], [1, '#D88A0E']]); ctx.fill(); ctx.strokeStyle = '#7A3A08'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#FF6B8A'; ctx.beginPath(); ctx.arc(0, -R * 0.16, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#4CC9F0'; ctx.beginPath(); ctx.arc(-R * 0.28, -R * 0.1, 4, 0, 7); ctx.arc(R * 0.28, -R * 0.1, 4, 0, 7); ctx.fill();
    } else if (id === 'shades') {
      ctx.fillStyle = '#1A1030'; ctx.strokeStyle = '#1A1030'; ctx.lineWidth = 4;
      for (const gx of [-R * 0.36, R * 0.36]) { rr(ctx, gx - R * 0.25, -R * 0.36, R * 0.5, R * 0.34, 10); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-R * 0.12, -R * 0.24); ctx.lineTo(R * 0.12, -R * 0.24); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; for (const gx of [-R * 0.42, R * 0.3]) { ctx.beginPath(); ctx.ellipse(gx, -R * 0.28, 7, 3, -0.4, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  function drawOutfitBar(cx, cy, w) {
    const nx = nextOutfit(), tot = totalStars();
    panel(cx - w / 2, cy - 26, w, 52, 26, 0.78);
    if (!nx) { textOut(tr('allOutfits'), cx, cy, 20, '#FFE66B', OUT, 4); return; }
    const prev = OUTFITS.filter(o => !o.daily && outfitOpen(o)).slice(-1)[0], from = prev ? prev.need : 0;
    const k = clamp((tot - from) / (nx.need - from), 0, 1);
    const bx = cx - w / 2 + 52, bw = w - 200;
    drawStar(cx - w / 2 + 28, cy, 14, true);
    rr(ctx, bx, cy - 9, bw, 18, 9); ctx.fillStyle = 'rgba(10,5,35,.6)'; ctx.fill();
    if (k > 0) { rr(ctx, bx, cy - 9, Math.max(18, bw * k), 18, 9); ctx.fillStyle = lg(ctx, bx, 0, bx + bw, 0, [[0, '#FFE66B'], [1, '#FF9C3C']]); ctx.fill(); }
    textOut(`${tot} / ${nx.need}`, bx + bw / 2, cy + 1, 15, '#FFFFFF', OUT, 4);
    ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#FFF4E0'; ctx.fillText(oname(nx), bx + bw + 14, cy + 1);
  }

  // ---------- analytics: Poki game events (PokiSDK.measure) ----------
  // Zelfde opzet als Prismatic: één funnel per POGING (start → complete/fail), speeltijd-mijlpalen vanaf de
  // eerste input, 'where' (waar is de speler na 1/3/5 min), terugkeer per dag en een funnel per versie (+ A/B-groep).
  // Volledige lijst: EVENTS.md
  const M = (c, w, a) => Poki.measure(c, w, a);
  const GAME_VERSION = '13';
  const AB = (() => {                              // A/B-groep: ?ab=a of ?ab=b, anders opgeslagen; standaard 'a' (geen test actief)
    try { const q = new URLSearchParams(location.search).get('ab'); if (q === 'a' || q === 'b') { localStorage.setItem('plonk_ab', q); return q; } } catch (e) {}
    try { const g = localStorage.getItem('plonk_ab'); if (g === 'a' || g === 'b') return g; } catch (e) {}
    return 'a';
  })();
  const vSent = {};
  function vMeasure(what) { if (vSent[what]) return; vSent[what] = 1; M('version', GAME_VERSION + AB, what); } // per versie te splitsen
  let attempt = null, firstInput = 0, perfectStreak = 0, attemptFailed = false;
  const MILESTONES = [1, 2, 3, 5, 8, 12, 20], msSent = {};
  const sentOnce = {};
  const once = (c, w, a) => { const k = c + '|' + w + '|' + a; if (sentOnce[k]) return; sentOnce[k] = 1; M(c, w, a); };
  function attemptKey() { if (!G.level) return null; return G.daily ? ['daily', 'puzzle'] : ['level', String(G.level.id)]; }
  function trackStart() {
    const k = attemptKey(); if (!k || attempt) return;
    if (k[0] === 'level' && ['5', '10', '15', '20', '25'].includes(k[1])) vMeasure('level' + k[1]); // eind van elke wereld
    attempt = { c: k[0], w: k[1] }; M(k[0], k[1], 'start');
  }
  function trackEnd(how) {
    if (!attempt) return; M(attempt.c, attempt.w, how);
    if (how === 'complete' && attempt.c === 'level' && attempt.w === '1') M('tutorial', 'hand', 'complete');
    attempt = null;
  }
  function act() { if (!firstInput) { firstInput = performance.now(); M('session', 'first-input', 'interact'); vMeasure('first-input'); } }
  function where() { if (G.screen === 'title') return 'title'; if (G.screen === 'levels') return 'menu'; if (G.screen === 'wardrobe') return 'wardrobe'; return G.daily ? 'daily' : G.level ? 'level' + G.level.id : G.screen; }
  function sessionTick(now) {
    if (!firstInput) return; const m = (now - firstInput) / 60000;
    for (const k of MILESTONES) if (m >= k && !msSent[k]) {
      msSent[k] = true; M('session', 'played', k + 'min');
      if (k === 1 || k === 3 || k === 5) M('where', k + 'min', where());
      if (k === 1 || k === 3 || k === 5 || k === 12 || k === 20) vMeasure(k + 'min');
    }
  }
  function sessionOpen() {
    M('session', 'first-input', 'visible'); vMeasure('load');
    const today = Math.floor(Date.now() / 864e5 - new Date().getTimezoneOffset() / 1440);
    let last = null; try { last = JSON.parse(localStorage.getItem('plonk_lastday')); } catch (e) {}
    if (typeof last === 'number' && last <= today) {
      const d = today - last, tag = d === 0 ? 'sameday' : d === 1 ? 'day1' : d <= 3 ? 'day2-3' : d <= 7 ? 'day4-7' : 'day8plus';
      M('session', 'return', tag); vMeasure('return'); if (d >= 1) vMeasure('return-nextday');
    } else M('session', 'new', 'visit');
    try { localStorage.setItem('plonk_lastday', JSON.stringify(today)); } catch (e) {}
  }

  function startLevel(i, opts) {
    trackEnd('fail');                              // ander level gekozen terwijl een poging liep
    G.levelIdx = i; G.level = LEVELS[i]; G.placements = []; G.sim = null; G.selected = -1; G.hint = null; G.hintsUsed = 0;
    G.screen = 'build'; G.banner = 0; G.result = null; parts.length = 0; bobo.mood = 'idle'; bobo.chomp = 0; G.eaten = 0;
    G.toast = null; G.intro = G.level.tutorial ? null : { t0: G.t, out: -1 }; // tutorial: meteen spelen (Poki: plezier binnen 10 seconden)
    if (G.level.tutorial) G.hint = { ...G.level.solution[0], born: G.t };
    G.attempts = 0; G.freeHint = false; G.freeOffered = false; G.offerSkip = false; G.lastTrail = null; G.newParts = newPartsIn(i); G.daily = (opts && opts.daily) || null;
    attemptFailed = false; G.hintSent = {}; G.startsThisLevel = 0; G.startHintShown = false; G.lastInput = G.t;
    trackStart();
    Poki.gameplayStart();
  }
  function play(via) {
    if (G.screen !== 'build' || G.busy || G.intro) return;
    if (!G.placements.length) {                    // v1.2: geen lege (kansloze) poging; wijs naar de onderdelenbalk
      SFX.bad(); G.nudgeAt = G.t; G.toast = { text: tr('placeFirst'), t: 0, dur: 3 };
      once('help', 'place-first', 'visible'); G.placeFirstPending = true; return;
    }
    M('start', via || 'button', 'interact'); G.startsThisLevel = (G.startsThisLevel || 0) + 1;
    if (G.pressHintPending) { G.pressHintPending = false; once('help', 'press-start', 'interact'); }
    SFX.start();
    G.sim = S.createSim(G.level, G.placements);
    G.screen = 'play'; G.selected = -1; G.slow = 1; G.acc = 0; G.eaten = 0; G.toast = null;
    G.trail = []; G.minDist = 1e9; G.chain = new Set(); G.chainShown = 0;
    G.attempts = G.attempts || 0;
    bobo.mood = 'idle';
    if (G.sim.fans.length) SFX.wind(true);
  }
  // reset = poging mislukt; daarna begint meteen een nieuwe poging (zoals Prismatic bij 'reset'). leaving=true: level wordt verlaten
  function stopPlay(leaving) { if (G.sim && G.sim.state !== 'won') { trackEnd('fail'); if (!attemptFailed) { attemptFailed = true; perfectStreak = 0; } } if (!leaving) { trackStart(); Poki.gameplayStart(); } SFX.wind(false); if (G.trail && G.trail.length > 4) G.lastTrail = G.trail; G.sim = null; G.screen = 'build'; bobo.mood = 'idle'; bobo.chomp = 0; G.eaten = 0; parts.length = 0; }
  function win() {
    SFX.wind(false); SFX.chomp(); setTimeout(() => SFX.win(), 250);
    bobo.mood = 'won';
    const b = boboItem(); confetti(b.x, b.y - 40); sparkle(b.x, b.y - 30, 18);
    G.shake = 0.3;
    const used = G.placements.length, L = G.level;
    const st = [true, used <= L.par, G.sim.t <= G.parTime[L.id]];
    const n = st.filter(Boolean).length;
    const beforeOut = OUTFITS.filter(outfitOpen).map(o => o.id);
    const prevBest = save.best[L.id];
    const record = prevBest != null && G.sim.t < prevBest - 0.05;
    save.best[L.id] = Math.min(prevBest == null ? 1e9 : prevBest, +G.sim.t.toFixed(2));
    save.stars[L.id] = Math.max(save.stars[L.id] || 0, n); delete save.skipped[L.id];
    let dailyDone = false;
    if (G.daily && !save.daily.done[G.daily.key] && G.sim.t <= G.daily.goal) { save.daily.done[G.daily.key] = true; save.daily.count = (save.daily.count || 0) + 1; dailyDone = true; }
    const unlockedNow = OUTFITS.filter(o => outfitOpen(o) && !beforeOut.includes(o.id));
    if (unlockedNow.length) save.outfit = unlockedNow[unlockedNow.length - 1].id; // meteen aantrekken: zichtbare beloning
    persist();
    G.result = { st, n, t: G.sim.t, used, at: G.t, record, chain: G.chain ? G.chain.size : 0, unlockedNow, dailyDone };
    // --- events ---
    trackEnd('complete');
    if (G.daily) M('daily', 'goal', dailyDone ? 'reached' : 'missed');
    M('stars', String(L.id), String(n));
    if (!attemptFailed) { perfectStreak++; if ([3, 5, 10, 20].includes(perfectStreak)) M('streak', 'firsttry', String(perfectStreak)); }
    const wl = LEVELS.filter(l => l.world === L.world);
    if (!G.daily && wl.every(l => save.stars[l.id] > 0)) once('world', String(L.world), 'cleared');
    for (const o of unlockedNow) M('outfit', o.id, 'unlock');
    Poki.gameplayStop();
    const simRef = G.sim; setTimeout(() => { if (G.screen === 'play' && G.sim === simRef && G.result) { G.screen = 'win'; G.winAt = G.t; } }, 650);
  }
  function lose() {
    SFX.wind(false); SFX.sad(); bobo.mood = 'lost';
    const L = G.level; G.attempts = (G.attempts || 0) + 1; save.fails[L.id] = (save.fails[L.id] || 0) + 1; persist();
    const gap = Math.max(0, Math.round((G.minDist - S.BOBO_R - S.MARBLE_R) / 10));
    let msg = gap <= 3 ? tr('close') : gap <= 15 ? tr('almost', { n: gap }) : tr('tryAgain');
    if (G.attempts >= (L.hard ? 2 : 3) && !G.hint && !G.freeOffered) { G.freeHint = true; G.freeOffered = true; msg = tr('freeTip'); }
    if (G.attempts >= 5 && !G.offerSkip) { G.offerSkip = true; msg = tr('skipOffer'); }
    G.toast = { text: msg, t: 0, dur: 3 };
    const simRef = G.sim; setTimeout(() => { if (G.screen === 'play' && G.sim === simRef && G.sim.state === 'lost') stopPlay(); }, 1500);
  }
  // G.busy: tijdens een advertentie of overgang worden geen nieuwe acties gestart (dubbelklik, Start achter de advertentie)
  async function nextLevel() {
    if (G.busy) return; G.busy = true;
    const n = G.levelIdx + 1;
    try { await Poki.commercialBreak(); } finally { G.busy = false; }
    if (G.daily) { G.screen = 'title'; G.daily = null; return; }
    if (n >= LEVELS.length) { G.world = WORLDS.length - 1; G.screen = 'levels'; G.toast = { text: tr('allWorlds'), t: 0, dur: 4 }; return; }
    if (LEVELS[n].world !== G.level.world) { G.world = LEVELS[n].world - 1; G.screen = 'levels'; G.toast = { text: tr('newWorld', { name: wname(WORLDS[G.world]) }), t: 0, dur: 3.5 }; return; }
    startLevel(n);
  }
  function skipLevel() {
    M('help', 'skip', 'interact'); trackEnd('fail'); perfectStreak = 0;
    const L = G.level; save.skipped[L.id] = true; persist(); Poki.gameplayStop(); SFX.click();
    const n = G.levelIdx + 1;
    if (n < LEVELS.length && LEVELS[n].world === L.world) startLevel(n); else { G.world = L.world - 1; G.screen = 'levels'; }
  }
  async function retry() {
    if (G.busy) return; G.busy = true;
    try { await Poki.commercialBreak(); } finally { G.busy = false; }
    const pl = G.placements, daily = G.daily;
    startLevel(G.levelIdx, daily ? { daily } : undefined); G.placements = pl; G.toast = null;   // dagpuzzel blijft dagpuzzel
  }
  async function askHint() {
    if (G.busy || G.screen === 'win') return;
    if (G.screen === 'play') stopPlay();
    const sol = G.level.solution;
    const free = G.freeHint || G.level.tutorial; G.freeHint = false;
    if (G.level.tutorial) M('tutorial', 'hint', 'interact'); else if (free) M('help', 'free-hint', 'interact'); else M('reward', 'hint', 'interact');
    let ok = true;
    if (!free) { G.busy = true; try { ok = await Poki.rewardedBreak(); } finally { G.busy = false; } }
    Poki.gameplayStart();
    if (!ok) { G.toast = { text: tr('noHint'), t: 0, dur: 2.5 }; return; }
    const placedOK = s => G.placements.some(p => p.type === s.type && Math.abs(p.x - s.x) < 6 && Math.abs(p.y - s.y) < 6 && (p.a || 0) === (s.a || 0) && !!p.flip === !!s.flip);
    const todo = sol.filter(s => !placedOK(s));
    if (!todo.length) { G.toast = { text: tr('allGood'), t: 0, dur: 2.5 }; return; }
    G.hint = { ...todo[0], born: G.t }; G.hintsUsed++;
    G.toast = { text: tr('lookHint'), t: 0, dur: 2.5 };
  }

  // ---------- render items ----------
  function drawItem(it, x, y, a, opt = {}) {
    const alpha = opt.alpha == null ? 1 : opt.alpha;
    switch (it.type) {
      case 'bobo': return;
      case 'seesaw': {
        drawSprite(sprite('pivot', 76, 64, 6, artPivot), it.x, it.y + 28, 0, alpha);
        drawSprite(partSprite('seesaw'), x, y, a, alpha);
        return;
      }
      case 'fan': {
        const fx = it.flip ? -1 : 1;
        drawSprite(partSprite('fan'), x + fx * 5, y, 0, alpha, fx, 1);
        const bl = sprite('blades', 46, 46, 3, artBlades);
        drawSprite(bl, x, y, G.fanSpin * (G.screen === 'play' ? 1 : 0.08) * fx, alpha, 1, 1, false);
        return;
      }
      case 'marble': {
        ctx.save(); ctx.globalAlpha = alpha * (0.6 + 0.2 * Math.sin(G.t * 4));
        ctx.fillStyle = rg(ctx, x, y, 10, x, y, 46, [[0, 'rgba(255,210,80,.55)'], [1, 'rgba(255,210,80,0)']]);
        ctx.beginPath(); ctx.arc(x, y, 46, 0, 7); ctx.fill(); ctx.restore();
        const sc = opt.scale || 1;
        drawSprite(partSprite('marble'), x, y, a, alpha, sc, sc);
        drawSprite(sprite('spec20', 40, 40, 2, artSpec(20)), x, y, 0, alpha, sc, sc, false);
        return;
      }
      case 'heavy':
        drawSprite(partSprite('heavy'), x, y, a, alpha);
        drawSprite(sprite('spec30', 60, 60, 2, artSpec(30)), x, y, 0, alpha, 1, 1, false);
        return;
      case 'conveyor':
        drawSprite(partSprite('conveyor'), x, y, 0, alpha);
        drawConveyorArrows(x, y, it.flip, G.screen === 'play' ? G.t : G.t * 0.25, alpha);
        return;
      case 'bouncer': {
        const sq = opt.squash || 0;
        drawSprite(partSprite('bouncer'), x, y, a, alpha, 1 + sq * 0.08, 1 - sq * 0.35);
        return;
      }
      default:
        drawSprite(partSprite(it.type, it), x, y, a, alpha);
    }
  }
  function ghost(it, col, pulse = 1) {
    const b = S.makeBody(it); if (!b) return;
    ctx.save();
    ctx.globalAlpha = 0.25 * pulse; ctx.fillStyle = col;
    ctx.beginPath(); b.vertices.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.9 * pulse; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -G.t * 30; ctx.stroke();
    ctx.restore();
  }

  function drawHand(x, y, alpha, pressed) {
    ctx.save(); ctx.globalAlpha = Math.max(0, alpha); ctx.translate(x + 14, y + 18); ctx.rotate(-0.35); ctx.scale(pressed ? 0.92 : 1, pressed ? 0.92 : 1);
    ctx.fillStyle = 'rgba(10,5,35,.35)'; ctx.beginPath(); ctx.ellipse(6, 30, 22, 9, 0, 0, 7); ctx.fill();
    ctx.beginPath(); rr(ctx, -9, -26, 18, 40, 9); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); rr(ctx, -16, 0, 40, 34, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -2, 12, 8);
    ctx.restore();
  }
  function drawWorld(dt) {
    G.knobHit = null;                              // wordt opnieuw gezet als er een kantelbaar onderdeel geselecteerd is
    const L = G.level, playing = G.sim && (G.screen === 'play' || G.screen === 'win');
    const bi = boboItem();
    // blauwdruk-grid in bouwmodus
    if (G.screen === 'build') {
      ctx.save(); ctx.strokeStyle = 'rgba(140,200,255,.10)'; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, PLAY_TOP); ctx.lineTo(x, PLAY_BOTTOM); ctx.stroke(); }
      for (let y = PLAY_TOP; y <= PLAY_BOTTOM; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
    }
    let marblePos = null;
    if (playing) {
      const sim = G.sim;
      for (const pass of [0, 1]) for (const b of sim.bodies) {
        const it = b.plonk.item;
        if (it.type === 'marble') { marblePos = b.position; continue; }
        if ((it.type === 'heavy') !== (pass === 1)) continue; // ballen bovenop tekenen
        drawItem(it, b.position.x, b.position.y, b.angle, { squash: b.squash || 0 });
        if (b.squash) b.squash = Math.max(0, b.squash - dt * 4);
      }
    } else {
      for (const it of L.items) if (it.type !== 'marble' && it.type !== 'heavy') drawItem(it, it.x, it.y, rad(it.a || 0));
      G.placements.forEach((p, i) => {
        if (G.drag && G.drag.index === i) return;
        drawItem(p, p.x, p.y, rad(p.a || 0));
        if (i === G.selected) ghost(p, '#FFFFFF', 0.6 + 0.4 * Math.sin(G.t * 6));
      });
      for (const it of L.items) if (it.type === 'heavy') drawItem(it, it.x, it.y, 0);
      const m = L.items.find(i => i.type === 'marble'); marblePos = { x: m.x, y: m.y };
    }
    // Bobo
    updateBobo(dt, bi.x, bi.y, playing && G.eaten === 0 ? marblePos : (G.screen === 'build' && G.drag ? { x: G.drag.x, y: G.drag.y } : null));
    drawBobo(bi.x, bi.y, S.BOBO_R, G.t);
    // knikker (na Bobo, zodat hij in de mond verdwijnt)
    if (playing && G.sim.state === 'won') {
      G.eaten = Math.min(1, G.eaten + dt * 4);
      const m = G.sim.marble.position;
      const ex = lerp(m.x, bi.x, ease(G.eaten)), ey = lerp(m.y, bi.y + 15, ease(G.eaten));
      if (G.eaten < 1) drawItem({ type: 'marble' }, ex, ey, G.sim.marble.angle, { scale: 1 - G.eaten * 0.8 });
    } else if (marblePos) {
      drawItem({ type: 'marble' }, marblePos.x, marblePos.y, playing ? G.sim.marble.angle : 0);
    }
    // spoor van de vorige poging: leren van experimenteren
    if (G.screen === 'build' && G.lastTrail) {
      ctx.save(); ctx.fillStyle = 'rgba(255,220,120,.38)';
      G.lastTrail.forEach((pt, i) => { if (i % 2 === 0) { ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.2, 0, 7); ctx.fill(); } });
      const e = G.lastTrail[G.lastTrail.length - 1];
      ctx.strokeStyle = 'rgba(255,140,120,.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(e.x - 9, e.y - 9); ctx.lineTo(e.x + 9, e.y + 9); ctx.moveTo(e.x + 9, e.y - 9); ctx.lineTo(e.x - 9, e.y + 9); ctx.stroke();
      ctx.restore();
    }
    // vallijnen: waar valt het als je op Start drukt?
    if (G.screen === 'build') {
      const statics = L.items.concat(G.placements).filter(i => !['marble', 'heavy', 'bobo', 'domino', 'seesaw'].includes(i.type)).map(i => S.makeBody(i)).filter(Boolean);
      for (const it of L.items) {
        if (it.type !== 'marble' && it.type !== 'heavy') continue;
        const r = it.type === 'marble' ? S.MARBLE_R : S.HEAVY_R;
        let hitY = 600;
        for (let yy = it.y + r + 2; yy < 600; yy += 6) { if (Matter.Query.point(statics, { x: it.x, y: yy }).length) { hitY = yy; break; } }
        if (hitY - (it.y + r) < 14) continue;
        ctx.save(); ctx.strokeStyle = it.type === 'marble' ? 'rgba(255,220,120,.55)' : 'rgba(170,180,255,.5)'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 9]); ctx.lineDashOffset = -G.t * 40;
        ctx.beginPath(); ctx.moveTo(it.x, it.y + r + 6); ctx.lineTo(it.x, hitY - 4); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(it.x - 7, hitY - 12); ctx.lineTo(it.x + 7, hitY - 12); ctx.lineTo(it.x, hitY - 3); ctx.fill();
        ctx.restore();
      }
    }
    // startmarkering van knikker in bouwmodus: tik op de knikker = Start
    if (G.screen === 'build') {
      const m = L.items.find(i => i.type === 'marble'), hov = G.hover === 'marble';
      once('start', 'marble', 'visible');
      ctx.save(); ctx.strokeStyle = hov ? 'rgba(198,242,122,.95)' : 'rgba(255,220,120,.7)'; ctx.lineWidth = hov ? 3 : 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -G.t * 20;
      ctx.beginPath(); ctx.arc(m.x, m.y, 30 + Math.sin(G.t * 3) * 2, 0, 7); ctx.stroke(); ctx.restore();
      // klein groen 'play'-rondje rechtsonder aan de knikker
      const bx = m.x + 22, by = m.y + 20, br = hov ? 14 : 12 + Math.sin(G.t * 4) * 1.2;
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fillStyle = lg(ctx, 0, by - br, 0, by + br, [[0, '#C6F27A'], [1, '#4E9A12']]); ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(bx - br * 0.32, by - br * 0.48); ctx.lineTo(bx + br * 0.52, by); ctx.lineTo(bx - br * 0.32, by + br * 0.48); ctx.closePath(); ctx.fill(); ctx.restore();
      if (hov) { ctx.font = `800 16px ${FONT}`; const tw = ctx.measureText(tr('start')).width + 24; panel(m.x - tw / 2, m.y - 72, tw, 30, 15, 0.9); textOut(tr('start'), m.x, m.y - 57, 16, '#FFFFFF', OUT, 4); }
    }
    // hint
    if (G.hint && G.screen === 'build') ghost(G.hint, '#FFE66B', 0.6 + 0.4 * Math.sin(G.t * 5));
    if (G.screen === 'build' && G.selected >= 0 && !G.drag) {
      const sp = G.placements[G.selected], SP = S.PARTS[sp.type];
      const pv = G.pressed || G.hover;
      if (pv === 'rotL' || pv === 'rotR' || pv === 'flip') {          // zo komt hij te staan
        const nx = nextOrientation(sp, pv === 'rotL' ? -1 : 1);
        if (nx) ghost(nx, '#FFE66B', 0.9);
        if (nx && pv === 'flip') {                                       // ventilator/band: laat de nieuwe richting zien
          const d = nx.flip ? -1 : 1, ax = nx.x + d * (SP.w / 2 + 30), ay = nx.y;
          ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(G.t * 8); ctx.fillStyle = '#FFE66B'; ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(ax - d * 22, ay - 9); ctx.lineTo(ax, ay - 9); ctx.lineTo(ax, ay - 20); ctx.lineTo(ax + d * 24, ay); ctx.lineTo(ax, ay + 20); ctx.lineTo(ax, ay + 9); ctx.lineTo(ax - d * 22, ay + 9); ctx.closePath();
          ctx.fill(); ctx.stroke(); ctx.restore();
        }
      }
      if (SP.rotStep) drawRotKnob(sp, G.rot ? 1 : (G.hover === 'knob' ? 0.85 : 0.6 + 0.25 * Math.sin(G.t * 4)));
    }
    if (L.tutorial && G.screen === 'build' && !G.intro && !G.drag && G.hint) {
      once('tutorial', 'hand', 'visible');
      const slot = traySlots().find(s => s.type === G.hint.type);
      if (slot && remaining(G.hint.type) > 0) {
        const k = (G.t % 2.2) / 2.2, e = ease(clamp(k * 1.4, 0, 1));
        const hx = lerp(slot.x + slot.w / 2, G.hint.x, e), hy = lerp(slot.y + 34, G.hint.y, e) - Math.sin(e * Math.PI) * 60;
        drawHand(hx, hy, k < 0.75 ? 1 : 1 - (k - 0.75) * 4, k > 0.05 && k < 0.75);
      } else if (G.placements.length) {
        const pb = traySlots(); drawHand(W - 110 + Math.sin(G.t * 5) * 6, 640, 0.9, false);
      }
    }
    // sleep-ghost
    if (G.drag && G.drag.moved !== false) {
      const d = G.drag, it = d.item;
      if (d.inField) {
        ghost(it, d.magnet ? '#FFE66B' : d.valid ? '#8AE234' : '#FF6B5B', 0.8);
        drawItem(it, it.x, it.y, rad(it.a || 0), { alpha: d.valid ? 0.95 : 0.55 });
      } else {
        drawItem(it, d.x, d.y + (d.oy || 0), rad(it.a || 0), { alpha: 0.75 });
      }
    }
  }

  // ---------- UI ----------
  function button(id, x, y, w, h, opts = {}) {
    const hov = G.hover === id;
    const press = G.pressed === id;
    const col = opts.color || ['#FF8A70', '#FF6B5B', '#D23A4A'];
    const yo = press ? 3 : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(10,5,35,.45)'; rr(ctx, x + 2, y + 7, w, h, h / 2.2); ctx.fill();
    rr(ctx, x, y + yo, w, h, h / 2.2);
    ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, col[0]], [0.5, col[1]], [1, col[2]]]); ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.save(); rr(ctx, x, y + yo, w, h, h / 2.2); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, x + 8, y + yo + 4, w - 16, h * 0.32, h * 0.16); ctx.fill();
    if (hov) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, y, w, h + 6); }
    ctx.restore();
    let tx = x + w / 2;
    let lsize = opts.size || Math.round(h * 0.42);
    if (opts.label) {
      const iw0 = opts.icon ? h * 0.62 + 10 : 0;
      lsize = fitSize(opts.label, lsize, w - iw0 - 26);          // langere vertalingen passen in de knop
      const tw = ctx.measureText(opts.label).width, iw = iw0;
      const gx = x + w / 2 - (tw + iw) / 2;
      if (opts.icon) opts.icon(gx + h * 0.31, y + h / 2 + yo, h * 0.27);
      tx = gx + iw + tw / 2;
    } else if (opts.icon) opts.icon(x + w / 2, y + h / 2 + yo, h * 0.3);
    if (opts.label) {
      ctx.font = `800 ${lsize}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(40,10,40,.45)'; ctx.strokeText(opts.label, tx, y + h / 2 + yo + 1);
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(opts.label, tx, y + h / 2 + yo + 1);
    }
    ctx.restore();
    G.buttons.push({ id, x, y, w, h, fn: opts.fn });
  }
  const icon = {
    play: (x, y, s) => { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x - s * 0.6, y + s); ctx.closePath(); ctx.lineJoin = 'round'; ctx.fill(); },
    stop: (x, y, s) => { ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.45; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, s * 0.85, -2.6, 2.2); ctx.stroke(); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x - s * 1.25, y - s * 0.9); ctx.lineTo(x - s * 0.15, y - s * 0.75); ctx.lineTo(x - s * 0.9, y + s * 0.05); ctx.fill(); },
    home: (x, y, s) => { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.7, y); ctx.lineTo(x + s * 0.7, y + s * 0.9); ctx.lineTo(x - s * 0.7, y + s * 0.9); ctx.lineTo(x - s * 0.7, y); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); },
    bulb: (x, y, s) => { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x, y - s * 0.25, s * 0.75, 0, 7); ctx.fill(); rr(ctx, x - s * 0.35, y + s * 0.4, s * 0.7, s * 0.5, 3); ctx.fill(); },
    sound: (x, y, s) => {          // geluidseffecten: luidspreker
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.4); ctx.lineTo(x - s * 0.4, y - s * 0.4); ctx.lineTo(x + s * 0.2, y - s); ctx.lineTo(x + s * 0.2, y + s); ctx.lineTo(x - s * 0.4, y + s * 0.4); ctx.lineTo(x - s, y + s * 0.4); ctx.fill();
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.25; ctx.lineCap = 'round';
      if (!SFX.sfxOn()) { ctx.beginPath(); ctx.moveTo(x + s * 0.5, y - s * 0.4); ctx.lineTo(x + s * 1.1, y + s * 0.4); ctx.moveTo(x + s * 1.1, y - s * 0.4); ctx.lineTo(x + s * 0.5, y + s * 0.4); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x + s * 0.2, y, s * 0.6, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 0.2, y, s * 1.05, -0.8, 0.8); ctx.stroke(); } },
    music: (x, y, s) => {          // achtergrondmuziek: dubbele muzieknoot
      ctx.fillStyle = '#FFF'; ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(x - s * 0.55, y + s * 0.65, s * 0.38, s * 0.28, -0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + s * 0.6, y + s * 0.45, s * 0.38, s * 0.28, -0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.6); ctx.lineTo(x - s * 0.2, y - s * 0.85); ctx.lineTo(x + s * 0.95, y - s * 1.05); ctx.lineTo(x + s * 0.95, y + s * 0.4); ctx.stroke();
      if (!SFX.musicOn()) { ctx.strokeStyle = '#FF6B5B'; ctx.lineWidth = s * 0.3; ctx.beginPath(); ctx.moveTo(x - s * 1.1, y - s * 1.1); ctx.lineTo(x + s * 1.2, y + s * 1.1); ctx.stroke(); } },
    rotate: (x, y, s) => { ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, s * 0.8, -0.3, 4.2); ctx.stroke(); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x + s * 1.3, y - s * 0.6); ctx.lineTo(x + s * 0.3, y - s * 0.45); ctx.lineTo(x + s * 0.95, y + s * 0.4); ctx.fill(); },
    globe: (x, y, s) => {
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.2; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.45, s, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x - s * 0.85, y - s * 0.5); ctx.lineTo(x + s * 0.85, y - s * 0.5); ctx.moveTo(x - s * 0.85, y + s * 0.5); ctx.lineTo(x + s * 0.85, y + s * 0.5); ctx.stroke();
    },
    hat: (x, y, s) => { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x - s * 0.9, y + s * 0.6); ctx.lineTo(x, y - s * 1.1); ctx.lineTo(x + s * 0.9, y + s * 0.6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x, y - s * 1.1, s * 0.3, 0, 7); ctx.fill(); },
    // kantel-iconen: een mini-plank met een pijl naar beneden bij het uiteinde dat zakt
    tiltL: (x, y, s) => drawTiltIcon(x, y, s, -1),
    tiltR: (x, y, s) => drawTiltIcon(x, y, s, 1),
    rotL: (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); icon.rotate(0, 0, s); ctx.restore(); },
    flip: (x, y, s) => { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(x - s * 1.2, y); ctx.lineTo(x - s * 0.3, y - s * 0.8); ctx.lineTo(x - s * 0.3, y + s * 0.8); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + s * 1.2, y); ctx.lineTo(x + s * 0.3, y - s * 0.8); ctx.lineTo(x + s * 0.3, y + s * 0.8); ctx.fill(); ctx.fillRect(x - s * 0.08, y - s, s * 0.16, s * 2); },
    trash: (x, y, s) => { ctx.fillStyle = '#FFF'; rr(ctx, x - s * 0.75, y - s * 0.55, s * 1.5, s * 1.55, s * 0.25); ctx.fill(); rr(ctx, x - s * 0.95, y - s * 0.95, s * 1.9, s * 0.3, s * 0.12); ctx.fill(); rr(ctx, x - s * 0.3, y - s * 1.15, s * 0.6, s * 0.3, s * 0.1); ctx.fill(); ctx.fillStyle = 'rgba(180,40,60,.9)'; for (const k of [-0.35, 0, 0.35]) ctx.fillRect(x + k * s - s * 0.07, y - s * 0.3, s * 0.14, s * 1.05); },
    next: (x, y, s) => { icon.play(x - s * 0.4, y, s * 0.8); icon.play(x + s * 0.5, y, s * 0.8); },
    right: (x, y, s) => { ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 0.8); ctx.lineTo(x + s * 0.45, y); ctx.lineTo(x - s * 0.35, y + s * 0.8); ctx.stroke(); },
    left: (x, y, s) => { ctx.strokeStyle = '#FFF'; ctx.lineWidth = s * 0.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x + s * 0.35, y - s * 0.8); ctx.lineTo(x - s * 0.45, y); ctx.lineTo(x + s * 0.35, y + s * 0.8); ctx.stroke(); },
  };
  function drawBtnTips() {      // uitleg onder de muziek-/geluidknop als je ze aanwijst (of indrukt op touch)
    const id = ['music', 'sound'].includes(G.pressed) ? G.pressed : ['music', 'sound'].includes(G.hover) ? G.hover : null;
    if (!id) return; const b = G.buttons.find(q => q.id === id); if (!b) return;
    const txt = id === 'music' ? (SFX.musicOn() ? tr('musicOn') : tr('musicOff')) : (SFX.sfxOn() ? tr('sfxOn') : tr('sfxOff'));
    ctx.font = `800 16px ${FONT}`; const tw = ctx.measureText(txt).width + 26, tx = clamp(b.x + b.w / 2, tw / 2 + 8, W - tw / 2 - 8), ty = b.y + b.h + 24;
    panel(tx - tw / 2, ty - 16, tw, 32, 16, 0.92); textOut(txt, tx, ty, 16, '#FFFFFF', OUT, 4);
  }
  function toggleMusic() { SFX.unlock(); SFX.setMusic(!SFX.musicOn()); M('settings', 'music', SFX.musicOn() ? 'on' : 'off'); SFX.click(); G.toast = { text: SFX.musicOn() ? tr('musicOn') : tr('musicOff'), t: 0, dur: 1.2 }; }
  function toggleSfx() { SFX.unlock(); SFX.setSfx(!SFX.sfxOn()); M('settings', 'sfx', SFX.sfxOn() ? 'on' : 'off'); SFX.click(); G.toast = { text: SFX.sfxOn() ? tr('sfxOn') : tr('sfxOff'), t: 0, dur: 1.2 }; }
  function drawTiltIcon(x, y, s, dir) {
    ctx.save(); ctx.translate(x, y + s * 0.15);
    ctx.save(); ctx.rotate(dir * 0.42);
    rr(ctx, -s * 1.15, -s * 0.2, s * 2.3, s * 0.4, s * 0.2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();
    // pijl omlaag bij het lage uiteinde
    const ex = dir * s * 1.05, ey = s * 0.45;
    ctx.strokeStyle = '#FFE66B'; ctx.fillStyle = '#FFE66B'; ctx.lineWidth = s * 0.26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex, ey - s * 0.95); ctx.lineTo(ex, ey + s * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - s * 0.38, ey - s * 0.12); ctx.lineTo(ex + s * 0.38, ey - s * 0.12); ctx.lineTo(ex, ey + s * 0.38); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const COL = {
    gray: ['#B9B4CC', '#7E7898', '#4B4666'], green: ['#C6F27A', '#8AE234', '#4E9A12'], blue: ['#9BE6FF', '#4CC9F0', '#1D7FC2'], purple: ['#D7B8FF', '#9B5DE5', '#5C2BA8'], yellow: ['#FFF0A0', '#FFC93C', '#D88A0E'], coral: ['#FF9C88', '#FF6B5B', '#C8303E'] };

  // tekst die niet past wordt kleiner gemaakt (vertalingen zijn soms veel langer)
  function fitSize(str, size, maxW, weight = 800) { ctx.font = `${weight} ${size}px ${FONT}`; while (maxW && size > 10 && ctx.measureText(str).width > maxW) { size--; ctx.font = `${weight} ${size}px ${FONT}`; } return size; }
  function fillFit(str, x, y, maxW) { const m = /^(\d+) (\d+)px/.exec(ctx.font) || [0, 700, 16]; fitSize(str, +m[2], maxW, +m[1]); ctx.fillText(str, x, y); }
  function textOut(str, x, y, size, fill = '#FFF', stroke = OUT, lw = 6, align = 'center', maxW = 0) {
    size = fitSize(str, size, maxW); lw = Math.min(lw, Math.max(3, size * 0.22));
    ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(str, x, y);
    ctx.fillStyle = fill; ctx.fillText(str, x, y);
  }
  function panel(x, y, w, h, r = 24, a = 0.72) {
    ctx.save(); ctx.fillStyle = 'rgba(10,5,35,.35)'; rr(ctx, x + 3, y + 8, w, h, r); ctx.fill();
    rr(ctx, x, y, w, h, r); ctx.fillStyle = `rgba(36,22,84,${a})`; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  function drawStar(x, y, r, on, t = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(t, t);
    star5(ctx, 0, 0, r, 0.5);
    ctx.fillStyle = on ? lg(ctx, 0, -r, 0, r, [[0, '#FFF59A'], [0.5, '#FFC93C'], [1, '#F08A12']]) : 'rgba(20,10,50,.55)';
    ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = r * 0.16; ctx.strokeStyle = on ? '#7A3A08' : 'rgba(255,255,255,.18)'; ctx.stroke();
    if (on) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.22, r * 0.1, -0.5, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  const TRAY = { x: 220, y: 616, w: 840, h: 96 };
  function traySlots() {
    const types = Object.keys(G.level.inventory);
    const sw = 120, gap = 14, total = types.length * sw + (types.length - 1) * gap;
    const x0 = W / 2 - total / 2;
    return types.map((t, i) => ({ type: t, x: x0 + i * (sw + gap), y: TRAY.y + 8, w: sw, h: 80 }));
  }
  function drawTray() {
    panel(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 26, 0.8);
    const nudge = G.nudgeAt != null && G.t - G.nudgeAt < 2.5 && !G.placements.length;
    for (const s of traySlots()) {
      const n = remaining(s.type), hov = G.hover === 'slot_' + s.type;
      ctx.save();
      rr(ctx, s.x, s.y, s.w, s.h, 18);
      ctx.fillStyle = n > 0 ? (hov ? 'rgba(120,100,230,.55)' : 'rgba(90,70,190,.45)') : 'rgba(40,30,80,.4)'; ctx.fill();
      ctx.strokeStyle = n > 0 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
      // mini-sprite
      const sp = partSprite(s.type);
      const k = Math.min(0.55, 92 / (sp.w + 10), 52 / (sp.h + 10));
      ctx.globalAlpha = n > 0 ? 1 : 0.35;
      const cx = s.x + s.w / 2, cy = s.y + 34;
      if (s.type === 'seesaw') drawSprite(sprite('pivot', 76, 64, 6, artPivot), cx, cy + 28 * k, 0, ctx.globalAlpha, k, k, false);
      drawSprite(sp, cx, cy, s.type === 'plank' ? -0.15 : 0, ctx.globalAlpha, k, k, false);
      if (s.type === 'fan') drawSprite(sprite('blades', 46, 46, 3, artBlades), cx, cy, G.t * 2, ctx.globalAlpha, k, k, false);
      ctx.globalAlpha = 1;
      ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = n > 0 ? '#FFFFFF' : 'rgba(255,255,255,.4)';
      fillFit(pname(s.type), cx, s.y + 66, s.w - 8);
      // aantal-badge
      ctx.beginPath(); ctx.arc(s.x + s.w - 10, s.y + 8, 15, 0, 7);
      ctx.fillStyle = n > 0 ? lg(ctx, 0, s.y - 6, 0, s.y + 22, [[0, '#FFE893'], [1, '#F2A81D']]) : '#4B3A7A'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.font = `800 17px ${FONT}`; ctx.fillStyle = n > 0 ? '#5A2A00' : 'rgba(255,255,255,.5)'; ctx.fillText('×' + n, s.x + s.w - 10, s.y + 9);
      ctx.restore();
      G.buttons.push({ id: 'slot_' + s.type, x: s.x, y: s.y, w: s.w, h: s.h, slot: s.type });
    }
    if (nudge) {                                   // Start zonder onderdelen: laat zien waar ze vandaan komen
      const s = traySlots().find(q => remaining(q.type) > 0); if (s) {
        const k = 0.5 + 0.5 * Math.sin(G.t * 10);
        ctx.save(); ctx.strokeStyle = `rgba(255,230,107,${0.6 + 0.4 * k})`; ctx.lineWidth = 5; rr(ctx, s.x - 6, s.y - 6, s.w + 12, s.h + 12, 22); ctx.stroke(); ctx.restore();
        drawHand(s.x + s.w / 2 - 6, s.y + 30 - Math.abs(Math.sin(G.t * 6)) * 14, 1, false);
      }
    }
  }

  function drawHUD() {
    const L = G.level;
    panel(16, 12, 330, 42, 21, 0.75);
    textOut(`${L.id}`, 42, 34, 24, '#FFC93C', OUT, 5);
    textOut(lname(L), 66, 34, 22, '#FFFFFF', OUT, 5, 'left', 190);
    const best = save.stars[L.id] || 0;
    for (let i = 0; i < 3; i++) drawStar(272 + i * 26, 33, 11, i < best);

    button('home', W - 254, 10, 50, 46, { color: COL.purple, icon: icon.home, fn: () => { SFX.click(); if (G.screen === 'play') stopPlay(true); trackEnd('fail'); M('menu', 'open', 'interact'); Poki.gameplayStop(); G.world = G.level.world - 1; G.screen = 'levels'; } });
    button('music', W - 196, 10, 50, 46, { color: SFX.musicOn() ? COL.purple : COL.gray, icon: icon.music, fn: toggleMusic });
    button('sound', W - 138, 10, 50, 46, { color: SFX.sfxOn() ? COL.purple : COL.gray, icon: icon.sound, fn: toggleSfx });
    if (G.screen === 'build' && !G.intro) {          // per level één keer 'visible' per hintsoort
      const hk = L.tutorial ? 'tutorial' : G.freeHint ? 'free' : 'reward';
      if (!G.hintSent[hk]) { G.hintSent[hk] = 1; if (hk === 'tutorial') M('tutorial', 'hint', 'visible'); else if (hk === 'free') M('help', 'free-hint', 'visible'); else M('reward', 'hint', 'visible'); }
    }
    button('hint', W - 80, 10, 64, 46, { color: COL.yellow, icon: icon.bulb, fn: () => { SFX.click(); askHint(); } });
    // ad-icoontje bij hint (of 'gratis' als Bobo helpt na een paar pogingen)
    const freeH = G.freeHint || L.tutorial;
    if (G.freeHint) { ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.t * 6); ctx.strokeStyle = '#FFE66B'; ctx.lineWidth = 5; rr(ctx, W - 86, 4, 76, 58, 26); ctx.stroke(); ctx.restore(); }
    ctx.save(); rr(ctx, W - (freeH ? 62 : 44), 44, freeH ? 52 : 30, 16, 8); ctx.fillStyle = freeH ? '#3E8A1A' : '#2A1240'; ctx.fill(); ctx.font = `800 10px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = freeH ? '#FFFFFF' : '#FFC93C'; ctx.fillText(freeH ? tr('free') : 'AD', W - (freeH ? 36 : 29), 52); ctx.restore();
    if (G.offerSkip && G.screen === 'build' && !G.hintSent.skip) { G.hintSent.skip = 1; M('help', 'skip', 'visible'); }
    if (G.offerSkip && G.screen === 'build') button('skip', W - 424, 10, 160, 46, { color: COL.purple, icon: icon.next, label: tr('skip'), size: 18, fn: skipLevel });
    if (G.daily) { panel(16, 62, 270, 34, 17, 0.8); ctx.font = `800 16px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE66B'; ctx.fillText(tr('dailyHud', { s: G.daily.goal }), 32, 80); }
    if (G.screen === 'build') {
      // Start valt op zodra er iets geplaatst is en je even niets doet (veel nieuwe spelers zien hem anders niet)
      const idle = G.t - (G.lastInput || 0), ready = G.placements.length > 0 && !G.drag && !G.rot;
      const urge = ready && (idle > 2.5 || G.placements.length >= Object.values(L.inventory).reduce((a, b) => a + b, 0));
      if (urge) {
        const k = 0.5 + 0.5 * Math.sin(G.t * 5);
        ctx.save(); ctx.globalAlpha = 0.35 + 0.4 * k; ctx.fillStyle = '#C6F27A';
        rr(ctx, W - 200 - 8 - k * 6, 626 - 8 - k * 6, 180 + 16 + k * 12, 76 + 16 + k * 12, 46); ctx.fill(); ctx.restore();
        if (!G.startsThisLevel && idle > 7 && !G.startHintShown) { G.startHintShown = true; G.toast = { text: tr('pressStart'), t: 0, dur: 4 }; once('help', 'press-start', 'visible'); G.pressHintPending = true; }
      }
      button('play', W - 200, 626, 180, 76, { color: COL.green, icon: icon.play, label: tr('start'), size: 30, fn: () => play('button') });
      once('start', 'button', 'visible');
      if (urge && !G.startsThisLevel && idle > 4 && !L.tutorial) drawHand(W - 150, 662 + Math.abs(Math.sin(G.t * 5)) * 8, 0.95, false);
      // geselecteerd onderdeel: draai/verwijder
      if (G.selected >= 0 && !G.drag) {
        const p = G.placements[G.selected], P = S.PARTS[p.type];
        // vaste plek t.o.v. het midden, zodat de knoppen niet verspringen tijdens het draaien
        const reach = P.rotStep ? Math.max(P.w, P.h) / 2 * 0.87 + 14 : Math.max(P.w, P.h) / 2 + 10;
        const bx = clamp(p.x, 90, W - 90), by = clamp(p.y - reach - 52, 66, 540);
        const bw = G.touch ? 72 : 60, bh = G.touch ? 64 : 54, by2 = by - (bh - 52);
        if (P.rotStep) {
          button('rotL', bx - bw - 8, by2, bw, bh, { color: COL.blue, icon: icon.tiltL, fn: () => rotateSelected(-1) });
          button('rotR', bx + 8, by2, bw, bh, { color: COL.blue, icon: icon.tiltR, fn: () => rotateSelected(1) });
        } else if (P.flip) button('flip', bx - bw / 2, by2, bw, bh, { color: COL.blue, icon: icon.flip, fn: () => rotateSelected(1) });
        // uitleg boven de knop waar je overheen gaat of op drukt
        const tipFor = { rotL: tr('tiltL'), rotR: tr('tiltR'), flip: tr('flipDir') };
        const tipId = G.pressed in tipFor ? G.pressed : G.hover in tipFor ? G.hover : null;
        if (tipId) {
          ctx.font = `800 17px ${FONT}`; const tw = ctx.measureText(tipFor[tipId]).width + 28;
          const tb = G.buttons.find(b => b.id === tipId), tx = clamp(tb.x + tb.w / 2, tw / 2 + 8, W - tw / 2 - 8), ty = Math.max(30, by2 - 24);
          panel(tx - tw / 2, ty - 17, tw, 34, 17, 0.9); textOut(tipFor[tipId], tx, ty, 17, '#FFFFFF', OUT, 4);
        } else if (P.rotStep) {
          panel(bx - 34, by2 - 40, 68, 30, 15, 0.85); textOut(`${p.a || 0}°`, bx, by2 - 25, 18, '#FFFFFF', OUT, 4);
        }
      }    } else if (G.screen === 'play') {
      button('stop', W - 200, 626, 180, 76, { color: COL.coral, icon: icon.stop, label: tr('reset'), size: 30, fn: () => { SFX.click(); stopPlay(); } });
    }
    // timer
    if (G.sim) { panel(20, 640, 160, 50, 25, 0.75); textOut(G.sim.t.toFixed(1) + 's', 100, 666, 26, G.sim.t <= G.parTime[L.id] ? '#8AE234' : '#FFFFFF', OUT, 5); }
    else if (G.screen === 'build' && G.selected >= 0 && !G.drag) button('del', 20, 630, 180, 70, { color: COL.coral, icon: icon.trash, label: tr('remove'), size: 22, fn: deleteSelected });
    else { panel(20, 640, 160, 50, 25, 0.75); textOut(tr('build'), 100, L.gravity && L.gravity < 1 ? 658 : 666, 24, '#9BE6FF', OUT, 5); }
    if (!G.sim && !(G.selected >= 0 && !G.drag) && L.gravity && L.gravity < 1) { ctx.font = `800 13px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFB3C4'; ctx.fillText(tr('gravity', { p: Math.round(L.gravity * 100) }), 100, 680); }
  }

  function drawToast(dt) {
    const T = G.toast; if (!T) return;
    T.t += dt; if (T.t > T.dur) { G.toast = null; return; }
    const a = Math.min(1, T.t * 4, (T.dur - T.t) * 3);
    ctx.save(); ctx.globalAlpha = a;
    let fs = 22; ctx.font = `700 ${fs}px ${FONT}`;
    while (ctx.measureText(T.text).width > 800 && fs > 14) { fs--; ctx.font = `700 ${fs}px ${FONT}`; }
    const w = ctx.measureText(T.text).width + 60, x = W / 2 - w / 2, y = 70 + (1 - ease(Math.min(1, T.t * 3))) * -20;
    ctx.fillStyle = 'rgba(10,5,35,.35)'; rr(ctx, x + 2, y + 6, w, 48, 24); ctx.fill();
    rr(ctx, x, y, w, 48, 24); ctx.fillStyle = '#FFF4E0'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3A1A50'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(T.text, W / 2, y + 25);
    ctx.restore();
  }

  function drawLogo(x, y, s) {
    const txt = 'PLONK!';
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04);
    ctx.font = `900 ${s}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const letters = txt.split(''); let total = 0; const ws = letters.map(l => { const w = ctx.measureText(l).width; total += w; return w; });
    let cx = -total / 2;
    letters.forEach((l, i) => {
      const lx = cx + ws[i] / 2, ly = Math.sin(G.t * 3 + i * 0.7) * s * 0.04;
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(10,5,35,.5)'; ctx.fillText(l, lx + 4, ly + 10);
      ctx.lineWidth = s * 0.16; ctx.strokeStyle = OUT; ctx.strokeText(l, lx, ly);
      ctx.fillStyle = lg(ctx, 0, ly - s * 0.45, 0, ly + s * 0.45, [[0, '#FFF59A'], [0.5, CONF[i % 4]], [1, '#B8303E']]);
      ctx.fillText(l, lx, ly);
      ctx.save(); ctx.beginPath(); ctx.rect(lx - ws[i], ly - s * 0.5, ws[i] * 2, s * 0.32); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillText(l, lx, ly); ctx.restore();
      cx += ws[i];
    });
    ctx.restore();
  }

  function drawTitle(dt) {
    drawBackground(G.t);
    // grote Bobo
    bobo.mood = 'idle';
    const tx = W / 2 + Math.cos(G.t * 1.1) * 300, ty = 430 + Math.sin(G.t * 2.2) * 50;
    updateBobo(dt, W / 2, 420, { x: tx, y: ty });
    ctx.save(); ctx.translate(W / 2, 420); ctx.scale(1.7, 1.7); ctx.translate(-W / 2, -420);
    drawBobo(W / 2, 420, S.BOBO_R, G.t); ctx.restore();
    drawItem({ type: 'marble' }, tx, ty, G.t * 3);
    drawLogo(W / 2, 175, 150);
    textOut(tr('tagline'), W / 2, 270, 28, '#FFF4E0', OUT, 6, 'center', 1100);
    const fresh = totalStars() === 0 && !Object.keys(save.skipped).length;
    button('start', W / 2 - 140, 560, 280, 90, { color: COL.green, icon: icon.play, label: tr('play'), size: 38, fn: () => { SFX.unlock(); SFX.start(); if (fresh) { startLevel(0); return; } M('menu', 'open', 'interact'); G.world = lastOpenWorld(); G.screen = 'levels'; } });
    if (!fresh) {
      once('wardrobe', 'button', 'visible');
      button('wardrobe', 40, 580, 210, 70, { color: COL.purple, icon: icon.hat, label: tr('wardrobe'), size: 26, fn: () => { SFX.click(); M('wardrobe', 'button', 'interact'); M('mode', 'wardrobe', 'interact'); G.wardFrom = null; G.screen = 'wardrobe'; } });
      const D = dailyChallenge();
      if (D) {
        const dx = W - 330, dy = 540;
        panel(dx, dy, 300, 150, 26, 0.82);
        textOut(tr('daily'), dx + 150, dy + 28, 24, '#FFE66B', OUT, 5, 'center', 270);
        ctx.font = `700 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFF4E0';
        fillFit(tr('dailyLevel', { n: D.L.id, name: lname(D.L) }), dx + 150, dy + 58, 276); fillFit(tr('dailyGoal', { s: D.goal }), dx + 150, dy + 80, 276);
        if (D.done) textOut(tr('dailyDone'), dx + 150, dy + 116, 20, '#8AE234', OUT, 4, 'center', 270);
        else {
          once('banner', 'daily', 'visible');
          button('daily', dx + 60, dy + 96, 180, 44, { color: COL.yellow, icon: icon.play, label: tr('dailyPlay'), size: 20, fn: () => { SFX.click(); M('banner', 'daily', 'interact'); M('mode', 'daily', 'interact'); startLevel(D.i, { daily: D }); } });
        }
      }
    }
    // taalkeuze linksboven: wereldbol + taalcode
    button('lang', 20, 16, 112, 54, { color: COL.purple, icon: icon.globe, label: I18N.lang.toUpperCase(), size: 22, fn: () => { SFX.unlock(); SFX.click(); G.langOpen = true; M('settings', 'language', 'open'); } });
    button('music', W - 146, 16, 60, 54, { color: SFX.musicOn() ? COL.purple : COL.gray, icon: icon.music, fn: toggleMusic });
    button('sound', W - 80, 16, 60, 54, { color: SFX.sfxOn() ? COL.purple : COL.gray, icon: icon.sound, fn: toggleSfx });
    ctx.font = `700 14px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.textAlign = 'right'; ctx.fillText(VERSION, W - 16, H - 14);
    if (G.langOpen) drawLangPicker();
  }
  function drawLangPicker() {
    ctx.fillStyle = 'rgba(14,6,40,.6)'; ctx.fillRect(0, 0, W, H);
    G.buttons.push({ id: 'lang_bg', x: 0, y: 0, w: W, h: H, fn: () => { G.langOpen = false; } });   // buiten het paneel tikken = sluiten
    const cols = 3, bw = 250, bh = 66, gap = 16, pw = cols * bw + (cols - 1) * gap + 60, rows = Math.ceil(I18N.LANGS.length / cols), ph = rows * bh + (rows - 1) * gap + 130;
    const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    ctx.fillStyle = 'rgba(10,5,35,.5)'; rr(ctx, px + 6, py + 14, pw, ph, 36); ctx.fill();
    rr(ctx, px, py, pw, ph, 36); ctx.fillStyle = lg(ctx, 0, py, 0, py + ph, [[0, '#8E78F0'], [1, '#4A30A8']]); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
    G.buttons.push({ id: 'lang_panel', x: px, y: py, w: pw, h: ph, fn: () => {} });             // tik op het paneel zelf doet niets
    textOut(tr('language'), W / 2, py + 50, 40, '#FFFFFF', OUT, 7);
    I18N.LANGS.forEach((code, i) => {
      const x = px + 30 + (i % cols) * (bw + gap), y = py + 96 + Math.floor(i / cols) * (bh + gap), on = code === I18N.lang;
      button('lang_' + code, x, y, bw, bh, { color: on ? COL.yellow : COL.blue, label: I18N.NAMES[code], size: 26, fn: () => {
        SFX.click(); I18N.set(code); M('settings', 'language', code); G.langOpen = false; sprites.clear();
      } });
    });
  }

  function worldLevels(w) { return LEVELS.map((L, i) => ({ L, i })).filter(o => o.L.world === w + 1); }
  function worldOpen(w) { const f = worldLevels(w)[0]; return f && unlocked(f.i); }
  function drawLevels() {
    G.world = clamp(G.world || 0, 0, WORLDS.length - 1);
    drawBackground(G.t);
    const Wd = WORLDS[G.world], T = THEMES[Wd.theme], wl = worldLevels(G.world), wOpen = worldOpen(G.world);
    textOut(tr('world', { n: Wd.id }), W / 2, 62, 26, T.accent === '#FF6B8A' ? '#FFB3C4' : '#FFE66B', OUT, 5);
    textOut(wname(Wd), W / 2, 112, 54, '#FFFFFF', OUT, 9, 'center', 900);
    // wereld-stippen
    WORLDS.forEach((w, k) => { ctx.beginPath(); ctx.arc(W / 2 - 60 + k * 30, 160, k === G.world ? 8 : 6, 0, 7); ctx.fillStyle = k === G.world ? '#FFFFFF' : (worldOpen(k) ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.18)'); ctx.fill(); });
    const cw = 190, ch = 210, gap = 26, x0 = W / 2 - (wl.length * cw + (wl.length - 1) * gap) / 2;
    wl.forEach(({ L, i }, n) => {
      const x = x0 + n * (cw + gap), y = 220 + Math.sin(G.t * 2 + n) * 4, open = unlocked(i), hov = G.hover === 'lvl' + i;
      ctx.save();
      ctx.fillStyle = 'rgba(10,5,35,.45)'; rr(ctx, x + 4, y + 12, cw, ch, 28); ctx.fill();
      const yy = y - (hov && open ? 6 : 0);
      rr(ctx, x, yy, cw, ch, 28);
      ctx.fillStyle = open ? lg(ctx, 0, y, 0, y + ch, [[0, T.card[0]], [1, T.card[1]]]) : lg(ctx, 0, y, 0, y + ch, [[0, 'rgba(70,60,120,.92)'], [1, 'rgba(40,32,80,.92)']]);
      ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); rr(ctx, x, yy, cw, ch, 28); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(x, yy, cw, 60); ctx.restore();
      if (open) {
        textOut(String(L.id), x + cw / 2, yy + 78, 76, '#FFF4E0', OUT, 9);
        ctx.font = `800 18px ${FONT}`; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; fillFit(lname(L), x + cw / 2, yy + 138, cw - 16);
        const st = save.stars[L.id] || 0;
        for (let k = 0; k < 3; k++) drawStar(x + cw / 2 - 40 + k * 40, yy + 178, 15, k < st);
      } else {
        ctx.strokeStyle = '#B8A8F0'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(x + cw / 2, yy + 92, 22, Math.PI, 0); ctx.stroke();
        rr(ctx, x + cw / 2 - 34, yy + 92, 68, 54, 12); ctx.fillStyle = lg(ctx, 0, yy + 92, 0, yy + 146, [[0, '#D7C8FF'], [1, '#8A72D8']]); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x + cw / 2, yy + 114, 7, 0, 7); ctx.fill();
      }
      ctx.restore();
      G.buttons.push({ id: 'lvl' + i, x, y, w: cw, h: ch, fn: () => { if (!open) { SFX.bad(); return; } SFX.click(); startLevel(i); } });
    });
    if (!wOpen) once('world', String(Wd.id), 'locked');
    if (!wOpen) {
      const prev = WORLDS[G.world - 1];
      panel(W / 2 - 300, 470, 600, 54, 27, 0.8);
      ctx.font = `700 20px ${FONT}`; ctx.fillStyle = '#FFF4E0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (prev) fillFit(tr('worldLocked', { name: wname(prev) }), W / 2, 498, 570);
    }
    if (G.world > 0) button('wprev', 40, 300, 70, 70, { color: COL.purple, icon: icon.left, fn: () => { SFX.click(); G.world--; } });
    if (G.world < WORLDS.length - 1) button('wnext', W - 110, 300, 70, 70, { color: COL.purple, icon: icon.right, fn: () => { SFX.click(); G.world++; } });
    button('back', 30, 620, 170, 70, { color: COL.purple, icon: icon.home, label: tr('back'), size: 26, fn: () => { SFX.click(); G.screen = 'title'; } });
    const total = LEVELS.reduce((a, L) => a + (save.stars[L.id] || 0), 0);
    panel(W - 250, 630, 220, 56, 28, 0.75); drawStar(W - 212, 658, 18, true); textOut(`${total} / ${LEVELS.length * 3}`, W - 125, 659, 28, '#FFFFFF', OUT, 5);
    drawOutfitBar(W / 2, 660, 460);
  }

  // ---------- key-art voor de Poki-thumbnail (alleen via PLONK_DEBUG.thumb()) ----------
  // Poki-richtlijnen: vierkant, geen tekst, hoofdfiguur in dynamische pose, één duidelijk middelpunt,
  // eenvoudige achtergrond, veel contrast, niets wat niet in de game zit.
  function drawThumb() {
    const cx = 640;
    drawBackground(G.t);
    ctx.fillStyle = 'rgba(16,8,48,.45)'; ctx.fillRect(0, 0, W, H);                       // achtergrond rustiger
    ctx.fillStyle = rg(ctx, cx + 20, 420, 40, cx + 20, 420, 420, [[0, 'rgba(255,214,120,.55)'], [0.5, 'rgba(255,170,90,.18)'], [1, 'rgba(255,170,90,0)']]);
    ctx.fillRect(0, 0, W, H);                                                              // warme spot op Bobo
    // stralen achter Bobo
    ctx.save(); ctx.translate(cx + 40, 440); ctx.globalAlpha = 0.16; ctx.fillStyle = '#FFE9A8';
    for (let i = 0; i < 14; i++) { ctx.rotate(Math.PI / 7); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -640); ctx.lineTo(40, -640); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // plank waar de knikker vanaf komt (echt onderdeel uit de game)
    drawSprite(partSprite('plank'), cx - 330, 150, rad(28), 1, 1.35, 1.35);
    // spoor van de knikker: boog met stippen en snelheidslijnen
    const mx = cx - 120, my = 300;
    ctx.save();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = '#FFF4C4'; ctx.lineCap = 'round';
    for (const [o, l, w] of [[-26, 60, 5], [0, 84, 7], [26, 52, 5]]) {   // snelheidslijnen in de vliegrichting
      const ox = mx - 46 - o * 0.45, oy = my - 22 + o * 0.9;
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - l * 0.88, oy - l * 0.47); ctx.stroke();
    }
    ctx.restore();
    // Bobo groot, mond wijd open, ogen op de knikker
    bobo.mood = 'idle'; bobo.blink = 0; bobo.mouth = 1; bobo.chomp = 0; bobo.happy = 0; bobo.sad = 0; bobo.look.x = -0.75; bobo.look.y = -0.66;
    ctx.save(); ctx.translate(cx + 40, 470); ctx.rotate(-0.08); ctx.scale(2.55, 2.55);
    drawBobo(0, 0, S.BOBO_R, 1.3, null, { outfit: 'none' }); ctx.restore();
    // de gouden knikker, groot en glanzend
    ctx.save(); ctx.translate(mx, my); ctx.scale(2.3, 2.3);
    ctx.fillStyle = rg(ctx, 0, 0, 6, 0, 0, 44, [[0, 'rgba(255,220,90,.8)'], [1, 'rgba(255,220,90,0)']]); ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill();
    ctx.restore();
    drawSprite(partSprite('marble'), mx, my, 0.6, 1, 2.3, 2.3);
    drawSprite(sprite('spec20', 40, 40, 2, artSpec(20)), mx, my, 0, 1, 2.3, 2.3, false);
    // een paar sterretjes en confetti voor energie
    seed = 11;
    for (let i = 0; i < 7; i++) { const a = rnd() * 6.28, d = 60 + rnd() * 50; ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FFF2A8'; star5(ctx, mx + Math.cos(a) * d, my + Math.sin(a) * d, 7 + rnd() * 6, 0.4); ctx.fill(); }
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(cx - 340 + rnd() * 720, 40 + rnd() * 260); ctx.rotate(rnd() * 6); ctx.fillStyle = CONF[i % 5]; ctx.fillRect(-7, -4, 14, 8); ctx.restore(); }
    // vloer + vignet
    ctx.fillStyle = rg(ctx, cx, 380, 260, cx, 380, 620, [[0, 'rgba(10,5,30,0)'], [1, 'rgba(10,5,30,.5)']]); ctx.fillRect(0, 0, W, H);
  }

  function drawWardrobe() {
    drawBackground(G.t);
    textOut(tr('wardrobeTitle'), W / 2, 70, 52, '#FFFFFF', OUT, 9, 'center', 900);
    ctx.font = `700 18px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFF4E0'; ctx.textBaseline = 'middle';
    fillFit(tr('wardrobeSub'), W / 2, 118, 1100);
    const cw = 150, ch = 190, gap = 18, cols = 4, x0 = W / 2 - (cols * cw + (cols - 1) * gap) / 2;
    OUTFITS.forEach((o, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = 150 + Math.floor(i / cols) * (ch + gap), open = outfitOpen(o), on = save.outfit === o.id;
      ctx.save();
      ctx.fillStyle = 'rgba(10,5,35,.45)'; rr(ctx, x + 3, y + 8, cw, ch, 24); ctx.fill();
      rr(ctx, x, y, cw, ch, 24); ctx.fillStyle = open ? lg(ctx, 0, y, 0, y + ch, [[0, '#8E78F0'], [1, '#5A3FC0']]) : 'rgba(40,32,80,.9)'; ctx.fill();
      ctx.lineWidth = on ? 6 : 3; ctx.strokeStyle = on ? '#FFE66B' : OUT; ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = open ? 1 : 0.35; ctx.translate(x + cw / 2, y + 88); ctx.scale(0.62, 0.62); drawBobo(0, 0, S.BOBO_R, G.t + i, null, { outfit: o.id }); ctx.restore();
      ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; fillFit(oname(o), x + cw / 2, y + 150, cw - 10);
      ctx.font = `700 13px ${FONT}`; ctx.fillStyle = open ? (on ? '#FFE66B' : 'rgba(255,255,255,.7)') : '#FFB3C4';
      fillFit(on ? tr('wearing') : open ? tr('tapWear') : (o.daily ? tr('needDaily', { n: o.daily }) : tr('needStars', { n: o.need })), x + cw / 2, y + 172, cw - 12);
      G.buttons.push({ id: 'out_' + o.id, x, y, w: cw, h: ch, fn: () => { if (!open) { SFX.bad(); return; } SFX.pick(); if (save.outfit !== o.id) M('outfit', o.id, 'equip'); save.outfit = o.id; persist(); sparkle(x + cw / 2, y + 60, 10); } });
    });
    button('back', 30, 630, 170, 66, { color: COL.purple, icon: icon.home, label: tr('back'), size: 24, fn: () => { SFX.click(); G.screen = G.wardFrom === 'win' && G.result ? 'win' : 'title'; G.wardFrom = null; } });
    drawOutfitBar(W / 2 + 60, 664, 560);
  }

  function drawWin() {
    const k = ease(clamp((G.t - G.winAt) * 2.5, 0, 1));
    ctx.fillStyle = `rgba(14,6,40,${0.55 * k})`; ctx.fillRect(0, 0, W, H);
    const pw = 600, ph = 560, px = W / 2 - pw / 2, py = H / 2 - ph / 2 + (1 - back(k)) * 200;
    ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(10,5,35,.5)'; rr(ctx, px + 6, py + 16, pw, ph, 40); ctx.fill();
    rr(ctx, px, py, pw, ph, 40); ctx.fillStyle = lg(ctx, 0, py, 0, py + ph, [[0, '#8E78F0'], [1, '#4A30A8']]); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); rr(ctx, px, py, pw, ph, 40); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(px, py, pw, 90);
    ctx.translate(W / 2, py + 150); ctx.rotate(G.t * 0.3); ctx.fillStyle = 'rgba(255,230,120,.10)';
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -400); ctx.lineTo(40, -400); ctx.fill(); }
    ctx.restore();
    textOut(tr('win'), W / 2, py + 58, 56, '#FFE66B', OUT, 9, 'center', pw - 60);
    const R = G.result, labels = [tr('solved'), G.level.par > 1 ? tr('maxPartN', { n: G.level.par }) : tr('maxPart1'), tr('within', { s: G.parTime[G.level.id] })];
    for (let i = 0; i < 3; i++) {
      const delay = 0.45 + i * 0.28, tk = clamp((G.t - G.winAt - delay) * 4, 0, 1);
      if (tk > 0 && !R['s' + i]) { R['s' + i] = 1; if (R.st[i]) { SFX.star(i); sparkle(W / 2 - 140 + i * 140, py + 150, 12); } }
      const sc = R.st[i] ? back(tk) : tk;
      drawStar(W / 2 - 140 + i * 140, py + 148 - (i === 1 ? 12 : 0), i === 1 ? 50 : 42, R.st[i] && tk > 0, Math.max(0.01, sc));
      ctx.font = `700 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = R.st[i] ? '#FFFFFF' : 'rgba(255,255,255,.5)'; fillFit(labels[i], W / 2 - 140 + i * 140, py + 214, 136);
    }
    // prestatie-regel
    const bits = [`${R.t.toFixed(1)}s`]; if (R.chain >= 2) bits.push(tr('chain', { n: R.chain })); if (R.record) bits.push(tr('record'));
    ctx.font = `800 19px ${FONT}`; ctx.fillStyle = R.record ? '#8AE234' : '#FFF4E0'; ctx.fillText(bits.join('  ·  '), W / 2, py + 252);
    // beloning: nieuwe outfit, dagpuzzel of voortgang naar de volgende
    const rk = clamp((G.t - G.winAt - 1.3) * 3, 0, 1);
    ctx.globalAlpha = k * rk;
    if (R.unlockedNow.length) {
      const o = R.unlockedNow[R.unlockedNow.length - 1];
      if (!R.sOut && rk > 0) { R.sOut = 1; SFX.win(); sparkle(W / 2 - 150, py + 316, 20); }
      panel(px + 40, py + 278, pw - 80, 78, 26, 0.6);
      ctx.save(); ctx.translate(px + 100, py + 324); ctx.scale(0.42, 0.42); drawBobo(0, 0, S.BOBO_R, G.t, null, { outfit: o.id }); ctx.restore();
      textOut(tr('newForBobo'), px + 150, py + 304, 20, '#FFE66B', OUT, 4, 'left', pw - 370);
      textOut(oname(o), px + 150, py + 334, 26, '#FFFFFF', OUT, 5, 'left', pw - 370);
    } else if (R.dailyDone) {
      panel(px + 40, py + 284, pw - 80, 62, 26, 0.6);
      textOut(tr('dailyWin', { n: save.daily.count }), W / 2, py + 315, 22, '#FFE66B', OUT, 5, 'center', pw - 100);
    } else drawOutfitBar(W / 2, py + 315, pw - 80);
    // nieuwsgierigheid: wat komt er hierna?
    const ni = G.levelIdx + 1;
    if (!G.daily && ni < LEVELS.length) {
      const NL = LEVELS[ni], np = newPartsIn(ni), sameWorld = NL.world === G.level.world;
      ctx.font = `700 17px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.75)';
      fillFit(sameWorld ? tr('nextLevel', { n: NL.id, name: lname(NL) }) : tr('nextWorld', { name: wname(WORLDS[NL.world - 1]) }), W / 2, py + 378, pw - 60);
      if (np.length) { const t = np[0], sp = partSprite(t), kk = Math.min(0.32, 70 / (sp.w + 10), 30 / (sp.h + 10));
        rr(ctx, W / 2 - 150, py + 392, 300, 34, 17); ctx.fillStyle = '#FF6B8A'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
        drawSprite(sp, W / 2 - 108, py + 409, 0, ctx.globalAlpha, kk, kk, false);
        ctx.font = `800 16px ${FONT}`; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; fillFit(tr('newPart', { name: pname(t) }), W / 2 + 32, py + 410, 216); }
    }
    ctx.restore();
    if (k > 0.9) {
      button('again', px + 40, py + ph - 104, 220, 78, { color: COL.purple, icon: icon.stop, label: tr('again'), size: 26, fn: () => { SFX.click(); M('win', 'retry', 'interact'); retry(); } });
      button('next', px + pw - 300, py + ph - 104, 260, 78, { color: COL.green, icon: icon.next, label: G.daily ? tr('done') : tr('next'), size: 28, fn: () => { SFX.click(); M('win', 'next', 'interact'); nextLevel(); } });
      // v1.2: nieuwe outfit? meteen naar de kast (de kastknop op het titelscherm zien nieuwe spelers nooit)
      if (R.unlockedNow.length && G.t - G.winAt > 1.6) {
        once('wardrobe', 'win-button', 'visible');
        button('wardWin', px + pw - 210, py + 290, 160, 54, { color: COL.purple, icon: icon.hat, label: tr('wardrobe'), size: 20, fn: () => { if (G.busy) return; SFX.click(); M('wardrobe', 'win-button', 'interact'); M('mode', 'wardrobe', 'interact'); G.wardFrom = 'win'; G.screen = 'wardrobe'; } });
      }
    }
  }

  function wrapText(str, maxW) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }
  function drawIntro() {
    const I = G.intro; if (!I) return;
    let k = ease(clamp((G.t - I.t0) * 3, 0, 1));
    if (I.out >= 0) { k = 1 - ease(clamp((G.t - I.out) * 4, 0, 1)); if (k <= 0) { G.intro = null; return; } }
    ctx.save();
    ctx.fillStyle = `rgba(14,6,40,${0.5 * k})`; ctx.fillRect(0, 0, W, H);
    const pw = 620, ph = 300, px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 30 + (1 - back(k)) * 120;
    ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(10,5,35,.5)'; rr(ctx, px + 6, py + 14, pw, ph, 36); ctx.fill();
    rr(ctx, px, py, pw, ph, 36); ctx.fillStyle = lg(ctx, 0, py, 0, py + ph, [[0, '#8E78F0'], [1, '#4A30A8']]); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); rr(ctx, px, py, pw, ph, 36); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(px, py, pw, 80); ctx.restore();
    textOut(tr('level', { n: G.level.id }), W / 2, py + 44, 26, '#FFC93C', OUT, 5);
    textOut(lname(G.level), W / 2, py + 92, 50, '#FFFFFF', OUT, 8, 'center', pw - 50);
    ctx.font = `700 23px ${FONT}`; ctx.fillStyle = '#FFF4E0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    wrapText(ltip(G.level), pw - 80).forEach((l, i) => ctx.fillText(l, W / 2, py + 152 + i * 32));
    // onderdelen-preview
    const inv = Object.entries(G.level.inventory);
    ctx.font = `800 17px ${FONT}`;
    const tot = inv.length * 110; inv.forEach(([t, n], i) => {
      const cx = W / 2 - tot / 2 + 55 + i * 110, cy = py + 238, sp = partSprite(t), kk = Math.min(0.4, 80 / (sp.w + 10), 40 / (sp.h + 10));
      drawSprite(sp, cx - 14, cy, t === 'plank' ? -0.15 : 0, k, kk, kk, false);
      if (G.newParts && G.newParts.includes(t)) { ctx.save(); rr(ctx, cx - 48, cy - 34, 62, 20, 10); ctx.fillStyle = '#FF6B8A'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke(); ctx.font = `800 12px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFF'; fillFit(tr('newBadge'), cx - 17, cy - 23, 58); ctx.restore(); ctx.font = `800 17px ${FONT}`; }
      ctx.fillStyle = '#FFE66B'; ctx.fillText('×' + n, cx + 38, cy + 2);
    });
    ctx.font = `700 16px ${FONT}`; ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.3 * Math.sin(G.t * 4)})`; ctx.fillText(tr('tapBuild'), W / 2, py + ph + 34);
    ctx.restore();
  }

  // ---------- input ----------
  function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) - offX) / scale, y: ((e.clientY - r.top) - offY) / scale }; }
  // touch: grotere zones, want een vinger is veel grover dan een muis (op een telefoon is alles ~half zo groot)
  const touchPad = () => (G.touch ? 14 / scale : 0);
  function hitButton(p) {
    for (let i = G.buttons.length - 1; i >= 0; i--) { const b = G.buttons[i]; if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return b; }
    const pad = touchPad(); if (!pad) return null;
    let best = null, bd = 1e9;
    for (const b of G.buttons) {
      const dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.w)), dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.h)), d = Math.hypot(dx, dy);
      if (d <= pad && d < bd) { bd = d; best = b; }
    }
    return best;
  }
  function distToBody(b, p) {
    if (Matter.Vertices.contains(b.vertices, p)) return 0;
    let m = 1e9; const v = b.vertices;
    for (let i = 0; i < v.length; i++) {
      const A = v[i], B = v[(i + 1) % v.length], dx = B.x - A.x, dy = B.y - A.y, L = dx * dx + dy * dy || 1;
      const t = clamp(((p.x - A.x) * dx + (p.y - A.y) * dy) / L, 0, 1);
      m = Math.min(m, Math.hypot(p.x - (A.x + t * dx), p.y - (A.y + t * dy)));
    }
    return m;
  }
  function hitPlacement(p) {
    const tol = G.touch ? clamp(30 / scale, 20, 70) : 12;
    let best = -1, bd = 1e9;
    for (let i = G.placements.length - 1; i >= 0; i--) {
      const d = distToBody(S.makeBody(G.placements[i]), p);
      if (d <= tol && d < bd - 0.5) { bd = d; best = i; }
    }
    return best;
  }
  const snap = v => Math.round(v / GRID) * GRID;
  function updateDrag(p) {
    const d = G.drag; d.x = p.x; d.y = p.y;
    if (Math.hypot(p.x - d.sx, p.y - d.sy) > (G.touch ? 10 : 5) / scale) d.moved = true;
    d.inField = p.y + (d.oy || 0) < PLAY_BOTTOM + 10 && p.y + (d.oy || 0) > PLAY_TOP;
    positionCandidate(d, p);
    d.valid = d.inField && !S.overlaps(G.level, G.placements, d.item, d.index == null ? -1 : d.index);
  }
  // zet het gesleepte onderdeel op de juiste plek: raster, magnetisch naar de hint, domino's op de grond
  function positionCandidate(d, p) {
    const it = d.item, ign = d.index == null ? -1 : d.index;
    const rx = p.x + (d.ox || 0), ry = p.y + (d.oy || 0);
    d.magnet = false;
    if (G.hint && G.hint.type === it.type && Math.hypot(rx - G.hint.x, ry - G.hint.y) < 55) {
      it.x = G.hint.x; it.y = G.hint.y; it.a = G.hint.a || 0; it.flip = !!G.hint.flip; d.magnet = true;
      return it;
    }
    it.x = snap(rx); it.y = snap(ry);
    if (it.type === 'domino') { const st = S.settle(G.level, G.placements, it, ign); it.y = st.y; }
    return it;
  }
  function nextOrientation(p, dir) {
    const P = S.PARTS[p.type], c = { ...p };
    if (P.flip) { c.flip = !c.flip; return c; }
    for (let k = 0; k < 9; k++) {
      c.a = (c.a || 0) + dir * P.rotStep; if (c.a > 60) c.a = -60; if (c.a < -60) c.a = 60;
      if (!S.overlaps(G.level, G.placements, c, G.selected)) return c;
    }
    return null;
  }
  // draaibolletje aan het rechteruiteinde: sleep het rond om te draaien
  function knobPos(p) {
    const P = S.PARTS[p.type], a = rad(p.a || 0), r = P.w / 2 + (G.touch ? 34 : 28);
    return { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, ex: p.x + Math.cos(a) * P.w / 2, ey: p.y + Math.sin(a) * P.w / 2 };
  }
  function drawRotKnob(p, k) {
    const q = knobPos(p), R = G.touch ? 19 : 15;
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(q.ex, q.ey); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
    if (G.rot) { // boog die laat zien waar je kunt draaien (-60° … 60°)
      ctx.strokeStyle = 'rgba(255,230,107,.45)'; ctx.lineWidth = 4; ctx.beginPath();
      ctx.arc(p.x, p.y, Math.hypot(q.x - p.x, q.y - p.y), rad(-60), rad(60)); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(q.x, q.y, R * (1 + 0.08 * k), 0, 7);
    ctx.fillStyle = lg(ctx, 0, q.y - R, 0, q.y + R, [[0, '#9BE6FF'], [1, '#1D7FC2']]); ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = OUT; ctx.stroke();
    // twee gebogen pijltjes = 'draai mij'
    ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (const sgn of [1, -1]) {
      ctx.beginPath(); ctx.arc(q.x, q.y, R * 0.55, sgn > 0 ? -2.4 : 0.75, sgn > 0 ? -0.75 : 2.4); ctx.stroke();
      const ang = sgn > 0 ? -0.75 : 2.4, ax = q.x + Math.cos(ang) * R * 0.55, ay = q.y + Math.sin(ang) * R * 0.55;
      ctx.beginPath(); ctx.arc(ax, ay, 2.6, 0, 7); ctx.fill();
    }
    ctx.restore();
    G.knobHit = { x: q.x, y: q.y, r: R + (G.touch ? 14 / scale : 6) };
  }
  function hitMarble(p) {
    if (G.screen !== 'build' || !G.level) return false;
    const m = G.level.items.find(i => i.type === 'marble'); if (!m) return false;
    return Math.hypot(p.x - m.x, p.y - m.y) <= S.MARBLE_R + (G.touch ? Math.max(14, 22 / scale) : 12);
  }
  function rotateToPointer(p) {
    const pl = G.placements[G.rot.index]; if (!pl) { G.rot = null; return; }
    let ang = Math.atan2(p.y - pl.y, p.x - pl.x) * 180 / Math.PI;   // het bolletje zit rechts: hoek van de vinger = hoek van de plank
    if (ang > 90) ang -= 180; if (ang < -90) ang += 180;             // plank is symmetrisch
    const P = S.PARTS[pl.type], a = clamp(Math.round(ang / P.rotStep) * P.rotStep, -60, 60);
    if (a === (pl.a || 0)) return;
    const c = { ...pl, a };
    if (S.overlaps(G.level, G.placements, c, G.rot.index)) return;    // past niet: blijf staan
    pl.a = a; SFX.rotate();
  }
  function rotateSelected(dir = 1) {
    const p = G.placements[G.selected]; if (!p) return; const P = S.PARTS[p.type];
    const old = { a: p.a, flip: p.flip };
    const stepA = () => { p.a = (p.a || 0) + dir * P.rotStep; if (p.a > 60) p.a = -60; if (p.a < -60) p.a = 60; };
    if (P.flip) p.flip = !p.flip; else stepA();
    if (S.overlaps(G.level, G.placements, p, G.selected)) {
      if (P.rotStep) for (let k = 0; k < 8 && S.overlaps(G.level, G.placements, p, G.selected); k++) stepA();
      if (S.overlaps(G.level, G.placements, p, G.selected)) { p.a = old.a; p.flip = old.flip; SFX.bad(); G.toast = { text: tr('noRoom'), t: 0, dur: 1.6 }; return; }
    }
    G.rotShow = G.t; once('help', 'rotate-part', 'interact');
    SFX.rotate(); puff(p.x, p.y, 4);
  }
  function deleteSelected() { if (G.selected < 0) return; const p = G.placements.splice(G.selected, 1)[0]; G.selected = -1; SFX.pick(); puff(p.x, p.y, 8); }

  cv.addEventListener('pointerdown', e => {
    if (G.pointerId != null && e.pointerId !== G.pointerId) return; // tweede vinger negeren
    G.pointerId = e.pointerId; G.touch = e.pointerType !== 'mouse';
    SFX.unlock(); act(); G.lastInput = G.t; try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    const p = toLogical(e); G.hover = null;
    if (G.busy) return;
    if (G.intro) { if (G.intro.out < 0) { G.intro.out = G.t; SFX.click(); } G.swallow = true; return; }
    const b = hitButton(p);
    if (G.screen === 'build') {
      if (b && b.slot) {
        if (remaining(b.slot) <= 0) { SFX.bad(); return; }
        SFX.pick(); G.selected = -1;
        const it = { type: b.slot, x: p.x, y: p.y, a: 0, flip: false };
        if (b.slot === 'plank') it.a = 15;
        const lift = G.touch ? clamp(55 / scale, 50, 120) : 0; // onderdeel boven de vinger houden
        G.drag = { item: it, index: null, x: p.x, y: p.y, sx: p.x, sy: p.y, oy: -lift, moved: true, inField: false, valid: false };
        updateDrag(p);
        return;
      }
      if (b) { G.pressed = b.id; return; }
      if (hitMarble(p)) { G.pressed = 'marble'; return; }
      if (G.selected >= 0 && G.knobHit && Math.hypot(p.x - G.knobHit.x, p.y - G.knobHit.y) <= G.knobHit.r) {
        G.rot = { index: G.selected, startA: G.placements[G.selected].a || 0 }; SFX.pick(); return;
      }
      const idx = hitPlacement(p);
      if (idx >= 0) {
        const pl = G.placements[idx];
        G.selected = idx; SFX.pick();
        G.drag = { item: { ...pl }, index: idx, x: p.x, y: p.y, sx: p.x, sy: p.y, ox: pl.x - p.x, oy: pl.y - p.y, moved: false, inField: true, valid: true };
        return;
      }
      G.selected = -1;
    } else if (b) G.pressed = b.id;
  });
  cv.addEventListener('pointermove', e => {
    if (G.pointerId != null && e.pointerId !== G.pointerId) return;
    if (e.pointerType === 'mouse') G.touch = false;
    const p = toLogical(e);
    if (G.rot) { rotateToPointer(p); G.lastInput = G.t; return; }
    if (G.drag) { updateDrag(p); G.lastInput = G.t; return; }
    const b = hitButton(p); G.hover = b ? b.id : null;
    const onKnob = G.screen === 'build' && G.selected >= 0 && G.knobHit && Math.hypot(p.x - G.knobHit.x, p.y - G.knobHit.y) <= G.knobHit.r;
    if (onKnob && !b) G.hover = 'knob';
    if (!b && !onKnob && hitMarble(p)) G.hover = 'marble';
    cv.style.cursor = onKnob ? 'grab' : G.hover === 'marble' || b || (G.screen === 'build' && hitPlacement(p) >= 0) ? 'pointer' : 'default';
  });
  function endPointer(e) {
    if (G.pointerId != null && e.pointerId !== G.pointerId) return;
    G.pointerId = null;
    const p = toLogical(e);
    if (G.swallow) { G.swallow = false; return; }
    if (G.rot) { G.rot = null; SFX.place(); once('help', 'rotate-knob', 'interact'); return; }
    if (G.drag) {
      const d = G.drag; G.drag = null;
      if (d.index != null && !d.moved) { return; } // tik = selecteren
      updateDrag.call(null, p); // laatste positie (drag is al null; bereken opnieuw)
      const it = positionCandidate(d, p);
      const inField = p.y + (d.oy || 0) < PLAY_BOTTOM + 10 && p.y + (d.oy || 0) > PLAY_TOP && p.y < 612;
      const valid = inField && !S.overlaps(G.level, G.placements, it, d.index == null ? -1 : d.index);
      if (valid) {
        if (d.index != null) { G.placements[d.index] = it; G.selected = d.index; }
        else { G.placements.push(it); G.selected = G.placements.length - 1; }
        SFX.place(); puff(it.x, it.y + 10, 8);
        if (S.PARTS[it.type].rotStep && !save.rotTip) { save.rotTip = 1; persist(); G.toast = { text: tr('rotateTip'), t: 0, dur: 4.5 }; }
        if (d.index == null && G.level.tutorial) once('tutorial', 'hand', 'part-placed');
        if (d.index == null && G.placeFirstPending) { G.placeFirstPending = false; once('help', 'place-first', 'interact'); }
        else if (d.index != null) once('help', 'move-part', 'interact');
        if (d.magnet) { G.hint = null; sparkle(it.x, it.y, 12); SFX.star(1); }
      } else if (d.index != null && !inField) { G.placements.splice(d.index, 1); G.selected = -1; SFX.pick(); }
      else { SFX.bad(); }
      return;
    }
    if (G.pressed === 'marble') { G.pressed = null; if (hitMarble(p)) play('marble'); return; }
    const b = hitButton(p);
    if (b && b.id === G.pressed && b.fn) b.fn();
    G.pressed = null;
  }
  // drag kan null zijn bij updateDrag in endPointer; bewaak dat
  const _ud = updateDrag; updateDrag = function (p) { if (G.drag) _ud(p); };
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', e => { if (G.pointerId != null && e.pointerId !== G.pointerId) return; G.pointerId = null; G.drag = null; G.rot = null; G.pressed = null; });
  window.addEventListener('keydown', e => {
    act(); G.lastInput = G.t;
    if (G.screen === 'build') {
      if (G.drag || G.rot || G.busy) return;         // niet draaien/verwijderen terwijl je sleept of tijdens een advertentie
      if ((e.key === 'r' || e.key === 'R') && G.selected >= 0) rotateSelected(e.shiftKey ? -1 : 1);
      if ((e.key === 'e' || e.key === 'E') && G.selected >= 0) rotateSelected(-1);
      if ((e.key === 'Delete' || e.key === 'Backspace') && G.selected >= 0) deleteSelected();
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (G.intro) { G.intro.out = G.t; return; } play('key'); }
    } else if (G.screen === 'play' && !G.busy && (e.key === ' ' || e.key === 'Escape')) { e.preventDefault(); stopPlay(); }
  });
  cv.addEventListener('wheel', e => { if (G.screen === 'build' && G.selected >= 0 && !G.drag && !G.busy) { e.preventDefault(); rotateSelected(e.deltaY > 0 ? 1 : -1); } }, { passive: false });
  ['contextmenu', 'gesturestart'].forEach(ev => cv.addEventListener(ev, e => e.preventDefault()));
  window.addEventListener('keydown', e => { if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault(); });

  // ---------- sim tick + events ----------
  function tickSim(dt) {
    const sim = G.sim; if (!sim || sim.state !== 'running') return;
    // v1.3: geen slowmotion meer vlak voor de hap (voelde als vertraging); de simulatie loopt altijd op normale snelheid
    const bi = boboItem();
    G.slow = 1;
    G.acc = (G.acc || 0) + dt;
    let n = 0;
    while (G.acc >= S.STEP / 1000 && n < 5) {
      sim.step(); G.acc -= S.STEP / 1000; n++;
      const mp = sim.marble.position; G.minDist = Math.min(G.minDist, Math.hypot(mp.x - bi.x, mp.y - bi.y));
      if (sim.frame % 3 === 0 && G.trail.length < 900) G.trail.push({ x: mp.x, y: mp.y });
      if (sim.state !== 'running') break;
    }
    for (const f of sim.fans) if (Math.random() < 0.5) wind(f.position.x, f.position.y, f.plonk.item.flip ? -1 : 1);
    while (sim.events.length) {
      const ev = sim.events.shift();
      if (ev.kind === 'hit' || ev.kind === 'boing') {
        // kettingreactie-teller: elk onderdeel dat meedoet telt één keer (feedback die afhangt van wat de speler bouwde)
        const CH = ['plank', 'bouncer', 'seesaw', 'domino', 'conveyor', 'heavy', 'fan'];
        const ids = ev.kind === 'boing' ? [[ev.body.id, 'bouncer']] : ev.ids.map((id, k) => [id, ev.types[k]]);
        for (const [id, ty] of ids) if (CH.includes(ty) && !G.chain.has(id)) {
          G.chain.add(id);
          if (G.chain.size >= 2) { parts.push({ k: 'text', text: tr('chainShort', { n: G.chain.size }), x: ev.x, y: ev.y - 30, vx: 0, vy: -1.1, life: 1.1, t: 0, size: 22 + Math.min(10, G.chain.size * 2) }); SFX.star(Math.min(3, G.chain.size - 2)); }
        }
      }
      if (ev.kind === 'hit') {
        const heavy = ev.types.includes('heavy');
        SFX.hit(ev.speed, heavy); if (ev.speed > 3) puff(ev.x, ev.y, heavy ? 8 : 4);
        if (heavy && ev.speed > 4) G.shake = Math.max(G.shake, 0.15);
      } else if (ev.kind === 'boing') { SFX.boing(); ring(ev.x, ev.y + 10); ev.body.squash = 1; }
      else if (ev.kind === 'win') win();
      else if (ev.kind === 'lost') lose();
    }
  }

  // ---------- main loop ----------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth; cssH = window.innerHeight;
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    scale = Math.min(cssW / W, cssH / H);
    offX = (cssW - W * scale) / 2; offY = (cssH - H * scale) / 2;
    const newRS = Math.max(1, Math.round(scale * dpr * 4) / 4);
    if (newRS !== RS) { RS = newRS; sprites.clear(); }
    G.dpr = dpr;
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function frame(now) {
    try { frameInner(now); } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  function frameInner(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    G.t += dt; G.fanSpin += dt * 22; sessionTick(now);
    G.buttons = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1A1446'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale * G.dpr, 0, 0, scale * G.dpr, offX * G.dpr, offY * G.dpr);
    if (G.shake > 0) { G.shake -= dt; const s = G.shake * 30; ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s); }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    if (G.screen === 'title') drawTitle(dt);
    else if (G.screen === 'levels') { drawLevels(); }
    else if (G.screen === 'wardrobe') { drawWardrobe(); }
    else if (G.screen === 'thumb') { drawThumb(); }
    else {
      tickSim(dt);
      drawBackground(G.t);
      drawWorld(dt);
      updateParticles(dt); drawParticles();
      drawTray(); drawHUD();
      if (G.screen === 'win') drawWin();
      if (G.screen === 'build' || G.screen === 'play') drawIntro();
    }
    if (G.screen === 'title' || G.screen === 'levels' || G.screen === 'wardrobe') { updateParticles(dt); drawParticles(); }
    drawBtnTips();
    drawToast(dt);
    ctx.restore();
    if (cssH > cssW * 1.1) {
      ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
      ctx.fillStyle = 'rgba(26,20,70,.92)'; ctx.fillRect(0, offY + H * scale, cssW, cssH - offY - H * scale);
      ctx.font = `800 20px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE66B';
      ctx.fillText(tr('rotatePhone'), cssW / 2, offY + H * scale + 40);
    }
  }

  // ---------- boot ----------
  (async function boot() {
    await Poki.init();
    Poki.loadingFinished();
    setTimeout(() => SFX.preloadMusic(), 300);   // muziek pas ná het laden ophalen: telt niet mee voor de eerste download
    sessionOpen();
    const L = document.getElementById('loader'); if (L) L.remove();
    requestAnimationFrame(t => { last = t; frame(t); });
  })();
  window.PLONK = G; window.PLONK_DEBUG = { thumb: () => { G.screen = 'thumb'; G.toast = null; }, startLevel, play, backdate: ms => { firstInput -= ms; } }; // debug
})();
