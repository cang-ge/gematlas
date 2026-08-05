#!/usr/bin/env python3
"""Delete all SVG placeholder images, drop their YAML references, and list
gems that have fewer than 1 hero + 3 gallery real images."""
import re
from pathlib import Path

YML = Path(r"D:/Study/gematlas/data/gems/v1")
IMG = Path(r"D:/Study/gematlas/docs/images/gems")


def real_count(gid):
    gd = IMG / gid
    return sum(1 for p in gd.iterdir()
               if p.is_file() and p.suffix.lower() in (".jpg", ".png", ".webp")
               and p.stat().st_size > 1024)


def main():
    # 1. Delete every SVG placeholder under docs/images/gems/
    deleted = 0
    for f in IMG.rglob("*.svg"):
        if f.is_file() and f.stat().st_size < 3000:
            f.unlink()
            deleted += 1
    print("deleted SVG placeholders: {}".format(deleted))

    # 2. Rewrite YAML images blocks to reference only existing real files
    fixed = 0
    for p in sorted(YML.glob("*.yaml")):
        gid = p.stem
        txt = p.read_text(encoding="utf-8")
        m = re.search(r"^images:\n  main: ([^\n]+)\n  gallery: \[([^\]]*)\]\n", txt, re.MULTILINE)
        if not m:
            continue
        reals = sorted([f.name for f in (IMG / gid).iterdir()
                        if f.suffix.lower() in (".jpg", ".png", ".webp") and f.stat().st_size > 1024])
        if not reals:
            continue
        main = next((f for f in reals if "-gallery-" not in f), reals[0])
        gallery = [f for f in reals if f != main][:3]
        block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(main, ", ".join(gallery))
        new_txt = re.sub(r"\n?images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n?", "\n", txt)
        new_txt = re.sub(r"\n?images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n?", "\n", new_txt)
        p.write_text(new_txt.rstrip() + block, encoding="utf-8")
        fixed += 1
    print("YAML rewritten: {}".format(fixed))

    # 3. Gap list: gems with < 4 real images
    print("\n=== 缺口清单（不足 1 hero + 3 gallery）===")
    gaps = []
    for p in sorted(YML.glob("*.yaml")):
        gid = p.stem
        n = real_count(gid)
        if n < 4:
            gaps.append((gid, n, 4 - n))
    gaps.sort(key=lambda x: x[2], reverse=True)
    for gid, n, miss in gaps:
        print("  {:<24} 现有 {} 张，缺 {} 张".format(gid, n, miss))
    print("\n共 {} 颗不足 4 张；其余 {} 颗已满".format(len(gaps), 60 - len(gaps)))


if __name__ == "__main__":
    main()