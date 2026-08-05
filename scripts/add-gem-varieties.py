#!/usr/bin/env python3
"""Add 10 new gem species (50 -> 60) with full data + SVG placeholders.

New gems: pearl, amber, turquoise, coral, kunzite, heliodor, fluorite,
apatite, sphalerite, kyanite. Each gets a YAML matching GemSchema and a
set of SVG placeholder images so the build stays green; real photos can be
added later via the image pipeline (download-gem-images-multi.py).
"""
import json
from pathlib import Path

BASE = Path(r"D:/Study/gematlas")
YML = BASE / "data/gems/v1"
IMG = BASE / "docs/images/gems"

# id -> dict
NEW = {
  "pearl": {
    "zh": "珍珠", "en": "Pearl",
    "mineral_zh": "有机宝石（碳酸钙）", "mineral_en": "Organic (calcium carbonate)",
    "formula": "CaCO₃ (aragonite + conchiolin)", "sys": "amorphous",
    "h": 2.5, "h_zh": "软——需佩戴呵护", "h_en": "Soft — needs careful wear",
    "sg": 2.70, "ri": "1.52-1.69",
    "pleo": "none", "colors_zh": ["白色", "奶油色", "金色", "黑色（大溪地）"], "colors_en": ["White", "Cream", "Golden", "Black (Tahitian)"],
    "cause_zh": "珍珠层 (nacre) 的干涉与散射", "cause_en": "Nacre interference and scattering",
    "treat": ["bleaching", "dyeing"], "disclose": True,
    "note_zh": "天然 vs 养殖需 X 光或专业检测；仿品为玻璃/塑料珠", "note_en": "Natural vs cultured needs X-ray; imitations are glass/plastic beads",
    "origin": [("波斯湾", "Persian Gulf"), ("大溪地", "Tahiti"), ("日本", "Japan"), ("澳大利亚", "Australia")],
    "hz": "珍珠是唯一由生物体产生的宝石，数千年来象征纯洁。波斯湾天然珍珠与日本御木本养殖珍珠开创现代产业。",
    "he": "Pearl is the only gem produced by a living creature, symbolising purity for millennia. Persian Gulf naturals and Kokichi Mikimoto's cultured pearls built the modern industry.",
  },
  "amber": {
    "zh": "琥珀", "en": "Amber",
    "mineral_zh": "有机宝石（树脂化石）", "mineral_en": "Organic (fossil resin)",
    "formula": "C₁₀H₁₆O (polymerised resin)", "sys": "amorphous",
    "h": 2.5, "h_zh": "软", "h_en": "Soft",
    "sg": 1.08, "ri": "1.54",
    "pleo": "none", "colors_zh": ["蜂蜜色", "深红", "蓝色（多米尼加）"], "colors_en": ["Honey", "Deep red", "Blue (Dominican)"],
    "cause_zh": "树脂氧化与微量硫/铁", "cause_en": "Resin oxidation, trace S/Fe",
    "treat": ["heating"], "disclose": True,
    "note_zh": "波罗的海琥珀最常见；含昆虫内含物最珍贵", "note_en": "Baltic amber most common; insect inclusions most prized",
    "origin": [("波罗的海", "Baltic Sea"), ("缅甸", "Myanmar"), ("多米尼加", "Dominican Republic"), ("墨西哥", "Mexico")],
    "hz": "琥珀是数百万年前的树脂化石，能封存昆虫与植物。波罗的海琥珀自古贸易至罗马与中国。",
    "he": "Amber fossilises ancient resin, preserving insects and plants. Baltic amber was traded to Rome and China since antiquity.",
  },
  "turquoise": {
    "zh": "绿松石", "en": "Turquoise",
    "mineral_zh": "含水铜铝磷酸盐", "mineral_en": "Hydrous copper aluminium phosphate",
    "formula": "CuAl₆(PO₄)₄(OH)₈·4H₂O", "sys": "triclinic",
    "h": 6, "h_zh": "", "h_en": "",
    "sg": 2.70, "ri": "1.61-1.65",
    "pleo": "weak", "colors_zh": ["天空蓝", "蓝绿", "绿"], "colors_en": ["Sky blue", "Blue-green", "Green"],
    "cause_zh": "铜致蓝、铁致绿", "cause_en": "Cu blue, Fe green",
    "treat": ["stabilisation", "dyeing"], "disclose": True,
    "note_zh": "高瓷蓝（睡美人矿）最贵；稳定处理常见", "note_en": "China-blue 'Sleeping Beauty' priciest; stabilisation common",
    "origin": [("中国湖北", "Hubei, China"), ("伊朗尼沙普尔", "Nishapur, Iran"), ("美国亚利桑那", "Arizona, USA"), ("墨西哥", "Mexico")],
    "hz": "绿松石是最古老宝石之一，古埃及法老、美国原住民、中国藏族均视为神圣护身符。",
    "he": "Turquoise is among the oldest gems — sacred to Egyptian pharaohs, Native Americans, and Tibetan culture.",
  },
  "coral": {
    "zh": "珊瑚（宝石级）", "en": "Coral (gem-grade)",
    "mineral_zh": "有机宝石（珊瑚虫骨骼）", "mineral_en": "Organic (coral skeleton)",
    "formula": "CaCO₃ (calcite)", "sys": "amorphous",
    "h": 3.5, "h_zh": "软", "h_en": "Soft",
    "sg": 2.65, "ri": "1.49-1.66",
    "pleo": "none", "colors_zh": ["血红（阿卡）", "粉色（momo）", "白色", "天使皮"], "colors_en": ["Deep red (aka)", "Pink (momo)", "White", "Angel skin"],
    "cause_zh": "铁/有机色素", "cause_en": "Iron / organic pigments",
    "treat": ["waxing", "dyeing"], "disclose": True,
    "note_zh": "深血红日本阿卡珊瑚最贵；忌酸与高温", "note_en": "Japanese aka deep-red priciest; avoid acid and heat",
    "origin": [("日本", "Japan"), ("地中海", "Mediterranean"), ("中国台湾", "Taiwan"), ("夏威夷", "Hawaii")],
    "hz": "珊瑚自古用于宗教与王室饰品，古罗马称其可避雷。日本阿卡珊瑚在明清中国极受追捧。",
    "he": "Coral has adorned religions and royals since antiquity; Rome prized it as lightning-proof. Japanese aka coral was treasured in Ming-Qing China.",
  },
  "kunzite": {
    "zh": "紫锂辉石", "en": "Kunzite",
    "mineral_zh": "锂辉石（spodumene）", "mineral_en": "Spodumene",
    "formula": "LiAlSi₂O₆", "sys": "monoclinic",
    "h": 7, "h_zh": "", "h_en": "",
    "sg": 3.18, "ri": "1.66-1.68",
    "pleo": "strong", "colors_zh": ["淡紫粉", "薰衣草紫"], "colors_en": ["Pale lilac-pink", "Lavender"],
    "cause_zh": "Mn³⁺ 致色", "cause_en": "Mn³⁺",
    "treat": ["irradiation"], "disclose": True,
    "note_zh": "1902年以宝石学家 G.F. Kunz 命名；颜色日久会褪，需避强光", "note_en": "Named 1902 for G.F. Kunz; colour fades in strong light",
    "origin": [("阿富汗", "Afghanistan"), ("巴西", "Brazil"), ("马达加斯加", "Madagascar"), ("美国加州", "California, USA")],
    "hz": "紫锂辉石1902年由蒂芙尼宝石学家 Kunz 命名，粉色系宝石中的后起之秀。",
    "he": "Kunzite was named in 1902 by Tiffany's gemologist G.F. Kunz — a rising star among pink gems.",
  },
  "heliodor": {
    "zh": "金绿柱石（金绿玉）", "en": "Heliodor (golden beryl)",
    "mineral_zh": "绿柱石族", "mineral_en": "Beryl",
    "formula": "Be₃Al₂(SiO₃)₆", "sys": "hexagonal",
    "h": 7.75, "h_zh": "", "h_en": "",
    "sg": 2.70, "ri": "1.57-1.58",
    "pleo": "weak", "colors_zh": ["金黄", "黄绿"], "colors_en": ["Golden", "Yellow-green"],
    "cause_zh": "Fe³⁺ 致金黄", "cause_en": "Fe³⁺ golden",
    "treat": [], "disclose": False,
    "note_zh": "绿柱石家族的黄色成员，加热可改善色调", "note_en": "Beryl's yellow member; heat can improve tone",
    "origin": [("纳米比亚", "Namibia"), ("巴西", "Brazil"), ("马达加斯加", "Madagascar"), ("乌克兰", "Ukraine")],
    "hz": "金绿柱石因希腊太阳神赫利俄斯得名，非洲产出的金黄晶体最受藏家欢迎。",
    "he": "Heliodor takes its name from the Greek sun-god Helios; golden African crystals are collectors' favourites.",
  },
  "fluorite": {
    "zh": "萤石", "en": "Fluorite",
    "mineral_zh": "卤化物（氟化钙）", "mineral_en": "Halide (calcium fluoride)",
    "formula": "CaF₂", "sys": "cubic",
    "h": 4, "h_zh": "软——作雕件或刻面收藏", "h_en": "Soft — carvings or collector facets",
    "sg": 3.18, "ri": "1.43",
    "pleo": "weak", "colors_zh": ["紫", "绿", "黄", "蓝", "彩虹"], "colors_en": ["Purple", "Green", "Yellow", "Blue", "Rainbow"],
    "cause_zh": "稀土与色心", "cause_en": "Rare-earth and colour centres",
    "treat": ["irradiation"], "disclose": False,
    "note_zh": "\"彩虹萤石\"具强荧光；玻璃仿品常见", "note_en": "'Rainbow' fluorite fluoresces; glass imitations common",
    "origin": [("中国", "China"), ("墨西哥", "Mexico"), ("南非", "South Africa"), ("英国德比郡", "Derbyshire, UK")],
    "hz": "萤石因荧光现象得名（最早被记录荧光的矿物），色彩之丰居矿物之冠。",
    "he": "Fluorite gave its name to fluorescence itself; its colour range rivals any mineral.",
  },
  "apatite": {
    "zh": "磷灰石", "en": "Apatite",
    "mineral_zh": "磷酸盐", "mineral_en": "Phosphate",
    "formula": "Ca₅(PO₄)₃(F,OH,Cl)", "sys": "hexagonal",
    "h": 5, "h_zh": "软——少见刻面", "h_en": "Soft — rarely faceted",
    "sg": 3.17, "ri": "1.63-1.65",
    "pleo": "weak", "colors_zh": ["帕拉伊巴蓝", "薄荷绿", "黄"], "colors_en": ["Paraíba-blue", "Mint green", "Yellow"],
    "cause_zh": "稀土致帕拉伊巴蓝", "cause_en": "Rare-earth gives Paraíba blue",
    "treat": [], "disclose": False,
    "note_zh": "产地位于缅甸的帕拉伊巴蓝磷灰石最受藏家青睐", "note_en": "Burmese Paraíba-blue apatite prized by collectors",
    "origin": [("缅甸", "Myanmar"), ("马达加斯加", "Madagascar"), ("巴西", "Brazil"), ("墨西哥", "Mexico")],
    "hz": "磷灰石是人体骨骼与牙齿的主要成分，因颜色酷似帕拉伊巴碧玺而受关注。",
    "he": "Apatite forms human bones and teeth; gem apatite is sought for its Paraíba-like blue.",
  },
  "sphalerite": {
    "zh": "闪锌矿", "en": "Sphalerite",
    "mineral_zh": "硫化物（闪锌矿）", "mineral_en": "Sulfide (zinc blende)",
    "formula": "ZnS", "sys": "cubic",
    "h": 3.5, "h_zh": "软且解理发育——收藏级", "h_en": "Soft, perfect cleavage — collector grade",
    "sg": 4.09, "ri": "2.37",
    "pleo": "weak", "colors_zh": ["橙黄", "红棕", "绿"], "colors_en": ["Orange-yellow", "Red-brown", "Green"],
    "cause_zh": "铁与色心", "cause_en": "Iron and colour centres",
    "treat": [], "disclose": False,
    "note_zh": "色散 0.156 超过钻石——'火彩之王'；极软仅藏家", "note_en": "Dispersion 0.156 exceeds diamond — 'fire king'; too soft for wear",
    "origin": [("西班牙", "Spain"), ("墨西哥", "Mexico"), ("美国", "USA"), ("中国", "China")],
    "hz": "闪锌矿拥有宝石中最高的色散，橙黄晶体像凝固的火焰，但因极软只能作为收藏品。",
    "he": "Sphalerite has the highest dispersion of any gem; its orange crystals look like frozen fire, but it is collector-only due to softness.",
  },
  "kyanite": {
    "zh": "蓝晶石", "en": "Kyanite",
    "mineral_zh": "硅酸盐（蓝晶石）", "mineral_en": "Silicate (disthene)",
    "formula": "Al₂SiO₅", "sys": "triclinic",
    "h": 5.5, "h_zh": "硬度方向性：长度 4.5 / 横截面 7", "h_en": "Directional hardness: 4.5 length, 7 across",
    "sg": 3.68, "ri": "1.71-1.73",
    "pleo": "strong", "colors_zh": ["湛蓝", "蓝黑", "绿"], "colors_en": ["Deep blue", "Blue-black", "Green"],
    "cause_zh": "Fe/Ti 致蓝色", "cause_en": "Fe/Ti blue",
    "treat": ["heating"], "disclose": False,
    "note_zh": "硬度各向异性极罕见；橙色蓝晶石（锰致色）更贵", "note_en": "Rarely anisotropic hardness; orange kyanite (Mn) pricier",
    "origin": [("巴西", "Brazil"), ("尼泊尔", "Nepal"), ("缅甸", "Myanmar"), ("美国北卡罗来纳", "North Carolina, USA")],
    "hz": "蓝晶石得名于希腊\"蓝色\"，其各向异性硬度（横纵差异）在宝石界独一无二。",
    "he": "Kyanite means 'blue' in Greek; its direction-dependent hardness is unique among gems.",
  },
}

