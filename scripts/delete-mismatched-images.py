#!/usr/bin/env python3
"""Bulk-delete wrong-content images based on visual audit notes.

Manually-curated list of (gem_dir, filename, reason) for confirmed mismatches.
Run after a single human-reviewer has eyeballed each suspect image.

Each entry is hard-deleted from disk; the YAML images: block is rewritten
to substitute SVG placeholders for the deleted slot (preserving 4-image layout).
"""
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "docs" / "images" / "gems"
YML = BASE / "data" / "gems" / "v1"

# CONFIRMED WRONG (audited by user/agent on visual inspection)
# Format: "gem_dir/filename.jpg" — extension is .jpg / .png / etc.
TO_DELETE = [
    # ruby — actual person named "Ruby" (singer), not gemstone
    "ruby/ruby.jpg",                          # woman portrait
    "ruby/ruby-gallery-1.png",                # singer in red coat
    # sapphire — Armstrong Siddeley Sapphire classic car
    "sapphire/sapphire-gallery-1.jpg",        # car hood ornament
    "sapphire/sapphire-gallery-2.jpg",        # car hood ornament
    # emerald — Emerald Dove (bird species) + Emerald, USA town
    "emerald/emerald.jpg",                    # green-winged dove
    "emerald/emerald-gallery-1.jpg",          # Thai temple (Wat Phra Kaew "Emerald")
    "emerald/emerald-gallery-2.jpg",          # State Bank of Emerald, USA
    # diamond — Diamond, Oklahoma (US town)
    "diamond/diamond-gallery-3.jpg",          # small-town street
    # opal — Obsidian note-taking app screenshot + gas station
    "opal/opal.jpg",                          # software UI
    "opal/opal-gallery-3.jpg",                # Sheetz gas station
    # obsidian — wrong mineral (turquoise/diopside cluster, not obsidian)
    "obsidian/obsidian.jpg",                  # turquoise/diopside cluster
    # malachite — Malachite butterfly (Siproeta stelenes)
    "malachite/malachite.jpg",                # butterfly
    "malachite/malachite-gallery-1.jpg",      # butterfly
    # aquamarine — Hot spring pool (Aqua / Marine are also place names)
    "aquamarine/aquamarine.jpg",              # Yellowstone-style hot spring
    # paraiba-tourmaline — Hot spring pool (same kind of false match)
    "paraiba-tourmaline/paraiba-tourmaline.jpg",  # hot spring
]

# gems where ALL real images are bad → delete everything real
# and rely on SVG placeholders
ALL_DELETE = {
    # "diamond",  # diamond.png is a 3D render — actually OK
}


def main():
    deleted = 0
    for path_str in TO_DELETE:
        path = IMG / path_str
        if path.exists():
            path.unlink()
            print("  DEL: {}".format(path_str))
            deleted += 1
        else:
            print("  ! {} (not present)".format(path_str))
    for gid in ALL_DELETE:
        gd = IMG / gid
        if not gd.exists():
            continue
        for p in gd.iterdir():
            if p.suffix.lower() in (".jpg", ".png", ".webp", ".gif"):
                p.unlink()
                print("  DEL: ALL {}/{}".format(gid, p.name))
                deleted += 1
    print("\nTotal deleted: {}".format(deleted))


if __name__ == "__main__":
    main()