/**
 * generate-comparison-data — project the validated gem records into a
 * browser-safe module for the comparison page.
 *
 * Source of truth: data/gems/v1/*.yaml
 * Contract: every record is parsed by GemSchema before it reaches the UI.
 * Run: pnpm exec tsx scripts/build/generate-comparison-data.ts
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { GemSchema } from './schema'

const GEM_DIR = path.resolve('data/gems/v1')
const OUT_FILE = path.resolve('docs/.vitepress/theme/data/gem-comparison.generated.ts')

type ParsedGem = ReturnType<typeof GemSchema.parse>

function readGems(): ParsedGem[] {
  const files = fs.readdirSync(GEM_DIR).filter(file => file.endsWith('.yaml')).sort()
  const gems = files.map(file => {
    const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
    return GemSchema.parse(raw)
  })

  return gems.sort((a, b) => a.names.en.localeCompare(b.names.en))
}

function projectGem(gem: ParsedGem) {
  return {
    id: gem.id,
    names: gem.names,
    category: gem.category,
    physical: {
      hardness_mohs: gem.physical.hardness_mohs,
      specific_gravity: gem.physical.specific_gravity,
      refractive_index: gem.physical.refractive_index,
    },
    optical: {
      pleochroism: gem.optical.pleochroism,
      typical_colors: gem.optical.typical_colors,
    },
  }
}

const records = readGems().map(projectGem)
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
const body = [
  '/* This file is generated. Edit data/gems/v1/*.yaml, then regenerate. */',
  '',
  'export type GemComparisonRecord = {',
  '  id: string',
  '  names: { zh: string; en: string }',
  '  category: {',
  '    mineral_zh: string',
  '    mineral_en: string',
  '    chemical_formula: string',
  '    crystal_system: string',
  '  }',
  '  physical: {',
  '    hardness_mohs: number',
  '    specific_gravity: number',
  '    refractive_index: string',
  '  }',
  '  optical: {',
  '    pleochroism?: \'none\' | \'weak\' | \'moderate\' | \'strong\'',
  '    typical_colors: Array<{ zh?: string; en?: string }>',
  '  }',
  '}',
  '',
  `export const GEM_COMPARISON_DATA: GemComparisonRecord[] = ${JSON.stringify(records, null, 2)}`,
  '',
  'export const GEM_COMPARISON_BY_ID: Record<string, GemComparisonRecord> = Object.fromEntries(',
  '  GEM_COMPARISON_DATA.map(gem => [gem.id, gem]),',
  ')',
  '',
].join('\n')

fs.writeFileSync(OUT_FILE, body, 'utf8')
console.log(`Generated comparison data for ${records.length} gems → ${path.relative(process.cwd(), OUT_FILE)}`)
