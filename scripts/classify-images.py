#!/usr/bin/env python3
"""GemAtlas image classifier — judge whether an image is a genuine gemstone /
finished jewelry piece, using a vision-capable LLM API.

Reads credentials from env:
  VISION_PROVIDER = openai | gemini | anthropic
  VISION_API_KEY  = the API key for that provider

Classifies each image as:
  - KEEP_MAIN      : a good photo of the gem itself (hero-worthy)
  - KEEP_GALLERY   : related gem / finished-jewelry mounting (gallery-worthy)
  - REJECT         : not the gem at all (person/car/bird/place/software...)

Usage:
  VISION_PROVIDER=openai VISION_API_KEY=sk-... python scripts/classify-images.py
"""
import base64, json, os, sys, time
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "docs" / "images" / "gems"

PROVIDER = os.environ.get("VISION_PROVIDER", "").strip()
KEY = os.environ.get("VISION_API_KEY", "").strip()
# DashScope model id — default qwen3.7-flash (vision-capable)
MODEL_NAME = os.environ.get("VISION_MODEL", "qwen3.7-flash").strip()

# gem id -> canonical English name + zh
GEMS = {
    "ruby": ("Ruby", "红宝石"), "sapphire": ("Sapphire", "蓝宝石"),
    "emerald": ("Emerald", "祖母绿"), "diamond": ("Diamond", "钻石"),
    "alexandrite": ("Alexandrite", "亚历山大石"), "spinel": ("Spinel", "尖晶石"),
    "tanzanite": ("Tanzanite", "坦桑石"), "tsavorite-garnet": ("Tsavorite Garnet", "沙弗莱"),
    "paraiba-tourmaline": ("Paraíba Tourmaline", "帕拉伊巴碧玺"), "opal": ("Opal", "欧泊"),
    "aquamarine": ("Aquamarine", "海蓝宝"), "morganite": ("Morganite", "摩根石"),
    "citrine": ("Citrine", "黄水晶"), "amethyst": ("Amethyst", "紫晶"),
    "peridot": ("Peridot", "橄榄石"), "tourmaline": ("Tourmaline", "碧玺"),
    "iolite": ("Iolite", "堇青石"), "zircon": ("Zircon", "锆石"),
    "topaz": ("Topaz", "黄玉"), "garnet-almandine": ("Almandine Garnet", "铁铝榴石"),
    "garnet-pyrope": ("Pyrope Garnet", "镁铝榴石"), "garnet-spessartine": ("Spessartine Garnet", "锰铝榴石"),
    "garnet-demantoid": ("Demantoid Garnet", "翠榴石"), "jadeite": ("Jadeite", "翡翠"),
    "nephrite": ("Nephrite", "软玉"), "lapis-lazuli": ("Lapis Lazuli", "青金石"),
    "malachite": ("Malachite", "孔雀石"), "rhodochrosite": ("Rhodochrosite", "菱锰矿"),
    "sugilite": ("Sugilite", "苏纪石"), "charoite": ("Charoite", "紫硅碱钙石"),
    "moonstone": ("Moonstone", "月光石"), "rose-quartz": ("Rose Quartz", "粉晶"),
    "tigers-eye": ("Tiger's Eye", "虎眼石"), "labradorite": ("Labradorite", "拉长石"),
    "amazonite": ("Amazonite", "天河石"), "sunstone": ("Sunstone", "太阳石"),
    "smoky-quartz": ("Smoky Quartz", "烟晶"), "rock-crystal": ("Rock Crystal", "水晶"),
    "aventurine-quartz": ("Aventurine Quartz", "东陵石"), "chalcedony": ("Chalcedony", "玉髓"),
    "chrysoprase": ("Chrysoprase", "绿玉髓"), "pyrite": ("Pyrite", "黄铁矿"),
    "quartz-catseye": ("Quartz Cat's-eye", "石英猫眼"), "rhodonite": ("Rhodonite", "蔷薇辉石"),
    "serpentine": ("Serpentine", "蛇纹石"), "sodalite": ("Sodalite", "方钠石"),
    "obsidian": ("Obsidian", "黑曜石"), "chrysoberyl": ("Chrysoberyl", "金绿宝石"),
    "dioptase": ("Dioptase", "透视石"), "prehnite": ("Prehnite", "葡萄石"),
}

import requests

