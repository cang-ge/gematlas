/**
 * generate-color-causes-pages — produce color-cause overview + 3 detail pages
 * from data/shared/color-causes.yaml. Output:
 *   docs/color-causes/{id}.md        (EN, root locale)
 *   docs/zh/color-causes/{id}.md    (ZH)
 *   docs/color-causes/intro.md
 *   docs/zh/color-causes/intro.md
 *
 * Usage: tsx scripts/build/generate-color-causes-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { ColorCausesFile } from './schema'

const SHARED = 'data/shared/color-causes.yaml'
const OUT_EN_INTRO = 'docs/color-causes/intro.md'
const OUT_ZH_INTRO = 'docs/zh/color-causes/intro.md'
const OUT_EN_DIR = 'docs/color-causes'
const OUT_ZH_DIR = 'docs/zh/color-causes'

const raw = yaml.load(fs.readFileSync(SHARED, 'utf8'))
const parsed = ColorCausesFile.parse(raw)
const causes = parsed.causes

function valOrDash(x?: string): string { return x || '—' }

function detailPage(cause: typeof causes[number], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? cause.name_zh : cause.name_en
  const summary = isZh ? cause.summary_zh : cause.summary_en
  const mechanism = isZh ? cause.mechanism_zh : cause.mechanism_en

  // example table headers + key columns vary by mechanism
  if (cause.id === 'transition-metal') {
    const hdr = isZh ? '| 宝石 | 致色元素 | 化学式宿主 | 颜色 |' : '| Gem | Element | Host | Color |'
    const rows = (cause.examples || []).map(e =>
      `| ${e.gem} | ${e.element || '—'} | ${e.host} | ${e.color} |`).join('\n')
    return [
      '---',
      `title: ${name}`,
      `colorCause: ${cause.id}`,
      '---',
      '',
      `# ${name}`,
      '',
      isZh ? '## 概述' : '## Overview',
      '',
      summary || '',
      '',
      isZh ? '## 致色机制' : '## Mechanism',
      '',
      mechanism || '',
      '',
      isZh ? '## 示例宝石' : '## Example Gemstones',
      '',
      hdr,
      '|---|---|---|---|',
      rows,
      '',
      isZh ? '*详见[颜色成因总览](intro)。*' : '*See the [color cause overview](intro).*',
    ].join('\n')
  }

  if (cause.id === 'color-centers') {
    const hdr = isZh ? '| 宝石 | 缺陷类型 | 化学式宿主 | 颜色 |' : '| Gem | Defect | Host | Color |'
    const rows = (cause.examples || []).map(e =>
      `| ${e.gem} | ${e.defect || '—'} | ${e.host} | ${e.color} |`).join('\n')
    return [
      '---',
      `title: ${name}`,
      `colorCause: ${cause.id}`,
      '---',
      '',
      `# ${name}`,
      '',
      isZh ? '## 概述' : '## Overview',
      '',
      summary || '',
      '',
      isZh ? '## 致色机制' : '## Mechanism',
      '',
      mechanism || '',
      '',
      isZh ? '## 示例宝石' : '## Example Gemstones',
      '',
      hdr,
      '|---|---|---|---|',
      rows,
      '',
      isZh ? '*详见[颜色成因总览](intro)。*' : '*See the [color cause overview](intro).*',
    ].join('\n')
  }

  // charge-transfer
  const hdr = isZh ? '| 宝石 | 转移对 | 化学式宿主 | 颜色 |' : '| Gem | Transfer Pair | Host | Color |'
  const rows = (cause.examples || []).map(e =>
    `| ${e.gem} | ${e.pair || '—'} | ${e.host} | ${e.color} |`).join('\n')
  return [
    '---',
    `title: ${name}`,
    `colorCause: ${cause.id}`,
    '---',
    '',
    `# ${name}`,
    '',
    isZh ? '## 概述' : '## Overview',
    '',
    summary || '',
    '',
    isZh ? '## 致色机制' : '## Mechanism',
    '',
    mechanism || '',
    '',
    isZh ? '## 示例宝石' : '## Example Gemstones',
    '',
    hdr,
    '|---|---|---|---|',
    rows,
    '',
    isZh ? '*详见[颜色成因总览](intro)。*' : '*See the [color cause overview](intro).*',
  ].join('\n')
}

function overviewPage(locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? '颜色成因' : 'Color Cause'
  const rows = causes.map(c =>
    `| [${isZh ? c.name_zh : c.name_en}](${c.id}) | ${isZh ? c.summary_zh : c.summary_en} |`
  ).join('\n')

  const lede = isZh
    ? '珠宝的颜色并非孤立现象，而是由背后的物理化学机制决定。本分类模块介绍天然宝石中最重要的三种致色机制：'
    : 'Color in gems is never arbitrary. Three primary mechanisms account for nearly all natural colored stones:'

  return [
    '---',
    `title: ${title}`,
    '---',
    '',
    `# ${title}`,
    '',
    lede,
    '',
    isZh ? '## 三种主要机制' : '## Three Primary Mechanisms',
    '',
    isZh ? '| 机制 | 概述 |' : '| Mechanism | Summary |',
    '|---|---|',
    rows,
    '',
    isZh ? '*参见[分类总览](../classification/intro)了解矿物分类框架。*'
         : '*See the [classification overview](../classification/intro) for the mineralogical framework.*',
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
  console.log(`  ✓ intro → color-causes/{root,zh}/intro.md`)
} catch (e) {
  console.error(`  ✗ intro: ${(e as Error).message}`)
}

for (const c of causes) {
  try {
    fs.writeFileSync(path.join(OUT_EN_DIR, `${c.id}.md`), detailPage(c, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH_DIR, `${c.id}.md`), detailPage(c, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${c.id} → color-causes/{root,zh}/${c.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${c.id}: ${(e as Error).message}`)
  }
}

console.log(`\nGenerated ${ok}/${1 + causes.length} color-cause pages`)
process.exit(ok === 1 + causes.length ? 0 : 1)
