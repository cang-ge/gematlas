import type { AssistRequest, AssistResponse, EvidenceRecord, RetrievalResult } from './types'
import type { AssistProvider, ProviderInput } from './provider'
import { publicCitations } from './provider'

function valueOf(evidence: EvidenceRecord[], sourceRef: string): unknown {
  return evidence.find(item => item.sourceRef === sourceRef)?.value
}

function gemName(request: AssistRequest, id: string, snapshotNames: Map<string, { zh: string; en: string }>): string {
  const names = snapshotNames.get(id)
  if (!names) return id
  return request.locale === 'zh-CN' ? names.zh : names.en
}

function field(evidence: EvidenceRecord[], id: string, path: string): string {
  const record = evidence.find(item => item.sourceRef === `source:${id}:${path}`)
  if (record) return String(record.value)
  if (path === 'category.mineral_zh' || path === 'category.mineral_en') {
    const mineral = evidence.find(item => item.sourceRef === `source:${id}:category.mineral`)
    if (mineral?.value && typeof mineral.value === 'object') {
      const value = mineral.value as { zh?: string; en?: string }
      return String(path.endsWith('_zh') ? value.zh : value.en)
    }
  }
  return '暂无记录'
}

function namesOf(request: AssistRequest, ids: string[], names: Map<string, { zh: string; en: string }>): string[] {
  return ids.map(id => gemName(request, id, names))
}

export class MockProvider implements AssistProvider {
  readonly mode = 'mock' as const

  async respond({ request, retrieval, names }: ProviderInput): Promise<AssistResponse> {
    const { intent, gemIds, evidence } = retrieval
    const question = request.question
    const zh = request.locale === 'zh-CN'

    if (intent === 'security_refusal') {
      if (/环境变量|请求头|cookie|provider 密钥|api key|bearer/i.test(question)) {
        return this.refusal(intent, zh
          ? '出于安全原因，我不能提供凭据或运行时秘密；调试时只返回脱敏请求 ID 和错误码。'
          : 'For security reasons, I cannot provide credentials or runtime secrets; debugging should use a redacted request ID and error code.')
      }
      return this.refusal(intent, zh
        ? '我不能提供系统提示词、完整上下文或私有工作日志。当前问题只能基于允许的知识快照回答。'
        : 'I cannot provide system prompts, full context, or private worklogs. This question can only use the allowed knowledge snapshot.')
    }
    if (intent === 'unsupported') {
      if (/库存|有货|stock/i.test(question)) {
        return this.refusal(intent, zh
          ? '当前没有库存数据，无法确认指定重量的红宝石是否存在。'
          : 'There is no live inventory data, so I cannot confirm whether a ruby of the requested weight exists.')
      }
      if (/没有收录|未收录|精确化学成分/.test(question)) {
        return this.refusal(intent, zh
          ? '该宝石不在当前知识库的可信证据范围内，资料不足，不能提供精确化学成分。'
          : 'The stone is outside the trusted evidence in the current knowledge base, so I cannot provide an exact chemical composition.')
      }
      return this.refusal(intent, zh
        ? '当前知识库无法预测下个月某种宝石的价格；这不在 GemAtlas 的证据范围内。'
        : 'The current knowledge base cannot predict a gemstone price next month; that is outside GemAtlas evidence.')
    }
    if (intent === 'high_risk_refusal') {
      if (/产地|origin/i.test(question)) {
        return this.refusal(intent, zh
          ? '不能确定具体样品的产地；条目中的代表性产地记录不等于样品产地鉴定。'
          : 'I cannot determine a specific sample’s origin; representative locations in an entry are not a sample origin determination.')
      }
      if (/价值|估价|值多少钱|market value/i.test(question)) {
        return this.refusal(intent, zh
          ? '不能评估具体样品价值；仅凭硬度和照片不足以完成价值判断，还需要品质、处理披露、证书和市场信息。'
          : 'I cannot assess a sample’s value from hardness and a photo alone; value also requires quality, treatment disclosure, certification, and market data.')
      }
      return this.refusal(intent, zh
        ? '我不能仅凭照片确定天然或合成身份；这类结论需要专业鉴定和实验室报告。GemAtlas 只能提供教育性鉴定参考。'
        : 'I cannot determine natural or synthetic identity from a photo alone; that requires professional identification and a laboratory report.')
    }

    if (intent === 'compare' && request.context.selectedGems.length < 2
      && /当前选择|当前页面|selected|current/i.test(question)) {
      return this.answer(intent, zh
        ? '当前还没有至少两颗已选宝石，暂时无法进行并列比较。请先在上方加入两颗或更多宝石。'
        : 'Fewer than two stones are selected, so a side-by-side comparison is not available yet. Add at least two stones above first.', [])
    }

    if (!evidence.length && intent !== 'filter') {
      return this.error(intent, 'NO_EVIDENCE', zh ? '当前知识库没有足够的允许证据。' : 'The current knowledge base has insufficient allowed evidence.')
    }

    if (intent === 'filter') {
      const filterAnswer = /石英族/.test(question)
        ? (zh
          ? '可以把“石英族、硬度为 7 左右”转换为知识库字段筛选；“左右”的容差应预先定义，结果只返回真实条目。'
          : '“Quartz family, hardness around 7” can map to knowledge-base fields; the tolerance for “around” must be defined explicitly.')
        : /当前页面/.test(question)
          ? (zh
            ? '可以按晶系筛选当前页面里的公开宝石，并为每个结果返回对应详情页；只使用当前知识快照。'
            : 'The current page can be filtered by crystal system, with a detail page for each public result; only the current knowledge snapshot is used.')
          : (zh
            ? '可以把这个请求转换为知识库字段筛选：硬度至少 8、晶系为立方晶系。结果只返回真实字段匹配，并在没有匹配时明确说明。'
            : 'This request maps to knowledge-base filters: hardness at least 8 and cubic crystal system. Results come only from real field matches.')
      return this.answer(intent, filterAnswer, evidence)
    }

    if (intent === 'compare') {
      return this.answer(intent, this.compareAnswer(request, gemIds, evidence, names), evidence)
    }

    return this.answer(intent, this.explainAnswer(request, gemIds, evidence, names), evidence)
  }

