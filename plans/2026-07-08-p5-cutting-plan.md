# P5 Implementation Plan — Cutting Module

**Goal:** Module ③ (Cutting) overview + 2 Vue components (FacetDiagram, FancyCutGrid).

## Task 1: FacetDiagram.vue

**File:** `docs/.vitepress/theme/components/FacetDiagram.vue`

- Side-view SVG of round brilliant cut (5 labeled parts)
- Hardcoded bilingual labels for: table / crown / girdle / pavilion / culet
- Hover effect: highlight + tooltip with bilingual name + parameter

## Task 2: FancyCutGrid.vue

**File:** `docs/.vitepress/theme/components/FancyCutGrid.vue`

- 2×4 grid (1×8 on mobile via CSS media query)
- 8 hardcoded fancy cuts: Emerald, Princess, Oval, Pear, Heart, Marquise, Cushion, Asscher
- Each cell: SVG silhouette + bilingual name + 1-line description

## Task 3: Register components + write cutting pages

**Modify:** `docs/.vitepress/theme/index.ts` — register 2 components

**Files:**
- Create: `docs/en/cutting/intro.md` — full content with FacetDiagram + FancyCutGrid + Mermaid flowchart
- Create: `docs/zh/cutting/intro.md` — Chinese version