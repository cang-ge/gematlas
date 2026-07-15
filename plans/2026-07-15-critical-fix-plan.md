# Fix Plan — CRITICAL tier

## Bug 1: EN 源文件目录移动 docs/en/ → docs/

**根因：** `locales.root`（link: ''）期望源文件在 `docs/`，但实际在 `docs/en/`
**操作：** 移动约 30 个文件，不修改内容

```
mv docs/en/index.md                               docs/index.md
mv docs/en/classification/intro.md                 docs/classification/intro.md
mv docs/en/classification/crystal-systems/*.md     docs/classification/crystal-systems/
mv docs/en/identification/intro.md                 docs/identification/intro.md
mv docs/en/cutting/intro.md                        docs/cutting/intro.md
mv docs/en/grading/intro.md                        docs/grading/intro.md
mv docs/en/gallery/intro.md                        docs/gallery/intro.md
mv docs/en/gems/*.md                               docs/gems/
rmdir docs/en/classification/crystal-systems/
rmdir docs/en/classification/
rmdir docs/en/identification/
rmdir docs/en/cutting/
rmdir docs/en/grading/
rmdir docs/en/gallery/
rmdir docs/en/gems/
rmdir docs/en/
```

**副作用修复：**
- `docs/public/index.html` 重定向页指向 `/gematlas/en/` → 删除（EN 已到根路径不再需要）
- 检查是否有任何硬编码 `docs/en` 或 `/en/` 路径的引用

---

## Bug 2: ModuleGrid 链接缺少 base + locale + .html

**文件：** `ModuleGrid.vue:14-18, 26`
**修复：** 添加 `withBase()` + locale 前缀 + `.html`

```ts
// script 增加
import { withBase } from 'vitepress'

function moduleLink(m: (typeof MODULES)[0]) {
  const localePrefix = locale === 'zh' ? '/zh' : ''
  return withBase(`${localePrefix}${m.link}.html`)
}
```

```vue
<!-- template 改为 -->
<a v-for="m in MODULES" :href="moduleLink(m)">
```

---

## Bug 3: GemCard 链接缺少 base + .html

**文件：** `GemCard.vue:30`
**修复：** 使用 `withBase()` + 确保 `.html`

```ts
import { withBase } from 'vitepress'

function gemLink(id: string, locale: string) {
  const localePrefix = locale === 'zh' ? '/zh' : ''
  return withBase(`${localePrefix}/gems/${id}.html`)
}
```

```vue
<a :href="gemLink(id, locale || 'en')">
```

---

## 验证

修复后：
1. `pnpm build` + `pnpm preview` 中所有导航链接有效
2. `pnpm test` 15/15
3. SPA 点击导航栏链接 → 正确渲染 EN/ZH 页面
4. ModuleGrid 4 种语言 × 5 卡片正常工作
5. GemCard 10 个宝石链接正常工作
6. 根路径 `/gematlas/` 直接显示 EN 首页（无重定向）
