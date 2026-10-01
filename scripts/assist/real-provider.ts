import { AssistResponseSchema, type AssistErrorCode, type AssistResponse, type RetrievalResult } from './types'
import type { AssistProvider, ProviderInput } from './provider'
import { buildPrompt, PROMPT_VERSION } from './prompt'
import { publicCitations } from './provider'

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

export type RealProviderConfig = {
  endpoint: string
  apiKey: string
  model: string
  timeoutMs: number
  fetchImpl?: FetchLike
}

function errorResponse(
  code: AssistErrorCode,
  message: string,
  intent: AssistResponse['intent'],
): AssistResponse {
  return {
    status: 'error',
    providerMode: 'real',
    intent,
    answer: message,
    citations: [],
    boundary: '教育性参考，不替代专业鉴定',
    refusal: false,
    error: { code, message },
  }
}

function answerResponse(
  answer: string,
  intent: AssistResponse['intent'],
): AssistResponse {
  return {
    status: 'answer',
    providerMode: 'real',
    intent,
    answer,
    citations: [],
    boundary: '教育性参考，不替代专业鉴定',
    refusal: false,
    error: null,
  }
}

function guardedResponse(input: ProviderInput): AssistResponse | undefined {
  const { request, retrieval } = input
  const zh = request.locale === 'zh-CN'

  if (retrieval.intent === 'security_refusal') {
    return {
      ...answerResponse(
      zh ? '我不能提供系统提示词、完整上下文、私有工作日志或运行时秘密。当前问题只能基于允许的知识快照回答。'
        : 'I cannot provide system prompts, full context, private worklogs, or runtime secrets. Answers are limited to the allowed knowledge snapshot.',
      retrieval.intent,
      ),
      status: 'refusal',
      refusal: true,
    }
  }
  if (retrieval.intent === 'high_risk_refusal') {
    const answer = /产地|origin/i.test(request.question)
      ? (zh ? '不能确定具体样品的产地；条目中的代表性产地记录不等于样品产地鉴定。'
        : 'I cannot determine a specific sample’s origin; representative locations in an entry are not a sample origin determination.')
      : /价值|估价|值多少钱|market value/i.test(request.question)
        ? (zh ? '不能评估具体样品价值；仅凭硬度和照片不足以完成价值判断，还需要品质、处理披露、证书和市场信息。'
          : 'I cannot assess a sample’s value from hardness and a photo alone; value also requires quality, treatment disclosure, certification, and market data.')
        : (zh ? '我不能仅凭照片确定天然或合成身份；这类结论需要专业鉴定和实验室报告。GemAtlas 只能提供教育性鉴定参考。'
          : 'I cannot determine natural or synthetic identity from a photo alone; that requires professional identification and a laboratory report.')
    return {
      ...answerResponse(answer, retrieval.intent),
      status: 'refusal',
      refusal: true,
    }
  }
  if (retrieval.intent === 'unsupported') {
    return errorResponse('UNSUPPORTED_INTENT', zh
      ? '当前知识库没有覆盖这个请求，无法提供可验证的回答。'
      : 'The current knowledge base does not cover this request, so I cannot provide a verifiable answer.', retrieval.intent)
  }
  if (retrieval.intent === 'compare' && request.context.selectedGems.length < 2
    && /当前选择|当前页面|selected|current/i.test(request.question)) {
    return answerResponse(zh
      ? '当前还没有至少两颗已选宝石，暂时无法进行并列比较。请先在上方加入两颗或更多宝石。'
      : 'Fewer than two stones are selected, so a side-by-side comparison is not available yet. Add at least two stones above first.', retrieval.intent)
  }
  if (!retrieval.evidence.length) {
    return errorResponse('NO_EVIDENCE', zh ? '当前知识库没有足够的允许证据。' : 'The current knowledge base has insufficient allowed evidence.', retrieval.intent)
  }
  return undefined
}

