#!/usr/bin/env python3
"""Install vision-verified local photos into their gem dirs.

For each gem:
  - Pick 1 hero (CUT > JEWELRY > MINERAL)
  - Pick up to 3 gallery (JEWELRY preferred, then CUT, then MINERAL)
  - Copy with clean names (gem.jpg, gem-gallery-1/2/3.jpg)
  - Remove leftover SVG placeholders if real images present
  - Update YAML images: block
  - Clean up _incoming/ directory
"""
import json, re, shutil
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
IMG = BASE / "docs/images/gems"
YML = BASE / "data/gems/v1"

GEMS = {
    "amazonite":         ("Amazonite", "天河石"),
    "chalcedony":         ("Chalcedony", "玉髓"),
    "dioptase":           ("Dioptase", "透视石"),
    "garnet-demantoid":   ("Demantoid Garnet", "翠榴石"),
    "serpentine":         ("Serpentine", "蛇纹石"),
    "sugilite":           ("Sugilite", "苏纪石"),
    "tsavorite-garnet":   ("Tsavorite Garnet", "沙弗莱"),
}


def rewrite_yaml(gid, hero, gallery):
    p = YML / "{}.yaml".format(gid)
    txt = p.read_text(encoding="utf-8")
    txt = re.sub(r"(?m)^images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n(?=\n|$|\Z)", "\n", txt)
    block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(hero, ", ".join(gallery))
    tmp = p.with_suffix(".yaml.tmp")
    tmp.write_text(txt.rstrip() + block, encoding="utf-8")
    tmp.replace(p)


def install(gid):
    gd = IMG / gid
    inc = gd / "_incoming"
    if not inc.is_dir():
        print("{}: no _incoming".format(gid))
        return
    # Load verdicts from report
    report_path = BASE / "docs/vision-report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    verdicts = report.get(gid, {})

    # Collect verified images from _incoming + existing on-disk (not SVG)
    by_verdict = {"JEWELRY": [], "CUT": [], "MINERAL": [], "REJECT": []}
    existing_by_verdict = {"JEWELRY": [], "CUT": [], "MINERAL": [], "REJECT": []}

    for f in inc.iterdir():
        if not f.is_file() or f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        if f.stat().st_size < 1024:
            continue
        v = verdicts.get(f.name, "MINERAL").split(":")[0]
        if v in by_verdict:
            by_verdict[v].append(f.name)

    # Existing on-disk real images (not in _incoming)
    for f in gd.iterdir():
        if not f.is_file() or f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        if f.stat().st_size < 1024:
            continue
        if f.name in by_verdict["JEWELRY"] + by_verdict["CUT"] + by_verdict["MINERAL"]:
            continue  # already counted in _incoming
        v = verdicts.get(f.name, "MINERAL").split(":")[0]
        if v in existing_by_verdict:
            existing_by_verdict[v].append(f.name)

    # Merge incoming + existing
    all_files = {}
    for cat in ("JEWELRY", "CUT", "MINERAL"):
        for f in by_verdict[cat] + existing_by_verdict[cat]:
            all_files[f] = cat

    if not all_files:
        print("{}: NO verified images".format(gid))
        return

    # Delete REJECT images from disk (in _incoming only)
    for f in inc.iterdir():
        v = verdicts.get(f.name, "")
        if v.startswith("REJECT") and f.is_file():
            f.unlink()

    # Pick hero: CUT > JEWELRY > MINERAL
    hero_name = None
    for pref in ("CUT", "JEWELRY", "MINERAL"):
        cands = [f for f, c in all_files.items() if c == pref]
        if cands:
            hero_name = next((f for f in cands if "-gallery-" not in f), sorted(cands)[0])
            break

    # Pick gallery: JEWELRY first (user priority), then CUT, then MINERAL (up to 3)
    gallery_names = []
    for pref in ("JEWELRY", "CUT", "MINERAL"):
        for f in sorted(all_files):
            if all_files[f] == pref and f != hero_name and f not in gallery_names:
                gallery_names.append(f)
            if len(gallery_names) >= 3:
                break
        if len(gallery_names) >= 3:
            break

    # Pad with SVG if fewer than 3 gallery
    while len(gallery_names) < 3:
        slot = "{}-gallery-{}.svg".format(gid, len(gallery_names) + 1)
        gallery_names.append(slot)

    # Copy hero (if in _incoming) to gem.jpg
    if hero_name:
        src = inc / hero_name if (inc / hero_name).exists() else gd / hero_name
        if not src.exists():
            # Already in gem dir under same name
            hero_target = hero_name
        else:
            shutil.copy2(src, gd / "{}.jpg".format(gid))
            hero_target = "{}.jpg".format(gid)
    else:
        hero_target = "{}.svg".format(gid)

    # Copy gallery images (if in _incoming) to gem-gallery-N.jpg
    new_gallery = []
    for i, fname in enumerate(gallery_names, 1):
        if fname.endswith(".svg"):
            new_gallery.append(fname)
            continue
        src = inc / fname if (inc / fname).exists() else gd / fname
        if not src.exists():
            continue
        gallery_target = "{}-gallery-{}.jpg".format(gid, i)
        # Don't overwrite existing correct gallery files
        if not (gd / gallery_target).exists() or (inc / fname).exists():
            shutil.copy2(src, gd / gallery_target)
        new_gallery.append(gallery_target)

    # Remove leftover SVG placeholders (now that real images exist)
    for p in gd.glob("*.svg"):
        p.unlink()

    # Rewrite YAML
    rewrite_yaml(gid, hero_target, new_gallery)

    # Cleanup _incoming/
    shutil.rmtree(inc)

    real = sum(1 for p in gd.iterdir()
               if p.is_file() and p.suffix.lower() in (".jpg", ".png", ".webp")
               and p.stat().st_size > 1024)
    print("{}: hero={}  gallery={}  total_real={}".format(
        gid, hero_target, new_gallery, real))


def main():
    for gid in GEMS:
        install(gid)


if __name__ == "__main__":
    main()