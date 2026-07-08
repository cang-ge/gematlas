import DefaultTheme from 'vitepress/theme'
import GemCard from './components/GemCard.vue'
import './custom.css'

/**
 * GemAtlas theme entry.
 *
 * Extends VitePress default theme. We do NOT need a custom Layout.vue —
 * the default theme already exposes every slot we use. Per ponytail,
 * write no component that does nothing.
 */
export default {
  extends: DefaultTheme,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enhanceApp({ app }: { app: any }) {
    app.component('GemCard', GemCard)
  },
}
