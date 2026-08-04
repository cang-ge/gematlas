# 💎 GemAtlas — The Open Gemological Compendium

> A bilingual open-source gemstone knowledge platform, covering the full vertical of gemology — from mineralogy and identification to cutting, grading, and luxury maison craftsmanship.

![Status](https://img.shields.io/badge/status-50%20gem%20species-9b7e3b)
![License: MIT](https://img.shields.io/badge/license-MIT-0d0c0a)
![i18n](https://img.shields.io/badge/i18n-EN%20%2F%20%E4%B8%AD%E6%96%87-1a1814)

[中文](./README.zh.md)

---

## ✨ What's inside

| # | Module | Coverage |
|---|--------|----------|
| ① | **Classification** | Mineralogical taxonomy · optical phenomena · color trees · crystal systems |
| ② | **Identification** | Physical properties · optical tests · synthetics & imitations |
| ③ | **Cutting** | Round brilliant · fancy cuts · cabochon & carving |
| ④ | **Grading** | GIA 4Cs · coloured-stone grading · clarity types · origin disclosure |
| ⑥ | **Gallery** | 18 signature pieces · by maison · style eras · legendary stones |

**50 gem species** across all major mineral families — from Diamond to Chrysoprase.

---

## 🚀 Quick start

```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # → docs/.vitepress/dist/
pnpm test       # 60 tests across data + i18n
```

Requires **Node 20+** and **pnpm 9+** (via corepack: `corepack enable`).

---

## 🏗️ Architecture

```
data/gems/v1/*.yaml       ─┐
data/shared/*.yaml        ─┴─► scripts/build/
                              ├── validate-data.ts   (Zod check)
                              ├── generate-gem-pages.ts
                              └── sync-content.ts    (en ↔ zh)
                                              ↓
                                    docs/.vitepress/dist/
                                              ↓
                                  GitHub Pages (gh-pages branch)
```

- **Data is the source of truth.** Markdown pages are generated from YAML.
- **i18n is structural.** English at root, Chinese at `/zh/`. Same content tree.
- **Theme is dark + brass + serif.** Brand voice: gemological museum, not e-commerce.

---

## 📚 Content sources & attribution

Mineralogical and grading data is curated from public-domain and licensed references:

- **GIA** (Gemological Institute of America) — 4Cs framework, color/clarity scales
- **SSEF** (Swiss Gemmological Institute) — origin reports
- **Gübelin** — gemological research
- **Schumann, W.** — *Gemstones of the World* (reference text)
- **Webmineral** · **Mindat** — mineralogical data

All images and maison pieces in the **Gallery** module are documented for educational commentary under fair use.

---

## 🤝 Contributing

We welcome issues and pull requests. See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- How to add a new gem (data → page → bilingual sync)
- YAML schema reference
- Translation conventions
- PR checklist

---

## 🛣️ Roadmap

| Phase | Scope |
|-------|-------|
| **Current** | 50 gems · 5 modules · 13 subpages · bilingual · CI/CD |
| **V1.1** | Expand to 100+ gems · price reference · references module · AI assistant |

---

## 📄 License

[MIT](./LICENSE) — Copyright © 2026–present GemAtlas contributors.