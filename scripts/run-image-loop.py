#!/usr/bin/env python3
"""GemAtlas image closed-loop runner — run N rounds of:
    download → classify (vision) → cleanup → report

Each round downloads jewelry-first candidates, classifies only NEW images
with the vision model, deletes REJECTs, and rebuilds YAML images blocks.

Usage:
  VISION_PROVIDER=dashscope VISION_API_KEY=sk-... python scripts/run-image-loop.py [rounds]
"""
import os, subprocess, sys, time
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ROUNDS = int(sys.argv[1]) if len(sys.argv) > 1 else 2
PY = sys.executable

def real_count():
    img = BASE / "docs" / "images" / "gems"
    n = 0
    for p in img.rglob("*"):
        if p.is_file() and p.suffix.lower() in (".jpg", ".png", ".webp") and p.stat().st_size > 1024:
            n += 1
    return n

def svg_count():
    img = BASE / "docs" / "images" / "gems"
    return sum(1 for p in img.rglob("*.svg") if p.is_file() and p.stat().st_size < 3000)

def run(cmd):
    print("\n>>> {}".format(" ".join(cmd)))
    r = subprocess.run(cmd, cwd=str(BASE))
    return r.returncode == 0

for rnd in range(1, ROUNDS + 1):
    print("\n" + "=" * 50)
    print("  ROUND {} / {}".format(rnd, ROUNDS))
    print("=" * 50)
    before = real_count()
    print("Real images before: {}".format(before))

    # 1. Download (jewelry-first categories + jewelry terms)
    run([PY, "scripts/download-gem-images-multi.py"])

    # 2. Classify new images
    run([PY, "scripts/classify-images.py"])

    # 3. Cleanup: delete REJECT, rebuild YAML
    run([PY, "scripts/apply-vision-cleanup.py"])

    after = real_count()
    gained = after - before
    print("\nRound {} done: real {} -> {} (+{}), SVG {}".format(
        rnd, before, after, gained, svg_count()))
    if gained <= 0:
        print("No new images gained — stopping early.")
        break

print("\nLoop finished. Final: {} real / {} SVG".format(real_count(), svg_count()))
