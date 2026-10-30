# Henk op Poki

Henk draait als één `index.html` zonder externe bestanden (lettertype Fredoka zit ingebakken). Het beeld schaalt mee met elk formaat (liggend, staand, iframe dat van grootte verandert) en is speelbaar op telefoon (sleep links om te kruipen, tik rechts om te schieten).

## Uploaden
1. Zip de map `henk/` (alleen `index.html` is nodig) en upload die in Poki for Developers (Poki Inspector / nieuwe versie).
2. Thumbnail: maak er één op basis van `thumb.png` (Poki vraagt vierkant, bijv. 1080×1080).
3. De Poki SDK wordt alleen geladen buiten GitHub Pages en zonder `?test=1`. Op github.io en in tests draait een stub die meteen doorgaat.

## SDK-momenten
| Moment | Aanroep |
|---|---|
| Laden klaar | `PokiSDK.init()` → `gameLoadingFinished()` |
| Henk kruipt (geen overlay open) | `gameplayStart()` |
| Menu, schuurtje, pauze, levelscherm, dood | `gameplayStop()` |
| Vóór elk level | `commercialBreak()` (geluid uit tijdens reclame) |
| Na doodgaan: "Kijk reclame: ga verder" (1× per level) | `rewardedBreak()` → Henk komt terug met halve gezondheid |
| Level gehaald: "Kijk reclame: dubbele bonus" | `rewardedBreak()` → levelbonus nog een keer |
| Tabblad verlaten | spel pauzeert automatisch |

## Game-events
Via `PokiSDK.measure(category, what, action)`. `start`/`complete`/`fail` vormen een funnel, `visible`/`interact` meten interactie. Events met * worden maar één keer per sessie verstuurd. `lN` is het level (`l1` … `l15`, daarna `l15plus`).

| category | what | action | wanneer |
|---|---|---|---|
| player | session | new / returning | bij laden (localStorage `henk_seen`) |
| player | first-input | s0-5 / s5-15 / s15-30 / s30+ | eerste toets of tik in level 1 |
| screen | menu / shop / done / dead / pause | visible | scherm verschijnt |
| button | start | interact | Start in het menu |
| button | skin-&lt;skin&gt; | interact | skin gekozen in menu |
| skin | &lt;skin&gt; | selected | skin waarmee een run start |
| run | game | start / fail / quit | run begint / Opnieuw na dood / Stoppen in pauze |
| milestone | run1 … run10 | reached | hoeveelste run in deze sessie |
| button | next-level | interact | Start level in het schuurtje |
| ad | before-level | start / complete | reclame vóór elk level |
| level | lN | start / complete / fail / quit | levelfunnel |
| tutorial | intro | start / complete / fail * | level 1 als tutorial-funnel |
| tutorial | move | complete * | eerste keer bewegen |
| tutorial | move-after | s0-3 / s3-8 / s8-20 / s20+ * | hoe snel na levelstart |
| tutorial | first-kill | complete * | eerste wesp verslagen |
| tutorial | first-kill-after | s0-3 / s3-8 / s8-20 / s20+ * | hoe snel na levelstart |
| tutorial | first-jar | complete * | eerste jampot open |
| jar | lN-jI | open | jampot I in level N geopend |
| army | sizeN | reached * | leger bereikt 1, 5, 10, 20, 30, 50 slakken |
| army | lost | lN | slak uit het leger gesneuveld |
| nest | lN | destroyed | wespennest vernietigd |
| weapon | &lt;wapen&gt; | used * | eerste keer dat een wapen afgaat |
| nuke | lN | used | atoombom gebruikt |
| powerup | &lt;soort&gt; | picked | powerup opgepakt |
| shop | &lt;wapen&gt; | bought / refill | wapen gekocht of munitie bijgekocht |
| death | lN | lN-jXofY[-nest] | waar Henk stierf (aantal open potten, bij het nest) |
| button | reward-revive | visible / interact | knop "ga verder" na dood |
| reward | revive | granted | reclame bekeken, Henk leeft weer |
| button | reward-double | visible / interact | knop "dubbele bonus" |
| reward | double | granted | reclame bekeken, bonus verdubbeld |
| button | pause / resume / quit / retry / to-shop / mute / unmute | interact | HUD- en overlayknoppen |
| leave | &lt;scherm&gt; | &lt;plek&gt; | tabblad verborgen (in level met `where()`) |
| playtime | session | m1 … m60 | minuten actieve speeltijd |
| runtime | lN | s30 … s600 | seconden in één level |

Let op: na een revive kan een level zowel `fail` als later `complete` krijgen; tel `reward/revive/granted` mee bij het lezen van de funnel.

## Testen
Open `index.html?test=1` en kijk in de console naar `window.__EV`: elk event staat daar als `category|what|action`.
