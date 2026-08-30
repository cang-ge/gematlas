# Image Integration Plan — Gem Detail Pages

**Goal:** Add gemstone images to all 50 gem detail pages via YAML schema,
enabling both detail-page display and future Gallery module integration.

---

## 1. Data model

Add `images` field to `GemSchema`:

```ts
images?: {
  main: string         // Hero image filename, e.g. "main.webp"
  gallery: string[]    // 3-5 secondary image filenames
}
```

Image storage: `docs/public/images/gems/{gem.id}/{filename}`
Public URL: `/gematlas/images/gems/{gem.id}/{filename}`

---

## 2. Generator

Update `pageBody()` in `generate-gem-pages.ts`:
- If `images.main` → render `<img>` hero after title
- If `images.gallery[]` → render `## Gallery` section with inline `<img>` thumbnails

Use HTML `<img>` tags with absolute `/gematlas/` path to avoid Rollup module resolution.

---

## 3. Files to change

| File | Change |
|------|--------|
| `scripts/build/schema.ts` | Add `GemImages` to `GemSchema` |
| `scripts/build/generate-gem-pages.ts` | Update `pageBody()` for images |
| `data/gems/v1/ruby.yaml` | Add `images:` test data |
| `data/gems/v1/...49 more` | Add `images:` to all gems |

---

## 4. Image source plan

- Search CC0 / public-domain image sources for gemstone photos
- Each gem: 1 main (faceted) + 3-5 gallery (rough, cut, inclusions, jewelry)
- Store as `.webp` for performance (convert from JPEG/PNG)
- Initial: placeholder paths, replace gradually

---

## 5. Verification

- `pnpm exec tsc --noEmit`
- `pnpm validate:data` (55/55)
- `pnpm generate:pages` (all 50 gems)
- `pnpm test` (55/55)
- `pnpm build` (without Rollup module resolution errors)
- `pnpm preview` → verify image rendering on gem pages

---

## 6. Current known issue (to fix)

`imgDir` variable in pageBody() is unused after switching to inline path literals.
