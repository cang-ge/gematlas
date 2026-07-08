import DefaultTheme from 'vitepress/theme'
import GemCard from './components/GemCard.vue'
import MohsScale from './components/MohsScale.vue'
import CrystalDiagram from './components/CrystalDiagram.vue'
import PropertyTable from './components/PropertyTable.vue'
import FacetDiagram from './components/FacetDiagram.vue'
import FancyCutGrid from './components/FancyCutGrid.vue'
import ColorGradeTable from './components/ColorGradeTable.vue'
import ClarityScale from './components/ClarityScale.vue'
import ColorWheel from './components/ColorWheel.vue'
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
    app.component('MohsScale', MohsScale)
    app.component('CrystalDiagram', CrystalDiagram)
    app.component('PropertyTable', PropertyTable)
    app.component('FacetDiagram', FacetDiagram)
    app.component('FancyCutGrid', FancyCutGrid)
    app.component('ColorGradeTable', ColorGradeTable)
    app.component('ClarityScale', ClarityScale)
    app.component('ColorWheel', ColorWheel)
  },
}
