const fields = [
  ['names.zh', '宝石中文名'], ['names.en', '宝石英文名'],
  ['category.mineral_zh', '矿物族（中文）'], ['category.mineral_en', '矿物族（英文）'],
  ['category.chemical_formula', '化学式'], ['category.crystal_system', '晶系 ID'],
  ['physical.hardness_note_zh', '硬度说明（中文）'], ['physical.hardness_note_en', '硬度说明（英文）'],
  ['physical.specific_gravity', '比重'], ['physical.refractive_index', '折射率'],
  ['optical.pleochroism', '多色性'], ['optical.typical_colors', '典型颜色（中英数组）'],
  ['optical.color_causes_zh', '颜色成因（中文）'], ['optical.color_causes_en', '颜色成因（英文）'],
  ['treatments.common', '常见优化处理'], ['treatments.disclosure_required', '是否要求处理披露'],
  ['treatments.note_zh', '处理说明（中文）'], ['treatments.note_en', '处理说明（英文）'],
  ['origin', '代表性产地（中英数组）'], ['history_zh', '历史说明（中文）'], ['history_en', '历史说明（英文）'],
]
const $ = id => document.getElementById(id)
const form = $('curation-form')
let runtime = { mode: 'mock', model: 'unknown' }
let lastRequest = null
let currentResult = null

function error(code) {
  const messages = {
    INVALID_REQUEST: '提交内容不符合要求，请检查字段和来源信息。', BODY_TOO_LARGE: '请求内容过大，请缩短摘录。',
    UNKNOWN_GEM: '找不到对应宝石条目，请重新选择。', FIELD_NOT_ALLOWED: '字段不在允许范围内，请重新选择。',
    QUOTE_NOT_IN_EXCERPT: '引句必须逐字存在于你粘贴的摘录中。', PROVIDER_TIMEOUT: '模型请求超时；表单内容仍保留，请检查后重试。',
    PROVIDER_FAILED: '模型服务调用失败；表单内容仍保留，请稍后重试。', OUTPUT_SCHEMA_MISMATCH: '模型回包不符合字段契约，已拒绝生成建议。', INVALID_EXPORT: '导出数据未通过完整 GemSchema 校验，请检查已接受的字段值。', INVALID_JSON: '请求格式无法解析，请重新提交。',
    NOTHING_ACCEPTED: '至少接受一项字段后才能导出。', QUOTE_REQUIRED: '已接受字段必须补充一段摘录中的原文引句。', ORIGIN_DENIED: '请求来源未获允许。', LOCAL_ONLY: '此工具只允许从本机访问。', EXTERNAL_SEND_NOT_CONFIRMED: '请先明确确认外发数据范围。',
  }
  return messages[code] || '操作失败，请检查输入后重试。'
}

function showError(message, issues = []) {
  const box = $('error-summary')
  box.replaceChildren()
  const heading = document.createElement('strong')
  heading.textContent = message
  box.append(heading)
  if (issues.length) {
    const list = document.createElement('ul')
    for (const issue of issues) {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = `#${issue.target}`
      link.textContent = issue.message
      item.append(link)
      list.append(item)
    }
    box.append(list)
  }
  box.hidden = false
  box.focus()
}
function clearError() { $('error-summary').hidden = true; $('error-summary').replaceChildren() }

function buildFieldPicker() {
  const container = $('field-options')
  for (const [path, label] of fields) {
    const item = document.createElement('label')
    item.className = 'field-option'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'; checkbox.name = 'fieldPath'; checkbox.value = path
    const text = document.createElement('span'); text.textContent = `${label} · ${path}`
    item.append(checkbox, text); container.append(item)
  }
}

async function loadRuntime() {
  const response = await fetch('/health')
  if (!response.ok) throw new Error('health')
  runtime = await response.json()
  $('runtime-label').textContent = `${runtime.mode === 'mock' ? 'Mock 演示模式' : 'Real 模型模式'} · ${runtime.model}`
  $('mode-indicator').classList.toggle('real', runtime.mode === 'real')
  $('demo-banner').hidden = runtime.mode !== 'mock'
  $('real-confirm-panel').hidden = runtime.mode !== 'real'
}

async function loadGems() {
  const response = await fetch('/api/gems')
  if (!response.ok) throw new Error('catalog')
  const gems = await response.json()
  const select = $('gem-id')
  select.replaceChildren(new Option('请选择宝石…', ''))
  for (const gem of gems) select.add(new Option(`${gem.name} · ${gem.englishName}`, gem.id))
}

function validateForm() {
  clearError()
  const issues = []
  const checks = [
    ['gem-id', 'gem-error', $('gem-id').value ? '' : '请选择一个宝石条目。'],
    ['source-title', 'title-error', $('source-title').value.trim() ? '' : '请填写来源标题。'],
    ['source-url', 'url-error', (() => { try { return new URL($('source-url').value).protocol === 'https:' ? '' : '来源 URL 必须为 HTTPS。' } catch { return '请填写有效的 HTTPS URL。' } })()],
    ['excerpt', 'excerpt-error', [...$('excerpt').value.trim()].length >= 20 ? '' : '摘录至少需要 20 个字符。'],
  ]
  let failed = false
  for (const [inputId, errorId, message] of checks) {
    $(inputId).classList.toggle('invalid', Boolean(message))
    if (message) $(inputId).setAttribute('aria-invalid', 'true')
    else $(inputId).removeAttribute('aria-invalid')
    $(errorId).textContent = message
    if (message) { failed = true; issues.push({ target: inputId, message }) }
  }
  const selected = [...document.querySelectorAll('input[name="fieldPath"]:checked')]
  const fieldError = $('field-error')
  const picker = $('field-picker')
  if (selected.length < 1 || selected.length > 8) {
    const message = '请选择 1–8 个目标字段。'
    fieldError.textContent = message
    picker.setAttribute('aria-invalid', 'true')
    failed = true
    issues.push({ target: 'field-picker', message })
  } else {
    fieldError.textContent = ''
    picker.removeAttribute('aria-invalid')
  }
  if (runtime.mode === 'real' && !$('real-confirm').checked) {
    const message = '请确认本次外发数据范围。'
    $('real-confirm-error').textContent = message
    $('real-confirm').setAttribute('aria-invalid', 'true')
    failed = true
    issues.push({ target: 'real-confirm', message })
  } else {
    $('real-confirm-error').textContent = ''
    $('real-confirm').removeAttribute('aria-invalid')
  }
  if (failed) showError('提交未通过验证，请检查以下项目：', issues)
  return !failed
}

