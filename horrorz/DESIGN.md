# Horrorz — ontwerpdocument v1.0

**Pitch:** een griezelig-schattige zaklamp-roguelite. Je bent Lumi, een kind met een veel te grote zaklamp, in een spookhuis waar het pikdonker is. In het donker zie je alleen oplichtende ogen naderen. Schijn met je lamp op een spook, het schrikt zich wit, krimpt en *plopt* in snoep. Kamer voor kamer, met een eindbaas na elke tien kamers.

Doelgroep: Poki-publiek (veel kinderen en tieners, desktop én mobiel). Daarom griezelig maar nooit eng-eng of bloederig: spoken worden bang van jóu.

Timing: Halloween staat voor de deur (31 oktober) — seizoensthema's doen het op webportals goed in die periode.

---

## 1. Wat het onderzoek zegt (en wat we ermee doen)

| Bevinding | Bron | Toepassing in Horrorz |
|---|---|---|
| Poki meet vooral **gemiddelde speeltijd** en **conversion to play**; 5+ min is goed, 7–10+ min is sterk. De Player Fit Test vraagt minimaal 3 min. | Poki/Defold best practices, Poki Player Fit docs | Eén run (10 kamers) duurt ~5–6 min; meta-progressie en "nog één keer" trekken de sessie richting 8–12 min. |
| **De eerste minuut is alles**: direct spelen, lage drempel, duidelijke doelen. | Poki/Defold best practices, Poki Playtesting | Eerste keer opstarten = meteen spelen (geen menu). Tutorial zit ín de eerste kamer, met 3 trage spookjes. Eerste level-up binnen ~15 s. |
| Technische eisen: 16:9, mobiel speelbaar, < 8 MB, geen externe requests/fonts, geen eigen ads/branding, speelbaar met adblocker, werkt in incognito. | Poki requirements | Eén HTML-bestand (~150 kB), alles procedureel getekend, geluid gesynthetiseerd, `localStorage` in try/catch, SDK met nep-stub als hij niet laadt. |
| Ads alleen op **natuurlijke pauzes**: `commercialBreak` vóór `gameplayStart`, `rewardedBreak` voor revive / dubbele beloning. Geluid en input uit tijdens ads. | Poki SDK-documentatie | Commercial break vóór elke nieuwe run. Rewarded: 1× revive per run, dubbel snoep na een run, extra reroll. |
| Geen 1-op-1 kloon, geen stijl die lijkt op bekende IP. | Poki quality guidelines | Eigen personages, eigen palet (inktblauw/paars/pompoen/mint), geen stofzuiger-mechaniek, geen bekende namen. |
| **Self-Determination Theory** (Ryan, Rigby & Przybylski 2006): plezier en terugkeren worden voorspeld door *competentie*, *autonomie* en *verbondenheid*; intuïtieve besturing draagt daaraan bij. | PENS-model | Competentie: strak, voorspelbaar besturen + dash met onkwetsbaarheid. Autonomie: kies 1 van 3 krachten, kies je deur (beloning zichtbaar), kostuums/lampkleur. Verbondenheid: spookboek, missies, vriendjes-kostuums. |
| **Flow / optimale uitdaging**: plezier volgt een omgekeerde U; uitdaging ≈ vaardigheid. Bijna-winnen motiveert meer dan zwaar verliezen. | Ma et al. 2017; Larche et al. 2021 (Candy Crush) | Moeilijkheid loopt geleidelijk op, met *dynamic difficulty* (±15%) op basis van geraakt worden. Game-over toont "nog 2 kamers tot de baas" + voortgangsbalk naar de volgende ontgrendeling. |
| **Reward prediction error** (Schultz): dopamine piekt bij onverwacht grote beloningen; variabele beloningen houden spanning hoog. | Schultz; Skinner variable ratio | Variabele drops (soms groot snoep), zeldzame **Gouden Glimmer** (jackpot), kaart-zeldzaamheden, kist met verrassing. *Wel* gekoppeld aan spelen, nooit aan geld. |
| **Juice**: hit-stop, schermschok, flitsen, deeltjes, zwevende tekst en coherent geluid maken een simpele mechaniek bevredigend. | Jonasson & Purho "Juice it or lose it"; impact-feel onderzoek | Pop = 40–90 ms hit-stop, lichtflits die de kamer even verlicht, deeltjes, snoepregen, stijgende toonhoogte bij combo's. |
| Vampire Survivors: simpele besturing, automatische aanval, kies upgrades, meta-progressie ("je begint nooit bij nul"), enorme lijst bijdoelen. | Analyse-artikelen VS | Lamp schijnt altijd (auto-aim op mobiel), upgrades per level, permanente winkel, trofeeën en spookboek. |
| "Serotonine-design": status en meesterschap — persoonlijke records, groei die je ziet. | Yu-kai Chou (Octalysis) | Persoonlijk record per hoofdstuk, kronen, eindeloze modus met beste kamer. |

