import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import {
  GemSchema,
  CrystalSystemsFile,
  MohsScaleFile,
} from '../scripts/build/schema'

const GEM_DIR = 'data/gems/v1'
const SHARED_DIR = 'data/shared'

describe('Gem YAML validation', () => {
  for (const file of fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))) {
    it(`${file} parses against GemSchema`, () => {
      const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
      expect(() => GemSchema.parse(raw)).not.toThrow()
    })
  }
})

describe('Shared YAML validation', () => {
  it('crystal-systems.yaml parses (7 systems)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'crystal-systems.yaml'), 'utf8'))
    const parsed = CrystalSystemsFile.parse(raw)
    expect(parsed.systems).toHaveLength(7)
  })

  it('mohs-scale.yaml parses (10 entries)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'mohs-scale.yaml'), 'utf8'))
    const parsed = MohsScaleFile.parse(raw)
    expect(parsed.scale).toHaveLength(10)
  })
})
