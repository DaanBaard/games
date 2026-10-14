/* PLONK! – Poki SDK wrapper met veilige fallback (lokaal testen zonder SDK / met adblocker) */
(function (root) {
  const has = () => typeof root.PokiSDK !== 'undefined';
  let inGameplay = false;
  const Poki = {
    debug: /[?&]debug=1/.test((root.location && root.location.search) || ''),
    async init() {
      if (!has()) { console.log('[Poki] SDK niet gevonden – fallback actief'); return; }
      try { await root.PokiSDK.init(); console.log('Poki SDK successfully initialized'); }
      catch (e) { console.log('[Poki] init mislukt (adblock?) – game draait door', e); }
    },
    // Game events voor Poki-analytics: measure(category, what, action)
    // Speciale acties: start/complete/fail (voortgangsfunnel) en visible/interact (interactie). Al het andere = eigen event.
    events: [],
    measure(category, what, action) {
      const clean = v => String(v).replace(/[\/^]/g, '-').slice(0, 60); // zoals Prismatic: geen / of ^, max. 60 tekens
      const c = clean(category), w = clean(what), a = clean(action);
      Poki.events.push([c, w, a]); if (Poki.events.length > 500) Poki.events.shift();
      if (!has() || Poki.debug) console.log('[Poki] measure', c, w, a);
      try { has() && typeof root.PokiSDK.measure === 'function' && root.PokiSDK.measure(c, w, a); } catch (e) {}
    },
    loadingFinished() { try { has() && root.PokiSDK.gameLoadingFinished(); } catch (e) {} },
    gameplayStart() { if (inGameplay) return; inGameplay = true; try { has() && root.PokiSDK.gameplayStart(); } catch (e) {} },
    gameplayStop() { if (!inGameplay) return; inGameplay = false; try { has() && root.PokiSDK.gameplayStop(); } catch (e) {} },
    async commercialBreak() {
      Poki.gameplayStop();
      if (!has()) return;
      try { await root.PokiSDK.commercialBreak(() => root.SFX && root.SFX.setAdMuted(true)); } catch (e) {}
      root.SFX && root.SFX.setAdMuted(false);
    },
    async rewardedBreak() {
      Poki.gameplayStop();
      if (!has()) return true; // lokaal: beloning direct geven
      let ok = false;
      try { ok = await root.PokiSDK.rewardedBreak({ size: 'small', onStart: () => root.SFX && root.SFX.setAdMuted(true) }); } catch (e) { ok = false; }
      root.SFX && root.SFX.setAdMuted(false);
      return ok;
    },
  };
  root.Poki = Poki;
})(window);
