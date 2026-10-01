<!--
  GemAssistPanel — a local, evidence-bounded question panel for GemAtlas pages.

  The browser owns only presentation and request context. The local Assist
  gateway owns retrieval, provider selection, citation validation, and policy
  boundaries. No credential is ever read or stored by this component.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import type { AssistResponse, Citation } from '../../../../scripts/assist/types'

type Locale = 'en' | 'zh'
type RequestState = 'idle' | 'loading' | 'done'
type PanelResponse = AssistResponse | (Omit<AssistResponse, 'providerMode'> & { providerMode: 'unavailable' })

const RETRYABLE_ERRORS = new Set(['PROVIDER_TIMEOUT', 'PROVIDER_NETWORK_ERROR', 'PROVIDER_UNAVAILABLE'])

const props = withDefaults(defineProps<{
  locale?: Locale
  currentGem?: string | null
  currentGemLabel?: string
  selectedGems?: string[]
}>(), {
  locale: 'en',
  currentGem: null,
  currentGemLabel: '',
  selectedGems: () => [],
})

const locale = computed(() => props.locale)
const question = ref('')
const requestState = ref<RequestState>('idle')
const response = ref<PanelResponse | null>(null)
const canRetry = computed(() => Boolean(response.value?.error && RETRYABLE_ERRORS.has(response.value.error.code)))

const currentPage = computed(() => {
  if (typeof window === 'undefined') return '/'
  return `${window.location.pathname}${window.location.search}`
})

const selectedIds = computed(() => props.selectedGems.filter(Boolean).slice(0, 4))
const contextLabel = computed(() => {
  if (locale.value === 'zh') {
    if (props.currentGem) return `当前条目：${props.currentGemLabel || props.currentGem}`
    if (selectedIds.value.length) return `当前选择：${selectedIds.value.length} 颗宝石`
    return '当前页面上下文'
  }
  if (props.currentGem) return `Current entry: ${props.currentGemLabel || props.currentGem}`
  if (selectedIds.value.length) return `Current selection: ${selectedIds.value.length} stones`
  return 'Current page context'
})

const prompts = computed(() => {
  if (locale.value === 'zh') {
    if (props.currentGem) return ['它的晶系是什么？', '它的硬度、比重和折射率如何？', '它有哪些处理与披露记录？']
    if (selectedIds.value.length >= 2) return ['当前选择的宝石晶系有什么差异？', '比较当前选择的硬度和折射率。']
    return ['什么是晶系？', '红宝石和蓝宝石属于同一矿物族吗？']
  }
  if (props.currentGem) return ['What crystal system is this entry in?', 'How do its hardness, SG, and RI compare?', 'What treatment and disclosure records exist?']
  if (selectedIds.value.length >= 2) return ['How do the selected stones’ crystal systems differ?', 'Compare the selected stones by hardness and RI.']
  return ['What is a crystal system?', 'Do ruby and sapphire belong to the same mineral family?']
})

const endpoint = import.meta.env.VITE_GEMATLAS_ASSIST_URL || 'http://127.0.0.1:4317/assist'

function setPrompt(value: string): void {
  question.value = value
}

function citationHref(citation: Citation): string {
  const path = citation.pageUrl.startsWith('/compare.html')
    ? (locale.value === 'zh' ? '/zh/compare.html' : citation.pageUrl)
    : citation.pageUrl.startsWith('/gems/')
      || citation.pageUrl.startsWith('/classification/')
      || citation.pageUrl.startsWith('/identification/')
    ? (locale.value === 'zh' ? `/zh${citation.pageUrl}` : citation.pageUrl)
    : citation.pageUrl
  return withBase(path)
}

function citationLabel(citation: Citation): string {
  const field = citation.fieldPath.replaceAll('.', ' / ')
  return `${field} · ${citation.contentVersion}`
}

function statusLabel(): string {
  if (!response.value) return ''
  if (response.value.status === 'refusal') return locale.value === 'zh' ? '边界内拒答' : 'Boundary refusal'
  if (response.value.status === 'error') return locale.value === 'zh' ? '请求未完成' : 'Request incomplete'
  return locale.value === 'zh' ? '基于允许证据回答' : 'Answered from allowed evidence'
}

