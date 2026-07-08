# P1 Implementation Plan — Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the typed data layer (10 gem YAMLs + 2 shared YAMLs + Zod schema + validate script + vitest test) that all later modules consume.

**Architecture:** Single source of truth = `data/gems/v1/*.yaml` (one file per gem, core 5 modules). Shared taxonomies (crystal systems + Mohs scale) live in `data/shared/*.yaml`. A single Zod schema (`scripts/build/schema.ts`) is the runtime + compile-time contract. `scripts/build/validate-data.ts` reads YAMLs and validates against the schema; the same schema is re-exported as a vitest test in `tests/data-validation.test.ts`.

**Tech Stack:** Zod 3.x, js-yaml 4.x, tsx 4.x (script runner), vitest 2.x (test runner), TypeScript 5.x.

## Global Constraints

- Project root: `D:\Study\gematlas`
- Package manager: **pnpm 9.15.0** (via corepack), NOT npm
- Node: ≥20
- TypeScript strict mode ON
- All YAML files use 2-space indent, UTF-8, LF line endings
- Gem IDs: kebab-case English nouns (e.g. `paraiba-tourmaline`)
- Every gem YAML must have bilingual names under `names.zh` / `names.en`
- No `//` or `/* */` comments in any JSON file (per gem-stage-discipline)
- Do NOT pre-install `echarts` / `mermaid` — they belong to P3

---

## File Structure (P1 deliverables)

```
data/
├── gemstones/
│   └── v1/                                  ← 10 gem YAMLs land here
│       ├── ruby.yaml
│       ├── sapphire.yaml
│       ├── emerald.yaml
│       ├── diamond.yaml
│       ├── spinel.yaml
│       ├── tanzanite.yaml
│       ├── alexandrite.yaml
│       ├── paraiba-tourmaline.yaml
│       ├── tsavorite-garnet.yaml
│       └── opal.yaml
└── shared/
    ├── crystal-systems.yaml                 ← 7 crystal systems
    └── mohs-scale.yaml                      ← 1–10 reference minerals

scripts/
├── build/
│   ├── schema.ts                            ← Zod schema (single source of truth)
│   └── validate-data.ts                     ← CLI: read YAMLs, validate, exit non-zero on fail
└── utils/
    └── i18n-helpers.ts                      ← readZh/En helpers

tests/
└── data-validation.test.ts                  ← vitest wrapper around schema

package.json                                 ← add zod, js-yaml, tsx, vitest deps + scripts
tsconfig.json                                ← extend include to scripts/, tests/
```

---

## Task 1: Add P1 dependencies to package.json

**Files:**
- Modify: `package.json:23-26` (add devDependencies)

**Interfaces:**
- Produces: `pnpm install` succeeds; `pnpm tsx scripts/build/validate-data.ts` becomes available after Task 4 lands.

- [ ] **Step 1: Update package.json with P1 dependencies and scripts**

Replace the `devDependencies` block and `scripts` block in `D:\Study\gematlas\package.json` with:

```json
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs",
    "validate:data": "tsx scripts/build/validate-data.ts",
    "test": "vitest run"
  },
  "devDependencies": {
    "@vue/tsconfig": "^0.5.1",
    "js-yaml": "^4.1.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "vitepress": "^1.6.0",
    "vitest": "^2.1.2",
    "vue": "^3.5.10",
    "zod": "^3.23.8"
  }
```

Note: gray-matter is **NOT** added in P1 — we read raw YAML, not Markdown with front-matter. (Avoid YAGNI.)

- [ ] **Step 2: Install**

Run: `cd D:\Study\gematlas && pnpm install`
Expected: exit 0; lists `+ js-yaml`, `+ tsx`, `+ vitest`, `+ zod` in devDependencies.

- [ ] **Step 3: Verify scripts work**

