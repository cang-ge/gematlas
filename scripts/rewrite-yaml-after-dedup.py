#!/usr/bin/env python3
"""Rewrite YAML images: block to reference only existing files.

For each gem with deleted images, rewrite the YAML images: main + gallery
to list only files that actually exist on disk. Missing slots are
filled with SVG placeholders so YAML always has 4 entries.
"""
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "docs" / "images" / "gems"
YML = BASE / "data" / "gems" / "v1"

# gem id → display info for SVG placeholder
GEMS = {
    "ruby": ("Ruby", "红宝石", 9, "#9B111E"),
    "sapphire": ("Sapphire", "蓝宝石", 9, "#0F52BA"),
    "emerald": ("Emerald", "祖母绿", 7.75, "#50C878"),
    "diamond": ("Diamond", "钻石", 10, "#B9F2FF"),
    "alexandrite": ("Alexandrite", "亚历山大石", 8.5, "#9DCDB1"),
    "spinel": ("Spinel", "尖晶石", 8, "#FFB6C1"),
    "tanzanite": ("Tanzanite", "坦桑石", 6.75, "#4169E1"),
    "tsavorite-garnet": ("Tsavorite Garnet", "沙弗莱", 7.25, "#00C957"),
    "paraiba-tourmaline": ("Paraíba Tourmaline", "帕拉伊巴碧玺", 7.25, "#00FFFF"),
    "opal": ("Opal", "欧泊", 6, "#A8C3BC"),
    "aquamarine": ("Aquamarine", "海蓝宝", 7.75, "#7FFFD4"),
    "morganite": ("Morganite", "摩根石", 7.75, "#FFB6C1"),
    "citrine": ("Citrine", "黄水晶", 7, "#E4D00A"),
    "amethyst": ("Amethyst", "紫晶", 7, "#9966CC"),
    "peridot": ("Peridot", "橄榄石", 6.75, "#9AB973"),
    "tourmaline": ("Tourmaline", "碧玺", 7.25, "#88497C"),
    "iolite": ("Iolite", "堇青石", 7.25, "#4B0082"),
    "zircon": ("Zircon", "锆石", 7.25, "#FFE4B5"),
    "topaz": ("Topaz", "黄玉", 8, "#FFC87C"),
    "garnet-almandine": ("Almandine Garnet", "铁铝榴石", 7.25, "#7B1113"),
    "garnet-pyrope": ("Pyrope Garnet", "镁铝榴石", 7.25, "#B22222"),
    "garnet-spessartine": ("Spessartine Garnet", "锰铝榴石", 7.25, "#E2725B"),
    "garnet-demantoid": ("Demantoid Garnet", "翠榴石", 6.5, "#4F9D69"),
    "jadeite": ("Jadeite", "翡翠", 7, "#00A86B"),
    "nephrite": ("Nephrite", "软玉", 6.25, "#8A9A5B"),
    "lapis-lazuli": ("Lapis Lazuli", "青金石", 5.5, "#26619C"),
    "malachite": ("Malachite", "孔雀石", 4, "#0BDA51"),
    "rhodochrosite": ("Rhodochrosite", "菱锰矿", 4, "#F3C1B5"),
    "sugilite": ("Sugilite", "苏纪石", 6.5, "#6A0DAD"),
    "charoite": ("Charoite", "紫硅碱钙石", 5.5, "#7B3F99"),
    "moonstone": ("Moonstone", "月光石", 6.25, "#C4C4C4"),
    "rose-quartz": ("Rose Quartz", "粉晶", 7, "#F7CAC9"),
    "tigers-eye": ("Tiger's Eye", "虎眼石", 7, "#B8860B"),
    "labradorite": ("Labradorite", "拉长石", 6.25, "#4F4E48"),
    "amazonite": ("Amazonite", "天河石", 6.25, "#7CB9E8"),
    "sunstone": ("Sunstone", "太阳石", 6.25, "#E97451"),
    "smoky-quartz": ("Smoky Quartz", "烟晶", 7, "#696969"),
    "rock-crystal": ("Rock Crystal", "水晶", 7, "#E6E6FA"),
    "aventurine-quartz": ("Aventurine Quartz", "东陵石", 7, "#56887D"),
    "chalcedony": ("Chalcedony", "玉髓", 7, "#A9A9A9"),
    "chrysoprase": ("Chrysoprase", "绿玉髓", 7, "#7FFFD4"),
    "pyrite": ("Pyrite", "黄铁矿", 6.5, "#DAA520"),
    "quartz-catseye": ("Quartz Cat's-eye", "石英猫眼", 7, "#BDB76B"),
    "rhodonite": ("Rhodonite", "蔷薇辉石", 6.25, "#E2725B"),
    "serpentine": ("Serpentine", "蛇纹石", 4.5, "#9ACD32"),
    "sodalite": ("Sodalite", "方钠石", 6, "#2F4F8F"),
    "obsidian": ("Obsidian", "黑曜石", 5.5, "#1A1A1A"),
    "chrysoberyl": ("Chrysoberyl", "金绿宝石", 8.5, "#D4AF37"),
    "dioptase": ("Dioptase", "透视石", 5.5, "#16A085"),
    "prehnite": ("Prehnite", "葡萄石", 6.25, "#A8D8A8"),
}


def svg_placeholder(gd: Path, en: str, zh: str, hardness: float, color: str, slot_name: str):
    """Write SVG placeholder if not present."""
    path = gd / slot_name
    if path.exists() and path.stat().st_size > 3000:
        return  # already has real SVG
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
    path.write_text(svg, encoding="utf-8")


def rewrite_yaml(gid: str, real_files: list, gallery: list, has_svg_fallback: bool):
    """Update YAML images: block."""
    yml = YML / "{}.yaml".format(gid)
    if not yml.exists():
        return
    txt = yml.read_text(encoding="utf-8")
    import re
    # Match images: block anchored to start of line, allowing trailing
    # newlines but not greedy-eating into preceding text.
    txt = re.sub(r"(?m)^images:\n  main: [^\n]+\n  gallery: \[[^\]]*\]\n(?=\n|$|\Z)", "\n", txt)
    # If no newline before images:, ensure one
    if "images:" in txt and not txt.startswith("\nimages:"):
        pass  # rewriting below
    block = "\nimages:\n  main: {}\n  gallery: [{}]\n".format(real_files[0], ", ".join(gallery))
    tmp = yml.with_suffix(".yaml.tmp")
    tmp.write_text(txt.rstrip() + block, encoding="utf-8")
    tmp.replace(yml)


def main():
    # Expected slot names per gem
    fixed = 0
    for gid, (en, zh, hardness, color) in GEMS.items():
        gd = IMG / gid
        if not gd.exists():
            continue
        # What real images exist?
        real = sorted([p.name for p in gd.iterdir()
                       if p.is_file() and p.suffix.lower() in (".jpg", ".png", ".webp")
                       and p.stat().st_size > 1024])
        if not real:
            # No real images at all — skip, will be handled by downloader
            continue
        # Prefer main name for main slot
        main_name = next((n for n in real if "-gallery-" not in n), real[0])
        gallery_names = [n for n in real if n != main_name]
        # Fill remaining slots with SVG placeholders if fewer than 4
        while len(gallery_names) < 3:
            slot = "{}-gallery-{}.svg".format(gid, len(gallery_names) + 1)
            svg_placeholder(gd, en, zh, hardness, color, slot)
            gallery_names.append(slot)
        rewrite_yaml(gid, [main_name], gallery_names, has_svg_fallback=True)
        fixed += 1
    print(f"YAML fixed: {fixed}")


if __name__ == "__main__":
    main()