function providerLabel(): string {
  if (!response.value) return ''
  if (response.value.answerSource === 'structured') {
    return locale.value === 'zh' ? 'STRUCTURED · 知识字段直答' : 'STRUCTURED · KNOWLEDGE FIELD'
  }
  if (response.value.providerMode === 'mock') {
    return locale.value === 'zh' ? 'MOCK · 本地快照' : 'MOCK · LOCAL SNAPSHOT'
  }
  if (response.value.providerMode === 'unavailable') {
    return locale.value === 'zh' ? 'GATEWAY · 不可用' : 'GATEWAY · UNAVAILABLE'
  }
  return locale.value === 'zh' ? 'REAL · 服务端模型' : 'REAL · SERVER MODEL'
}

function chooseQuestion(event: Event): void {
  const target = event.target as HTMLButtonElement
  setPrompt(target.dataset.prompt || '')
}

async function ask(): Promise<void> {
  const trimmed = question.value.trim()
  if (!trimmed || requestState.value === 'loading') return

  requestState.value = 'loading'
  response.value = null
  try {
    let result: Response
    try {
      result = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          locale: locale.value === 'zh' ? 'zh-CN' : 'en',
          context: {
            currentPage: currentPage.value,
            currentGem: props.currentGem,
            selectedGems: selectedIds.value,
          },
        }),
      })
    } catch {
      response.value = {
        status: 'error',
        providerMode: 'unavailable',
        intent: 'unsupported',
        answer: locale.value === 'zh'
          ? '无法连接本地 Assist 网关。请确认网关正在运行后手动重试。'
          : 'Could not connect to the local Assist gateway. Check that it is running, then retry manually.',
        citations: [],
        boundary: locale.value === 'zh' ? '教育性参考，不替代专业鉴定' : 'Educational reference, not a substitute for professional identification.',
        refusal: false,
        error: { code: 'PROVIDER_NETWORK_ERROR', message: 'Assist gateway is unavailable.' },
      }
      return
    }

    try {
      const payload = await result.json() as AssistResponse
      response.value = payload
    } catch {
      response.value = {
        status: 'error',
        providerMode: 'unavailable',
        intent: 'unsupported',
        answer: locale.value === 'zh'
          ? 'Assist 网关返回了无法读取的响应。请稍后重试。'
          : 'The Assist gateway returned an unreadable response. Please try again later.',
        citations: [],
        boundary: locale.value === 'zh' ? '教育性参考，不替代专业鉴定' : 'Educational reference, not a substitute for professional identification.',
        refusal: false,
        error: { code: 'INVALID_JSON', message: 'Assist gateway returned invalid JSON.' },
      }
    }
  } finally {
    requestState.value = 'done'
  }
}
</script>

