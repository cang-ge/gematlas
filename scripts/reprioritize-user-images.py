#!/usr/bin/env python3
"""Reprioritize gem images: USER-downloaded photos (Pictures/) take priority
over script-downloaded ones.

For every gem that has user images in Pictures (any of the layout folders),
this script:
  1. Stages the user images to docs/images/gems/<gem>/_incoming
  2. Vision-classifies them (qwen3-vl-plus via DashScope)
  3. Rebuilds the gem's images block: user-verified images fill main +
     gallery first; any remaining slots keep existing script images, then
     SVG placeholders.

Safety: backs up each YAML (.bak), writes atomically.
"""
import json, re, shutil, time
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
YML = BASE / "data/gems/v1"
IMG = BASE / "docs/images/gems"
REPORT_PATH = BASE / "docs/vision-report.json"
PIC = Path(r"C:/Users/Administrator/Pictures")

import os, requests, base64, importlib.util, sys

KEY = os.environ.get("VISION_API_KEY", "").strip()
MODEL = os.environ.get("VISION_MODEL", "qwen3-vl-plus").strip()
URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# Load GEMS names from classify-images.py
spec = importlib.util.spec_from_file_location("C", BASE / "scripts/classify-images.py")
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)
GEMS = C.GEMS

PROMPT = (
    "You are auditing gemstone encyclopedia photos. The image is supposed to be "
    "{gem_en} ({gem_zh}, {gem_id}).\n"
    "If it is NOT this gemstone (a person, animal, place, building, vehicle, "
    "software, a different mineral, or anything unrelated), answer REJECT.\n"
    "If it IS this gemstone, answer with EXACTLY one word:\n"
    "- JEWELRY (mounted in finished jewelry: ring, pendant, necklace, earrings, bracelet)\n"
    "- CUT (loose cut/faceted stone or cabochon, not mounted)\n"
    "- MINERAL (rough mineral specimen, crystal, cluster, ore)\n"
    "Answer exactly one word: JEWELRY / CUT / MINERAL / REJECT"
)


