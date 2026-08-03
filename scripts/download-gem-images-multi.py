#!/usr/bin/env python3
"""
GemAtlas gemstone image downloader — multi-source, fail-safe.

Source chain (tries each; first success wins):
  1. Wikimedia Commons  — main, has API, full coverage for common gems
  2. Pixabay API        — fallback, needs PIXABAY_KEY env var
  3. Smithsonian NMNH   — placeholder (browser-only, no API)
  4. Mindat.org         — placeholder (HTML scrape, brittle)

Safety:
  - Auto-backup of every YAML before first edit (data/gems/v1/{id}.yaml.bak)
  - Atomic YAML writes (tmp + os.replace)
  - Real image = >1KB; placeholders ignored for skip-detection
  - Idempotent: skips gems with >= 4 real images
  - On all-source failure: generates a colored SVG placeholder (3-5KB)

Usage:
  python scripts/download-gem-images-multi.py
  PIXABAY_KEY=xxx python scripts/download-gem-images-multi.py
"""
import json, os, re, sys, time, urllib.parse, shutil, hashlib
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

BASE = Path(__file__).resolve().parent.parent
OUT  = BASE / "docs" / "images" / "gems"
YML  = BASE / "data" / "gems" / "v1"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
PAUSE_BATCH = 20  # seconds between batches
SKIP_N = 4        # 1 main + 3 gallery

# Minimal gem metadata: id -> (en, zh, hardness, dominant color)
# Used as final fallback for SVG placeholder AND search query fallback.
GEMS = {
    "ruby":               ("Ruby",               "红宝石",   9, "#9B111E"),
    "sapphire":           ("Sapphire",           "蓝宝石",   9, "#0F52BA"),
    "emerald":            ("Emerald",            "祖母绿",   7.75, "#50C878"),
    "diamond":            ("Diamond",            "钻石",     10, "#B9F2FF"),
    "alexandrite":        ("Alexandrite",        "亚历山大石", 8.5, "#9DCDB1"),
    "spinel":             ("Spinel",             "尖晶石",   8, "#FFB6C1"),
    "tanzanite":          ("Tanzanite",          "坦桑石",   6.75, "#4169E1"),
    "tsavorite-garnet":   ("Tsavorite Garnet",   "沙弗莱",   7.25, "#00C957"),
    "paraiba-tourmaline": ("Paraíba Tourmaline", "帕拉伊巴碧玺", 7.25, "#00FFFF"),
    "opal":               ("Opal",               "欧泊",     6, "#A8C3BC"),
    "aquamarine":         ("Aquamarine",         "海蓝宝",   7.75, "#7FFFD4"),
    "morganite":          ("Morganite",          "摩根石",   7.75, "#FFB6C1"),
    "citrine":            ("Citrine",            "黄水晶",   7, "#E4D00A"),
    "amethyst":           ("Amethyst",           "紫晶",     7, "#9966CC"),
    "peridot":            ("Peridot",            "橄榄石",   6.75, "#9AB973"),
    "tourmaline":         ("Tourmaline",         "碧玺",     7.25, "#88497C"),
    "iolite":             ("Iolite",             "堇青石",   7.25, "#4B0082"),
    "zircon":             ("Zircon",             "锆石",     7.25, "#FFE4B5"),
    "topaz":              ("Topaz",              "黄玉",     8, "#FFC87C"),
    "garnet-almandine":   ("Almandine Garnet",   "铁铝榴石", 7.25, "#7B1113"),
    "garnet-pyrope":      ("Pyrope Garnet",      "镁铝榴石", 7.25, "#B22222"),
    "garnet-spessartine": ("Spessartine Garnet", "锰铝榴石", 7.25, "#E2725B"),
    "garnet-demantoid":   ("Demantoid Garnet",   "翠榴石",   6.5, "#4F9D69"),
    "jadeite":            ("Jadeite",            "翡翠",     7, "#00A86B"),
    "nephrite":           ("Nephrite",           "软玉",     6.25, "#8A9A5B"),
    "lapis-lazuli":       ("Lapis Lazuli",       "青金石",   5.5, "#26619C"),
    "malachite":          ("Malachite",          "孔雀石",   4, "#0BDA51"),
    "rhodochrosite":      ("Rhodochrosite",      "菱锰矿",   4, "#F3C1B5"),
    "sugilite":           ("Sugilite",           "苏纪石",   6.5, "#6A0DAD"),
    "charoite":           ("Charoite",           "紫硅碱钙石", 5.5, "#7B3F99"),
    "moonstone":          ("Moonstone",          "月光石",   6.25, "#C4C4C4"),
    "rose-quartz":        ("Rose Quartz",        "粉晶",     7, "#F7CAC9"),
    "tigers-eye":         ("Tiger's Eye",        "虎眼石",   7, "#B8860B"),
    "labradorite":        ("Labradorite",        "拉长石",   6.25, "#4F4E48"),
    "amazonite":          ("Amazonite",          "天河石",   6.25, "#7CB9E8"),
    "sunstone":           ("Sunstone",           "太阳石",   6.25, "#E97451"),
    "smoky-quartz":       ("Smoky Quartz",       "烟晶",     7, "#696969"),
    "rock-crystal":       ("Rock Crystal",       "水晶",     7, "#E6E6FA"),
    "aventurine-quartz":  ("Aventurine Quartz",  "东陵石",   7, "#56887D"),
    "chalcedony":         ("Chalcedony",         "玉髓",     7, "#A9A9A9"),
    "chrysoprase":        ("Chrysoprase",        "绿玉髓",   7, "#7FFFD4"),
    "pyrite":             ("Pyrite",             "黄铁矿",   6.5, "#DAA520"),
    "quartz-catseye":     ("Quartz Cat's-eye",   "石英猫眼", 7, "#BDB76B"),
    "rhodonite":          ("Rhodonite",          "蔷薇辉石", 6.25, "#E2725B"),
    "serpentine":         ("Serpentine",         "蛇纹石",   4.5, "#9ACD32"),
    "sodalite":           ("Sodalite",           "方钠石",   6, "#2F4F8F"),
    "obsidian":           ("Obsidian",           "黑曜石",   5.5, "#1A1A1A"),
    "chrysoberyl":        ("Chrysoberyl",        "金绿宝石", 8.5, "#D4AF37"),
    "dioptase":           ("Dioptase",           "透视石",   5.5, "#16A085"),
    "prehnite":           ("Prehnite",           "葡萄石",   6.25, "#A8D8A8"),
}

