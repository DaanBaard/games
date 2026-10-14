#!/usr/bin/env python3
"""Bouwt games.json uit alle mappen in de repo-root die een game.json bevatten.

Draait automatisch in de GitHub Action bij elke push, maar kan ook lokaal:
    python3 scripts/build_index.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"scripts", ".github", ".git"}


def last_commit_date(path: Path) -> str:
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", str(path)],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out
    except Exception:
        return ""


def main() -> None:
    games = []
    for d in sorted(p for p in ROOT.iterdir() if p.is_dir() and p.name not in SKIP):
        meta_file = d / "game.json"
        if not meta_file.exists() or not (d / "index.html").exists():
            continue
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"! {meta_file}: ongeldige JSON ({e}), overgeslagen")
            continue
        thumb = meta.get("thumbnail") or ("thumb.png" if (d / "thumb.png").exists() else "")
        games.append({
            "slug": d.name,
            "title": meta.get("title") or d.name,
            "version": str(meta.get("version", "")),
            "description": meta.get("description", ""),
            "thumbnail": f"{d.name}/{thumb}" if thumb else "",
            "tags": meta.get("tags", []),
            "updated": meta.get("updated") or last_commit_date(d),
        })
    games.sort(key=lambda g: g["updated"], reverse=True)
    (ROOT / "games.json").write_text(json.dumps(games, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"games.json: {len(games)} game(s)")


if __name__ == "__main__":
    main()
