#!/usr/bin/env python3
"""Generic installer: pick hero + gallery for any gem that has _incoming/,
install them with clean names, and rewrite the YAML images: block.

Runs against every gem that currently has a non-empty _incoming/ dir.
"""
import json, re, shutil
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
IMG = BASE / "docs/images/gems"
YML = BASE / "data/gems/v1"


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
        return None
    incoming_files = [f for f in inc.iterdir()
                      if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
                      and f.stat().st_size > 1024]
    if not incoming_files:
        shutil.rmtree(inc)
        return None

    report_path = BASE / "docs/vision-report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    verdicts = report.get(gid, {})

    by_verdict = {"JEWELRY": [], "CUT": [], "MINERAL": [], "REJECT": []}
    for f in incoming_files:
        v = verdicts.get(f.name, "MINERAL").split(":")[0]
        if v in by_verdict:
            by_verdict[v].append(f.name)

    # Delete REJECT from _incoming
    for f in incoming_files:
        v = verdicts.get(f.name, "")
        if v.startswith("REJECT"):
            try:
                f.unlink()
            except OSError:
                pass

    keeps = {f: v for f, v in verdicts.items()
             if v.split(":")[0] in ("JEWELRY", "CUT", "MINERAL")
             and (inc / f).exists() and (inc / f).stat().st_size > 1024}
    # Also include existing on-disk non-SVG images
    for p in gd.iterdir():
        if not p.is_file() or p.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        if p.stat().st_size < 1024:
            continue
        keeps.setdefault(p.name, verdicts.get(p.name, "MINERAL").split(":")[0])

    if not keeps:
        shutil.rmtree(inc)
        return None

    # Hero: CUT > JEWELRY > MINERAL
    hero_name = None
    for pref in ("CUT", "JEWELRY", "MINERAL"):
        cands = [f for f, c in keeps.items() if c == pref]
        if cands:
            hero_name = next((f for f in cands if "-gallery-" not in f), sorted(cands)[0])
            break

    # Gallery: JEWELRY first (user priority), then CUT, then MINERAL
    gallery_names = []
    for pref in ("JEWELRY", "CUT", "MINERAL"):
        for f in sorted(keeps):
            if keeps[f] == pref and f != hero_name and f not in gallery_names:
                gallery_names.append(f)
            if len(gallery_names) >= 3:
                break
        if len(gallery_names) >= 3:
            break

    while len(gallery_names) < 3:
        slot = "{}-gallery-{}.svg".format(gid, len(gallery_names) + 1)
        gallery_names.append(slot)

    # Copy hero
    if hero_name:
        src = (inc / hero_name) if (inc / hero_name).exists() else (gd / hero_name)
        if src.exists():
            hero_target = "{}.jpg".format(gid)
            try:
                shutil.copy2(src, gd / hero_target)
            except OSError:
                pass  # target locked — keep existing
            hero_target_final = hero_target if (gd / hero_target).exists() else hero_name
        else:
            hero_target_final = hero_name
    else:
        hero_target_final = "{}.svg".format(gid)

    # Copy gallery images
    new_gallery = []
    for i, fname in enumerate(gallery_names, 1):
        if fname.endswith(".svg"):
            new_gallery.append(fname)
            continue
        src = (inc / fname) if (inc / fname).exists() else (gd / fname)
        if not src.exists():
            continue
        gallery_target = "{}-gallery-{}.jpg".format(gid, i)
        # Try to copy; if target is locked (WinError 32), keep existing
        if not (gd / gallery_target).exists():
            try:
                shutil.copy2(src, gd / gallery_target)
            except OSError:
                pass  # keep existing file as-is
        elif (inc / fname).exists():
            # Replace if new copy is in _incoming (skip if locked)
            try:
                shutil.copy2(src, gd / gallery_target)
            except OSError:
                pass
        new_gallery.append(gallery_target)

    # Remove leftover SVG placeholders if real images exist
    for p in gd.glob("*.svg"):
        try:
            p.unlink()
        except OSError:
            pass

    # Rewrite YAML
    try:
        rewrite_yaml(gid, hero_target_final, new_gallery)
    except Exception as e:
        print("{}: yaml rewrite failed: {}".format(gid, e))
        return None

    # Cleanup _incoming/
    try:
        shutil.rmtree(inc)
    except OSError:
        pass

    real = sum(1 for p in gd.iterdir()
               if p.is_file() and p.suffix.lower() in (".jpg", ".png", ".webp")
               and p.stat().st_size > 1024)
    return hero_target_final, new_gallery, real


def main():
    for gd in sorted(IMG.iterdir()):
        if not gd.is_dir():
            continue
        if not (gd / "_incoming").is_dir():
            continue
        try:
            result = install(gd.name)
        except Exception as e:
            print("{}: ERROR {}".format(gd.name, e))
            continue
        if result:
            hero, gallery, real = result
            print("{}: hero={} real={}".format(gd.name, hero, real))


if __name__ == "__main__":
    main()