# Per-gem alternative search queries for stubborn entries.
# Default uses `en` from GEMS; if first attempt fails, these are tried in order.
ALT_QUERIES = {
    "citrine":         ["Citrine quartz gem", "Yellow quartz crystal", "Citrine gemstone faceted"],
    "prehnite":        ["Prehnite gemstone", "Prehnite mineral green", "Prehnite cabochon"],
    "quartz-catseye":  ["Quartz cat's eye gemstone", "Cat's eye quartz cabochon", "Chrysoberyl cat eye"],
}

# Jewelry product terms — tried ONLY in the fallback pass, after standard
# gemstone queries fail to fill a slot. Biases replacement images toward
# finished jewelry (rings / pendants / earrings) instead of rough specimens.
JEWELRY_TERMS = ["ring", "pendant", "jewelry", "earrings"]

# ─── HTTP session ──────────────────────────────────────────────
S = requests.Session()
S.headers.update({
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://commons.wikimedia.org/",
})
PIXABAY_KEY = os.environ.get("PIXABAY_KEY", "").strip()
if os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY"):
    print("Proxy: {} / {}".format(
        os.environ.get("HTTPS_PROXY"), os.environ.get("HTTP_PROXY")))
else:
    print("Proxy: none (direct connection)")
print("Pixabay: {}".format("enabled" if PIXABAY_KEY else "no key (skipped)"))
print()

# ─── Source 1: Wikimedia Commons ───────────────────────────────
# Backoff state per-gem for 429 (Wikimedia rate-limit honors per-actor).
_last_429_per_gem = {}

