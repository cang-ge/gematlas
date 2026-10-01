import { z } from 'zod'

export const ASSIST_ERROR_CODES = [
  'UNSUPPORTED_INTENT',
  'NO_EVIDENCE',
  'POLICY_VIOLATION',
  'INVALID_REQUEST',
  'INVALID_JSON',
  'OUTPUT_SCHEMA_MISMATCH',
  'CITATION_NOT_FOUND',
  'CITATION_NOT_SUPPORTING',
  'PROVIDER_TIMEOUT',
  'PROVIDER_NETWORK_ERROR',
  'PROVIDER_UNAVAILABLE',
] as const

export type AssistErrorCode = typeof ASSIST_ERROR_CODES[number]
export type AssistIntent =
  | 'explain'
  | 'compare'
  | 'filter'
  | 'unsupported'
  | 'high_risk_refusal'
  | 'security_refusal'

export const AssistContextSchema = z.object({
  currentPage: z.string().min(1).max(240).refine(
    value => value.startsWith('/') && !value.startsWith('//') && !value.includes('://'),
    'currentPage must be an internal relative path',
  ),
  currentGem: z.string().regex(/^[a-z][a-z0-9-]*$/).nullable(),
  selectedGems: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).max(4),
}).strict()

export const AssistRequestSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  locale: z.enum(['zh-CN', 'en']),
  context: AssistContextSchema,
}).strict()

export type AssistRequest = z.infer<typeof AssistRequestSchema>

export const CitationSchema = z.object({
  gemId: z.string().min(1),
  fieldPath: z.string().min(1),
  pageUrl: z.string().startsWith('/'),
  sourceRef: z.string().startsWith('source:'),
  contentVersion: z.literal('gems-v1'),
}).strict()

export type Citation = z.infer<typeof CitationSchema>

export const AssistErrorSchema = z.object({
  code: z.enum(ASSIST_ERROR_CODES),
  message: z.string().min(1).max(240),
}).strict()

export const AssistResponseSchema = z.object({
  status: z.enum(['answer', 'refusal', 'error']),
  providerMode: z.enum(['mock', 'real']),
  answerSource: z.enum(['structured', 'mock', 'model', 'policy']).optional(),
  intent: z.enum([
    'explain',
    'compare',
    'filter',
    'unsupported',
    'high_risk_refusal',
    'security_refusal',
  ]),
  answer: z.string().max(6000),
  citations: z.array(CitationSchema).max(16),
  boundary: z.string().min(1).max(240),
  refusal: z.boolean(),
  error: AssistErrorSchema.nullable(),
}).strict()

export type AssistResponse = z.infer<typeof AssistResponseSchema>

export type EvidenceRecord = Citation & {
  value: unknown
  searchableText: string
  supports: string[]
}

export type KnowledgeSnapshot = {
  version: 'gems-v1'
  records: Map<string, EvidenceRecord>
  gems: Map<string, Record<string, unknown>>
  names: Map<string, { zh: string; en: string }>
}

export type RetrievalResult = {
  intent: AssistIntent
  gemIds: string[]
  evidence: EvidenceRecord[]
  reason?: string
}
