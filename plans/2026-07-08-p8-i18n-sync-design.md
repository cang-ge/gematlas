# P8 Design Spec — Bilingual Content Consistency

**Goal:** Ensure every Markdown page in `docs/en/` has a matching pair in `docs/zh/` and that frontmatter stays consistent.

## Approach

Two deliverables — a script (`scripts/build/sync-content.ts`) and a vitest test (`tests/i18n-completeness.test.ts`).

### `scripts/build/sync-content.ts`

CLI script that:
1. Walks `docs/en/` and `docs/zh/` recursively
2. For every `.md` file in either tree, compute its relative path (e.g. `gems/ruby.md`)
3. Check the corresponding path exists under both locales
4. For files present in both, extract:
   - Headings (H2 and H3 only — VitePress uses H1 for page title)
   - Frontmatter `title`, `gem`, `crystalSystem` fields
5. Compare extracted values; report mismatches
6. Exit 1 on ANY error; exit 0 on full match

### Error classes (all exit 1)

| Class | Trigger | Example |
|-------|---------|---------|
| **MISSING** | File present in one locale, absent in other | `docs/en/gems/newgem.md` exists, `docs/zh/gems/newgem.md` doesn't |
| **FRONTMATTER** | Same key holds different values in both | `gem: ruby` vs `gem: sapphire` on the same file path |
| **HEADING** | Set of H2/H3 names differs | EN has `## Overview` ZH has `## 总览` (acceptable UN-translated) |

### `tests/i18n-completeness.test.ts`

vitest test that imports `scripts/build/sync-content.ts` and verifies `findErrors()` returns 0 entries on the current project. Auto-runs via `pnpm test`.

### `package.json` scripts

```json
{
  "sync:content": "tsx scripts/build/sync-content.ts",
  "test": "vitest run"
}
```

`pnpm test` triggers vitest which checks `findErrors()` returns empty array. Fails if mismatch.
