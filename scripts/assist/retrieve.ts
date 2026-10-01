import { addContextEvidence } from './catalog'
import { classifyIntent, extractGemIds } from './intent'
import type { AssistRequest, EvidenceRecord, KnowledgeSnapshot, RetrievalResult } from './types'

function include(
  snapshot: KnowledgeSnapshot,
  target: EvidenceRecord[],
  sourceRef: string,
): void {
  const record = snapshot.records.get(sourceRef)
  if (record && !target.some(item => item.sourceRef === record.sourceRef)) target.push(record)
}

function includeGemFields(
  snapshot: KnowledgeSnapshot,
  target: EvidenceRecord[],
  gemIds: string[],
  fields: string[],
): void {
  for (const id of gemIds) {
    for (const field of fields) include(snapshot, target, `source:${id}:${field}`)
  }
}

const PHYSICAL_FIELD_ALIASES: Array<{ field: string; pattern: RegExp }> = [
  { field: 'physical.hardness_mohs', pattern: /莫氏硬度|摩氏硬度|硬度|抗刮(?:能力|性)?|\bmohs(?:\s+hardness)?\b|\bhardness\b/i },
  { field: 'physical.specific_gravity', pattern: /比重|相对密度|\bspecific\s+gravity\b|\bsg\b/i },
  { field: 'physical.refractive_index', pattern: /折射率|折射指数|\brefractive\s+index\b|\bri\b/i },
]

function requestedPhysicalFields(question: string): string[] {
  return PHYSICAL_FIELD_ALIASES
    .filter(({ pattern }) => pattern.test(question))
    .map(({ field }) => field)
}

function asksForMeasurementMethod(question: string): boolean {
  return /怎么测|如何测|怎样测|测量方法|测试方法|用什么仪器|how\s+to\s+measure|measurement\s+method|testing\s+method/i.test(question)
}

function identificationTopicFor(question: string): string | undefined {
  if (/同色|蓝色.*宝石|绿色.*宝石|红色.*宝石|蓝宝石.*坦桑石|祖母绿.*橄榄石/.test(question)) {
    return 'same-color-gems'
  }
  if (/合成品|仿品|天然和合成|天然与合成|双层石|三层石|复合结构|生长来源|人工生长/.test(question)) {
    return 'synthetic-and-imitation'
  }
  if (/光学测试|偏光镜|二色镜|紫外|荧光|光谱|多色性|双折射/.test(question)) {
    return 'optical-tests'
  }
  if (/物理测试|折射率|比重|硬度|解理|RI\b|SG\b/i.test(question)) {
    return 'physical-tests'
  }
  if (/鉴定工作流|证据链|筛分|如何记录|送检|鉴定流程/.test(question)) {
    return 'identification-workflow'
  }
  return undefined
}

