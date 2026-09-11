/**
 * Generate the maison archive pages from data/shared/maison-works.yaml.
 *
 * The archive intentionally keeps one bounded, editorial page instead of
 * creating 21 thin detail pages. Every work is bundled with a locally stored,
 * source-traceable image; the build rejects missing image records.
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { MaisonWorksFile } from './schema'

const DATA_FILE = 'data/shared/maison-works.yaml'
const DOCS_DIR = 'docs'

const HOUSES = [
  { id: 'cartier', name: 'Cartier', founded: '1847', focus: 'carved colour · panther · Art Deco', focusZh: '雕刻彩宝 · 猎豹 · 装饰艺术' },
  { id: 'vca', name: 'Van Cleef & Arpels', founded: '1906', focus: 'Mystery Set · nature · movement', focusZh: '隐密式镶嵌 · 自然 · 活动结构' },
  { id: 'boucheron', name: 'Boucheron', founded: '1858', focus: 'open structure · fauna · colour', focusZh: '开放结构 · 动物 · 色彩' },
  { id: 'tiffany', name: 'Tiffany & Co.', founded: '1837', focus: 'light · proportion · blue book', focusZh: '进光 · 比例 · Blue Book' },
  { id: 'harry-winston', name: 'Harry Winston', founded: '1932', focus: 'diamond · cluster · scale', focusZh: '钻石 · 锦簇 · 尺度' },
  { id: 'graff', name: 'Graff', founded: '1960', focus: 'exceptional stones · provenance', focusZh: '稀有宝石 · 溯源叙事' },
  { id: 'chaumet', name: 'Chaumet', founded: '1780', focus: 'tiara · history · geometry', focusZh: '皇冠 · 历史 · 几何' },
] as const

const ROLE_LABELS = {
  en: { heritage: 'Heritage piece', craft: 'Signature craft', 'gem-focus': 'Gemstone focus' },
  zh: { heritage: '历史代表作', craft: '招牌工艺作', 'gem-focus': '宝石主角作' },
} as const

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function imageSrc(image: string, locale: 'en' | 'zh'): string {
  return `${locale === 'zh' ? '../../' : '../'}${image}`
}

function renderCard(work: ReturnType<typeof MaisonWorksFile.parse>['works'][number], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? work.name_zh : work.name_en
  const role = ROLE_LABELS[locale][work.type]
  const craft = isZh ? (work.craft_zh || work.craft) : work.craft
  const style = isZh ? (work.style_zh || work.style) : work.style
  const summary = isZh ? work.summary_zh : work.summary_en
  const archiveRelation = isZh ? work.archive_relation_zh : work.archive_relation_en
  const gems = work.gems.join(' · ')
  const sourceText = isZh ? '查看资料来源 ↗' : 'Open source ↗'
  const image = `<a class="maison-work-card__media" href="${escapeHtml(work.image_source_url || work.source_url)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(imageSrc(work.image, locale))}" alt="${escapeHtml(title)}" loading="lazy"></a>`
  const relation = archiveRelation
    ? `    <p class="maison-work-card__relation"><strong>${isZh ? '档案关系' : 'Archive relation'}</strong>${escapeHtml(archiveRelation)}</p>`
    : ''

  return `<article class="maison-work-card">
  ${image}
  <div class="maison-work-card__body">
    <div class="maison-work-card__eyebrow"><span>${escapeHtml(role)}</span><time>${escapeHtml(work.year)}</time></div>
    <h3>${escapeHtml(title)}</h3>
    <dl class="maison-work-card__facts">
      <div><dt>${isZh ? '宝石' : 'Gems'}</dt><dd>${escapeHtml(gems)}</dd></div>
      <div><dt>${isZh ? '工艺' : 'Craft'}</dt><dd>${escapeHtml(craft)}</dd></div>
      <div><dt>${isZh ? '风格' : 'Style'}</dt><dd>${escapeHtml(style)}</dd></div>
    </dl>
    <p>${escapeHtml(summary)}</p>
${relation}
    <a class="maison-work-card__source" href="${escapeHtml(work.source_url)}" target="_blank" rel="noreferrer">${sourceText}</a>
  </div>
</article>`
}

function renderPage(works: ReturnType<typeof MaisonWorksFile.parse>['works'], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? '顶级珠宝工坊' : 'The Maison Archive'
  const lead = isZh
    ? '首期以七家传奇工坊为线索，每家选取三条作品档案：一条看传承、一条看工艺、一条看宝石。相关卡片可能指向同一对象的不同状态或观察角度；所有图像均记录可追溯的来源与授权信息。'
    : 'A first-edition archive of seven legendary maisons. Each house is represented by three object records: one for heritage, one for signature craft, and one for the gemstone itself. Related cards may describe the same object from different states or viewpoints; every bundled image has a traceable source and recorded reuse terms.'
  const guide = isZh
    ? '按工坊浏览 21 条档案。点击图片可打开原始文件页，查看作者、机构与授权信息；看到“档案关系”时，请将它理解为同一对象的关联记录，而非自动新增一件作品。'
    : 'Browse 21 object records by maison. Open any image to inspect its original file page, author, institution, and reuse terms; an “Archive relation” note marks a related view, not automatically a separate work.'
  const roleLegend = isZh ? '选品规则：历史代表作 · 招牌工艺作 · 宝石主角作' : 'Selection rule: heritage · signature craft · gemstone focus'
  const nav = HOUSES.map(h => `<a href="#${h.id}">${h.name}</a>`).join('')
  const sections = HOUSES.map(h => {
    const houseWorks = works.filter(w => w.maison === ({
      cartier: 'Cartier', vca: 'Van Cleef & Arpels', boucheron: 'Boucheron', tiffany: 'Tiffany & Co.', 'harry-winston': 'Harry Winston', graff: 'Graff', chaumet: 'Chaumet',
    } as const)[h.id])
    return `<section class="maison-section" id="${h.id}">
  <header class="maison-section__header">
    <div><p class="maison-section__kicker">${isZh ? 'MAISON' : 'MAISON'} · ${h.founded}</p><h2>${h.name}</h2></div>
    <p>${isZh ? h.focusZh : h.focus}</p>
  </header>
  <div class="maison-work-grid">${houseWorks.map(w => renderCard(w, locale)).join('\n')}</div>
</section>`
  }).join('\n')

  return `---
title: ${title}
gallery: by-house
---

# ${title}

<div class="maison-archive-hero">
<p>${escapeHtml(lead)}</p>
<div class="maison-archive-hero__meta"><span>21 ${isZh ? '件作品' : 'works'}</span><span>7 ${isZh ? '家工坊' : 'maisons'}</span><span>${escapeHtml(roleLegend)}</span></div>
</div>

## ${isZh ? '按工坊浏览' : 'Browse by maison'}

<p class="maison-archive-guide">${escapeHtml(guide)}</p>
<nav class="maison-index" aria-label="${isZh ? '工坊索引' : 'Maison index'}">${nav}</nav>

${sections}

<div class="maison-archive-note">
<strong>${isZh ? '资料边界' : 'Editorial boundary'}</strong>
<p>${isZh ? '本页将对象/作品资料来源与图片授权来源分开记录。所有卡片均使用本地图片，授权信息集中维护在[图片署名页](../image-credits)；同一对象的关联档案会在卡片中明确标出。' : 'Object or work sources and image-rights sources are recorded separately. Every card uses a local image, with reuse details maintained on the [image credits page](../image-credits); related records for one object are labelled on the card.'}</p>
</div>

*${isZh ? '返回[画廊总览](intro)。' : 'Return to the [gallery overview](intro).'}*
`
}

const raw = yaml.load(fs.readFileSync(DATA_FILE, 'utf8'))
const parsed = MaisonWorksFile.parse(raw)

for (const [locale, directory] of [['en', 'docs/gallery'], ['zh', 'docs/zh/gallery']] as const) {
  const output = path.join(directory, 'by-house.md')
  fs.writeFileSync(output, renderPage(parsed.works, locale), 'utf8')
  console.log(`  ✓ ${output} (${parsed.works.length} works)`)
}

console.log('Maison archive generated: 7 maisons × 3 works')
