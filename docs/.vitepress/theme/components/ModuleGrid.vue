<!--
  ModuleGrid — editorial index for the GemAtlas learning compendium.

  The DOM stays in learning order (01 → 05), while the layout creates a
  magazine-like hierarchy without sacrificing keyboard navigation or mobile
  reading flow.
-->
<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{ locale?: 'en' | 'zh' }>()

const isZh = () => props.locale === 'zh'

function moduleLink(m: (typeof MODULES)[number]): string {
  const prefix = isZh() ? '/zh' : ''
  return withBase(`${prefix}${m.link}.html`)
}

function catalogLink(): string {
  return withBase(`${isZh() ? '/zh' : ''}/gems/`)
}

const MODULES = [
  {
    index: '01',
    titleEn: 'Classification',
    titleZh: '分类与基础',
    descEn: 'Mineralogy, crystal systems, optical phenomena, and the language of color.',
    descZh: '从矿物学、晶系到光学效应，建立理解宝石的第一套语言。',
    link: '/classification/intro',
  },
  {
    index: '02',
    titleEn: 'Identification',
    titleZh: '识别与鉴定',
    descEn: 'Physical properties, Mohs scale, inclusions, and spectra.',
    descZh: '从物理性质、莫氏硬度到内含物与光谱，学会辨认一颗宝石。',
    link: '/identification/intro',
  },
  {
    index: '03',
    titleEn: 'Cutting',
    titleZh: '切割与呈现',
    descEn: 'Faceting geometry, fancy cuts, cabochons, and carving.',
    descZh: '理解刻面几何、异形切与蛋面，观察光线如何被重新组织。',
    link: '/cutting/intro',
  },
  {
    index: '04',
    titleEn: 'Grading',
    titleZh: '分级与评估',
    descEn: 'The 4Cs, fancy-color grading, clarity, and treatment disclosure.',
    descZh: '理解颜色、净度、处理与价值之间的关系，读懂专业评估。',
    link: '/grading/intro',
  },
  {
    index: '05',
    titleEn: 'Gallery',
    titleZh: '画廊与收藏',
    descEn: 'Signature pieces, design eras, and the stories behind remarkable stones.',
    descZh: '从作品、风格到时代，理解宝石如何进入真实的收藏与佩戴。',
    link: '/gallery/intro',
  },
]
</script>

<template>
  <div class="gem-compendium" :lang="locale || 'en'">
  <section class="gem-modules" aria-labelledby="gem-modules-title">
    <div class="gem-modules__intro">
      <div class="gem-modules__eyebrow">
        <svg class="gem-modules__mark" viewBox="0 0 32 32" aria-hidden="true">
          <polygon points="16,2 30,16 16,30 2,16" />
          <path d="M16 2 8 16l8 14 8-14Z" />
          <path d="M8 16h16" />
          <path class="gem-modules__ray" d="M3.5 16h25" />
        </svg>
        <span>{{ isZh() ? 'GEMATLAS / 知识索引' : 'GEMATLAS / THE COMPENDIUM' }}</span>
      </div>

      <h1 id="gem-modules-title" class="gem-modules__title">
        <span v-if="isZh()">沿着光，<br /><em>读懂宝石</em></span>
        <span v-else>Read the<br /><em>Gemstone</em><br />Through Light</span>
      </h1>

      <p class="gem-modules__lead">
        {{ isZh() ? '五条路径，从结构与光线，走到作品与价值。' : 'Five paths from structure and light to craft, value, and care.' }}
      </p>
      <div class="gem-modules__meta">
        <span>OPEN-SOURCE GEMOLOGICAL KNOWLEDGE</span>
        <span>01—05</span>
      </div>
    </div>

    <nav class="gem-modules__index" :aria-label="isZh() ? '知识模块索引' : 'Compendium index'">
      <div class="gem-modules__index-heading">
        <span>{{ isZh() ? '阅读索引' : 'Reading index' }}</span>
        <span>{{ isZh() ? '选择一条路径开始' : 'Choose a path to begin' }}</span>
      </div>

      <ol class="gem-modules__list">
        <li v-for="(m, moduleIndex) in MODULES" :key="m.index" class="gem-modules__item">
          <a class="gem-module" :class="{ 'gem-module--lead': moduleIndex === 0 }" :href="moduleLink(m)">
            <span class="gem-module__index">{{ m.index }}</span>
            <span class="gem-module__copy">
              <span class="gem-module__title">{{ isZh() ? m.titleZh : m.titleEn }}</span>
              <span class="gem-module__desc">{{ isZh() ? m.descZh : m.descEn }}</span>
            </span>
            <span class="gem-module__arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ol>
    </nav>
  </section>
  <a class="gemstone-index-spotlight" :href="catalogLink()">
    <span class="gemstone-index-spotlight__count" aria-hidden="true">60</span>
    <span class="gemstone-index-spotlight__copy">
      <span class="gemstone-index-spotlight__eyebrow">{{ isZh() ? 'GEMSTONE INDEX / 全站收录' : 'GEMSTONE INDEX / THE COLLECTION' }}</span>
      <span class="gemstone-index-spotlight__title">{{ isZh() ? '宝石名录' : 'The Stone Index' }}</span>
      <span class="gemstone-index-spotlight__desc">{{ isZh() ? '从一颗宝石的名字开始，进入 GemAtlas 收录的 60 种宝石。' : 'Begin with a name and enter the 60 gemstone species held by GemAtlas.' }}</span>
    </span>
    <span class="gemstone-index-spotlight__arrow" aria-hidden="true">↗</span>
  </a>
  </div>
</template>
