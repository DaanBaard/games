#!/usr/bin/env python3
"""Zet een game-zip op de juiste plek in de repo.

Gebruik:
    python3 scripts/publish_zip.py pad/naar/tumblerz_v1.3.zip [--slug tumblerz] [--version 1.3] [--title "Tumblerz"]

- Pakt de zip uit naar <slug>/ (oude inhoud wordt vervangen).
- Zit alles in één submap in de zip, dan wordt die submap gebruikt.
- Ontbreekt game.json, dan wordt hij aangemaakt uit slug/versie/titel.
- Slug en versie worden afgeleid uit de bestandsnaam <slug>_v<versie>.zip als ze niet zijn opgegeven.
"""
import argparse
import json
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("zip")
    ap.add_argument("--slug")
    ap.add_argument("--version")
    ap.add_argument("--title")
    ap.add_argument("--description")
    a = ap.parse_args()

    zpath = Path(a.zip)
    m = re.match(r"^(.+?)[_-]v?(\d[\w.\-]*)$", zpath.stem)
    slug = a.slug or (m.group(1) if m else zpath.stem)
    slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
    version = a.version or (m.group(2) if m else "")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        with zipfile.ZipFile(zpath) as z:
            for name in z.namelist():
                if name.startswith("/") or ".." in Path(name).parts:
                    sys.exit(f"Onveilig pad in zip: {name}")
            z.extractall(tmp)
        src = tmp
        entries = [p for p in tmp.iterdir() if p.name not in {"__MACOSX", ".DS_Store"}]
        if len(entries) == 1 and entries[0].is_dir():
            src = entries[0]
        if not (src / "index.html").exists():
            sys.exit("Geen index.html gevonden in de zip.")

        dest = ROOT / slug
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(src, dest, ignore=shutil.ignore_patterns("__MACOSX", ".DS_Store"))

    meta_file = dest / "game.json"
    meta = json.loads(meta_file.read_text(encoding="utf-8")) if meta_file.exists() else {}
    meta.setdefault("title", a.title or slug.replace("-", " ").title())
    if a.title:
        meta["title"] = a.title
    if version:
        meta["version"] = version
    if a.description:
        meta["description"] = a.description
    meta.setdefault("description", "")
    meta_file.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Gepubliceerd: {slug} v{meta.get('version', '?')} -> {dest.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
