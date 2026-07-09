# P9 Implementation Plan — CI/CD + Visual Polish

Based on: `plans/2026-07-09-p9-ci-viz-design.md`

---

## Step 1 — CI/CD Workflows

**Files to create:**

### 1.1 `.github/workflows/ci.yml`
```yaml
name: CI
on:
  push:
    branches-ignore: [main]    # main has its own deploy workflow
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec tsc --noEmit
      - run: pnpm validate:data
      - run: pnpm test
  build:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### 1.2 `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
          publish_branch: gh-pages
```

---

## Step 2 — Config: add `base`

### 2.1 `docs/.vitepress/config.ts`
Add `base: '/gematlas/'` at the root level of the config export (before `title`).

---

## Step 3 — Visual Polish: CSS

### 3.1 `docs/.vitepress/theme/custom.css`
Append responsive breakpoints:
- `@media (max-width: 768px)` — ModuleGrid 2-col→1-col, section padding reduction
- `@media (max-width: 480px)` — full-width single column, tighter spacing

### 3.2 Component SVG scaling
Add `max-width: 100%; height: auto;` to SVG containers in:
- MohsScale, FacetDiagram, ColorWheel, CrystalDiagram

---

## Step 4 — Visual Polish: Components

- **GemCard.vue**: Flex-wrap layout → stack on mobile
- **GalleryGrid.vue**: Grid `grid-template-columns: repeat(auto-fill, minmax(Npx, 1fr))` → reduce N for mobile

---

## Order

```
1. ci.yml             (new file)
2. deploy.yml         (new file)
3. config.ts          (edit: +base)
4. custom.css         (edit: +breakpoints)
5. GemCard.vue        (edit: responsive tweak)
6. GalleryGrid.vue    (edit: responsive tweak)
7. SVG components     (edit: max-width)
```

Then: `pnpm install && pnpm exec tsc --noEmit && pnpm build && pnpm test`
