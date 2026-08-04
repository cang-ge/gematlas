/**
 * generate-grading-pages — produce overview + 4 detail pages from
 * data/shared/grading.yaml. Output:
 *   docs/grading/intro.md (EN, root locale)
 *   docs/zh/grading/intro.md (ZH)
 *   docs/grading/{id}.md × N (EN)
 *   docs/zh/grading/{id}.md × N (ZH)
 *
 * Usage: tsx scripts/build/generate-grading-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { GradingTopicsFile } from './schema'

const SHARED = 'data/shared/grading.yaml'
const OUT_EN_INTRO = 'docs/grading/intro.md'
const OUT_ZH_INTRO = 'docs/zh/grading/intro.md'
const OUT_EN_DIR = 'docs/grading'
const OUT_ZH_DIR = 'docs/zh/grading'

const raw = yaml.load(fs.readFileSync(SHARED, 'utf8')) as Record<string, unknown>
const parsed = GradingTopicsFile.parse(raw)
const topics = parsed.topics

function mdList(items: string[] | string | undefined): string {
  if (!items) return ''
  const arr = Array.isArray(items) ? items : items.split('\n').map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  return arr.map(i => `- ${i}`).join('\n')
}

function mdExamplesTable(
  examples: { gem: string; grade: string; note_zh?: string; note_en?: string }[] | undefined,
  isZh: boolean,
): string {
  if (!examples || !examples.length) return ''
  const header = isZh
    ? '| 宝石 | 等级 | 备注 |'
    : '| Gem | Grade | Note |'
  const sep = '|---|---|---|'
  const rows = examples.map(e => {
    const note = isZh ? (e.note_zh || '—') : (e.note_en || '—')
    return `| ${e.gem} | ${e.grade} | ${note} |`
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
    ? '*详见[分级总览](intro)。*'
    : '*See the [grading overview](intro).*'
  return [
    '---',
    `title: ${name}`,
    `grading: ${topic.id}`,
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
  const title = isZh ? '分级' : 'Grading'
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
    isZh ? '## 分级主题' : '## Grading Topics',
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
  console.log(`  ✓ intro → grading/{root,zh}/intro.md`)
} catch (e) {
  console.error(`  ✗ intro: ${(e as Error).message}`)
}

for (const t of topics) {
  try {
    fs.writeFileSync(path.join(OUT_EN_DIR, `${t.id}.md`), detailPage(t, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH_DIR, `${t.id}.md`), detailPage(t, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${t.id} → grading/{root,zh}/${t.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${t.id}: ${(e as Error).message}`)
  }
}

console.log(`\nGenerated ${ok}/${topics.length + 1} grading pages`)
process.exit(ok === topics.length + 1 ? 0 : 1)