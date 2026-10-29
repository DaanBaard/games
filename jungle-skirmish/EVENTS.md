# Jungle Skirmish — Poki game events (v1.5)

Dezelfde opzet als **PLONK!** en **Prismatic**, zodat de exports op dezelfde manier te lezen zijn.
Alle events lopen via `POKI.measure(category, what, action)` in `index.html`, dat `PokiSDK.measure()` aanroept
([Poki-documentatie](https://sdk.poki.com/game-events)). Waarden worden opgeschoond: `/` en `^` worden `-`, maximaal 60 tekens.
Zonder SDK, of met `?debug=1`, verschijnen ze in de console. Alle verstuurde events staan ook in `POKI.events`.

De Poki SDK wordt sinds v1.5 echt geladen (async, in de `<head>`). Op de eigen gamesite (github.io) en met `?test=1` niet:
daar meldt de SDK "unauthorized hosting".

Missie-id's: `a1` (tutorial) t/m `a8` voor de Apenstam, `k1` t/m `k4` voor de Insectenkolonie. Vrij gevecht heet `skirmish-<makkelijk|normaal|moeilijk>`.

## 1. Funnel per poging
Eén `start` per **poging**, afgesloten met `complete` of `fail`. Elke `start` zonder `complete`/`fail` is een speler die de tab
midden in een gevecht dichtdeed: dat is het belangrijkste afhaakgetal.

| Event | Wanneer |
|---|---|
| `level / <id> / start` | Missie of vrij gevecht begint (ook opnieuw beginnen, en een opgeslagen spel laden) |
| `level / <id> / complete` | Gewonnen |
| `level / <id> / fail` | Verloren (na de revive-keuze), of de speler stopt halverwege (zie `quit`) |
| `quit / <id> / menu · restart · load` | Halverwege gestopt: naar het hoofdmenu, opnieuw begonnen of een save geladen |
| `mtime / <id>-complete · <id>-fail · <id>-quit / 0-1min · 1-3min · 3-5min · 5-10min · 10-20min · 20min+` | Hoe lang de poging duurde (speltijd) |
| `stars / <id> / 1 · 2 · 3` | Sterren bij winst |
| `playtime / 30s · 60s · 120s · 180s · 300s · 600s / reach` | Speeltijd in gevechten (al sinds v1.4, één keer per sessie) |

## 2. Tutorial (missie a1)
`tutorial / <stap> / start · complete · skip`, met de stappen `move`, `build`, `train`, `defend`, `attack`.
`skip` betekent dat de stap automatisch doorging (tijd voorbij, of de eerste aanval kwam al). `button / tut-attack / interact`: de aanvalsknop in de laatste stap.

## 3. Sessie en speeltijd
| Event | Betekenis |
|---|---|
| `session / first-input / visible` | Game geladen |
| `session / first-input / interact` | Eerste klik, tik of toets. Vanaf hier telt de speeltijd |
| `session / played / 1min · 2min · 3min · 5min · 8min · 12min · 20min · 30min` | Tijd sinds de eerste input |
| `where / 1min · 3min · 5min · 12min / <plek>` | Waar de speler op dat moment is (zie hieronder) |
| `session / new / visit` | Eerste bezoek |
| `session / return / sameday · day1 · day2-3 · day4-7 · day8plus` | Terugkerende speler, met het aantal dagen sinds het vorige bezoek |
| `device / touch · mouse / detect` | Invoerapparaat |

Plekken bij `where`: `menu`, `menu-missions`, `menu-skirmish`, `<id>` (aan het spelen), `a1-<tutorialstap>`, `brief-<id>`, `pause-<id>`,
`revive-<id>`, `end-<id>` (missie) of dezelfde met `skirmish` voor vrij gevecht.

## 4. Funnel per versie
`version / <versie> / <mijlpaal>`, bijvoorbeeld `version / 15 / 3min`. Elke mijlpaal één keer per sessie.
Mijlpalen: `load`, `first-input`, `return`, `return-nextday`, `1min`, `3min`, `5min`, `12min`, `20min`, en `a1` … `k4` (missie gewonnen).
Verhoog `GAME_VERSION` in `index.html` bij elke nieuwe versie.

## 5. Interacties (visible → interact)
Poki's interactie-export toont alleen events met een `visible` én een `interact`.

| Event | Zichtbaar · interactie |
|---|---|
| `button / play` | Grote Speel-knop in het hoofdmenu · getikt |
| `menu / missions · skirmish · continue` | Knoppen in het hoofdmenu (continue alleen als er een save is) · getikt |
| `menu / mission-tile` | Missie-overzicht geopend · een missie aangetikt |
| `button / skirmish-start` | Vrij-gevechtscherm geopend · Start gevecht |
| `brief / <id>` | Missiebriefing in beeld · "Aan de slag!" (verschil = afhakers bij de briefing) |
| `pause / open` | Eerste gevecht begonnen · Menu-knop in het spel |
| `end / next · retry · menu` | Eindscherm in beeld (per keer) · gekozen; `end / autonext / interact` = de volgende missie startte vanzelf |
| `rewarded / revive` | Revive aangeboden · advertentie gekozen; daarna `reward`/`noreward` of `decline` (ook als de tijd op is) |
| `rewarded / bonus` | Bonusknop (+300) klaar · getikt; daarna `reward`/`noreward` |

## 6. Overige events
| Event | Betekenis |
|---|---|
| `missions / <id> / pick · locked` | Missie gekozen in het overzicht, of een dichte missie aangetikt |
| `menu / back / missions · skirmish` | Terug uit het missie-overzicht of het vrij-gevechtscherm |
| `skirmish / faction · difficulty / <keuze>` | Stam of tegenstander gekozen |
| `skirmish / apen · kevers / <moeilijkheid>` | Gekozen combinatie bij Start gevecht |
| `pause / resume · save · load · restart · quit / interact` | Knop in het pauzemenu |
| `settings / music · sfx · voice / on · off` | Geluid aan- of uitgezet |
| `settings / language / nl · en` | Taal gewisseld |
| `perf / quality1 · quality2 · quality3 / reach` | Game schakelde naar lagere grafische kwaliteit (traag apparaat) |

Advertenties zelf (`commercialBreak`, `rewardedBreak`) meet Poki.

## Handige vragen voor de export
- **Waar haken spelers af?** Vergelijk per missie `start` met `complete` + `fail`. Het verschil is tab dicht midden in een gevecht. `where/<k>min` laat zien waar ze zitten.
- **Haken ze af vóór het spelen?** `session/first-input/visible` → `interact` → `button/play/interact` → `level/a1/start`.
- **Waar loopt de tutorial vast?** `tutorial/<stap>/start` tegen `complete` en `skip`.
- **Welke missie is te moeilijk?** Veel `fail` en `quit` ten opzichte van `complete`; kijk naar `mtime` voor hoe lang ze het volhouden.
- **Lezen ze de briefing?** `brief/<id>/visible` tegen `interact`.
- **Is de nieuwe versie beter?** Vergelijk `version/15/*` met de volgende versie.
