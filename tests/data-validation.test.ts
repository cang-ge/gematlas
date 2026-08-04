import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import {
  GemSchema,
  CrystalSystemsFile,
  MohsScaleFile,
  GradingTopicsFile,
  CuttingTopicsFile,
  IdentificationTopicsFile,
  GalleryTopicsFile,
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

  it('grading.yaml parses (4 grading topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'grading.yaml'), 'utf8'))
    const parsed = GradingTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(4)
    // every topic has an EN+ZH name and summary
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
      expect(t.summary_en.length).toBeGreaterThan(0)
      expect(t.summary_zh.length).toBeGreaterThan(0)
    }
  })

  it('grading.yaml topics have unique ids', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'grading.yaml'), 'utf8'))
    const parsed = GradingTopicsFile.parse(raw)
    const ids = parsed.topics.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cutting.yaml parses (3 cutting topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'cutting.yaml'), 'utf8'))
    const parsed = CuttingTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(3)
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
    }
  })

  it('identification.yaml parses (3 identification topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'identification.yaml'), 'utf8'))
    const parsed = IdentificationTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(3)
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
    }
  })

  it('gallery.yaml parses (3 gallery topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'gallery.yaml'), 'utf8'))
    const parsed = GalleryTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(3)
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
    }
  })
})
