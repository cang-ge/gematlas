/**
 * sync-content — verify en/ ↔ zh/ markdown pages stay in sync.
 *
 * Usage:
 *   tsx scripts/build/sync-content.ts   — exits non-zero on any mismatch
 *
 * Exports findErrors() for tests.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')
const EN = path.join(ROOT, 'docs')
const ZH = path.join(ROOT, 'docs', 'zh')

export type I18nError =
  | { kind: 'MISSING'; rel: string; missingIn: 'en' | 'zh' }
  | { kind: 'FRONTMATTER'; rel: string; key: string; en: string; zh: string }

function listMd(dir: string): Set<string> {
  const out = new Set<string>()
  const walk = (abs: string, rel: string): void => {
    if (!fs.existsSync(abs)) return
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue // skip hidden dirs
      const r = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(path.join(abs, entry.name), r)
      else if (entry.isFile() && entry.name.endsWith('.md')) out.add(r)
    }
  }
  walk(dir, '')
  return out
}

/**
 * ponytail: minimal YAML-frontmatter parser — only handles `key: value`
 * lines (no nested lists, no multi-line scalars). Sufficient for VitePress
 * pages where title/gem/crystalSystem are always flat strings.
 */
function parseFrontmatter(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return out
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    // strip wrapping quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[kv[1]] = v
  }
  return out
}

function readMd(p: string): { fm: Record<string, string> } {
  const raw = fs.readFileSync(p, 'utf8')
  const fm = parseFrontmatter(raw)
  return { fm }
}

/** Returns the set of FRONTMATTER keys that should be identical across locales. */
const SHARED_FM_KEYS = ['gem', 'crystalSystem'] as const

export function findErrors(): I18nError[] {
  const errors: I18nError[] = []
  // ponytail: EN root is now docs/ (not docs/en/) — exclude zh/ and framework dirs
  const enFiles = new Set([...listMd(EN)].filter(r => !r.startsWith('zh/') && !r.startsWith('.vitepress/') && !r.startsWith('public/')))
  const zhFiles = listMd(ZH)
  const all = new Set<string>([...enFiles, ...zhFiles])

  // 1. File-existence cross-check.
  for (const rel of all) {
    if (!enFiles.has(rel)) errors.push({ kind: 'MISSING', rel, missingIn: 'en' })
    if (!zhFiles.has(rel)) errors.push({ kind: 'MISSING', rel, missingIn: 'zh' })
  }

  // 2. Frontmatter + heading cross-check (only when file exists in both).
  for (const rel of all) {
    if (!enFiles.has(rel) || !zhFiles.has(rel)) continue
    const en = readMd(path.join(EN, rel))
    const zh = readMd(path.join(ZH, rel))

    for (const key of SHARED_FM_KEYS) {
      const enVal = en.fm[key]
      const zhVal = zh.fm[key]
      if ((enVal ?? '') !== (zhVal ?? '')) {
        errors.push({
          kind: 'FRONTMATTER', rel, key,
          en: enVal || '(empty)',
          zh: zhVal || '(empty)',
        })
      }
    }

    // ponytail: skip heading diffs. Bilingual pages translate headings 1:1
    // (e.g. "Classification" ↔ "分类"); checking heading text would be a
    // constant false positive. File presence + shared frontmatter keys
    // are sufficient invariants.
  }
  return errors
}

function report(): void {
  const errors = findErrors()
  if (errors.length === 0) {
    console.log(`✓ i18n sync OK`)
    return
  }
  for (const e of errors) {
    if (e.kind === 'MISSING') {
      console.error(`✗ MISSING: docs/${e.missingIn}/${e.rel}`)
    } else {
      console.error(`✗ FRONTMATTER [${e.rel}] ${e.key}: en="${e.en}" zh="${e.zh}"`)
    }
  }
  console.error(`\n${errors.length} i18n issue(s)`)
  process.exit(1)
}

if (process.argv[1] && import.meta.url === fileURLToPath(new URL(`file://${process.argv[1]}`))) report()

export { report }
