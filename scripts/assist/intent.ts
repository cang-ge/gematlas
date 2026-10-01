import type { AssistIntent, AssistRequest, KnowledgeSnapshot } from './types'

const SECURITY_PATTERNS = [
  /系统提示词|system prompt/i,
  /完整上下文|full context/i,
  /私有工作日志|private worklog/i,
  /环境变量|请求头|cookie|provider 密钥|api key|bearer/i,
  /ignore (all|previous)|忽略所有边界/i,
]

const RISK_PATTERNS = [
  /(是否|是不是|判断|确定|鉴定).{0,12}(天然|合成|真假|实验室培育|处理过)/i,
  /(这颗|这块|这个|该样品|具体样品|照片|图片).{0,20}(天然|合成|真假|实验室培育|处理过)/i,
  /产地|origin/i,
  /价值|估价|值多少钱|market value/i,
]

const UNSUPPORTED_PATTERNS = [
  /预测.*价格|价格.*预测|下个月.*价格/i,
  /库存|有货|stock/i,
  /没有收录|未收录|精确化学成分/i,
]

const FILTER_PATTERNS = [/筛选|过滤|找出|当前页面.*按|filter/i]
const COMPARE_PATTERNS = [/比较|对比|共同点|差异|compare|versus|\bvs\b/i]

export function classifyIntent(question: string): AssistIntent {
  if (SECURITY_PATTERNS.some(pattern => pattern.test(question))) return 'security_refusal'
  if (RISK_PATTERNS.some(pattern => pattern.test(question))) return 'high_risk_refusal'
  if (UNSUPPORTED_PATTERNS.some(pattern => pattern.test(question))) return 'unsupported'
  if (FILTER_PATTERNS.some(pattern => pattern.test(question))) return 'filter'
  if (COMPARE_PATTERNS.some(pattern => pattern.test(question))) return 'compare'
  if (/当前选择|两种宝石/.test(question)) return 'compare'
  return 'explain'
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractGemIds(
  request: AssistRequest,
  snapshot: KnowledgeSnapshot,
): string[] {
  const question = request.question.toLocaleLowerCase()
  const matches = [...snapshot.names.entries()]
    .flatMap(([id, names]) => [
      { id, token: names.zh.toLocaleLowerCase() },
      { id, token: names.en.toLocaleLowerCase() },
      { id, token: id.toLocaleLowerCase() },
    ])
    .filter(({ token }) => token && new RegExp(escapeRegExp(token), 'i').test(question))
    .sort((a, b) => b.token.length - a.token.length)

  const ids: string[] = []
  for (const match of matches) {
    if (!ids.includes(match.id)) ids.push(match.id)
  }

  if (/当前选择|当前页面|selected|current/i.test(request.question)) {
    for (const id of request.context.selectedGems) {
      if (!ids.includes(id)) ids.push(id)
    }
  }
  if (request.context.currentGem
    && !ids.includes(request.context.currentGem)
    && /(当前|它|这颗|这个|该(宝石|条目|记录)|本条|此条目|\b(?:it|its|this|current)\b)/i.test(request.question)) {
    ids.push(request.context.currentGem)
  }
  return ids.slice(0, 4)
}
