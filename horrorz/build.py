#!/usr/bin/env python3
"""Bouwt horrorz/index.html uit src/ (één zelfstandig bestand, zoals Poki wil)."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "src"
version = json.loads((HERE / "game.json").read_text(encoding="utf-8"))["version"]
shell = (SRC / "shell.html").read_text(encoding="utf-8")
css = (SRC / "style.css").read_text(encoding="utf-8")
import glob
trx = {}
for f in sorted(glob.glob(str(SRC / "lang" / "*.tsv"))):
    d = {}
    for line in open(f, encoding="utf-8"):
        line = line.rstrip("\n")
        if "\t" in line:
            k, v = line.split("\t", 1)
            d[k] = v
    trx[pathlib.Path(f).stem] = d
trx_js = "const TRX=" + json.dumps(trx, ensure_ascii=False, separators=(",", ":")) + ";\n"
js = (SRC / "core.js").read_text(encoding="utf-8") + "\n" + trx_js + "\n".join((SRC / f).read_text(encoding="utf-8") for f in ["i18n.js", "data.js", "textures.js", "art.js", "game.js", "render.js", "ui.js"])
out = shell.replace("/*CSS*/", css).replace("/*JS*/", js).replace("__VERSION__", version)
(HERE / "index.html").write_text(out, encoding="utf-8")
print(f"index.html v{version}: {len(out)//1024} kB")
