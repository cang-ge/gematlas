/**
 * generate-gem-pages — read data/gems/v1/*.yaml, output docs/{en,zh}/gems/{id}.md
 *
 * ponytail: single file, no template engine, reuse existing schema.
 * Run: pnpm exec tsx scripts/build/generate-gem-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { GemSchema, CrystalSystemsFile } from './schema'

const GEM_DIR = 'data/gems/v1'
const OUT_EN   = 'docs/gems'
const OUT_ZH   = 'docs/zh/gems'

/* ─── Template helpers ─────────────────────────────────────── */

type Locale = 'en' | 'zh'
type ParsedGem = ReturnType<typeof GemSchema.parse>

function valOrDash(x: unknown): string {
  return x == null || x === '' ? '—' : String(x)
}

function html(x: unknown): string {
  return valOrDash(x)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function bi(v: { zh?: string; en?: string }, locale: Locale): string {
  return valOrDash(locale === 'en' ? v.en : v.zh)
}

function list(items: string[], locale: Locale): string {
  return items.length ? items.map(html).join(locale === 'zh' ? '、' : ', ') : '—'
}

const CRYSTAL_SYSTEM_NAMES: Record<string, { zh: string; en: string }> = {
  cubic: { zh: '立方晶系', en: 'Cubic' },
  tetragonal: { zh: '四方晶系', en: 'Tetragonal' },
  orthorhombic: { zh: '斜方晶系', en: 'Orthorhombic' },
  hexagonal: { zh: '六方晶系', en: 'Hexagonal' },
  trigonal: { zh: '三方晶系', en: 'Trigonal' },
  monoclinic: { zh: '单斜晶系', en: 'Monoclinic' },
  triclinic: { zh: '三斜晶系', en: 'Triclinic' },
  amorphous: { zh: '非晶质', en: 'Amorphous' },
}

const PLEOCHROISM_NAMES: Record<string, { zh: string; en: string }> = {
  none: { zh: '无', en: 'None' },
  weak: { zh: '弱', en: 'Weak' },
  moderate: { zh: '中等', en: 'Moderate' },
  strong: { zh: '强', en: 'Strong' },
}

const TREATMENT_NAMES: Record<string, { zh: string; en: string }> = {
  'high-pressure-high-temperature': { zh: '高温高压处理（HPHT）', en: 'High pressure–high temperature (HPHT)' },
  'heat-treatment': { zh: '热处理', en: 'Heat treatment' },
  heating: { zh: '加热', en: 'Heating' },
  'sugar-acid-treatment': { zh: '糖酸处理', en: 'Sugar-acid treatment' },
  'cedar-oil-filling': { zh: '雪松油充填', en: 'Cedar-oil filling' },
  'wax-impregnation': { zh: '蜡浸渍', en: 'Wax impregnation' },
  'polymer-impregnation': { zh: '聚合物充填', en: 'Polymer impregnation' },
  dyeing: { zh: '染色', en: 'Dyeing' },
  waxing: { zh: '上蜡', en: 'Waxing' },
  irradiation: { zh: '辐照', en: 'Irradiation' },
  'surface-coating': { zh: '表面涂层', en: 'Surface coating' },
  bleaching: { zh: '漂白', en: 'Bleaching' },
  stabilisation: { zh: '稳定化处理', en: 'Stabilisation' },
}

function crystalName(id: string, locale: Locale): string {
  return CRYSTAL_SYSTEM_NAMES[id]?.[locale] || id
}

function pleochroismName(value: string | undefined, locale: Locale): string {
  return value && PLEOCHROISM_NAMES[value]?.[locale] ? PLEOCHROISM_NAMES[value][locale] : '—'
}

function treatmentName(value: string, locale: Locale): string {
  return TREATMENT_NAMES[value]?.[locale] || value
}

function table(header: [string, string], rowsItems: [string, string][]): string {
  return `<table class="gem-detail__table">
  <thead><tr><th scope="col">${html(header[0])}</th><th scope="col">${html(header[1])}</th></tr></thead>
  <tbody>${rowsItems.map(([k, v]) => `<tr><th scope="row">${html(k)}</th><td>${html(v)}</td></tr>`).join('')}</tbody>
</table>`
}

function mdFrontmatter(id: string, name: string): string {
  return `---
title: ${name}
gem: ${id}
---
`
}

function mdCategory(gem: ParsedGem, locale: Locale): string {
  if (locale === 'en') {
    return table(['Property', 'Value'], [
      ['Mineral Family', gem.category.mineral_en],
      ['Formula', gem.category.chemical_formula],
      ['Crystal System', crystalName(gem.category.crystal_system, locale)],
    ])
  }
  return table(['属性', '值'], [
    ['矿物族', gem.category.mineral_zh],
    ['化学式', gem.category.chemical_formula],
    ['晶系', crystalName(gem.category.crystal_system, locale)],
  ])
}

function mdPhysical(gem: ParsedGem, locale: Locale): string {
  const p = gem.physical
  if (locale === 'en') {
    return table(['Property', 'Value'], [
      ['Mohs Hardness', String(p.hardness_mohs) + (p.hardness_note_en ? ` (${p.hardness_note_en})` : '')],
      ['Specific Gravity', String(p.specific_gravity)],
      ['Refractive Index', p.refractive_index],
    ])
  }
  return table(['属性', '值'], [
    ['莫氏硬度', String(p.hardness_mohs) + (p.hardness_note_zh ? `（${p.hardness_note_zh}）` : '')],
    ['比重', String(p.specific_gravity)],
    ['折射率', p.refractive_index],
  ])
}

function mdOptical(gem: ParsedGem, locale: Locale): string {
  const o = gem.optical
  const colors = o.typical_colors?.map(c => bi(c, locale)).join(locale === 'zh' ? '、' : ', ') || '—'
  if (locale === 'en') {
    return table(['Property', 'Value'], [
      ['Pleochroism', pleochroismName(o.pleochroism, locale)],
      ['Typical Colors', colors],
      ['Color Cause', o.color_causes_en],
    ])
  }
  return table(['属性', '值'], [
    ['多色性', pleochroismName(o.pleochroism, locale)],
    ['典型颜色', colors],
    ['致色原因', o.color_causes_zh],
  ])
}

function mdTreatments(gem: ParsedGem, locale: Locale): string {
  const t = gem.treatments
  const methods = t.common?.length
    ? t.common.map(method => treatmentName(method, locale))
    : [locale === 'en' ? 'None / typically untreated' : '无 / 通常无处理']
  const labels = locale === 'en'
    ? { methods: 'Common methods', disclosure: 'Disclosure required', yes: 'Yes', no: 'No', note: 'Note' }
    : { methods: '常见处理', disclosure: '需要披露', yes: '是', no: '否', note: '说明' }
  return `<div class="gem-detail__treatment">
  <div class="gem-detail__treatment-row"><span>${labels.methods}</span><strong>${list(methods, locale)}</strong></div>
  <div class="gem-detail__treatment-row"><span>${labels.disclosure}</span><strong class="${t.disclosure_required ? 'is-required' : ''}">${t.disclosure_required ? labels.yes : labels.no}</strong></div>
  <p class="gem-detail__treatment-note"><span>${labels.note}</span>${html(locale === 'en' ? t.note_en : t.note_zh)}</p>
</div>`
}

function mdOrigin(gem: ParsedGem, locale: Locale): string {
  if (!gem.origin || gem.origin.length === 0) return ''
  const label = locale === 'en' ? 'Recorded localities' : '记录产地'
  return `<div class="gem-detail__origins"><span>${label}</span><ul>${gem.origin.map(o => `<li>${html(locale === 'en' ? o.en : o.zh)}</li>`).join('')}</ul></div>`
}

function mdHistory(gem: ParsedGem, locale: Locale): string {
  const text = locale === 'en' ? gem.history_en : gem.history_zh
  if (!text) return ''
  return `<div class="gem-detail__prose">${html(text).replace(/\n/g, '<br />')}</div>`
}

function hero(gem: ParsedGem, locale: Locale, position: number): string {
  const name = locale === 'en' ? gem.names.en : gem.names.zh
  const otherName = locale === 'en' ? gem.names.zh : gem.names.en
  const imgRel = locale === 'en' ? `../images/gems/${gem.id}` : `../../images/gems/${gem.id}`
  const image = gem.images?.main
    ? `<figure class="gem-detail__hero-media"><img src="${imgRel}/${html(gem.images.main)}" alt="${html(name)}" loading="eager" decoding="async"><figcaption><span>${locale === 'en' ? 'Primary view' : '主视图'}</span><span>${locale === 'en' ? 'Visual identification' : '视觉识别'}</span></figcaption></figure>`
    : `<div class="gem-detail__hero-media gem-detail__hero-media--empty"><span>${locale === 'en' ? 'Image pending' : '图片待补充'}</span></div>`
  const labels = locale === 'en'
    ? { atlas: 'GEM ATLAS', mineral: 'Mineral identity', formula: 'Formula', crystal: 'Crystal system', hardness: 'Mohs', sg: 'Specific gravity', ri: 'Refractive index', switcher: '中文' }
    : { atlas: 'GEM ATLAS', mineral: '矿物身份', formula: '化学式', crystal: '晶系', hardness: '硬度', sg: '比重', ri: '折射率', switcher: 'English' }
  const identityClass = locale === 'zh' && name.length <= 4 ? ' gem-detail__identity--compact-name' : ''

  return `<div class="gem-detail__hero" aria-labelledby="gem-detail-title-${html(gem.id)}">
  <div class="gem-detail__identity${identityClass}">
    <p class="gem-detail__eyebrow">${labels.atlas} / ${String(position).padStart(2, '0')}</p>
    <h1 id="gem-detail-title-${html(gem.id)}">${html(name)}<span>${html(otherName)}</span></h1>
    <p class="gem-detail__species"><span>${labels.mineral}</span>${html(locale === 'en' ? gem.category.mineral_en : gem.category.mineral_zh)}</p>
    <dl class="gem-detail__identity-facts">
      <div><dt>${labels.formula}</dt><dd>${html(gem.category.chemical_formula)}</dd></div>
      <div><dt>${labels.crystal}</dt><dd>${html(crystalName(gem.category.crystal_system, locale))}</dd></div>
    </dl>
    <dl class="gem-detail__quick-facts">
      <div><dt>${labels.hardness}</dt><dd>${html(gem.physical.hardness_mohs)}</dd></div>
      <div><dt>${labels.sg}</dt><dd>${html(gem.physical.specific_gravity)}</dd></div>
      <div><dt>${labels.ri}</dt><dd>${html(gem.physical.refractive_index)}</dd></div>
    </dl>
    <a class="gem-detail__language" href="${locale === 'en' ? `../zh/gems/${gem.id}.html` : `../../gems/${gem.id}.html`}" hreflang="${locale === 'en' ? 'zh-CN' : 'en'}">${labels.switcher}: ${html(otherName)} <span aria-hidden="true">↗</span></a>
  </div>
  ${image}
</div>`
}

function pageBody(gem: ParsedGem, locale: Locale, allGems: ParsedGem[]): string {
  const name = locale === 'en' ? gem.names.en : gem.names.zh
  const index = allGems.findIndex(item => item.id === gem.id)
  const previous = index > 0 ? allGems[index - 1] : undefined
  const next = index >= 0 && index < allGems.length - 1 ? allGems[index + 1] : undefined
  const categoryTitle = locale === 'en' ? 'Classification' : '分类'
  const physicalTitle = locale === 'en' ? 'Physical Properties' : '物理性质'
  const opticalTitle = locale === 'en' ? 'Optical Properties' : '光学性质'
  const treatmentTitle = locale === 'en' ? 'Treatments & Disclosure' : '处理与披露'
  const originTitle = locale === 'en' ? 'Origin' : '主要产地'
  const historyTitle = locale === 'en' ? 'History & Lore' : '历史与传说'
  const galleryTitle = locale === 'en' ? 'Image Evidence' : '图像证据'
  const imgRel = locale === 'en' ? `../images/gems/${gem.id}` : `../../images/gems/${gem.id}`

  const lines: string[] = [
    mdFrontmatter(gem.id, name),
    '',
    `<div class="gem-detail__breadcrumb"><a href="./">${locale === 'en' ? 'Gemstone Index' : '宝石名录'}</a><span aria-hidden="true">/</span><span>${html(name)}</span></div>`,
    hero(gem, locale, index + 1),
    '',
    `## ${categoryTitle}`,
    '',
    `<p class="gem-detail__section-kicker">${locale === 'en' ? 'IDENTITY / SPECIES RECORD' : '身份 / 宝石档案'}</p>`,
    mdCategory(gem, locale),
    '',
    `## ${physicalTitle}`,
    '',
    mdPhysical(gem, locale),
    '',
    `## ${opticalTitle}`,
    '',
    mdOptical(gem, locale),
    '',
    `## ${treatmentTitle}`,
    '',
    mdTreatments(gem, locale),
    '',
  ]

  if (gem.origin?.length) {
    lines.push(`## ${originTitle}`, '', mdOrigin(gem, locale), '')
  }
  if (gem.history_zh || gem.history_en) {
    lines.push(`## ${historyTitle}`, '', mdHistory(gem, locale), '')
  }
  if (gem.images?.gallery && gem.images.gallery.length > 0) {
    lines.push(
      `## ${galleryTitle}`,
      '',
      `<div class="gem-detail__gallery" aria-label="${locale === 'en' ? 'Image evidence gallery' : '图像证据画廊'}">`,
      ...gem.images.gallery.map((file, galleryIndex) => `<figure><img src="${imgRel}/${html(file)}" alt="${html(name)}" loading="lazy" decoding="async"><figcaption>${locale === 'en' ? 'Evidence' : '证据'} ${String(galleryIndex + 1).padStart(2, '0')}</figcaption></figure>`),
      '</div>',
      '',
    )
  }

  const gemLink = (item: ParsedGem) => `./${item.id}.html`
  const pagerText = locale === 'en'
    ? { previous: 'Previous', next: 'Next', index: 'Return to index', all: 'All species', ariaIndex: 'Return to gemstone index', continue: 'CONTINUE EXPLORING', continueAlt: '继续阅读' }
    : { previous: '上一颗', next: '下一颗', index: '返回名录', all: '全部宝石', ariaIndex: '返回宝石名录', continue: '继续阅读', continueAlt: 'CONTINUE EXPLORING' }
  const previousName = previous ? (locale === 'en' ? previous.names.en : previous.names.zh) : ''
  const previousAltName = previous ? (locale === 'en' ? previous.names.zh : previous.names.en) : ''
  const nextName = next ? (locale === 'en' ? next.names.en : next.names.zh) : ''
  const nextAltName = next ? (locale === 'en' ? next.names.zh : next.names.en) : ''
  const previousLink = previous
    ? `<a class="gem-detail__pager-link gem-detail__pager-link--previous" href="${gemLink(previous)}" aria-label="${html(`${pagerText.previous} ${previousName}`)}"><i aria-hidden="true">←</i><span>${pagerText.previous}</span><strong>${html(previousName)}</strong><small>${html(previousAltName)}</small></a>`
    : '<span class="gem-detail__pager-placeholder" aria-hidden="true"></span>'
  const nextLink = next
    ? `<a class="gem-detail__pager-link gem-detail__pager-link--next" href="${gemLink(next)}" aria-label="${html(`${pagerText.next} ${nextName}`)}"><span>${pagerText.next}</span><strong>${html(nextName)}</strong><small>${html(nextAltName)}</small><i aria-hidden="true">→</i></a>`
    : '<span class="gem-detail__pager-placeholder" aria-hidden="true"></span>'
  lines.push(
    `<div class="gem-detail__pager-shell">`,
    `<p class="gem-detail__pager-heading"><span>${pagerText.continue}</span><i aria-hidden="true">/</i><small>${pagerText.continueAlt}</small></p>`,
    `<nav class="gem-detail__pager" aria-label="${locale === 'en' ? 'Gemstone record navigation' : '宝石记录导航'}">`,
    previousLink,
    `<a class="gem-detail__pager-index" href="./" aria-label="${pagerText.ariaIndex}"><span>${pagerText.index}</span><strong>${String(index + 1).padStart(2, '0')} / ${allGems.length}</strong><small>${pagerText.all}</small></a>`,
    nextLink,
    '</nav>',
    '</div>',
  )

  return lines.join('\n')
}

/* ─── Main ──────────────────────────────────────────────────── */

const gemFiles = fs.existsSync(GEM_DIR) ? fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml')) : []
const parsedGems: ParsedGem[] = []
if (gemFiles.length === 0) {
  console.error(`  ✗ no YAML files found in ${GEM_DIR}`)
}
for (const file of gemFiles) {
  try {
    const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
    const gem = GemSchema.parse(raw)
    parsedGems.push(gem)
  } catch (e) {
    console.error(`  ✗ ${file}: ${(e as Error).message}`)
  }
}

parsedGems.sort((a, b) => a.names.en.localeCompare(b.names.en))
let ok = 0
for (const gem of parsedGems) {
  // ponytail: mkdirSync every time = idempotent, no check needed
  fs.mkdirSync(OUT_EN, { recursive: true })
  fs.mkdirSync(OUT_ZH, { recursive: true })
  fs.writeFileSync(path.join(OUT_EN, `${gem.id}.md`), pageBody(gem, 'en', parsedGems), 'utf8')
  fs.writeFileSync(path.join(OUT_ZH, `${gem.id}.md`), pageBody(gem, 'zh', parsedGems), 'utf8')
  ok++
  console.log(`  ✓ ${gem.id} → gems/{root,zh}/${gem.id}.md`)
}

/* ─── Crystal system pages ────────────────────────────────── */

/** Load crystal systems from shared YAML with Zod validation. */
function loadCrystalSystems() {
  const raw = yaml.load(fs.readFileSync('data/shared/crystal-systems.yaml', 'utf8'))
  const parsed = CrystalSystemsFile.parse(raw)
  return parsed.systems
}

function crystalPage(sys: ReturnType<typeof loadCrystalSystems>[number], locale: 'en' | 'zh'): string {
  const name = locale === 'en' ? sys.name_en : sys.name_zh
  const description = locale === 'en' ? sys.description_en : sys.description_zh
  const habit = locale === 'en' ? sys.habit_en : sys.habit_zh
  const isZh = locale === 'zh'

  // Helper: convert YAML string to "—" placeholder when missing
  const v = (x?: string) => x || '—'

  const headerLabels = isZh
    ? ['属性', '值']
    : ['Property', 'Value']

  const labels: Array<[string, string]> = isZh
    ? [
        ['晶轴',           sys.axial_lengths || '—'],
        ['夹角',           sys.angles || '—'],
        ['对称性等级',      v(sys.symmetry)],
        ['光学分类',        sys.optical_class || '—'],
        ['光性',           sys.optic_sign || '—'],
        ['双折射率范围',    sys.birefringence || '—'],
        ['解理',           sys.cleavage || '—'],
        ['常见晶形',        habit || '—'],
      ]
    : [
        ['Axial lengths',   sys.axial_lengths || '—'],
        ['Interaxial angles', sys.angles || '—'],
        ['Symmetry tier',   v(sys.symmetry)],
        ['Optical class',   sys.optical_class || '—'],
        ['Optic sign',      sys.optic_sign || '—'],
        ['Birefringence',   sys.birefringence || '—'],
        ['Cleavage',        sys.cleavage || '—'],
        ['Habit',           habit || '—'],
      ]

  const headerRow = `| ${headerLabels[0]} | ${headerLabels[1]} |`
  const separatorRow = '|---|---|'
  const paramRows = labels.map(([k, vv]) => `| ${k} | ${vv} |`).join('\n')

  // Notable gems table (skip if not provided)
  const gemsTable = sys.notable_gems && sys.notable_gems.length > 0
    ? (() => {
        if (isZh) {
          return [
            '## 主要宝石',
            '',
            '| 宝石 | 折射率 | 比重 |',
            '|---|---|---|',
            ...sys.notable_gems.map(g => `| ${g.name} | ${g.ri} | ${g.sg} |`),
            '',
          ].join('\n')
        }
        return [
          '## Notable Gem Species',
          '',
          '| Gem | Refractive Index | Specific Gravity |',
          '|---|---|---|',
          ...sys.notable_gems.map(g => `| ${g.name} | ${g.ri} | ${g.sg} |`),
          '',
        ].join('\n')
      })()
    : ''

  const overviewHeading = isZh ? '## 概述' : '## Overview'
  const paramsHeading = isZh ? '## 晶体学参数' : '## Crystallographic Parameters'
  const backRef = isZh ? '*详见[分类总览](../intro)。*' : '*See the [classification overview](../intro) for all crystal systems.*'

  return `---
title: ${name}
crystalSystem: ${sys.id}
---

# ${name}

${overviewHeading}

${description || ''}

${paramsHeading}

${headerRow}
${separatorRow}
${paramRows}

${gemsTable}${backRef}
`
}

const CRYSTAL_EN = 'docs/classification/crystal-systems'
const CRYSTAL_ZH = 'docs/zh/classification/crystal-systems'
const allSystems = loadCrystalSystems()
let csOk = 0
try {
  for (const sys of allSystems) {
    fs.mkdirSync(CRYSTAL_EN, { recursive: true })
    fs.mkdirSync(CRYSTAL_ZH, { recursive: true })
    fs.writeFileSync(path.join(CRYSTAL_EN, `${sys.id}.md`), crystalPage(sys, 'en'), 'utf8')
    fs.writeFileSync(path.join(CRYSTAL_ZH, `${sys.id}.md`), crystalPage(sys, 'zh'), 'utf8')
    csOk++
    console.log(`  ✓ ${sys.id} → crystal-systems/{root,zh}/${sys.id}.md`)
  }
} catch (e) {
  console.error(`  ✗ crystal-systems: ${(e as Error).message}`)
}

const gemOk = ok === gemFiles.length
const csOkFlag = csOk === allSystems.length
console.log(`\nGenerated ${ok}/${gemFiles.length} gem pages + ${csOk}/${allSystems.length} crystal system pages`)
process.exit(gemOk && csOkFlag ? 0 : 1)
