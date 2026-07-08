<!--
ColorWheel — GIA 12-hue color wheel with central tone indicator.

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <ColorWheel locale="en" />
-->
<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ locale?: 'en' | 'zh' }>()

interface Hue {
  id: string
  hex: string
  name_zh: string
  name_en: string
}

// ponytail: 12 hues around a wheel — equal-width SVG wedges.
// Central disc shows white→grey→black tone gradient (vertical).
const HUES: Hue[] = [
  { id: 'red',           hex: '#9b111e', name_zh: '红色',     name_en: 'Red' },
  { id: 'red-orange',    hex: '#bf4040', name_zh: '红橙',     name_en: 'Red-Orange' },
  { id: 'orange',        hex: '#e07b39', name_zh: '橙色',     name_en: 'Orange' },
  { id: 'yellow-orange', hex: '#e6b34a', name_zh: '黄橙',     name_en: 'Yellow-Orange' },
  { id: 'yellow',        hex: '#d8c236', name_zh: '黄色',     name_en: 'Yellow' },
  { id: 'yellow-green',  hex: '#9fc04a', name_zh: '黄绿',     name_en: 'Yellow-Green' },
  { id: 'green',         hex: '#4a9b3e', name_zh: '绿色',     name_en: 'Green' },
  { id: 'blue-green',    hex: '#3a8b8e', name_zh: '蓝绿',     name_en: 'Blue-Green' },
  { id: 'blue',          hex: '#1f5f9f', name_zh: '蓝色',     name_en: 'Blue' },
  { id: 'blue-violet',   hex: '#5a4a99', name_zh: '蓝紫',     name_en: 'Blue-Violet' },
  { id: 'violet',        hex: '#7b439b', name_zh: '紫色',     name_en: 'Violet' },
  { id: 'red-violet',    hex: '#8b3e5f', name_zh: '紫红',     name_en: 'Red-Violet' },
]

const hovered = ref<string | null>(null)

const wedges = computed(() => {
  const r = 80
  const cx = 100, cy = 100
  return HUES.map((h, i) => {
    const a1 = (i / 12) * 360 - 90
    const a2 = ((i + 1) / 12) * 360 - 90
    const p1 = (cx + r * Math.cos(a1 * Math.PI / 180)).toFixed(2)
    const q1 = (cy + r * Math.sin(a1 * Math.PI / 180)).toFixed(2)
    const p2 = (cx + r * Math.cos(a2 * Math.PI / 180)).toFixed(2)
    const q2 = (cy + r * Math.sin(a2 * Math.PI / 180)).toFixed(2)
    return { id: h.id, hex: h.hex, name_zh: h.name_zh, name_en: h.name_en, d: `M${cx} ${cy} L${p1} ${q1} A${r} ${r} 0 0 1 ${p2} ${q2} Z` }
  })
})
</script>

<template>
  <div class="color-wheel" :lang="locale || 'en'">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="(locale === 'zh' ? '宝石色相轮' : 'Gemstone color wheel')">
      <g v-for="w in wedges" :key="w.id">
        <path :d="w.d" :fill="w.hex" stroke="currentColor" stroke-width="0.5"
          :class="{ 'color-wheel__wedge--active': hovered === w.id }"
          @mouseenter="hovered = w.id" @mouseleave="hovered = null">
          <title>{{ locale === 'zh' ? w.name_zh : w.name_en }}</title>
        </path>
      </g>
      <!-- Center tone disc (white → grey → black gradient → represents tone axis) -->
      <defs>
        <linearGradient id="tone-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#ece4d2"/>
          <stop offset="100%" stop-color="#0d0c0a"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="22" fill="url(#tone-gradient)" stroke="currentColor" stroke-width="1" />
    </svg>

    <div v-if="hovered" class="color-wheel__label">
      {{ locale === 'zh' ? HUES.find(h => h.id === hovered)?.name_zh : HUES.find(h => h.id === hovered)?.name_en }}
    </div>
    <div v-else class="color-wheel__hint">
      {{ locale === 'zh' ? '悬停查看色相' : 'Hover to explore hue' }}
    </div>
    <div class="color-wheel__axes">
      <span>{{ locale === 'zh' ? '色调（中心）' : 'Tone (center)' }}</span>
    </div>
  </div>
</template>

<style scoped>
.color-wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  color: var(--color-accent, #b8924b);
  max-width: 320px;
}

.color-wheel svg { width: 100%; height: auto; max-width: 260px; }

.color-wheel__wedge--active {
  stroke: var(--color-accent, #b8924b);
  stroke-width: 1.5;
  cursor: pointer;
  filter: brightness(1.2);
}

.color-wheel__label {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-lg, 1.125rem);
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
}
:lang(zh) .color-wheel__label { font-family: var(--font-zh-display, 'Noto Serif SC', serif); font-size: var(--text-base, 1rem); }

.color-wheel__hint {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
}

.color-wheel__axes {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding-top: 0.25rem;
  border-top: 1px solid rgba(184, 146, 75, 0.20);
}
:lang(zh) .color-wheel__axes { font-family: var(--font-zh-display, 'Noto Serif SC', serif); }
</style>