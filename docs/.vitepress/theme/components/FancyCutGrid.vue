<!--
FancyCutGrid — 8-shape grid of fancy (non-round-brilliant) cuts.

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <FancyCutGrid locale="en" />
-->
<script setup lang="ts">
defineProps<{ locale?: 'en' | 'zh' }>()

interface Cut {
  id: string
  name_zh: string
  name_en: string
  svg: string
  desc_zh: string
  desc_en: string
}

// ponytail: inline SVG silhouettes, geometric abstractions (not photorealistic).
const CUTS: Cut[] = [
  {
    id: 'emerald', name_zh: '祖母绿切', name_en: 'Emerald Cut',
    svg: `<svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="8" width="40" height="24"/><polygon points="14,8 14,32" /><polygon points="46,8 46,32" /></svg>`,
    desc_zh: '矩形台阶切工，强调净度',
    desc_en: 'Rectangular step cut; emphasizes clarity',
  },
  {
    id: 'princess', name_zh: '公主方', name_en: 'Princess Cut',
    svg: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="8,8 52,8 8,52 52,52"/></svg>`,
    desc_zh: '方形明亮切工',
    desc_en: 'Square brilliant cut',
  },
  {
    id: 'oval', name_zh: '椭圆切', name_en: 'Oval Cut',
    svg: `<svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="30" cy="20" rx="22" ry="12"/></svg>`,
    desc_zh: '明亮切工的椭圆形变体',
    desc_en: 'Elliptical brilliant variation',
  },
  {
    id: 'pear', name_zh: '水滴切', name_en: 'Pear Cut',
    svg: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M30,5 Q50,30 30,55 Q10,30 30,5 Z"/></svg>`,
    desc_zh: '泪滴形，一端尖一端圆',
    desc_en: 'Tear-shape, pointed end + rounded end',
  },
  {
    id: 'heart', name_zh: '心形切', name_en: 'Heart Cut',
    svg: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M30,55 C10,40 5,20 20,15 C25,12 28,15 30,20 C32,15 35,12 40,15 C55,20 50,40 30,55 Z"/></svg>`,
    desc_zh: '心形轮廓',
    desc_en: 'Heart silhouette',
  },
  {
    id: 'marquise', name_zh: '马眼切', name_en: 'Marquise Cut',
    svg: `<svg viewBox="0 0 80 40" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="40" cy="20" rx="36" ry="10"/></svg>`,
    desc_zh: '橄榄形，两端尖',
    desc_en: 'Navette/oval with pointed ends',
  },
  {
    id: 'cushion', name_zh: '枕形切', name_en: 'Cushion Cut',
    svg: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="44" height="44" rx="8"/></svg>`,
    desc_zh: '圆角方形明亮切工',
    desc_en: 'Square brilliant with rounded corners',
  },
  {
    id: 'asscher', name_zh: '阿斯切', name_en: 'Asscher Cut',
    svg: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="14,8 46,8 52,14 52,46 46,52 14,52 8,46 8,14"/></svg>`,
    desc_zh: '八角形台阶切工',
    desc_en: 'Octagonal step cut',
  },
]
</script>

<template>
  <div class="fancy-cut-grid" :lang="locale || 'en'">
    <div v-for="cut in CUTS" :key="cut.id" class="fancy-cut-grid__cell">
      <div class="fancy-cut-grid__shape" v-html="cut.svg" />
      <h4 class="fancy-cut-grid__name">{{ locale === 'zh' ? cut.name_zh : cut.name_en }}</h4>
      <p class="fancy-cut-grid__desc">{{ locale === 'zh' ? cut.desc_zh : cut.desc_en }}</p>
    </div>
  </div>
</template>

<style scoped>
.fancy-cut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3, 0.75rem);
}
@media (max-width: 768px) {
  .fancy-cut-grid { grid-template-columns: repeat(2, 1fr); }
}

.fancy-cut-grid__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-3, 0.75rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.18);
  border-radius: var(--radius-md, 4px);
  transition: border-color 0.2s ease;
  text-align: center;
}
.fancy-cut-grid__cell:hover {
  border-color: rgba(184, 146, 75, 0.40);
}

.fancy-cut-grid__shape {
  width: 100%;
  max-width: 70px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent, #b8924b);
}
.fancy-cut-grid__shape :deep(svg) {
  width: 100%;
  height: 100%;
}

.fancy-cut-grid__name {
  margin: 0;
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-base, 1rem);
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
}
:lang(zh) .fancy-cut-grid__name {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
  font-size: var(--text-sm, 0.875rem);
}

.fancy-cut-grid__desc {
  margin: 0;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  line-height: var(--lh-snug, 1.3);
}
:lang(zh) .fancy-cut-grid__desc {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
}
</style>