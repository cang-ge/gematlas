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
// ponytail: no i18n helper import; inline ternary is clearer in <100 lines.

function valOrDash(x: unknown): string {
  return x == null || x === '' ? '—' : String(x)
}

/** Bilingual value getter — returns a plain string (never null). */
function bi(v: { zh?: string; en?: string }, locale: 'en' | 'zh'): string {
  return valOrDash(locale === 'en' ? v.en : v.zh)
}

/** Full-bleed property table rows for a given locale. */
function table(header: [string, string], rowsItems: [string, string][]): string {
  return `| ${header[0]} | ${header[1]} |
|---|---|\n` + rowsItems.map(([k, v]) => `| ${k} | ${v} |`).join('\n')
}

function mdFrontmatter(id: string, name: string): string {
  return `---
title: ${name}
gem: ${id}
---
`
}

function mdCategory(gem: ReturnType<typeof GemSchema.parse>, locale: 'en' | 'zh'): string {
  if (locale === 'en') {
    return table(['Property', 'Value'], [
      ['Mineral Family', gem.category.mineral_en],
      ['Formula', gem.category.chemical_formula],
      ['Crystal System', gem.category.crystal_system],
    ])
  }
  return table(['属性', '值'], [
    ['矿物族', gem.category.mineral_zh],
    ['化学式', gem.category.chemical_formula],
    ['晶系', gem.category.crystal_system],
  ])
}

function mdPhysical(gem: ReturnType<typeof GemSchema.parse>, locale: 'en' | 'zh'): string {
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

function mdOptical(gem: ReturnType<typeof GemSchema.parse>, locale: 'en' | 'zh'): string {
  const o = gem.optical
  const colors = o.typical_colors?.map(c => bi(c, locale)).join(', ') || '—'
  if (locale === 'en') {
    return table(['Property', 'Value'], [
      ['Pleochroism', valOrDash(o.pleochroism)],
      ['Typical Colors', colors],
      ['Color Cause', o.color_causes_en],
    ])
  }
  return table(['属性', '值'], [
    ['多色性', valOrDash(o.pleochroism)],
    ['典型颜色', colors],
    ['致色原因', o.color_causes_zh],
  ])
}

function mdTreatments(gem: ReturnType<typeof GemSchema.parse>, locale: 'en' | 'zh'): string {
  const t = gem.treatments
  const methods = t.common?.length ? t.common.join(', ') : (locale === 'en' ? 'None / Typically untreated' : '无 / 通常无处理')
  if (locale === 'en') {
    return `| Treatment | Details |
|-----------|---------|
| Common Methods | ${methods} |
| Disclosure Required | ${t.disclosure_required ? 'Yes' : 'No'} |
| Note | ${t.note_en || '—'} |`
  }
  return `| 处理方式 | 详情 |
|---------|------|
| 常见方法 | ${methods} |
| 需披露 | ${t.disclosure_required ? '是' : '否'} |
| 备注 | ${t.note_zh || '—'} |`
}

function pageBody(gem: ReturnType<typeof GemSchema.parse>, locale: 'en' | 'zh'): string {
  const name = locale === 'en' ? gem.names.en : gem.names.zh
  const otherName = locale === 'en' ? gem.names.zh : gem.names.en
  const lines: string[] = [
    mdFrontmatter(gem.id, name),
    '',

    `# ${name}`,
    '',

    `> ${locale === 'en' ? gem.category.mineral_en : gem.category.mineral_zh}`,
    '',

    '<!-- language switcher hint -->',
    `${locale === 'en' ? '中文' : 'English'}: [${otherName}](${locale === 'en' ? '/zh/gems/' : '/gems/'}${gem.id})`,
    '',

    '---',
    '',

    `## ${locale === 'en' ? 'Classification' : '分类'}`,
    '',
    mdCategory(gem, locale),
    '',

    `## ${locale === 'en' ? 'Physical Properties' : '物理性质'}`,
    '',
    mdPhysical(gem, locale),
    '',

    `## ${locale === 'en' ? 'Optical Properties' : '光学性质'}`,
    '',
    mdOptical(gem, locale),
    '',

    `## ${locale === 'en' ? 'Treatments & Disclosure' : '处理与披露'}`,
    '',
    mdTreatments(gem, locale),
    '',
  ]
  return lines.join('\n')
}

/* ─── Main ──────────────────────────────────────────────────── */

const allGems = fs.existsSync(GEM_DIR) ? fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml')) : []
let ok = 0
if (allGems.length === 0) {
  console.error(`  ✗ no YAML files found in ${GEM_DIR}`)
}
for (const file of allGems) {
  try {
    const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
    const gem = GemSchema.parse(raw)

    // ponytail: mkdirSync every time = idempotent, no check needed
    fs.mkdirSync(OUT_EN, { recursive: true })
    fs.mkdirSync(OUT_ZH, { recursive: true })
    fs.writeFileSync(path.join(OUT_EN, `${gem.id}.md`), pageBody(gem, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH, `${gem.id}.md`), pageBody(gem, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${gem.id} → gems/{root,zh}/${gem.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${file}: ${(e as Error).message}`)
  }
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

const gemOk = ok === allGems.length
const csOkFlag = csOk === allSystems.length
console.log(`\nGenerated ${ok}/${allGems.length} gem pages + ${csOk}/${allSystems.length} crystal system pages`)
process.exit(gemOk && csOkFlag ? 0 : 1)
