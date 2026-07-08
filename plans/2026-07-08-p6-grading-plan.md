# P6 Implementation Plan — Grading Module

**Goal:** Module ④ (Grading) overview + 3 Vue components.

## Task 1: ColorGradeTable.vue

**File:** `docs/.vitepress/theme/components/ColorGradeTable.vue`

- Horizontal 23-segment color bar (D, E, F, G, H, I, J..., Z)
- Hardcoded hex colors per GIA standard
- Bilingual labels above/below
- Brass borders between segments

## Task 2: ClarityScale.vue

**File:** `docs/.vitepress/theme/components/ClarityScale.vue`

- Horizontal 6-segment scale (FL / IF / VVS / VS / SI / I)
- Hover tooltip with bilingual name + one-line description
- Brass accent on hover

## Task 3: ColorWheel.vue

**File:** `docs/.vitepress/theme/components/ColorWheel.vue`

- SVG 12-wedge color wheel
- Inner disc shows tone (white → dark) gradient
- Hover wedge → show hue name (bilingual)

## Task 4: Register components + write grading pages

**Modify:** `docs/.vitepress/theme/index.ts` — register 3 new components

**Files:**
- Create: `docs/en/grading/intro.md` — full content + 3 components
- Create: `docs/zh/grading/intro.md` — Chinese version