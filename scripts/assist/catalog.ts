import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import {
  CrystalSystemsFile,
  GemSchema,
  IdentificationTopicsFile,
  type Gem,
} from '../build/schema'
import type { EvidenceRecord, KnowledgeSnapshot } from './types'

const CONTENT_VERSION = 'gems-v1' as const

function flatten(value: unknown, prefix = ''): Array<[string, unknown]> {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return [[prefix, value]]
  if (typeof value !== 'object') return [[prefix, value]]

  const entries: Array<[string, unknown]> = []
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    entries.push(...flatten(child, prefix ? `${prefix}.${key}` : key))
  }
  return entries
}

function textOf(value: unknown): string {
  if (Array.isArray(value)) return value.map(textOf).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(textOf).join(' ')
  return String(value ?? '')
}

function addRecord(
  records: Map<string, EvidenceRecord>,
  gemId: string,
  fieldPath: string,
  value: unknown,
  pageUrl: string,
  supports: string[] = [],
): void {
  const sourceRef = `source:${gemId}:${fieldPath}`
  records.set(sourceRef, {
    gemId,
    fieldPath,
    pageUrl,
    sourceRef,
    contentVersion: CONTENT_VERSION,
    value,
    searchableText: textOf(value),
    supports,
  })
}

function addGemRecords(records: Map<string, EvidenceRecord>, gem: Gem): void {
  const pageUrl = `/gems/${gem.id}.html`
  const values = flatten(gem)
  for (const [fieldPath, value] of values) {
    if (!fieldPath || fieldPath === 'id' || fieldPath.startsWith('names.')) continue
    addRecord(records, gem.id, fieldPath, value, pageUrl, [fieldPath, fieldPath.split('.')[0]])
  }

  // Stable aliases make the evidence contract readable to the gateway and the demo.
  addRecord(records, gem.id, 'category', gem.category, pageUrl, ['category', 'identity'])
  addRecord(records, gem.id, 'category.mineral', {
    zh: gem.category.mineral_zh,
    en: gem.category.mineral_en,
  }, pageUrl, ['category.mineral', '矿物'])
  addRecord(records, gem.id, 'physical', gem.physical, pageUrl, ['physical'])
  addRecord(records, gem.id, 'optical', gem.optical, pageUrl, ['optical'])
  addRecord(records, gem.id, 'treatments', gem.treatments, pageUrl, ['treatments', 'disclosure'])
  if (gem.treatments.note_zh || gem.treatments.note_en) {
    addRecord(records, gem.id, 'treatments.note', {
      zh: gem.treatments.note_zh,
      en: gem.treatments.note_en,
    }, pageUrl, ['treatments.note', '处理', '披露'])
  }
  if (gem.origin) addRecord(records, gem.id, 'origin', gem.origin, pageUrl, ['origin'])
}

function addSharedRecord(
  records: Map<string, EvidenceRecord>,
  sourceRef: string,
  pageUrl: string,
  value: unknown,
  supports: string[],
): void {
  const [, gemId, ...fieldParts] = sourceRef.split(':')
  records.set(sourceRef, {
    gemId,
    fieldPath: fieldParts.join(':'),
    pageUrl,
    sourceRef,
    contentVersion: CONTENT_VERSION,
    value,
    searchableText: textOf(value),
    supports,
  })
}

