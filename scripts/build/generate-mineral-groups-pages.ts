/**
 * generate-mineral-groups-pages — produce overview + 8 detail pages
 * from data/shared/mineral-groups.yaml.
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { MineralGroupsFile } from './schema'

const SHARED = 'data/shared/mineral-groups.yaml'
const OUT_EN_INTRO = 'docs/mineral-groups/intro.md'
const OUT_ZH_INTRO = 'docs/zh/mineral-groups/intro.md'
const OUT_EN_DIR = 'docs/mineral-groups'
const OUT_ZH_DIR = 'docs/zh/mineral-groups'

const raw = yaml.load(fs.readFileSync(SHARED, 'utf8'))
const parsed = MineralGroupsFile.parse(raw)
const groups = parsed.groups

function detailPage(g: typeof groups[number], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? g.name_zh : g.name_en
  const summary = isZh ? g.summary_zh : g.summary_en
  const structural = isZh ? g.structural_zh : g.structural_en
  const formulaClass = isZh ? g.formula_class : g.formula_class_en

  const gemRows = (g.gems || []).map(x => `| ${x.name} | ${x.formula} | ${x.subgroup || '—'} |`).join('\n')

  return [
    '---',
    `title: ${name}`,
    `mineralGroup: ${g.id}`,
    '---',
    '',
    `# ${name}`,
    '',
    isZh ? '## 概述' : '## Overview',
    '',
    summary || '',
    '',
    isZh ? '## 化学式类型' : '## Formula Class',
    '',
    formulaClass || '—',
    '',
    isZh ? '## 结构' : '## Crystal Structure',
    '',
    structural || '',
    '',
    isZh ? '## 代表性宝石' : '## Representative Gem Species',
    '',
    isZh ? '| 宝石 | 化学式 | 亚族 |' : '| Gem | Formula | Subgroup |',
    '|---|---|---|',
    gemRows,
    '',
    isZh ? '*详见[矿物组总览](intro)。*' : '*See the [mineral group overview](intro).*',
  ].join('\n')
}

function overviewPage(locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? '矿物分类组' : 'Mineral Groups'
  const lede = isZh
    ? '天然宝石按化学成分与结构可分为多个族。以下是宝石学中最重要的八个组：'
    : 'Natural gems fall into distinct families by chemistry and crystal structure. The eight below are the most important in gemology:'
  const rows = groups.map(g =>
    `| [${isZh ? g.name_zh : g.name_en}](${g.id}) | ${isZh ? g.formula_class : g.formula_class_en} |`
  ).join('\n')

  return [
    '---',
    `title: ${title}`,
    '---',
    '',
    `# ${title}`,
    '',
    lede,
    '',
    isZh ? '## 八个主要组' : '## Eight Major Groups',
    '',
    isZh ? '| 组 | 化学式类型 |' : '| Group | Formula Class |',
    '|---|---|',
    rows,
    '',
    isZh ? '*参见[分类总览](../classification/intro)了解矿物学分类框架。*'
         : '*See the [classification overview](../classification/intro) for the mineralogical framework.*',
  ].join('\n')
}

fs.mkdirSync(OUT_EN_DIR, { recursive: true })
fs.mkdirSync(OUT_ZH_DIR, { recursive: true })

let ok = 0
try {
  fs.writeFileSync(OUT_EN_INTRO, overviewPage('en'), 'utf8')
  fs.writeFileSync(OUT_ZH_INTRO, overviewPage('zh'), 'utf8')
  ok++
  console.log(`  ✓ intro → mineral-groups/{root,zh}/intro.md`)
} catch (e) {
  console.error(`  ✗ intro: ${(e as Error).message}`)
}

for (const g of groups) {
  try {
    fs.writeFileSync(path.join(OUT_EN_DIR, `${g.id}.md`), detailPage(g, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH_DIR, `${g.id}.md`), detailPage(g, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${g.id} → mineral-groups/{root,zh}/${g.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${g.id}: ${(e as Error).message}`)
  }
}

console.log(`\nGenerated ${ok}/${1 + groups.length} mineral-group pages`)
process.exit(ok === 1 + groups.length ? 0 : 1)