# 💎 GemAtlas（宝石图典）——开放式宝石学知识平台

> 一个以数据驱动的方式整理宝石学知识、支持中英文双语浏览的开源知识平台。

[![在线站点](https://img.shields.io/badge/在线站点-GemAtlas-c89b3c)](https://cang-ge.github.io/gematlas/)
[![测试](https://img.shields.io/badge/测试-70%20项通过-2e9d72)](./package.json)
[![许可证](https://img.shields.io/badge/许可证-MIT-6b7280)](./LICENSE)

**语言：** [English](./README.en.md) · [中文](./README.zh.md)

GemAtlas 将结构化宝石学数据转换为可检索的双语参考站点。内容以 YAML 维护，通过 TypeScript/Zod Schema 校验，再由 VitePress 页面生成器转换为站点页面，最终以静态站点形式发布到 GitHub Pages。

## 项目概览

| 维度 | 当前范围 |
| --- | --- |
| 宝石知识 | 60 个宝石条目 |
| 内容模块 | 分类、鉴定、切工、分级、画廊 |
| 共享参考 | 7 个晶系、莫氏硬度、矿物分类组、光学现象、颜色成因 |
| 选题案例 | 18 件顶级珠宝工坊与传奇宝石作品 |
| 质量检查 | 70 项 Vitest 测试，以及数据和双语一致性检查 |
| 技术运行时 | VitePress 1.6 · Vue 3 · TypeScript · pnpm 9 |

## 在线体验

- [分类](https://cang-ge.github.io/gematlas/zh/classification/intro) —— 晶系、矿物分类组、光学现象和颜色成因
- [鉴定](https://cang-ge.github.io/gematlas/zh/identification/intro) —— 物理测试、光学测试、合成品、仿品与同色宝石判别
- [切工](https://cang-ge.github.io/gematlas/zh/cutting/intro) —— 圆明亮式、花式切工、蛋面和雕刻
- [分级](https://cang-ge.github.io/gematlas/zh/grading/intro) —— 钻石 4C、彩色宝石分级、净度、处理和产地披露
- [画廊](https://cang-ge.github.io/gematlas/zh/gallery/intro) —— 顶级珠宝工坊、设计风格史和传奇宝石

## 为什么做这个项目

宝石学资料通常分散在文章、表格、图片集合和不同语言的页面中。这种组织方式不利于横向比较，也容易让双语内容在长期维护中出现偏差。

GemAtlas 通过三个设计决策解决这个问题：

1. **先建立知识模型，再渲染页面。** 每个宝石都以名称、矿物身份、化学式、物理性质、光学性质、处理方式、来源和图片等字段表达，而不是只维护一篇无结构文章。
2. **保留唯一事实来源。** YAML 是直接编辑的数据源，Markdown 页面是可重新生成的交付产物。
3. **让内容质量可以被测试。** Schema 校验、双语文件配对检查和单元测试共同构成发布前的质量门禁。

## 访客可以获得什么

- 通过统一的双语页面浏览 60 个宝石条目。
- 对比矿物身份、化学式、晶系、硬度、相对密度和折射率。
- 理解光学现象、颜色成因与具体宝石之间的关系。
- 阅读宝石鉴定、切工、分级和处理披露方面的基础参考内容。
- 使用 VitePress 的本地搜索快速定位知识条目。
- 在中英文页面之间切换，同时保持相同的内容树结构。

## 系统架构

![GemAtlas 内容产品架构](./docs/architecture/gematlas-architecture.png)

系统主链路如下：

```text
内容维护者
    ↓
YAML 数据源
    ↓
Zod Schema 校验 ──→ 数据与双语测试
    ↓                    ↓
TypeScript 页面生成器 ─→ CI 质量门禁
    ↓                    ↓
VitePress 静态站点 ───→ GitHub Pages
```

仓库将内容、转换、展示和交付分开：

- `data/` 保存宝石数据和共享分类词表。
- `scripts/build/` 负责数据校验、页面生成和双语结构检查。
- `docs/` 是 VitePress 站点及其 Markdown 页面。
- `.github/workflows/ci.yml` 执行类型检查、数据校验、测试和生产构建；推送到默认分支时，将构建产物部署到 `gh-pages`。

## 数据模型

每个宝石条目都遵循 [`scripts/build/schema.ts`](./scripts/build/schema.ts) 中定义的类型模型：

```text
Gem
├── identity       id、中英文名称
├── category       矿物、化学式、晶系
├── physical       莫氏硬度、相对密度、折射率
├── optical        多色性、典型颜色、颜色成因
├── treatments     常见处理方式和披露要求
├── images         主图和图库引用
└── provenance     产地与历史信息（如有）
```

共享 YAML 文件提供可复用的晶系、莫氏硬度、矿物分类组、光学现象、颜色成因，以及分级、切工、鉴定和画廊专题词表。页面生成器使用这些统一字段，数据在生成前必须通过校验。

## 内容模块

### 分类

围绕晶系、按化学性质组织的矿物分类组、光学现象和颜色成因建立知识底座，帮助读者从矿物身份理解宝石的可见特征。

### 鉴定

介绍物理性质测试、光学测试、合成品与仿品判别，以及相近颜色宝石的对比。内容定位为实践参考，不把单一指标包装成绝对结论。

### 切工

覆盖圆明亮式切工、花式切工、蛋面和雕刻，将切割几何、工艺词汇和珠宝案例连接起来。

### 分级

介绍钻石 4C、彩色宝石分级、净度瑕疵类型，以及产地和处理披露。文档会区分分级术语、处理信息和产地判断。

### 画廊

从顶级珠宝工坊、设计风格史和传奇宝石切入，提供技术知识之外的视觉与文化背景，但不将项目做成电商目录。

## 构建与质量门禁

内容变更遵循明确的流水线：

1. 在 `data/gems/v1/` 或 `data/shared/` 中编辑或新增 YAML 数据。
2. 执行 `pnpm validate:data`，让所有支持的 YAML 文件通过 Zod Schema 解析。
3. 数据源变化后执行 `pnpm generate:pages`，刷新对应的 Markdown 页面。
4. 执行 `pnpm sync:content`，检查中英文文件树是否配对，以及共享 frontmatter 是否一致。
5. 执行 `pnpm test`，运行逐文件数据测试和双语不变量测试。
6. 执行 `pnpm build`，生成 `docs/.vitepress/dist/`。

CI 还会执行 TypeScript 类型检查，并在默认分支推送时将生产构建结果发布到 GitHub Pages。

## 仓库结构

```text
data/
├── gems/v1/*.yaml             # 60 个宝石记录：唯一事实来源
└── shared/*.yaml              # 共享分类词表和专题数据

scripts/build/
├── schema.ts                  # Zod Schema 与 TypeScript 类型
├── validate-data.ts           # 数据校验命令
├── generate-gem-pages.ts      # 宝石页面生成器
├── generate-topic-pages.ts    # 通用专题页面生成器
├── generate-*-pages.ts        # 专题分类生成器
└── sync-content.ts            # 中英文结构检查

docs/
├── .vitepress/                # 站点配置和主题
├── gems/                      # 英文宝石页面
├── zh/gems/                   # 中文宝石页面
├── classification/            # 分类模块
├── identification/            # 鉴定模块
├── cutting/                   # 切工模块
├── grading/                   # 分级模块
└── gallery/                   # 画廊模块

tests/                         # Vitest 数据与双语测试
.github/workflows/ci.yml       # 校验、构建和 Pages 部署
```

## 本地开发

### 环境要求

- Node.js 20 或更高版本
- pnpm 9 或更高版本

项目通过 `packageManager` 和 lockfile 固定 pnpm 版本，可以使用 Corepack 启用对应的包管理器：

```bash
corepack enable
pnpm install
```

### 启动站点

```bash
pnpm dev       # http://localhost:5173
```

### 验证项目

```bash
pnpm validate:data
pnpm sync:content
pnpm test
pnpm build
pnpm preview
```

## 内容来源与说明

矿物学、宝石学和分级相关内容综合整理自公开领域及授权参考资料，包括：

- [GIA](https://www.gia.edu/) —— 4C 与宝石学参考资料
- [SSEF](https://www.ssef.ch/) —— 产地与处理研究
- [Gübelin](https://www.gubelin.com/) —— 宝石学研究与历史背景

图片来源与授权记录见 [`docs/image-credits.md`](./docs/image-credits.md)。

本项目是教育性参考资料，不能替代专业宝石鉴定师的检测或独立实验室报告。对于处理方式、产地和鉴定结论，应结合来源说明以及现有证据范围进行理解。

## 贡献

欢迎提交贡献。内容变更请优先修改 YAML 数据源，同时保持生成的中英文页面同步，并在提交前运行校验、测试和构建命令，在 Pull Request 中说明资料来源或编辑依据。

详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 许可证

[MIT](./LICENSE) —— Copyright © 2026–present GemAtlas contributors.
