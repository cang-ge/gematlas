#!/usr/bin/env python3
"""Classify locally-staged gem photos via vision model.

Reads from docs/images/gems/<gem>/_incoming/, classifies each image, and
writes verdicts to a small JSON. Then moves the best images into the
main <gem>/ dir with clean names and updates the YAML.
"""
import json, shutil, time
from pathlib import Path
from PIL import Image
import requests
import os

BASE = Path(r"D:/Study/gematlas")
IMG = BASE / "docs/images/gems"
YML = BASE / "data/gems/v1"
REPORT_PATH = BASE / "docs/vision-report.json"

# Credentials via env vars (never hardcoded). See classify-images.py for the
# standard VISION_PROVIDER / VISION_API_KEY convention.
KEY = os.environ.get("VISION_API_KEY", "").strip()
MODEL = os.environ.get("VISION_MODEL", "qwen3-vl-plus").strip()
URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

PROMPT = (
    "You are auditing gemstone encyclopedia photos. The image is supposed to be "
    "{gem_en} ({gem_zh}, {gem_id}).\n"
    "Look at the image carefully. If it is NOT this gemstone (a person, animal, "
    "place, building, vehicle, software, a different mineral, or anything "
    "unrelated), answer REJECT.\n"
    "If it IS this gemstone, answer with EXACTLY one word:\n"
    "- JEWELRY (mounted in finished jewelry: ring, pendant, necklace, earrings, "
    "bracelet, brooch, cufflinks)\n"
    "- CUT (loose cut/faceted stone or cabochon, not mounted)\n"
    "- MINERAL (rough mineral specimen, crystal, cluster, geode, ore, or uncut rough)\n"
    "Answer exactly one word: JEWELRY / CUT / MINERAL / REJECT"
)

GEMS = {
    "amazonite": ("Amazonite", "天河石"),
    "chalcedony": ("Chalcedony", "玉髓"),
    "dioptase": ("Dioptase", "透视石"),
    "garnet-demantoid": ("Demantoid Garnet", "翠榴石"),
    "serpentine": ("Serpentine", "蛇纹石"),
    "sugilite": ("Sugilite", "苏纪石"),
    "tsavorite-garnet": ("Tsavorite Garnet", "沙弗莱"),
}


def classify(gem_en, gem_zh, gem_id, img_path):
    with open(img_path, "rb") as f:
        b64 = __import__("base64").b64encode(f.read()).decode()
    prompt = PROMPT.format(gem_en=gem_en, gem_zh=gem_zh, gem_id=gem_id)
    r = requests.post(URL,
                      headers={"Authorization": "Bearer " + KEY},
                      json={"model": MODEL,
                            "messages": [{"role": "user",
                                          "content": [
                                              {"type": "text", "text": prompt},
                                              {"type": "image_url",
                                               "image_url": {"url": "data:image/jpeg;base64," + b64}}]}],
                            "max_tokens": 20},
                      timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip().upper()


def main():
    # Load existing report
    report = {}
    if REPORT_PATH.exists():
        try:
            report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
        except Exception:
            report = {}

    verdicts = {}
    for gid, (en, zh) in GEMS.items():
        gd = IMG / gid
        inc = gd / "_incoming"
        if not inc.is_dir():
            print("{}: no _incoming, skip".format(gid))
            continue
        files = sorted([f for f in inc.iterdir()
                        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
                        and f.stat().st_size > 1024])
        if not files:
            print("{}: no files".format(gid))
            continue
        print("--- {} ({} files) ---".format(gid, len(files)))
        verdicts[gid] = {}
        for f in files:
            for attempt in range(3):
                try:
                    v = classify(en, zh, gid, f)
                    verdicts[gid][f.name] = v
                    report.setdefault(gid, {})[f.name] = v
                    print("  {} -> {}".format(f.name, v))
                    break
                except Exception as e:
                    if attempt == 2:
                        verdicts[gid][f.name] = "ERROR"
                        print("  {} -> FAIL: {}".format(f.name, str(e)[:60]))
                    time.sleep(3)

    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\nreport updated")


if __name__ == "__main__":
    main()