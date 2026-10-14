/* PLONK! – 25 levels in 5 werelden. Opbouw: elk nieuw onderdeel eerst los en ruim, daarna combineren.
   items: vaste objecten · inventory: onderdelen voor de speler · solution: geverifieerde oplossing (ook voor hints)
   Controle: node tools/design.js  ('ruimte' = aantal winnende posities, hoger = makkelijker) */
(function (root) {
  const WORLDS = [
    { id: 1, name: 'De Speelkamer', theme: 'playroom' },
    { id: 2, name: 'De Keuken', theme: 'kitchen' },
    { id: 3, name: 'De Tuin', theme: 'garden' },
    { id: 4, name: 'Het Lab', theme: 'lab' },
    { id: 5, name: 'De Ruimte', theme: 'space' },
  ];
  const P = (x, y) => [{ type: 'shelf', x, y: y + 72, w: 200 }, { type: 'bobo', x, y }]; // Bobo op een sokkel

  const LEVELS = [
    // ---------- Wereld 1: De Speelkamer ----------
    { id: 1, world: 1, name: 'Eerste plonk', tutorial: true, tip: 'Sleep de plank naar het oplichtende silhouet en druk op Start.',
      items: [{ type: 'shelf', x: 200, y: 190, w: 180, a: 12 }, { type: 'marble', x: 150, y: 146 }, ...P(520, 518)],
      inventory: { plank: 1 }, solution: [{ type: 'plank', x: 300, y: 320, a: 15 }], par: 1 },
    { id: 2, world: 1, name: 'Glijbaan', tip: 'De knikker valt recht naar beneden. Vang hem op met een schuine plank.',
      items: [{ type: 'marble', x: 220, y: 100 }, ...P(560, 518)],
      inventory: { plank: 1 }, solution: [{ type: 'plank', x: 260, y: 300, a: 30 }], par: 1 },
    { id: 3, world: 1, name: 'Andersom', tip: 'Bobo zit links. Laat de linkerkant van de plank zakken: tik op de knop met de pijl links, of sleep het bolletje.',
      items: [{ type: 'marble', x: 1060, y: 100 }, ...P(720, 518)],
      inventory: { plank: 1 }, solution: [{ type: 'plank', x: 1020, y: 300, a: -30 }], par: 1 },
    { id: 4, world: 1, name: 'Zigzag', tip: 'Eén plank is te kort. Laat de knikker van plank naar plank rollen.',
      items: [{ type: 'marble', x: 200, y: 100 }, ...P(760, 518)],
      inventory: { plank: 2 }, solution: [{ type: 'plank', x: 120, y: 280, a: 30 }, { type: 'plank', x: 440, y: 480, a: 15 }], par: 2 },
    { id: 5, world: 1, name: 'Boing!', tip: 'Nieuw: de trampoline! Hij kaatst de knikker weg, haaks op het oppervlak.',
      items: [{ type: 'marble', x: 300, y: 100 }, ...P(860, 300)],
      inventory: { bouncer: 1 }, solution: [{ type: 'bouncer', x: 240, y: 300, a: 30 }], par: 1 },

    // ---------- Wereld 2: De Keuken ----------
    { id: 6, world: 2, name: 'Lopende band', tip: 'Nieuw: de lopende band neemt alles mee. Hij hoeft niet eens schuin.',
      items: [{ type: 'marble', x: 300, y: 100 }, ...P(720, 518)],
      inventory: { conveyor: 1 }, solution: [{ type: 'conveyor', x: 380, y: 420 }], par: 1 },
    { id: 7, world: 2, name: 'Terug naar links', tip: 'Draai de band om. Kijk naar de pijltjes.',
      items: [{ type: 'marble', x: 980, y: 100 }, { type: 'shelf', x: 640, y: 250, w: 260, h: 22 }, ...P(480, 518)],
      inventory: { conveyor: 1, plank: 1 }, solution: [{ type: 'conveyor', x: 900, y: 200, flip: true }], par: 1 },
    { id: 8, world: 2, name: 'Domino-effect', tip: 'Nieuw: de domino. De bowlingbal kan het opstapje niet over, maar een domino kan wel omvallen.',
      items: [{ type: 'shelf', x: 190, y: 240, w: 300, a: 26 }, { type: 'heavy', x: 90, y: 144 }, { type: 'shelf', x: 610, y: 470, w: 660 },
        { type: 'shelf', x: 895, y: 439, w: 90, h: 40 }, { type: 'marble', x: 890, y: 399 }, { type: 'shelf', x: 1030, y: 600, w: 180 }, { type: 'bobo', x: 1030, y: 530 }],
      inventory: { domino: 2 }, solution: [{ type: 'domino', x: 740, y: 399, a: 0 }], par: 1 },
    { id: 9, world: 2, name: 'Dominorij', tip: 'Het opstapje is hoger. Eén domino is niet genoeg: zet er twee achter elkaar.',
      items: [{ type: 'shelf', x: 190, y: 240, w: 300, a: 26 }, { type: 'heavy', x: 90, y: 144 }, { type: 'shelf', x: 610, y: 470, w: 660 },
        { type: 'shelf', x: 895, y: 429, w: 60, h: 60 }, { type: 'marble', x: 895, y: 379 }, { type: 'shelf', x: 1030, y: 600, w: 180 }, { type: 'bobo', x: 1030, y: 530 }],
      inventory: { domino: 3 }, solution: [{ type: 'domino', x: 680, y: 399, a: 0 }, { type: 'domino', x: 780, y: 399, a: 0 }], par: 2 }, // v1.2: smallere sokkel (data: 49% haalde dit level)
    { id: 10, world: 2, name: 'Keukenrol', tip: 'Breng de knikker over de muur. Tip: minder onderdelen = meer sterren.',
      items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 700, y: 450, w: 30, h: 300 }, ...P(1000, 330)],
      inventory: { conveyor: 1, bouncer: 1 }, solution: [{ type: 'bouncer', x: 140, y: 180, a: 30 }], par: 1 },

    // ---------- Wereld 3: De Tuin ----------
    { id: 12, world: 3, name: 'Briesje', tip: 'Nieuw: de ventilator blaast vallende dingen opzij.',
      items: [{ type: 'marble', x: 300, y: 100 }, ...P(780, 518)],
      inventory: { fan: 1 }, solution: [{ type: 'fan', x: 180, y: 160 }], par: 1 },
    { id: 13, world: 3, name: 'Tegenwind', tip: 'Spiegel de ventilator met de blauwe knop om de andere kant op te blazen.',
      items: [{ type: 'marble', x: 980, y: 100 }, { type: 'shelf', x: 980, y: 590, w: 200 }, ...P(500, 518)],
      inventory: { fan: 1, plank: 1 }, solution: [{ type: 'fan', x: 1040, y: 160, flip: true }], par: 1 },
    { id: 14, world: 3, name: 'Tuinslang', tip: 'Laat de knikker stuiteren en blaas hem dan over de muur.',
      items: [{ type: 'marble', x: 300, y: 100 }, { type: 'shelf', x: 300, y: 590, w: 260 }, ...P(1060, 448), { type: 'shelf', x: 700, y: 450, w: 30, h: 300 }],
      inventory: { fan: 1, bouncer: 1, plank: 1 }, solution: [{ type: 'bouncer', x: 300, y: 540, a: 0 }, { type: 'fan', x: 220, y: 380, flip: false }], par: 2 },
    { id: 11, world: 3, name: 'Wippen', tip: 'Nieuw: de wip! Zet het midden precies tussen de knikker en de zware bal.',
      items: [{ type: 'marble', x: 380, y: 380 }, { type: 'heavy', x: 520, y: 90 }, { type: 'shelf', x: 620, y: 500, w: 28, h: 200 },
        { type: 'shelf', x: 810, y: 470, w: 360, a: 12 }, ...P(1060, 530)],
      inventory: { seesaw: 1 }, solution: [{ type: 'seesaw', x: 460, y: 540, a: 0 }], par: 1 },
    { id: 15, world: 3, name: 'Wipwap', tip: 'Precisiewerk: de zware bal en de knikker liggen ver uit elkaar.',
      items: [{ type: 'heavy', x: 330, y: 100 }, { type: 'marble', x: 570, y: 300 }, { type: 'shelf', x: 740, y: 480, w: 28, h: 240 },
        { type: 'shelf', x: 950, y: 470, w: 420, a: 12 }, { type: 'shelf', x: 1170, y: 600, w: 180 }, { type: 'bobo', x: 1190, y: 530 }],
      inventory: { seesaw: 1, plank: 1 }, solution: [{ type: 'seesaw', x: 440, y: 440, a: 0 }], par: 1 },

    // ---------- Wereld 4: Het Lab ----------
    { id: 16, world: 4, name: 'Proefopstelling', tip: 'Plank en band werken samen. Bobo zit ver weg.',
      items: [{ type: 'marble', x: 200, y: 100 }, ...P(700, 518)],
      inventory: { plank: 1, conveyor: 1 }, solution: [{ type: 'plank', x: 120, y: 280, a: 30 }, { type: 'conveyor', x: 400, y: 460 }], par: 2 },
    { id: 17, world: 4, name: 'Windtunnel', tip: 'De band geeft vaart, de ventilator laat de knikker verder vliegen.',
      items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 640, y: 560, w: 500, h: 22 }, ...P(1120, 518)],
      inventory: { conveyor: 1, fan: 1 }, solution: [{ type: 'conveyor', x: 240, y: 300 }, { type: 'fan', x: 60, y: 300 }], par: 2 },
    { id: 18, world: 4, name: 'Kettingreactie', tip: 'Bal, domino, knikker, plank, Bobo. In die volgorde.',
      items: [{ type: 'shelf', x: 190, y: 240, w: 300, a: 26 }, { type: 'heavy', x: 90, y: 144 }, { type: 'shelf', x: 610, y: 470, w: 660 },
        { type: 'shelf', x: 895, y: 439, w: 90, h: 40 }, { type: 'marble', x: 890, y: 399 }, { type: 'shelf', x: 1180, y: 600, w: 160 }, { type: 'bobo', x: 1180, y: 530 }],
      inventory: { domino: 1, plank: 1 }, solution: [{ type: 'domino', x: 740, y: 399, a: 0 }, { type: 'plank', x: 980, y: 540, a: 15 }], par: 2 },
    { id: 19, world: 4, name: 'Dubbel boing', tip: 'Twee trampolines: de eerste stuurt opzij, de tweede omhoog.',
      items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 760, y: 420, w: 30, h: 360 }, ...P(1040, 260)],
      inventory: { bouncer: 2 }, solution: [{ type: 'bouncer', x: 200, y: 400, a: 30 }, { type: 'bouncer', x: 620, y: 400, a: 30 }], par: 2 },
    { id: 20, world: 4, name: 'Labyrint', tip: 'Zoek een weg door de planken heen.',
      items: [{ type: 'marble', x: 140, y: 100 }, { type: 'shelf', x: 420, y: 230, w: 300, a: -8 }, { type: 'shelf', x: 860, y: 330, w: 300, a: 8 },
        { type: 'shelf', x: 1010, y: 450, w: 30, h: 160 }, ...P(1150, 518)],
      inventory: { plank: 2, bouncer: 1 }, solution: [{ type: 'plank', x: 160, y: 260, a: 30 }, { type: 'bouncer', x: 400, y: 540, a: 0 }], par: 2 },

    // ---------- Wereld 5: De Ruimte (lage zwaartekracht) ----------
    { id: 21, world: 5, name: 'Gewichtloos', gravity: 0.5, tip: 'In de ruimte valt alles trager. Ook knikkers.',
      items: [{ type: 'marble', x: 220, y: 100 }, ...P(560, 518)],
      inventory: { plank: 1 }, solution: [{ type: 'plank', x: 260, y: 300, a: 30 }], par: 1 },
    { id: 22, world: 5, name: 'Sterrensprong', gravity: 0.5, tip: 'Met weinig zwaartekracht vliegt de knikker heel ver.',
      items: [{ type: 'marble', x: 220, y: 100 }, { type: 'shelf', x: 640, y: 470, w: 30, h: 260 }, ...P(1060, 220)],
      inventory: { bouncer: 1 }, solution: [{ type: 'bouncer', x: 160, y: 400, a: 30 }], par: 1 },
    { id: 23, world: 5, name: 'Zonnewind', gravity: 0.5, tip: 'Eén ventilator kan hier een hele overkant halen.',
      items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 640, y: 560, w: 600, h: 22 }, ...P(1100, 440)],
      inventory: { fan: 1, plank: 1 }, solution: [{ type: 'fan', x: 140, y: 160 }], par: 1 },
    { id: 24, world: 5, name: 'Meteoor', gravity: 0.5, tip: 'Laat de meteoor op de wip vallen en lanceer de knikker naar boven.',
      items: [{ type: 'marble', x: 340, y: 380 }, { type: 'heavy', x: 520, y: 90 }, { type: 'shelf', x: 620, y: 470, w: 28, h: 260 },
        { type: 'shelf', x: 810, y: 330, w: 360, a: 12 }, ...P(1060, 390)],
      inventory: { seesaw: 1, bouncer: 1 }, solution: [{ type: 'seesaw', x: 420, y: 520, a: 0 }], par: 1 },
    { id: 25, world: 5, name: 'Grote finale', gravity: 0.5, tip: 'Alles wat je geleerd hebt, in één machine.',
      items: [{ type: 'marble', x: 140, y: 100 }, { type: 'shelf', x: 640, y: 420, w: 30, h: 360 }, ...P(1100, 260)],
      inventory: { plank: 1, conveyor: 1, bouncer: 1, fan: 1 }, solution: [{ type: 'plank', x: 220, y: 260, a: 30 }, { type: 'bouncer', x: 400, y: 360, a: 15 }], par: 2 },
  ];
  LEVELS.forEach((l, i) => { l.id = i + 1; }); // doorlopende nummering
  // v1.2: levels waar spelers in de Poki-data vaak vastliepen (≥ 3 mislukte pogingen per oplossing, of weinig ruimte):
  // daar komt de gratis tip al na 2 mislukte pogingen in plaats van 3
  const HARD = ['Domino-effect', 'Dominorij', 'Tuinslang', 'Wippen', 'Wipwap', 'Kettingreactie', 'Sterrensprong', 'Meteoor'];
  LEVELS.forEach(l => { if (HARD.includes(l.name)) l.hard = true; });
  root.PLONK_WORLDS = WORLDS;
  root.PLONK_LEVELS = LEVELS;
  if (typeof module !== 'undefined') { module.exports = LEVELS; module.exports.WORLDS = WORLDS; }
})(typeof window !== 'undefined' ? window : globalThis);