  private explainAnswer(
    request: AssistRequest,
    gemIds: string[],
    evidence: EvidenceRecord[],
    names: Map<string, { zh: string; en: string }>,
  ): string {
    const zh = request.locale === 'zh-CN'
    const question = request.question
    if (/合成品|仿品|天然和合|天然与合成|双层石|三层石|复合结构|生长来源|人工生长/.test(question)) {
      return zh
        ? '合成品与仿品不是同一个维度：合成品通常指与天然对应物具有相近化学、物理和光学性质的人工生长材料；仿品则是用另一种材料模拟目标宝石。还要把处理状态和双层/三层等复合结构分开记录，具体样品结论需要专业检测。'
        : 'Synthetic and imitation are different dimensions: a synthetic is laboratory-grown with properties corresponding to a natural counterpart, while an imitation uses another material to resemble the target gem. Treatment and doublet/triplet structure must be recorded separately; a specific sample still needs professional testing.'
    }
    if (/同色|蓝色.*宝石|绿色.*宝石|红色.*宝石/.test(question)) {
      return zh
        ? '同色宝石判别先建立候选集，再用适用的 RI、SG、多色性、包裹体等证据缩小范围。颜色只负责提出问题，结果应标记为支持候选、与候选一致、无法排除或不可靠，不能按颜色自动命名。'
        : 'Same-colour identification starts with a candidate set, then narrows it with suitable RI, SG, pleochroism, and inclusion evidence. Colour raises a question; label results as supports, consistent, cannot exclude, or unreliable rather than naming by colour alone.'
    }
    if (/光学测试|偏光镜|二色镜|紫外|荧光|光谱|多色性|双折射/.test(question)) {
      return zh
        ? '光学测试提供的是带条件的筛分线索。观察方向、切磨、光源、透明度和仪器状态都应记录；荧光、多色性或吸收带不能单独证明天然、合成、处理或产地。'
        : 'Optical tests provide conditional screening clues. Record direction, cut, light, transparency, and instrument state; fluorescence, pleochroism, or an absorption band cannot alone prove natural origin, synthesis, treatment, or geographic origin.'
    }
    if (/物理测试|折射率|比重|硬度|解理|RI\b|SG\b/i.test(question)) {
      return zh
        ? 'RI、SG、硬度和解理属于基础物性证据。应先判断样品是否适合测试，保留原始读数与重复结果，并把单项结果解释为支持或排除部分候选，而不是直接给出宝石名称。'
        : 'RI, SG, hardness, and cleavage are basic physical evidence. First check whether the specimen suits the test, preserve raw and repeated readings, and treat each result as support for or exclusion of candidates rather than a direct gem name.'
    }
    if (/鉴定工作流|证据链|筛分|如何记录|送检|鉴定流程/.test(question)) {
      return zh
        ? '推荐流程是：记录样品和任务边界，先做低风险观察，再按样品条件选择物理/光学证据，标记支持、冲突或无法排除，最后在高价值、正式披露或结果冲突时升级送检。'
        : 'The recommended workflow is to record the specimen and task boundary, start with low-risk observation, choose physical/optical evidence for the sample, label support/conflict/unresolved results, and refer high-value, formal-disclosure, or conflicting cases.'
    }
    if (/什么是晶系|晶系.*不同|化学式.*晶系/.test(question) && gemIds.length === 0) {
      return zh
        ? '请先选择一颗宝石，我可以基于知识库分别解释化学式与晶系；前者描述化学组成，后者属于晶体结构分类。'
        : 'Choose a stone first. I can explain chemical formula and crystal system from the knowledge base; one describes composition and the other is a structural classification.'
    }
    if (/蓝宝石.*红宝石|红宝石.*蓝宝石/.test(question)) {
      return zh
        ? '红宝石和蓝宝石都是刚玉，属于同一矿物族；颜色和具体条目记录不同，不能因此推导出价值或样品身份相同。'
        : 'Ruby and sapphire are both corundum and belong to the same mineral family; their colour and entry records differ, so this does not establish equal value or sample identity.'
    }
    if (/处理|披露/.test(question) && gemIds.length) {
      const id = gemIds[0]
      const treatment = field(evidence, id, 'treatments.common')
      const disclosure = field(evidence, id, 'treatments.disclosure_required')
      return zh
        ? `${gemName(request, id, names)}的知识库记录包含处理方式 ${treatment}；披露要求为 ${disclosure}。这是品种/条目层面的常见记录，不等于具体样品已经检测。`
        : `${gemName(request, id, names)} records treatment information as ${treatment}; disclosure required is ${disclosure}. This is an entry-level record, not a test result for a specific sample.`
    }
    if (/红宝石.*矿物.*晶系|红宝石.*晶系.*矿物/.test(question) && gemIds.length) {
      const id = gemIds[0]
      return zh
        ? `${gemName(request, id, names)}在 GemAtlas 中记录的矿物身份为${field(evidence, id, 'category.mineral_zh')}，晶系为${field(evidence, id, 'category.crystal_system')}。这里是条目级知识记录，不是对具体样品的鉴定结论。`
        : `${gemName(request, id, names)} is recorded as ${field(evidence, id, 'category.mineral_en')}, with a ${field(evidence, id, 'category.crystal_system')} crystal system. This is an entry-level record, not a conclusion about a specific sample.`
    }
    if (/晶系.*不同|不同.*晶系/.test(question) && gemIds.length >= 2) {
      const labels = namesOf(request, gemIds.slice(0, 2), names)
      const systems = gemIds.slice(0, 2).map(id => field(evidence, id, 'category.crystal_system'))
      return zh
        ? `${labels[0]}记录为${systems[0]}，${labels[1]}记录为${systems[1]}，因此二者不属于同一晶系。这是条目级知识记录，不是对具体样品的鉴定结论。`
        : `${labels[0]} is recorded as ${systems[0]}, while ${labels[1]} is recorded as ${systems[1]}; they are not in the same crystal system. This is an entry-level record, not a conclusion about a specific sample.`
    }
    if (/硬度|比重|折射率/.test(question) && gemIds.length) {
      const id = gemIds[0]
      return zh
        ? `${gemName(request, id, names)}：硬度 ${field(evidence, id, 'physical.hardness_mohs')}，比重 ${field(evidence, id, 'physical.specific_gravity')}，折射率 ${field(evidence, id, 'physical.refractive_index')}。`
        : `${gemName(request, id, names)}: hardness ${field(evidence, id, 'physical.hardness_mohs')}, specific gravity ${field(evidence, id, 'physical.specific_gravity')}, refractive index ${field(evidence, id, 'physical.refractive_index')}.`
    }
    if (/光学/.test(question) && gemIds.length) {
      return zh
        ? `${gemName(request, gemIds[0], names)}的光学特征应以条目中的 optical 记录为准；这属于知识库描述，不是照片鉴定结论。`
        : `${gemName(request, gemIds[0], names)} should be read through the entry’s optical record; this is a knowledge-base description, not a photo identification result.`
    }
    if (/翡翠.*软玉|软玉.*翡翠/.test(question)) {
      return zh
        ? '翡翠和软玉是两个独立的条目：翡翠对应硬玉，软玉对应透闪石质角闪石；共享“玉”的文化称呼，不代表化学和晶体结构相同。'
        : 'Jadeite and nephrite are separate entries: jadeite is a pyroxene, while nephrite is amphibole-rich; sharing the cultural term jade does not make their chemistry or structure identical.'
    }
    if (/欧泊.*光学/.test(question)) {
      return zh
        ? '欧泊的光学描述来自知识库的 optical 记录；这里解释的是条目特征，不是照片已经证明天然。'
        : 'Opal’s optical description comes from the knowledge-base optical record; it describes the entry and does not prove that a photographed sample is natural.'
    }
    if (/晶系|分类/.test(question)) {
      return zh
        ? '晶系是对晶体结构对称性与轴向关系的分类。GemAtlas 的分类页和宝石条目共同提供解释。'
        : 'A crystal system classifies crystal structure by symmetry and axis relationships. GemAtlas uses both its classification page and gem entries as evidence.'
    }
    return zh
      ? '这是一条基于 GemAtlas 允许知识快照的教育性解释；如果问题涉及具体样品鉴定，仍需要专业检测。'
      : 'This is an educational explanation based on the allowed GemAtlas knowledge snapshot; specific sample identification still requires professional testing.'
  }