def classify(gem, img_path):
    b64 = base64.b64encode(img_path.read_bytes()).decode()
    prompt = PROMPT.format(**gem)
    r = requests.post(URL, headers={"Authorization": "Bearer " + KEY},
                      json={"model": MODEL,
                            "messages": [{"role": "user", "content": [
                                {"type": "text", "text": prompt},
                                {"type": "image_url", "image_url": {
                                    "url": "data:image/jpeg;base64," + b64}}]}],
                            "max_tokens": 20}, timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip().upper()


def find_user_images(gid):
    """Return list of image file paths for this gem across Pictures layouts."""
    found = []
    candidates = [PIC / gid, PIC / "次要", PIC / "几乎补齐", PIC / "新宝石缺图"]
    for base_dir in candidates:
        if not base_dir.is_dir():
            continue
        # Case A: files directly inside base_dir (Pictures/<gid>/ with direct files)
        if base_dir.name == gid:
            for f in base_dir.iterdir():
                if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") \
                   and f.stat().st_size > 1024:
                    found.append(f)
        # Case B: gem is a subdirectory of base_dir (Pictures/<layout>/<gem_folder>/)
        for sub in base_dir.iterdir():
            if not sub.is_dir():
                continue
            if sub.name == gid or sub.name.split("_")[0] == gid:
                for f in sub.iterdir():
                    if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") \
                       and f.stat().st_size > 1024:
                        found.append(f)
    # dedup preserving order
    seen = set()
    uniq = []
    for f in found:
        if f not in seen:
            seen.add(f)
            uniq.append(f)
    return uniq


def rewrite_yaml(gid, main, gallery):
    p = YML / "{}.yaml".format(gid)
    txt = p.read_text(encoding="utf-8")
    bak = p.with_suffix(".yaml.bak")
    if not bak.exists():
        bak.write_text(txt, encoding="utf-8")
    txt = re.sub(r"\n?images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n?", "\n", txt)
    block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(main, ", ".join(gallery))
    tmp = p.with_suffix(".yaml.tmp")
    tmp.write_text(txt.rstrip() + block, encoding="utf-8")
    tmp.replace(p)


def process_gem(gid):
    gd = IMG / gid
    gd.mkdir(parents=True, exist_ok=True)
    # Existing real (non-SVG) images on disk
    existing = {}
    for f in gd.iterdir():
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") and f.stat().st_size > 1024:
            existing[f.name] = True

    user_srcs = find_user_images(gid)
    if not user_srcs:
        return "no user images"

    # Stage user images into a temp area, classify each
    report = {}
    if REPORT_PATH.exists():
        try:
            report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
        except Exception:
            report = {}
    report.setdefault(gid, {})

    gem = {"gem_en": GEMS[gid][0], "gem_zh": GEMS[gid][1], "gem_id": gid}
    user_verified = []  # (orig_name, verdict)
    for src in user_srcs:
        # unique temp name in gem dir
        dest = gd / ("_user_" + src.stem[:30] + src.suffix.lower())
        if dest.suffix.lower() == ".webp":
            from PIL import Image
            Image.open(src).convert("RGB").save(dest.with_suffix(".jpg"), "JPEG", quality=92)
            dest = dest.with_suffix(".jpg")
        else:
            shutil.copy2(src, dest)
        # classify
        verdict = "ERROR"
        for attempt in range(4):
            try:
                verdict = classify(gem, dest)
                break
            except Exception:
                time.sleep(4)
        report[gid][dest.name] = verdict
        if verdict in ("JEWELRY", "CUT", "MINERAL"):
            user_verified.append((dest.name, verdict))
        else:
            try:
                dest.unlink()  # reject
            except OSError:
                pass

    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

    if not user_verified:
        return "all user images rejected"

    # Hero: user CUT > JEWELRY > MINERAL
    hero = None
    for pref in ("CUT", "JEWELRY", "MINERAL"):
        cands = [n for n, v in user_verified if v == pref]
        if cands:
            hero = sorted(cands)[0]
            break
    if not hero:
        hero = user_verified[0][0]

    # Gallery: user JEWELRY > CUT > MINERAL (up to 3)
    gallery = []
    for pref in ("JEWELRY", "CUT", "MINERAL"):
        for n, v in user_verified:
            if v == pref and n != hero and n not in gallery:
                gallery.append(n)
            if len(gallery) >= 3:
                break
        if len(gallery) >= 3:
            break
    # Pad with SVG names
    while len(gallery) < 3:
        gallery.append("{}-gallery-{}.svg".format(gid, len(gallery) + 1))

    # Canonical names
    hero_canon = "{}.jpg".format(gid)
    gal_canon = ["{}-gallery-{}.jpg".format(gid, i + 1) for i in range(len(gallery))]

    # Wipe OLD script images (everything except _user_ staging files and
    # SVG placeholders we keep). The _user_ files are the user photos we
    # just classified and will move to canonical names.
    for f in list(gd.iterdir()):
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") \
           and not f.name.startswith("_user_"):
            try:
                f.unlink()
            except OSError:
                pass
    for f in list(gd.iterdir()):
        if f.is_file() and f.suffix.lower() == ".svg" and f.name not in gallery:
            try:
                f.unlink()
            except OSError:
                pass

    # Copy chosen user files (_user_*) to canonical names (copy2 overwrites
    # any stale target; Windows shutil.move fails silently when target exists)
    chosen = [hero] + [g for g in gallery if not g.endswith(".svg")]
    for i, src_name in enumerate(chosen):
        src = gd / src_name
        if not src.exists():
            continue
        target = gd / (hero_canon if i == 0 else gal_canon[i - 1])
        try:
            shutil.copy2(str(src), str(target))
        except OSError:
            pass

    # Delete leftover _user_ staging files not chosen
    for f in list(gd.iterdir()):
        if f.is_file() and f.name.startswith("_user_"):
            try:
                f.unlink()
            except OSError:
                pass

    # Build final gallery list (canonical jpg names + svg placeholders)
    final_gallery = []
    for i, gname in enumerate(gallery):
        if gname.endswith(".svg"):
            final_gallery.append(gname)
        else:
            final_gallery.append(gal_canon[i])

    rewrite_yaml(gid, hero_canon, final_gallery)
    return "installed {} user images".format(len(user_verified))


def main():
    # Optional: process only specific gems passed as args; else all with user images
    only = [a for a in sys.argv[1:]] if len(sys.argv) > 1 else None
    gem_ids = set()
    for base_dir in [PIC, PIC / "次要", PIC / "几乎补齐", PIC / "新宝石缺图"]:
        if not base_dir.is_dir():
            continue
        for sub in base_dir.iterdir():
            if not sub.is_dir():
                continue
            gid = sub.name.split("_")[0]
            if gid in GEMS:
                gem_ids.add(gid)
    if only:
        gem_ids = {g for g in only if g in GEMS}
    print("gems with user images: {} -> {}".format(len(gem_ids), sorted(gem_ids)))
    for gid in sorted(gem_ids):
        try:
            r = process_gem(gid)
            print("{}: {}".format(gid, r))
        except Exception as e:
            print("{}: ERROR {}".format(gid, e))


if __name__ == "__main__":
    main()