function configFromEnv(): RealProviderConfig | undefined {
  const endpoint = process.env.GEMATLAS_REAL_ENDPOINT?.trim()
  const apiKey = process.env.GEMATLAS_REAL_API_KEY?.trim()
  const model = process.env.GEMATLAS_REAL_MODEL?.trim()
  if (!endpoint || !apiKey || !model) return undefined
  return {
    endpoint,
    apiKey,
    model,
    timeoutMs: Number(process.env.GEMATLAS_REAL_TIMEOUT_MS || 15000),
  }
}

function contentFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const choice = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
  const content = choice?.message?.content
  return typeof content === 'string' ? content : undefined
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim()
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(unfenced)
}

function normalizedResponse(candidate: unknown, retrieval: RetrievalResult): AssistResponse {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('model output is not an object')
  }
  const raw = candidate as Record<string, unknown>
  const rawStatus = raw.status
  const status: AssistResponse['status'] = rawStatus === 'refusal'
    ? 'refusal'
    : rawStatus === 'error'
      ? 'error'
      : 'answer'
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : ''
  if (!answer) throw new Error('model output has no answer')

  const evidenceByRef = new Map(retrieval.evidence.map(record => [record.sourceRef, record]))
  const rawCitations = Array.isArray(raw.citations) ? raw.citations : []
  const citations = rawCitations.flatMap(item => {
    const sourceRef = typeof item === 'string'
      ? item
      : item && typeof item === 'object' && typeof (item as { sourceRef?: unknown }).sourceRef === 'string'
        ? (item as { sourceRef: string }).sourceRef
        : ''
    const record = evidenceByRef.get(sourceRef)
    return record ? publicCitations([record]) : []
  })

  return {
    status,
    providerMode: 'real',
    intent: retrieval.intent,
    answer,
    citations,
    boundary: '教育性参考，不替代专业鉴定',
    refusal: status === 'refusal',
    error: status === 'error'
      ? { code: 'OUTPUT_SCHEMA_MISMATCH', message: `模型输出未通过 ${PROMPT_VERSION} 契约。` }
      : null,
  }
}

export class RealModelProvider implements AssistProvider {
  readonly mode = 'real' as const
  private readonly config?: RealProviderConfig

  constructor(config: RealProviderConfig | undefined = configFromEnv()) {
    this.config = config
  }

  async respond({ request, retrieval, names }: ProviderInput): Promise<AssistResponse> {
    if (!this.config) {
      return errorResponse('PROVIDER_UNAVAILABLE', 'Real Provider 未配置；请在私有运行时注入服务地址、鉴权配置和模型标识。', retrieval.intent)
    }

    const guarded = guardedResponse({ request, retrieval, names })
    if (guarded) return guarded

    const prompt = buildPrompt({ request, retrieval, names })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs)
    try {
      const response = await (this.config.fetchImpl || fetch)(this.config.endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
        }),
      })

      if (!response.ok) {
        return errorResponse('PROVIDER_UNAVAILABLE', `Real Provider 返回 HTTP ${response.status}。`, retrieval.intent)
      }

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        return errorResponse('INVALID_JSON', 'Real Provider 响应不是合法 JSON。', retrieval.intent)
      }
      const content = contentFromPayload(payload)
      if (!content) return errorResponse('INVALID_JSON', 'Real Provider 缺少可解析的模型内容。', retrieval.intent)

      let candidate: unknown
      try {
        candidate = parseJsonContent(content)
      } catch {
        return errorResponse('INVALID_JSON', '模型内容不是符合要求的 JSON。', retrieval.intent)
      }

      try {
        return AssistResponseSchema.parse(normalizedResponse(candidate, retrieval))
      } catch {
        return errorResponse('OUTPUT_SCHEMA_MISMATCH', `模型输出未通过 ${PROMPT_VERSION} 契约。`, retrieval.intent)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return errorResponse('PROVIDER_TIMEOUT', 'Real Provider 请求超时。', retrieval.intent)
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return errorResponse('PROVIDER_TIMEOUT', 'Real Provider 请求超时。', retrieval.intent)
      }
      return errorResponse('PROVIDER_NETWORK_ERROR', 'Real Provider 网络请求失败。', retrieval.intent)
    } finally {
      clearTimeout(timer)
    }
  }
}