### Bewust níet gedaan
Poki's publiek is jong en Poki keurt elke game handmatig. Daarom geen casino-trucs: geen lootboxen voor echt geld, geen nep-timers die druk zetten, een dagstreak die **niet** naar nul valt als je een dag mist, en ads die altijd optioneel zijn (behalve de normale break tussen runs). Dat is ook gewoon slim: dark patterns verlagen de kans op publicatie.

---

## 2. Kernloop (30 seconden)
Beweeg → lamp op spoken → spoken poppen in snoep + zieltjes → XP-balk vol → kies kracht → kamer leeg → kies deur → volgende kamer.

## 3. Runloop (5–6 minuten)
10 kamers per hoofdstuk. Kamer 5 = mini-baas, kamer 10 = hoofdbaas. Daarna: hoofdstuk gehaald, kroon, nieuw hoofdstuk open.

## 4. Metaloop (sessies)
- **Snoep** blijft bewaard → permanente upgrades (hartjes, lampkracht, bereik, snelheid, snoepbonus, magneet, rerolls).
- **Kostuums & lampkleuren** (autonomie / identiteit).
- **3 dagmissies** met snoepbeloning (half-af-taken trekken je terug: Zeigarnik).
- **Dagcadeau** 7-daagse kalender, dag 7 = kostuum. Missen = geen straf.
- **Trofeeën** (lange lijst bijdoelen).
- **Spookboek**: elk spooktype dat je ontmoet wordt ontgrendeld.
- **Nachtmerrie-modus** (eindeloos) na hoofdstuk 1, met persoonlijk record.

## 5. Inhoud v1.0
- 5 hoofdstukken: Fluisterhal, Zolder, Grafkelder, Klokkentoren, Maankas.
- 7 spooktypes + Gouden Glimmer, 2 mini-bazen-varianten, 5 eindbazen.
- 19 krachten in 3 zeldzaamheden.
- 8 kostuums, 6 lampkleuren, 7 permanente upgrades, 16 trofeeën.
- Talen: NL, EN, DE, FR, ES.

## 6. Poki SDK-momenten
| Moment | SDK |
|---|---|
| Laden klaar | `gameLoadingFinished()` |
| Run start / hervat | `commercialBreak()` → `gameplayStart()` |
| Pauze, game over, menu | `gameplayStop()` |
| Revive / dubbel snoep / extra reroll | `rewardedBreak()` |

## 7. Wat te meten in de Poki Playtest
1. % spelers dat de eerste kamer uitspeelt (onboarding).
2. Kamer waarop spelers de eerste run sterven (moeilijkheid kamer 3–5).
3. % dat na game-over op "Nog een keer" drukt.
4. Gemiddelde speeltijd (doel ≥ 7 min).

---

# v2.0 — variatie en realisme

Feedback op v1.0: te eenzijdig, te cartoonesk, te veel herhaling. Wat er veranderd is:

## Variatie in levels
| Laag | v1.0 | v2.0 |
|---|---|---|
| Kamertypes | 1 (golven) | 7: Spookerij, Zwerm, Ritueel (kaarsen aansteken), Volhouden (overleef tot de klok slaat), Glimmerjacht, Klopgeest (bezeten meubels), Altaar (kies een offer) |
| Wendingen | geen | 6: mist, flikkerende lamp, onweer, rusteloze doden, ijskoud (glad), pikdonker |
| Indelingen | 1 (willekeurig) | 8: verspreid, zuilenzaal, gangpaden, middenstuk, volgestouwd, arena, lange gang, kleine kamer — met wisselende kamermaten |
| Spawnpatronen | randen | 6: randen, omsingeling, deuren, uit meubels, uit de vloer, linie |
| Golfthema's | gemengd | gemengd, één soort, elite met escorte |
| Spooksoorten | 7 | 11 + Gouden Glimmer (nieuw: stofgeestjes, nepkaars, banshee, lichtvreter) |
| Bazen | 4–5 aanvallen | + jammerring, verduistering, schijnbeelden, en een woedefase op 50% |
| Kamernamen | geen | 30 (6 per hoofdstuk) |
| Muziek/geluid | 1 loop | eigen toonsoort en tempo per hoofdstuk + omgevingsgeluid (kraken, wind, druppels, tikken, krekels) |