export function loadKnowledgeSnapshot(rootDir = process.cwd()): KnowledgeSnapshot {
  const gemDir = path.join(rootDir, 'data', 'gems', 'v1')
  const records = new Map<string, EvidenceRecord>()
  const gems = new Map<string, Record<string, unknown>>()
  const names = new Map<string, { zh: string; en: string }>()

  for (const file of fs.readdirSync(gemDir).filter(file => file.endsWith('.yaml'))) {
    const parsed = GemSchema.parse(yaml.load(fs.readFileSync(path.join(gemDir, file), 'utf8')))
    gems.set(parsed.id, parsed as unknown as Record<string, unknown>)
    names.set(parsed.id, parsed.names)
    addGemRecords(records, parsed)
  }

  const indexValue = [...gems.entries()].map(([id, gem]) => ({
    id,
    name: gem.names as { zh: string; en: string },
    category: gem.category,
    physical: gem.physical,
  }))
  addSharedRecord(records, 'source:index:physical.hardness_mohs', '/gems/index.html', indexValue, ['index', 'hardness'])
  addSharedRecord(records, 'source:index:category.crystal_system', '/gems/index.html', indexValue, ['index', 'crystal-system', '晶系'])
  addSharedRecord(records, 'source:index:editorial_group', '/gems/index.html', indexValue, ['index', 'editorial-group', '石英'])

  const crystalPath = path.join(rootDir, 'data', 'shared', 'crystal-systems.yaml')
  const crystals = CrystalSystemsFile.parse(yaml.load(fs.readFileSync(crystalPath, 'utf8')))
  addSharedRecord(
    records,
    'source:shared:crystal-systems',
    '/classification/crystal-systems/cubic.html',
    crystals,
    ['crystal-systems', 'classification', '晶系', '分类'],
  )
  addSharedRecord(
    records,
    'source:classification:crystal-systems',
    '/classification/intro.html',
    crystals,
    ['crystal-systems', 'classification', '晶系', '分类'],
  )
  addSharedRecord(
    records,
    'source:gem:category.chemical_formula',
    '/gems/',
    '化学式字段描述宝石条目的化学组成。',
    ['category.chemical_formula', '化学式'],
  )
  addSharedRecord(
    records,
    'source:gem:category.crystal_system',
    '/classification/intro.html',
    '晶系字段描述宝石条目的晶体结构分类。',
    ['category.crystal_system', '晶系', '分类'],
  )
  addSharedRecord(
    records,
    'source:identification:synthetic-and-imitation',
    '/identification/synthetic-and-imitation.html',
    '合成品与仿品需要不同的鉴别路径，照片不足以单独支持确定性结论。',
    ['identification', 'synthetic', 'imitation', 'professional identification'],
  )
  addSharedRecord(
    records,
    'source:identification:physical-tests',
    '/identification/physical-tests.html',
    '硬度、折射率和比重是基础测试，但会受到条件、方向、处理和样品状态影响。',
    ['identification', 'physical tests', 'hardness', 'refractive index', 'specific gravity'],
  )

  const identificationPath = path.join(rootDir, 'data', 'shared', 'identification.yaml')
  const identification = IdentificationTopicsFile.parse(yaml.load(fs.readFileSync(identificationPath, 'utf8')))
  for (const topic of identification.topics) {
    addSharedRecord(
      records,
      `source:identification:${topic.id}`,
      `/identification/${topic.id}.html`,
      {
        name_zh: topic.name_zh,
        name_en: topic.name_en,
        summary_zh: topic.summary_zh,
        summary_en: topic.summary_en,
        boundary_zh: topic.boundary_zh,
        boundary_en: topic.boundary_en,
        steps_zh: topic.steps_zh,
        steps_en: topic.steps_en,
        principles_zh: topic.principles_zh,
        principles_en: topic.principles_en,
      },
      ['identification', topic.id, topic.name_zh, topic.name_en],
    )
  }

  return { version: CONTENT_VERSION, records, gems, names }
}

export function addContextEvidence(
  snapshot: KnowledgeSnapshot,
  selectedIds: string[],
): EvidenceRecord | undefined {
  if (selectedIds.length < 2) return undefined
  const records = selectedIds
    .map(id => snapshot.records.get(`source:${id}:category.crystal_system`))
    .filter((record): record is EvidenceRecord => Boolean(record))
  if (records.length !== selectedIds.length) return undefined

  return {
    gemId: 'context',
    fieldPath: 'selectedGems:category.crystal_system',
    pageUrl: '/compare.html',
    sourceRef: 'source:context:selectedGems:category.crystal_system',
    contentVersion: CONTENT_VERSION,
    value: records.map(record => ({ gemId: record.gemId, value: record.value })),
    searchableText: records.map(record => textOf(record.value)).join(' '),
    supports: ['selectedGems', 'category.crystal_system', '晶系'],
  }
}
