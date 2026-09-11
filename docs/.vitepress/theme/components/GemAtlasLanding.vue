<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'en',
})

const imageFailed = ref(false)

const isZh = props.locale === 'zh'
const localePrefix = isZh ? '/zh' : ''

const modules = isZh
  ? [
      { index: '01', label: '分类', link: '/classification/intro' },
      { index: '02', label: '鉴定', link: '/identification/intro' },
      { index: '03', label: '切割', link: '/cutting/intro' },
      { index: '04', label: '分级', link: '/grading/intro' },
      { index: '05', label: '画廊', link: '/gallery/intro' },
    ]
  : [
      { index: '01', label: 'Classification', link: '/classification/intro' },
      { index: '02', label: 'Identification', link: '/identification/intro' },
      { index: '03', label: 'Cutting', link: '/cutting/intro' },
      { index: '04', label: 'Grading', link: '/grading/intro' },
      { index: '05', label: 'Gallery', link: '/gallery/intro' },
    ]

const catalogue = {
  label: isZh ? '宝石名录' : 'Gem Index',
  count: '60',
  link: withBase(`${localePrefix}/gems/`),
}

function markImageFailed() {
  imageFailed.value = true
}
</script>

<template>
  <section class="gem-landing" :lang="isZh ? 'zh-CN' : 'en'" :aria-labelledby="isZh ? 'gem-landing-title-zh' : 'gem-landing-title-en'">
    <div class="gem-landing__backdrop" aria-hidden="true"></div>

    <header class="gem-landing__nav">
      <a class="gem-landing__brand" :href="withBase(isZh ? '/zh/' : '/')" :aria-label="isZh ? '返回 GemAtlas 首页' : 'Return to the GemAtlas home page'">
        <span>GemAtlas</span>
        <small>{{ isZh ? '从一束光开始' : 'A study of light' }}</small>
      </a>

      <nav class="gem-landing__modules" :aria-label="isZh ? '学习模块' : 'Learning modules'">
        <a v-for="module in modules" :key="module.index" :href="withBase(`${localePrefix}${module.link}.html`)" class="gem-landing__module">
          <span>{{ module.index }}</span>
          <b>{{ module.label }}</b>
        </a>
      </nav>

      <a class="gem-landing__catalogue" :href="catalogue.link" :aria-label="isZh ? '浏览全部 60 种宝石' : 'Browse all 60 gemstones'">
        <span class="gem-landing__catalogue-mark" aria-hidden="true">◇</span>
        <span>{{ catalogue.label }}</span>
        <small>{{ catalogue.count }}</small>
      </a>

      <nav class="gem-landing__locale" :aria-label="isZh ? '切换语言' : 'Switch language'">
        <a :href="withBase('/')" :aria-current="!isZh ? 'page' : undefined" :class="{ active: !isZh }">EN</a>
        <span aria-hidden="true">/</span>
        <a :href="withBase('/zh/')" :aria-current="isZh ? 'page' : undefined" :class="{ active: isZh }">中文</a>
      </nav>
    </header>

    <div class="gem-landing__scene" :class="{ 'is-failed': imageFailed }">
      <div class="gem-landing__light gem-landing__light--spill" aria-hidden="true"></div>
      <div class="gem-landing__light gem-landing__light--core" aria-hidden="true"></div>
      <div class="gem-landing__opal-frame">
        <picture>
          <source :srcset="withBase('/images/home/opal-pendant.webp')" type="image/webp" />
          <img
            class="gem-landing__opal"
            :src="withBase('/images/home/opal-pendant.png')"
            :alt="isZh ? '镶嵌在钻石与黄金中的欧珀吊坠' : 'An opal pendant set in diamonds and gold'"
            decoding="async"
            fetchpriority="high"
            loading="eager"
            @error="markImageFailed"
          />
        </picture>
        <span class="gem-landing__color-field"></span>
        <span class="gem-landing__opal-sheen" aria-hidden="true"></span>
      </div>

      <div class="gem-landing__copy">
        <h1 :id="isZh ? 'gem-landing-title-zh' : 'gem-landing-title-en'">
          <template v-if="isZh"><span class="gem-landing__title-line">从一束光</span><br /><span class="gem-landing__title-line gem-landing__title-line--recognize">认识</span><em>一颗宝石</em></template>
          <template v-else><span class="gem-landing__title-line">From one beam of light</span><br /><span class="gem-landing__title-line gem-landing__title-line--recognize">meet</span><em>a gemstone</em></template>
        </h1>
        <p class="gem-landing__lede">
          {{ isZh ? '光线掠过欧珀的微小结构，沉睡的色彩开始显现。进入 GemAtlas，从看见开始学习。' : 'As light crosses opal’s microscopic structure, hidden colour begins to appear. Enter GemAtlas and start with what you can see.' }}
        </p>
        <a class="gem-landing__cta" :href="withBase(isZh ? '/zh/compendium/' : '/compendium/')">
          {{ isZh ? '开始探索' : 'Begin exploring' }}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>

    <p v-if="imageFailed" class="gem-landing__fallback">
      {{ isZh ? '展品暂时无法载入，仍可进入 GemAtlas 知识主页。' : 'The exhibit is temporarily unavailable. You can still enter the GemAtlas compendium.' }}
    </p>
  </section>
</template>