**Anti-herhaling:** de deurkeuze toont kamertype, beloning en wending; hetzelfde kamertype, dezelfde indeling of dezelfde wending komt zelden twee keer achter elkaar; kamernamen herhalen pas als alle zes geweest zijn. De speler kiest dus zelf zijn route (autonomie) en weet wat er komt (verwachting → dopamine bij de beloning).

## Realisme
- **Belichting:** de zaklamp werpt echte schaduwen achter meubels; meubels blokkeren ook het licht voor de gameplay (spoken kunnen zich verstoppen). Volumetrische lichtbundel met mist en stofdeeltjes, kaarsen, kroonluchters, maanlicht door ramen, bliksem.
- **Texturen:** procedureel gegenereerd parket, zolderplanken, natuursteen, ijzeren platen, terracotta; behang met damastpatroon en lambrisering, baksteen, glaswanden met nachtlucht.
- **Spoken:** doorschijnende, rafelige gestaltes die naar onderen vervagen, holle oogkassen, gloeiende pupillen in het donker, bewegingsspoor; bij licht verbleken ze en gaan ze “schreeuwen”.
- **Lumi:** realistischere verhoudingen, regenjas met schaduw, metalen zaklamp.
- **Interface:** serif-typografie, donkere panelen met dunne gouden lijnen, tarotkaart-stijl voor krachten, iconen in duotoon. Filmkorrel en vignet.
- **Prestaties:** licht, mist en korrel draaien op lage resolutie; bij een trage telefoon schakelt de game automatisch naar lagere kwaliteit.

# v2.1 — 14 talen
Engels, Nederlands, Duits, Frans, Spaans, Portugees, Italiaans, Pools, Turks, Russisch, Indonesisch, Japans, Koreaans en Chinees (vereenvoudigd). De taal wordt automatisch gekozen via Poki (of de browsertaal) en is te wijzigen in Instellingen. Nieuwe talen staan als `src/lang/<code>.tsv` (sleutel⇥tekst); `build.py` bouwt ze in. Ontbrekende teksten vallen terug op Engels.

## v2.2 — Poki-thumbnails
- `?thumb=sq` rendert een vierkante thumbnailscène (deterministisch, seed 424242): Lumi schijnt op een grote bange laken-geest, twee kleinere geesten, snoep, titel bovenin.
- `poki/horrorz_thumb_1080.png`: statische 1080×1080, full-bleed, geen afgeronde hoeken, één focuspunt, hoog contrast, geen #83FFE7.
- `poki/horrorz_thumb_anim_1080.mp4`: 1080×1080, 60 fps, 5 s, H.264 zonder audio; begint op het statische beeld, 3 scènes (grote geest knalt → twee kleine geesten → nieuwe geesten verschijnen), naadloze loop.
- Specs: https://sdk.poki.com/thumbnail.html en https://sdk.poki.com/animated-thumbnails

## v2.3 — Poki game events (`PokiSDK.measure(category, what, action)`)
Zelfde aanpak als Sprout Squad; namen blijven stabiel tussen versies. Volgens https://sdk.poki.com/game-events: `start/complete/fail` = funnel, `visible/interact` = interactie, overige acties = % gameplays dat het bereikt. Advertenties meet Poki zelf.

| category | what | action | wanneer |
|---|---|---|---|
| run | ch1–ch5 / night | start, complete, fail, quit | run begint / hoofdstuk gehaald / flauwgevallen / via pauze naar home |
| level | ch1-r1 … ch5-r10 / night-r1 … night-r60 | start, complete, fail | elke kamer (funnel per kamer) |
| roomtype | waves, swarm, ritual, survive, hunt, poltergeist, shrine, mini, boss | start, complete, fail | welke kamertypes spelers laten afhaken |
| twist | fog, flicker, storm, haunt, cold, dark | start, complete, fail | idem voor twists |
| death | ch1… / night | r<kamer>-w<golf> of r<kamer>-boss/mini | precies waar spelers sneuvelen |
| tutorial | intro / move / first-pop | start, complete, fail | eerste run hoofdstuk 1 |
| runtime | ch1… / night | s60, s120, s180, s300, s420, s600, s900 | speelduur binnen één run |
| playtime | session | m1, m2, m3, m5, m7, m10, m15, m20, m30, m45, m60 | actieve speeltijd per sessie (doel ≥ 7 min) |
| milestone | run1–run10, clear-ch1… | reached | hoeveelste run, eerste keer hoofdstuk gehaald |
| levelup | level2–level25 | show | XP-niveau in een run |
| card / shrine | id van kaart/offer | picked | welke upgrades gekozen worden |
| door | card, chest, candy, heart, boss, shrine | picked | deurkeuze na een kamer |
| combo | x5, x10, x20, x35, x50 | reached | 1× per sessie |
| flawless | kamertype | reached | kamer zonder schade |
| perk | angel | used | |
| trophy | trophy-id | reached | |
| button | reward-revive, reward-double, reward-reroll | visible, interact | rewarded-knoppen |
| reward | revive, double, reroll | granted | rewarded ad afgekeken |
| button | reroll, pause, play-again, next-chapter, over-home, mute, unmute | interact | |
| menu | shop, wardrobe, missions, gift, trophies, book, settings | open | |
| shop | <upgrade>-<niveau> | bought | |
| skin / beam | id | bought, equipped | |
| mission | id / all-daily | claimed | |
| gift | day1–day7 | claimed | |
| player | new / returning | session | bij opstarten |
| lang | taalcode | session, selected | gedetecteerde / gekozen taal |