Run: `cd D:\Study\gematlas && pnpm run validate:data` (will fail — `scripts/build/validate-data.ts` doesn't exist yet; that's Task 4). Expected: non-zero exit code with "Cannot find module" error.
Then: `cd D:\Study\gematlas && pnpm test` (will pass — vitest finds no tests yet). Expected: "No test files found".

Both confirms deps installed.

---

## Task 2: Extend tsconfig.json to include scripts/ and tests/

**Files:**
- Modify: `tsconfig.json:18-22` (extend `include`)

**Interfaces:**
- Produces: TypeScript compiles `scripts/build/schema.ts` and `tests/data-validation.test.ts` without `Cannot find module` errors.

- [ ] **Step 1: Replace the include array**

Replace the `"include"` array in `D:\Study\gematlas\tsconfig.json` with:

```json
  "include": [
    "docs/.vitepress/**/*.ts",
    "docs/.vitepress/**/*.vue",
    "scripts/**/*.ts",
    "tests/**/*.ts"
  ],
```

- [ ] **Step 2: Verify tsc compiles the new directories**

Run: `cd D:\Study\gematlas && pnpm exec tsc --noEmit`
Expected: exit 0 (currently no scripts/tests TS files yet → trivially passes). This confirms tsconfig now scans the directories.

---

## Task 3: Write shared YAMLs (crystal-systems.yaml + mohs-scale.yaml)

**Files:**
- Create: `data/shared/crystal-systems.yaml`
- Create: `data/shared/mohs-scale.yaml`

**Interfaces:**
- Produces: `CrystalSystem[]` and `MohsEntry[]` shapes consumable by Zod schema in Task 4.

- [ ] **Step 1: Create crystal-systems.yaml**

Write `D:\Study\gematlas\data\shared\crystal-systems.yaml`:

```yaml
# 7 crystal systems (IUCr classification). Consumed by the
# Classification module (P3) and by each gem's `crystal_system` field.
systems:
  - id: cubic
    name_zh: 等轴晶系
    name_en: Cubic (Isometric)
    examples: [Diamond, Garnet, Spinel]
    symmetry: highest
  - id: tetragonal
    name_zh: 四方晶系
    name_en: Tetragonal
    examples: [Zircon, Rutile]
  - id: orthorhombic
    name_zh: 斜方晶系
    name_en: Orthorhombic
    examples: [Topaz, Tanzanite, Alexandrite]
  - id: hexagonal
    name_zh: 六方晶系
    name_en: Hexagonal
    examples: [Beryl, Apatite]
  - id: trigonal
    name_zh: 三方晶系
    name_en: Trigonal
    examples: [Ruby, Sapphire, Quartz, Tourmaline]
  - id: monoclinic
    name_zh: 单斜晶系
    name_en: Monoclinic
    examples: [Orthoclase, Spodumene, Diopside]
  - id: triclinic
    name_zh: 三斜晶系
    name_en: Triclinic
    examples: [Kyanite, Turquoise, Rhodonite]
```

- [ ] **Step 2: Create mohs-scale.yaml**

Write `D:\Study\gematlas\data\shared\mohs-scale.yaml`:

```yaml
# Mohs hardness scale (1–10) reference minerals. Consumed by the
# Identification module (P2) and by each gem's `hardness_mohs` field.
# Reference: Friedrich Mohs, 1812.
scale:
  - { hardness: 1, mineral_zh: 滑石, mineral_en: Talc }
  - { hardness: 2, mineral_zh: 石膏, mineral_en: Gypsum }
  - { hardness: 3, mineral_zh: 方解石, mineral_en: Calcite }
  - { hardness: 4, mineral_zh: 萤石, mineral_en: Fluorite }
  - { hardness: 5, mineral_zh: 磷灰石, mineral_en: Apatite }
  - { hardness: 6, mineral_zh: 正长石, mineral_en: Orthoclase }
  - { hardness: 7, mineral_zh: 石英, mineral_en: Quartz }
  - { hardness: 8, mineral_zh: 黄玉, mineral_en: Topaz }
  - { hardness: 9, mineral_zh: 刚玉, mineral_en: Corundum }
  - { hardness: 10, mineral_zh: 金刚石, mineral_en: Diamond }
```

