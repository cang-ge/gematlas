import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createExport, buildDraft, CurationError, DraftRequestSchema, MAX_BODY_BYTES, MockDraftProvider, OpenAICompatibleDraftProvider, loadGems, type DraftProvider } from './draft'

export type ServerOptions = { root?: string; provider?: DraftProvider; mode?: 'mock' | 'real'; port?: number }
const here = path.dirname(fileURLToPath(import.meta.url))

function safeJson(res: http.ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
  res.end(JSON.stringify(data))
}

function sendFile(res: http.ServerResponse, filename: string, contentType: string): void {
  void readFile(filename).then(content => {
    res.writeHead(200, {
      'content-type': contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
      'referrer-policy': 'no-referrer',
    })
    res.end(content)
  }).catch(() => safeJson(res, 500, { error: 'INTERNAL_ERROR' }))
}

async function bodyJson(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const declaredLength = Number(req.headers['content-length'] || 0)
    if (declaredLength > MAX_BODY_BYTES) { reject(new CurationError('BODY_TOO_LARGE', 413)); req.resume(); return }
    let body = ''
    let size = 0
    let tooLarge = false
    req.setEncoding('utf8')
    req.on('data', chunk => {
      if (tooLarge) return
      size += Buffer.byteLength(chunk)
      if (size > MAX_BODY_BYTES) { tooLarge = true; reject(new CurationError('BODY_TOO_LARGE', 413)); return }
      body += chunk
    })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { reject(new CurationError('INVALID_JSON', 400)) }
    })
    req.on('error', reject)
  })
}

function isLoopback(address = ''): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

export function createCurationServer(options: ServerOptions = {}): http.Server {
  const root = options.root || process.cwd()
  const mode = options.mode || 'mock'
  const provider = options.provider || (mode === 'real' ? createRealProviderFromEnv() : new MockDraftProvider())
  const port = options.port || Number(process.env.GEMATLAS_CURATION_PORT || 4318)

  return http.createServer(async (req, res) => {
    const host = req.headers.host || ''
    const expectedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`])
    if (!expectedHosts.has(host) || !isLoopback(req.socket.remoteAddress)) { safeJson(res, 403, { error: 'LOCAL_ONLY' }); return }
    const origin = req.headers.origin
    if (origin && origin !== `http://${host}`) { safeJson(res, 403, { error: 'ORIGIN_DENIED' }); return }
    const url = new URL(req.url || '/', `http://${host}`)
    try {
      if (req.method === 'GET' && url.pathname === '/') sendFile(res, path.join(here, 'ui', 'index.html'), 'text/html; charset=utf-8')
      else if (req.method === 'GET' && url.pathname === '/app.js') sendFile(res, path.join(here, 'ui', 'app.js'), 'text/javascript; charset=utf-8')
      else if (req.method === 'GET' && url.pathname === '/styles.css') sendFile(res, path.join(here, 'ui', 'styles.css'), 'text/css; charset=utf-8')
      else if (req.method === 'GET' && url.pathname === '/health') safeJson(res, 200, { status: 'ok', mode: provider.mode, model: provider.model, endpointHost: provider.endpointHost })
      else if (req.method === 'GET' && url.pathname === '/api/gems') {
        const gems = await loadGems(root)
        safeJson(res, 200, gems.map(gem => ({ id: gem.id, name: gem.names.zh, englishName: gem.names.en })))
      } else if (req.method === 'POST' && url.pathname === '/api/draft') {
        if (origin !== `http://${host}`) throw new CurationError('ORIGIN_REQUIRED', 403)
        const parsed = DraftRequestSchema.safeParse(await bodyJson(req))
        if (!parsed.success) throw new CurationError('INVALID_REQUEST', 400)
        if (provider.mode === 'real' && parsed.data.confirmExternalSend !== true) throw new CurationError('EXTERNAL_SEND_NOT_CONFIRMED', 403)
        safeJson(res, 200, await buildDraft(parsed.data, provider, await loadGems(root)))
      } else if (req.method === 'POST' && url.pathname === '/api/export') {
        if (origin !== `http://${host}`) throw new CurationError('ORIGIN_REQUIRED', 403)
        const input = await bodyJson(req) as Parameters<typeof createExport>[0]
        safeJson(res, 200, createExport(input, await loadGems(root)))
      } else safeJson(res, 404, { error: 'NOT_FOUND' })
    } catch (error) {
      const issue = error instanceof CurationError ? error : new CurationError('INTERNAL_ERROR', 500)
      safeJson(res, issue.status, { error: issue.code })
    }
  })
}

function createRealProviderFromEnv(): DraftProvider {
  const endpoint = process.env.GEMATLAS_REAL_ENDPOINT?.trim()
  const apiKey = process.env.GEMATLAS_REAL_API_KEY?.trim()
  const model = process.env.GEMATLAS_REAL_MODEL?.trim()
  if (!endpoint || !apiKey || !model) throw new Error('Real Provider requires GEMATLAS_REAL_ENDPOINT, GEMATLAS_REAL_API_KEY and GEMATLAS_REAL_MODEL')
  if (new URL(endpoint).protocol !== 'https:') throw new Error('Real Provider endpoint must use HTTPS')
  return new OpenAICompatibleDraftProvider({ endpoint, apiKey, model, timeoutMs: Number(process.env.GEMATLAS_REAL_TIMEOUT_MS || 20000) })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.loadEnvFile('.env.local') } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const mode = process.argv.includes('--real') ? 'real' : 'mock'
  try {
    const provider = mode === 'mock' ? new MockDraftProvider() : createRealProviderFromEnv()
    const server = createCurationServer({ mode, provider })
    const port = Number(process.env.GEMATLAS_CURATION_PORT || 4318)
    server.listen(port, '127.0.0.1', () => {
      console.log(`GemAtlas P1-A ${mode.toUpperCase()} workbench: http://127.0.0.1:${port}`)
      console.log(`Model: ${provider.model}; endpoint host: ${provider.endpointHost}`)
    })
  } catch (error) { console.error(error instanceof Error ? error.message : 'Startup failed'); process.exitCode = 1 }
}
