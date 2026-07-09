# P10 Design — README + CONTRIBUTING + LICENSE

**Date:** 2026-07-09
**Phase:** P10 (V1.0 final phase)

---

## 1. Scope

| File | Purpose |
|------|---------|
| `README.md` | Project landing — bilingual navigation hub |
| `README.en.md` | Full English README |
| `README.zh.md` | Full Chinese README |
| `CONTRIBUTING.md` | Contribution guide |
| `LICENSE` | MIT (already exists, verify only) |

**Excluded:** GitHub repository creation (user action).

---

## 2. File structure

### 2.1 `README.md` (entry, ~30 lines)

- Project tagline + dual-language links
- One-line tech stack mention
- One-line license mention
- Status badge placeholder

### 2.2 `README.en.md` (~120 lines)

Sections:
1. Hero (title, tagline, badges)
2. What's inside — V1.0 modules
3. 10 cornerstone gems
4. Quick start (pnpm install / dev / build / test)
5. Architecture (data → scripts → docs)
6. Content sources & attribution (GIA, SSEF, etc.)
7. Contributing pointer
8. License (MIT)
9. Roadmap (V1.1 preview)

### 2.3 `README.zh.md` (~120 lines)

Mirror of English with Chinese content. Identical section structure.

### 2.4 `CONTRIBUTING.md` (~80 lines)

Sections:
1. How to contribute (issues / PRs)
2. Adding a new gem (the workflow)
3. YAML data schema reference
4. i18n / translation conventions
5. Style guide (terminology consistency)
6. PR template (what to include)

---

## 3. Conventions

- Use GitHub-flavored Markdown (GFM)
- Use existing `LICENSE` (MIT, already committed)
- Use the same `pnpm install / dev / build / test` commands as `package.json`
- Reference real script names (`validate:data`, `sync:content`, `generate:pages`, `test`)
- Cross-link to `docs/` for module intros and `/zh/` for Chinese pages

---

## 4. Files to create / modify

| File | Status |
|------|--------|
| `README.md` | Replace existing (bilingual hub) |
| `README.en.md` | Create |
| `README.zh.md` | Create |
| `CONTRIBUTING.md` | Create |
| `LICENSE` | Verify (no change) |

---

## 5. Risks

| Risk | Mitigation |
|------|-----------|
| README gets too long | Cap each at 120 lines; use TL;DR + pointers |
| CONTRIBUTING diverges from actual workflow | Test the "add a gem" flow against the actual scripts before documenting |
| License file already exists | Verify content matches MIT standard, do not overwrite |