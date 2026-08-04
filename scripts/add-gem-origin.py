#!/usr/bin/env python3
"""Add origin + history fields to all 50 gem YAMLs.

Each gem gains:
  origin:
    - { zh: ..., en: ... }
  history_zh: |
    ...
  history_en: |

Safety: backs up each YAML to .bak if not present, writes atomically
(tmp + os.replace). Idempotent: skips gems that already have origin:.
"""
import re, shutil
from pathlib import Path

YML = Path(r"D:/Study/gematlas/data/gems/v1")

# gem id -> (origins[(zh,en)...], history_zh, history_en)
DATA = {
  "ruby": ([("缅甸莫谷", "Mogok, Myanmar"), ("莫桑比克", "Mozambique"), ("泰国", "Thailand")],
    "红宝石是五大名宝之首，缅甸莫谷（Mogok）产出的\"鸽血红\"最负盛名。古印度称其为\"宝石之王\"，早期贸易沿丝绸之路西传。",
    "Ruby is the king of coloured gems; Mogok (Myanmar) 'pigeon-blood' stones set the benchmark. Revered in India as the 'lord of gems', it reached Europe along the Silk Road."),
  "sapphire": ([("克什米尔", "Kashmir"), ("斯里兰卡", "Sri Lanka"), ("马达加斯加", "Madagascar"), ("缅甸", "Myanmar")],
    "克什米尔蓝宝石的矢车菊蓝被誉为蓝宝石顶峰；斯里兰卡以星光蓝宝石闻名。英国王室蓝宝石订婚戒（凯特王妃）使其人气再攀。",
    "Kashmir cornflower blue is the apex of sapphire colour; Sri Lanka is famed for star sapphires. Kate Middleton's sapphire engagement ring reignited global demand."),
  "emerald": ([("哥伦比亚（木佐/契沃尔）", "Muzo / Chivor, Colombia"), ("赞比亚", "Zambia"), ("巴西", "Brazil")],
    "哥伦比亚木佐（Muzo）祖母绿绿中带蓝最受珍视，西班牙殖民者16世纪即开始开采。埃及克利奥帕特拉矿是已知最早产地。",
    "Colombian Muzo greens with a blue cast are most prized; Spanish colonists mined them from the 1500s. Cleopatra's Egyptian mines are the oldest known source."),
  "diamond": ([("印度（戈尔康达）", "Golconda, India"), ("南非", "South Africa"), ("俄罗斯（雅库特）", "Yakutia, Russia"), ("博茨瓦纳", "Botswana")],
    "钻石之名的\"永恒\"意象源于其硬度。戈尔康达矿区出产无数传奇名钻（Hope、Regent）；1866年南非金伯利发现改变了供应格局。",
    "Diamond's 'eternal' symbolism stems from its hardness. Golconda yielded the great legends (Hope, Regent); Kimberley (1866) transformed supply."),
  "alexandrite": ([("俄罗斯乌拉尔", "Ural Mountains, Russia"), ("巴西", "Brazil"), ("斯里兰卡", "Sri Lanka")],
    "1830年首次发现于俄罗斯乌拉尔，以沙皇亚历山大二世命名。日光下绿、灯光下红的变色效应使其极为罕见珍贵。",
    "Discovered in the Urals in 1830 and named for Tsar Alexander II. Its green-to-red colour change makes it among the rarest gems."),
  "spinel": ([("缅甸", "Myanmar"), ("塔吉克斯坦（帕米尔）", "Pamir, Tajikistan"), ("越南", "Vietnam")],
    "红尖晶石长期与红宝石混名——英国\"黑王子红宝石\"和\"铁木尔红宝石\"实为尖晶石。缅甸曼辛是高品质产地。",
    "Red spinel was long confused with ruby — Britain's 'Black Prince's Ruby' and 'Timur Ruby' are both spinels. Myanmar's Man Sin yields fine stones."),
  "tanzanite": ([("坦桑尼亚（梅雷拉尼山）", "Merelani Hills, Tanzania")],
    "1967年在坦桑尼亚阿鲁沙附近发现，由蒂芙尼命名推广。全世界仅此一处产地，稀有度极高。",
    "Found near Arusha in 1967 and promoted by Tiffany. With a single source worldwide, it is exceptionally rare."),
  "tsavorite-garnet": ([("肯尼亚", "Kenya"), ("坦桑尼亚", "Tanzania")],
    "1967年由苏格兰宝石学家坎贝尔·布里奇斯在肯尼亚发现，蒂芙尼以肯尼亚沙弗国家公园命名。翠绿不输祖母绿且更耐久。",
    "Discovered in Kenya in 1967 by Campbell Bridges; named by Tiffany for Tsavo National Park. Green rivaling emerald with better durability."),
  "paraiba-tourmaline": ([("巴西帕拉伊巴州", "Paraíba, Brazil"), ("尼日利亚", "Nigeria"), ("莫桑比克", "Mozambique")],
    "1989年在巴西帕拉伊巴州发现，电光蓝/霓虹绿由铜元素致色，一经问世即震撼业界，成为最贵碧玺。",
    "Discovered in Paraíba (Brazil) in 1989; copper gives its electric neon blue. Instantly iconic and among the priciest tourmalines."),
  "opal": ([("澳大利亚（南澳）", "Andamooka / Lightning Ridge, Australia"), ("埃塞俄比亚", "Ethiopia"), ("墨西哥", "Mexico")],
    "澳大利亚供应全球约95%的珍贵欧泊。火欧泊与黑欧泊（闪电岭）尤为珍贵，古罗马视欧泊为最珍贵宝石。",
    "Australia supplies ~95% of precious opal. Mexican fire opal and Lightning Ridge black opal are most prized; Rome ranked opal above all."),
  "aquamarine": ([("巴西米纳斯吉拉斯", "Minas Gerais, Brazil"), ("马达加斯加", "Madagascar"), ("巴基斯坦", "Pakistan")],
    "与祖母绿同属绿柱石族。巴西米纳斯吉拉斯产出品质最佳的海蓝宝，常用作航海护身符。",
    "Beryl cousin of emerald. Brazil's Minas Gerais yields the finest aquamarine, long a sailor's talisman."),
  "morganite": ([("巴西", "Brazil"), ("马达加斯加", "Madagascar"), ("阿富汗", "Afghanistan")],
    "粉色绿柱石，1910年以金融家J.P.摩根本人命名（其收藏了大量标本）。",
    "Pink beryl named in 1910 for banker J.P. Morgan, a noted gem collector."),
  "citrine": ([("巴西", "Brazil"), ("西班牙", "Spain"), ("苏格兰", "Scotland")],
    "黄水晶多为紫晶加热产物。名称源于法文\"柠檬\"；苏格兰曾盛产天然黄晶。",
    "Most citrine is heat-treated amethyst. The name derives from French 'citron' (lemon); Scotland once produced natural stones."),
  "amethyst": ([("巴西", "Brazil"), ("乌拉圭", "Uruguay"), ("赞比亚", "Zambia"), ("俄罗斯", "Russia")],
    "紫晶自古象征王权与清醒，希腊语意为\"不醉\"。圣路易斯安那曾是重要产地；乌拉圭深紫最受追捧。",
    "Amethyst has symbolised royalty and sobriety since antiquity (Greek 'not drunk'). Uruguay deep-purple stones are most sought."),
  "peridot": ([("埃及圣约翰岛", "St. John's Island, Egypt"), ("中国", "China"), ("巴基斯坦", "Pakistan"), ("美国亚利桑那", "Arizona, USA")],
    "橄榄石是最古老宝石之一，古埃及称为\"太阳之石\"。中国与巴基斯坦现为主要供应地。",
    "Among the oldest gemstones, peridot was Egypt's 'gem of the sun'. China and Pakistan now lead supply."),
  "tourmaline": ([("巴西", "Brazil"), ("阿富汗", "Afghanistan"), ("莫桑比克", "Mozambique"), ("美国缅因/加州", "Maine / California, USA")],
    "碧玺颜色之多居宝石之首，\"西瓜碧玺\"双色共生尤为珍奇。古锡兰语意为\"彩色宝石\"。",
    "Tourmaline shows the widest colour range of any gem; watermelon bicolour is prized. Sinhalese for 'mixed coloured stone'."),
  "iolite": ([("印度", "India"), ("斯里兰卡", "Sri Lanka"), ("马达加斯加", "Madagascar"), ("坦桑尼亚", "Tanzania")],
    "堇青石因强三色性被维京航海家用作偏振罗盘，又称\"水蓝宝石\"。",
    "Iolite's strong trichroism let Viking navigators use it as a polarizing compass — the 'water sapphire'."),
  "zircon": ([("柬埔寨", "Cambodia"), ("斯里兰卡", "Sri Lanka"), ("泰国", "Thailand"), ("澳大利亚", "Australia")],
    "锆石是地球最古老矿物之一，含铀可测4亿年历史。蓝色热处理锆石曾风靡维多利亚时代。",
    "Zircon is among Earth's oldest minerals (uranium dating). Heat-treated blue zircon was a Victorian favourite."),
  "topaz": ([("巴西米纳斯吉拉斯", "Minas Gerais, Brazil"), ("俄罗斯乌拉尔", "Urals"), ("美国犹他", "Utah, USA"), ("尼日利亚", "Nigeria")],
    "帝王托帕石（黄橙）最珍贵，古埃及传说源于太阳岛。蓝托帕石多经辐照改色。",
    "Imperial topaz (yellow-orange) is most prized; ancient Egyptians mythologised its sun-island origin. Blue topaz is usually irradiated."),
  "garnet-almandine": ([("印度", "India"), ("斯里兰卡", "Sri Lanka"), ("美国", "USA"), ("马达加斯加", "Madagascar")],
    "铁铝榴石是最常见的红色石榴石，中世纪宝石商称其为\"石榴石\"（石榴籽）。",
    "Almandine is the common red garnet; medieval lapidaries coined 'garnet' from pomegranate seeds."),
  "garnet-pyrope": ([("捷克波西米亚", "Bohemia, Czech Republic"), ("南非", "South Africa"), ("坦桑尼亚", "Tanzania")],
    "镁铝榴石深红近黑，波西米亚自古开采，欧洲古墓中常见其珠饰。",
    "Pyrope's deep red nears black; Bohemia mined it since antiquity and it appears in ancient European tombs."),
  "garnet-spessartine": ([("中国新疆", "Xinjiang, China"), ("纳米比亚", "Namibia"), ("马达加斯加", "Madagascar"), ("美国", "USA")],
    "锰铝榴石（芬达石）呈亮橙色，近年因独特荧光橙而受热捧。",
    "Spessartine (mandarin garnet) glows orange; its vivid tone has surged in demand."),
  "garnet-demantoid": ([("俄罗斯乌拉尔", "Urals, Russia"), ("纳米比亚", "Namibia")],
    "翠榴石是绿色石榴石之王，色散超过钻石，俄罗斯沙皇珠宝常用之。",
    "Demantoid is the green garnet king with dispersion exceeding diamond; beloved in Russian imperial jewelry."),
  "jadeite": ([("缅甸", "Myanmar"), ("危地马拉", "Guatemala"), ("日本", "Japan")],
    "翡翠（硬玉）明清传入中国后成为\"玉中之王\"，帝王绿最珍贵。缅甸是唯一商业级来源。",
    "Jadeite became China's 'king of jade' after the Ming dynasty; imperial green is most valued. Myanmar is the only commercial source."),
  "nephrite": ([("中国新疆和田", "Hetian, Xinjiang, China"), ("加拿大不列颠哥伦比亚", "British Columbia, Canada"), ("俄罗斯", "Russia")],
    "软玉是中国八千年玉文化的核心，和田玉自古为宫廷所重，\"君子比德于玉\"。",
    "Nephrite anchors 8,000 years of Chinese jade culture; Hetian white jade was the imperial standard ('virtue like jade')."),
  "lapis-lazuli": ([("阿富汗巴达赫尚", "Badakhshan, Afghanistan"), ("智利", "Chile"), ("俄罗斯贝加尔", "Lake Baikal, Russia")],
    "青金石是法老与文艺复兴画家的\"群青\"来源。阿富汗萨雷桑矿已开采六千年。",
    "Lapis lazuli supplied the pharaohs and Renaissance ultramarine. Afghanistan's Sar-e-Sang mine has run for 6,000 years."),
  "malachite": ([("刚果（金）", "DR Congo"), ("赞比亚", "Zambia"), ("俄罗斯乌拉尔", "Urals, Russia"), ("澳大利亚", "Australia")],
    "孔雀石自古用于颜料与装饰，俄罗斯圣彼得堡冬宫孔雀石厅为其巅峰。",
    "Malachite has coloured paints and palaces since antiquity; St Petersburg's Malachite Hall is its zenith."),
  "rhodochrosite": ([("阿根廷卡皮利亚", "Capillitas, Argentina"), ("南非", "South Africa"), ("美国科罗拉多", "Colorado, USA")],
    "菱锰矿\"印加玫瑰\"是阿根廷国石，带状粉色纹理似玫瑰花瓣。",
    "Rhodochrosite 'Inca Rose' is Argentina's national stone, its banded pink echoing rose petals."),
  "sugilite": ([("南非温贝", "Wessels, South Africa"), ("日本", "Japan"), ("加拿大", "Canada")],
    "苏纪石1970年代在南非温贝矿首次大量发现，浓郁紫色被昵称\"爱情石\"。",
    "Sugilite was first found in quantity at Wessels (South Africa) in the 1970s; its royal purple is called the 'love stone'."),
  "charoite": ([("俄罗斯西伯利亚", "Siberia, Russia")],
    "紫硅碱钙石仅产自俄罗斯恰拉河，20世纪70年代才被确认，紫色丝绢光泽独特。",
    "Charoite comes only from Siberia's Chara River, confirmed in the 1970s; its purple silky chatoyancy is one-of-a-kind."),
  "moonstone": ([("斯里兰卡", "Sri Lanka"), ("印度", "India"), ("马达加斯加", "Madagascar")],
    "月光石月光效应来自长石层状结构散射，古罗马人认为其凝结了月光。",
    "Moonstone's adularescence comes from feldspar lamellar scattering; Romans believed it was frozen moonlight."),
  "rose-quartz": ([("巴西", "Brazil"), ("马达加斯加", "Madagascar"), ("南非", "South Africa")],
    "粉晶象征爱情，古埃及与罗马用作美容面霜原料；高品质大晶体稀有。",
    "Rose quartz is the love stone; Egypt and Rome ground it for cosmetics. Large clean crystals are rare."),
  "tigers-eye": ([("南非", "South Africa"), ("澳大利亚", "Australia"), ("印度", "India"), ("巴西", "Brazil")],
    "虎眼石是硅化青石棉，鹰眼/牛眼为其变种。古罗马武士用作护身符。",
    "Tiger's-eye is silicified crocidolite; hawk's-eye and bull's-eye are variants. Roman soldiers wore it as a talisman."),
  "labradorite": ([("加拿大拉布拉多", "Labrador, Canada"), ("马达加斯加", "Madagascar"), ("芬兰", "Finland")],
    "拉长石拉长光（labradorescence）由层状双晶干涉产生。芬兰变种称\"光谱石\"。",
    "Labradorite's iridescence (labradorescence) stems from lamellar twinning; the Finnish variety is 'spectrolite'."),
  "amazonite": ([("巴西", "Brazil"), ("美国科罗拉多", "Colorado, USA"), ("俄罗斯", "Russia"), ("马达加斯加", "Madagascar")],
    "天河石以亚马孙河命名（实为讹传），蓝绿棋盘格纹独特，古埃及用作饰品。",
    "Amazonite is named for the Amazon (erroneously); its blue-green checkerboard is distinctive. Used in ancient Egypt."),
  "sunstone": ([("美国俄勒冈", "Oregon, USA"), ("印度", "India"), ("挪威", "Norway")],
    "太阳石含赤铁矿/铜片产生金黄闪光（aventurescence），俄勒冈铜太阳石尤为著名。",
    "Sunstone's golden flash (aventurescence) comes from hematite/copper platelets; Oregon copper sunstone is celebrated."),
  "smoky-quartz": ([("瑞士阿尔卑斯", "Swiss Alps"), ("巴西", "Brazil"), ("美国科罗拉多", "Colorado, USA"), ("苏格兰凯恩戈姆", "Cairngorm, Scotland")],
    "烟晶因辐射致色，苏格兰凯恩戈姆是传统产地，维多利亚时代用于哀悼珠宝。",
    "Smoky quartz's colour comes from natural radiation; Scotland's Cairngorm was traditional, used in Victorian mourning jewelry."),
  "rock-crystal": ([("巴西", "Brazil"), ("中国", "China"), ("马达加斯加", "Madagascar"), ("美国阿肯色", "Arkansas, USA")],
    "水晶自古被视为冰之凝晶，希腊语\"krystallos\"即冰。全球广泛分布。",
    "Rock crystal was long thought to be frozen ice (Greek 'krystallos'). Distributed worldwide."),
  "aventurine-quartz": ([("印度", "India"), ("巴西", "Brazil"), ("西班牙", "Spain")],
    "东陵石的闪金效应（aventurescence）由云母/赤铁矿包体产生，名称源自意大利\"偶然\"（per avventura）。",
    "Aventurine's sparkle comes from mica/hematite inclusions; the name stems from Italian 'per avventura' (by chance)."),
  "chalcedony": ([("巴西", "Brazil"), ("印度", "India"), ("美国俄勒冈", "Oregon, USA"), ("马达加斯加", "Madagascar")],
    "玉髓是微晶石英总称，含玛瑙、红玉髓、蓝玉髓等。古罗马用以制作印章。",
    "Chalcedony is the microcrystalline quartz family (agate, carnelian, blue chalcedony). Rome used it for intaglio seals."),
  "chrysoprase": ([("澳大利亚昆士兰", "Queensland, Australia"), ("波兰", "Poland"), ("美国加州", "California, USA")],
    "绿玉髓的苹果绿由镍致色，是半透明石英中最珍贵者，普鲁士腓特烈大帝曾收藏。",
    "Chrysoprase's apple-green comes from nickel; it is the most precious translucent quartz, collected by Frederick the Great."),
  "pyrite": ([("西班牙", "Spain"), ("秘鲁", "Peru"), ("美国伊利诺伊", "Illinois, USA")],
    "黄铁矿\"愚人金\"常被误认为黄金。印加文明用之制镜，阿兹特克饰之。",
    "Pyrite 'fool's gold' mimics gold. The Inca made mirrors from it; Aztecs adorned themselves with it."),
  "quartz-catseye": ([("斯里兰卡", "Sri Lanka"), ("印度", "India"), ("巴西", "Brazil")],
    "石英猫眼含平行针状包体产生猫眼效应，比金绿猫眼便宜但同样迷人。",
    "Quartz cat's-eye's chatoyancy comes from parallel needles; cheaper than chrysoberyl but equally charming."),
  "rhodonite": ([("俄罗斯乌拉尔", "Urals, Russia"), ("瑞典", "Sweden"), ("澳大利亚", "Australia"), ("美国马萨诸塞", "Massachusetts, USA")],
    "蔷薇辉石粉色含黑色锰氧化物网纹，俄罗斯以之制巨型装饰，马萨诸塞州石。",
    "Rhodonite's pink carries black manganese veining; Russia made grand ornaments and it is the Massachusetts state stone."),
  "serpentine": ([("中国", "China"), ("南非", "South Africa"), ("美国加州", "California, USA"), ("英国康沃尔", "Cornwall, UK")],
    "蛇纹石\"新山玉\"常仿翡翠，因表面蛇皮状光泽得名。加州州石。",
    "Serpentine is a jade substitute ('new jade'); named for its snake-skin sheen. California state stone."),
  "sodalite": ([("加拿大", "Canada"), ("巴西", "Brazil"), ("俄罗斯科拉半岛", "Kola Peninsula, Russia")],
    "方钠石蓝白相间，是青金石的平价替代。加拿大安大略班克罗夫特盛产。",
    "Sodalite's blue-and-white makes it a budget lapis. Ontario's Bancroft is a leading source."),
  "obsidian": ([("美国俄勒冈", "Oregon, USA"), ("墨西哥", "Mexico"), ("冰岛", "Iceland"), ("日本北海道", "Hokkaido, Japan")],
    "黑曜石是火山玻璃，阿兹特克文明用之制刃与镜。彩虹/银曜为特殊变种。",
    "Obsidian is volcanic glass; the Aztecs made blades and mirrors from it. Rainbow and silver sheen are prized variants."),
  "chrysoberyl": ([("巴西", "Brazil"), ("斯里兰卡", "Sri Lanka"), ("马达加斯加", "Madagascar"), ("俄罗斯乌拉尔", "Urals, Russia")],
    "金绿宝石以金绿猫眼（cymophane）与变石（alexandrite）闻名，硬达8.5。",
    "Chrysoberyl is famous for cat's-eye (cymophane) and alexandrite; it ranks a hard 8.5."),
  "dioptase": ([("纳米比亚", "Namibia"), ("刚果（金）", "DR Congo"), ("俄罗斯", "Russia")],
    "透视石翠绿色晶体极美但硬度低，多作矿物标本而非宝石。",
    "Dioptase's intense emerald-green crystals are stunning but soft; it is mostly a mineral specimen."),
  "prehnite": ([("南非", "South Africa"), ("澳大利亚", "Australia"), ("中国", "China"), ("美国新泽西", "New Jersey, USA")],
    "葡萄石以荷兰殖民者Hendrik von Prehn命名，是首个以人名命名的矿物。",
    "Prehnite was named for Dutch colonist Hendrik von Prehn — the first mineral named after a person."),
}

def add_origin_history(path, origins, hist_zh, hist_en):
    txt = path.read_text(encoding="utf-8")
    if "origin:" in txt:
        return False  # idempotent
    bak = path.with_suffix(".yaml.bak")
    if not bak.exists():
        bak.write_text(txt, encoding="utf-8")
    block = "\norigin:\n" + "".join(
        "  - {{ zh: \"{}\", en: \"{}\" }}\n".format(z, e) for z, e in origins)
    block += "history_zh: |\n  {}\nhistory_en: |\n  {}\n".format(
        hist_zh.replace("\n", "\n  "), hist_en.replace("\n", "\n  "))
    tmp = path.with_suffix(".yaml.tmp")
    tmp.write_text(txt.rstrip() + "\n" + block, encoding="utf-8")
    tmp.replace(path)
    return True

done = 0
skipped = 0
for gid, (origins, hz, he) in DATA.items():
    p = YML / "{}.yaml".format(gid)
    if not p.exists():
        print("  !! missing: {}".format(gid))
        continue
    if add_origin_history(p, origins, hz, he):
        done += 1
    else:
        skipped += 1
print("added: {}  skipped(existing): {}".format(done, skipped))