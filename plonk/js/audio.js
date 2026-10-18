/* PLONK! – geluid: gesynthetiseerde effecten + achtergrondmuziek (2 tracks, lopen om en om in een lus)
   Muziek en effecten hebben elk een eigen volumekanaal en aan/uit-schakelaar (onthouden in localStorage). */
(function (root) {
  let ctx = null, master = null, sfxBus = null, musicBus = null, adMuted = false, windNode = null, windGain = null;
  const MASTER = 0.55, MUSIC_VOL = 0.42;
  const prefs = { music: true, sfx: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('plonk_audio') || '{}')); } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem('plonk_audio', JSON.stringify(prefs)); } catch (e) {} };
  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = adMuted ? 0 : MASTER; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = prefs.sfx ? 1 : 0; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = prefs.music ? MUSIC_VOL : 0; musicBus.connect(master);
    } catch (e) { ctx = null; }
    return ctx;
  }
  function ramp(g, v, t = 0.25) { if (!g || !ctx) return; const n = ctx.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(v, n + t); }
  function apply() { if (typeof Music !== 'undefined') Music.syncElement();
     ramp(master, adMuted ? 0 : MASTER, 0.15); ramp(sfxBus, prefs.sfx ? 1 : 0, 0.1); ramp(musicBus, prefs.music ? MUSIC_VOL : 0, 0.4); }
  function tone(freq, dur, type = 'sine', vol = 0.3, slideTo = null, delay = 0) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
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
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }
  // ---------- achtergrondmuziek ----------
  // Wordt pas ná het laden van de game opgehaald (telt niet mee voor Poki's 'initial download'),
  // en alleen als muziek aanstaat. Twee tracks lopen om en om, met een zachte overgang (crossfade).
  const Music = (() => {
    const URLS = ['music/lichtgewicht-avontuur-1.mp3', 'music/lichtgewicht-avontuur-2.mp3'];
    const XFADE = 2.5;
    const bufs = [], pending = [];
    let idx = 0, cur = null, started = false, active = [];
    // Reserve: bij file:// (index.html dubbelklikken) mag fetch niet; dan een gewoon <audio>-element (zonder crossfade).
    const viaElement = location.protocol === 'file:';
    let el = null;
    function elVolume() { if (el) el.volume = adMuted || !prefs.music || document.hidden ? 0 : MASTER * MUSIC_VOL; }
    function elPlay(i) {
      if (!el) { el = new Audio(); el.preload = 'auto'; el.addEventListener('ended', () => { idx = (idx + 1) % URLS.length; elPlay(idx); }); }
      if (el.dataset.i !== String(i)) { el.src = URLS[i]; el.dataset.i = String(i); }
      elVolume(); const pr = el.play(); if (pr && pr.catch) pr.catch(() => { started = false; });
    }
    function decode(ab) { return new Promise((res, rej) => { const r = ctx.decodeAudioData(ab, res, rej); if (r && r.then) r.then(res, rej); }); }
    function load(i) {
      if (bufs[i]) return Promise.resolve(bufs[i]);
      if (pending[i]) return pending[i];
      pending[i] = fetch(URLS[i]).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(ab => (ensure(), decode(ab))).then(b => (bufs[i] = b)).catch(e => { pending[i] = null; console.log('[muziek] laden mislukt', URLS[i], e); return null; });
      return pending[i];
    }
    function playAt(i, when) {
      const b = bufs[i]; if (!b || !ctx) return;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = b; src.connect(g); g.connect(musicBus);
      const fadeIn = when <= ctx.currentTime + 0.05 && !cur ? 1.2 : XFADE;
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(1, when + fadeIn);
      const end = when + b.duration;
      g.gain.setValueAtTime(1, end - XFADE); g.gain.linearRampToValueAtTime(0.0001, end);
      src.start(when); src.stop(end + 0.05);
      active.push({ src, g }); src.onended = () => { active = active.filter(a => a.src !== src); };
      cur = { src, g, i, end, next: false };
      load((i + 1) % URLS.length);            // volgende track alvast ophalen
    }
    // Elke halve seconde: is de huidige track bijna klaar, plan dan de volgende precies in (crossfade).
    // Werkt met de klok van de audio, dus ook goed als het tabblad even verborgen was.
    setInterval(() => {
      if (!cur || cur.next || !ctx || viaElement) return;
      if (ctx.currentTime < cur.end - XFADE - 6) return;
      const n = (cur.i + 1) % URLS.length, use = bufs[n] ? n : cur.i;   // volgende nog niet binnen: herhaal de huidige
      cur.next = true; playAt(use, Math.max(ctx.currentTime + 0.05, cur.end - XFADE));
    }, 500);
    return {
      preload() { if (prefs.music && !viaElement) load(0); },
      syncElement() { elVolume(); },
      start() {
        if (started || !prefs.music) return;
        if (viaElement) { started = true; elPlay(idx); return; }
        if (!ensure()) return; started = true;
        load(idx).then(b => { if (b && started && !cur) playAt(idx, ctx.currentTime + 0.05); else if (!b) started = false; });
      },
      stop() {
        started = false;
        if (viaElement) { if (el) el.pause(); return; }
        if (!cur) return;
        const n = ctx.currentTime;
        for (const a of active) { try { a.g.gain.cancelScheduledValues(n); a.g.gain.setValueAtTime(a.g.gain.value, n); a.g.gain.linearRampToValueAtTime(0.0001, n + 0.6); a.src.stop(n + 0.65); } catch (e) {} }
        active = [];
        idx = (cur.i + 1) % URLS.length; cur = null;
      },
      duck(sec = 1.6) { // muziek even zachter bij de winjingle
        if (!musicBus || !prefs.music) return; const n = ctx.currentTime;
        musicBus.gain.cancelScheduledValues(n); musicBus.gain.setValueAtTime(musicBus.gain.value, n);
        musicBus.gain.linearRampToValueAtTime(MUSIC_VOL * 0.3, n + 0.15); musicBus.gain.setValueAtTime(MUSIC_VOL * 0.3, n + sec); musicBus.gain.linearRampToValueAtTime(MUSIC_VOL, n + sec + 0.8);
      },
      get track() { return cur ? cur.i : -1; },
      get playing() { return viaElement ? !!(el && !el.paused) : !!cur; },
    };
  })();

  const SFX = {
    unlock() { const c = ensure(); if (c && c.state === 'suspended' && !document.hidden) c.resume(); Music.start(); },
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
    // v1.4: geluiden voor de nieuwe onderdelen
    squish() { noise(0.12, 0.22, 600, 1.5, 0, 'lowpass'); tone(160, 0.16, 'sine', 0.22, 90); },
    bump() { tone(1200, 0.07, 'square', 0.1, 600); tone(600, 0.12, 'triangle', 0.25, 1500, 0.01); },
    warp() { tone(300, 0.35, 'sine', 0.22, 1400); tone(1400, 0.3, 'triangle', 0.08, 300, 0.12); },
    load() { tone(180, 0.08, 'square', 0.08, 120); noise(0.05, 0.12, 900); },
    fire() { noise(0.25, 0.45, 700, 1, 0, 'lowpass'); tone(90, 0.3, 'sine', 0.45, 40); },
    gate() { [392, 523, 659].forEach((f, i) => tone(f, 0.12, 'triangle', 0.2, null, i * 0.07)); noise(0.2, 0.12, 2400, 1, 0.1); },
    chomp() { noise(0.06, 0.35, 900, 2, 0, 'bandpass'); noise(0.07, 0.35, 700, 2, 0.11, 'bandpass'); tone(300, 0.2, 'sine', 0.3, 140, 0.1); },
    win() { Music.duck(); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.22, null, 0.18 + i * 0.09)); tone(1568, 0.5, 'sine', 0.12, null, 0.6); },
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
        windNode.connect(f); f.connect(windGain); windGain.connect(sfxBus); windNode.start();
      } else if (!on && windNode) {
        try { windGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2); windNode.stop(c.currentTime + 0.25); } catch (e) {}
        windNode = null;
      }
    },
    // schakelaars
    musicOn() { return !!prefs.music; },
    sfxOn() { return !!prefs.sfx; },
    setMusic(on) { prefs.music = !!on; savePrefs(); ensure(); apply(); if (on) Music.start(); else Music.stop(); },
    setSfx(on) { prefs.sfx = !!on; savePrefs(); ensure(); apply(); if (!on) SFX.wind(false); },
    preloadMusic() { ensure(); Music.preload(); },
    music: Music,
    setAdMuted(m) { adMuted = m; apply(); },
  };
  // geluid stil als het tabblad verborgen is (anders blijft o.a. de ventilator-wind doorlopen)
  document.addEventListener('visibilitychange', () => { Music.syncElement(); if (!ctx) return; try { document.hidden ? ctx.suspend() : ctx.resume(); } catch (e) {} });
  root.SFX = SFX;
})(window);
