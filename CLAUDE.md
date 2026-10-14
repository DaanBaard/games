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

## Nieuwe versie publiceren
Als Daan zegt "publiceer naar de site" voor een game-zip:
1. `python3 scripts/publish_zip.py pad/naar/<slug>_v<versie>.zip` (opties: `--slug`, `--version`, `--title`, `--description`).
2. `python3 scripts/build_index.py` om lokaal te controleren.
3. Commit (`<slug> v<versie>`), tag `<slug>-v<versie>`, push naar `main` met tags.
Paden in een game moeten relatief zijn (de site draait onder `/games/`).
