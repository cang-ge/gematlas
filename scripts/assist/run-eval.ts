import fs from 'node:fs'
import path from 'node:path'
import { createAssistRuntime } from './pipeline'

type EvalCase = {
  id: string
  category: string
  input: string
  expectedIntent: string
  allowedEvidence: string[]
  expectedRefusal: boolean
  mustContain: string[]
  mustNotContain: string[]
}

type Suite = { suiteId: string; promptVersion: string; knowledgeSnapshot: string; cases: EvalCase[] }

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const suitePath = arg('--suite') || process.env.GEMATLAS_ASSIST_SUITE
if (!suitePath) {
  console.error('Usage: pnpm assist:eval -- --suite <private-suite.json> [--receipt <private-receipt.json>]')
  process.exit(2)
}

const suite = JSON.parse(fs.readFileSync(path.resolve(suitePath), 'utf8')) as Suite
const runtime = createAssistRuntime()
const startedAt = new Date().toISOString()
const results = await Promise.all(suite.cases.map(async testCase => {
  const response = await runtime.handle({
    question: testCase.input,
    locale: 'zh-CN',
    context: {
      currentPage: '/zh/compare.html',
      currentGem: null,
      selectedGems: testCase.id === 'compare-05' ? ['ruby', 'sapphire'] : [],
    },
  })
  const evidenceAllowed = response.citations.every(citation => testCase.allowedEvidence.some(allowed =>
    citation.sourceRef === allowed
    || citation.sourceRef.startsWith(`${allowed}.`)
    || citation.sourceRef.startsWith(`${allowed}:`)))
  const contains = testCase.mustContain.every(text => response.answer.includes(text))
  const excludes = testCase.mustNotContain.every(text => !response.answer.includes(text))
  const passed = response.intent === testCase.expectedIntent
    && response.refusal === testCase.expectedRefusal
    && evidenceAllowed
    && contains
    && excludes
    && response.error === null
  return {
    id: testCase.id,
    passed,
    expectedIntent: testCase.expectedIntent,
    actualIntent: response.intent,
    expectedRefusal: testCase.expectedRefusal,
    actualRefusal: response.refusal,
    citations: response.citations.map(citation => citation.sourceRef),
    error: response.error,
    failedChecks: {
      intent: response.intent !== testCase.expectedIntent,
      refusal: response.refusal !== testCase.expectedRefusal,
      evidenceAllowed: !evidenceAllowed,
      mustContain: !contains,
      mustNotContain: !excludes,
      responseError: response.error !== null,
    },
  }
}))

const passed = results.filter(result => result.passed).length
const receipt = {
  suiteId: suite.suiteId,
  suiteVersion: 'v1',
  knowledgeSnapshot: suite.knowledgeSnapshot,
  promptVersion: suite.promptVersion,
  providerMode: 'mock',
  startedAt,
  finishedAt: new Date().toISOString(),
  passed,
  failed: results.length - passed,
  results,
}

console.log(JSON.stringify(receipt, null, 2))
const receiptPath = arg('--receipt')
if (receiptPath) {
  fs.mkdirSync(path.dirname(path.resolve(receiptPath)), { recursive: true })
  fs.writeFileSync(path.resolve(receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')
}
process.exit(passed === results.length ? 0 : 1)
