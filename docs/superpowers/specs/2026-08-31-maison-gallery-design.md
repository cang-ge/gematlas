# GemAtlas 顶级珠宝工坊画廊设计

**日期**：2026-08-31
**状态**：设计已确认，进入内容检索与实现阶段。

## 目标

将现有以文字为主的“顶级珠宝工坊”页面升级为可浏览、可追溯、可持续扩展的高级珠宝作品档案。首期纳入 7 家工坊，每家 3 件代表作品，共 21 件。

首期不创建 21 个独立详情页，而是在现有 `by-house` 页面中按工坊分组展示，减少空页面、导航复杂度和首期维护成本。

## 内容选品

每家工坊固定配置三类作品：

1. **历史代表作**：体现工坊传承与时代地位；
2. **招牌工艺作**：体现独特镶嵌、造型或设计语言；
3. **宝石主角作**：突出钻石、红宝石、祖母绿或其他彩色宝石的视觉表现。

首期工坊为 Cartier、Van Cleef & Arpels、Boucheron、Tiffany & Co.、Harry Winston、Graff、Chaumet。具体作品名称、年代和宝石信息须在入库前逐项核对，不以搜索摘要或二手营销文案作为唯一依据。

## 数据设计

新增 `data/shared/maison-works.yaml`，与现有主题型 `gallery.yaml` 分离。每条记录包含：

```yaml
id: cartier-tutti-frutti
maison: Cartier
name_zh: Tutti Frutti 手镯
name_en: Tutti Frutti Bracelet
type: heritage
year: 1928
gems: [ruby, emerald, sapphire]
craft: carved gemstones
style: Art Deco
summary_zh: 雕刻彩色宝石与植物纹样结合的代表性作品。
summary_en: A signature work combining carved coloured stones with botanical motifs.
image: /images/gallery/maisons/cartier-tutti-frutti.jpg
source_url: https://www.cartier.com/en-gb/maison/the-story/living-heritage/the-cartier-collection/jewellery
rights: open-license-or-link-only
```

实现时增加对应 Zod schema 与校验规则：21 条记录 ID 唯一；每家工坊正好 3 条；中英文名称、摘要、作品类型和来源字段齐全；图片路径存在；本地图片来源必须同步出现在英中授权清单。

## 页面结构

`docs/gallery/by-house.md` 与 `docs/zh/gallery/by-house.md` 继续作为入口页面，由内容生成脚本读取工坊作品数据：

- 顶部保留简介和工坊锚点导航；
- 每家工坊渲染名称、成立年份、设计关键词和三张作品卡；
- 作品卡显示图片、作品名、年代、核心宝石、工艺标签和一句编辑摘要；
- 桌面端三列，窄屏单列；
- 不使用自动轮播，不依赖悬停才能获得关键信息；
- 作品卡先提供完整摘要，不在首期引入复杂弹窗或搜索筛选。

现有深色背景、金色强调和衬线标题继续沿用，不新增与 GemAtlas 视觉系统冲突的品牌色。

## 图片来源与版权边界

素材优先级：博物馆开放资源、Wikimedia Commons 明确授权素材、公共领域历史图、获得明确转载许可的官方素材。无法确认授权时，不下载品牌官网图片，改用外链、文字卡片或自主绘制的镶嵌/结构示意图。

每张图片在 `docs/image-credits.md` 和 `docs/zh/image-credits.md` 中记录文件页、作者/机构、许可证、裁剪处理和“实物照片 / 历史插图 / 复制品”等语义边界。作品资料来源与图片授权来源可以不同，必须分别记录。

资料检索优先参考：

- [Cartier Collection](https://www.cartier.com/en-gb/maison/the-story/living-heritage/the-cartier-collection/jewellery)
- [Boucheron Question Mark icon](https://www.boucheron.com/ch_en/our-maison/the-sense-of-style/the-question-mark-icon)
- [Tiffany High Jewelry](https://www.tiffany.com/high-jewelry.html)
- [V&A Jewellery Collection](https://www.vam.ac.uk/collections/jewellery)
- [Musée des Arts Décoratifs Galerie des Bijoux](https://madparis.fr/Galerie-des-Bijoux)

这些页面用于建立作品事实和进一步追溯，不代表其页面图片均可直接复制到仓库。

## 生成、验证与回归

实现后运行：

```bash
pnpm generate:pages
pnpm validate:data
pnpm test
pnpm build
```

补充测试覆盖：

- 工坊数量为 7，每家作品数为 3；
- `heritage`、`craft`、`gem-focus` 三种类型均出现；
- 中英文生成页作品数量一致；
- 所有图片可解码且不出现极端比例；
- 外部图片来源和本地授权清单一一对应；
- 现有宝石数据、传世之作页面和其他模块无断链。

## 后续扩展

首期稳定后，再考虑按工坊、宝石、工艺和时代增加交叉浏览；当某件作品资料达到足够深度时，再拆分为独立详情页。首期不引入数据库、CMS、自动抓取或复杂筛选器。
