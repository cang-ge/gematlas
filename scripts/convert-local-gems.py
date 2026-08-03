#!/usr/bin/env python3
"""Convert local gemstone photos (from user's Pictures/) to JPG and stage
them into docs/images/gems/<gem>/_incoming/ for vision classification.

Default gems: the 7 'script-can't-find-these' gems user manually collected.
"""
import argparse
import shutil
import sys
from pathlib import Path
from PIL import Image

SRC_BASE = Path(r"C:/Users/Administrator/Pictures")
OUT_BASE = Path(r"D:/Study/gematlas/docs/images/gems")

DEFAULT_GEMS = [
    "amazonite", "chalcedony", "dioptase", "garnet-demantoid",
    "serpentine", "sugilite", "tsavorite-garnet",
]


def main(gems):
    for gid in gems:
        src = SRC_BASE / gid
        if not src.is_dir():
            print("skip (no dir): {}".format(src))
            continue
        out = OUT_BASE / gid / "_incoming"
        out.mkdir(parents=True, exist_ok=True)
        copied = 0
        for f in sorted(src.iterdir()):
            if not f.is_file():
                continue
            if f.suffix.lower() == ".webp":
                try:
                    im = Image.open(f).convert("RGB")
                    dest = out / (f.stem + ".jpg")
                    im.save(dest, "JPEG", quality=92)
                    print("{} {} -> {} ({}B)".format(gid, f.name, dest.name, dest.stat().st_size))
                except Exception as e:
                    print("{} {} -> CONVERT FAIL: {}".format(gid, f.name, e))
                copied += 1
            elif f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                dest = out / f.name
                shutil.copy2(f, dest)
                print("{} {} -> {}".format(gid, f.name, dest.name))
                copied += 1
        print("  {}: {} files staged".format(gid, copied))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("gems", nargs="*", help="Gem ids to process (default: the 7 manual ones)")
    args = parser.parse_args()
    main(args.gems or DEFAULT_GEMS)