Testen: `?test=1` → `T.EV` bevat alle events van de sessie.

## v2.4 — de eerste minuut
Aanleiding: de events van v2.3 (568 gameplays) lieten zien dat 57% binnen 1 minuut afhaakt, 22% nooit beweegt, ~120 spelers midden in de tutorial vertrekken en 52 spelers kwijtraken tussen kamer 1 en 2.

- **Eerst belonen, dan uitleggen:** de tutorial-kamer begint met één spook dat recht vóór de lamp verschijnt (na ±1 s). Door de automatische richting popt het zonder dat de speler iets hoeft te doen.
- **Bewegingshint:** na de eerste pop (of na 5 s) een geanimeerde hint: een sleepbeweging op touchscreens, oplichtende WASD-toetsen op pc. Verdwijnt zodra de speler beweegt.
- **Kortere tutorial:** 2 golven (1 + 5 trage spoken, samen precies genoeg XP voor de eerste level-up) in plaats van 3 golven met 12 spoken. Golf 2 komt pas na de eerste pop. De dash-uitleg is verhuisd naar kamer 2.
- **Niet flauwvallen in de tutorial:** je houdt altijd minstens 1 hartje.
- **Lichtere eerste kamer:** duisternis 0,80 in plaats van 0,93, en de kamer licht op bij het opruimen.
- **Weg naar de deur:** na het opruimen van elke kamer loopt een pad van licht naar de dichtstbijzijnde deur. In de tutorial-kamer gaat de speler na 6 s vanzelf door die deur.
- **Fix:** een kamer kon als opgeruimd gelden op het moment dat de laatste golf verscheen, als er toevallig 0 spoken leefden.

Nieuwe events:

| category | what | action | wanneer |
|---|---|---|---|
| tutorial | move-after / first-pop-after | s0-3, s3-8, s8-20, s20+ | hoe snel na de start iemand beweegt / het eerste spook popt |
| tutorial | wave2 | reached | tweede tutorial-golf begonnen |
| tutorial | door | complete, auto | door een deur na de tutorial-kamer (zelf of automatisch) |

`tutorial / move` en `tutorial / first-pop` worden nu los van elkaar gemeten (eerder kon first-pop pas na move).

## v2.5 — afhaakpunten meten
Doel: per scherm en per moment in een kamer kunnen zien waar spelers stoppen.

| category | what | action | wanneer |
|---|---|---|---|
| leave | run, cards, pause, dying, home, over, ad, panel | `ch1-r4-w2`, `ch1-r5-mini`, `ch1-r3-clear`, `ch1-r6-shrine` of de schermnaam (`home`, `over`, `shop`…) | tabblad verborgen of gesloten: waar de speler op dat moment was (1× per keer verbergen; Poki kan een event bij sluiten soms missen) |
| screen | home, cards, pause, over, adwait, panel | visible | elk scherm dat in beeld komt |
| wave | ch1-r1 … / night-r… | w1, w2, w3, w4 | golf bereikt in een kamer (spookerij, zwerm, glimmerjacht, klopgeest) |
| ritual | ch1-r… | candle1 … candle5 | aantal aangestoken kaarsen in een ritueel |
| survive | ch1-r… | half | helft van de tijd overleefd |
| ad | before-run | start, complete | advertentie vóór een run: komt de speler terug? |
| player | first-input | s0-5, s5-15, s15-30, s30+ | hoe snel na het laden iemand voor het eerst iets aanraakt |
| button | play-ch1 … play-ch5, play-night, resume | interact | spelen vanaf het startscherm, verder na pauze |

Samen met `level`, `run`, `death` en `tutorial` geeft dit de hele funnel: laden → eerste input → tutorial → elke kamer en golf → kaartkeuze → deur → eindscherm → opnieuw of terug naar home → winkel.
