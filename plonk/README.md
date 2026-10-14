# PLONK! — v1.0

Physics-puzzelgame met kettingreacties (geïnspireerd op het genre van The Incredible Machine), gebouwd voor Poki.
Plaats onderdelen, druk op **Start** en laat de gouden knikker in de mond van **Bobo** belanden.

## Spelen
Open `index.html` in een browser (dubbelklikken werkt; een lokale server zoals `npx serve` mag ook).

| Actie | Muis / touch | Toetsenbord |
|---|---|---|
| Onderdeel plaatsen | Sleep vanuit de balk onderin | – |
| Verplaatsen | Sleep een geplaatst onderdeel | – |
| Kantelen | Knop met pijl links = linkerkant omlaag, pijl rechts = rechterkant omlaag; of sleep het blauwe bolletje aan het uiteinde rond; of scrollwiel | `E` (links omlaag) / `R` (rechts omlaag) |
| Andere kant op (ventilator, band) | Blauwe knop met twee pijlen boven het onderdeel | `R` |
| Verwijderen | Rode knop *Weghalen* linksonder, of terugslepen naar de balk | `Delete` |
| Start / reset | Groene / rode knop rechtsonder | `Spatie` |
| Muziek aan/uit | Knop met muzieknoot (titelscherm en rechtsboven in een level) | – |
| Geluidseffecten aan/uit | Knop met luidspreker (titelscherm en rechtsboven in een level) | – |

## Nieuw in v1.0 (muziek en thumbnail)
- **Achtergrondmuziek**: twee tracks ("Lichtgewicht Avontuur") lopen om en om in een lus, met een zachte overgang van 2,5 s
  - wordt pas ná het laden opgehaald, dus de eerste download blijft klein (Poki: < 8 MB)
  - alleen geladen als muziek aanstaat; zachter tijdens de winjingle; stil tijdens advertenties en als het tabblad verborgen is
  - 128 kbps, stilte aan het einde weggeknipt (`music/`)
- **Aparte schakelaars** voor muziek en geluidseffecten, op het titelscherm en in elk level; uitleg bij aanwijzen; keuze wordt onthouden
- **Poki-thumbnail** volgens de richtlijnen in `thumbnails/`: vierkant 1024×1024 en 628×628, zonder tekst of rand,
  Bobo groot in beeld met open mond terwijl de gouden knikker aan komt vliegen; geen kleuren dicht bij #83FFE7
- `thumb.png` (16:10) voor de gamesite met dezelfde key-art

## Nieuw in v0.9 (duidelijker kantelen)
- De draaiknoppen laten nu zien wat er gebeurt: een mini-plank met een gele pijl bij het uiteinde dat **zakt**
- Bij aanwijzen of indrukken van een knop: een geel voorbeeld van de nieuwe stand en een uitleg ("Linkerkant omlaag")
- Ventilator/band: de voorbeeldpijl toont de nieuwe blaas-/looprichting
- Nieuw **draaibolletje** aan het uiteinde: sleep het rond, de plank volgt je vinger (stappen van 15°, -60° tot 60°)
- De hoek staat altijd boven het geselecteerde onderdeel; eenmalige uitleg bij de eerste keer kantelen

## Nieuw in v0.8 (bugfixes)
- Dubbel tikken op *Volgende*, *Opnieuw* of de hintknop tijdens een advertentie startte de actie twee keer
  (twee advertenties, twee hints); Start/Reset werkte ook achter een advertentie. Nu geblokkeerd tijdens advertenties
- *Opnieuw* na een dagpuzzel maakte er een gewoon level van; blijft nu de dagpuzzel
- Op Delete/R drukken terwijl je een onderdeel sleept kon een ánder onderdeel laten verdwijnen
- Reset tijdens het winmoment zette de Poki-gameplay niet weer aan
- Hint wees bij oplossingen met twee onderdelen het onderdeel aan dat al goed lag; wijst nu het ontbrekende aan
- Dagpuzzel kon midden op de dag wisselen als je nieuwe levels oploste; staat nu per dag vast
- Gratis tip werd niet meer aangeboden als er bij de 3e poging al een hint lag
- Oude of beschadigde opslag kon het titelscherm laten crashen; wordt nu hersteld
- Geluid (o.a. ventilatorwind) stopt nu als het tabblad verborgen is

## Nieuw in v0.7 (events zoals Prismatic)
- Event-opzet overgenomen uit Prismatic v28: funnel per poging (`level/<n>` start → complete/fail),
  speeltijd-mijlpalen vanaf de eerste input (`session/played/1min…20min`), `where/<k>min`, terugkeer per dag
  (`session/return/day1…`), funnel per versie (`version/7a/…`) met A/B-groep (`?ab=`), en opgeschoonde waarden
- Zie `EVENTS.md` voor de volledige lijst

## Nieuw in v0.6 (Poki game events)
- Ongeveer 40 soorten events via `PokiSDK.measure()`: level-, poging-, tutorial-, wereld- en dagpuzzelfunnels,
  interacties (hint, overslaan, kast, dagpuzzel) en eigen events (sterren, pogingen, outfits, mijlpalen)
- Volledige lijst en dashboardvragen in `EVENTS.md`; testen met `?debug=1` of via `Poki.events` in de console

