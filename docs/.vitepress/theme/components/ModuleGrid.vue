<!--
ModuleGrid — 5-module navigation cards for the home page.

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <ModuleGrid locale="en" />
-->
<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{ locale?: 'en' | 'zh' }>()

function moduleLink(m: (typeof MODULES)[number]): string {
  const prefix = props.locale === 'zh' ? '/zh' : ''
  return withBase(`${prefix}${m.link}.html`)
}

const MODULES = [
  { index: '01', titleEn: 'Classification', titleZh: '分类', descEn: 'Mineralogy, optical phenomena, color trees, crystal systems.', descZh: '矿物学、光学效应、颜色树、晶系。', link: '/classification/intro' },
  { index: '02', titleEn: 'Identification', titleZh: '鉴定', descEn: 'Physical properties, Mohs scale, inclusions, spectra.', descZh: '物理性质、莫氏硬度、内含物、吸收光谱。', link: '/identification/intro' },
  { index: '03', titleEn: 'Cutting', titleZh: '切割', descEn: 'Faceting geometry, fancy cuts, cabochons, cameos.', descZh: '刻面几何、异形切、蛋面、雕刻。', link: '/cutting/intro' },
  { index: '04', titleEn: 'Grading', titleZh: '分级', descEn: 'GIA 4Cs, fancy color grading, treatment disclosure.', descZh: 'GIA 4Cs、有色宝石分级、处理披露。', link: '/grading/intro' },
  { index: '06', titleEn: 'Gallery', titleZh: '画廊', descEn: 'Signature pieces from seven leading maisons.', descZh: '七家顶级珠宝世家的标志性作品。', link: '/gallery/intro' },
]
</script>

<template>
  <section class="gem-modules" :lang="locale || 'en'">
    <div class="gem-modules__heading">{{ locale === 'zh' ? '模块' : 'Modules' }}</div>
    <div class="gem-modules__grid">
      <a v-for="m in MODULES" :key="m.index" class="gem-module" :href="moduleLink(m)">
        <div class="gem-module__index">{{ m.index }}</div>
        <h3 class="gem-module__title">{{ locale === 'zh' ? m.titleZh : m.titleEn }}</h3>
        <p class="gem-module__desc">{{ locale === 'zh' ? m.descZh : m.descEn }}</p>
      </a>
    </div>
  </section>
</template>
