# P9 Design — CI/CD + Visual Polish

**Date:** 2026-07-09
**Phase:** P9 (V1.0 MVP penultimate phase)

---

## 1. Scope

| Sub-item | Description | Deliverables |
|----------|-------------|-------------|
| **CI/CD** | GitHub Actions for CI (PR checks) + CD (deploy to GitHub Pages) | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| **Visual polish** | Responsive breakpoints, spacing consistency, component grid adaptations | `custom.css` edits + component-level tweaks |

**Excluded:** Lighthouse performance audit (deferred to V1.1).

---

## 2. CI/CD Architecture

### 2.1 Workflow: CI (`ci.yml`)

**Trigger:** `push` / `pull_request` on all branches (except `main` avoid double-trigger on PR merge).

**Jobs:**

| Job | Steps | Est. time |
|-----|-------|-----------|
| `validate` | `pnpm install` → `pnpm exec tsc --noEmit` → `pnpm validate:data` → `pnpm test` | ~30 s |
| `build` | `pnpm build` | ~15 s |

**Notes:**
- Runs on `ubuntu-latest`.
- Uses `pnpm/action-setup` for pnpm, `actions/setup-node` for Node 20.
- `pnpm install --frozen-lockfile` for reproducibility.

### 2.2 Workflow: Deploy (`deploy.yml`)

**Trigger:** `push` on `main` only.

**Jobs:**

| Job | Steps | Est. time |
|-----|-------|-----------|
| `deploy` | `pnpm install` → `pnpm build` → `peaceiris/actions-gh-pages` deploy to GitHub Pages | ~40 s |

**Deployment target:** `https://<user>.github.io/gematlas/` (VitePress `base` configured as `/gematlas/`).

### 2.3 Configuration changes

- Add `base: '/gematlas/'` to `docs/.vitepress/config.ts` (required for GitHub Pages project site).
- No other config changes needed.

---

## 3. Visual Polish

### 3.1 Responsive breakpoints

Add to `docs/.vitepress/theme/custom.css`:

| Breakpoint | Target | Changes |
|-----------|--------|---------|
| `≤768px` (tablet) | ModuleGrid, GalleryGrid, GemCard 2-col grid | 2-column → 1-column |
| `≤480px` (mobile) | All grids | Single column, smaller padding/margins |

### 3.2 Component tweaks

- **GemCard**: Reduce image size on mobile, stack text below image instead of side-by-side.
- **GalleryGrid**: Reduce 4-col → 2-col → 1-col.
- **MohsScale, FacetDiagram**: Ensure SVG scales with viewport (add `max-width: 100%`).
- **ColorWheel, ColorGradeTable, ClarityScale**: Ensure no overflow on small screens.

### 3.3 Typography & spacing

- Consistent `--vp-c-brand-1` token usage across all components.
- Uniform section spacing (`gap` / `margin-top`) in module intros.
- Font fallback for Chinese text: `"Noto Sans SC", sans-serif`.

---

## 4. Files changed

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Create |
| `.github/workflows/deploy.yml` | Create |
| `docs/.vitepress/config.ts` | Add `base: '/gematlas/'` |
| `docs/.vitepress/theme/custom.css` | Add responsive breakpoints, spacing |
| `docs/.vitepress/theme/components/GemCard.vue` | Responsive layout tweaks |
| `docs/.vitepress/theme/components/GalleryGrid.vue` | Column breakpoints |
| `docs/.vitepress/theme/components/*.vue` | SVG `max-width: 100%` where missing |

**Total: ~7 files.** No new files beyond CI/CD workflows.

---

## 5. Testing

No new tests needed. Existing test suite (15 tests) must pass after all changes. CI job will verify.

---

## 6. Risks

| Risk | Mitigation |
|------|-----------|
| `base: '/gematlas/'` breaks local dev preview | VitePress handles base at build time only; dev server serves from root. Verify both `pnpm dev` and `pnpm build` + `pnpm preview`. |
| CSS overrides conflict with VitePress version upgrade | All overrides in `custom.css` with explicit specificity, no `!important` unless forced. |
