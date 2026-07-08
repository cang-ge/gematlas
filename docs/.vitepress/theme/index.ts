import DefaultTheme from 'vitepress/theme'
import './custom.css'

/**
 * GemAtlas theme entry.
 *
 * Extends VitePress default theme. We do NOT need a custom Layout.vue —
 * the default theme already exposes every slot we use. Per ponytail,
 * write no component that does nothing.
 *
 * P3+ will register global components here (e.g. `<GemCard>`, `<MohsScale>`).
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Global components registered here in later phases.
  },
}
