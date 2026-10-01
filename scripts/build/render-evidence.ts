import type { ReferenceEntry } from './schema'

type Locale = 'en' | 'zh'
type EvidenceEntry = {
  topic_id: string
  claim_zh: string
  claim_en: string
  status: 'source-supported' | 'teaching-summary' | 'pending-review'
  source_ids: string[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const STATUS_LABELS = {
  zh: {
    title: '本页证据映射',
    intro: '把本页的教学主张映射到来源，并标注它在知识库中的证据状态。',
    'source-supported': '来源支持',
    'teaching-summary': '教学归纳',
    'pending-review': '待复核',
    missing: '未找到对应来源记录',
  },
  en: {
    title: 'Evidence map for this page',
    intro: 'Claims are mapped to references and labelled with their evidence status in this knowledge base.',
    'source-supported': 'Source-supported',
    'teaching-summary': 'Teaching summary',
    'pending-review': 'Pending review',
    missing: 'No matching source record',
  },
} as const

/** Render topic-level claim/source/status mapping below the normal references. */
export function renderEvidenceLedger(
  entries: EvidenceEntry[],
  references: Array<ReferenceEntry & { id?: string }>,
  topicId: string | undefined,
  locale: Locale,
): string {
  const labels = STATUS_LABELS[locale]
  const topicEntries = topicId ? entries.filter(entry => entry.topic_id === topicId) : entries
  if (topicEntries.length === 0) return ''
  const referenceTitles = new Map(
    references.map(reference => [
      reference.id ?? reference.title_en,
      locale === 'zh' ? reference.title_zh : reference.title_en,
    ]),
  )
  const items = topicEntries.map(entry => {
    const claim = locale === 'zh' ? entry.claim_zh : entry.claim_en
    const status = labels[entry.status]
    const sources = entry.source_ids
      .map(sourceId => referenceTitles.get(sourceId) ?? labels.missing)
      .join(locale === 'zh' ? '；' : '; ')
    return `<li><strong class="gem-evidence-ledger__status gem-evidence-ledger__status--${entry.status}">${escapeHtml(status)}</strong><span>${escapeHtml(claim)}</span><small>${escapeHtml(sources)}</small></li>`
  }).join('\n')

  const id = `gem-evidence-title-${topicId ?? 'module'}-${locale}`
  const title = topicId ? labels.title : (locale === 'zh' ? '本模块证据映射' : 'Evidence map for this module')
  return `<aside class="gem-reference-block gem-evidence-ledger" aria-labelledby="${id}">
  <p class="gem-reference-block__eyebrow">EVIDENCE MAP</p>
  <h2 id="${id}">${title}</h2>
  <p class="gem-reference-block__intro">${labels.intro}</p>
  <ul>${items}</ul>
</aside>`
}