- [ ] **Step 3: Verify YAML parses**

Create a temporary script `D:\Study\gematlas\scripts\utils\i18n-helpers.ts` (full content in Task 4 Step 1).
Run: `cd D:\Study\gematlas && pnpm exec tsx -e "import yaml from 'js-yaml'; import fs from 'node:fs'; console.log(yaml.load(fs.readFileSync('data/shared/crystal-systems.yaml','utf8'))); console.log(yaml.load(fs.readFileSync('data/shared/mohs-scale.yaml','utf8')));"`
Expected: both YAMLs print as JS objects. Confirms parsing.

---

## Task 4: Write the Zod schema (scripts/build/schema.ts)

**Files:**
- Create: `scripts/utils/i18n-helpers.ts` (consumed by schema and validate script)
- Create: `scripts/build/schema.ts` (single source of truth)

**Interfaces:**
- Produces:
  - `import { GemSchema } from './scripts/build/schema'` → Zod schema for one gem
  - `import { SharedSchema } from './scripts/build/schema'` → Zod schema for shared files
  - `Gem` TS type (`z.infer<typeof GemSchema>`)

- [ ] **Step 1: Create i18n-helpers.ts**

Write `D:\Study\gematlas\scripts\utils\i18n-helpers.ts`:

```ts
import { z } from 'zod'

/** Bilingual name pair (zh + en). Used everywhere content has translations. */
export const BilingualName = z.object({
  zh: z.string().min(1),
  en: z.string().min(1),
})
export type BilingualName = z.infer<typeof BilingualName>
```

- [ ] **Step 2: Create schema.ts (the single source of truth)**

Write `D:\Study\gematlas\scripts\build\schema.ts`:

```ts
import { z } from 'zod'
import { BilingualName } from '../utils/i18n-helpers'

/* ─── Shared taxonomies (data/shared/*.yaml) ─────────────────── */

export const CrystalSystemEntry = z.object({
  id: z.enum([
    'cubic', 'tetragonal', 'orthorhombic',
    'hexagonal', 'trigonal', 'monoclinic', 'triclinic',
  ]),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  examples: z.array(z.string()).optional(),
  symmetry: z.string().optional(),
})
export const CrystalSystemsFile = z.object({
  systems: z.array(CrystalSystemEntry).length(7),
})

export const MohsEntry = z.object({
  hardness: z.number().int().min(1).max(10),
  mineral_zh: z.string().min(1),
  mineral_en: z.string().min(1),
})
export const MohsScaleFile = z.object({
  scale: z.array(MohsEntry).length(10),
})

/* ─── Gem (data/gems/v1/*.yaml) — core 5 modules ───────── */

/** Each gem's mineralogical / chemical identity. */
export const GemCategory = z.object({
  mineral_zh: z.string().min(1),
  mineral_en: z.string().min(1),
  chemical_formula: z.string().min(1),
  crystal_system: CrystalSystemEntry.shape.id,
})

/** Physical / optical measurements used in identification. */
export const GemPhysical = z.object({
  hardness_mohs: z.number().min(1).max(10),
  hardness_note_zh: z.string().optional(),
  hardness_note_en: z.string().optional(),
  specific_gravity: z.number().positive(),
  refractive_index: z.string().regex(/^\d+\.\d+-\d+\.\d+$/, 'Use "min-max" format e.g. "1.762-1.770"'),
})

/** Optical phenomena and color causes. */
export const GemOptical = z.object({
  pleochroism: z.enum(['none', 'weak', 'moderate', 'strong']).optional(),
  typical_colors: z.array(BilingualName).min(1),
  color_causes_zh: z.string().min(1),
  color_causes_en: z.string().min(1),
})

/** Common treatments and disclosure requirements. */
export const GemTreatments = z.object({
  common: z.array(z.string()).default([]),
  disclosure_required: z.boolean(),
  note_zh: z.string().optional(),
  note_en: z.string().optional(),
})

/** The full Gem YAML shape. */
export const GemSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'kebab-case id'),
  names: BilingualName,
  category: GemCategory,
  physical: GemPhysical,
  optical: GemOptical,
  treatments: GemTreatments,
})
export type Gem = z.infer<typeof GemSchema>
```

