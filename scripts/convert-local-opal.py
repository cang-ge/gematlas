#!/usr/bin/env python3
"""Convert local opal photos (from user's Pictures/opal) to JPG and stage
them into docs/images/gems/opal/_incoming/ for vision classification."""
import shutil
from pathlib import Path
from PIL import Image

SRC = Path(r"C:/Users/Administrator/Pictures/opal")
OUT = Path(r"D:/Study/gematlas/docs/images/gems/opal/_incoming")
OUT.mkdir(parents=True, exist_ok=True)

for f in sorted(SRC.iterdir()):
    if not f.is_file():
        continue
    if f.suffix.lower() == ".webp":
        im = Image.open(f).convert("RGB")
        dest = OUT / (f.stem + ".jpg")
        im.save(dest, "JPEG", quality=92)
        print("converted {} -> {} ({}B)".format(f.name, dest.name, dest.stat().st_size))
    else:
        dest = OUT / f.name
        shutil.copy2(f, dest)
        print("copied {} -> {}".format(f.name, dest.name))

print("incoming:", sorted(p.name for p in OUT.iterdir()))
