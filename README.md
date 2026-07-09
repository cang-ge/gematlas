# 💎 GemAtlas — The Open Gemological Compendium

> A bilingual (EN / 中文) open-source gemstone knowledge platform.

**Languages:** [English](./README.en.md) · [中文](./README.zh.md)

---

V1.0 MVP — 5 modules · 10 gems · 7 crystal systems · 18 maison pieces.

**Tech:** VitePress 1.6 · Vue 3 · TypeScript · pnpm

**License:** [MIT](./LICENSE) · **Live site:** `https://<owner>.github.io/gematlas/`

---

## Quick start

```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # → docs/.vitepress/dist/
pnpm test       # 15 tests across data + i18n
```

## Repo layout

```
data/                       # Source of truth — YAML
  ├── gems/v1/*.yaml        # Per-gem data
  └── shared/               # Crystal systems, Mohs scale

scripts/build/              # Build & validation pipeline
  ├── schema.ts             # Zod schemas
  ├── validate-data.ts      # pnpm validate:data
  ├── generate-gem-pages.ts # Auto-generate gem MD pages
  └── sync-content.ts       # Bilingual sync check (pnpm sync:content)

docs/                       # VitePress site (en/ + zh/)
.github/workflows/ci.yml    # CI + GitHub Pages deploy
tests/                      # vitest suite
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — Copyright © 2026–present GemAtlas contributors.