PROMPT_TMPL = (
    "You are auditing gemstone encyclopedia photos. The image is supposed to be "
    "{gem_en} ({gem_zh}, {gem_id}).\n"
    "Look at the image carefully and answer with EXACTLY one word:\n"
    "- MAIN if it shows the gemstone itself (faceted loose stone, rough crystal, "
    "cabochon) as the main subject\n"
    "- GALLERY if it shows the gemstone mounted in finished jewelry (ring, pendant, "
    "earrings, necklace, bracelet) or a related close-up\n"
    "- REJECT if it is NOT the gemstone — a person, animal, place, building, "
    "vehicle, software, other mineral, or anything unrelated.\n"
    "Answer one word only: MAIN / GALLERY / REJECT"
)


def img_b64(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def classify_openai(gem, img_path: Path) -> str:
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT_TMPL.format(**gem)},
                {"type": "image_url", "image_url": {
                    "url": "data:image/jpeg;base64," + img_b64(img_path)}},
            ],
        }],
        "max_tokens": 10,
    }
    r = requests.post("https://api.openai.com/v1/chat/completions",
                      headers={"Authorization": "Bearer " + KEY},
                      json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip().upper()


def classify_gemini(gem, img_path: Path) -> str:
    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT_TMPL.format(**gem)},
                {"inline_data": {"mime_type": "image/jpeg",
                                 "data": img_b64(img_path)}},
            ]
        }],
    }
    r = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        params={"key": KEY}, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip().upper()


def classify_anthropic(gem, img_path: Path) -> str:
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 10,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT_TMPL.format(**gem)},
                {"type": "image", "source": {
                    "type": "base64", "media_type": "image/jpeg",
                    "data": img_b64(img_path)}},
            ],
        }],
    }
    r = requests.post("https://api.anthropic.com/v1/messages",
                      headers={"x-api-key": KEY,
                               "anthropic-version": "2023-06-01"},
                      json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["content"][0]["text"].strip().upper()


def classify(gem, img_path: Path) -> str:
    if PROVIDER == "openai":
        return classify_openai(gem, img_path)
    if PROVIDER == "gemini":
        return classify_gemini(gem, img_path)
    if PROVIDER == "anthropic":
        return classify_anthropic(gem, img_path)
    if PROVIDER == "dashscope":
        return classify_dashscope(gem, img_path)
    raise SystemExit("VISION_PROVIDER must be openai | gemini | anthropic | dashscope")


def classify_dashscope(gem, img_path: Path) -> str:
    """Alibaba Cloud Bailian (百炼 / DashScope) — OpenAI-compatible endpoint.
    Uses Qwen-VL which is excellent at image understanding and requires no VPN
    from mainland China.
    """
    payload = {
        "model": MODEL_NAME,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT_TMPL.format(**gem)},
                {"type": "image_url", "image_url": {
                    "url": "data:image/jpeg;base64," + img_b64(img_path)}},
            ],
        }],
        "max_tokens": 10,
    }
    r = requests.post(
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        headers={"Authorization": "Bearer " + KEY,
                 "Content-Type": "application/json"},
        json=payload, timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip().upper()


def main():
    if not KEY:
        print("Set VISION_API_KEY first.")
        print("  VISION_PROVIDER=openai VISION_API_KEY=sk-... python scripts/classify-images.py")
        sys.exit(1)
    # Load previous report for incremental mode (skip already-classified).
    report_path = BASE / "docs" / "vision-report.json"
    prev = {}
    if report_path.exists():
        try:
            prev = json.loads(report_path.read_text(encoding="utf-8"))
        except Exception:
            prev = {}
    print("Provider: {}".format(PROVIDER))
    print("Classifying real images under docs/images/gems/ (incremental)...\n")

    results = {}  # gem -> {path: verdict}
    total = 0
    for gd in sorted(IMG.iterdir()):
        if not gd.is_dir() or gd.name not in GEMS:
            continue
        gem = {"gem_en": GEMS[gd.name][0], "gem_zh": GEMS[gd.name][1], "gem_id": gd.name}
        for f in sorted(gd.iterdir()):
            if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
                continue
            if f.stat().st_size <= 1024:
                continue
            # Skip if already classified with a real verdict
            existing = prev.get(gd.name, {}).get(f.name, "")
            if existing in ("MAIN", "GALLERY", "REJECT"):
                results.setdefault(gd.name, {})[f.name] = existing
                continue
            total += 1
            try:
                v = classify(gem, f)
            except Exception as e:
                v = "ERROR:" + str(e)[:80]
            results.setdefault(gd.name, {})[f.name] = v
            print("{:18s} {:32s} {}".format(gd.name, f.name, v))
            time.sleep(0.3)

    # Merge with previous report so cleanup sees all verdicts.
    for gid, files in prev.items():
        results.setdefault(gid, {}).update(files)
    out = report_path
    out.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\nClassified {} new images. Report -> {}".format(total, out))


if __name__ == "__main__":
    main()