def wiki_search(gid: str, query: str, limit: int = 6):
    """Returns list of dicts {title, url, ext} or []."""
    out = []
    # If this gem hit 429 recently, skip to avoid hammering
    last = _last_429_per_gem.get(gid, 0)
    if time.time() - last < 30:
        return []
    try:
        r = S.get("https://commons.wikimedia.org/w/api.php", params={
            "action": "query", "list": "search",
            "srsearch": query + " filetype:bitmap",
            "srnamespace": "6", "format": "json", "srlimit": limit,
        }, timeout=6)
        if r.status_code == 429:
            _last_429_per_gem[gid] = time.time()
            print("  429 on search ({}) — backing off 30s".format(gid))
            return []
        r.raise_for_status()
        results = r.json().get("query", {}).get("search", [])
    except Exception as e:
        if "429" in str(e):
            _last_429_per_gem[gid] = time.time()
        print("  wiki search err: {}".format(e))
        return []

    for item in results[:limit]:
        title = item.get("title", "").replace("File:", "")
        try:
            r2 = S.get("https://commons.wikimedia.org/w/api.php", params={
                "action": "query", "titles": "File:" + title,
                "prop": "imageinfo", "iiprop": "url",
                "iiurlwidth": 800, "format": "json",
            }, timeout=4)
            if r2.status_code == 429:
                _last_429_per_gem[gid] = time.time()
                continue
            for p in r2.json().get("query", {}).get("pages", {}).values():
                info = p.get("imageinfo", [])
                if info:
                    url = info[0].get("thumburl") or info[0].get("url")
                    if url:
                        out.append({"url": url, "title": title})
        except Exception:
            pass
    return out

# ─── Source 1b: Wikimedia Commons (Category API) ────────────────
# Categories are curated — every file inside is a known gem image.
# This is FAR safer than full-text srsearch, which returns ruby-the-programmer
# or sapphire-the-vintage-car.
# Priority order: finished-jewelry categories first (user wants mounting shots),
# then mineral/gemstone categories, then broad gem categories.
def wiki_category(gid: str, query: str, limit: int = 8):
    """Returns image URLs from curated Wikimedia categories.
    Tries finished-jewelry categories first (rings / jewellery), then
    gemstone categories, then broad Gemstones / Faceted gems.
    """
    out = []
    en = GEMS[gid][0]  # clean English name for category construction
    last = _last_429_per_gem.get(gid, 0)
    if time.time() - last < 30:
        return []
    # Jewelry-first category order — mounting / finished-product shots.
    cats = [
        "Category:{} in jewellery".format(en),
        "Category:{} jewellery".format(en),
        "Category:{} rings".format(en),
        "Category:{} (gemstone)".format(en),
        "Category:{}".format(en),
        "Category:Gemstones",
        "Category:Faceted gems",
    ]
    for cat in cats:
        try:
            r = S.get("https://commons.wikimedia.org/w/api.php", params={
                "action": "query", "list": "categorymembers",
                "cmtitle": cat, "cmtype": "file",
                "cmlimit": limit, "format": "json",
            }, timeout=6)
            if r.status_code == 429:
                _last_429_per_gem[gid] = time.time()
                print("  429 on category ({})".format(gid))
                return []
            r.raise_for_status()
            members = r.json().get("query", {}).get("categorymembers", [])
        except Exception as e:
            members = []
        if not members:
            continue
        for m in members[:limit]:
            title = m.get("title", "").replace("File:", "")
            try:
                r2 = S.get("https://commons.wikimedia.org/w/api.php", params={
                    "action": "query", "titles": "File:" + title,
                    "prop": "imageinfo", "iiprop": "url",
                    "iiurlwidth": 800, "format": "json",
                }, timeout=4)
                if r2.status_code == 429:
                    _last_429_per_gem[gid] = time.time()
                    continue
                for p in r2.json().get("query", {}).get("pages", {}).values():
                    info = p.get("imageinfo", [])
                    if info:
                        url = info[0].get("thumburl") or info[0].get("url")
                        if url:
                            out.append({"url": url, "title": title})
            except Exception:
                pass
        if out:
            break  # found images in this category
    return out