export function retrieveEvidence(
  request: AssistRequest,
  snapshot: KnowledgeSnapshot,
): RetrievalResult {
  const intent = classifyIntent(request.question)
  const gemIds = extractGemIds(request, snapshot)
  const evidence: EvidenceRecord[] = []
  const question = request.question

  if (intent === 'security_refusal' || intent === 'unsupported') {
    return { intent, gemIds, evidence }
  }

  if (intent === 'high_risk_refusal') {
    if (/产地|origin/i.test(question) && gemIds.length) {
      includeGemFields(snapshot, evidence, gemIds, ['origin'])
    } else if (/价值|估价|值多少钱|market value/i.test(question)) {
      include(snapshot, evidence, 'source:identification:physical-tests')
    } else {
      include(snapshot, evidence, 'source:identification:synthetic-and-imitation')
    }
    return { intent, gemIds, evidence }
  }

  if (gemIds.length === 0
    && /晶系|晶体系统|crystal system/i.test(question)
    && /\b(?:it|its|this|that)\b|它|这颗|这个|该(宝石|条目|记录)/i.test(question)) {
    return { intent, gemIds, evidence }
  }

  if (intent === 'filter') {
    if (/石英族|editorial|族/.test(question)) {
      include(snapshot, evidence, 'source:index:editorial_group')
      include(snapshot, evidence, 'source:index:physical.hardness_mohs')
    } else if (/当前页面/.test(question)) {
      include(snapshot, evidence, 'source:index:category.crystal_system')
    } else {
      include(snapshot, evidence, 'source:index:physical.hardness_mohs')
      include(snapshot, evidence, 'source:index:category.crystal_system')
    }
    return { intent, gemIds, evidence }
  }

  if (intent === 'compare') {
    if (/当前选择|当前页面|selected|current/i.test(question)) {
      const physicalFields = requestedPhysicalFields(question)
      if (physicalFields.length) {
        includeGemFields(snapshot, evidence, request.context.selectedGems, physicalFields)
      } else {
        const contextEvidence = addContextEvidence(snapshot, request.context.selectedGems)
        if (contextEvidence) evidence.push(contextEvidence)
      }
      return { intent, gemIds, evidence }
    }
    const physicalFields = requestedPhysicalFields(question)
    if (physicalFields.length) {
      includeGemFields(snapshot, evidence, gemIds, physicalFields)
      return { intent, gemIds, evidence }
    }
    const fields = /处理|披露/.test(question)
      ? ['treatments']
      : /晶系|晶体系统|crystal system|结构/i.test(question)
        ? ['category.crystal_system']
        : /矿物身份|矿物|关系/.test(question)
          ? ['category.mineral']
          : ['category', 'physical']
    includeGemFields(snapshot, evidence, gemIds, fields)
    if (/硬度|比重|折射率|物理/.test(question)) {
      includeGemFields(snapshot, evidence, gemIds, ['physical'])
    }
    return { intent, gemIds, evidence }
  }

  const physicalFields = requestedPhysicalFields(question)
  if (gemIds.length && physicalFields.length && !asksForMeasurementMethod(question)) {
    includeGemFields(snapshot, evidence, gemIds, physicalFields)
    return { intent, gemIds, evidence }
  }

  const identificationTopic = identificationTopicFor(question)
  if (identificationTopic) {
    include(snapshot, evidence, `source:identification:${identificationTopic}`)
    if (gemIds.length) {
      includeGemFields(snapshot, evidence, gemIds, ['category', 'physical', 'optical', 'treatments'])
      if (identificationTopic === 'physical-tests') {
        includeGemFields(snapshot, evidence, gemIds, requestedPhysicalFields(question))
      }
    }
    return { intent, gemIds, evidence }
  }

  if (/处理|披露/.test(question)) {
    includeGemFields(snapshot, evidence, gemIds, ['treatments.common', 'treatments.disclosure_required', 'treatments.note'])
  } else if (/光学/.test(question)) {
    includeGemFields(snapshot, evidence, gemIds, ['optical'])
  } else if (/硬度|比重|折射率/.test(question)) {
    const fields = [
      ...(question.includes('硬度') ? ['physical.hardness_mohs'] : []),
      ...(question.includes('比重') ? ['physical.specific_gravity'] : []),
      ...(question.includes('折射率') ? ['physical.refractive_index'] : []),
    ]
    includeGemFields(snapshot, evidence, gemIds, fields)
  } else if (/晶系|晶体系统|crystal system|分类/i.test(question)) {
    includeGemFields(snapshot, evidence, gemIds, [
      'category.crystal_system',
      ...(question.includes('化学式') ? ['category.chemical_formula'] : []),
      ...(question.includes('矿物') ? ['category.mineral'] : []),
    ])
    if (gemIds.length === 0 && !question.includes('化学式')) {
      include(snapshot, evidence, 'source:classification:crystal-systems')
    }
    if (gemIds.length === 0 && question.includes('化学式')) {
      include(snapshot, evidence, 'source:gem:category.chemical_formula')
      include(snapshot, evidence, 'source:gem:category.crystal_system')
    }
  } else if (/矿物/.test(question)) {
    includeGemFields(snapshot, evidence, gemIds, ['category.mineral'])
  } else {
    includeGemFields(snapshot, evidence, gemIds, ['category'])
  }

  return { intent, gemIds, evidence }
}
