# P5 Design Spec — Cutting Module (Module ③)

**Goal:** Build Module ③ (Cutting) with overview content + 2 Vue components: FacetDiagram, FancyCutGrid.

## Pages

### docs/{en,zh}/cutting/intro.md

Sections:
- Cutting types overview (faceted / cabochon / cameo / bead)
- Faceted cuts: brief intro + `<FacetDiagram>` for round brilliant
- Fancy cuts: `<FancyCutGrid>` for 8 shapes
- Cabochons: when used, dome shapes
- Cameos & intaglios: brief
- Cutting selection decision flowchart (Mermaid)

## Components

### FacetDiagram.vue

**Path:** `docs/.vitepress/theme/components/FacetDiagram.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Hardcoded 5-part labels (table / crown / girdle / pavilion / culet) with bilingual names + parameters.

**Render:** Side-view SVG of round brilliant cut. On hover, parts highlight and show tooltip.

**Style:** Brass stroke, dark fill. Hover: brass-300 highlight + subtle glow.

**Ponytail decisions:**
- No slider controls (static)
- Hover tooltip is the only interaction
- Hardcoded data (no YAML dependency)

### FancyCutGrid.vue

**Path:** `docs/.vitepress/theme/components/FancyCutGrid.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Hardcoded 8 fancy cut shapes with names + one-line descriptions.

**Render:** 2×4 grid (mobile: 1×8 vertical). Each cell has inline SVG silhouette + name + one-line description.

**Style:** Ink-800 cells with brass-220 borders. Hover: brass-500 border.

**Ponytail decisions:**
- No clickable detail pages
- Hover only, no animation
- Hardcoded SVG silhouettes (geometric abstractions)