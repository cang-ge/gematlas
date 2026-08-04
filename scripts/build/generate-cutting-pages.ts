/**
 * generate-cutting-pages — produce overview + 3 detail pages from
 * data/shared/cutting.yaml. Output:
 *   docs/cutting/intro.md (EN, root locale)
 *   docs/zh/cutting/intro.md (ZH)
 *   docs/cutting/{id}.md × N (EN)
 *   docs/zh/cutting/{id}.md × N (ZH)
 *
 * Usage: tsx scripts/build/generate-cutting-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { CuttingTopicsFile } from './schema'

const SHARED = 'data/shared/cutting.yaml'
const OUT_EN_INTRO = 'docs/cutting/intro.md'
const OUT_ZH_INTRO = 'docs/zh/cutting/intro.md'
const OUT_EN_DIR = 'docs/cutting'
const OUT_ZH_DIR = 'docs/zh/cutting'

const raw = yaml.load(fs.readFileSync(SHARED, 'utf8')) as Record<string, unknown>
const parsed = CuttingTopicsFile.parse(raw)
const topics = parsed.topics

function mdList(items: string[] | string | undefined): string {
  if (!items) return ''
  const arr = Array.isArray(items) ? items : items.split('\n').map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  return arr.map(i => `- ${i}`).join('\n')
}

function mdExamplesTable(
  examples: { gem: string; cut: string; note_zh?: string; note_en?: string }[] | undefined,
  isZh: boolean,
): string {
  if (!examples || !examples.length) return ''
  const header = isZh ? '| 宝石 | 切工 | 备注 |' : '| Gem | Cut | Note |'
  const sep = '|---|---|---|'
  const rows = examples.map(e => {
    const note = isZh ? (e.note_zh || '—') : (e.note_en || '—')
    return `| ${e.gem} | ${e.cut} | ${note} |`
  })
  return [header, sep, ...rows].join('\n')
}

function detailPage(topic: typeof topics[number], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? topic.name_zh : topic.name_en
  const summary = isZh ? topic.summary_zh : topic.summary_en
  const principles = isZh ? topic.principles_zh : topic.principles_en
  const principlesTitle = isZh ? '## 核心要点' : '## Core Principles'
  const overviewTitle = isZh ? '## 概述' : '## Overview'
  const examplesTitle = isZh ? '## 示例' : '## Examples'
  const seeAlso = isZh
    ? '*详见[切割总览](intro)。*'
    : '*See the [cutting overview](intro).*'
  return [
    '---',
    `title: ${name}`,
    `cutting: ${topic.id}`,
    '---',
    '',
    `# ${name}`,
    '',
    overviewTitle,
    '',
    summary,
    '',
    principlesTitle,
    '',
    mdList(principles),
    '',
    examplesTitle,
    '',
    mdExamplesTable(topic.examples, isZh),
    '',
    seeAlso,
  ].filter(s => s !== undefined).join('\n')
}

function overviewPage(locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? '切割' : 'Cutting'
  const lede = isZh ? parsed.overview_zh : parsed.overview_en
  const rows = topics.map(t => {
    const name = isZh ? t.name_zh : t.name_en
    const summary = isZh ? t.summary_zh : t.summary_en
    return `| [${name}](${t.id}) | ${summary.split('\n')[0]} |`
  }).join('\n')

  return [
    '---',
    `title: ${title}`,
    '---',
    '',
    `# ${title}`,
    '',
    lede,
    '',
    isZh ? '## 切割主题' : '## Cutting Topics',
    '',
    isZh ? '| 主题 | 概述 |' : '| Topic | Summary |',
    '|---|---|',
    rows,
    '',
  ].join('\n')
}

// Generate
fs.mkdirSync(OUT_EN_DIR, { recursive: true })
fs.mkdirSync(OUT_ZH_DIR, { recursive: true })

let ok = 0
try {
  fs.writeFileSync(OUT_EN_INTRO, overviewPage('en'), 'utf8')
  fs.writeFileSync(OUT_ZH_INTRO, overviewPage('zh'), 'utf8')
  ok++
  console.log(`  ✓ intro → cutting/{root,zh}/intro.md`)
} catch (e) {
  console.error(`  ✗ intro: ${(e as Error).message}`)
}

for (const t of topics) {
  try {
    fs.writeFileSync(path.join(OUT_EN_DIR, `${t.id}.md`), detailPage(t, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH_DIR, `${t.id}.md`), detailPage(t, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${t.id} → cutting/{root,zh}/${t.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${t.id}: ${(e as Error).message}`)
  }
}

console.log(`\nGenerated ${ok}/${topics.length + 1} cutting pages`)
process.exit(ok === topics.length + 1 ? 0 : 1)