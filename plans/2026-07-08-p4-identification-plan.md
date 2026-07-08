# P4 Implementation Plan — Identification Module

**Goal:** Build Module ② (Identification) with overview page + 3 Vue components (MohsScale, CrystalDiagram, PropertyTable).

**Architecture:** All 3 components registered globally in theme/index.ts, used via `<Component>` tags in Markdown. Data driven from YAML at build time.

---

## Task 1: Create MohsScale.vue

**File:** `docs/.vitepress/theme/components/MohsScale.vue`

- Horizontal 10-segment bar
- Hardcode 10 levels matching mohs-scale.yaml
- Props: locale (en/zh)
- Hover: highlight segment + show mineral name
- Brass border segments, ink background

---

## Task 2: Create CrystalDiagram.vue

**File:** `docs/.vitepress/theme/components/CrystalDiagram.vue`

- Props: systemId (7 crystal system IDs)
- Inline SVG per system (simplified geometric wireframes)
- Import data from data/shared/crystal-systems.yaml at build time
- Display name + symmetry + examples + SVG

---

## Task 3: Create PropertyTable.vue

**File:** `docs/.vitepress/theme/components/PropertyTable.vue`

- Props: gemIds (string[]), locale (en/zh)
- Read data/gems/v1/*.yaml, filter by gemIds
- Comparison table: columns = gems, rows = hardness/RI/SG/system
- SSR-friendly (build-time data)

---

## Task 4: Register all 3 components + write identification pages

**Modify:** `docs/.vitepress/theme/index.ts` — register 3 components

**Files:**
- Create: `docs/en/identification/intro.md` — full content with MohsScale, CrystalDiagram, PropertyTable usage
- Create: `docs/zh/identification/intro.md` — Chinese version
