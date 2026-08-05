#!/usr/bin/env python3
"""Convert user-filled 新宝石缺图 photos -> docs/images/gems/<gid>/_incoming.

Parses gem id from the folder name (first underscore segment) and copies
PNG/JPG/WEBP (converting WEBP) into the gem's _incoming/ dir.
"""
import shutil
from pathlib import Path
from PIL import Image

SRC = Path(r"C:/Users/Administrator/Pictures/新宝石缺图")
OUT = Path(r"D:/Study/gematlas/docs/images/gems")

for sub in sorted(SRC.iterdir()):
    if not sub.is_dir():
        continue
    gid = sub.name.split("_")[0]
    gd = OUT / gid
    inc = gd / "_incoming"
    if inc.exists():
        shutil.rmtree(inc)
    inc.mkdir(parents=True)
    n = 0
    for f in sorted(sub.iterdir()):
        if not f.is_file() or f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        if f.stat().st_size < 1024:
            continue
        if f.suffix.lower() == ".webp":
            Image.open(f).convert("RGB").save(inc / (f.stem + ".jpg"), "JPEG", quality=92)
        else:
            shutil.copy2(f, inc / f.name)
        n += 1
    print("{}: {} files -> _incoming".format(gid, n))