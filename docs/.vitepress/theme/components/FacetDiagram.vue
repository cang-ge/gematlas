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
  { id: 'table',     name_zh: '台面',   name_en: 'Table',     detail_zh: '顶部平面 — 通常占总宽 53-60%', detail_en: 'Top flat facet — typically 53-60% of width' },
  { id: 'crown',     name_zh: '冠部',   name_en: 'Crown',     detail_zh: '腰部上方斜面 — 冠角 34-35°', detail_en: 'Upper slanted section — crown angle 34-35°' },
  { id: 'girdle',    name_zh: '腰部',   name_en: 'Girdle',    detail_zh: '圆形最宽处 — 通常最薄但有支撑', detail_en: 'Widest point — thinnest zone, provides structure' },
  { id: 'pavilion',  name_zh: '亭部',   name_en: 'Pavilion',  detail_zh: '腰部下方斜面 — 亭角 40.75-41.2°', detail_en: 'Lower section — pavilion angle 40.75-41.2°' },
  { id: 'culet',     name_zh: '底尖',   name_en: 'Culet',     detail_zh: '底部尖端 — 现代切工多为封闭', detail_en: 'Bottom tip — modern cuts usually closed' },
]

const hovered = ref<string | null>(null)
const isZh = (): boolean => props.locale === 'zh'
</script>

<template>
  <div class="facet-diagram" :lang="locale || 'en'">
    <svg viewBox="0 0 400 240" class="facet-diagram__svg" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="isZh() ? '标准圆钻型剖面图' : 'Round brilliant cut cross-section'">
      <!-- Pavilion (bottom half) -->
      <polygon points="100,130 300,130 250,210 150,210" fill="rgba(184,146,75,0.08)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': hovered === 'pavilion' }"
        @mouseenter="hovered = 'pavilion'" @mouseleave="hovered = null" />
      <!-- Girdle (middle band) -->
      <rect x="100" y="125" width="200" height="10" fill="rgba(184,146,75,0.18)" stroke="currentColor" stroke-width="1"
        :class="{ 'facet-diagram__part--active': hovered === 'girdle' }"
        @mouseenter="hovered = 'girdle'" @mouseleave="hovered = null" />
      <!-- Crown (top half) -->
      <polygon points="200,40 100,130 300,130" fill="rgba(184,146,75,0.08)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': hovered === 'crown' }"
        @mouseenter="hovered = 'crown'" @mouseleave="hovered = null" />
      <!-- Table (top flat) -->
      <rect x="160" y="35" width="80" height="12" fill="rgba(184,146,75,0.22)" stroke="currentColor" stroke-width="1.5"
        :class="{ 'facet-diagram__part--active': hovered === 'table' }"
        @mouseenter="hovered = 'table'" @mouseleave="hovered = null" />
      <!-- Culet (bottom point) -->
      <circle cx="200" cy="215" r="3" fill="currentColor"
        :class="{ 'facet-diagram__part--active': hovered === 'culet' }"
        @mouseenter="hovered = 'culet'" @mouseleave="hovered = null" />
      <!-- Center axis -->
      <line x1="200" y1="20" x2="200" y2="240" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" opacity="0.4" />
    </svg>

    <div v-if="hovered" class="facet-diagram__tooltip" role="tooltip">
      <strong>{{ isZh() ? PARTS.find(p => p.id === hovered)?.name_zh : PARTS.find(p => p.id === hovered)?.name_en }}</strong>
      <span>{{ isZh() ? PARTS.find(p => p.id === hovered)?.detail_zh : PARTS.find(p => p.id === hovered)?.detail_en }}</span>
    </div>
    <div v-else class="facet-diagram__hint">
      {{ isZh() ? '悬停查看切工部位' : 'Hover to explore parts' }}
    </div>
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
</style>