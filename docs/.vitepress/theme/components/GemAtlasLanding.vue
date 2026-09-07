<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'en',
})

const replayKey = ref(0)
const imageFailed = ref(false)
const isReplaying = ref(false)
let replayTimer: number | undefined

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

function replayReveal() {
  if (replayTimer !== undefined) {
    window.clearTimeout(replayTimer)
  }

  isReplaying.value = true
  replayKey.value += 1
  replayTimer = window.setTimeout(() => {
    isReplaying.value = false
    replayTimer = undefined
  }, 20_000)
}

function markImageFailed() {
  imageFailed.value = true
}
</script>

<template>
  <section class="gem-landing" :class="{ 'is-replaying': isReplaying }" :lang="isZh ? 'zh-CN' : 'en'" :aria-labelledby="isZh ? 'gem-landing-title-zh' : 'gem-landing-title-en'">
    <div class="gem-landing__backdrop" aria-hidden="true"></div>
    <div class="gem-landing__light" aria-hidden="true"></div>

    <header class="gem-landing__nav">
      <a class="gem-landing__brand" :href="withBase(isZh ? '/zh/' : '/')" :aria-label="isZh ? '返回 GemAtlas 首页' : 'Return to the GemAtlas home page'">
        <span>GemAtlas</span>
        <small>{{ isZh ? '从一束光开始' : 'A study of light' }}</small>
      </a>

      <nav class="gem-landing__modules" :aria-label="isZh ? '学习模块' : 'Learning modules'">
        <a v-for="module in modules" :key="module.index" :href="withBase(`${localePrefix}${module.link}.html`)" :class="['gem-landing__module', { 'is-featured': module.index === '01' }]">
          <span>{{ module.index }}</span>
          <b>{{ module.label }}</b>
        </a>
      </nav>
    </header>

    <div class="gem-landing__scene" :class="{ 'is-failed': imageFailed }" :key="replayKey">
      <div class="gem-landing__opal-frame">
        <img
          class="gem-landing__opal"
          :src="withBase('/images/home/opal-pendant.jpg')"
          :alt="isZh ? '镶嵌在钻石与黄金中的欧珀吊坠' : 'An opal pendant set in diamonds and gold'"
          @error="markImageFailed"
        />
        <span class="gem-landing__color-field"></span>
      </div>

      <div class="gem-landing__copy">
        <p class="gem-landing__eyebrow">{{ isZh ? 'PRECIOUS OPAL · A STUDY OF LIGHT' : 'PRECIOUS OPAL · A STUDY OF LIGHT' }}</p>
        <h1 :id="isZh ? 'gem-landing-title-zh' : 'gem-landing-title-en'">
          <template v-if="isZh">从一束光，认识<br /><em>一颗宝石。</em></template>
          <template v-else>From one beam of light,<br /><em>meet a gemstone.</em></template>
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

    <footer class="gem-landing__meta">
      <div>
        <span>{{ isZh ? 'HERO STUDY / 01' : 'HERO STUDY / 01' }}</span>
        <strong>{{ isZh ? '欧珀 · Play-of-color' : 'Opal · Play-of-color' }}</strong>
      </div>
      <button class="gem-landing__replay" type="button" @click="replayReveal">
        {{ isZh ? '重播光线揭示' : 'Replay light reveal' }}
      </button>
    </footer>

    <p v-if="imageFailed" class="gem-landing__fallback">
      {{ isZh ? '展品暂时无法载入，仍可进入 GemAtlas 知识主页。' : 'The exhibit is temporarily unavailable. You can still enter the GemAtlas compendium.' }}
    </p>
  </section>
</template>