SVG_TMPL = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="60%">
      <stop offset="0%"  stop-color="{color}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="{color}" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="#1a1814"/>
  <ellipse cx="400" cy="300" rx="280" ry="200" fill="url(#g)"/>
  <text x="400" y="300" text-anchor="middle" font-family="Cormorant Garamond, serif"
        font-size="64" font-weight="600" fill="#fff8e7">{en}</text>
  <text x="400" y="380" text-anchor="middle" font-family="Noto Serif SC, serif"
        font-size="36" fill="#d6cdb8">{zh}</text>
  <text x="400" y="440" text-anchor="middle" font-family="Inter, sans-serif"
        font-size="22" fill="#a89e8a">Mohs {h} · placeholder</text>
</svg>
'''

def sq(s):
    """Single-quote a YAML string, doubling inner single quotes."""
    return "'{}'".format(s.replace("'", "''"))

def write_gem_yaml(gid, d):
    p = YML / "{}.yaml".format(gid)
    if p.exists():
        return False
    txt = """# {en} ({mineral_zh}).
id: {gid}
names:
  zh: {zh}
  en: {en}
category:
  mineral_zh: {mineral_zh}
  mineral_en: {mineral_en}
  chemical_formula: {formula}
  crystal_system: {sys}
physical:
  hardness_mohs: {h}
""".format(gid=gid, en=d["en"], zh=d["zh"], mineral_zh=d["mineral_zh"],
           mineral_en=d["mineral_en"], formula=d["formula"], sys=d["sys"], h=d["h"])
    if d["h_zh"]:
        txt += "  hardness_note_zh: {}\n".format(sq(d["h_zh"]))
    if d["h_en"]:
        txt += "  hardness_note_en: {}\n".format(sq(d["h_en"]))
    txt += """  specific_gravity: {sg}
  refractive_index: '{ri}'
optical:
  pleochroism: {pleo}
  typical_colors:
""".format(sg=d["sg"], ri=d["ri"], pleo=d["pleo"])
    for c in d["colors_zh"]:
        txt += "    - {{ zh: {}, en: {} }}\n".format(c, d["colors_en"][d["colors_zh"].index(c)])
    txt += "  color_causes_zh: {}\n  color_causes_en: {}\n".format(d["cause_zh"], d["cause_en"])
    txt += "treatments:\n  common: [{}]\n  disclosure_required: {}\n  note_zh: {}\n  note_en: {}\n".format(
        ", ".join(d["treat"]), str(d["disclose"]).lower(), sq(d["note_zh"]), sq(d["note_en"]))
    # NOTE: images block goes LAST (after origin/history) so the downloader's
    # strip-anywhere logic always leaves exactly one block.
    txt += "\norigin:\n" + "".join('  - { zh: "%s", en: "%s" }\n' % (z, e) for z, e in d["origin"])
    txt += "history_zh: |\n  {}\nhistory_en: |\n  {}\n".format(d["hz"], d["he"])
    txt += "images:\n  main: {}.svg\n  gallery: [{}-gallery-1.svg, {}-gallery-2.svg, {}-gallery-3.svg]\n".format(gid, gid, gid, gid)
    p.write_text(txt, encoding="utf-8")
    return True

def write_svgs(gid, d):
    gd = IMG / gid
    gd.mkdir(parents=True, exist_ok=True)
    color = "#888888"
    for name in ["{}.svg".format(gid)] + ["{}-gallery-{}.svg".format(gid, i) for i in range(1, 4)]:
        (gd / name).write_text(
            SVG_TMPL.format(en=d["en"], zh=d["zh"], h=d["h"], color=color),
            encoding="utf-8")

added = 0
for gid, d in NEW.items():
    if write_gem_yaml(gid, d):
        write_svgs(gid, d)
        added += 1
        print("+ {}".format(gid))
print("added {} gems (total now 50+{})".format(added, added))