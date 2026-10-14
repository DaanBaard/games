# PLONK! — Poki game events (v0.9)

De opzet is dezelfde als in **Prismatic (v28)**, zodat de exports van beide games op dezelfde manier te lezen zijn.
Alle events lopen via `Poki.measure(category, what, action)` in `js/poki.js`, dat `PokiSDK.measure()` aanroept
([Poki-documentatie](https://sdk.poki.com/game-events)). Waarden worden opgeschoond zoals in Prismatic:
`/` en `^` worden `-`, en een waarde is maximaal 60 tekens. Zonder SDK, of met `?debug=1`, verschijnen ze in de console.
Alle verstuurde events staan ook in `Poki.events`.

## 1. Funnel per poging (zoals Prismatic)
Eén `start` per **poging**, afgesloten met `complete` of `fail`. Daardoor zie je per level niet alleen hoeveel spelers
het bereiken, maar ook hoeveel pogingen het kost.

| Event | Wanneer |
|---|---|
| `level / <1-25> / start` | Level geopend, of na een mislukte poging (de volgende poging begint) |
| `level / <n> / complete` | Bobo heeft de knikker |
| `level / <n> / fail` | De knikker mist, de speler drukt halverwege op Reset, slaat over, gaat naar het menu of kiest een ander level |
| `daily / puzzle / start · complete · fail` | Hetzelfde, maar dan voor de dagpuzzel |
| `daily / goal / reached · missed` | Dagpuzzel binnen of buiten de doeltijd opgelost |

## 2. Sessie en speeltijd
| Event | Betekenis |
|---|---|
| `session / first-input / visible` | Game geladen |
| `session / first-input / interact` | Eerste tik of toets. Vanaf hier telt de speeltijd |
| `session / played / 1min · 2min · 3min · 5min · 8min · 12min · 20min` | Speeltijd sinds de eerste input |
| `where / 1min · 3min · 5min / <plek>` | Waar de speler op dat moment is: `title`, `menu`, `wardrobe`, `daily` of `level<n>` |
| `session / new / visit` | Eerste bezoek |
| `session / return / sameday · day1 · day2-3 · day4-7 · day8plus` | Terugkerende speler, met het aantal dagen sinds het vorige bezoek |

## 3. Funnel per versie
`version / <versie><groep> / <mijlpaal>`, bijvoorbeeld `version / 9a / 3min`. Elke mijlpaal wordt één keer per sessie verstuurd.
Mijlpalen: `load`, `first-input`, `return`, `return-nextday`, `1min`, `3min`, `5min`, `12min`, `20min`, `level5`, `level10`, `level15`, `level20`, `level25`.
De levelmijlpalen markeren het einde van elke wereld.

**A/B-groep:** stel die in met `?ab=a` of `?ab=b`. De groep wordt onthouden, en de standaard is `a`. Er loopt nu nog geen test:
beide groepen spelen hetzelfde spel. Het mechanisme staat klaar voor een volgende versie, net als in Prismatic.

## 4. Interacties (visible → interact)
| Event | Zichtbaar · interactie |
|---|---|
| `tutorial / hand` | Wijzend handje in level 1 · `part-placed` (eerste plank neergezet) · `complete` (level 1 gehaald) |
| `tutorial / hint` | Hint-silhouet in level 1 · hintknop gebruikt |
| `reward / hint` | Hintknop met advertentie in beeld · getikt |
| `help / free-hint` | Gratis hint aangeboden (na 3 mislukte pogingen) · gebruikt |
| `help / skip` | **Overslaan** aangeboden (na 5 mislukte pogingen) · gebruikt |
| `banner / daily` | Dagpuzzel-kaart op het titelscherm · gestart |
| `wardrobe / button` | Knop **Kast** · geopend |
| `help / move-part · rotate-part · rotate-knob / interact` | Speler verschuift of draait voor het eerst een onderdeel (één keer per sessie) |

## 5. Overige events
| Event | Betekenis |
|---|---|
| `menu / open / interact` | Levelmenu geopend |
| `mode / daily · wardrobe / interact` | Dagpuzzel of kast gekozen |
| `stars / <n> / 1 · 2 · 3` | Aantal sterren bij winst |
| `streak / firsttry / 3 · 5 · 10 · 20` | Zoveel levels achter elkaar in één poging gehaald |
| `world / <n> / cleared · locked` | Wereld volledig opgelost, of een dichte wereld bekeken (één keer per sessie) |
| `outfit / <id> / unlock · equip` | Outfit vrijgespeeld of aangetrokken |
| `win / next · retry / interact` | Keuze op het winscherm |
| `settings / sound / on · off` | Geluid aan- of uitgezet |

Advertenties (`commercialBreak`, `rewardedBreak`) meet Poki zelf.

## Handige vragen voor de export
- **Hoe lang spelen mensen?** Bekijk het verloop van `session/played/<k>min`. Waar ze dan zitten, staat in `where/<k>min/*`.
- **Welk level is te moeilijk?** Vergelijk het aantal `fail` met `complete` per level. Elke `start` is één poging.
- **Is de nieuwe versie beter?** Vergelijk `version/9a/*` met de vorige versie, of `9a` met `9b` zodra er een test loopt.
- **Komen spelers terug?** Bekijk `session/return/day1` ten opzichte van `session/new/visit`.
