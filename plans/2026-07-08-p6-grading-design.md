# P6 Design Spec — Grading Module (Module ④)

**Goal:** Build Module ④ (Grading) with overview content + 3 Vue components: ColorGradeTable, ClarityScale, ColorWheel.

## Pages

### docs/{en,zh}/grading/intro.md

Sections:
- GIA 4Cs (Carat / Color / Clarity / Cut) — conceptual intro
- Color grading: `<ColorGradeTable>` for D-Z scale
- Clarity grading: `<ClarityScale>` for FL–I3
- Fancy color grading: `<ColorWheel>` for hue/tone/saturation
- Treatment disclosure (LMHC standard)
- Origin premiums (Ruby, Emerald, Sapphire, Alexandrite, Paraiba Tourmaline)

## Components

### ColorGradeTable.vue

**Path:** `docs/.vitepress/theme/components/ColorGradeTable.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Hardcoded D-Z 23-letter scale with labels.

**Render:** Horizontal 23-segment color bar. Each segment has slight color tint (D=white, Z=light yellow with gradient progression).

**Style:** 23 narrow columns, brass border, ivory text.

**Ponytail decisions:**
- Static color gradient (no animations)
- Hex values from GIA standard
- Mobile: stack to 2 rows via media query

### ClarityScale.vue

**Path:** `docs/.vitepress/theme/components/ClarityScale.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Hardcoded FL → I3 11 levels consolidated into 6 segments (FL, IF, VVS, VS, SI, I).

**Render:** Horizontal 6-segment bar. On hover, highlight + show tooltip with level name and description.

**Style:** Ink-700 base, brass accent on hover, ivory text.

### ColorWheel.vue

**Path:** `docs/.vitepress/theme/components/ColorWheel.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Hardcoded 12 hue segments (Red, Orange, Yellow, Yellow-Green, Green, Blue-Green, Blue, Blue-Violet, Violet, Red-Violet, Red-Orange, etc.).

**Render:** SVG circle with 12 wedge segments. Inner center disc shows tone indicator (white → grey → black gradient). Hover: highlight wedge + show hue name.

**Style:** Pure CSS gradients for each wedge; ink-900 center; brass borders.

**Ponytail decisions:**
- Static (no slider)
- Hover tooltips (no animation)
- Hue order: GIA standard wheel