function currentInput() {
  return {
    gemId: $('gem-id').value,
    source: { title: $('source-title').value.trim(), url: $('source-url').value.trim(), locator: $('source-locator').value.trim(), language: $('source-language').value },
    excerpt: $('excerpt').value.trim(),
    fieldPaths: [...document.querySelectorAll('input[name="fieldPath"]:checked')].map(input => input.value),
    confirmExternalSend: runtime.mode === 'real' && $('real-confirm').checked,
  }
}

function renderProposals(result) {
  const list = $('proposal-list')
  list.replaceChildren()
  for (const [index, proposal] of result.proposals.entries()) {
    const card = document.createElement('article'); card.className = 'proposal'
    const title = document.createElement('h3'); title.textContent = `${String(index + 1).padStart(2, '0')} · ${fields.find(([path]) => path === proposal.fieldPath)?.[1] || proposal.fieldPath}`
    const grid = document.createElement('div'); grid.className = 'proposal-grid'
    const oldWrap = document.createElement('label'); oldWrap.textContent = '当前值'
    const oldText = document.createElement('textarea'); oldText.readOnly = true; oldText.value = JSON.stringify(proposal.currentValue, null, 2); oldWrap.append(oldText)
    const nextWrap = document.createElement('label'); nextWrap.textContent = '建议值 · 可编辑 JSON'
    const nextText = document.createElement('textarea'); nextText.dataset.proposed = String(index); nextText.value = JSON.stringify(proposal.proposedValue, null, 2); nextWrap.append(nextText)
    grid.append(oldWrap, nextWrap)
    const quoteWrap = document.createElement('label'); quoteWrap.textContent = '原文引句 · 必须逐字来自摘录'
    const quote = document.createElement('textarea'); quote.dataset.quote = String(index); quote.value = proposal.sourceQuote; quoteWrap.append(quote)
    const reason = document.createElement('p'); reason.className = 'rationale'; reason.textContent = proposal.rationale
    const acceptLabel = document.createElement('label'); acceptLabel.className = 'accept-line'
    const accept = document.createElement('input'); accept.type = 'checkbox'; accept.dataset.accept = String(index)
    const acceptText = document.createElement('span'); acceptText.textContent = '接受此字段，纳入待复核 YAML 建议包'
    acceptLabel.append(accept, acceptText)
    card.append(title, grid, quoteWrap, reason, acceptLabel); list.append(card)
  }
  $('review-panel').hidden = false
  $('review-panel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

form.addEventListener('submit', async event => {
  event.preventDefault()
  if (!validateForm()) return
  clearError()
  const button = $('generate-button'); button.disabled = true; $('form-status').textContent = '正在生成…'
  lastRequest = currentInput()
  try {
    const response = await fetch('/api/draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lastRequest) })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'FAILED')
    currentResult = payload
    renderProposals(payload)
    $('form-status').textContent = '草稿已返回，请逐项核对，不要跳过人工审核。'
  } catch (failure) { showError(error(failure.message)); $('form-status').textContent = '' }
  finally { button.disabled = false }
})

$('export-button').addEventListener('click', async () => {
  clearError(); $('export-status').textContent = '正在校验接受项…'
  try {
    const changes = currentResult.proposals.map((proposal, index) => {
      let value
      try { value = JSON.parse(document.querySelector(`[data-proposed="${index}"]`).value) } catch { throw new Error('INVALID_JSON_VALUE') }
      return { fieldPath: proposal.fieldPath, value, sourceQuote: document.querySelector(`[data-quote="${index}"]`).value, accepted: document.querySelector(`[data-accept="${index}"]`).checked }
    })
    const response = await fetch('/api/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ request: lastRequest, changes, providerMode: currentResult.providerMode, model: currentResult.model }) })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'FAILED')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([payload.yaml], { type: 'text/yaml;charset=utf-8' }))
    link.download = payload.filename
    document.body.append(link)
    link.click()
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove() }, 1000)
    $('export-status').textContent = currentResult.demoOnly ? '已下载演示建议包；demo_only=true，不构成事实依据。' : '已下载待复核建议包；未写入正式知识库。'
  } catch (failure) {
    $('export-status').textContent = ''
    showError(failure.message === 'INVALID_JSON_VALUE' ? '有字段建议不是有效 JSON，请修正后再导出。' : error(failure.message))
  }
})

$('excerpt').addEventListener('input', () => { $('excerpt-count').textContent = `${[...$('excerpt').value].length.toLocaleString()} / 6,000` })
buildFieldPicker()
Promise.all([loadRuntime(), loadGems()]).catch(() => showError('无法连接本机工作台服务。请确认服务在 127.0.0.1:4318 运行。'))