- [ ] **Step 3: Run tsc to verify schema.ts compiles**

Run: `cd D:\Study\gematlas && pnpm exec tsc --noEmit`
Expected: exit 0.

---

## Task 5: Write the first gem YAML (ruby.yaml) — and verify with the schema

**Files:**
- Create: `data/gems/v1/ruby.yaml`

**Interfaces:**
- Produces: A gem YAML that passes `GemSchema.parse(...)`.

- [ ] **Step 1: Create ruby.yaml**

Write `D:\Study\gematlas\data\gemstones\v1\ruby.yaml`:

```yaml
# Ruby (corundum family). Source: GIA Encyclopedia + Schumann (2009).
id: ruby
names:
  zh: 红宝石
  en: Ruby
category:
  mineral_zh: 刚玉族
  mineral_en: Corundum
  chemical_formula: Al₂O₃
  crystal_system: trigonal
physical:
  hardness_mohs: 9
  hardness_note_zh: 仅次于钻石
  hardness_note_en: Second only to diamond
  specific_gravity: 4.00
  refractive_index: 1.762-1.770
optical:
  pleochroism: strong
  typical_colors:
    - { zh: 鸽血红, en: Pigeon Blood }
    - { zh: 樱桃红, en: Cherry Red }
    - { zh: 玫瑰红, en: Rose Red }
  color_causes_zh: Cr³⁺ 离子致色
  color_causes_en: Chromium (Cr³⁺) trace ions
treatments:
  common:
    - heat-treatment
  disclosure_required: true
  note_zh: 绝大多数商业红宝石经过热处理，市场可接受；无处理溢价显著
  note_en: Most commercial rubies are heat-treated; untreated stones command significant premiums
```

- [ ] **Step 2: Verify ruby.yaml against the schema via ad-hoc command**

Run:

```bash
cd D:\Study\gematlas && pnpm exec tsx -e "
import yaml from 'js-yaml';
import fs from 'node:fs';
import { GemSchema } from './scripts/build/schema';
const raw = yaml.load(fs.readFileSync('data/gems/v1/ruby.yaml','utf8'));
const parsed = GemSchema.parse(raw);
console.log('OK:', parsed.names.en, '— hardness', parsed.physical.hardness_mohs);
"
```

Expected: `OK: Ruby — hardness 9` and exit 0. If exit non-zero: read the Zod error message, fix the YAML, retry.

---

## Task 6: Write remaining 9 gem YAMLs (one schema validation per file)

**Files:**
- Create: `data/gems/v1/sapphire.yaml`, `emerald.yaml`, `diamond.yaml`, `spinel.yaml`, `tanzanite.yaml`, `alexandrite.yaml`, `paraiba-tourmaline.yaml`, `tsavorite-garnet.yaml`, `opal.yaml`

**Interfaces:**
- Each must parse cleanly via `GemSchema.parse(yaml.load(fs.readFileSync(...)))`.
- IDs: `sapphire`, `emerald`, `diamond`, `spinel`, `tanzanite`, `alexandrite`, `paraiba-tourmaline`, `tsavorite-garnet`, `opal`.

**Per-gem data (paste each block into its file):**