# ─── Source 2: Pixabay ─────────────────────────────────────────
def pixabay_search(gid: str, query: str, limit: int = 6):
    if not PIXABAY_KEY:
        return []
    try:
        r = S.get("https://pixabay.com/api/", params={
            "key": PIXABAY_KEY,
            "q": "gemstone " + query,
            "image_type": "photo",
            "per_page": limit,
            "safesearch": "true",
        }, timeout=10)
        r.raise_for_status()
        hits = r.json().get("hits", [])
        return [{"url": h.get("webformatURL") or h.get("largeImageURL"),
                 "title": h.get("tags", "")} for h in hits if h.get("webformatURL")]
    except Exception as e:
        print("  pixabay err: {}".format(e))
        return []

# ─── Source 3: Openverse (aggregates Flickr/Wikimedia CC images) ──
def openverse_search(gid: str, query: str, limit: int = 6):
    """Openverse free API — CC-licensed images from Flickr, Wikimedia, etc."""
    out = []
    try:
        r = S.get("https://api.openverse.org/v1/images/", params={
            "q": query + " gemstone",
            "license_type": "commercial",
            "page_size": limit,
            "mature": "false",
        }, timeout=10)
        r.raise_for_status()
        for item in r.json().get("results", []):
            url = item.get("url") or item.get("thumbnail")
            if url:
                out.append({"url": url, "title": item.get("title", "")})
    except Exception as e:
        print("  openverse err: {}".format(e))
        return []
    return out

# ─── Source 4 / 5: placeholders for future use ─────────────────
def smithsonian_search(gid: str, query: str, limit: int = 4):
    """Placeholder — Smithsonian has no public search API."""
    return []

def mindat_search(gid: str, query: str, limit: int = 4):
    """Placeholder — Mindat requires scraping; left for future work."""
    return []

SOURCES = [
    ("Wikimedia-Cat", wiki_category),  # safer: curated categories
    ("Wikimedia",     wiki_search),    # fallback: full-text search
    ("Openverse",     openverse_search),
    ("Pixabay",       pixabay_search),
    ("Smithsonian",   smithsonian_search),
    ("Mindat",        mindat_search),
]

# ─── File I/O helpers ──────────────────────────────────────────
def real_image_count(gid: str) -> int:
    """Count real (non-placeholder) image files in docs/images/gems/{id}/.
    SVG placeholders are 1.2KB; real SVGs are >3KB; real JPG/PNG/WEBP are >1KB.
    """
    gd = OUT / gid
    if not gd.exists():
        return 0
    n = 0
    for f in gd.iterdir():
        try:
            sz = f.stat().st_size
        except OSError:
            continue
        ext = f.suffix.lower()
        if ext in (".png", ".webp", ".jpg", ".jpeg", ".gif"):
            if sz > 1024:
                n += 1
        elif ext == ".svg":
            if sz > 3000:
                n += 1
    return n

def dload(url: str, dest: Path) -> bool:
    """Download URL → dest. Detects file format from magic bytes and
    fixes the suffix so the browser / VitePress picks the right MIME type.

    Returns True if the saved file is a valid image and >1KB.
    """
    raw = bytearray()
    for attempt in range(2):
        try:
            r = S.get(url, stream=True, timeout=8)
            r.raise_for_status()
            if r.status_code == 429:
                # Wikimedia rate-limit — back off and retry once
                time.sleep(3)
                if attempt == 1:
                    return False
                continue
            for chunk in r.iter_content(8192):
                if chunk:
                    raw.extend(chunk)
            # Detect format from magic bytes
            ext = ".img"
            if raw[:3] == b"\xff\xd8\xff":
                ext = ".jpg"
            elif raw[:8] == b"\x89PNG\r\n\x1a\n":
                ext = ".png"
            elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
                ext = ".webp"
            elif raw[:4] == b"GIF8":
                ext = ".gif"
            elif raw[:5] == b"<?xml" or raw[:4] == b"<svg":
                ext = ".svg"
            # Replace suffix to match detected content
            correct_dest = dest.with_suffix(ext)
            # Perceptual-hash dedup: skip if visually identical to existing
            # image in the same directory.
            if ext in (".jpg", ".png", ".webp", ".gif"):
                try:
                    from imagehash import phash
                    from PIL import Image
                    new_hash = phash(Image.open(__import__("io").BytesIO(bytes(raw))))
                    dest_dir = correct_dest.parent
                    for existing in dest_dir.iterdir():
                        if (existing == correct_dest
                            or not existing.is_file()
                            or existing.suffix.lower() not in (".jpg", ".png", ".webp", ".gif")):
                            continue
                        try:
                            eh = phash(Image.open(existing))
                            if new_hash - eh <= 5:
                                # Duplicate — discard the download
                                return False
                        except Exception:
                            pass
                except Exception:
                    pass  # dedup is best-effort
            correct_dest.write_bytes(bytes(raw))
            if correct_dest.stat().st_size > 1024:
                # If a stale wrong-suffix file exists at `dest`, remove it
                if correct_dest != dest and dest.exists():
                    try:
                        dest.unlink()
                    except OSError:
                        pass
                return True
            correct_dest.unlink(missing_ok=True)
            return False
        except Exception as e:
            if attempt == 1:
                return False
            time.sleep(0.5)
    return False

