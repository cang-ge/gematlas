<!--
PropertyTable — side-by-side comparison of validated gem records.

Props:
  gemIds  — array of gem IDs to compare (e.g. ['ruby', 'sapphire'])
  locale  — 'en' (default) or 'zh'

Data is generated from data/gems/v1/*.yaml through GemSchema. The component
does not own a second set of mineralogical facts.
-->
<script setup lang="ts">
import { computed, type PropType } from 'vue'
import {
  GEM_COMPARISON_BY_ID,
  type GemComparisonRecord,
} from '../data/gem-comparison.generated'

const props = defineProps({
  gemIds: { type: Array as PropType<string[]>, required: true },
  locale: { type: String as PropType<'en' | 'zh'>, default: 'en' },
})

const selectedGems = computed<GemComparisonRecord[]>(() => props.gemIds
  .map(id => GEM_COMPARISON_BY_ID[id])
  .filter((gem): gem is GemComparisonRecord => Boolean(gem)))

const tableMinWidth = computed(() => `${9.5 + (selectedGems.value.length * 11.75)}rem`)

const crystalNames: Record<string, { zh: string; en: string }> = {
  cubic: { zh: '等轴晶系', en: 'Cubic / Isometric' },
  tetragonal: { zh: '四方晶系', en: 'Tetragonal' },
  orthorhombic: { zh: '斜方晶系', en: 'Orthorhombic' },
  hexagonal: { zh: '六方晶系', en: 'Hexagonal' },
  trigonal: { zh: '三方晶系', en: 'Trigonal' },
  monoclinic: { zh: '单斜晶系', en: 'Monoclinic' },
  triclinic: { zh: '三斜晶系', en: 'Triclinic' },
  amorphous: { zh: '非晶质', en: 'Amorphous / mineraloid' },
}

const pleochroismNames: Record<string, { zh: string; en: string }> = {
  none: { zh: '无', en: 'None' },
  weak: { zh: '弱', en: 'Weak' },
  moderate: { zh: '中等', en: 'Moderate' },
  strong: { zh: '强', en: 'Strong' },
}

function localizedName(gem: GemComparisonRecord): string {
  return props.locale === 'zh' ? gem.names.zh : gem.names.en
}

function localizedMineral(gem: GemComparisonRecord): string {
  return props.locale === 'zh' ? gem.category.mineral_zh : gem.category.mineral_en
}

function crystalName(gem: GemComparisonRecord): string {
  return crystalNames[gem.category.crystal_system]?.[props.locale] || gem.category.crystal_system
}

function pleochroismName(gem: GemComparisonRecord): string {
  const value = gem.optical.pleochroism
  return value ? pleochroismNames[value]?.[props.locale] || value : '—'
}

function typicalColors(gem: GemComparisonRecord): string {
  const values = gem.optical.typical_colors
    .map(color => props.locale === 'zh' ? color.zh : color.en)
    .filter((color): color is string => Boolean(color))
  return values.length ? values.join(props.locale === 'zh' ? '、' : ', ') : '—'
}
</script>

<template>
  <div
    class="property-table"
    :lang="locale || 'en'"
    role="region"
    tabindex="0"
    :aria-label="locale === 'zh' ? '宝石属性对比表，可横向滚动查看' : 'Gem property comparison table; scroll horizontally to view all stones'"
  >
    <table :style="{ minWidth: tableMinWidth }">
      <caption class="sr-only">
        {{ locale === 'zh' ? '宝石并列属性对比' : 'Side-by-side gem property comparison' }}
      </caption>
      <colgroup>
        <col class="property-table__label-column">
        <col v-for="gem in selectedGems" :key="'column-' + gem.id" class="property-table__gem-column">
      </colgroup>
      <thead>
        <tr>
          <th scope="col">{{ locale === 'zh' ? '属性' : 'Property' }}</th>
          <th scope="col" v-for="gem in selectedGems" :key="gem.id">
            {{ localizedName(gem) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '矿物族' : 'Mineral family' }}</th>
          <td v-for="gem in selectedGems" :key="'mineral-' + gem.id">{{ localizedMineral(gem) }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '化学式' : 'Chemical formula' }}</th>
          <td v-for="gem in selectedGems" :key="'formula-' + gem.id" class="property-table__token">{{ gem.category.chemical_formula }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '晶系' : 'Crystal system' }}</th>
          <td v-for="gem in selectedGems" :key="'system-' + gem.id">{{ crystalName(gem) }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '莫氏硬度' : 'Mohs hardness' }}</th>
          <td v-for="gem in selectedGems" :key="'hardness-' + gem.id" class="property-table__token">{{ gem.physical.hardness_mohs }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '比重' : 'Specific gravity' }}</th>
          <td v-for="gem in selectedGems" :key="'sg-' + gem.id" class="property-table__token">{{ gem.physical.specific_gravity }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '折射率' : 'Refractive index' }}</th>
          <td v-for="gem in selectedGems" :key="'ri-' + gem.id" class="property-table__token">{{ gem.physical.refractive_index }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '多色性' : 'Pleochroism' }}</th>
          <td v-for="gem in selectedGems" :key="'pleo-' + gem.id">{{ pleochroismName(gem) }}</td>
        </tr>
        <tr>
          <th scope="row">{{ locale === 'zh' ? '典型颜色' : 'Typical colors' }}</th>
          <td v-for="gem in selectedGems" :key="'colors-' + gem.id">{{ typicalColors(gem) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.property-table {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-gutter: stable;
  border: 1px solid rgba(184, 146, 75, 0.22);
  background: var(--color-bg-surface, #0d1b20);
}

.property-table table {
  width: 100%;
  min-width: 0;
  display: table !important;
  margin: 0 !important;
  overflow: visible !important;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.875rem;
  line-height: 1.5;
}

.property-table__label-column {
  width: 9.5rem;
}

.property-table__gem-column {
  width: 11.75rem;
}

.property-table th,
.property-table td {
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  border-bottom: 1px solid rgba(184, 146, 75, 0.16);
  border-right: 1px solid rgba(184, 146, 75, 0.12);
  text-align: left;
  vertical-align: top;
  overflow-wrap: normal;
  word-break: normal;
}

.property-table thead tr,
.property-table tbody tr {
  border: 0;
  transition: none;
}

.property-table tbody tr {
  background: var(--color-bg-surface, #0d1b20);
}

.property-table tbody tr:nth-child(even) {
  background: var(--color-bg-elevated, #153038);
}

.property-table tr:last-child th,
.property-table tr:last-child td {
  border-bottom: 0;
}

.property-table th:last-child,
.property-table td:last-child {
  border-right: 0;
}

.property-table thead th {
  background: var(--color-bg-elevated, #153038);
  color: var(--color-fg-primary, #ece4d2);
  font-size: 0.875rem;
  font-weight: var(--fw-semibold, 600);
  line-height: 1.4;
}

.property-table thead th:not(:first-child) {
  color: var(--color-accent-hover, #c8a868);
}

.property-table thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--color-bg-elevated, #153038);
}

.property-table tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
  width: 9.5rem;
  background: inherit;
  color: var(--color-fg-secondary, #d6cdb8);
  font-size: 0.875rem;
  font-weight: var(--fw-medium, 500);
  line-height: 1.5;
  box-shadow: 0.45rem 0 0.85rem rgba(3, 8, 11, 0.16);
}

.property-table td {
  color: var(--color-fg-primary, #ece4d2);
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.property-table__token {
  white-space: nowrap;
  overflow-wrap: normal !important;
  word-break: normal;
}

.property-table:focus-visible {
  outline: 2px solid var(--color-accent-hover, #c8a868);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .property-table__label-column {
    width: 8.25rem;
  }

  .property-table__gem-column {
    width: 10.75rem;
  }

  .property-table tbody th {
    width: 8.25rem;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
