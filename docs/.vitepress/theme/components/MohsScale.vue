<!--
MohsScale — Interactive Mohs hardness scale (1-10).

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <MohsScale locale="en" />
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ locale?: 'en' | 'zh' }>()

const SCALE = [
  { hardness: 1, label_zh: '滑石', label_en: 'Talc' },
  { hardness: 2, label_zh: '石膏', label_en: 'Gypsum' },
  { hardness: 3, label_zh: '方解石', label_en: 'Calcite' },
  { hardness: 4, label_zh: '萤石', label_en: 'Fluorite' },
  { hardness: 5, label_zh: '磷灰石', label_en: 'Apatite' },
  { hardness: 6, label_zh: '正长石', label_en: 'Orthoclase' },
  { hardness: 7, label_zh: '石英', label_en: 'Quartz' },
  { hardness: 8, label_zh: '黄玉', label_en: 'Topaz' },
  { hardness: 9, label_zh: '刚玉', label_en: 'Corundum' },
  { hardness: 10, label_zh: '金刚石', label_en: 'Diamond' },
]

const hovered = ref<number | null>(null)
</script>

<template>
  <div class="mohs-scale" :lang="locale || 'en'" role="img" :aria-label="locale === 'zh' ? '莫氏硬度尺 1-10' : 'Mohs hardness scale 1-10'">
    <div class="mohs-scale__bar">
      <div
        v-for="s in SCALE"
        :key="s.hardness"
        class="mohs-scale__segment"
        :class="{ 'mohs-scale__segment--active': hovered !== null && s.hardness <= hovered }"
        @mouseenter="hovered = s.hardness"
        @mouseleave="hovered = null"
      >
        <span class="mohs-scale__num">{{ s.hardness }}</span>
      </div>
    </div>
    <div v-if="hovered" class="mohs-scale__label">
      {{ SCALE[hovered - 1][locale === 'zh' ? 'label_zh' : 'label_en'] }}
    </div>
    <div v-else class="mohs-scale__hint">
      {{ locale === 'zh' ? '悬停查看矿物' : 'Hover to explore' }}
    </div>
  </div>
</template>

<style scoped>
.mohs-scale {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
}

.mohs-scale__bar {
  display: flex;
  height: 2.5rem;
  border-radius: var(--radius-sm, 2px);
  overflow: hidden;
}

.mohs-scale__segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated, #25221c);
  border-right: 1px solid rgba(184, 146, 75, 0.18);
  cursor: default;
  transition: background 0.2s ease;
}
.mohs-scale__segment:last-child { border-right: none; }
.mohs-scale__segment--active {
  background: var(--color-accent, #b8924b);
}

.mohs-scale__num {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-fg-muted, #a89e8a);
  transition: color 0.2s ease;
}
.mohs-scale__segment--active .mohs-scale__num {
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
}

.mohs-scale__label {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-lg, 1.125rem);
  color: var(--color-fg-primary, #ece4d2);
  text-align: center;
}

.mohs-scale__hint {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  text-align: center;
}
</style>