def svg_placeholder(dest: Path, en: str, zh: str, hardness: float, color: str):
    """Write a colored SVG with gem name + hardness. Always >1KB."""
    svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="60%">
      <stop offset="0%"  stop-color="{color}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="{color}" stop-opacity="0.45"/>
    </radialGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="#1a1814"/>
  <ellipse cx="400" cy="300" rx="280" ry="200" fill="url(#g)"/>
  <ellipse cx="400" cy="300" rx="280" ry="200" fill="url(#shine)"/>
  <text x="400" y="290" text-anchor="middle"
        font-family="Cormorant Garamond, Georgia, serif"
        font-size="64" font-weight="600" fill="#fff8e7">{en}</text>
  <text x="400" y="350" text-anchor="middle"
        font-family="Noto Serif SC, serif"
        font-size="36" fill="#d6cdb8">{zh}</text>
  <text x="400" y="430" text-anchor="middle"
        font-family="Inter, sans-serif"
        font-size="22" fill="#a89e8a">Mohs {hardness} · GemAtlas placeholder</text>
</svg>
'''.format(color=color, en=en, zh=zh, hardness=hardness)
    dest.write_text(svg, encoding="utf-8")

# ─── YAML safety ───────────────────────────────────────────────
def yaml_backup(gid: str) -> Path:
    """Create .bak on first encounter; return its path (may not exist if already done)."""
    src = YML / "{}.yaml".format(gid)
    bak = YML / "{}.yaml.bak".format(gid)
    if src.exists() and not bak.exists():
        bak.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
    return bak

def yaml_set_images(gid: str, main: str, gallery: list):
    """Atomic YAML write of `images:` block. Preserves all other content."""
    yaml_path = YML / "{}.yaml".format(gid)
    if not yaml_path.exists():
        return False
    yaml_backup(gid)
    txt = yaml_path.read_text(encoding="utf-8")
    # Strip any pre-existing images: block to keep idempotent
    txt = re.sub(r"\nimages:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n*$", "\n", txt)
    gal_str = ", ".join(gallery)
    block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(main, gal_str)
    tmp = yaml_path.with_suffix(".yaml.tmp")
    tmp.write_text(txt.rstrip() + block, encoding="utf-8")
    os.replace(tmp, yaml_path)
    return True

# ─── Main per-gem flow ─────────────────────────────────────────
def fetch_gem(gid: str) -> bool:
    """Try source chain. Return True if any real images downloaded."""
    en, zh, hardness, color = GEMS[gid]
    gd = OUT / gid
    gd.mkdir(parents=True, exist_ok=True)
    targets = [
        (gd / "{}.svg".format(gid),                              "main"),
        (gd / "{}-gallery-1.svg".format(gid),                    "g1"),
        (gd / "{}-gallery-2.svg".format(gid),                    "g2"),
        (gd / "{}-gallery-3.svg".format(gid),                    "g3"),
    ]
    # Detect existing real images in dir. A real image must NOT be an SVG
    # placeholder (only >1KB SVG placeholders would otherwise pass the count).
    existing = {}
    for f in gd.iterdir():
        if f.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg", ".gif"):
            # JPG/PNG/WEBP from Wikimedia = real image
            if f.stat().st_size > 1024:
                for slot_path, slot_label in targets:
                    if f.stem == slot_path.stem:
                        existing[slot_label] = f.name
        elif f.suffix.lower() == ".svg":
            # SVG: only count if very large (>3KB = real SVG vector, not placeholder)
            if f.stat().st_size > 3000:
                for slot_path, slot_label in targets:
                    if f.stem == slot_path.stem:
                        existing[slot_label] = f.name
    # If all 4 slots already have real images, skip whole gem
    if len(existing) >= SKIP_N:
        return True

    downloaded = list(existing.values())

    # Build search query list: alt queries first (more specific), then default.
    queries = []
    if gid in ALT_QUERIES:
        queries.extend(ALT_QUERIES[gid])
    queries.append(en)
    # Jewelry-product queries only in the fallback pass (after standard ones
    # fail). Biases replacement images toward finished jewelry.
    fallback_queries = queries + [en + " " + t for t in JEWELRY_TERMS]

    # Pool of candidate URLs from all sources (tried in order).
    candidate_urls = []
    for q in queries:
        for src_name, fn in SOURCES:
            try:
                urls = fn(gid, q, SKIP_N)
            except Exception as e:
                print("  {} err: {}".format(src_name, e))
                urls = []
            for u in urls:
                candidate_urls.append((src_name, u))

    url_iter = iter(candidate_urls)
    for slot, (path, _label) in enumerate(targets):
        if _label in existing:
            continue
        # Walk candidate URLs until one yields a working download
        found = False
        # Remember where we left off in candidate list across slots
        while True:
            try:
                src_name, u = next(url_iter)
            except StopIteration:
                break
            if dload(u["url"], path):
                stem = path.stem
                actual = None
                for ext in (".jpg", ".png", ".webp", ".gif", ".svg"):
                    cand = path.with_suffix(ext)
                    if cand.exists() and cand.stat().st_size > 1024:
                        actual = cand.name
                        break
                downloaded.append(actual or path.name)
                found = True
                break
            time.sleep(0.3)
        if not found:
            for src_name, fn in SOURCES:
                for q in fallback_queries:
                    try:
                        extra = fn(gid, q, SKIP_N)
                    except Exception:
                        extra = []
                    for u in extra:
                        if dload(u["url"], path):
                            stem = path.stem
                            actual = None
                            for ext in (".jpg", ".png", ".webp", ".gif", ".svg"):
                                cand = path.with_suffix(ext)
                                if cand.exists() and cand.stat().st_size > 1024:
                                    actual = cand.name
                                    break
                            downloaded.append(actual or path.name)
                            found = True
                            break
                    if found:
                        break
                if found:
                    break
            if not found:
                # SVG placeholder as last resort
                svg_placeholder(path, en, zh, hardness, color)
                downloaded.append(path.name)
                time.sleep(0.3)

    if downloaded:
        yaml_set_images(gid, downloaded[0], downloaded[1:])
        return True
    return False

def main():
    items = list(GEMS.keys())
    total = len(items)
    # Skip gems already complete
    start = 0
    for i, gid in enumerate(items):
        if real_image_count(gid) >= SKIP_N:
            start = i + 1
        else:
            break
    print("Starting from gem #{}/{} ({} done)".format(start + 1, total, start))
    BATCH = 5
    for bs in range(start, total, BATCH):
        be = min(bs + BATCH, total)
        batch = items[bs:be]
        for i, gid in enumerate(batch, bs + 1):
            print("[{}/{}] {}".format(i, total, gid))
            try:
                ok = fetch_gem(gid)
                if not ok:
                    print("  -> no source produced images")
            except Exception as e:
                print("  !! exception: {}".format(e))
            time.sleep(2)
        if be < total:
            print("~ batch {}/{} done, waiting {}s ~".format(be, total, PAUSE_BATCH))
            time.sleep(PAUSE_BATCH)
    print("\nDone. Run: pnpm generate:pages ; pnpm build")

if __name__ == "__main__":
    main()