**sapphire.yaml:**
```yaml
id: sapphire
names: { zh: 蓝宝石, en: Sapphire }
category:
  mineral_zh: 刚玉族
  mineral_en: Corundum
  chemical_formula: Al₂O₃
  crystal_system: trigonal
physical:
  hardness_mohs: 9
  hardness_note_zh: 仅次于钻石
  hardness_note_en: Second only to diamond
  specific_gravity: 4.00
  refractive_index: 1.762-1.770
optical:
  pleochroism: strong
  typical_colors:
    - { zh: 矢车菊蓝, en: Cornflower Blue }
    - { zh: 皇家蓝, en: Royal Blue }
    - { zh: 帕帕拉恰, en: Padparadscha }
  color_causes_zh: Fe²⁺/Ti⁴⁺ 离子致色（蓝色）；Cr³⁺ 致粉橙（帕帕拉恰）
  color_causes_en: Fe²⁺/Ti⁴⁺ (blue); Cr³⁺ (Padparadscha)
treatments:
  common:
    - heat-treatment
  disclosure_required: true
  note_zh: 热处理普遍，无处理稀少
  note_en: Heat treatment is industry standard; untreated is rare
```

**emerald.yaml:**
```yaml
id: emerald
names: { zh: 祖母绿, en: Emerald }
category:
  mineral_zh: 绿柱石族
  mineral_en: Beryl
  chemical_formula: Be₃Al₂Si₆O₁₈
  crystal_system: hexagonal
physical:
  hardness_mohs: 7.75
  hardness_note_zh: 性脆，避免撞击
  hardness_note_en: Brittle; avoid impact
  specific_gravity: 2.72
  refractive_index: 1.577-1.583
optical:
  pleochroism: weak
  typical_colors:
    - { zh: 木佐绿, en: Muzo Green }
    - { zh: 哥伦比亚绿, en: Colombian Green }
  color_causes_zh: Cr³⁺ 与 V³⁺ 离子致色
  color_causes_en: Chromium and/or vanadium trace ions
treatments:
  common:
    - cedar-oil-filling
  disclosure_required: true
  note_zh: 注油（雪松油）属行业可接受处理；无油溢价显著
  note_en: Cedar-oil filling is industry standard; "no oil" commands significant premiums
```

**diamond.yaml:**
```yaml
id: diamond
names: { zh: 钻石, en: Diamond }
category:
  mineral_zh: 金刚石
  mineral_en: Diamond
  chemical_formula: C
  crystal_system: cubic
physical:
  hardness_mohs: 10
  hardness_note_zh: 自然界最硬
  hardness_note_en: Hardest natural material
  specific_gravity: 3.52
  refractive_index: 2.417-2.419
optical:
  typical_colors:
    - { zh: 无色, en: Colorless }
    - { zh: 彩黄, en: Fancy Yellow }
  color_causes_zh: 无色纯净；黄色由 N 原子致色
  color_causes_en: Pure (colorless); N atoms cause yellow
treatments:
  common:
    - high-pressure-high-temperature
  disclosure_required: true
  note_zh: HPHT 处理需披露；天然与合成需激光刻印区分
  note_en: HPHT treatment must be disclosed; natural vs. synthetic distinguished by laser inscription
```

**spinel.yaml:**
```yaml
id: spinel
names: { zh: 尖晶石, en: Spinel }
category:
  mineral_zh: 尖晶石族
  mineral_en: Spinel
  chemical_formula: MgAl₂O₄
  crystal_system: cubic
physical:
  hardness_mohs: 8
  specific_gravity: 3.60
  refractive_index: 1.712-1.762
optical:
  typical_colors:
    - { zh: 绝地武士红, en: Jedi Red }
    - { zh: 钴蓝, en: Cobalt Blue }
    - { zh: 薰衣草紫, en: Lavender }
  color_causes_zh: Cr³⁺ 致红；Fe²⁺ 致蓝；V 致多种色调
  color_causes_en: Cr³⁺ (red); Fe²⁺ (blue); V (varied)
treatments:
  common: []
  disclosure_required: false
```

