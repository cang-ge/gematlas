# 💎 GemAtlas — The Open Gemological Compendium

> A bilingual (EN / 中文) open-source gemstone knowledge platform.

**Languages:** [English](./README.en.md) · [中文](./README.zh.md)

---

V1.0 — 5 modules · 60 gem species · 7 crystal systems · 18 maison pieces.

**Tech:** VitePress 1.6 · Vue 3 · TypeScript · pnpm

**License:** [MIT](./LICENSE) · **Live site:** `https://cang-ge.github.io/gematlas/`

---

## Quick start

```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # → docs/.vitepress/dist/
pnpm test       # 70 tests: 67 data + 3 bilingual consistency
```

## Repo layout

```
data/                       # Source of truth — YAML
  ├── gems/v1/*.yaml        # Per-gem data
  └── shared/               # Crystal systems, Mohs scale,
                            # grading / cutting / identification / gallery

scripts/build/              # Build & validation pipeline
  ├── schema.ts             # Zod schemas
  ├── validate-data.ts      # pnpm validate:data
  ├── generate-gem-pages.ts # Auto-generate gem MD pages
  ├── generate-topic-pages.ts # Shared generator: 4 module stacks
  └── sync-content.ts       # Bilingual sync check (pnpm sync:content)

docs/                       # VitePress site (en/ + zh/)
.github/workflows/ci.yml    # CI + GitHub Pages deploy
tests/                      # vitest suite
```

## Architecture

![GemAtlas content architecture](./docs/architecture/gematlas-architecture.svg)

The diagram summarizes the source-of-truth data flow: YAML content is validated and transformed into bilingual VitePress pages, then deployed to GitHub Pages.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — Copyright © 2026–present GemAtlas contributors.
