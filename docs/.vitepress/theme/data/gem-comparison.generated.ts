/* This file is generated. Edit data/gems/v1/*.yaml, then regenerate. */

export type GemComparisonRecord = {
  id: string
  names: { zh: string; en: string }
  category: {
    mineral_zh: string
    mineral_en: string
    chemical_formula: string
    crystal_system: string
  }
  physical: {
    hardness_mohs: number
    specific_gravity: number
    refractive_index: string
  }
  optical: {
    pleochroism?: 'none' | 'weak' | 'moderate' | 'strong'
    typical_colors: Array<{ zh?: string; en?: string }>
  }
}

export const GEM_COMPARISON_DATA: GemComparisonRecord[] = [
  {
    "id": "alexandrite",
    "names": {
      "zh": "亚历山大石",
      "en": "Alexandrite"
    },
    "category": {
      "mineral_zh": "金绿宝石族",
      "mineral_en": "Chrysoberyl",
      "chemical_formula": "BeAl₂O₄",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 8.5,
      "specific_gravity": 3.73,
      "refractive_index": "1.746-1.755"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "日光下绿",
          "en": "Green in daylight"
        },
        {
          "zh": "灯光下红",
          "en": "Red in incandescent light"
        }
      ]
    }
  },
  {
    "id": "garnet-almandine",
    "names": {
      "zh": "铁铝榴石",
      "en": "Almandine (Garnet)"
    },
    "category": {
      "mineral_zh": "石榴石族",
      "mineral_en": "Garnet (Almandine)",
      "chemical_formula": "Fe₃Al₂(SiO₄)₃",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 4.05,
      "refractive_index": "1.770-1.820"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "深红色",
          "en": "Deep red"
        },
        {
          "zh": "紫红色",
          "en": "Purplish red"
        },
        {
          "zh": "褐红色",
          "en": "Brownish red"
        }
      ]
    }
  },
  {
    "id": "amazonite",
    "names": {
      "zh": "天河石",
      "en": "Amazonite"
    },
    "category": {
      "mineral_zh": "长石族",
      "mineral_en": "Feldspar (Microcline)",
      "chemical_formula": "KAlSi₃O₈",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.56,
      "refractive_index": "1.518-1.530"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "蓝绿色",
          "en": "Blue-green"
        },
        {
          "zh": "翠绿色",
          "en": "Teal green"
        },
        {
          "zh": "淡蓝色",
          "en": "Pale blue"
        }
      ]
    }
  },
  {
    "id": "amber",
    "names": {
      "zh": "琥珀",
      "en": "Amber"
    },
    "category": {
      "mineral_zh": "有机宝石（树脂化石）",
      "mineral_en": "Organic (fossil resin)",
      "chemical_formula": "C₁₀H₁₆O (polymerised resin)",
      "crystal_system": "amorphous"
    },
    "physical": {
      "hardness_mohs": 2.5,
      "specific_gravity": 1.08,
      "refractive_index": "1.54"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "蜂蜜色",
          "en": "Honey"
        },
        {
          "zh": "深红",
          "en": "Deep red"
        },
        {
          "zh": "蓝色（多米尼加）",
          "en": "Blue (Dominican)"
        }
      ]
    }
  },
  {
    "id": "amethyst",
    "names": {
      "zh": "紫晶",
      "en": "Amethyst"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "紫罗兰",
          "en": "Violet"
        },
        {
          "zh": "深紫",
          "en": "Deep purple"
        },
        {
          "zh": "淡紫",
          "en": "Lavender"
        }
      ]
    }
  },
  {
    "id": "apatite",
    "names": {
      "zh": "磷灰石",
      "en": "Apatite"
    },
    "category": {
      "mineral_zh": "磷酸盐",
      "mineral_en": "Phosphate",
      "chemical_formula": "Ca₅(PO₄)₃(F,OH,Cl)",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 5,
      "specific_gravity": 3.17,
      "refractive_index": "1.63-1.65"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "帕拉伊巴蓝",
          "en": "Paraíba-blue"
        },
        {
          "zh": "薄荷绿",
          "en": "Mint green"
        },
        {
          "zh": "黄",
          "en": "Yellow"
        }
      ]
    }
  },
  {
    "id": "aquamarine",
    "names": {
      "zh": "海蓝宝",
      "en": "Aquamarine"
    },
    "category": {
      "mineral_zh": "绿柱石族",
      "mineral_en": "Beryl",
      "chemical_formula": "Be₃Al₂Si₆O₁₈",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 7.75,
      "specific_gravity": 2.68,
      "refractive_index": "1.564-1.596"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "浅蓝色",
          "en": "Sky blue"
        },
        {
          "zh": "海蓝色",
          "en": "Sea blue"
        },
        {
          "zh": "绿蓝色",
          "en": "Greenish blue"
        }
      ]
    }
  },
  {
    "id": "aventurine-quartz",
    "names": {
      "zh": "东陵石 / 砂金石",
      "en": "Aventurine Quartz"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz (microcrystalline)",
      "chemical_formula": "SiO₂ + Cr-mica / hematite",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.64,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "绿色",
          "en": "Green"
        },
        {
          "zh": "红棕色",
          "en": "Red-brown"
        },
        {
          "zh": "蓝色",
          "en": "Blue"
        }
      ]
    }
  },
  {
    "id": "chalcedony",
    "names": {
      "zh": "玉髓 / 玛瑙",
      "en": "Chalcedony / Agate"
    },
    "category": {
      "mineral_zh": "石英族（隐晶质）",
      "mineral_en": "Quartz (microcrystalline)",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.6,
      "refractive_index": "1.530-1.543"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "多种颜色（带状玛瑙）",
          "en": "Multi-color banded (agate)"
        },
        {
          "zh": "蓝色（蓝玉髓）",
          "en": "Blue (blue chalcedony)"
        },
        {
          "zh": "黑色（缟玛瑙）",
          "en": "Black (onyx)"
        },
        {
          "zh": "白色（白玉髓）",
          "en": "White"
        },
        {
          "zh": "红色（红玉髓/光玉髓）",
          "en": "Red (carnelian / sard)"
        }
      ]
    }
  },
  {
    "id": "charoite",
    "names": {
      "zh": "紫硅碱钙石",
      "en": "Charoite"
    },
    "category": {
      "mineral_zh": "硅酸盐",
      "mineral_en": "Inosilicate",
      "chemical_formula": "(K,Sr,Ba,Na)₁₅₋₁₆(Ca,Na)₃₂[Si₆O₁₁(O,OH)₆]₂[Si₈O₂₂]₂(OH,F)₄·~1.5H₂O",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 2.54,
      "refractive_index": "1.550-1.559"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "紫罗兰",
          "en": "Violet"
        },
        {
          "zh": "紫色（带丝绢光泽）",
          "en": "Purple (with silky luster)"
        },
        {
          "zh": "淡紫色",
          "en": "Pale lavender"
        }
      ]
    }
  },
  {
    "id": "chrysoberyl",
    "names": {
      "zh": "金绿宝石",
      "en": "Chrysoberyl"
    },
    "category": {
      "mineral_zh": "金绿宝石族",
      "mineral_en": "Chrysoberyl",
      "chemical_formula": "BeAl₂O₄",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 8.5,
      "specific_gravity": 3.72,
      "refractive_index": "1.745-1.755"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "淡黄色",
          "en": "Pale yellow"
        },
        {
          "zh": "蜜黄色",
          "en": "Honey yellow"
        },
        {
          "zh": "绿黄色（金绿）",
          "en": "Greenish yellow"
        }
      ]
    }
  },
  {
    "id": "chrysoprase",
    "names": {
      "zh": "绿玉髓",
      "en": "Chrysoprase"
    },
    "category": {
      "mineral_zh": "石英族（隐晶质）",
      "mineral_en": "Quartz (microcrystalline chalcedony)",
      "chemical_formula": "SiO₂ + Ni",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.6,
      "refractive_index": "1.530-1.543"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "苹果绿",
          "en": "Apple green"
        },
        {
          "zh": "翠绿色",
          "en": "Bright green"
        },
        {
          "zh": "薄荷绿",
          "en": "Mint green"
        }
      ]
    }
  },
  {
    "id": "citrine",
    "names": {
      "zh": "黄水晶",
      "en": "Citrine"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "淡黄色",
          "en": "Pale yellow"
        },
        {
          "zh": "蜂蜜黄",
          "en": "Honey yellow"
        },
        {
          "zh": "烟褐色",
          "en": "Smoky brown"
        }
      ]
    }
  },
  {
    "id": "coral",
    "names": {
      "zh": "珊瑚（宝石级）",
      "en": "Coral (gem-grade)"
    },
    "category": {
      "mineral_zh": "有机宝石（珊瑚虫骨骼）",
      "mineral_en": "Organic (coral skeleton)",
      "chemical_formula": "CaCO₃ (calcite)",
      "crystal_system": "amorphous"
    },
    "physical": {
      "hardness_mohs": 3.5,
      "specific_gravity": 2.65,
      "refractive_index": "1.49-1.66"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "血红（阿卡）",
          "en": "Deep red (aka)"
        },
        {
          "zh": "粉色（momo）",
          "en": "Pink (momo)"
        },
        {
          "zh": "白色",
          "en": "White"
        },
        {
          "zh": "天使皮",
          "en": "Angel skin"
        }
      ]
    }
  },
  {
    "id": "garnet-demantoid",
    "names": {
      "zh": "翠榴石",
      "en": "Demantoid (Garnet)"
    },
    "category": {
      "mineral_zh": "石榴石族",
      "mineral_en": "Garnet (Andradite)",
      "chemical_formula": "Ca₃Fe₂(SiO₄)₃",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 6.5,
      "specific_gravity": 3.85,
      "refractive_index": "1.880-1.940"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "翠绿色",
          "en": "Vivid green"
        },
        {
          "zh": "黄绿色",
          "en": "Yellowish green"
        }
      ]
    }
  },
  {
    "id": "diamond",
    "names": {
      "zh": "钻石",
      "en": "Diamond"
    },
    "category": {
      "mineral_zh": "金刚石",
      "mineral_en": "Diamond",
      "chemical_formula": "C",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 10,
      "specific_gravity": 3.52,
      "refractive_index": "2.417-2.419"
    },
    "optical": {
      "typical_colors": [
        {
          "zh": "无色",
          "en": "Colorless"
        },
        {
          "zh": "彩黄",
          "en": "Fancy Yellow"
        }
      ]
    }
  },
  {
    "id": "dioptase",
    "names": {
      "zh": "透视石",
      "en": "Dioptase"
    },
    "category": {
      "mineral_zh": "硅酸盐（环状）",
      "mineral_en": "Cyclosilicate",
      "chemical_formula": "CuSiO₂(OH)₂  [Cu₆Si₆O₁₈·6H₂O]",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 3.3,
      "refractive_index": "1.644-1.709"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "翠绿色，极高饱和度",
          "en": "Vivid emerald-green, very saturated"
        },
        {
          "zh": "蓝绿色",
          "en": "Blue-green"
        }
      ]
    }
  },
  {
    "id": "emerald",
    "names": {
      "zh": "祖母绿",
      "en": "Emerald"
    },
    "category": {
      "mineral_zh": "绿柱石族",
      "mineral_en": "Beryl",
      "chemical_formula": "Be₃Al₂Si₆O₁₈",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 7.75,
      "specific_gravity": 2.72,
      "refractive_index": "1.577-1.583"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "木佐绿",
          "en": "Muzo Green"
        },
        {
          "zh": "哥伦比亚绿",
          "en": "Colombian Green"
        }
      ]
    }
  },
  {
    "id": "fluorite",
    "names": {
      "zh": "萤石",
      "en": "Fluorite"
    },
    "category": {
      "mineral_zh": "卤化物（氟化钙）",
      "mineral_en": "Halide (calcium fluoride)",
      "chemical_formula": "CaF₂",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 4,
      "specific_gravity": 3.18,
      "refractive_index": "1.43"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "紫",
          "en": "Purple"
        },
        {
          "zh": "绿",
          "en": "Green"
        },
        {
          "zh": "黄",
          "en": "Yellow"
        },
        {
          "zh": "蓝",
          "en": "Blue"
        },
        {
          "zh": "彩虹",
          "en": "Rainbow"
        }
      ]
    }
  },
  {
    "id": "heliodor",
    "names": {
      "zh": "金绿柱石（金绿玉）",
      "en": "Heliodor (golden beryl)"
    },
    "category": {
      "mineral_zh": "绿柱石族",
      "mineral_en": "Beryl",
      "chemical_formula": "Be₃Al₂(SiO₃)₆",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 7.75,
      "specific_gravity": 2.7,
      "refractive_index": "1.57-1.58"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "金黄",
          "en": "Golden"
        },
        {
          "zh": "黄绿",
          "en": "Yellow-green"
        }
      ]
    }
  },
  {
    "id": "iolite",
    "names": {
      "zh": "堇青石",
      "en": "Iolite"
    },
    "category": {
      "mineral_zh": "堇青石族",
      "mineral_en": "Cordierite",
      "chemical_formula": "Mg₂Al₄Si₅O₁₈",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 2.6,
      "refractive_index": "1.522-1.578"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "紫蓝色",
          "en": "Violet blue"
        },
        {
          "zh": "蓝紫色",
          "en": "Blue-purple"
        },
        {
          "zh": "灰蓝色",
          "en": "Smoky blue"
        }
      ]
    }
  },
  {
    "id": "jadeite",
    "names": {
      "zh": "翡翠",
      "en": "Jadeite (Burmese Jade)"
    },
    "category": {
      "mineral_zh": "辉石族",
      "mineral_en": "Jadeite (Pyroxene)",
      "chemical_formula": "NaAlSi₂O₆",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 3.34,
      "refractive_index": "1.660-1.680"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "翠绿",
          "en": "Imperial green"
        },
        {
          "zh": "苹果绿",
          "en": "Apple green"
        },
        {
          "zh": "紫罗兰",
          "en": "Lavender"
        },
        {
          "zh": "红翡",
          "en": "Red"
        },
        {
          "zh": "无色",
          "en": "Colorless"
        }
      ]
    }
  },
  {
    "id": "kunzite",
    "names": {
      "zh": "紫锂辉石",
      "en": "Kunzite"
    },
    "category": {
      "mineral_zh": "锂辉石（spodumene）",
      "mineral_en": "Spodumene",
      "chemical_formula": "LiAlSi₂O₆",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 3.18,
      "refractive_index": "1.66-1.68"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "淡紫粉",
          "en": "Pale lilac-pink"
        },
        {
          "zh": "薰衣草紫",
          "en": "Lavender"
        }
      ]
    }
  },
  {
    "id": "kyanite",
    "names": {
      "zh": "蓝晶石",
      "en": "Kyanite"
    },
    "category": {
      "mineral_zh": "硅酸盐（蓝晶石）",
      "mineral_en": "Silicate (disthene)",
      "chemical_formula": "Al₂SiO₅",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 3.68,
      "refractive_index": "1.71-1.73"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "湛蓝",
          "en": "Deep blue"
        },
        {
          "zh": "蓝黑",
          "en": "Blue-black"
        },
        {
          "zh": "绿",
          "en": "Green"
        }
      ]
    }
  },
  {
    "id": "labradorite",
    "names": {
      "zh": "拉长石",
      "en": "Labradorite"
    },
    "category": {
      "mineral_zh": "长石族",
      "mineral_en": "Feldspar (Plagioclase)",
      "chemical_formula": "(Ca,Na)(Si,Al)₄O₈",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.7,
      "refractive_index": "1.560-1.572"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "灰蓝色带晕彩",
          "en": "Gray-blue with labradorescence"
        },
        {
          "zh": "暗灰色带蓝/绿闪",
          "en": "Dark gray with blue-green flash"
        },
        {
          "zh": "光谱色",
          "en": "Full spectrum (Spectrolite)"
        }
      ]
    }
  },
  {
    "id": "lapis-lazuli",
    "names": {
      "zh": "青金石",
      "en": "Lapis Lazuli"
    },
    "category": {
      "mineral_zh": "青金石族（岩石）",
      "mineral_en": "Lazurite (rock)",
      "chemical_formula": "(Na,Ca)₈(AlSiO₄)₆(S,SO₄,Cl)₂",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 2.85,
      "refractive_index": "1.500-1.500"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "深蓝色（帝王蓝）",
          "en": "Deep blue (imperial)"
        },
        {
          "zh": "天蓝色",
          "en": "Sky blue"
        },
        {
          "zh": "蓝紫色",
          "en": "Violet-blue"
        }
      ]
    }
  },
  {
    "id": "malachite",
    "names": {
      "zh": "孔雀石",
      "en": "Malachite"
    },
    "category": {
      "mineral_zh": "碳酸盐",
      "mineral_en": "Carbonate",
      "chemical_formula": "Cu₂CO₃(OH)₂",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 4,
      "specific_gravity": 3.8,
      "refractive_index": "1.655-1.909"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "翠绿色",
          "en": "Bright green"
        },
        {
          "zh": "深绿色",
          "en": "Dark green"
        },
        {
          "zh": "孔雀绿",
          "en": "Peacock green"
        }
      ]
    }
  },
  {
    "id": "moonstone",
    "names": {
      "zh": "月光石",
      "en": "Moonstone"
    },
    "category": {
      "mineral_zh": "长石族",
      "mineral_en": "Feldspar (Orthoclase)",
      "chemical_formula": "(K,Na)AlSi₃O₈ (with albite lamellae)",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.57,
      "refractive_index": "1.518-1.530"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "白色带蓝光",
          "en": "White with blue sheen"
        },
        {
          "zh": "白色带银光",
          "en": "White with silver sheen"
        },
        {
          "zh": "白色带彩光",
          "en": "White with rainbow sheen"
        }
      ]
    }
  },
  {
    "id": "morganite",
    "names": {
      "zh": "摩根石",
      "en": "Morganite"
    },
    "category": {
      "mineral_zh": "绿柱石族",
      "mineral_en": "Beryl",
      "chemical_formula": "Be₃Al₂Si₆O₁₈",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 7.75,
      "specific_gravity": 2.71,
      "refractive_index": "1.560-1.600"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "粉色",
          "en": "Pink"
        },
        {
          "zh": "桃粉色",
          "en": "Peach pink"
        },
        {
          "zh": "紫粉色",
          "en": "Purplish pink"
        }
      ]
    }
  },
  {
    "id": "nephrite",
    "names": {
      "zh": "软玉",
      "en": "Nephrite (Hetian Jade)"
    },
    "category": {
      "mineral_zh": "角闪石族",
      "mineral_en": "Nephrite (Amphibole)",
      "chemical_formula": "Ca₂(Mg,Fe)₅Si₈O₂₂(OH)₂",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.96,
      "refractive_index": "1.606-1.632"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "羊脂白",
          "en": "Mutton-fat white"
        },
        {
          "zh": "青白",
          "en": "Greenish white"
        },
        {
          "zh": "碧绿",
          "en": "Spinach green"
        },
        {
          "zh": "黄玉色",
          "en": "Topaz yellow"
        },
        {
          "zh": "糖色",
          "en": "Brown (sugar)"
        }
      ]
    }
  },
  {
    "id": "obsidian",
    "names": {
      "zh": "黑曜石",
      "en": "Obsidian"
    },
    "category": {
      "mineral_zh": "火山玻璃",
      "mineral_en": "Volcanic glass",
      "chemical_formula": "SiO₂ (amorphous)",
      "crystal_system": "amorphous"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 2.4,
      "refractive_index": "1.48-1.51"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "黑色",
          "en": "Black"
        },
        {
          "zh": "棕色（马胡卡）",
          "en": "Brown (mahogany)"
        },
        {
          "zh": "银色/金色（银曜/金曜）",
          "en": "Silver/gold sheen"
        },
        {
          "zh": "彩虹色",
          "en": "Rainbow (iridescent)"
        }
      ]
    }
  },
  {
    "id": "opal",
    "names": {
      "zh": "欧泊",
      "en": "Opal"
    },
    "category": {
      "mineral_zh": "蛋白石",
      "mineral_en": "Opal",
      "chemical_formula": "SiO₂·nH₂O",
      "crystal_system": "amorphous"
    },
    "physical": {
      "hardness_mohs": 5.5,
      "specific_gravity": 2.1,
      "refractive_index": "1.370-1.470"
    },
    "optical": {
      "typical_colors": [
        {
          "zh": "黑欧泊",
          "en": "Black Opal"
        },
        {
          "zh": "白欧泊",
          "en": "White Opal"
        },
        {
          "zh": "火欧泊",
          "en": "Fire Opal"
        }
      ]
    }
  },
  {
    "id": "paraiba-tourmaline",
    "names": {
      "zh": "帕拉伊巴碧玺",
      "en": "Paraíba Tourmaline"
    },
    "category": {
      "mineral_zh": "电气石族",
      "mineral_en": "Tourmaline",
      "chemical_formula": "Na(Li,Al)₃Al₆(BO₃)₃Si₆O₁₈(OH)₃",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7.5,
      "specific_gravity": 3.06,
      "refractive_index": "1.614-1.666"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "电光蓝",
          "en": "Neon Blue"
        },
        {
          "zh": "蓝绿",
          "en": "Blue-Green"
        },
        {
          "zh": "紫罗兰",
          "en": "Violet"
        }
      ]
    }
  },
  {
    "id": "pearl",
    "names": {
      "zh": "珍珠",
      "en": "Pearl"
    },
    "category": {
      "mineral_zh": "有机宝石（碳酸钙）",
      "mineral_en": "Organic (calcium carbonate)",
      "chemical_formula": "CaCO₃ (aragonite + conchiolin)",
      "crystal_system": "amorphous"
    },
    "physical": {
      "hardness_mohs": 2.5,
      "specific_gravity": 2.7,
      "refractive_index": "1.52-1.69"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "白色",
          "en": "White"
        },
        {
          "zh": "奶油色",
          "en": "Cream"
        },
        {
          "zh": "金色",
          "en": "Golden"
        },
        {
          "zh": "黑色（大溪地）",
          "en": "Black (Tahitian)"
        }
      ]
    }
  },
  {
    "id": "peridot",
    "names": {
      "zh": "橄榄石",
      "en": "Peridot"
    },
    "category": {
      "mineral_zh": "橄榄石族",
      "mineral_en": "Olivine",
      "chemical_formula": "(Mg,Fe)₂SiO₄",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 6.75,
      "specific_gravity": 3.28,
      "refractive_index": "1.635-1.690"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "橄榄绿",
          "en": "Olive green"
        },
        {
          "zh": "黄绿色",
          "en": "Yellowish green"
        },
        {
          "zh": "褐绿色",
          "en": "Brownish green"
        }
      ]
    }
  },
  {
    "id": "prehnite",
    "names": {
      "zh": "葡萄石",
      "en": "Prehnite"
    },
    "category": {
      "mineral_zh": "硅酸盐（层状）",
      "mineral_en": "Phyllosilicate",
      "chemical_formula": "Ca₂Al(AlSi₃O₁₀)(OH)₂",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.9,
      "refractive_index": "1.611-1.672"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "浅绿色（葡萄绿）",
          "en": "Pale green"
        },
        {
          "zh": "黄绿色",
          "en": "Yellow-green"
        },
        {
          "zh": "无色至白色",
          "en": "Colorless to white"
        }
      ]
    }
  },
  {
    "id": "pyrite",
    "names": {
      "zh": "黄铁矿",
      "en": "Pyrite"
    },
    "category": {
      "mineral_zh": "硫化物",
      "mineral_en": "Sulfide",
      "chemical_formula": "FeS₂",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 6.5,
      "specific_gravity": 5.01,
      "refractive_index": "1.810-2.024"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "黄铜色至金棕色",
          "en": "Brass-yellow to golden brown"
        }
      ]
    }
  },
  {
    "id": "garnet-pyrope",
    "names": {
      "zh": "镁铝榴石",
      "en": "Pyrope (Garnet)"
    },
    "category": {
      "mineral_zh": "石榴石族",
      "mineral_en": "Garnet (Pyrope)",
      "chemical_formula": "Mg₃Al₂(SiO₄)₃",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 3.78,
      "refractive_index": "1.714-1.940"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "深红色",
          "en": "Deep red"
        },
        {
          "zh": "紫红色",
          "en": "Purplish red"
        },
        {
          "zh": "玫瑰红",
          "en": "Rose red"
        }
      ]
    }
  },
  {
    "id": "quartz-catseye",
    "names": {
      "zh": "石英猫眼",
      "en": "Quartz Cat's-eye"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz",
      "chemical_formula": "SiO2 + crocidolite fibers",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "黄绿色带猫眼",
          "en": "Yellow-green with cats-eye"
        },
        {
          "zh": "灰绿色",
          "en": "Olive green"
        },
        {
          "zh": "棕色",
          "en": "Brown"
        }
      ]
    }
  },
  {
    "id": "rhodochrosite",
    "names": {
      "zh": "菱锰矿",
      "en": "Rhodochrosite"
    },
    "category": {
      "mineral_zh": "碳酸盐",
      "mineral_en": "Carbonate",
      "chemical_formula": "MnCO₃",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 4,
      "specific_gravity": 3.7,
      "refractive_index": "1.600-1.820"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "玫瑰红",
          "en": "Rose red"
        },
        {
          "zh": "粉红色",
          "en": "Pink"
        },
        {
          "zh": "红白条带",
          "en": "Pink-white banding"
        }
      ]
    }
  },
  {
    "id": "rhodonite",
    "names": {
      "zh": "蔷薇辉石",
      "en": "Rhodonite"
    },
    "category": {
      "mineral_zh": "辉石族（紫苏辉石型）",
      "mineral_en": "Pyroxenoid",
      "chemical_formula": "MnSiO₃",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 3.68,
      "refractive_index": "1.716-1.752"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "玫瑰红色，带黑色氧化锰纹",
          "en": "Rose-red with black Mn-oxide veining"
        },
        {
          "zh": "粉红色",
          "en": "Pink"
        },
        {
          "zh": "红褐色",
          "en": "Reddish-brown"
        }
      ]
    }
  },
  {
    "id": "rock-crystal",
    "names": {
      "zh": "水晶",
      "en": "Rock Crystal"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz (crystalline)",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "无色透明",
          "en": "Colorless, transparent"
        }
      ]
    }
  },
  {
    "id": "rose-quartz",
    "names": {
      "zh": "粉晶",
      "en": "Rose Quartz"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "粉红色",
          "en": "Pink"
        },
        {
          "zh": "桃粉色",
          "en": "Peach pink"
        },
        {
          "zh": "紫粉色",
          "en": "Lavender pink"
        }
      ]
    }
  },
  {
    "id": "ruby",
    "names": {
      "zh": "红宝石",
      "en": "Ruby"
    },
    "category": {
      "mineral_zh": "刚玉族",
      "mineral_en": "Corundum",
      "chemical_formula": "Al₂O₃",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 9,
      "specific_gravity": 4,
      "refractive_index": "1.762-1.770"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "鸽血红",
          "en": "Pigeon Blood"
        },
        {
          "zh": "樱桃红",
          "en": "Cherry Red"
        },
        {
          "zh": "玫瑰红",
          "en": "Rose Red"
        }
      ]
    }
  },
  {
    "id": "sapphire",
    "names": {
      "zh": "蓝宝石",
      "en": "Sapphire"
    },
    "category": {
      "mineral_zh": "刚玉族",
      "mineral_en": "Corundum",
      "chemical_formula": "Al₂O₃",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 9,
      "specific_gravity": 4,
      "refractive_index": "1.762-1.770"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "矢车菊蓝",
          "en": "Cornflower Blue"
        },
        {
          "zh": "皇家蓝",
          "en": "Royal Blue"
        },
        {
          "zh": "帕帕拉恰",
          "en": "Padparadscha"
        }
      ]
    }
  },
  {
    "id": "serpentine",
    "names": {
      "zh": "蛇纹石",
      "en": "Serpentine"
    },
    "category": {
      "mineral_zh": "蛇纹石族",
      "mineral_en": "Serpentine group",
      "chemical_formula": "Mg₃Si₂O₅(OH)₄",
      "crystal_system": "monoclinic"
    },
    "physical": {
      "hardness_mohs": 4.5,
      "specific_gravity": 2.55,
      "refractive_index": "1.560-1.590"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "黄绿色",
          "en": "Yellow-green"
        },
        {
          "zh": "深绿色（岫玉）",
          "en": "Dark green (Xiuyan jade)"
        },
        {
          "zh": "蓝绿色",
          "en": "Blue-green"
        },
        {
          "zh": "白色带纹理",
          "en": "White with veining"
        }
      ]
    }
  },
  {
    "id": "smoky-quartz",
    "names": {
      "zh": "烟晶",
      "en": "Smoky Quartz"
    },
    "category": {
      "mineral_zh": "石英族",
      "mineral_en": "Quartz",
      "chemical_formula": "SiO₂",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.65,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "烟灰色",
          "en": "Smoky gray"
        },
        {
          "zh": "棕褐色",
          "en": "Brown"
        },
        {
          "zh": "黑色（墨晶）",
          "en": "Black"
        }
      ]
    }
  },
  {
    "id": "sodalite",
    "names": {
      "zh": "方钠石",
      "en": "Sodalite"
    },
    "category": {
      "mineral_zh": "方钠石族",
      "mineral_en": "Sodalite (Feldspathoid)",
      "chemical_formula": "Na₈(AlSiO₄)₆Cl₂",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 6,
      "specific_gravity": 2.28,
      "refractive_index": "1.483-1.490"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "深蓝色",
          "en": "Deep blue"
        },
        {
          "zh": "浅蓝色带白纹",
          "en": "Light blue with white veining"
        },
        {
          "zh": "紫蓝色",
          "en": "Violet-blue"
        }
      ]
    }
  },
  {
    "id": "garnet-spessartine",
    "names": {
      "zh": "锰铝榴石",
      "en": "Spessartine (Garnet)"
    },
    "category": {
      "mineral_zh": "石榴石族",
      "mineral_en": "Garnet (Spessartine)",
      "chemical_formula": "Mn₃Al₂(SiO₄)₃",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 4.16,
      "refractive_index": "1.790-1.820"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "橙黄色",
          "en": "Orange yellow"
        },
        {
          "zh": "橘红色",
          "en": "Tangerine"
        },
        {
          "zh": "芬达色",
          "en": "Fanta orange"
        }
      ]
    }
  },
  {
    "id": "sphalerite",
    "names": {
      "zh": "闪锌矿",
      "en": "Sphalerite"
    },
    "category": {
      "mineral_zh": "硫化物（闪锌矿）",
      "mineral_en": "Sulfide (zinc blende)",
      "chemical_formula": "ZnS",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 3.5,
      "specific_gravity": 4.09,
      "refractive_index": "2.37"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "橙黄",
          "en": "Orange-yellow"
        },
        {
          "zh": "红棕",
          "en": "Red-brown"
        },
        {
          "zh": "绿",
          "en": "Green"
        }
      ]
    }
  },
  {
    "id": "spinel",
    "names": {
      "zh": "尖晶石",
      "en": "Spinel"
    },
    "category": {
      "mineral_zh": "尖晶石族",
      "mineral_en": "Spinel",
      "chemical_formula": "MgAl₂O₄",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 8,
      "specific_gravity": 3.6,
      "refractive_index": "1.718"
    },
    "optical": {
      "typical_colors": [
        {
          "zh": "绝地武士红",
          "en": "Jedi Red"
        },
        {
          "zh": "钴蓝",
          "en": "Cobalt Blue"
        },
        {
          "zh": "薰衣草紫",
          "en": "Lavender"
        }
      ]
    }
  },
  {
    "id": "sugilite",
    "names": {
      "zh": "苏纪石",
      "en": "Sugilite"
    },
    "category": {
      "mineral_zh": "硅酸盐",
      "mineral_en": "Cyclosilicate",
      "chemical_formula": "KNa₂(Fe,Mn,Al)₂Li₃Si₁₂O₃₀",
      "crystal_system": "hexagonal"
    },
    "physical": {
      "hardness_mohs": 6.5,
      "specific_gravity": 2.74,
      "refractive_index": "1.607-1.638"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "紫红色",
          "en": "Purple-red"
        },
        {
          "zh": "紫罗兰",
          "en": "Violet"
        },
        {
          "zh": "粉紫色",
          "en": "Pink-purple"
        }
      ]
    }
  },
  {
    "id": "sunstone",
    "names": {
      "zh": "太阳石",
      "en": "Sunstone"
    },
    "category": {
      "mineral_zh": "长石族",
      "mineral_en": "Feldspar (Oligoclase / Labradorite)",
      "chemical_formula": "(Na,Ca)(Si,Al)₄O₈ + Cu/Fe platelets",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 6.25,
      "specific_gravity": 2.64,
      "refractive_index": "1.537-1.547"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "橙红色带金色闪",
          "en": "Red-orange with golden shimmer"
        },
        {
          "zh": "桃红色",
          "en": "Peach"
        },
        {
          "zh": "黄绿色",
          "en": "Yellow-green"
        }
      ]
    }
  },
  {
    "id": "tanzanite",
    "names": {
      "zh": "坦桑石",
      "en": "Tanzanite"
    },
    "category": {
      "mineral_zh": "黝帘石族",
      "mineral_en": "Zoisite",
      "chemical_formula": "Ca₂Al₃(SiO₄)₃(OH)",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 6.5,
      "specific_gravity": 3.35,
      "refractive_index": "1.691-1.700"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "蓝紫",
          "en": "Blue-Violet"
        },
        {
          "zh": "紫罗兰",
          "en": "Violet-Blue"
        }
      ]
    }
  },
  {
    "id": "tigers-eye",
    "names": {
      "zh": "虎眼石",
      "en": "Tiger's Eye"
    },
    "category": {
      "mineral_zh": "石英族（假象）",
      "mineral_en": "Quartz (pseudomorph)",
      "chemical_formula": "SiO₂ (pseudomorph after crocidolite)",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7,
      "specific_gravity": 2.64,
      "refractive_index": "1.544-1.553"
    },
    "optical": {
      "pleochroism": "none",
      "typical_colors": [
        {
          "zh": "金棕色（虎眼）",
          "en": "Golden brown"
        },
        {
          "zh": "蓝灰色（鹰眼）",
          "en": "Blue-gray (Hawk-eye)"
        },
        {
          "zh": "红棕色",
          "en": "Red-brown"
        }
      ]
    }
  },
  {
    "id": "topaz",
    "names": {
      "zh": "黄玉",
      "en": "Topaz"
    },
    "category": {
      "mineral_zh": "黄玉族",
      "mineral_en": "Topaz",
      "chemical_formula": "Al₂SiO₄(F,OH)₂",
      "crystal_system": "orthorhombic"
    },
    "physical": {
      "hardness_mohs": 8,
      "specific_gravity": 3.54,
      "refractive_index": "1.609-1.643"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "帝国黄",
          "en": "Imperial (golden yellow)"
        },
        {
          "zh": "蓝色",
          "en": "Blue"
        },
        {
          "zh": "粉色",
          "en": "Pink"
        },
        {
          "zh": "无色",
          "en": "Colorless"
        },
        {
          "zh": "雪莉酒色",
          "en": "Sherry"
        }
      ]
    }
  },
  {
    "id": "tourmaline",
    "names": {
      "zh": "碧玺",
      "en": "Tourmaline"
    },
    "category": {
      "mineral_zh": "电气石族",
      "mineral_en": "Elbaite (tourmaline group)",
      "chemical_formula": "Na(Li,Al)₃Al₆(BO₃)₃Si₆O₁₈(OH)₃",
      "crystal_system": "trigonal"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 3.06,
      "refractive_index": "1.614-1.666"
    },
    "optical": {
      "pleochroism": "strong",
      "typical_colors": [
        {
          "zh": "粉红",
          "en": "Pink"
        },
        {
          "zh": "绿色",
          "en": "Green"
        },
        {
          "zh": "蓝色",
          "en": "Blue"
        },
        {
          "zh": "双色（西瓜碧玺）",
          "en": "Bi-color (watermelon)"
        },
        {
          "zh": "黑色",
          "en": "Black"
        }
      ]
    }
  },
  {
    "id": "tsavorite-garnet",
    "names": {
      "zh": "沙弗莱石榴石",
      "en": "Tsavorite Garnet"
    },
    "category": {
      "mineral_zh": "石榴石族",
      "mineral_en": "Garnet",
      "chemical_formula": "Ca₃Al₂(SiO₄)₃",
      "crystal_system": "cubic"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 3.61,
      "refractive_index": "1.739-1.744"
    },
    "optical": {
      "typical_colors": [
        {
          "zh": "森林绿",
          "en": "Forest Green"
        },
        {
          "zh": "草绿",
          "en": "Grass Green"
        }
      ]
    }
  },
  {
    "id": "turquoise",
    "names": {
      "zh": "绿松石",
      "en": "Turquoise"
    },
    "category": {
      "mineral_zh": "含水铜铝磷酸盐",
      "mineral_en": "Hydrous copper aluminium phosphate",
      "chemical_formula": "CuAl₆(PO₄)₄(OH)₈·4H₂O",
      "crystal_system": "triclinic"
    },
    "physical": {
      "hardness_mohs": 6,
      "specific_gravity": 2.7,
      "refractive_index": "1.61-1.65"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "天空蓝",
          "en": "Sky blue"
        },
        {
          "zh": "蓝绿",
          "en": "Blue-green"
        },
        {
          "zh": "绿",
          "en": "Green"
        }
      ]
    }
  },
  {
    "id": "zircon",
    "names": {
      "zh": "锆石",
      "en": "Zircon"
    },
    "category": {
      "mineral_zh": "锆石族",
      "mineral_en": "Zircon",
      "chemical_formula": "ZrSiO₄",
      "crystal_system": "tetragonal"
    },
    "physical": {
      "hardness_mohs": 7.25,
      "specific_gravity": 4.65,
      "refractive_index": "1.810-2.024"
    },
    "optical": {
      "pleochroism": "weak",
      "typical_colors": [
        {
          "zh": "蓝色（加热）",
          "en": "Blue (heated)"
        },
        {
          "zh": "金黄色",
          "en": "Golden yellow"
        },
        {
          "zh": "无色",
          "en": "Colorless"
        },
        {
          "zh": "蜂蜜色",
          "en": "Honey"
        },
        {
          "zh": "红色",
          "en": "Red"
        }
      ]
    }
  }
]

export const GEM_COMPARISON_BY_ID: Record<string, GemComparisonRecord> = Object.fromEntries(
  GEM_COMPARISON_DATA.map(gem => [gem.id, gem]),
)
