import type { AssistResponse, EvidenceRecord } from './types'
import type { ProviderInput } from './provider'
import { publicCitations } from './provider'

const crystalSystemLabels: Record<string, { zh: string; en: string }> = {
  cubic: { zh: '立方晶系', en: 'cubic' },
  tetragonal: { zh: '四方晶系', en: 'tetragonal' },
  orthorhombic: { zh: '斜方晶系', en: 'orthorhombic' },
  hexagonal: { zh: '六方晶系', en: 'hexagonal' },
  trigonal: { zh: '三方晶系', en: 'trigonal' },
  monoclinic: { zh: '单斜晶系', en: 'monoclinic' },
  triclinic: { zh: '三斜晶系', en: 'triclinic' },
}

function label(value: unknown, locale: 'zh-CN' | 'en'): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  return crystalSystemLabels[value]?.[locale === 'zh-CN' ? 'zh' : 'en'] ?? value
}

export function structuredAnswer(
  input: ProviderInput,
  providerMode: AssistResponse['providerMode'],
): AssistResponse | undefined {
  const { request, retrieval, names } = input
  const question = request.question
  const zh = request.locale === 'zh-CN'
  if (!/晶系|晶体系统|crystal system/i.test(question)
    || /矿物|化学式|硬度|比重|折射率|处理|披露|为什么|原理|解释下|why|explain/i.test(question)
    || !retrieval.gemIds.length
    || !['explain', 'compare'].includes(retrieval.intent)) return undefined

  const contextRecord = retrieval.evidence.find(record => record.sourceRef === 'source:context:selectedGems:category.crystal_system')
  const contextValues = contextRecord && Array.isArray(contextRecord.value)
    ? contextRecord.value as Array<{ gemId?: unknown; value?: unknown }>
    : []
  const records: Array<{ id: string; name: string; value: string; citation: EvidenceRecord }> = []

  for (const id of retrieval.gemIds) {
    const citation = retrieval.evidence.find(record => record.gemId === id
      && record.fieldPath === 'category.crystal_system')
    const contextValue = contextValues.find(item => item.gemId === id)?.value
    const system = label(citation?.value ?? contextValue, request.locale)
    if (!system || (!citation && !contextRecord)) return undefined
    const gemName = names.get(id)
    records.push({
      id,
      name: request.locale === 'zh-CN' ? gemName?.zh ?? id : gemName?.en ?? id,
      value: system,
      citation: citation ?? contextRecord!,
    })
  }

  const isComparison = records.length > 1
    && /不同|区别|差异|比较|对比|相同|一样|同一晶系|是否.*同|same system|same crystal system|different|differ|compare/i.test(question)
  const sameSystem = records.every(record => record.value === records[0].value)
  const values = records.map(record => `${record.name}：${record.value}`).join(zh ? '；' : '; ')
  const groupName = records.length === 2 ? (zh ? '二者' : 'They') : (zh ? '这些宝石' : 'All selected stones')
  const answer = isComparison
    ? (zh
      ? `${values}。${groupName}${sameSystem ? '记录为同一' : '记录为不同'}晶系。以上是条目级知识记录，不是对具体样品的鉴定结论。`
      : `${values}. ${groupName} are recorded in the ${sameSystem ? 'same' : 'different'} crystal system. These are entry-level records, not identification conclusions about a specific sample.`)
    : (zh
      ? `${values}。以上是 GemAtlas 的条目级知识记录，不是对具体样品的鉴定结论。`
      : `${values}. These are GemAtlas entry-level records, not identification conclusions about a specific sample.`)

  return {
    status: 'answer',
    providerMode,
    answerSource: 'structured',
    intent: retrieval.intent,
    answer,
    citations: publicCitations([...new Map(records.map(record => [record.citation.sourceRef, record.citation])).values()]),
    boundary: zh ? '教育性参考，不替代专业鉴定' : 'Educational reference, not a substitute for professional identification.',
    refusal: false,
    error: null,
  }
}
