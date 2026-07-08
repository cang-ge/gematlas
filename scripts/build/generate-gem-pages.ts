/**
 * generate-gem-pages — read data/gems/v1/*.yaml, output docs/{en,zh}/gems/{id}.md
 *
 * ponytail: single file, no template engine, reuse existing schema.
 * Run: pnpm exec tsx scripts/build/generate-gem-pages.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { GemSchema } from './schema'

const GEM_DIR = 'data/gems/v1'
const OUT_EN   = 'docs/en/gems'
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
    `${locale === 'en' ? '中文' : 'English'}: [${otherName}](/${locale === 'en' ? 'zh' : 'en'}/gems/${gem.id})`,
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

let ok = 0
for (const file of fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))) {
  const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
  const gem = GemSchema.parse(raw)

  // ponytail: mkdirSync every time = idempotent, no check needed
  fs.mkdirSync(OUT_EN, { recursive: true })
  fs.mkdirSync(OUT_ZH, { recursive: true })
  fs.writeFileSync(path.join(OUT_EN, `${gem.id}.md`), pageBody(gem, 'en'), 'utf8')
  fs.writeFileSync(path.join(OUT_ZH, `${gem.id}.md`), pageBody(gem, 'zh'), 'utf8')
  ok++
  console.log(`  ✓ ${gem.id} → gems/{en,zh}/${gem.id}.md`)
}

console.log(`\nGenerated ${ok} gem pages (${ok * 2} files, en+zh)`)
process.exit(ok > 0 ? 0 : 1)
