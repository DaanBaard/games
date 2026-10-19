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
