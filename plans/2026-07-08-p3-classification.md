# P3 Implementation Plan — Classification Module

**Goal:** Build MVP Module ① (Classification) with overview content, Mermaid classification tree, crystal system pages, and GemCard.vue component.

**Architecture:** Classification overview content replaces the P0 stub. Mermaid diagrams render via `mermaid` library registered in VitePress theme. Crystal system pages auto-generated from shared YAML. GemCard.vue used on home page and classification page.

---

## Task 1: Install mermaid + register in VitePress

**Files:**
- Modify: `package.json:18-30` (add mermaid dep)
- Modify: `docs/.vitepress/theme/index.ts` (register mermaid)
- Create: `docs/.vitepress/theme/components/MermaidBlock.vue` (optional, or use fenced code block)

**Steps:**
1. `pnpm add mermaid` (mermaid becomes available as an ESM import in Vue)
2. In `theme/index.ts`, import mermaid and call `mermaid.initialize({ startOnLoad: false, theme: 'dark' })`, then add a `mounted()` hook or use `app.mixin` to run mermaid after page transitions
3. Verify: classification page with ` ```mermaid ` block renders as a diagram

---

## Task 2: Create GemCard.vue component

**Files:**
- Create: `docs/.vitepress/theme/components/GemCard.vue`

**Props:**
- `id: string` — gem ID for linking
- `nameZh: string` — 中文名
- `nameEn: string` — 英文名
- `mineral: string` — 矿物族中文名
- `hardness: number` — 莫氏硬度

**Template:** Minimal card with brass border, hover effect, linking to `/gems/{id}`.

---

## Task 3: Write classification overview pages (en/zh)

**Files:**
- Modify: `docs/en/classification/intro.md` (replace stub with full content)
- Modify: `docs/zh/classification/intro.md` (replace stub with full content)

**Content:**
- What is gem classification?
- Mineralogical classification (Mermaid tree diagram)
- Traditional "precious vs semi-precious" classification and why it's outdated
- Classification by optical phenomena
- Classification by color
- Link to crystal system pages

---

## Task 4: Auto-generate crystal system pages

**Files:**
- Modify: `scripts/build/generate-gem-pages.ts` (add crystal system generation)

**Output:** `docs/en/classification/crystal-systems/{id}.md` + `docs/zh/classification/crystal-systems/{id}.md` (7 × 2 = 14 pages)

---

## Task 5: Register GemCard on home page + classification page

**Files:**
- Modify: `docs/en/index.md` (add GemCard grid after module cards)
- Modify: `docs/zh/index.md` (same)
- Modify: `docs/en/classification/intro.md` (add GemCard examples)
- Modify: `docs/zh/classification/intro.md` (same)

**Steps:**
1. Register `GemCard` globally in `theme/index.ts` via `enhanceApp`
2. Use `<GemCard>` component in Markdown pages
