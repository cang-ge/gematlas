import DefaultTheme from 'vitepress/theme'

// ponytail: mermaid imported dynamically in setup() to avoid
// corrupting Vite's module graph in dev mode.
import GemCard from './components/GemCard.vue'
import MohsScale from './components/MohsScale.vue'
import CrystalDiagram from './components/CrystalDiagram.vue'
import PropertyTable from './components/PropertyTable.vue'
import FacetDiagram from './components/FacetDiagram.vue'
import FancyCutGrid from './components/FancyCutGrid.vue'
import ColorGradeTable from './components/ColorGradeTable.vue'
import ClarityScale from './components/ClarityScale.vue'
import ColorWheel from './components/ColorWheel.vue'
import GalleryGrid from './components/GalleryGrid.vue'
import GemGallery from './components/GemGallery.vue'
import GemCompare from './components/GemCompare.vue'
import ModuleGrid from './components/ModuleGrid.vue'
import GemAtlasLanding from './components/GemAtlasLanding.vue'
import GemAssistPanel from './components/GemAssistPanel.vue'
import './custom.css'

/**
 * GemAtlas theme entry.
 *
 * Extends VitePress default theme.
 * Mermaid initialized locally (no plugin) to avoid ESM issues.
 */
export default {
  extends: DefaultTheme,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enhanceApp({ app, router }: { app: any; router: any }) {
    for (const [name, comp] of Object.entries({
      GemCard, MohsScale, CrystalDiagram, PropertyTable, FacetDiagram,
      FancyCutGrid, ColorGradeTable, ClarityScale, ColorWheel, GalleryGrid,
      GemGallery, GemCompare, ModuleGrid, GemAtlasLanding,
      GemAssistPanel,
    })) {
      app.component(name, comp)
    }

    // Init mermaid on client only — dynamic import to avoid
    // polluting Vite dev server's module graph.
    if (typeof window !== 'undefined') {
      let searchTrigger: HTMLButtonElement | null = null
      let searchWasOpen = false

      const focusAfterClose = (target: HTMLButtonElement | null) => {
        if (!target) return
        const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280
        window.setTimeout(() => {
          if (target.isConnected) target.focus()
        }, delay)
      }

      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null
        const searchButton = target?.closest<HTMLButtonElement>('.DocSearch-Button')
        const hamburger = target?.closest<HTMLButtonElement>('.VPNavBarHamburger')
        if (searchButton) searchTrigger = searchButton
        if (hamburger && hamburger.getAttribute('aria-expanded') === 'true') {
          focusAfterClose(hamburger)
        }
      }, true)

      const focusObserver = new MutationObserver(() => {
        const searchOpen = Boolean(document.querySelector('.VPLocalSearchBox'))
        if (searchWasOpen && !searchOpen) focusAfterClose(searchTrigger)
        searchWasOpen = searchOpen
      })
      focusObserver.observe(document.body, { childList: true, subtree: true })

      import('mermaid').then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#1a1814',
            primaryTextColor: '#ece4d2',
            primaryBorderColor: '#b8924b',
            lineColor: '#b8924b',
            secondaryColor: '#0d0c0a',
            tertiaryColor: '#25221c',
          },
        })
        const render = () => {
          if (document.querySelector('.mermaid')) {
            mermaid.run({ querySelector: '.mermaid' })
          }
        }
        render()
        router.onAfterRouteChanged = render
      })
    }
  },
}
