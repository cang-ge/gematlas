# Contributing to GemAtlas

> Thank you for helping build the most complete open-source gemological knowledge base.

[English](#english) · [中文](#中文)

---

## English

### How to contribute

| Channel | When to use |
|---------|-------------|
| **Issue** | Bug reports, data corrections, terminology questions, feature requests |
| **Pull request** | New gem data, content pages, code improvements, translations |

Before opening a PR for substantial changes, please open an Issue first to discuss the scope.

---

### Adding a new gem

The full workflow takes ~30 minutes per gem once you're familiar with it.

#### 1. Create the YAML data file

Copy `data/gems/v1/ruby.yaml` as a template. The schema is enforced by Zod (`scripts/build/schema.ts`); all required fields are validated by `pnpm validate:data`.

Key fields:
- `id` — kebab-case slug (e.g. `paraiba-tourmaline`)
- `name` — English common name
- `nameZh` — Simplified Chinese common name
- `mineral` — mineral family (e.g. `Corundum`)
- `crystalSystem` — one of `cubic | tetragonal | orthorhombic | hexagonal | trigonal | monoclinic | triclinic`
- `mohs` — Mohs hardness (1–10)
- `refractiveIndex` — `{ min, max }`
- `specificGravity` — `{ min, max }`

#### 2. Generate the bilingual Markdown pages

```bash
pnpm generate:pages
```

This creates `docs/en/gems/<id>.md` and `docs/zh/gems/<id>.md` from the YAML.

#### 3. Edit the Markdown content

The generated pages are skeletons. Fill in:
- A 2–3 paragraph overview
- Sections: **Identification** · **Cutting & Setting** · **Historical & Cultural Notes** · **Care**
- Add 1–3 references at the bottom (GIA, SSEF, etc.)

#### 4. Verify bilingual sync

```bash
pnpm sync:content   # exits non-zero if en/zh pair missing or frontmatter mismatched
pnpm test           # 15 tests including i18n-completeness
```

#### 5. Submit a PR

PR title: `data: add <gem-name> gem`. Include in the description:
- Source of mineralogical data (GIA reference, Schumann book chapter, etc.)
- Confirmation that `pnpm validate:data` and `pnpm test` pass

---

### i18n / translation conventions

- **Structural parallelism**: every page in `docs/en/` has a mirror in `docs/zh/`.
- **Frontmatter keys `gem` and `crystalSystem` must match across locales** (validated by `sync-content.ts`).
- **Title can differ** (English title vs. Chinese title) — that is intentional and not checked.
- **Brand names stay in their original language** (Cartier, Van Cleef & Arpels, etc.).
- **Technical terms**: prefer established Chinese terms from GIA China or NGTC. If unsure, use the English term with a parenthetical Chinese gloss on first mention.

### Style guide

- **Tone**: educational, museum-grade. No marketing copy.
- **Units**: SI primary (carat = 0.2 g). Use `Mohs 9` (not `Mohs hardness 9`).
- **Currency**: USD primary; quote original currency if regionally notable.
- **Capitalization**: English title case for gem names (`Ruby`); Chinese no title case (`红宝石`).

---

## 中文

### 贡献方式

| 渠道 | 适用场景 |
|------|---------|
| **Issue** | Bug 反馈、数据勘误、术语提问、功能建议 |
| **Pull Request** | 新宝石数据、内容页面、代码改进、翻译 |

如需提交较大改动，请先开 Issue 讨论范围。

---

### 添加新宝石

完整流程每种宝石约 30 分钟（熟悉后）。

#### 1. 创建 YAML 数据文件

复制 `data/gems/v1/ruby.yaml` 作为模板。Schema 由 Zod 强制校验（`scripts/build/schema.ts`），所有必填字段由 `pnpm validate:data` 校验。

关键字段：
- `id` —— kebab-case slug（如 `paraiba-tourmaline`）
- `name` —— 英文通用名
- `nameZh` —— 简体中文通用名
- `mineral` —— 矿物族（如 `Corundum`）
- `crystalSystem` —— 七晶系之一
- `mohs` —— 莫氏硬度（1–10）
- `refractiveIndex` —— `{ min, max }`
- `specificGravity` —— `{ min, max }`

#### 2. 生成双语 Markdown 页面

```bash
pnpm generate:pages
```

从 YAML 自动生成 `docs/en/gems/<id>.md` 和 `docs/zh/gems/<id>.md`。

#### 3. 编写 Markdown 内容

生成的页面是骨架。补充：
- 2–3 段概述
- 小节：**鉴定** · **切割与镶嵌** · **历史与文化** · **保养**
- 末尾 1–3 条参考来源（GIA、SSEF 等）

#### 4. 验证双语同步

```bash
pnpm sync:content   # en/zh 缺失或 frontmatter 不一致时退出非零
pnpm test           # 15 项测试，含 i18n-completeness
```

#### 5. 提交 PR

PR 标题：`data: add <gem-name> gem`。描述中请包含：
- 矿物学数据来源（GIA 参考、Schumann 著作章节等）
- 确认 `pnpm validate:data` 与 `pnpm test` 通过

---

### i18n / 翻译约定

- **结构并行**：`docs/en/` 与 `docs/zh/` 一一对应。
- **Frontmatter 的 `gem` 和 `crystalSystem` 字段必须跨语种一致**（由 `sync-content.ts` 校验）。
- **`title` 可以不同**（英文标题与中文标题）—— 这是有意为之，不做校验。
- **品牌名保留原文**（Cartier、Van Cleef & Arpels 等）。
- **专业术语**：优先使用 GIA 中国或 NGTC 的已定中文术语。如不确定，首次出现时用英文术语加中文括注。

### 文体规范

- **语气**：教育性、博物馆级。无营销语言。
- **单位**：SI 为主（克拉 = 0.2 克）。使用 `Mohs 9`（而非 `莫氏硬度 9`）。
- **货币**：USD 为主；如产地相关，注明原始货币。
- **大小写**：英文宝石名首字母大写（`Ruby`）；中文无首字母大写（`红宝石`）。

---

Questions? Open an Issue or start a Discussion.