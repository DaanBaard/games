/* PLONK! – gesynthetiseerde geluiden (geen audiobestanden = kleine download) */
(function (root) {
  let ctx = null, master = null, muted = false, adMuted = false, windNode = null, windGain = null;
  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }
  function apply() { if (master) master.gain.value = (muted || adMuted) ? 0 : 0.55; }
  function tone(freq, dur, type = 'sine', vol = 0.3, slideTo = null, delay = 0) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.3, freq = 800, q = 1, delay = 0, type = 'lowpass') {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  const SFX = {
    unlock() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); },
    click() { tone(880, 0.06, 'triangle', 0.18, 1200); },
    pick() { tone(520, 0.09, 'sine', 0.25, 780); },
    place() { tone(330, 0.12, 'sine', 0.35, 160); noise(0.05, 0.12, 1800); },
    bad() { tone(200, 0.14, 'square', 0.08, 150); },
    rotate() { tone(660, 0.05, 'triangle', 0.15, 990); },
    start() { tone(392, 0.08, 'triangle', 0.25); tone(587, 0.12, 'triangle', 0.25, null, 0.07); },
    hit(speed, heavy) {
      const v = Math.min(1, speed / 12);
      if (heavy) { tone(110, 0.18, 'sine', 0.4 * v + 0.05, 55); noise(0.12, 0.25 * v, 400); }
      else { tone(700 + Math.random() * 300, 0.07, 'sine', 0.18 * v + 0.03, 400); noise(0.04, 0.1 * v, 2500); }
    },
    boing() { tone(220, 0.35, 'sine', 0.35, 660); tone(330, 0.3, 'triangle', 0.12, 990, 0.02); },
    chomp() { noise(0.06, 0.35, 900, 2, 0, 'bandpass'); noise(0.07, 0.35, 700, 2, 0.11, 'bandpass'); tone(300, 0.2, 'sine', 0.3, 140, 0.1); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.22, null, 0.18 + i * 0.09)); tone(1568, 0.5, 'sine', 0.12, null, 0.6); },
    star(i) { tone(880 * Math.pow(1.26, i), 0.18, 'triangle', 0.2, null); tone(1760 * Math.pow(1.26, i), 0.2, 'sine', 0.08, null, 0.03); },
    sad() { tone(330, 0.25, 'triangle', 0.18, 300); tone(294, 0.25, 'triangle', 0.18, 260, 0.22); tone(262, 0.5, 'triangle', 0.18, 200, 0.44); },
    wind(on) {
      const c = ensure(); if (!c) return;
      if (on && !windNode) {
        const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        windNode = c.createBufferSource(); windNode.buffer = buf; windNode.loop = true;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.7;
        windGain = c.createGain(); windGain.gain.value = 0.0001;
        windGain.gain.exponentialRampToValueAtTime(0.09, c.currentTime + 0.4);
        windNode.connect(f); f.connect(windGain); windGain.connect(master); windNode.start();
      } else if (!on && windNode) {
        try { windGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2); windNode.stop(c.currentTime + 0.25); } catch (e) {}
        windNode = null;
      }
    },
    setMuted(m) { muted = m; apply(); },
    isMuted() { return muted; },
    setAdMuted(m) { adMuted = m; apply(); },
  };
  // geluid stil als het tabblad verborgen is (anders blijft o.a. de ventilator-wind doorlopen)
  document.addEventListener('visibilitychange', () => { if (!ctx) return; try { document.hidden ? ctx.suspend() : ctx.resume(); } catch (e) {} });
  root.SFX = SFX;
})(window);
