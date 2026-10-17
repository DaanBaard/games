#!/usr/bin/env python3
"""Bouwt horrorz/index.html uit src/ (één zelfstandig bestand, zoals Poki wil)."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "src"
version = json.loads((HERE / "game.json").read_text(encoding="utf-8"))["version"]
shell = (SRC / "shell.html").read_text(encoding="utf-8")
css = (SRC / "style.css").read_text(encoding="utf-8")
js = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ["core.js", "i18n.js", "data.js", "textures.js", "art.js", "game.js", "render.js", "ui.js"])
out = shell.replace("/*CSS*/", css).replace("/*JS*/", js).replace("__VERSION__", version)
(HERE / "index.html").write_text(out, encoding="utf-8")
print(f"index.html v{version}: {len(out)//1024} kB")
