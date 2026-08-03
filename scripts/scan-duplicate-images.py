#!/usr/bin/env python3
"""pHash duplicate scanner — find visually-identical images per gem dir.

Outputs:
  - Per-gem duplicate groups (hamming distance ≤ 5)
  - Total duplicate count
  - Largest duplicate group size
"""
import sys
from pathlib import Path
from collections import defaultdict
import imagehash
from PIL import Image

# Silence PIL warnings for huge JPEGs that fail to decode.
Image.MAX_IMAGE_PIXELS = None

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "docs" / "images" / "gems"
THRESHOLD = 5  # hamming distance — ≤5 considered duplicate

def scan():
    total_dups = 0
    per_gem = {}
    for gd in sorted(IMG.iterdir()):
        if not gd.is_dir():
            continue
        # hash each file
        hashes = {}
        for f in sorted(gd.iterdir()):
            if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
                continue
            try:
                h = imagehash.phash(Image.open(f), hash_size=8)
            except Exception as e:
                print(f"  ! {f.name}: {e}")
                continue
            hashes[f.name] = h
        # group near-duplicates (only within same gem)
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
        if groups:
            per_gem[gd.name] = groups
            total_dups += sum(len(g) - 1 for g in groups)
    return total_dups, per_gem

if __name__ == "__main__":
    dups, groups = scan()
    print(f"Duplicate files (will be removed): {dups}")
    print(f"Gems with duplicates: {len(groups)}")
    print()
    for gid, grps in sorted(groups.items()):
        n_in_grps = sum(len(g) for g in grps)
        n_files = len(grps[0]) if grps else 0
        # only show big groups
        biggest = max(len(g) for g in grps)
        if biggest >= 2:
            print(f"  {gid}: {len(grps)} group(s), biggest={biggest} files")
    print()
    print("Detail (groups with >= 2 files):")
    for gid, grps in sorted(groups.items()):
        for g in grps:
            if len(g) >= 2:
                print(f"  [{gid}]")
                for f in g:
                    print(f"    {f}")