## Nieuw in v0.5 (langer blijven spelen)
Gebaseerd op onderzoek; zie `ONTWERP-SPELPLEZIER.md` voor de onderbouwing en bronnen.
- Nieuwe spelers starten direct in level 1 (geen menu, geen introkaart)
- Spoor van de vorige poging + "Bijna! Nog X cm tot Bobo"
- Na 3 mislukte pogingen een gratis tip, na 5 de optie *Overslaan*
- Kettingreactie-teller, persoonlijke records
- Bobo's kast: 8 verzamelbare outfits met voortgangsbalk (eerste outfit al na level 1)
- "Volgende level" en "Nieuw onderdeel" vooraf zichtbaar
- Dagpuzzel op het titelscherm (dagsterren, zonder streak-straf)

## Nieuw in v0.4 (mobiel)
- Onderdelen zijn met een vinger veel makkelijker te pakken: de tikzone ligt rondom het onderdeel (ongeveer 30 schermpixels), en bij overlap wint het dichtstbijzijnde onderdeel
- Een onderdeel uit de balk zweeft bóven je vinger, zodat je ziet waar je het neerzet
- Knoppen hebben op touch een ruimere tikzone; de draaiknoppen zijn groter
- Een tweede vinger op het scherm verstoort het slepen niet meer
- Kleine trilling van je vinger telt niet meer als slepen (tikken = selecteren)

## Nieuw in v0.3
- **Hints klikken magnetisch vast**: sleep een onderdeel in de buurt van het oplichtende silhouet en het springt precies op de goede plek (geel = vastgeklikt)
- **Domino's zakken vanzelf op de grond** bij het neerzetten, zodat ze altijd goed staan
- **Bowlingbal stak bij de start in de plank** (level 1, 8, 9, 18): beginposities rechtgezet; de controletool meldt dit voortaan
- Ballen worden altijd vóór de planken getekend
- **Draaien en verwijderen uit elkaar**: twee draaiknoppen (links- en rechtsom) boven het onderdeel die niet verspringen tijdens het draaien, met de hoek erbij; *Weghalen* staat nu linksonder

## Inhoud v0.2
- **25 levels in 5 werelden**, elk met een eigen sfeer en materiaal:
  1. De Speelkamer (plank, trampoline) · 2. De Keuken (lopende band, domino) · 3. De Tuin (ventilator, wip)
  4. Het Lab (combinaties van twee onderdelen) · 5. De Ruimte (50% zwaartekracht)
- **Moeilijkheidsopbouw**: elk nieuw onderdeel krijgt eerst een ruim introductielevel en wordt daarna gecombineerd.
  Level 1 is een tutorial met oplichtend silhouet en een wijzend handje.
- **Nieuw onderdeel**: lopende band (spiegelen = andere richting, met bewegende pijltjes)
- **Vallijnen** in bouwmodus laten zien waar de knikker en de bal heen vallen
- **Wip werkt nu als katapult** (aanslag op 34°)
- Wereldmenu met pijlen; een wereld gaat open zodra de vorige is uitgespeeld
- 3 sterren per level: opgelost · binnen het aantal onderdelen · binnen de tijd
- Hint via rewarded ad (toont een oplichtend silhouet van de oplossing)
- Alle graphics en geluidseffecten worden in code gegenereerd

## Levels controleren
`node tools/design.js` controleert elk level: zonder onderdelen mag het niet lukken, de opgeslagen oplossing
moet winnen, elk onderdeel van de oplossing moet nodig zijn, en de kolom *ruimte* telt hoeveel posities winnen
(hoger = makkelijker). Zo is de moeilijkheid per level meetbaar.

## Poki SDK
Geïntegreerd in `js/poki.js` met een fallback zodat de game ook zonder SDK of met adblocker werkt.
- `gameLoadingFinished()` na het laden
- `gameplayStart()` bij het begin van een level, `gameplayStop()` bij winst/menu
- `commercialBreak()` vóór het volgende level en bij "Opnieuw"
- `rewardedBreak()` voor een hint
- `measure()` voor game events (zie `EVENTS.md`)
- Geluid wordt automatisch gedempt tijdens advertenties

## Techniek
- Physics: Matter.js 0.20 (lokaal meegeleverd in `lib/`, want Poki blokkeert externe CDN's)
- Vaste tijdstap van 1/60 s → dezelfde oplossing geeft telkens hetzelfde resultaat
- Canvas 2D, 16:9 logisch formaat 1280×720, schaalt mee met elk scherm (HiDPI)
- `tools/design.js`: level-controle en moeilijkheidsmeting (zie boven)
- `tools/build-artifact.js`: bouwt één losse HTML-pagina (`dist/plonk.html`) zonder Poki SDK

## Bestanden
```
index.html        startpagina
js/sim.js         simulatie, onderdelen, plaatsingscontrole
js/levels.js      leveldata + geverifieerde oplossingen
js/game.js        rendering, Bobo, UI, input, game-flow
js/audio.js       geluidseffecten (gesynthetiseerd) + achtergrondmuziek
music/            achtergrondmuziek (2 tracks)
thumbnails/       Poki-thumbnails (vierkant)
thumb.png         thumbnail voor de gamesite (16:10)
game.json         titel/versie/beschrijving voor de gamesite
js/poki.js        Poki SDK-wrapper
lib/matter.min.js physics-engine (MIT-licentie)
tools/design.js   level-controle + moeilijkheid (Node)
tools/build-artifact.js  losse webversie
ONTWERP-SPELPLEZIER.md   onderzoek en ontwerpkeuzes voor retentie
EVENTS.md         alle Poki game events
```

## Volgende stappen (ideeën)
Meer onderdelen (ballon, katrol, schakelaar + motor), verzamelbare outfits voor Bobo, animated thumbnail voor Poki.
