<!--
GemCard — a visual, bilingual entry card for the GemAtlas gemstone index.
-->
<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{
  id: string
  nameZh: string
  nameEn: string
  mineral: string
  groupLabel?: string
  hardness: number
  imageSrc: string
  locale?: 'en' | 'zh'
}>()

function gemLink(id: string, locale?: string): string {
  const prefix = locale === 'zh' ? '/zh' : ''
  return withBase(`${prefix}/gems/${id}.html`)
}

const cardLabel = props.locale === 'zh'
  ? `${props.nameZh}，${props.nameEn}，进入宝石详页`
  : `${props.nameEn}, ${props.nameZh}, open gemstone record`
</script>

<template>
  <a
    :href="gemLink(id, locale)"
    :lang="locale || 'en'"
    class="gem-card"
    :aria-label="cardLabel"
  >
    <div class="gem-card__image-wrap">
      <img
        class="gem-card__image"
        :src="imageSrc"
        :alt="locale === 'zh' ? `${nameZh}（${nameEn}）` : `${nameEn} (${nameZh})`"
        loading="lazy"
        decoding="async"
      >
      <span
        class="gem-card__hardness"
        :aria-label="locale === 'zh' ? `莫氏硬度 ${hardness}` : `Mohs hardness ${hardness}`"
      >
        {{ hardness }}
      </span>
    </div>
    <div class="gem-card__body">
      <div class="gem-card__heading">
        <h3 class="gem-card__name">
          <template v-if="locale === 'zh'">
            <span class="gem-card__name--primary">{{ nameZh }}</span>
            <span class="gem-card__name--secondary">{{ nameEn }}</span>
          </template>
          <template v-else>
            <span class="gem-card__name--primary">{{ nameEn }}</span>
            <span class="gem-card__name--secondary">{{ nameZh }}</span>
          </template>
        </h3>
        <span class="gem-card__arrow" aria-hidden="true">↗</span>
      </div>
      <p v-if="groupLabel" class="gem-card__group">{{ groupLabel }}</p>
      <p class="gem-card__mineral">{{ mineral }}</p>
    </div>
  </a>
</template>

<style scoped>
.gem-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  text-decoration: none;
  overflow: hidden;
  transition: border-color 240ms ease, transform 240ms ease, background-color 240ms ease;
}

.gem-card:hover {
  border-color: rgba(184, 146, 75, 0.52);
  background: #142126;
  transform: translateY(-2px);
}

.gem-card:focus-visible {
  outline: 2px solid var(--color-accent, #b8924b);
  outline-offset: 3px;
}

.gem-card__image-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #0b171a;
}

.gem-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.88) contrast(0.96);
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), filter 420ms ease;
}

.gem-card:hover .gem-card__image,
.gem-card:focus-visible .gem-card__image {
  transform: scale(1.045);
  filter: saturate(1.04) contrast(1);
}

.gem-card__hardness {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  display: grid;
  place-items: center;
  min-width: 2.1rem;
  min-height: 2.1rem;
  padding: 0.2rem 0.35rem;
  border: 1px solid rgba(236, 228, 210, 0.32);
  border-radius: 999px;
  background: rgba(7, 17, 22, 0.76);
  backdrop-filter: blur(6px);
  color: var(--color-accent, #b8924b);
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1;
}

.gem-card__body { padding: 0.9rem 0.95rem 1rem; }

.gem-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.gem-card__name {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.2rem;
  margin: 0;
  font-weight: 400;
  line-height: var(--lh-tight, 1.15);
}

.gem-card__name--primary {
  color: var(--color-fg-primary, #ece4d2);
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: 1.12rem;
}

.gem-card__name--secondary {
  color: var(--color-fg-muted, #a89e8a);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gem-card__arrow {
  flex: 0 0 auto;
  color: var(--color-accent, #b8924b);
  font-size: 1rem;
  line-height: 1;
  transition: transform 240ms ease;
}

.gem-card:hover .gem-card__arrow,
.gem-card:focus-visible .gem-card__arrow { transform: translate(2px, -2px); }

.gem-card__group,
.gem-card__mineral {
  margin: 0;
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.72rem;
  line-height: 1.45;
}

.gem-card__group {
  margin-top: 0.85rem;
  color: var(--color-accent, #b8924b);
}

.gem-card__mineral {
  margin-top: 0.2rem;
  color: var(--color-fg-muted, #a89e8a);
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

:lang(zh) .gem-card__name--primary,
:lang(zh) .gem-card__group,
:lang(zh) .gem-card__mineral { font-family: var(--font-zh-display, 'Noto Serif SC', serif); }

:lang(zh) .gem-card__name--primary { letter-spacing: 0.06em; }
:lang(zh) .gem-card__name--secondary { font-family: var(--font-display, 'Cormorant Garamond', serif); letter-spacing: 0.04em; }
:lang(zh) .gem-card__mineral { text-transform: none; letter-spacing: 0.04em; }

@media (prefers-reduced-motion: reduce) {
  .gem-card,
  .gem-card__image,
  .gem-card__arrow { transition: none; }
}
</style>
