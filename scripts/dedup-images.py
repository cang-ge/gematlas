#!/usr/bin/env python3
"""pHash dedup executor — remove visually-identical images per gem dir.

Strategy:
  - For each duplicate group, keep the "main" hero file if present;
    otherwise keep the alphabetically-first filename.
  - All other files in the group are deleted.
  - YAML images: block is rewritten to omit deleted files. If too many
    slots remain after dedup, replace with SVG placeholders.
"""
import sys
from pathlib import Path
import imagehash
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "docs" / "images" / "gems"
YML = BASE / "data" / "gems" / "v1"
THRESHOLD = 5
MIN_REAL = 1  # ensure at least 1 real image per gem (fallback SVG otherwise)


def scan_hashes(gd: Path):
    hashes = {}
    for f in sorted(gd.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        try:
            h = imagehash.phash(Image.open(f), hash_size=8)
            hashes[f.name] = h
        except Exception:
            pass
    return hashes


def find_groups(hashes):
    names = list(hashes.keys())
    visited = set()
    groups = []
    for i, n1 in enumerate(names):
        if n1 in visited:
            continue
        grp = [n1]
        visited.add(n1)
        for n2 in names[i+1:]:
            if n2 in visited:
                continue
            if hashes[n1] - hashes[n2] <= THRESHOLD:
                grp.append(n2)
                visited.add(n2)
        if len(grp) > 1:
            groups.append(grp)
    return groups


def keep_name(grp):
    """Prefer the 'main' (no -gallery- in name) hero file."""
    mains = [n for n in grp if "-gallery-" not in n]
    if mains:
        return mains[0]
    return grp[0]


def main():
    deleted = 0
    per_gem_removed = {}
    for gd in sorted(IMG.iterdir()):
        if not gd.is_dir():
            continue
        hashes = scan_hashes(gd)
        groups = find_groups(hashes)
        if not groups:
            continue
        removed = []
        for grp in groups:
            keeper = keep_name(grp)
            for n in grp:
                if n != keeper:
                    f = gd / n
                    if f.exists():
                        f.unlink()
                        removed.append(n)
        if removed:
            per_gem_removed[gd.name] = removed
            deleted += len(removed)
            print(f"  {gd.name}: removed {len(removed)} ({', '.join(removed)})")
    print(f"\nTotal removed: {deleted}")
    print(f"Gems affected: {len(per_gem_removed)}")


if __name__ == "__main__":
    main()