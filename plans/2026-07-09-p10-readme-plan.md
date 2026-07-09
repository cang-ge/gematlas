# P10 Implementation Plan — README + CONTRIBUTING

Based on: `plans/2026-07-09-p10-readme-design.md`

---

## Order

```
1. README.md          (overwrite: bilingual hub)
2. README.en.md       (new)
3. README.zh.md       (new)
4. CONTRIBUTING.md    (new)
5. Verify LICENSE     (read-only check)
```

---

## 1. README.md (entry hub, ~30 lines)

```
# 💎 GemAtlas — The Open Gemological Compendium

> A bilingual (EN/中文) open-source gemstone knowledge platform.

**Languages:** [English](./README.en.md) · [中文](./README.zh.md)

V1.0 MVP: 5 modules · 10 gems · 7 crystal systems · 18 maison pieces.
[Live demo](https://<owner>.github.io/gematlas/) · [License: MIT](./LICENSE)

Tech: VitePress 1.6 · Vue 3 · TypeScript · pnpm
```

---

## 2. README.en.md sections

1. Hero (title + tagline + status badge)
2. What's inside — V1.0 modules (5-module table)
3. 10 cornerstone gems (one-line list)
4. Quick start (4 commands)
5. Architecture (data → scripts → docs flow)
6. Content sources & attribution (GIA/SSEF/Gübelin)
7. Contributing (link to CONTRIBUTING.md)
8. License (MIT)
9. Roadmap (V1.1: 30 gems, AI assistant, price reference)

---

## 3. README.zh.md sections

Mirror of English — identical structure, Chinese content.

---

## 4. CONTRIBUTING.md sections

1. How to contribute (issues + PRs)
2. Adding a new gem (the 5-step flow)
3. YAML data schema reference (link to scripts/build/schema.ts)
4. i18n / translation conventions (en/zh parallel structure)
5. Style guide (terminology)
6. PR checklist

---

## Verify

After writes:
- All files render as valid Markdown
- `pnpm test` still passes (no code change, sanity check)
- License file content matches MIT standard