**tanzanite.yaml:**
```yaml
id: tanzanite
names: { zh: 坦桑石, en: Tanzanite }
category:
  mineral_zh: 黝帘石族
  mineral_en: Zoisite
  chemical_formula: Ca₂Al₃(SiO₄)₃(OH)
  crystal_system: orthorhombic
physical:
  hardness_mohs: 6.5
  hardness_note_zh: 性较脆，注意避免撞击
  hardness_note_en: Relatively brittle
  specific_gravity: 3.35
  refractive_index: 1.691-1.700
optical:
  pleochroism: strong
  typical_colors:
    - { zh: 蓝紫, en: Blue-Violet }
    - { zh: 紫罗兰, en: Violet-Blue }
  color_causes_zh: V³⁺ 离子致色
  color_causes_en: Vanadium (V³⁺) trace ions
treatments:
  common:
    - heat-treatment
  disclosure_required: true
  note_zh: 几乎所有坦桑石均经热处理以增强蓝紫调
  note_en: Almost all tanzanite is heat-treated to enhance blue-violet
```

**alexandrite.yaml:**
```yaml
id: alexandrite
names: { zh: 亚历山大石, en: Alexandrite }
category:
  mineral_zh: 金绿宝石族
  mineral_en: Chrysoberyl
  chemical_formula: BeAl₂O₄
  crystal_system: orthorhombic
physical:
  hardness_mohs: 8.5
  specific_gravity: 3.73
  refractive_index: 1.746-1.755
optical:
  pleochroism: strong
  typical_colors:
    - { zh: 日光下绿, en: Green in daylight }
    - { zh: 灯光下红, en: Red in incandescent light }
  color_causes_zh: Cr³⁺ 离子致变色效应
  color_causes_en: Cr³⁺ causes color-change effect
treatments:
  common: []
  disclosure_required: false
  note_zh: 几乎无处理；产地溢价显著（俄罗斯/巴西/斯里兰卡）
  note_en: Virtually untreated; origin commands significant premium
```

**paraiba-tourmaline.yaml:**
```yaml
id: paraiba-tourmaline
names: { zh: 帕拉伊巴碧玺, en: Paraíba Tourmaline }
category:
  mineral_zh: 电气石族
  mineral_en: Tourmaline
  chemical_formula: Na(Li,Al)₃Al₆(BO₃)₃Si₆O₁₈(OH)₃
  crystal_system: trigonal
physical:
  hardness_mohs: 7.5
  specific_gravity: 3.06
  refractive_index: 1.614-1.666
optical:
  pleochroism: strong
  typical_colors:
    - { zh: 电光蓝, en: Neon Blue }
    - { zh: 蓝绿, en: Blue-Green }
    - { zh: 紫罗兰, en: Violet }
  color_causes_zh: Cu²⁺ 离子致霓虹色（核心产地溢价根源）
  color_causes_en: Cu²⁺ trace ions cause neon hues (origin premium driver)
treatments:
  common:
    - heat-treatment
  disclosure_required: true
  note_zh: 巴西 Paraiba 州原产稀缺，莫桑比克产替代但溢价低
  note_en: Original Brazilian Paraíba is scarce; Mozambique material trades at lower premium
```

**tsavorite-garnet.yaml:**
```yaml
id: tsavorite-garnet
names: { zh: 沙弗莱石榴石, en: Tsavorite Garnet }
category:
  mineral_zh: 石榴石族
  mineral_en: Garnet
  chemical_formula: Ca₃Al₂(SiO₄)₃
  crystal_system: cubic
physical:
  hardness_mohs: 7.25
  specific_gravity: 3.61
  refractive_index: 1.739-1.744
optical:
  typical_colors:
    - { zh: 森林绿, en: Forest Green }
    - { zh: 草绿, en: Grass Green }
  color_causes_zh: V³⁺ 与 Cr³⁺ 离子致色
  color_causes_en: V³⁺ and Cr³⁺ trace ions
treatments:
  common: []
  disclosure_required: false
  note_zh: 无处理需求；稀缺性来自肯尼亚/坦桑尼亚小矿脉
  note_en: No treatment needed; scarcity from small Kenya/Tanzania veins
```

