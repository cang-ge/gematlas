import http from 'node:http'
import { loadEnvFile } from 'node:process'
import { createAssistRuntime } from './pipeline'
import { RealModelProvider } from './real-provider'

try {
  loadEnvFile('.env.local')
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
}

const port = Number(process.env.GEMATLAS_ASSIST_PORT || 4317)
const providerMode = process.argv.includes('--mock')
  ? 'mock'
  : process.argv.includes('--real') || process.env.GEMATLAS_ASSIST_PROVIDER === 'real'
    ? 'real'
    : 'mock'
const runtime = createAssistRuntime(process.cwd(), {
  provider: providerMode === 'real' ? new RealModelProvider() : undefined,
})
const maxBodyBytes = 32 * 1024
const defaultAllowedOrigins = [
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
]
const allowedOrigins = new Set(
  (process.env.GEMATLAS_ASSIST_ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
)

function json(res: http.ServerResponse, status: number, body: unknown, origin?: string): void {
  const payload = JSON.stringify(body)
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  }
  if (origin && allowedOrigins.has(origin)) {
    headers['access-control-allow-origin'] = origin
    headers.vary = 'Origin'
  }
  res.writeHead(status, headers)
  res.end(payload)
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let total = 0
    let body = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
      total += Buffer.byteLength(chunk)
      if (total > maxBodyBytes) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined
  if (req.method === 'OPTIONS' && url.pathname === '/assist') {
    json(res, 204, null, origin)
    return
  }
  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { status: 'ok', providerMode, knowledgeSnapshot: 'gems-v1' }, origin)
    return
  }
  if (req.method !== 'POST' || url.pathname !== '/assist') {
    json(res, 404, { error: 'NOT_FOUND' }, origin)
    return
  }

  try {
    const raw = JSON.parse(await readBody(req)) as unknown
    json(res, 200, await runtime.handle(raw), origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON'
    json(res, 400, {
      status: 'error',
      providerMode: 'mock',
      intent: 'unsupported',
      answer: '请求无法解析。',
      citations: [],
      boundary: '教育性参考，不替代专业鉴定',
      refusal: false,
      error: { code: 'INVALID_JSON', message },
    }, origin)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`GemAtlas ${providerMode.toUpperCase()} Assist listening on http://127.0.0.1:${port}`)
  console.log(`Allowed browser origins: ${[...allowedOrigins].join(', ')}`)
  console.log('Routes: GET /health · POST /assist')
})
