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
import ModuleGrid from './components/ModuleGrid.vue'
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
    app.component('GemCard', GemCard)
    app.component('MohsScale', MohsScale)
    app.component('CrystalDiagram', CrystalDiagram)
    app.component('PropertyTable', PropertyTable)
    app.component('FacetDiagram', FacetDiagram)
    app.component('FancyCutGrid', FancyCutGrid)
    app.component('ColorGradeTable', ColorGradeTable)
    app.component('ClarityScale', ClarityScale)
    app.component('ColorWheel', ColorWheel)
    app.component('GalleryGrid', GalleryGrid)
    app.component('ModuleGrid', ModuleGrid)

    // Init mermaid on client only — dynamic import to avoid
    // polluting Vite dev server's module graph.
    if (typeof window !== 'undefined') {
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