**opal.yaml:**
```yaml
id: opal
names: { zh: 欧泊, en: Opal }
category:
  mineral_zh: 蛋白石
  mineral_en: Opal
  chemical_formula: SiO₂·nH₂O
  crystal_system: amorphous
physical:
  hardness_mohs: 5.5
  hardness_note_zh: 含水，避免高温与脱水
  hardness_note_en: Hydrated; avoid heat and dehydration
  specific_gravity: 2.10
  refractive_index: 1.370-1.470
optical:
  phenomena:
    - play-of-color
  typical_colors:
    - { zh: 黑欧泊, en: Black Opal }
    - { zh: 白欧泊, en: White Opal }
    - { zh: 火欧泊, en: Fire Opal }
  color_causes_zh: 二氧化硅球粒衍射光栅产生变彩
  color_causes_en: Silica sphere diffraction grating produces play-of-color
treatments:
  common:
    - sugar-acid-treatment
  disclosure_required: true
  note_zh: 糖酸处理用于仿黑欧泊，需披露
  note_en: Sugar-acid treatment simulates black opal; must be disclosed
```

Note: `crystal_system: amorphous` in `opal.yaml` violates the Zod enum. **You must extend the schema first** in the schema.ts file before this YAML passes validation. Add `amorphous` to the enum.

- [ ] **Step 1: Extend schema.ts enum to include `amorphous`**

In `scripts/build/schema.ts`, replace the `id: z.enum([...])` block under `CrystalSystemEntry` with:

```ts
  id: z.enum([
    'cubic', 'tetragonal', 'orthorhombic',
    'hexagonal', 'trigonal', 'monoclinic', 'triclinic',
    'amorphous', // opal, obsidian, amber
  ]),
```

- [ ] **Step 2: Write all 9 remaining gem YAMLs**

Write each block above to its corresponding file at `data/gems/v1/<id>.yaml`.

- [ ] **Step 3: Validate all 10 gem YAMLs at once**

Run:

```bash
cd D:\Study\gematlas && pnpm exec tsx -e "
import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import { GemSchema } from './scripts/build/schema';
const dir = 'data/gems/v1';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));
let ok = 0, bad = 0;
for (const f of files) {
  try {
    const raw = yaml.load(fs.readFileSync(path.join(dir,f),'utf8'));
    GemSchema.parse(raw);
    console.log('  ✓', f);
    ok++;
  } catch (e) {
    console.error('  ✗', f, e.message);
    bad++;
  }
}
console.log(\`\\nResult: \${ok}/\${ok+bad} gems valid\`);
process.exit(bad === 0 ? 0 : 1);
"
```

Expected: `Result: 10/10 gems valid` and exit 0.

---

## Task 7: Write the validate-data CLI (scripts/build/validate-data.ts)

**Files:**
- Create: `scripts/build/validate-data.ts`

**Interfaces:**
- Produces: `pnpm validate:data` exits 0 when all 10 gems + 2 shared files pass; non-zero on any failure.

- [ ] **Step 1: Create validate-data.ts**

Write `D:\Study\gematlas\scripts\build\validate-data.ts`:

```ts
#!/usr/bin/env tsx
/**
 * validate-data — schema validation for GemAtlas YAML data layer.
 *
 * Validates every YAML under data/gems/v1/ against GemSchema,
 * and data/shared/*.yaml against their respective schemas.
 * Exits 0 if everything passes; 1 if anything fails.
 *
 * Usage:  pnpm validate:data
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import {
  GemSchema,
  CrystalSystemsFile,
  MohsScaleFile,
} from './schema'

const GEM_DIR = 'data/gems/v1'
const SHARED_DIR = 'data/shared'

let pass = 0
let fail = 0

function validate(filePath: string, schema: { parse: (x: unknown) => unknown }, label: string) {
  try {
    const raw = yaml.load(fs.readFileSync(filePath, 'utf8'))
    schema.parse(raw)
    console.log(`  ✓ ${label}`)
    pass++
  } catch (e) {
    console.error(`  ✗ ${label}\n      ${(e as Error).message}`)
    fail++
  }
}

console.log(`\n── GemAtlas data validation ──\n`)

// 10 gems
for (const f of fs.readdirSync(GEM_DIR).filter(x => x.endsWith('.yaml'))) {
  validate(path.join(GEM_DIR, f), GemSchema, `gem: ${f}`)
}

// 2 shared
validate(path.join(SHARED_DIR, 'crystal-systems.yaml'), CrystalSystemsFile, 'shared: crystal-systems.yaml')
validate(path.join(SHARED_DIR, 'mohs-scale.yaml'),       MohsScaleFile,       'shared: mohs-scale.yaml')

console.log(`\nResult: ${pass}/${pass + fail} files valid`)
process.exit(fail === 0 ? 0 : 1)
```

