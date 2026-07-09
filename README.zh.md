# 💎 GemAtlas（宝石图典）— 宝石学的完备图典

> 双语开源宝石知识平台，覆盖宝石学完整垂直领域——从矿物学、鉴定到切割、分级与奢侈品工艺。

![V1.0 MVP](https://img.shields.io/badge/status-V1.0%20MVP-9b7e3b)
![License: MIT](https://img.shields.io/badge/license-MIT-0d0c0a)
![i18n](https://img.shields.io/badge/i18n-EN%20%2F%20%E4%B8%AD%E6%96%87-1a1814)

[English](./README.en.md)

---

## ✨ 内容（V1.0 MVP）

| # | 模块 | 覆盖内容 |
|---|------|---------|
| ① | **分类** | 矿物分类 · 光学效应 · 颜色树 · 晶系 |
| ② | **鉴定** | 物理性质 · 莫氏硬度尺 · 晶系图 · 内含物 · 吸收光谱 |
| ③ | **切割** | 刻面几何 · 异形切 · 蛋面 · 雕刻 · 切割演示 |
| ④ | **分级** | GIA 4Cs · 有色宝石分级 · 处理披露 · 产地溢价 |
| ⑥ | **画廊** | 7 大顶级珠宝世家的 18 件标志性作品 |

**10 种核心宝石：** 红宝石 · 蓝宝石 · 祖母绿 · 钻石 · 尖晶石 · 坦桑石 · 亚历山大石 · 帕拉伊巴碧玺 · 沙弗莱石榴石 · 欧泊。

---

## 🚀 快速开始

```bash
pnpm install
pnpm dev        # → http://localhost:5173
pnpm build      # → docs/.vitepress/dist/
pnpm test       # 15 项数据 + 双语一致性测试
```

需要 **Node 20+** 与 **pnpm 9+**（通过 corepack：`corepack enable`）。

---

## 🏗️ 架构

```
data/gems/v1/*.yaml       ─┐
data/shared/*.yaml        ─┴─► scripts/build/
                              ├── validate-data.ts   (Zod 校验)
                              ├── generate-gem-pages.ts
                              └── sync-content.ts    (en ↔ zh)
                                              ↓
                                    docs/.vitepress/dist/
                                              ↓
                                  GitHub Pages（gh-pages 分支）
```

- **数据是唯一事实来源。** Markdown 页面由 YAML 自动生成。
- **i18n 是结构性的。** 英文在根，中文在 `/zh/`。同一内容树。
- **主题：深色 + 古铜金 + 衬线。** 品牌语气：宝石学博物馆，非电商。

---

## 📚 内容来源与署名

矿物学与分级数据综合自公共领域与授权参考资料：

- **GIA**（美国宝石学院）—— 4Cs 框架、颜色/净度等级
- **SSEF**（瑞士宝石研究所）—— 产地报告
- **Gübelin** —— 宝石学研究
- **Schumann, W.** —— *《世界宝石》*（参考教材）
- **Webmineral** · **Mindat** —— 矿物学数据

画廊模块中的所有图片与品牌作品以教育评论之目的按合理使用原则收录。

---

## 🤝 贡献

欢迎提 Issue 与 PR。详见 **[CONTRIBUTING.md](./CONTRIBUTING.md)**：

- 如何添加新宝石（数据 → 页面 → 双语同步）
- YAML Schema 参考
- 翻译约定
- PR 检查清单

---

## 🛣️ 路线图

| 阶段 | 范围 |
|------|------|
| **V1.0**（当前） | 10 种宝石 · 5 模块 · 双语 · CI/CD |
| **V1.1** | 扩至 30 种宝石 · 价格参考 · 参考文献模块 · AI 助手 |

---

## 📄 许可证

[MIT](./LICENSE) —— Copyright © 2026–present GemAtlas contributors.