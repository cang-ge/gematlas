<!--
GemCompare — URL-addressable comparison workspace.

Examples:
  /compare.html?gems=diamond,ruby
  /zh/compare.html?gems=diamond,ruby
-->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import PropertyTable from './PropertyTable.vue'
import {
  GEM_COMPARISON_DATA,
  GEM_COMPARISON_BY_ID,
  type GemComparisonRecord,
} from '../data/gem-comparison.generated'
import {
  MAX_COMPARE_GEMS,
  normalizeCompareIds,
  parseCompareIds,
  serializeCompareIds,
} from '../utils/compare'

type Locale = 'en' | 'zh'
const props = defineProps<{ locale?: Locale }>()
const locale = computed<Locale>(() => props.locale || 'en')
const knownIds = new Set(GEM_COMPARISON_DATA.map(gem => gem.id))
const selectedIds = ref<string[]>([])
const pickerId = ref('')
const pickerRef = ref<HTMLSelectElement | null>(null)
const removeButtonRefs = new Map<string, HTMLButtonElement>()

const selectedGems = computed<GemComparisonRecord[]>(() => selectedIds.value
  .map(id => GEM_COMPARISON_BY_ID[id])
  .filter((gem): gem is GemComparisonRecord => Boolean(gem)))

const availableGems = computed(() => GEM_COMPARISON_DATA.filter(gem => !selectedIds.value.includes(gem.id)))
const canAdd = computed(() => Boolean(pickerId.value) && selectedIds.value.length < MAX_COMPARE_GEMS)
const comparisonUrl = computed(() => {
  if (typeof window === 'undefined' || selectedIds.value.length === 0) return ''
  const url = new URL(window.location.href)
  url.search = `?gems=${encodeURIComponent(serializeCompareIds(selectedIds.value))}`
  return url.toString()
})

function name(gem: GemComparisonRecord): string {
  return locale.value === 'zh' ? gem.names.zh : gem.names.en
}

