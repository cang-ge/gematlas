import type { AssistRequest, AssistResponse, EvidenceRecord, RetrievalResult } from './types'

export type ProviderInput = {
  request: AssistRequest
  retrieval: RetrievalResult
  names: Map<string, { zh: string; en: string }>
}

export interface AssistProvider {
  readonly mode: 'mock' | 'real'
  respond(input: ProviderInput): Promise<AssistResponse>
}

export function publicCitations(evidence: EvidenceRecord[]) {
  return evidence.slice(0, 12).map(({ value: _value, searchableText: _text, supports: _supports, ...citation }) => citation)
}
