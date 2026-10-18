/* PLONK! – 50 levels in 10 werelden (v1.4: wereld 6-10 met marshmallow, bumper, portaal, bellenpomp en kanon). Opbouw: elk nieuw onderdeel eerst los en ruim, daarna combineren.
   items: vaste objecten · inventory: onderdelen voor de speler · solution: geverifieerde oplossing (ook voor hints)
   Controle: node tools/design.js  ('ruimte' = aantal winnende posities, hoger = makkelijker) */
(function (root) {
  const WORLDS = [
    { id: 1, name: 'De Speelkamer', theme: 'playroom' },
    { id: 2, name: 'De Keuken', theme: 'kitchen' },
    { id: 3, name: 'De Tuin', theme: 'garden' },
    { id: 4, name: 'Het Lab', theme: 'lab' },
    { id: 5, name: 'De Ruimte', theme: 'space' },
    { id: 6, name: 'De Snoepfabriek', theme: 'candy' },
    { id: 7, name: 'De Flipperkast', theme: 'pinball' },
    { id: 8, name: 'Het Spookslot', theme: 'castle' },
    { id: 9, name: 'De Diepzee', theme: 'deepsea' },
    { id: 10, name: 'De Kermis', theme: 'fair' },
  ];
  const P = (x, y) => [{ type: 'shelf', x, y: y + 72, w: 200 }, { type: 'bobo', x, y }]; // Bobo op een sokkel
  const R = (x, y) => [{ type: 'shelf', x: x + 30, y: y + 130, w: 24, h: 150 }, { type: 'bobo', x, y }]; // Bobo op een paal (naast een bellenstroom)

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

    // ---------- Wereld 6: De Snoepfabriek (marshmallow) ----------
    { id: 26, world: 6, name: 'Zachte landing', tip: 'Nieuw: de marshmallow! Alles wat hem raakt, verliest bijna al zijn vaart.', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'bouncer', x: 200, y: 380, a: 30 }, ...P(640, 518)], inventory: { sponge: 1 }, solution: [{ type: 'sponge', x: 640, y: 200, a: 0 }], par: 1 },
    { id: 27, world: 6, name: 'Pingpong', tip: 'De knikker kaatst heen en weer. Vang hem op het goede moment op.', items: [{ type: 'marble', x: 140, y: 290 }, { type: 'bouncer', x: 140, y: 380, a: 35 }, { type: 'bouncer', x: 820, y: 580, a: -30 }, ...P(520, 518)], inventory: { sponge: 1 }, solution: [{ type: 'sponge', x: 400, y: 440, a: 0 }], par: 1 },
    { id: 28, world: 6, name: 'Onder het dak', tip: 'Bobo zit onder een dak. Laat de knikker eerst terugvallen op de trampoline.', items: [{ type: 'marble', x: 1080, y: 100 }, { type: 'bouncer', x: 1080, y: 420, a: -20 }, { type: 'shelf', x: 640, y: 200, w: 500, h: 22 }, ...P(330, 300)], inventory: { sponge: 1 }, solution: [{ type: 'sponge', x: 1120, y: 200, a: -30 }], par: 1 },
    { id: 29, world: 6, name: 'Snoepband', tip: 'De band brengt de knikker naar de trampoline. Daarna gaat hij veel te hard…', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'bouncer', x: 600, y: 560, a: 25 }, ...P(1000, 518)], inventory: { conveyor: 1, sponge: 1 }, solution: [{ type: 'conveyor', x: 280, y: 300 }, { type: 'sponge', x: 960, y: 400, a: 30 }], par: 2 },
    { id: 30, world: 6, name: 'Snoepmachine', tip: 'Over de muur en zacht landen: trampoline en marshmallow werken samen.', items: [{ type: 'marble', x: 160, y: 100 }, { type: 'shelf', x: 640, y: 390, w: 30, h: 420 }, ...P(780, 518)], inventory: { bouncer: 1, sponge: 1, plank: 1 }, solution: [{ type: 'bouncer', x: 160, y: 240, a: 30 }, { type: 'sponge', x: 760, y: 160, a: 15 }], par: 2 },

    // ---------- Wereld 7: De Flipperkast (bumper) ----------
    { id: 31, world: 7, name: 'Bumper', tip: 'Nieuw: de bumper kaatst alles hard weg, recht van zijn midden af. Zet hem net naast de vallijn.', items: [{ type: 'marble', x: 300, y: 100 }, ...P(800, 518)], inventory: { bumper: 1 }, solution: [{ type: 'bumper', x: 280, y: 400 }], par: 1 },
    { id: 32, world: 7, name: 'Hoge muur', tip: 'Hoe verder de bumper naast de vallijn staat, hoe platter de knikker wegschiet.', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 560, y: 460, w: 30, h: 280 }, ...P(840, 518)], inventory: { bumper: 1 }, solution: [{ type: 'bumper', x: 180, y: 300 }], par: 1 },
    { id: 33, world: 7, name: 'Flipperveld', tip: 'Drie bumpers in het veld. Eén plank bepaalt waar de knikker heen stuitert.', items: [{ type: 'marble', x: 640, y: 90 }, { type: 'bumper', x: 640, y: 300 }, { type: 'bumper', x: 420, y: 420 }, { type: 'bumper', x: 860, y: 420 }, ...P(1120, 300)], inventory: { plank: 1, bumper: 1 }, solution: [{ type: 'plank', x: 480, y: 160, a: -15 }], par: 1 },
    { id: 34, world: 7, name: 'Onderdoor', tip: 'Schiet de knikker onder de muur door en laat hem dan omhoog stuiteren.', items: [{ type: 'marble', x: 160, y: 100 }, { type: 'shelf', x: 640, y: 210, w: 30, h: 300 }, ...P(1060, 250)], inventory: { bumper: 1, bouncer: 1 }, solution: [{ type: 'bumper', x: 110, y: 400 }, { type: 'bouncer', x: 680, y: 520, a: 0 }], par: 2 },
    { id: 35, world: 7, name: 'Tilt!', tip: 'Over de muur, zacht neer, en dan met de band onder het dak door.', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 600, y: 440, w: 30, h: 320 }, { type: 'shelf', x: 1100, y: 400, w: 240, h: 22 }, ...P(1100, 518)], inventory: { bumper: 1, sponge: 1, conveyor: 1 }, solution: [{ type: 'bumper', x: 170, y: 300 }, { type: 'sponge', x: 760, y: 340, a: -15 }, { type: 'conveyor', x: 800, y: 440 }], par: 3 },

    // ---------- Wereld 8: Het Spookslot (portaal, knop + poort) ----------
    { id: 36, world: 8, name: 'Spookdeur', tip: 'Nieuw: het portaal! Wat erin valt, komt bij de oranje uitgang weer tevoorschijn.', items: [{ type: 'marble', x: 240, y: 100 }, { type: 'shelf', x: 800, y: 380, w: 30, h: 440 }, { type: 'portalOut', x: 1040, y: 180 }, ...P(1040, 518)], inventory: { portal: 1 }, solution: [{ type: 'portal', x: 240, y: 360 }], par: 1 },
    { id: 37, world: 8, name: 'Andere kant', tip: 'De knikker komt met dezelfde vaart uit het portaal. Vang hem op met een plank.', items: [{ type: 'marble', x: 1040, y: 100 }, { type: 'portalOut', x: 160, y: 140 }, { type: 'shelf', x: 640, y: 300, w: 30, h: 480 }, ...P(460, 518)], inventory: { portal: 1, plank: 1 }, solution: [{ type: 'portal', x: 1040, y: 320 }, { type: 'plank', x: 120, y: 320, a: 30 }], par: 2 },
    { id: 38, world: 8, name: 'Spiegelzaal', tip: 'Vang de knikker in de vlucht. Hoe harder hij gaat, hoe verder hij uit de uitgang vliegt.', items: [{ type: 'marble', x: 160, y: 200 }, { type: 'conveyor', x: 240, y: 250 }, { type: 'portalOut', x: 60, y: 140 }, ...P(250, 518)], inventory: { portal: 1 }, solution: [{ type: 'portal', x: 500, y: 400 }], par: 1 },
    { id: 39, world: 8, name: 'Spookwind', tip: 'Hoe hoger het portaal, hoe langzamer de knikker eruit komt. Dan heeft de wind meer tijd.', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'portalOut', x: 860, y: 140 }, { type: 'shelf', x: 640, y: 380, w: 30, h: 440 }, ...P(1120, 518)], inventory: { portal: 1, fan: 1 }, solution: [{ type: 'portal', x: 200, y: 170 }, { type: 'fan', x: 760, y: 200 }], par: 2 },
    { id: 40, world: 8, name: 'De poort', tip: 'De poort gaat open als iets op de knop drukt. Stuur de zware bal er via het portaal heen.', items: [{ type: 'marble', x: 90, y: 150 }, { type: 'shelf', x: 520, y: 320, w: 920, a: 17 }, { type: 'heavy', x: 760, y: 100 }, { type: 'gate', x: 990, y: 440, w: 24, h: 280 }, { type: 'shelf', x: 300, y: 600, w: 160 }, { type: 'button', x: 300, y: 580 }, { type: 'portalOut', x: 300, y: 470 }, ...P(1110, 518)], inventory: { portal: 1 }, solution: [{ type: 'portal', x: 760, y: 240 }], par: 1 },

    // ---------- Wereld 9: De Diepzee (bellenpomp, zwaartekracht 70%) ----------
    { id: 41, world: 9, name: 'Bellenlift', tip: 'Nieuw: de bellenpomp! Alles boven de pomp stijgt rustig op.', gravity: 0.7, items: [{ type: 'marble', x: 100, y: 380 }, { type: 'shelf', x: 240, y: 460, w: 360, a: 12 }, ...R(520, 240)], inventory: { pump: 1 }, solution: [{ type: 'pump', x: 420, y: 560 }], par: 1 },
    { id: 42, world: 9, name: 'Bubbelwind', tip: 'Breng de knikker met de bellen omhoog naar de ventilator.', gravity: 0.7, items: [{ type: 'marble', x: 1096, y: 290 }, { type: 'shelf', x: 1100, y: 330, w: 60, h: 16, a: 25 }, { type: 'fan', x: 1210, y: 120, flip: true }, { type: 'shelf', x: 640, y: 400, w: 30, h: 400 }, ...P(170, 518)], inventory: { pump: 1 }, solution: [{ type: 'pump', x: 1120, y: 500 }], par: 1 },
    { id: 43, world: 9, name: 'Lift en wind', tip: 'Eerst omhoog met de bellen, dan blaast de ventilator hem over de muur.', gravity: 0.7, items: [{ type: 'marble', x: 200, y: 400 }, { type: 'shelf', x: 230, y: 470, w: 200, a: 20 }, { type: 'shelf', x: 760, y: 420, w: 30, h: 360 }, ...P(1040, 518)], inventory: { pump: 1, fan: 1 }, solution: [{ type: 'pump', x: 380, y: 580 }, { type: 'fan', x: 200, y: 140 }], par: 2 },
    { id: 44, world: 9, name: 'Twee liften', tip: 'De band bovenin neemt de knikker mee. Daarna heb je nog een lift nodig.', gravity: 0.7, items: [{ type: 'marble', x: 200, y: 400 }, { type: 'shelf', x: 230, y: 470, w: 200, a: 20 }, { type: 'conveyor', x: 480, y: 180 }, { type: 'shelf', x: 620, y: 520, w: 30, h: 160 }, ...R(800, 200)], inventory: { pump: 2 }, solution: [{ type: 'pump', x: 380, y: 580 }, { type: 'pump', x: 720, y: 540 }], par: 2 },
    { id: 45, world: 9, name: 'Diepzeemachine', tip: 'Het portaal brengt de knikker naar de trog. Hoe komt hij daar weer uit?', gravity: 0.7, items: [{ type: 'marble', x: 150, y: 100 }, { type: 'portalOut', x: 840, y: 420 }, { type: 'shelf', x: 840, y: 600, w: 240, h: 22 }, { type: 'shelf', x: 710, y: 520, w: 22, h: 140 }, { type: 'shelf', x: 970, y: 520, w: 22, h: 140 }, { type: 'shelf', x: 480, y: 300, w: 22, h: 480 }, ...R(920, 170)], inventory: { portal: 1, pump: 1, bumper: 1 }, solution: [{ type: 'portal', x: 150, y: 300 }, { type: 'pump', x: 860, y: 520 }], par: 2 },

    // ---------- Wereld 10: De Kermis (kanon) ----------
    { id: 46, world: 10, name: 'Kanonskogel', tip: 'Nieuw: het kanon! Het vangt de knikker en schiet hem in de richting van de loop.', items: [{ type: 'marble', x: 200, y: 100 }, ...P(1000, 518)], inventory: { cannon: 1 }, solution: [{ type: 'cannon', x: 200, y: 280, a: 0 }], par: 1 },
    { id: 47, world: 10, name: 'Over de muur', tip: 'Draai het kanon om met de blauwe knop en richt hoog.', items: [{ type: 'marble', x: 1080, y: 100 }, { type: 'shelf', x: 640, y: 360, w: 30, h: 480 }, ...P(260, 518)], inventory: { cannon: 1 }, solution: [{ type: 'cannon', x: 1080, y: 420, a: 60, flip: true }], par: 1 },
    { id: 48, world: 10, name: 'Knop en hek', tip: 'Het hek gaat open als de knikker over de knop rolt.', items: [{ type: 'marble', x: 200, y: 100 }, { type: 'shelf', x: 700, y: 300, w: 360, a: 10 }, { type: 'button', x: 620, y: 271, a: 10 }, { type: 'shelf', x: 930, y: 420, w: 160, a: 14 }, { type: 'gate', x: 1000, y: 470, w: 24, h: 200 }, ...P(1120, 518)], inventory: { cannon: 1 }, solution: [{ type: 'cannon', x: 200, y: 300, a: -60 }], par: 1 },
    { id: 49, world: 10, name: 'Dubbel kanon', tip: 'Eén kanon schiet over het dak, het andere terug naar Bobo.', items: [{ type: 'marble', x: 160, y: 100 }, { type: 'shelf', x: 420, y: 410, w: 300, h: 22 }, { type: 'shelf', x: 262, y: 500, w: 22, h: 160 }, ...P(420, 518)], inventory: { cannon: 2 }, solution: [{ type: 'cannon', x: 160, y: 240, a: -30 }, { type: 'cannon', x: 960, y: 180, a: -30, flip: true }], par: 2 },
    { id: 50, world: 10, name: 'Kermisfinale', tip: 'Het tentdak zit in de weg. Twee kanonnen, één knop, en dan naar Bobo!', items: [{ type: 'marble', x: 140, y: 100 }, { type: 'shelf', x: 600, y: 150, w: 600, h: 22 }, { type: 'shelf', x: 1000, y: 260, w: 320, a: -16 }, { type: 'button', x: 1060, y: 232, a: -16 }, { type: 'shelf', x: 780, y: 470, w: 400, a: 16 }, { type: 'gate', x: 990, y: 500, w: 24, h: 180 }, { type: 'shelf', x: 1110, y: 400, w: 240, h: 22 }, ...P(1110, 518)], inventory: { cannon: 2, sponge: 1, bumper: 1 }, solution: [{ type: 'cannon', x: 140, y: 420, a: -15 }, { type: 'cannon', x: 700, y: 380, a: -60 }], par: 2 },
  ];
  LEVELS.forEach((l, i) => { l.id = i + 1; }); // doorlopende nummering
  // v1.2: levels waar spelers in de Poki-data vaak vastliepen (≥ 3 mislukte pogingen per oplossing, of weinig ruimte):
  // daar komt de gratis tip al na 2 mislukte pogingen in plaats van 3
  const HARD = ['Domino-effect', 'Dominorij', 'Tuinslang', 'Wippen', 'Wipwap', 'Kettingreactie', 'Sterrensprong', 'Meteoor',
    'Onder het dak', 'Spiegelzaal', 'Spookwind', 'De poort', 'Lift en wind', 'Diepzeemachine', 'Over de muur', 'Knop en hek', 'Kermisfinale']; // v1.4: krappe nieuwe levels
  LEVELS.forEach(l => { if (HARD.includes(l.name)) l.hard = true; });
  root.PLONK_WORLDS = WORLDS;
  root.PLONK_LEVELS = LEVELS;
  if (typeof module !== 'undefined') { module.exports = LEVELS; module.exports.WORLDS = WORLDS; }
})(typeof window !== 'undefined' ? window : globalThis);