<template>
  <section class="gem-assist" :lang="locale" aria-labelledby="gem-assist-title">
    <div class="gem-assist__head">
      <div>
        <p class="gem-assist__eyebrow">GEM ATLAS / ASSIST</p>
        <h2 id="gem-assist-title">{{ locale === 'zh' ? '向这份记录提问' : 'Ask this record' }}</h2>
      </div>
      <span class="gem-assist__mode">
        <i aria-hidden="true"></i>{{ locale === 'zh' ? '本地证据模式' : 'LOCAL EVIDENCE' }}
      </span>
    </div>

    <p class="gem-assist__intro">
      {{ locale === 'zh'
        ? '问题会带上当前页面上下文，只从 GemAtlas 允许的知识快照中检索，并返回可复现的字段引用。'
        : 'Your question carries the current page context. Answers retrieve only from the allowed GemAtlas snapshot and return reproducible field citations.' }}
    </p>

    <div class="gem-assist__context" :aria-label="locale === 'zh' ? '页面上下文' : 'Page context'">
      <span class="gem-assist__context-label">{{ locale === 'zh' ? '上下文' : 'CONTEXT' }}</span>
      <span>{{ contextLabel }}</span>
      <span v-if="selectedIds.length && props.currentGem" class="gem-assist__context-count">
        + {{ selectedIds.length }} {{ locale === 'zh' ? '颗已选' : 'selected' }}
      </span>
    </div>

    <div class="gem-assist__prompts" :aria-label="locale === 'zh' ? '推荐问题' : 'Suggested questions'">
      <button
        v-for="prompt in prompts"
        :key="prompt"
        type="button"
        :data-prompt="prompt"
        @click="chooseQuestion"
      >{{ prompt }}</button>
    </div>

    <form class="gem-assist__form" @submit.prevent="ask">
      <label for="gem-assist-question">
        {{ locale === 'zh' ? '问题' : 'Question' }}
        <span>{{ locale === 'zh' ? `${question.length}/1000 字` : `${question.length}/1000 characters` }}</span>
      </label>
      <textarea
        id="gem-assist-question"
        v-model="question"
        rows="3"
        maxlength="1000"
        :placeholder="locale === 'zh' ? '例如：它和红宝石的晶系有什么不同？' : 'For example: How does its crystal system differ from ruby?'"
        :disabled="requestState === 'loading'"
      ></textarea>
      <div class="gem-assist__form-footer">
        <span>{{ locale === 'zh' ? '仅用于教育性参考' : 'Educational reference only' }}</span>
        <button type="submit" :disabled="!question.trim() || requestState === 'loading'">
          {{ requestState === 'loading'
            ? (locale === 'zh' ? '检索中…' : 'Retrieving…')
            : (locale === 'zh' ? '提问' : 'Ask') }}
        </button>
      </div>
    </form>

    <div v-if="requestState === 'loading'" class="gem-assist__loading" role="status" aria-live="polite" aria-busy="true">
      <span class="gem-assist__loading-line"></span>
      <span class="gem-assist__loading-line gem-assist__loading-line--short"></span>
      <span>{{ locale === 'zh' ? '正在检索允许证据并校验引用…' : 'Retrieving allowed evidence and validating citations…' }}</span>
    </div>

    <article v-else-if="response" class="gem-assist__response" :data-status="response.status" aria-live="polite">
      <div class="gem-assist__response-head">
        <span class="gem-assist__response-status"><i aria-hidden="true"></i>{{ statusLabel() }}</span>
        <span class="gem-assist__provider">{{ providerLabel() }}</span>
      </div>
      <p class="gem-assist__answer">{{ response.answer }}</p>
      <div v-if="response.citations.length" class="gem-assist__citations">
        <p>{{ locale === 'zh' ? '证据引用' : 'Evidence citations' }}</p>
        <ol>
          <li v-for="citation in response.citations" :key="citation.sourceRef">
            <a :href="citationHref(citation)">{{ citationLabel(citation) }}</a>
          </li>
        </ol>
      </div>
      <p class="gem-assist__boundary"><span>{{ locale === 'zh' ? '边界' : 'Boundary' }}</span>{{ response.boundary }}</p>
      <p v-if="response.error" class="gem-assist__error" role="alert">{{ response.error.code }} · {{ response.error.message }}</p>
      <div v-if="canRetry" class="gem-assist__retry">
        <p>{{ locale === 'zh'
          ? '重试会重新提交此问题；若当前使用真实模型，可能再次调用模型。'
          : 'Retrying resubmits this question; if a real model is selected, it may invoke the model again.' }}</p>
        <button type="button" @click="ask">{{ locale === 'zh' ? '手动重试' : 'Retry manually' }}</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.gem-assist {
  display: grid;
  gap: 1rem;
  margin: 0 0 clamp(2.5rem, 6vw, 4.5rem);
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid rgba(184, 146, 75, 0.34);
  background:
    linear-gradient(135deg, rgba(21, 48, 56, 0.48), transparent 62%),
    var(--color-bg-surface, #0d1b20);
  box-shadow: 0 1rem 2.5rem rgba(3, 8, 11, 0.12);
}

.gem-assist__head,
.gem-assist__response-head,
.gem-assist__form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.gem-assist__eyebrow {
  margin: 0 0 0.4rem;
  color: var(--color-accent, #b8924b);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.gem-assist h2 {
  margin: 0;
  color: var(--color-fg-primary, #ece4d2);
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
  font-size: clamp(1.35rem, 2.8vw, 2rem);
  font-weight: 400;
  letter-spacing: 0.04em;
}

.gem-assist__mode,
.gem-assist__provider {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-fg-caption, #8b8678);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.gem-assist__mode i,
.gem-assist__response-status i {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--color-accent, #b8924b);
  box-shadow: 0 0 0 3px rgba(184, 146, 75, 0.12);
}

.gem-assist__intro,
.gem-assist__form-footer,
.gem-assist__boundary,
.gem-assist__error {
  margin: 0;
  color: var(--color-fg-muted, #a89e8a);
  font-size: var(--text-sm, 0.875rem);
  line-height: var(--lh-relaxed, 1.7);
}

.gem-assist__intro { max-width: 52rem; }

.gem-assist__context {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.65rem 0.75rem;
  border-left: 2px solid var(--color-accent, #b8924b);
  background: rgba(7, 17, 22, 0.42);
  color: var(--color-fg-secondary, #d6cdb8);
  font-size: 0.82rem;
}

.gem-assist__context-label {
  color: var(--color-accent, #b8924b);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
}

.gem-assist__context-count { color: var(--color-fg-caption, #8b8678); }

.gem-assist__prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.gem-assist button {
  min-height: 2.75rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(184, 146, 75, 0.28);
  border-radius: var(--radius-sm, 2px);
  color: var(--color-fg-secondary, #d6cdb8);
  background: transparent;
  cursor: pointer;
  font: inherit;
  transition: color 160ms ease-out, background-color 160ms ease-out, border-color 160ms ease-out, transform 160ms ease-out;
}

.gem-assist button:focus-visible,
.gem-assist textarea:focus-visible {
  outline: 2px solid var(--color-accent-hover, #c8a868);
  outline-offset: 3px;
}

.gem-assist button:disabled,
.gem-assist textarea:disabled { cursor: not-allowed; opacity: 0.52; }

.gem-assist__prompts button { min-height: 2.4rem; color: var(--color-fg-muted, #a89e8a); font-size: 0.8rem; }

.gem-assist__form { display: grid; gap: 0.65rem; }

.gem-assist__form label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-fg-secondary, #d6cdb8);
  font-size: 0.82rem;
}

.gem-assist__form label span { color: var(--color-fg-caption, #8b8678); font-size: 0.75rem; }

.gem-assist textarea {
  width: 100%;
  min-height: 5.6rem;
  box-sizing: border-box;
  resize: vertical;
  padding: 0.8rem;
  border: 1px solid rgba(184, 146, 75, 0.3);
  border-radius: var(--radius-sm, 2px);
  color: var(--color-fg-primary, #ece4d2);
  background: rgba(3, 8, 11, 0.5);
  font: inherit;
  line-height: 1.6;
}

.gem-assist textarea::placeholder { color: var(--color-fg-caption, #8b8678); }

.gem-assist__form-footer { font-size: 0.75rem; }
.gem-assist__form-footer button { color: var(--ink-950, #03080b); background: var(--color-accent, #b8924b); }

.gem-assist__loading,
.gem-assist__response {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(184, 146, 75, 0.18);
  background: rgba(7, 17, 22, 0.48);
}

.gem-assist__loading { color: var(--color-fg-muted, #a89e8a); font-size: 0.82rem; }
.gem-assist__loading-line { width: 70%; height: 0.65rem; background: var(--color-bg-elevated, #153038); }
.gem-assist__loading-line--short { width: 42%; }

.gem-assist__response[data-status='refusal'] { border-color: rgba(200, 168, 104, 0.45); }
.gem-assist__response[data-status='error'] { border-color: rgba(184, 146, 75, 0.5); }

.gem-assist__response-status { display: inline-flex; align-items: center; gap: 0.55rem; color: var(--color-accent-hover, #c8a868); font-size: 0.8rem; }
.gem-assist__answer { margin: 0; color: var(--color-fg-primary, #ece4d2); white-space: pre-wrap; line-height: var(--lh-relaxed, 1.7); }

.gem-assist__citations { display: grid; gap: 0.35rem; }
.gem-assist__citations p { margin: 0; color: var(--color-accent, #b8924b); font-size: 0.75rem; letter-spacing: 0.08em; }
.gem-assist__citations ol { display: grid; gap: 0.25rem; margin: 0; padding-left: 1.2rem; color: var(--color-fg-muted, #a89e8a); font-size: 0.78rem; }
.gem-assist__citations a { color: var(--color-fg-secondary, #d6cdb8); }
.gem-assist__boundary { padding-top: 0.65rem; border-top: 1px solid rgba(184, 146, 75, 0.14); }
.gem-assist__boundary span { margin-right: 0.5rem; color: var(--color-accent, #b8924b); }
.gem-assist__error { color: var(--color-accent-hover, #c8a868); }
.gem-assist__retry { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1rem; }
.gem-assist__retry p { margin: 0; color: var(--color-fg-muted, #a89e8a); font-size: 0.78rem; line-height: 1.6; }
.gem-assist__retry button { flex: 0 0 auto; }

@media (hover: hover) and (pointer: fine) {
  .gem-assist button:hover:not(:disabled) { color: var(--ink-950, #03080b); background: var(--color-accent-hover, #c8a868); border-color: var(--color-accent-hover, #c8a868); }
  .gem-assist button:active:not(:disabled) { transform: scale(0.98); }
}

@media (max-width: 560px) {
  .gem-assist__head { align-items: flex-start; flex-direction: column; }
  .gem-assist__mode { align-self: flex-start; }
  .gem-assist__form-footer { align-items: stretch; flex-direction: column; }
  .gem-assist__form-footer button { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .gem-assist button { transition: none; }
}
</style>
