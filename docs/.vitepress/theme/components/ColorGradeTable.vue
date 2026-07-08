<!--
ColorGradeTable — GIA D-Z color grading scale (23 letters).

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <ColorGradeTable locale="en" />
-->
<script setup lang="ts">
defineProps<{ locale?: 'en' | 'zh' }>()

// ponytail: hardcoded GIA grade letters and approximate hex values.
// Each letter represents a master color reference in standard lighting.
// Lighter colors (D/E/F) → colorless/near-colorless; Z → light yellow/brown.
const GRADES = [
  { letter: 'D', hex: '#f5f6f0' },
  { letter: 'E', hex: '#ecedde' },
  { letter: 'F', hex: '#e3e4d0' },
  { letter: 'G', hex: '#dadbc1' },
  { letter: 'H', hex: '#d1d2b3' },
  { letter: 'I', hex: '#c7c9a5' },
  { letter: 'J', hex: '#bebf97' },
  { letter: 'K', hex: '#b5b689' },
  { letter: 'L', hex: '#acad7c' },
  { letter: 'M', hex: '#a3a46e' },
  { letter: 'N', hex: '#9a9b61' },
  { letter: 'O', hex: '#919153' },
  { letter: 'P', hex: '#888846' },
  { letter: 'Q', hex: '#7f7f39' },
  { letter: 'R', hex: '#76762c' },
  { letter: 'S', hex: '#6d6d1f' },
  { letter: 'T', hex: '#646412' },
  { letter: 'U', hex: '#5b5b05' },
  { letter: 'V', hex: '#5a5300' },
  { letter: 'W', hex: '#594b00' },
  { letter: 'X', hex: '#584300' },
  { letter: 'Y', hex: '#573b00' },
  { letter: 'Z', hex: '#563400' },
]
</script>

<template>
  <div class="color-grade-table" :lang="locale || 'en'">
    <div class="color-grade-table__bar">
      <div v-for="g in GRADES" :key="g.letter" class="color-grade-table__cell" :style="{ background: g.hex }" :title="g.letter">
        <span class="color-grade-table__letter" :data-letter="g.letter">{{ g.letter }}</span>
      </div>
    </div>
    <div class="color-grade-table__labels">
      <span>{{ locale === 'zh' ? '无色 D-F' : 'Colorless D-F' }}</span>
      <span>{{ locale === 'zh' ? '近无色 G-J' : 'Near Colorless G-J' }}</span>
      <span>{{ locale === 'zh' ? '微 K-M' : 'Faint K-M' }}</span>
      <span>{{ locale === 'zh' ? '很淡 N-R' : 'Very Light N-R' }}</span>
      <span>{{ locale === 'zh' ? '淡 S-Z' : 'Light S-Z' }}</span>
    </div>
  </div>
</template>

<style scoped>
.color-grade-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-3, 0.75rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
}

.color-grade-table__bar {
  display: flex;
  height: 4rem;
  border-radius: var(--radius-sm, 2px);
  overflow: hidden;
}

.color-grade-table__cell {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.15rem;
  border-right: 1px solid rgba(0, 0, 0, 0.10);
  min-width: 0;
}
.color-grade-table__cell:last-child { border-right: none; }

.color-grade-table__letter {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: 0.7rem;
  font-weight: var(--fw-semibold, 600);
  color: var(--color-ink-900, #0d0c0a);
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.55);
}

.color-grade-table__labels {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  gap: var(--space-2, 0.5rem);
}
:lang(zh) .color-grade-table__labels {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
}
@media (max-width: 768px) {
  .color-grade-table__labels { flex-direction: column; gap: 0.15rem; align-items: flex-start; }
}
</style>