# Mermaid ESM Compatibility Fix — VitePress + pnpm + Windows

**Goal:** One-shot fix for browser-side `SyntaxError: does not provide an export named` errors from `dayjs` and `@braintree/sanitize-url`.

## Root Cause

`vitepress-plugin-mermaid@2.0.17`'s `withMermaid()` adds these to `optimizeDeps.include`:
- `@braintree/sanitize-url` (CJS, `exports.sanitizeUrl = ...`)
- `dayjs` (UMD, `dayjs.min.js` — no ESM `default` export)

Vite 5's esbuild pre-bundling fails to convert these CJS/UMD modules to proper ESM with named/default exports, so the browser sees the raw CJS wrapper and crashes.

## Solution

1. **Exclude problematic CJS from optimizeDeps** so they load directly (not pre-bundled).
2. **Alias dayjs to its ESM build** (`dayjs/esm/index.js`).
3. **Create an ESM shim for `@braintree/sanitize-url`** that re-exports the named exports from the CJS module.

## Implementation

### File 1: `docs/.vitepress/theme/sanitize-url-shim.mjs`

```js
// ESM shim for @braintree/sanitize-url (CJS-only).
// Re-exports the CJS module's named exports through a synthesized ESM wrapper.
import mod from '@braintree/sanitize-url/dist/index.js'

export const sanitizeUrl = mod.sanitizeUrl
```

### File 2: `docs/.vitepress/config.ts` — `vite` block

```ts
vite: {
  resolve: {
    alias: [
      { find: /^dayjs$/, replacement: '<absolute path>/node_modules/.pnpm/dayjs@1.11.21/node_modules/dayjs/esm/index.js' },
      { find: /^@braintree\/sanitize-url$/, replacement: '<absolute path>/docs/.vitepress/theme/sanitize-url-shim.mjs' },
    ],
  },
  optimizeDeps: {
    exclude: ['@braintree/sanitize-url', 'dayjs'],
  },
},
```

### File 3: Verify

- Clear cache: `rm -rf node_modules/.vite docs/.vitepress/cache`
- `pnpm dev --port XXXX`
- Browser Console: no SyntaxError
- All routes return HTTP 200