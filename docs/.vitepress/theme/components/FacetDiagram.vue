<!--
FacetDiagram — Side-view SVG of round brilliant cut with hover labels.

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <FacetDiagram locale="en" />
-->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ locale?: 'en' | 'zh' }>()

interface Part {
  id: string
  name_zh: string
  name_en: string
  detail_zh: string
  detail_en: string
}

const PARTS: Part[] = [
  { id: 'table',     name_zh: '台面',   name_en: 'Table',     detail_zh: '顶部平面 — 示例比例约 53–58%', detail_en: 'Top flat facet — example proportion about 53–58%' },
  { id: 'crown',     name_zh: '冠部',   name_en: 'Crown',     detail_zh: '腰部上方斜面 — 冠角 34-35°', detail_en: 'Upper slanted section — crown angle 34-35°' },
  { id: 'girdle',    name_zh: '腰棱',   name_en: 'Girdle',    detail_zh: '圆形最宽处 — 在耐久性与重量间取舍', detail_en: 'Widest point — balances durability and weight' },
  { id: 'pavilion',  name_zh: '亭部',   name_en: 'Pavilion',  detail_zh: '腰部下方斜面 — 亭角 40.75-41.2°', detail_en: 'Lower section — pavilion angle 40.75-41.2°' },
  { id: 'culet',     name_zh: '底尖',   name_en: 'Culet',     detail_zh: '底部尖端 — 现代切工多为封闭', detail_en: 'Bottom tip — modern cuts usually closed' },
]

const hovered = ref<string | null>(null)
const selected = ref<string | null>(null)
const isZh = (): boolean => props.locale === 'zh'
const activePart = (): string | null => selected.value || hovered.value
const partName = (id: string): string => {
  const part = PARTS.find(p => p.id === id)
  return isZh() ? (part?.name_zh || id) : (part?.name_en || id)
}
const partDetail = (id: string): string => {
  const part = PARTS.find(p => p.id === id)
  return isZh() ? (part?.detail_zh || '') : (part?.detail_en || '')
}
const selectPart = (id: string) => {
  selected.value = selected.value === id ? null : id
}
</script>

<template>
  <div class="facet-diagram" :lang="locale || 'en'">
    <svg viewBox="0 0 400 240" class="facet-diagram__svg" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh() ? '标准圆钻型剖面图' : 'Round brilliant cut cross-section'">
      <!-- Pavilion (bottom half) -->
      <polygon points="100,130 300,130 250,210 150,210" fill="rgba(184,146,75,0.08)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': activePart() === 'pavilion' }"
        @mouseenter="hovered = 'pavilion'" @mouseleave="hovered = null" />
      <!-- Girdle (middle band) -->
      <rect x="100" y="125" width="200" height="10" fill="rgba(184,146,75,0.18)" stroke="currentColor" stroke-width="1"
        :class="{ 'facet-diagram__part--active': activePart() === 'girdle' }"
        @mouseenter="hovered = 'girdle'" @mouseleave="hovered = null" />
      <!-- Crown (top half) -->
      <polygon points="200,40 100,130 300,130" fill="rgba(184,146,75,0.08)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': activePart() === 'crown' }"
        @mouseenter="hovered = 'crown'" @mouseleave="hovered = null" />
      <!-- Table (top flat) -->
      <rect x="160" y="35" width="80" height="12" fill="rgba(184,146,75,0.22)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': activePart() === 'table' }"
        @mouseenter="hovered = 'table'" @mouseleave="hovered = null" />
      <!-- Culet (bottom point) -->
      <circle cx="200" cy="215" r="3" fill="currentColor"
        :class="{ 'facet-diagram__part--active': activePart() === 'culet' }"
        @mouseenter="hovered = 'culet'" @mouseleave="hovered = null" />
      <!-- Center axis -->
      <line x1="200" y1="20" x2="200" y2="240" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" opacity="0.4" />
    </svg>

    <div v-if="activePart()" class="facet-diagram__tooltip" role="status" aria-live="polite">
      <strong>{{ partName(activePart()!) }}</strong>
      <span>{{ partDetail(activePart()!) }}</span>
    </div>
    <div v-else class="facet-diagram__hint">
      {{ isZh() ? '悬停查看切工部位' : 'Hover to explore parts' }}
    </div>
    <div class="facet-diagram__parts" role="list" :aria-label="isZh() ? '切工部位选择' : 'Cut part selector'">
      <button
        v-for="part in PARTS"
        :key="part.id"
        type="button"
        class="facet-diagram__part-button"
        :class="{ 'facet-diagram__part-button--active': activePart() === part.id }"
        :aria-pressed="selected === part.id"
        @click="selectPart(part.id)"
        @mouseenter="hovered = part.id"
        @mouseleave="hovered = null"
        @focus="hovered = part.id"
        @blur="hovered = null"
      >{{ isZh() ? part.name_zh : part.name_en }}</button>
    </div>
    <p class="facet-diagram__caption">
      {{ isZh() ? '示意图：用于理解部位关系，不用于测量或评定成品。' : 'Schematic only: for part relationships, not measurement or grading.' }}
    </p>
  </div>
</template>

<style scoped>
.facet-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  color: var(--color-accent, #b8924b);
}

.facet-diagram__svg {
  width: 100%;
  max-width: 460px;
  height: auto;
}

.facet-diagram__part--active {
  fill: rgba(184, 146, 75, 0.35);
  stroke-width: 2.5;
  cursor: pointer;
}

.facet-diagram__parts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}

.facet-diagram__part-button {
  padding: 0.38rem 0.65rem;
  border: 1px solid rgba(184, 146, 75, 0.24);
  border-radius: 999px;
  background: transparent;
  color: var(--color-fg-secondary, #d6cdb8);
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background-color 160ms ease-out, border-color 160ms ease-out, color 160ms ease-out, transform 160ms ease-out;
}
.facet-diagram__part-button:hover,
.facet-diagram__part-button--active {
  border-color: var(--color-accent, #b8924b);
  background: rgba(184, 146, 75, 0.14);
  color: var(--color-fg-primary, #ece4d2);
}
.facet-diagram__part-button:active { transform: scale(0.97); }
.facet-diagram__part-button:focus-visible {
  outline: 2px solid var(--color-accent, #b8924b);
  outline-offset: 2px;
}

.facet-diagram__tooltip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  font-family: var(--font-body, 'Inter', sans-serif);
}
.facet-diagram__tooltip strong {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-xl, 1.25rem);
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
}
.facet-diagram__tooltip span {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-fg-secondary, #d6cdb8);
}

.facet-diagram__hint {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
}

.facet-diagram__caption {
  max-width: 34rem;
  margin: 0;
  color: var(--color-fg-muted, #a89e8a);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.72rem;
  line-height: 1.5;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .facet-diagram__part-button { transition: none; }
}
</style>
