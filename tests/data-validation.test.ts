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
  MaisonWorksFile,
} from '../scripts/build/schema'
import { GEM_COMPARISON_DATA } from '../docs/.vitepress/theme/data/gem-comparison.generated'

const GEM_DIR = 'data/gems/v1'
const SHARED_DIR = 'data/shared'
const GEM_IMAGES_DIR = path.join('docs', 'images', 'gems')

function imageSignature(filePath: string): 'png' | 'jpg' | 'other' {
  const header = fs.readFileSync(filePath).subarray(0, 8)
  if (header.length >= 8 && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png'
  }
  if (header.length >= 3 && header.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return 'jpg'
  }
  return 'other'
}

describe('Gem YAML validation', () => {
  for (const file of fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))) {
    it(`${file} parses against GemSchema`, () => {
      const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
      expect(() => GemSchema.parse(raw)).not.toThrow()
    })
  }

  it('declared gem image extensions match their file signatures', () => {
    for (const file of fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))) {
      const raw = yaml.load(fs.readFileSync(path.join(GEM_DIR, file), 'utf8'))
      const gem = GemSchema.parse(raw)
      const imageNames = [gem.images?.main, ...(gem.images?.gallery ?? [])].filter(
        (image): image is string => Boolean(image),
      )

      for (const imageName of imageNames) {
        const imagePath = path.join(GEM_IMAGES_DIR, gem.id, imageName)
        expect(fs.existsSync(imagePath), `${file}: missing ${imageName}`).toBe(true)
        const extension = path.extname(imageName).toLowerCase()
        const expected = extension === '.png' ? 'png' : extension === '.jpg' || extension === '.jpeg' ? 'jpg' : 'other'
        expect(imageSignature(imagePath), `${file}: ${imageName} has the wrong file signature`).toBe(expected)
      }
    }
  })

  it('comparison projection covers every validated gem record', () => {
    const gemFiles = fs.readdirSync(GEM_DIR).filter(f => f.endsWith('.yaml'))
    expect(GEM_COMPARISON_DATA).toHaveLength(gemFiles.length)
    expect(new Set(GEM_COMPARISON_DATA.map(gem => gem.id)).size).toBe(gemFiles.length)
  })
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

  it('grading evidence ledger covers every topic and resolves every source', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'grading.yaml'), 'utf8'))
    const parsed = GradingTopicsFile.parse(raw)
    const topicIds = new Set(parsed.topics.map(topic => topic.id))
    const referenceIds = new Set(parsed.references.map(reference => reference.id))
    expect(parsed.boundary_zh).toBeTruthy()
    expect(parsed.boundary_en).toBeTruthy()
    expect(new Set(parsed.evidence_ledger.map(entry => entry.topic_id))).toEqual(topicIds)
    expect(parsed.evidence_ledger.every(entry => entry.source_ids.every(sourceId => referenceIds.has(sourceId)))).toBe(true)
    for (const topic of parsed.topics) {
      expect(topic.boundary_zh, `${topic.id}: missing Chinese boundary`).toBeTruthy()
      expect(topic.boundary_en, `${topic.id}: missing English boundary`).toBeTruthy()
    }
  })

  it('grading pages render module and topic evidence boundaries', () => {
    const intro = fs.readFileSync(path.join('docs', 'zh', 'grading', 'intro.md'), 'utf8')
    expect(intro).toContain('gem-module-boundary')
    expect(intro).toContain('class="gem-reference-block"')
    expect(intro).toContain('gem-evidence-title-module-zh')
    for (const id of ['diamond-4cs', 'colored-stones', 'clarity-types', 'origin-disclosure']) {
      const content = fs.readFileSync(path.join('docs', 'zh', 'grading', `${id}.md`), 'utf8')
      expect(content, `${id}: missing rendered boundary`).toContain('class="gem-identification-boundary"')
      expect(content, `${id}: missing source trace`).toContain('class="gem-reference-block"')
      expect(content, `${id}: missing evidence map`).toContain('gem-evidence-ledger')
    }
    const diamond = fs.readFileSync(path.join('docs', 'zh', 'grading', 'diamond-4cs.md'), 'utf8')
    expect(diamond).toContain('不等同于拍卖等级')
    expect(diamond).not.toContain('指数级上升')
    const origin = fs.readFileSync(path.join('docs', 'zh', 'grading', 'origin-disclosure.md'), 'utf8')
    expect(origin).not.toContain('价格上限定')
    expect(origin).not.toContain('行业普遍接受，**必须披露**')
  })

  it('cutting.yaml parses (4 cutting topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'cutting.yaml'), 'utf8'))
    const parsed = CuttingTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(4)
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
    }
  })

  it('cutting taxonomy separates finished form from faceting style', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'cutting.yaml'), 'utf8'))
    const parsed = CuttingTopicsFile.parse(raw)
    const brilliant = parsed.topics.find(topic => topic.id === 'brilliant-cut')
    expect(parsed.overview_zh).toContain('两个层面')
    expect(brilliant?.principles_zh).toContain('不计底尖 57 面')
    expect(brilliant?.principles_en).toContain('57 facets without the culet')
  })

  it('cutting evidence ledger covers every topic and resolves every source', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'cutting.yaml'), 'utf8'))
    const parsed = CuttingTopicsFile.parse(raw)
    const topicIds = new Set(parsed.topics.map(topic => topic.id))
    const referenceIds = new Set(parsed.references.map(reference => reference.id))
    expect(new Set(parsed.evidence_ledger.map(entry => entry.topic_id))).toEqual(topicIds)
    expect(parsed.evidence_ledger.every(entry => entry.source_ids.every(sourceId => referenceIds.has(sourceId)))).toBe(true)
    for (const topic of parsed.topics) {
      expect(topic.boundary_zh, `${topic.id}: missing Chinese boundary`).toBeTruthy()
      expect(topic.boundary_en, `${topic.id}: missing English boundary`).toBeTruthy()
    }
  })

  it('cutting pages render source trace, boundary, and evidence map', () => {
    const intro = fs.readFileSync(path.join('docs', 'zh', 'cutting', 'intro.md'), 'utf8')
    expect(intro).toContain('class="gem-reference-block"')
    const topicIds = ['rough-planning', 'brilliant-cut', 'fancy-cuts', 'cabochon-and-carving']
    for (const id of topicIds) {
      const content = fs.readFileSync(path.join('docs', 'zh', 'cutting', `${id}.md`), 'utf8')
      expect(content, `${id}: missing rendered boundary`).toContain('class="gem-identification-boundary"')
      expect(content, `${id}: missing source trace`).toContain('class="gem-reference-block"')
      expect(content, `${id}: missing evidence map`).toContain('gem-evidence-ledger')
    }
    const brilliant = fs.readFileSync(path.join('docs', 'zh', 'cutting', 'brilliant-cut.md'), 'utf8')
    expect(brilliant).toContain('<FacetDiagram locale="zh" />')
    expect(brilliant).not.toContain('| diamond |')
    const fancy = fs.readFileSync(path.join('docs', 'zh', 'cutting', 'fancy-cuts.md'), 'utf8')
    expect(fancy).toContain('<FancyCutGrid locale="zh" />')
    for (const id of topicIds) {
      const content = fs.readFileSync(path.join('docs', 'zh', 'cutting', `${id}.md`), 'utf8')
      expect(content, `${id}: missing case flow`).toContain('## 案例流程')
      expect(content, `${id}: missing stop condition`).toContain('停止条件')
      expect(content, `${id}: case should be explicitly labelled`).toContain('教学案例')
    }
  })

  it('identification.yaml parses (5 identification topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'identification.yaml'), 'utf8'))
    const parsed = IdentificationTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(5)
    expect(parsed.references.length).toBeGreaterThanOrEqual(4)
    expect(parsed.evidence_ledger.length).toBeGreaterThanOrEqual(5)
    expect(new Set(parsed.evidence_ledger.map(entry => entry.topic_id))).toEqual(
      new Set(parsed.topics.map(topic => topic.id)),
    )
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
      expect(t.boundary_zh, `${t.id}: missing Chinese boundary`).toBeTruthy()
      expect(t.boundary_en, `${t.id}: missing English boundary`).toBeTruthy()
    }
    const referenceIds = new Set(parsed.references.map(reference => reference.id))
    expect(parsed.evidence_ledger.every(entry => entry.source_ids.every(sourceId => referenceIds.has(sourceId)))).toBe(true)
  })

  it('identification pages keep boundary language and avoid outdated certainty claims', () => {
    const intro = fs.readFileSync(path.join('docs', 'zh', 'identification', 'intro.md'), 'utf8')
    expect(intro).toContain('不能仅凭照片、外观、单个仪器读数或 Assist')
    expect(intro).toContain('教育性的筛分记录')
    expect(intro).toContain('class="gem-reference-block"')

    const topicIds = ['identification-workflow', 'physical-tests', 'optical-tests', 'synthetic-and-imitation', 'same-color-gems']
    for (const id of topicIds) {
      const content = fs.readFileSync(path.join('docs', 'zh', 'identification', `${id}.md`), 'utf8')
      expect(content, `${id}: missing rendered boundary`).toContain('class="gem-identification-boundary"')
      expect(content, `${id}: missing boundary heading`).toContain('边界与安全')
      expect(content, `${id}: missing source trace`).toContain('class="gem-reference-block"')
    }

    const optical = fs.readFileSync(path.join('docs', 'zh', 'identification', 'optical-tests.md'), 'utf8')
    for (const heading of ['统一教学协议', '目的：', '适用条件：', '操作与记录：', '结果解释：', '异常处理：', '风险/送检：']) {
      expect(optical, `optical-tests: missing protocol section ${heading}`).toContain(heading)
    }
    expect(optical).toContain('双折射示例：DR 0.059')
    expect(optical).toContain('强多色性')
    expect(optical).not.toContain('值越高（如锆石 0.059）越易识别')
    expect(optical).not.toContain('吸收谱带是"指纹"，鉴定变色宝石与产地')

    const physical = fs.readFileSync(path.join('docs', 'zh', 'identification', 'physical-tests.md'), 'utf8')
    for (const heading of ['统一教学协议', '目的：', '适用条件：', '操作与记录：', '结果解释：', '异常处理：', '风险/送检：']) {
      expect(physical, `physical-tests: missing protocol section ${heading}`).toContain(heading)
    }
    expect(physical).toContain('RI 2.42；SG 3.52')
    expect(physical).toContain('RI 1.762–1.770；SG 4.00 ± 0.05')

    const synthetic = fs.readFileSync(path.join('docs', 'zh', 'identification', 'synthetic-and-imitation.md'), 'utf8')
    for (const section of ['四维披露协议', '证据分层矩阵', '场景矩阵：先问问题，再选证据', '推荐工作流', '停止条件']) {
      expect(synthetic, `synthetic-and-imitation: missing section ${section}`).toContain(section)
    }
    expect(synthetic).toContain('不同材料仿品候选')
    expect(synthetic).toContain('生长来源需要实验室核验')
    expect(synthetic).not.toContain('SG 5.65 vs 3.52')

    const sameColour = fs.readFileSync(path.join('docs', 'zh', 'identification', 'same-color-gems.md'), 'utf8')
    expect(sameColour).not.toContain('以下流程图覆盖红色、蓝色、绿色')
    expect(sameColour).toContain('当前提供红、蓝、绿三个最小教育性分流案例')
    expect(sameColour).toContain('一、蓝色候选分流')
    expect(sameColour).toContain('二、绿色候选分流')
    expect(sameColour).toContain('统一结果记录模板')
    expect(sameColour).toContain('停止过度推断并送检')
  })

  it('gallery.yaml parses (4 gallery topics)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'gallery.yaml'), 'utf8'))
    const parsed = GalleryTopicsFile.parse(raw)
    expect(parsed.topics).toHaveLength(4)
    for (const t of parsed.topics) {
      expect(t.name_en.length).toBeGreaterThan(0)
      expect(t.name_zh.length).toBeGreaterThan(0)
    }
  })

  it('maison-works.yaml parses (7 maisons × 3 works)', () => {
    const raw = yaml.load(fs.readFileSync(path.join(SHARED_DIR, 'maison-works.yaml'), 'utf8'))
    const parsed = MaisonWorksFile.parse(raw)
    expect(parsed.works).toHaveLength(21)
    expect(new Set(parsed.works.map(w => w.id)).size).toBe(21)
    const counts = new Map<string, number>()
    for (const work of parsed.works) counts.set(work.maison, (counts.get(work.maison) || 0) + 1)
    expect(counts.size).toBe(7)
    expect([...counts.values()].every(count => count === 3)).toBe(true)
    expect(new Set(parsed.works.map(w => w.type))).toEqual(new Set(['heritage', 'craft', 'gem-focus']))
    for (const work of parsed.works) {
      expect(work.name_zh.length).toBeGreaterThan(0)
      expect(work.name_en.length).toBeGreaterThan(0)
      expect(work.summary_zh.length).toBeGreaterThan(0)
      expect(work.summary_en.length).toBeGreaterThan(0)
      expect(work.source_url.startsWith('http')).toBe(true)
      expect(work.image).toBeTruthy()
      expect(fs.existsSync(path.join('docs', work.image))).toBe(true)
    }
  })

})
