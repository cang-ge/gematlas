<!--
ClarityScale — GIA clarity grading (FL, IF, VVS, VS, SI, I).

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <ClarityScale locale="en" />
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ locale?: 'en' | 'zh' }>()

const LEVELS = [
  { id: 'FL',  name_zh: '无瑕',     name_en: 'FL — Flawless',          desc_zh: '在 10 倍放大下无内含物或瑕疵', desc_en: 'No inclusions or blemishes at 10×' },
  { id: 'IF',  name_zh: '内无瑕',   name_en: 'IF — Internally Flawless', desc_zh: '无内含物，仅微小表面瑕疵', desc_en: 'No inclusions, only minor surface blemishes' },
  { id: 'VVS', name_zh: '极轻微',   name_en: 'VVS1/VVS2 — Very Very Slightly Included', desc_zh: '极微小内含物，极难观察', desc_en: 'Minute inclusions, very difficult to see' },
  { id: 'VS',  name_zh: '轻微',     name_en: 'VS1/VS2 — Very Slightly Included', desc_zh: '微小内含物，10× 可见但不易', desc_en: 'Minor inclusions, 10× visible but not prominent' },
  { id: 'SI',  name_zh: '微',       name_en: 'SI1/SI2 — Slightly Included', desc_zh: '明显内含物，10× 可见', desc_en: 'Noticeable inclusions at 10×' },
  { id: 'I',   name_zh: '内含',     name_en: 'I1/I2/I3 — Included',       desc_zh: '肉眼可见的内含物', desc_en: 'Inclusions visible to the naked eye' },
]

const hovered = ref<string | null>(null)
</script>

<template>
  <div class="clarity-scale" :lang="locale || 'en'">
    <div class="clarity-scale__bar">
      <div
        v-for="lv in LEVELS"
        :key="lv.id"
        class="clarity-scale__segment"
        :class="{ 'clarity-scale__segment--active': hovered === lv.id }"
        @mouseenter="hovered = lv.id"
        @mouseleave="hovered = null"
      >
        <span class="clarity-scale__num">{{ lv.id }}</span>
      </div>
    </div>
    <div v-if="hovered" class="clarity-scale__label">
      {{ locale === 'zh' ? LEVELS.find(l => l.id === hovered)?.name_zh : LEVELS.find(l => l.id === hovered)?.name_en }}
      <small>{{ locale === 'zh' ? LEVELS.find(l => l.id === hovered)?.desc_zh : LEVELS.find(l => l.id === hovered)?.desc_en }}</small>
    </div>
    <div v-else class="clarity-scale__hint">
      {{ locale === 'zh' ? '悬停查看净度等级' : 'Hover to explore clarity' }}
    </div>
  </div>
</template>

<style scoped>
.clarity-scale {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
}

.clarity-scale__bar {
  display: flex;
  height: 2.5rem;
  border-radius: var(--radius-sm, 2px);
  overflow: hidden;
}

.clarity-scale__segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated, #25221c);
  border-right: 1px solid rgba(184, 146, 75, 0.18);
  cursor: default;
  transition: background 0.2s ease;
}
.clarity-scale__segment:last-child { border-right: none; }
.clarity-scale__segment--active { background: var(--color-accent, #b8924b); }

.clarity-scale__num {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-fg-muted, #a89e8a);
  font-weight: var(--fw-semibold, 600);
  letter-spacing: 0.05em;
}
.clarity-scale__segment--active .clarity-scale__num { color: var(--color-fg-primary, #ece4d2); }

.clarity-scale__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
}
.clarity-scale__label { font-family: var(--font-display, 'Cormorant Garamond', serif); font-size: var(--text-lg, 1.125rem); color: var(--color-fg-primary, #ece4d2); font-weight: var(--fw-semibold, 600); }
.clarity-scale__label small { font-family: var(--font-body, 'Inter', sans-serif); font-size: var(--text-xs, 0.75rem); color: var(--color-fg-muted, #a89e8a); font-weight: var(--fw-regular, 400); }

.clarity-scale__hint {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  text-align: center;
}
</style>