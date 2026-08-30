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

const LEGENDARY_STONES = [
  {
    image: 'images/gallery/legendary/hope-diamond.jpg',
    nameEN: 'Hope Diamond',
    nameZH: 'Hope 蓝钻',
    detailEN: '45.52 ct · blue diamond',
    detailZH: '45.52 ct · 蓝钻',
    noteEN: 'Smithsonian display; ex-French Blue',
    noteZH: '史密森尼展柜 · 法国王室蓝钻前身',
    source: 'https://commons.wikimedia.org/wiki/File:Hope_Diamond_Smithsonian.jpg',
  },
  {
    image: 'images/gallery/legendary/koh-i-noor.jpg',
    nameEN: 'Koh-i-Noor',
    nameZH: 'Koh-i-Noor 光之山',
    detailEN: '105.6 ct · historical diamond',
    detailZH: '105.6 ct · 历史钻石',
    noteEN: 'Historical illustration; original setting',
    noteZH: '历史插图 · 原始镶嵌状态',
    source: 'https://commons.wikimedia.org/wiki/File:Kohinoor.jpg',
  },
  {
    image: 'images/gallery/legendary/cullinan-i.jpg',
    nameEN: 'Cullinan I',
    nameZH: 'Cullinan I 非洲之星',
    detailEN: '530.2 ct · D-colour diamond',
    detailZH: '530.2 ct · D 色钻石',
    noteEN: "The Great Star of Africa; Sovereign's Sceptre",
    noteZH: '非洲之星 · 英王权杖',
    source: 'https://commons.wikimedia.org/wiki/File:Cullinan_Diamond_and_some_of_its_cuts_-_copy.jpg',
  },
  {
    image: 'images/gallery/legendary/regent-diamond.jpg',
    nameEN: 'Regent Diamond',
    nameZH: 'Regent 钻石',
    detailEN: '140.6 ct · historic diamond',
    detailZH: '140.6 ct · 历史钻石',
    noteEN: "Louis XV's crown; Louvre collection",
    noteZH: '路易十五王冠 · 卢浮宫馆藏',
    source: 'https://commons.wikimedia.org/wiki/File:Diamant_le_R%C3%A9gent_%28Louvre%29.jpg',
  },
  {
    image: 'images/gallery/legendary/star-of-india.jpg',
    nameEN: 'Star of India',
    nameZH: 'Star of India 印度之星',
    detailEN: '563 ct · star sapphire',
    detailZH: '563 ct · 星光蓝宝石',
    noteEN: 'American Museum of Natural History',
    noteZH: '美国自然史博物馆馆藏',
    source: 'https://commons.wikimedia.org/wiki/File:Star_Of_India_Gem2.jpg',
  },
] as const

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

function mdLegendaryArchive(locale: 'en' | 'zh'): string[] {
  const isZh = locale === 'zh'
  const imagePrefix = isZh ? '../../' : '../'
  const creditsLink = isZh ? '../../image-credits' : '../image-credits'
  const title = isZh ? '## 图像档案' : '## Visual Archive'
  const intro = isZh
    ? `下列图片对应本页列出的五件传奇宝石；图片均已本地收录，来源与授权见[图片署名页](${creditsLink})。`
    : `The five local images below correspond to the stones listed on this page. See the [image credits](${creditsLink}) page for source and reuse details.`
  const cards = LEGENDARY_STONES.map(stone => {
    const name = isZh ? stone.nameZH : stone.nameEN
    const detail = isZh ? stone.detailZH : stone.detailEN
    const note = isZh ? stone.noteZH : stone.noteEN
    const sourceLabel = isZh ? '查看原始文件页' : 'View source file'
    return [
      '<article class="maison-work-card">',
      `  <a class="maison-work-card__media" href="${stone.source}" target="_blank" rel="noreferrer">`,
      `    <img src="${imagePrefix}${stone.image}" alt="${name}" loading="lazy" />`,
      '  </a>',
      '  <div class="maison-work-card__body">',
      `    <div class="maison-work-card__eyebrow"><span>${detail}</span></div>`,
      `    <h3>${name}</h3>`,
      `    <p>${note}</p>`,
      `    <p class="maison-work-card__source"><a href="${stone.source}" target="_blank" rel="noreferrer">${sourceLabel}</a></p>`,
      '  </div>',
      '</article>',
    ].join('\n')
  })
  return [title, '', intro, '', '<div class="maison-work-grid legendary-stones-grid">', cards.join('\n'), '</div>']
}

function detailPage(topic: ReturnType<typeof TopicFile.parse>['topics'][number], cfg: ModuleConfig, locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? topic.name_zh : topic.name_en
  const summary = isZh ? topic.summary_zh : topic.summary_en
  const principles = isZh ? topic.principles_zh : topic.principles_en
  const mermaid = isZh ? topic.mermaid_zh : topic.mermaid_en
  const steps = isZh ? topic.steps_zh : topic.steps_en
  const principlesTitle = isZh ? '## 核心要点' : '## Core Principles'
  const overviewTitle = isZh ? '## 概述' : '## Overview'
  const examplesTitle = isZh ? '## 示例' : '## Examples'
  const diagramTitle = isZh ? '## 判别流程' : '## Decision Tree'
  const stepsTitle = isZh ? '## 鉴定步骤' : '## Identification Steps'
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
    ...(steps ? [stepsTitle, '', steps, ''] : []),
    ...(mermaid ? [diagramTitle, '', `<div v-pre><pre class="mermaid">\n${mermaid}\n</pre></div>`, ''] : []),
    principlesTitle,
    '',
    mdList(principles),
    '',
    ...(cfg.id === 'gallery' && topic.id === 'legendary-stones' ? [...mdLegendaryArchive(locale), ''] : []),
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