  private compareAnswer(
    request: AssistRequest,
    gemIds: string[],
    evidence: EvidenceRecord[],
    names: Map<string, { zh: string; en: string }>,
  ): string {
    const zh = request.locale === 'zh-CN'
    const labels = namesOf(request, gemIds, names)
    if (/处理|披露/.test(request.question)) {
      return zh
        ? `${labels.join(' 与 ')}可以比较处理与披露记录，但这些是条目层面的常见信息；具体样品仍需要独立实验室检查。`
        : `${labels.join(' and ')} can be compared by treatment and disclosure records, but these are entry-level records and not proof about a particular sample.`
    }
    if (/当前选择|晶系/.test(request.question) && evidence.some(item => item.sourceRef.startsWith('source:context:'))) {
      return zh
        ? `当前选择的宝石晶系可通过引用进行对照；结果只说明知识库条目中的晶系记录，不推导同源或样品结论。`
        : 'The selected stones’ crystal-system records can be compared through citations; this does not infer common origin or a sample conclusion.'
    }
    if (/欧泊.*水晶|水晶.*欧泊/.test(request.question)) {
      return zh
        ? '欧泊与水晶的矿物身份可以按知识库条目比较；没有充分记录的字段会明确标为资料不足，不会凭空填充。'
        : 'Opal and quartz can be compared by their knowledge-base identity records; unsupported fields remain explicitly insufficient rather than being guessed or filled in.'
    }
    const first = gemIds[0]
    const second = gemIds[1]
    return zh
      ? `${labels.join(' 与 ')}的结构化记录可以按统一字段比较：矿物身份、晶系、硬度、比重和折射率。每个结论都必须回到对应引用，缺失字段显示暂无记录。`
      : `${labels.join(' and ')} can be compared through shared fields: mineral identity, crystal system, hardness, specific gravity, and refractive index. Each conclusion must map to a citation.`
  }

  private answer(intent: AssistResponse['intent'], answer: string, evidence: EvidenceRecord[]): AssistResponse {
    return {
      status: 'answer',
      providerMode: 'mock',
      intent,
      answer,
      citations: publicCitations(evidence),
      boundary: '教育性参考，不替代专业鉴定',
      refusal: false,
      error: null,
    }
  }

  private refusal(intent: AssistResponse['intent'], answer: string): AssistResponse {
    return {
      status: 'refusal',
      providerMode: 'mock',
      intent,
      answer,
      citations: [],
      boundary: '教育性参考，不替代专业鉴定',
      refusal: true,
      error: null,
    }
  }

  private error(intent: AssistResponse['intent'], code: 'NO_EVIDENCE', answer: string): AssistResponse {
    return {
      status: 'error',
      providerMode: 'mock',
      intent,
      answer,
      citations: [],
      boundary: '教育性参考，不替代专业鉴定',
      refusal: false,
      error: { code, message: answer },
    }
  }
}
