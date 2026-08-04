/**
 * generate-topic-pages — shared generator for the 4 bilingual module-page
 * stacks (grading / cutting / identification / gallery).
 *
 * Replaces 4 near-identical per-module generators. Behaviour matches what
 * the deleted scripts produced: one bilingual intro + N bilingual subpages
 * per module, driven by data/shared/{module}.yaml.
 *
 * Usage: tsx scripts/build/generate-topic-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { TopicFile } from './schema'

const ROOT = 'docs'

interface ModuleConfig {
  id: 'grading' | 'cutting' | 'identification' | 'gallery'
  yaml: string
  // Examples table headers (en/zh)
  exampleHeaderEN: string
  exampleHeaderZH: string
  // Per-module "see also" link text for the subpage footer
  seeAlsoEN: (id: string) => string
  seeAlsoZH: (id: string) => string
}

const MODULES: ModuleConfig[] = [
  {
    id: 'grading',
    yaml: 'data/shared/grading.yaml',
    exampleHeaderEN: '| Gem | Grade | Note |',
    exampleHeaderZH: '| 宝石 | 等级 | 备注 |',
    seeAlsoEN: () => '*See the [grading overview](intro).*',
    seeAlsoZH: () => '*详见[分级总览](intro)。*',
  },
  {
    id: 'cutting',
    yaml: 'data/shared/cutting.yaml',
    exampleHeaderEN: '| Gem | Cut | Note |',
    exampleHeaderZH: '| 宝石 | 切工 | 备注 |',
    seeAlsoEN: () => '*See the [cutting overview](intro).*',
    seeAlsoZH: () => '*详见[切割总览](intro)。*',
  },
  {
    id: 'identification',
    yaml: 'data/shared/identification.yaml',
    exampleHeaderEN: '| Gem | Value | Note |',
    exampleHeaderZH: '| 宝石 | 数值 | 备注 |',
    seeAlsoEN: () => '*See the [identification overview](intro).*',
    seeAlsoZH: () => '*详见[鉴定总览](intro)。*',
  },
  {
    id: 'gallery',
    yaml: 'data/shared/gallery.yaml',
    exampleHeaderEN: '| Piece | Detail | Note |',
    exampleHeaderZH: '| 作品 | 详情 | 备注 |',
    seeAlsoEN: () => '*See the [gallery overview](intro).*',
    seeAlsoZH: () => '*详见[画廊总览](intro)。*',
  },
]

function mdList(items: string[] | string | undefined): string {
  if (!items) return ''
  const arr = Array.isArray(items) ? items : items.split('\n').map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  return arr.map(i => `- ${i}`).join('\n')
}

function mdExamplesTable(
  examples: { gem: string; value: string; note_zh?: string; note_en?: string }[] | undefined,
  cfg: ModuleConfig,
  isZh: boolean,
): string {
  if (!examples || !examples.length) return ''
  const header = isZh ? cfg.exampleHeaderZH : cfg.exampleHeaderEN
  // 3-column separator with outer pipes, e.g. |---|---|---|
  const nCols = header.split('|').filter(s => s.trim() !== '').length
  const sep = '|' + Array(nCols).fill('---').join('|') + '|'
  const rows = examples.map(e => {
    const note = isZh ? (e.note_zh || '—') : (e.note_en || '—')
    return `| ${e.gem} | ${e.value} | ${note} |`
  })
  return [header, sep, ...rows].join('\n')
}

function detailPage(topic: ReturnType<typeof TopicFile.parse>['topics'][number], cfg: ModuleConfig, locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? topic.name_zh : topic.name_en
  const summary = isZh ? topic.summary_zh : topic.summary_en
  const principles = isZh ? topic.principles_zh : topic.principles_en
  const principlesTitle = isZh ? '## 核心要点' : '## Core Principles'
  const overviewTitle = isZh ? '## 概述' : '## Overview'
  const examplesTitle = isZh ? '## 示例' : '## Examples'
  const seeAlso = isZh ? cfg.seeAlsoZH(topic.id) : cfg.seeAlsoEN(topic.id)
  return [
    '---',
    `title: ${name}`,
    `${cfg.id}: ${topic.id}`,
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
    mdExamplesTable(topic.examples, cfg, isZh),
    '',
    seeAlso,
  ].filter(s => s !== undefined).join('\n')
}

function overviewPage(parsed: ReturnType<typeof TopicFile.parse>, cfg: ModuleConfig, locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh
    ? ({ grading: '分级', cutting: '切割', identification: '鉴定', gallery: '画廊' }[cfg.id])
    : ({ grading: 'Grading', cutting: 'Cutting', identification: 'Identification', gallery: 'Gallery' }[cfg.id])
  const lede = isZh ? parsed.overview_zh : parsed.overview_en
  const rows = parsed.topics.map(t => {
    const name = isZh ? t.name_zh : t.name_en
    const summary = isZh ? t.summary_zh : t.summary_en
    return `| [${name}](${t.id}) | ${summary.split('\n')[0]} |`
  }).join('\n')
  // Per-module section heading (matches legacy per-module generators)
  const sectionHeadingEN = `## ${title} Topics`
  const sectionHeadingZH = `## ${title}主题`
  const topicHeader = isZh ? sectionHeadingZH : sectionHeadingEN
  const colHeader = isZh ? '| 主题 | 概述 |' : '| Topic | Summary |'

  return [
    '---',
    `title: ${title}`,
    '---',
    '',
    `# ${title}`,
    '',
    lede,
    '',
    topicHeader,
    '',
    colHeader,
    '|---|---|',
    rows,
    '',
  ].join('\n')
}

function processModule(cfg: ModuleConfig): { ok: number; total: number } {
  const raw = yaml.load(fs.readFileSync(cfg.yaml, 'utf8')) as Record<string, unknown>
  const parsed = TopicFile.parse(raw)
  const topics = parsed.topics
  const outEnDir = path.join(ROOT, cfg.id)
  const outZhDir = path.join(ROOT, 'zh', cfg.id)
  fs.mkdirSync(outEnDir, { recursive: true })
  fs.mkdirSync(outZhDir, { recursive: true })

  let ok = 0
  try {
    fs.writeFileSync(path.join(outEnDir, 'intro.md'), overviewPage(parsed, cfg, 'en'), 'utf8')
    fs.writeFileSync(path.join(outZhDir, 'intro.md'), overviewPage(parsed, cfg, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${cfg.id} intro → {root,zh}/${cfg.id}/intro.md`)
  } catch (e) {
    console.error(`  ✗ ${cfg.id} intro: ${(e as Error).message}`)
  }

  for (const t of topics) {
    try {
      fs.writeFileSync(path.join(outEnDir, `${t.id}.md`), detailPage(t, cfg, 'en'), 'utf8')
      fs.writeFileSync(path.join(outZhDir, `${t.id}.md`), detailPage(t, cfg, 'zh'), 'utf8')
      ok++
      console.log(`  ✓ ${cfg.id}/${t.id} → {root,zh}/${cfg.id}/${t.id}.md`)
    } catch (e) {
      console.error(`  ✗ ${cfg.id}/${t.id}: ${(e as Error).message}`)
    }
  }
  return { ok, total: topics.length + 1 }
}

let totalOk = 0
let totalAll = 0
for (const cfg of MODULES) {
  const r = processModule(cfg)
  totalOk += r.ok
  totalAll += r.total
}
console.log(`\nGenerated ${totalOk}/${totalAll} module pages across ${MODULES.length} modules`)
process.exit(totalOk === totalAll ? 0 : 1)