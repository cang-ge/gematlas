#!/usr/bin/env python3
"""Repair gems with duplicate/mid-file images blocks.

Root cause: some gems (added by add-gem-varieties.py) have `images:` placed
mid-file (before origin). The downloader's yaml_set_images only strips an
end-anchored images block, so a second block got appended -> duplicate.
This script removes ALL images blocks from every gem YAML, then rebuilds
ONE correct block referencing actual files on disk (real jpg/png first,
SVG placeholder fallback).
"""
import re, json
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
YML = BASE / "data/gems/v1"
IMG = BASE / "docs/images/gems"

def real_files(gid):
    gd = IMG / gid
    if not gd.exists():
        return []
    out = []
    for p in sorted(gd.iterdir()):
        if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") and p.stat().st_size > 1024:
            out.append(p.name)
    return out

def rebuild(gid):
    p = YML / "{}.yaml".format(gid)
    txt = p.read_text(encoding="utf-8")
    # Remove every images block (anywhere, any spacing)
    new_txt = re.sub(r"\n?images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n?", "\n", txt)
    # Remove trailing leftover newlines from images removal
    new_txt = new_txt.rstrip() + "\n"
    reals = real_files(gid)
    if reals:
        main = next((f for f in reals if "-gallery-" not in f), reals[0])
        gallery = [f for f in reals if f != main][:3]
    else:
        main = "{}.svg".format(gid)
        gallery = ["{}-gallery-{}.svg".format(gid, i) for i in range(1, 4)]
    block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(main, ", ".join(gallery))
    tmp = p.with_suffix(".yaml.tmp")
    tmp.write_text(new_txt + block, encoding="utf-8")
    tmp.replace(p)
    return len(re.findall(r"^images:", txt, re.M)) if "images:" in txt else 0

fixed = 0
for p in sorted(YML.glob("*.yaml")):
    txt = p.read_text(encoding="utf-8")
    n = len(re.findall(r"^images:", txt, re.M))
    if n > 1:
        rebuild(p.stem)
        fixed += 1
        print("{}: {} blocks -> 1".format(p.stem, n))
print("fixed: {}".format(fixed))

# verify no YAML has duplicate images blocks
dups = [p.stem for p in YML.glob("*.yaml")
        if len(re.findall(r"^images:", p.read_text(encoding="utf-8"), re.M)) > 1]
print("remaining duplicates: {}".format(dups))