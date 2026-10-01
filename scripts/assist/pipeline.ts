import { loadKnowledgeSnapshot } from './catalog'
import { MockProvider } from './mock-provider'
import type { AssistProvider } from './provider'
import { retrieveEvidence } from './retrieve'
import { structuredAnswer } from './structured-answer'
import {
  AssistRequestSchema,
  AssistResponseSchema,
  type AssistErrorCode,
  type AssistRequest,
  type AssistResponse,
  type KnowledgeSnapshot,
} from './types'

const BOUNDARY = '教育性参考，不替代专业鉴定'

function errorResponse(
  code: AssistErrorCode,
  message: string,
  intent: AssistResponse['intent'] = 'unsupported',
  providerMode: AssistResponse['providerMode'] = 'mock',
): AssistResponse {
  return {
    status: 'error',
    providerMode,
    intent,
    answer: message,
    citations: [],
    boundary: BOUNDARY,
    refusal: false,
    error: { code, message },
  }
}

function parseRequest(raw: unknown, snapshot: KnowledgeSnapshot): AssistRequest {
  const request = AssistRequestSchema.parse(raw)
  const knownIds = new Set(snapshot.gems.keys())
  if (request.context.currentGem && !knownIds.has(request.context.currentGem)) {
    throw new Error('currentGem is not a known gem ID')
  }
  if (request.context.selectedGems.some(id => !knownIds.has(id))) {
    throw new Error('selectedGems contains an unknown gem ID')
  }
  return request
}

function validateCitations(response: AssistResponse, snapshot: KnowledgeSnapshot): AssistResponse {
  for (const citation of response.citations) {
    const record = snapshot.records.get(citation.sourceRef)
    const isContextCitation = citation.sourceRef === 'source:context:selectedGems:category.crystal_system'
      && citation.gemId === 'context'
      && citation.fieldPath === 'selectedGems:category.crystal_system'
      && citation.pageUrl === '/compare.html'
    if (!record && !isContextCitation) return errorResponse('CITATION_NOT_FOUND', '引用不在当前允许知识快照中。', response.intent, response.providerMode)
    if (record && (!record.supports.length || record.value === undefined)) {
      return errorResponse('CITATION_NOT_SUPPORTING', '引用没有可验证的字段内容。', response.intent, response.providerMode)
    }
    if (record && (record.gemId !== citation.gemId || record.fieldPath !== citation.fieldPath)) {
      return errorResponse('CITATION_NOT_SUPPORTING', '引用字段与声明的证据不匹配。', response.intent, response.providerMode)
    }
  }
  return response
}

function validateBoundary(response: AssistResponse): AssistResponse {
  const secretPatterns = [/system-policy/i, /api[_ -]?key/i, /bearer\s+[a-z0-9._-]+/i, /私有工作日志内容/]
  if (secretPatterns.some(pattern => pattern.test(response.answer))) {
    return errorResponse('POLICY_VIOLATION', '回答触及不允许的信息边界。', response.intent, response.providerMode)
  }
  if (response.status === 'refusal' && !response.refusal) {
    return errorResponse('POLICY_VIOLATION', '拒答状态与 refusal 标记不一致。', response.intent, response.providerMode)
  }
  if (response.status === 'answer' && response.refusal) {
    return errorResponse('POLICY_VIOLATION', '正常回答不能携带拒答标记。', response.intent, response.providerMode)
  }
  return response
}

export function createAssistRuntime(rootDir = process.cwd(), options: { provider?: AssistProvider } = {}) {
  const snapshot = loadKnowledgeSnapshot(rootDir)
  const provider = options.provider || new MockProvider()
  return {
    snapshot,
    async handle(raw: unknown): Promise<AssistResponse> {
      let request: AssistRequest
      try {
        request = parseRequest(raw, snapshot)
      } catch (error) {
        const message = error instanceof Error ? error.message : '请求格式不符合契约。'
        return errorResponse('INVALID_REQUEST', `请求未通过校验：${message}`, 'unsupported', provider.mode)
      }

      const retrieval = retrieveEvidence(request, snapshot)
      const input = { request, retrieval, names: snapshot.names }
      let response = structuredAnswer(input, provider.mode) ?? await provider.respond(input)
      try {
        response = AssistResponseSchema.parse(response)
      } catch {
        return errorResponse('OUTPUT_SCHEMA_MISMATCH', 'Provider 输出未通过结构校验。', retrieval.intent, provider.mode)
      }
      response = validateCitations(response, snapshot)
      return validateBoundary(response)
    },
  }
}

export type AssistRuntime = ReturnType<typeof createAssistRuntime>
