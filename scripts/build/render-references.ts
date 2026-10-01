import type { ReferenceEntry } from './schema'

type Locale = 'en' | 'zh'
type ReferenceContext = 'grading' | 'cutting' | 'identification'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Render a compact, keyboard-accessible source block for generated pages. */
export function renderReferences(
  references: ReferenceEntry[],
  locale: Locale,
  context: ReferenceContext = 'identification',
): string {
  const isZh = locale === 'zh'
  const title = isZh ? '参考依据与证据边界' : 'References & Evidence Boundary'
  const intro = context === 'grading'
    ? (isZh
      ? '本页用于理解分级描述和报告术语；来源说明知识依据，不代表仅凭本页即可完成具体样品分级、估值、鉴定或产地判断。'
      : 'This page explains grading descriptions and report terms; the sources document the knowledge basis and do not make this page sufficient for grading, valuing, identifying, or determining the origin of a specific specimen.')
    : isZh
      ? '本页内容用于学习与检索；来源用于说明知识依据，不代表仅凭本页即可完成具体样品鉴定。'
      : 'This page supports learning and retrieval; the sources document the knowledge basis and do not make this page sufficient for identifying a specific specimen.'
  const sourceLabel = isZh ? '打开来源' : 'Open source'
  const items = references.map((reference) => {
    const name = isZh ? reference.title_zh : reference.title_en
    const scope = isZh ? reference.scope_zh : reference.scope_en
    return `<li><a href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer">${escapeHtml(name)}</a><span>${escapeHtml(scope)}</span><small>${sourceLabel} ↗</small></li>`
  }).join('\n')

  return `<aside class="gem-reference-block" aria-labelledby="gem-reference-title">
  <p class="gem-reference-block__eyebrow">SOURCE TRACE</p>
  <h2 id="gem-reference-title">${title}</h2>
  <p class="gem-reference-block__intro">${intro}</p>
  <ul>${items}</ul>
</aside>`
}