function updateUrl(ids: Iterable<string>): void {
  const normalized = normalizeCompareIds(ids, knownIds)
  selectedIds.value = normalized
  pickerId.value = availableGems.value[0]?.id || ''

  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (normalized.length > 0) {
    url.searchParams.set('gems', serializeCompareIds(normalized))
  } else {
    url.searchParams.delete('gems')
  }
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function syncFromLocation(): void {
  if (typeof window === 'undefined') return
  updateUrl(parseCompareIds(window.location.search, knownIds))
}

function addGem(): void {
  if (!canAdd.value) return
  updateUrl([...selectedIds.value, pickerId.value])
}

function setRemoveButtonRef(id: string, element: unknown): void {
  if (typeof HTMLButtonElement !== 'undefined' && element instanceof HTMLButtonElement) {
    removeButtonRefs.set(id, element)
  } else {
    removeButtonRefs.delete(id)
  }
}

async function removeGem(id: string): Promise<void> {
  const removedIndex = selectedIds.value.indexOf(id)
  const focusId = selectedIds.value[removedIndex + 1] || selectedIds.value[removedIndex - 1]
  updateUrl(selectedIds.value.filter(selectedId => selectedId !== id))
  await nextTick()

  if (focusId) {
    removeButtonRefs.get(focusId)?.focus()
  } else {
    pickerRef.value?.focus()
  }
}

async function clearGems(): Promise<void> {
  updateUrl([])
  await nextTick()
  pickerRef.value?.focus()
}

function comparePreset(ids: string[]): void {
  updateUrl(ids)
}

function handlePopState(): void {
  syncFromLocation()
}

onMounted(() => {
  syncFromLocation()
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <section class="gem-compare" :lang="locale">
    <header class="gem-compare__hero">
      <p class="gem-compare__eyebrow">{{ locale === 'zh' ? 'GEM ATLAS / 对比工作台' : 'GEM ATLAS / COMPARISON WORKSPACE' }}</p>
      <h1>{{ locale === 'zh' ? '并列观察' : 'Compare Stones' }}</h1>
      <p>
        {{ locale === 'zh'
          ? '把两到四颗宝石放在同一张证据表中，快速观察矿物身份、物理性质与光学特征的差异。'
          : 'Place two to four stones in one evidence table to inspect differences in mineral identity, physical properties, and optical behaviour.' }}
      </p>
    </header>

    <div class="gem-compare__workspace">
      <form class="gem-compare__picker" @submit.prevent="addGem">
        <label for="gem-compare-picker">
          {{ locale === 'zh' ? '加入宝石' : 'Add a stone' }}
          <span>{{ locale === 'zh' ? `最多 ${MAX_COMPARE_GEMS} 颗` : `Up to ${MAX_COMPARE_GEMS}` }}</span>
        </label>
        <div class="gem-compare__picker-row">
          <select
            id="gem-compare-picker"
            ref="pickerRef"
            v-model="pickerId"
            :disabled="availableGems.length === 0 || selectedIds.length >= MAX_COMPARE_GEMS"
          >
            <option value="" disabled>{{ locale === 'zh' ? '选择一颗宝石…' : 'Choose a stone…' }}</option>
            <option v-for="gem in availableGems" :key="gem.id" :value="gem.id">
              {{ name(gem) }} · {{ gem.id }}
            </option>
          </select>
          <button type="submit" :disabled="!canAdd">
            {{ locale === 'zh' ? '加入对比' : 'Add to compare' }}
          </button>
        </div>
      </form>

      <div v-if="selectedGems.length" class="gem-compare__selected">
        <div class="gem-compare__selected-heading">
          <div>
            <p class="gem-compare__section-label">{{ locale === 'zh' ? '已选宝石' : 'SELECTED STONES' }}</p>
            <span>{{ locale === 'zh' ? '当前选择' : 'Current selection' }}</span>
          </div>
          <button type="button" class="gem-compare__clear" @click="clearGems">
            {{ locale === 'zh' ? '清空' : 'Clear' }}
          </button>
        </div>
        <p class="gem-compare__sr-status" role="status" aria-live="polite" aria-atomic="true">
          {{ locale === 'zh'
            ? `已选择 ${selectedGems.length} 颗宝石，还可添加 ${MAX_COMPARE_GEMS - selectedGems.length} 颗`
            : `${selectedGems.length} stones selected; ${MAX_COMPARE_GEMS - selectedGems.length} available` }}
        </p>
        <ul :aria-label="locale === 'zh' ? '已选择的宝石' : 'Selected stones'">
          <li v-for="(gem, index) in selectedGems" :key="gem.id">
            <span class="gem-compare__chip-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="gem-compare__chip-name">{{ name(gem) }}</span>
            <button
              type="button"
              class="gem-compare__remove"
              :ref="element => setRemoveButtonRef(gem.id, element)"
              :aria-label="locale === 'zh' ? `移除${name(gem)}` : `Remove ${name(gem)}`"
              @click="removeGem(gem.id)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="selectedGems.length >= 2" class="gem-compare__result">
        <div class="gem-compare__result-heading">
          <div>
            <p class="gem-compare__section-label">{{ locale === 'zh' ? '结构化记录' : 'STRUCTURED RECORD' }}</p>
            <h2>{{ locale === 'zh' ? '属性对比' : 'Property comparison' }}</h2>
          </div>
          <span
            class="gem-compare__count"
            aria-hidden="true"
          >{{ selectedGems.length }} / {{ MAX_COMPARE_GEMS }}</span>
        </div>
        <PropertyTable :gem-ids="selectedIds" :locale="locale" />
        <p class="gem-compare__provenance">
          {{ locale === 'zh'
            ? '数据由宝石 YAML 记录经 GemSchema 校验后生成；对比表本身不另行维护事实。'
            : 'Data is projected from GemSchema-validated gem YAML records; the comparison table owns no second fact set.' }}
        </p>
        <p v-if="comparisonUrl" class="gem-compare__share">
          <span>{{ locale === 'zh' ? '可复现链接' : 'Reproducible URL' }}</span>
          <code>{{ comparisonUrl }}</code>
        </p>
      </div>

      <div v-else class="gem-compare__empty" role="status">
        <p class="gem-compare__section-label">{{ locale === 'zh' ? '等待选择' : 'AWAITING SELECTION' }}</p>
        <h2>{{ locale === 'zh' ? '至少选择两颗宝石' : 'Choose at least two stones' }}</h2>
        <p>
          {{ locale === 'zh'
            ? '先从上方选择宝石；选择结果会写入 URL，便于复现、分享和在面试中演示。'
            : 'Choose stones above. The selection is written to the URL so the comparison can be reproduced, shared, and demonstrated.' }}
        </p>
      </div>

      <GemAssistPanel
        :locale="locale"
        :selected-gems="selectedIds"
      />

      <div class="gem-compare__presets">
        <p class="gem-compare__section-label">{{ locale === 'zh' ? '快速开始' : 'QUICK START' }}</p>
        <div class="gem-compare__preset-list">
          <button type="button" @click="comparePreset(['diamond', 'ruby'])">
            {{ locale === 'zh' ? '钻石 vs 红宝石' : 'Diamond vs Ruby' }}
          </button>
          <button type="button" @click="comparePreset(['ruby', 'sapphire'])">
            {{ locale === 'zh' ? '红宝石 vs 蓝宝石' : 'Ruby vs Sapphire' }}
          </button>
          <a :href="withBase(locale === 'zh' ? '/zh/gems/' : '/gems/')">
            {{ locale === 'zh' ? '浏览完整名录 ↗' : 'Browse the full index ↗' }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gem-compare {
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: clamp(3.5rem, 8vw, 7rem) 0 clamp(5rem, 10vw, 9rem);
  container-type: inline-size;
  container-name: gem-compare;
}

.gem-compare__hero {
  max-width: 48rem;
  padding-bottom: clamp(2rem, 5vw, 4rem);
  border-bottom: 1px solid var(--color-divider-strong, rgba(184, 146, 75, 0.45));
}

.gem-compare__eyebrow,
.gem-compare__section-label {
  margin: 0;
  color: var(--color-accent, #b8924b);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.68rem;
  font-weight: var(--fw-medium, 500);
  letter-spacing: 0.18em;
  line-height: 1.5;
  text-transform: uppercase;
}

.gem-compare h1,
.gem-compare h2 {
  margin: 0;
  color: var(--color-fg-primary, #ece4d2);
  font-family: var(--font-display, Georgia, serif);
  font-weight: 400;
}

.gem-compare h1 {
  margin-top: 1rem;
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: -0.04em;
}

.gem-compare h2 {
  margin-top: 0.45rem;
  font-size: clamp(1.7rem, 3vw, 2.5rem);
}

:lang(zh) .gem-compare h1,
:lang(zh) .gem-compare h2 {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
  letter-spacing: 0.04em;
}

.gem-compare__hero > p:last-child {
  max-width: 42rem;
  margin: 1.25rem 0 0;
  color: var(--color-fg-muted, #a89e8a);
  font-size: var(--text-lg, 1.125rem);
  line-height: var(--lh-relaxed, 1.7);
}

.gem-compare__workspace {
  display: grid;
  gap: 1.5rem;
  padding-top: clamp(2rem, 5vw, 3.5rem);
}

.gem-compare__workspace > * {
  min-width: 0;
}

.gem-compare__picker,
.gem-compare__selected,
.gem-compare__empty,
.gem-compare__result,
.gem-compare__presets {
  position: relative;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--color-divider, rgba(184, 146, 75, 0.22));
  background:
    linear-gradient(135deg, rgba(21, 48, 56, 0.38), transparent 55%),
    var(--color-bg-surface, #0d1b20);
}

.gem-compare__selected {
  border-color: rgba(184, 146, 75, 0.16);
  background:
    linear-gradient(135deg, rgba(21, 48, 56, 0.2), transparent 55%),
    var(--color-bg-surface, #0d1b20);
}

.gem-compare__result {
  border-color: var(--color-divider-strong, rgba(184, 146, 75, 0.45));
  box-shadow: 0 1.25rem 3rem rgba(3, 8, 11, 0.12);
}

.gem-compare__picker label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-medium, 500);
}

.gem-compare__picker label span {
  color: var(--color-fg-caption, #8b8678);
  font-size: var(--text-sm, 0.875rem);
  font-weight: var(--fw-regular, 400);
}

.gem-compare__picker-row {
  display: flex;
  gap: 0.75rem;
}

.gem-compare select,
.gem-compare button {
  min-height: 2.75rem;
  border-radius: var(--radius-sm, 2px);
  font: inherit;
}

.gem-compare select {
  min-width: 0;
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-divider-strong, rgba(184, 146, 75, 0.45));
  color: var(--color-fg-primary, #ece4d2);
  background: var(--color-bg-page, #071116);
}

.gem-compare button {
  padding: 0.55rem 1rem;
  border: 1px solid var(--color-accent, #b8924b);
  color: var(--color-fg-primary, #ece4d2);
  background: transparent;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    transform 140ms cubic-bezier(0.22, 1, 0.36, 1);
}

.gem-compare button:focus-visible,
.gem-compare select:focus-visible {
  outline: 2px solid var(--color-accent-hover, #c8a868);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .gem-compare button:hover:not(:disabled) {
    color: var(--ink-950, #03080b);
    background: var(--color-accent-hover, #c8a868);
  }
}

.gem-compare button:disabled,
.gem-compare select:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.gem-compare__selected-heading,
.gem-compare__result-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.gem-compare__selected-heading > div {
  display: grid;
  gap: 0.35rem;
}

.gem-compare__selected-heading > div > span {
  color: var(--color-fg-secondary, #d6cdb8);
  font-weight: var(--fw-medium, 500);
}

.gem-compare__clear {
  min-width: 44px;
  min-height: 44px !important;
  padding: 0.5rem 0.75rem !important;
  border: 0 !important;
  color: var(--color-fg-muted, #a89e8a) !important;
  font-size: var(--text-sm, 0.875rem);
}

.gem-compare__clear:hover,
.gem-compare__clear:focus-visible {
  color: var(--color-accent-hover, #c8a868) !important;
  background: transparent !important;
}

.gem-compare__selected ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0;
  margin: 1rem 0 0;
  list-style: none;
}

.gem-compare__sr-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.gem-compare__selected li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  min-height: 3rem;
  padding: 0.4rem 0.4rem 0.4rem 0.65rem;
  border: 1px solid var(--color-divider, rgba(184, 146, 75, 0.22));
  color: var(--color-fg-primary, #ece4d2);
  background: var(--color-bg-elevated, #153038);
}

.gem-compare__chip-index {
  color: var(--color-accent, #b8924b);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

.gem-compare__chip-name {
  min-width: 0;
  color: var(--color-fg-primary, #ece4d2);
  font-size: 0.9rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
  word-break: normal;
}

.gem-compare__remove {
  width: 44px;
  min-width: 44px;
  min-height: 44px !important;
  padding: 0 !important;
  border-color: transparent !important;
  color: var(--color-fg-muted, #a89e8a) !important;
}

.gem-compare__remove:hover,
.gem-compare__remove:focus-visible {
  color: var(--color-fg-primary, #ece4d2) !important;
  background: var(--color-accent-soft, rgba(184, 146, 75, 0.18)) !important;
}

.gem-compare__result {
  display: grid;
  gap: 1.25rem;
}

.gem-compare__count {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: baseline;
  min-width: 5rem;
  justify-content: flex-end;
  color: var(--color-accent, #b8924b);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-transform: uppercase;
}

.gem-compare__provenance,
.gem-compare__share,
.gem-compare__empty > p:last-child {
  margin: 0;
  color: var(--color-fg-muted, #a89e8a);
  font-size: var(--text-sm, 0.875rem);
  line-height: var(--lh-relaxed, 1.7);
}

.gem-compare__share {
  display: grid;
  gap: 0.35rem;
}

.gem-compare__share span {
  color: var(--color-accent, #b8924b);
}

.gem-compare__share code {
  overflow-wrap: anywhere;
}

.gem-compare__empty {
  min-height: 12rem;
}

.gem-compare__empty > p:nth-of-type(2) {
  max-width: 40rem;
  margin: 1rem 0 0;
}

.gem-compare__presets {
  display: grid;
  gap: 0.85rem;
}

.gem-compare__preset-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.gem-compare__preset-list button,
.gem-compare__preset-list a {
  min-height: 2.75rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-divider, rgba(184, 146, 75, 0.22));
  color: var(--color-fg-secondary, #d6cdb8);
  background: transparent;
  font-size: var(--text-sm, 0.875rem);
}

.gem-compare__preset-list a {
  display: inline-flex;
  align-items: center;
  border-color: transparent;
}

.gem-compare__preset-list button:focus-visible,
.gem-compare__preset-list a:focus-visible {
  color: var(--color-accent-hover, #c8a868);
  background: var(--color-accent-soft, rgba(184, 146, 75, 0.18));
  outline: 2px solid var(--color-accent-hover, #c8a868);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .gem-compare__preset-list button:hover,
  .gem-compare__preset-list a:hover {
    color: var(--color-accent-hover, #c8a868);
    background: var(--color-accent-soft, rgba(184, 146, 75, 0.18));
  }

  .gem-compare button:not(:disabled):active {
    transform: scale(0.98);
  }
}

@container gem-compare (max-width: 720px) {
  .gem-compare__selected ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .gem-compare {
    width: min(100% - 1.5rem, 1120px);
  }

  .gem-compare__picker-row {
    align-items: stretch;
    flex-direction: column;
  }

  .gem-compare__picker-row button {
    width: 100%;
  }

  .gem-compare__result-heading {
    align-items: start;
  }

  .gem-compare__selected ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gem-compare__selected li {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gem-compare button {
    transition: none;
  }
}
</style>