- [ ] **Step 2: Run the CLI**

Run: `cd D:\Study\gematlas && pnpm validate:data`
Expected: `Result: 12/12 files valid` and exit 0.

---

## Task 8: Wrap schema validation in vitest (tests/data-validation.test.ts)

**Files:**
- Create: `tests/data-validation.test.ts`

**Interfaces:**
- Produces: `pnpm test` runs and reports 12 passing tests.

- [ ] **Step 1: Create data-validation.test.ts**

Write `D:\Study\gematlas\tests\data-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import {
  GemSchema,
  CrystalSystemsFile,
  MohsScaleFile,
} from '../scripts/build/schema'

const GEM_DIR = 'data/gems/v1'
const SHARED_DIR = 'data/shared'

describe('Gem YAML validation', () => {
  for (const file of fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))) {
    it(`${file} parses against GemSchema`, () => {
      const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
      expect(() => GemSchema.parse(raw)).not.toThrow()
    })
  }
})

describe('Shared YAML validation', () => {
  it('crystal-systems.yaml parses (7 systems)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'crystal-systems.yaml'), 'utf8'))
    const parsed = CrystalSystemsFile.parse(raw)
    expect(parsed.systems).toHaveLength(7)
  })

  it('mohs-scale.yaml parses (10 entries)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'mohs-scale.yaml'), 'utf8'))
    const parsed = MohsScaleFile.parse(raw)
    expect(parsed.scale).toHaveLength(10)
  })
})
```

- [ ] **Step 2: Run vitest**

Run: `cd D:\Study\gematlas && pnpm test`
Expected: `Test Files  1 passed (1)` / `Tests  12 passed (12)` and exit 0.

---

## Task 9: Self-Review (per writing-plans requirement)

- [ ] **Step 1: Coverage check** — every P1 deliverable from the brainstorm appears in a task:
  - 10 gem YAMLs (core 5 modules) → Tasks 5 + 6
  - crystal-systems.yaml + mohs-scale.yaml → Task 3
  - Zod schema → Task 4
  - validate-data CLI → Task 7
  - vitest wrapper → Task 8
  - dependencies + tsconfig → Tasks 1 + 2

- [ ] **Step 2: Placeholder scan** — re-read plan; no "TODO / TBD / similar to Task N" placeholders remain. Every code block is complete and runnable.

- [ ] **Step 3: Type consistency** — `Gem` type is defined exactly once in Task 4 and referenced by name in Task 7 and Task 8. Shared file schema names (`CrystalSystemsFile`, `MohsScaleFile`) match across Tasks 4, 7, 8. No rename drift.

---

## Verification Handoff (per gem-verification-protocol)

After all 9 tasks complete, the following must ALL pass before declaring P1 done:

```
- [ ] pnpm install          → exit 0
- [ ] pnpm exec tsc --noEmit → exit 0
- [ ] pnpm validate:data    → "Result: 12/12 files valid" and exit 0
- [ ] pnpm test             → 12 tests pass and exit 0
- [ ] pnpm build            → exit 0
- [ ] dev server returns HTTP 200 for / , /zh/
```

Final report should paste each command's last 1-2 lines of output as evidence.