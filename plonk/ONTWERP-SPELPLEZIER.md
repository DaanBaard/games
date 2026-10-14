# PLONK! — Waarom spelers blijven spelen (onderzoek → ontwerp)

Dit document vat het onderzoek samen dat ten grondslag ligt aan v0.5, en laat per principe zien wat er in het spel is gebouwd.

## 1. Wat Poki meet en verwacht
- Poki beoordeelt games in de Web Fit Test op **doorklikratio (thumbnail)**, **conversie naar spelen** en **gemiddelde speeltijd**.
- Richtwaarden uit Poki's best practices: gemiddelde speeltijd **5+ minuten**, sterk is **7–10+ minuten**. Conversie naar spelen **65%+**.
- De eerste sessie, en vooral de eerste minuut, is het belangrijkst: *"Kan de speler binnen tien seconden plezier hebben?"* Lange intro's, veel tekst en trage unlocks werken slecht.
- Web-spelers willen het gevoel van *"nog één keer proberen"*. Lichte voortgangssystemen werken beter dan ingewikkelde economieën. Rewarded ads werken het best als vrijwillige tweede kans of extraatje.
- Algemener onderzoek (deltaDNA, 275 games): games met een eerste sessie langer dan gemiddeld (9 min) hadden **31% dag-1-retentie, tegenover 20%** bij kortere sessies. Advies: maak de eerste 10–20 minuten frustratievrij en zorg voor een natuurlijk eindpunt waar de speler graag terugkomt.

## 2. Psychologische principes
| Principe | Kern | Bron |
|---|---|---|
| Zelfdeterminatietheorie | Spelers blijven spelen als een game voorziet in **competentie** (haalbare uitdaging), **autonomie** (keuzevrijheid) en **verbondenheid**. Dit voorspelt meer dan "fun" alleen. | Ryan, Rigby & Przybylski (2006), *Motivation and Emotion* |
| Flowkanaal | Uitdaging moet bij vaardigheid passen. Geen rechte lijn omhoog, maar golvend: makkelijker na een nieuw element of een moeilijk level. Bied een uitweg voor wie vastzit. | Csikszentmihalyi; *Game Design Theory Applied: The Flow Channel* |
| Goal-gradient-effect | Hoe dichter bij een doel, hoe meer inzet. Zichtbare voortgang en tussendoelen versterken dit. | Hull (1932); Kivetz, Urminsky & Zheng (2006) |
| Endowed progress | Een "voorsprong" verhoogt de kans dat mensen een doel afmaken (spaarkaart met 2 gratis stempels). | Nunes & Drèze (2006) |
| Nieuwsgierigheid en "juicy" feedback | In een experiment met 1.699 spelers was **nieuwsgierigheid** de enige voorspeller van vrijwillige speeltijd. Feedback die afhangt van **succes** versterkte competentie. Overdreven effecten zonder koppeling aan de actie verzwakten juist het gevoel van controle. | Imperial College London, *How does juicy game feedback motivate?* |
| Dagelijkse puzzel | Eén gedeelde puzzel per dag geeft een reden om terug te komen. Een streak-teller blijft verborgen bij nul. | Daily-puzzle case study (peerpush) |

## 3. Wat er in v0.5 is gebouwd

| Principe | In PLONK! |
|---|---|
| Plezier binnen 10 seconden | Nieuwe spelers gaan met **Spelen** direct naar level 1, zonder menu of introkaart. Het handje en het silhouet laten zien wat je moet doen. |
| Competentie, leren van fouten | **Spoor van de vorige poging**: na een mislukte poging zie je waar de knikker heen ging (stippen en een kruisje). |
| Competentie, bijna-raak | **"Bijna! Nog 6 cm tot Bobo."** De game meet hoe dicht de knikker bij Bobo kwam. |
| Flow, uitweg bij frustratie | Na **3 mislukte pogingen** biedt Bobo een **gratis tip** aan (het lampje licht op, zonder advertentie). Na **5 pogingen** verschijnt **Overslaan**: het volgende level gaat open en je kunt later terugkomen. |
| Succes-afhankelijke feedback | **Kettingreactie-teller**: elk onderdeel dat meedoet levert "Ketting ×2, ×3…" op, met een oplopende toon. Op het winscherm staan je tijd, je ketting en je **record**. |
| Goal-gradient + endowed progress | **Bobo's kast** met 8 outfits (feesthoedje, koksmuts, bloemenkrans, labbril, ruimtehelm, kroon, zonnebril). Het eerste outfit komt al na level 1, zodat het systeem meteen zichtbaar is. Een **voortgangsbalk** ("16 / 22 → Bloemenkrans") staat op het winscherm, in het levelmenu en in de kast. Een nieuw outfit trekt Bobo direct aan. |
| Nieuwsgierigheid | Het winscherm laat zien wat er komt: **"Volgende: 9. Dominorij"** en **"Nieuw: Domino"**. Op de introkaart krijgen nieuwe onderdelen een **NIEUW!**-label. |
| Reden om terug te komen | **Dagpuzzel** op het titelscherm: elke dag een ander, al opgelost level met een tijdsdoel. Elke gehaalde dagpuzzel levert een dagster op; bij 3 dagsterren komt de Zonnebril vrij. |
| Autonomie | Vrije keuze uit opengespeelde levels en outfits, en meerdere oplossingen per level ("minder onderdelen = meer sterren"). |

## 4. Bewust niet gedaan
Poki's publiek bestaat voor een groot deel uit kinderen. Daarom is er niets ingebouwd dat speelt op angst iets te missen of op verlies:
- geen streaks die je kwijtraakt, en geen schuldgevoel-meldingen;
- geen aftelklokken die je tot spelen dwingen, en geen automatisch doorspelen;
- geen kansspel-elementen zoals loot boxes of willekeurige beloningen met een betaalcomponent;
- geen beloningen die alleen via advertenties te krijgen zijn.

Een gemiste dagpuzzel kost niets. De volgende dag is er gewoon een nieuwe.

## Bronnen
- Poki / Defold: *Best practices when building for the web* — https://defold.com/extension-poki-sdk/best-practices
- Poki: *Web Fit Test help* — https://sdk.poki.com/web-fit-help
- Game Developer: *How first session length impacts game performance* — https://www.gamedeveloper.com/business/how-first-session-length-impacts-game-performance
- University of Rochester: onderzoek naar motivatie bij gamers (Ryan, Rigby, Przybylski) — https://www.rochester.edu/news/printable.php?id=2719
- Game Developer: *Game Design Theory Applied: The Flow Channel* — https://www.gamedeveloper.com/design/game-design-theory-applied-the-flow-channel
- Learning Loop: *Goal-gradient effect* — https://learningloop.io/plays/psychology/goal-gradient-effect
- Wharton (Nunes & Drèze): *endowed progress effect* — https://knowledge.wharton.upenn.edu/?p=5630
- Imperial College London: *How does juicy game feedback motivate?* — https://spiral.imperial.ac.uk/entities/publication/253c32f5-d124-4a23-88b5-9aaaf114608d
- PeerPush: *How we fixed a one-and-done problem on a daily puzzle game* — https://peerpush.com/blog/how-we-fixed-a-one-and-done-problem-on-a-daily-puzzle-game
