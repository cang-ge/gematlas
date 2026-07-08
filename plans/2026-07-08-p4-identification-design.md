# P4 Design Spec — Identification Module (Module ②)

**Goal:** Build Module ② (Identification) with overview content + 3 Vue components: MohsScale, CrystalDiagram, PropertyTable.

## Pages

### docs/en/identification/intro.md

Content sections:
- **Quick Reference**: Physical properties comparison table using `<PropertyTable>`
- **Mohs Hardness Scale**: Interactive scale using `<MohsScale>`
- **Identification Methods**: RI, birefringence, SG, hardness — what each measures
- **Inclusion Atlas**: Typology of inclusions (fingerprints, rutile needles, crystals)
- **Pleochroism**: How to test, what it indicates
- **Identification Flowchart**: Mermaid decision tree
- **Crystal System Reference**: Diagrams using `<CrystalDiagram>`

### docs/zh/identification/intro.md

Same structure, Chinese localization.

## Components

### MohsScale.vue

**Path:** `docs/.vitepress/theme/components/MohsScale.vue`

**Props:**
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Internal hardcoded 10-level array (1 Talc → 10 Diamond) with bilingual mineral names. Matches `data/shared/mohs-scale.yaml`.

**Render:** Horizontal 10-segment bar. Each segment shows hardness number + mineral name. On hover: highlight segment, show bilingual name.

**Style:** Ink-700 background, brass-500 segment borders, ivory-50 text. Hover: brass-300 highlight.

**Ponytail decisions:**
- No dragging (hover only)
- Data hardcoded (not loading YAML at runtime)
- No animation

### CrystalDiagram.vue

**Path:** `docs/.vitepress/theme/components/CrystalDiagram.vue`

**Props:**
- `systemId: 'cubic' | 'tetragonal' | 'orthorhombic' | 'hexagonal' | 'trigonal' | 'monoclinic' | 'triclinic'`

**Data:** Reads `data/shared/crystal-systems.yaml` via import (build-time).

**Render:** Inline SVG + system name + symmetry + example gems.

**SVG approach:** Each system has a simplified geometric representation:
- Cubic: simple cube wireframe
- Tetragonal: elongated cube
- Orthorhombic: rectangular prism
- Hexagonal: hexagonal prism
- Trigonal: rhombohedron
- Monoclinic: tilted prism
- Triclinic: tilted irregular prism

**Style:** Brass stroke (#b8924b, 1.5px), ink-900 fill, on ink-800 background.

### PropertyTable.vue

**Path:** `docs/.vitepress/theme/components/PropertyTable.vue`

**Props:**
- `gemIds: string[]` — gem IDs to show
- `locale?: 'en' | 'zh'` — default 'en'

**Data:** Reads `data/gems/v1/*.yaml` at build time. Filters by gemIds.

**Render:** Comparison table with:
- Column: gem name (bilingual)
- Rows: Mohs Hardness, Refractive Index, Specific Gravity, Crystal System

**Style:** Matches VitePress markdown table styling (brass borders).

**Ponytail decisions:**
- Server-side rendered (SSR), not client-side fetch
- No sorting/filtering (just display)
- Reuses `GemSchema` type for type safety

## Data Flow

```
data/shared/mohs-scale.yaml  ──→ MohsScale.vue (build-time import)
data/shared/crystal-systems.yaml ──→ CrystalDiagram.vue (build-time)
data/gems/v1/*.yaml ──→ PropertyTable.vue (via props, build-time)
```

## Registration

All 3 components registered globally in `docs/.vitepress/theme/index.ts`:
```ts
app.component('MohsScale', MohsScale)
app.component('CrystalDiagram', CrystalDiagram)
app.component('PropertyTable', PropertyTable)
```

## Testing

- `pnpm exec tsc --noEmit`: type-check all new components
- `pnpm build`: ensure components render in static HTML
- `pnpm test`: existing 12 tests still pass
