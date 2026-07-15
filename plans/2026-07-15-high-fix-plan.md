# Fix Plan — HIGH tier

## Bug 4: Gallery gem filter EN text malformed
**文件：** `GalleryGrid.vue:71-73`
**当前：** `Ruby / {{ locale === 'zh' ? '红宝石' : '' }}` → EN 显示 `Ruby / `
**修复：** 为每个 gem option 显式写 EN 和 ZH，不分段

## Bug 5: sync-content.ts 缺失 key 不告警
**文件：** `scripts/build/sync-content.ts:89-99`
**当前：** `if (enVal !== undefined && zhVal !== undefined && enVal !== zhVal)`
**修复：** 用 `(enVal ?? '') !== (zhVal ?? '')` 替代，当一方缺失且另一方有值时也报错

## Bug 6: favicon 路径不带 base 前缀
**文件：** `docs/.vitepress/config.ts:26`
**当前：** `href: '/favicon.svg'`
**修复：** 改为 `href: '/gematlas/favicon.svg'`
（也可用 VitePress withBase 但 head 数组不支持函数调用）

## Bug 7: 4 个未使用的依赖
**文件：** `package.json:25,27-29`
**命令：** `pnpm remove cytoscape cytoscape-cose-bilkent debug @vitejs/plugin-vue`

## Bug 8: generate-gem-pages.ts exit code 允许部分失败
**文件：** `scripts/build/generate-gem-pages.ts:234`
**当前：** `process.exit(ok > 0 && csOk > 0 ? 0 : 1)`
**修复：** 使用总计数校验 `process.exit(ok === total && csOk === csTotal ? 0 : 1)`

## 验证
- `pnpm test` 15/15
- `pnpm build` 通过
- 控制台 favicon 没有 404
- Gallery `Ruby / ` 改为 `Ruby`
