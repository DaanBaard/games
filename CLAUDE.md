# Daan's Games — gamesite

Statische site op GitHub Pages (https://daanbaard.github.io/games/). Elke push naar `main` publiceert automatisch via `.github/workflows/publish.yml`.

## Structuur
- `index.html` — overzichtspagina, leest `games.json`.
- `games.json` — wordt door de Action gegenereerd (`scripts/build_index.py`); niet met de hand bewerken.
- `<slug>/` — één map per game met minimaal `index.html` en `game.json`, optioneel `thumb.png` (16:10).

## game.json
```json
{ "title": "Tumblerz", "version": "1.3", "description": "Korte omschrijving", "tags": ["arcade"] }
```

## Werken aan een game
De repo is de bron: elke sessie clont de repo en werkt in `<slug>/`, nooit aan een losse kopie elders.
Elke nieuwe versie krijgt een hoger versienummer, zichtbaar in de game én in `game.json` (`version`).

## Nieuwe versie publiceren
Als Daan zegt "publiceer (naar de site)":
1. Bij een zip: `python3 scripts/publish_zip.py pad/naar/<slug>_v<versie>.zip` (opties: `--slug`, `--version`, `--title`, `--description`). Bij werk in de repo zelf: alleen `version` in `<slug>/game.json` ophogen.
2. Commit alleen de game-map (`git add <slug>`), bericht `<slug> v<versie>`, en push naar `main`. Geen tags pushen en `games.json` niet committen.
3. De Action doet de rest: `games.json` opnieuw bouwen, de site publiceren en de tag `<slug>-v<versie>` aanmaken.

`scripts/build_index.py` lokaal draaien mag als controle, maar in een ondiepe clone kloppen de datums niet; zet `games.json` daarna terug met `git checkout -- games.json`.
Paden in een game moeten relatief zijn (de site draait onder `/games/`).
