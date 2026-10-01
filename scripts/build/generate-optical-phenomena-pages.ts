/**
 * generate-optical-phenomena-pages — produce overview + 7 detail pages
 * from data/shared/optical-phenomena.yaml.
 *
 * Output:
 *   docs/optical-phenomena/{id}.md          (EN, root locale)
 *   docs/zh/optical-phenomena/{id}.md      (ZH)
 *   docs/classification/optical-phenomena/intro.md
 *   docs/zh/classification/optical-phenomena/intro.md
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { OpticalPhenomenaFile } from './schema'
import { renderReferences } from './render-references'

const SHARED = 'data/shared/optical-phenomena.yaml'
const OUT_EN_INTRO = 'docs/classification/optical-phenomena/intro.md'
const OUT_ZH_INTRO = 'docs/zh/classification/optical-phenomena/intro.md'
const OUT_EN_DIR = 'docs/classification/optical-phenomena'
const OUT_ZH_DIR = 'docs/zh/classification/optical-phenomena'

const raw = yaml.load(fs.readFileSync(SHARED, 'utf8'))
const parsed = OpticalPhenomenaFile.parse(raw)
const phenomena = parsed.phenomena

function pickColumns(ex: any, id: string, isZh: boolean): { headers: string[]; rows: string[][] } {
  // Build a sensible columns-per-row table per phenomenon id.
  if (id === 'asterism') {
    return {
      headers: isZh ? ['宝石', '星线数', '宿主矿物', '包裹体'] : ['Gem', 'Rays', 'Host', 'Needles'],
      rows: [{
        gem: ex.gem, rays: ex.rays?.toString() ?? '—',
        host: ex.host ?? '—', needles: ex.needles ?? '—',
      }].map(r => [r.gem, r.rays, r.host, r.needles]),
    }
  }
  if (id === 'chatoyancy') {
    return {
      headers: isZh ? ['宝石', '包裹体形态', '宿主矿物'] : ['Gem', 'Tubes/Fibers', 'Host'],
      rows: [{
        gem: ex.gem, host: ex.host ?? '—', tubes: ex.tubes ?? '—',
      }].map(r => [r.gem, r.tubes, r.host]),
    }
  }
  if (id === 'color-change') {
    return {
      headers: isZh ? ['宝石', '日光下', '白炽灯下'] : ['Gem', 'Daylight', 'Incandescent'],
      rows: [{
        gem: ex.gem, day: ex.day ?? '—', incandescent: ex.incandescent ?? '—',
      }].map(r => [r.gem, r.day, r.incandescent]),
    }
  }
  if (id === 'play-of-color') {
    return {
      headers: isZh ? ['宝石', '微结构', '色彩表现'] : ['Gem', 'Microstructure', 'Color Expression'],
      rows: [{
        gem: ex.gem, structure: ex.structure ?? '—', colors: ex.colors ?? '—',
      }].map(r => [r.gem, r.structure, r.colors]),
    }
  }
  if (id === 'adularescence') {
    return {
      headers: isZh ? ['宝石', '层状结构', '基质矿物'] : ['Gem', 'Layers', 'Base'],
      rows: [{
        gem: ex.gem, layers: ex.layers ?? '—', base: ex.base ?? '—',
      }].map(r => [r.gem, r.layers, r.base]),
    }
  }
  if (id === 'labradorescence') {
    return {
      headers: isZh ? ['宝石', '宿主矿物', '晕彩颜色'] : ['Gem', 'Host', 'Colors'],
      rows: [{
        gem: ex.gem, host: ex.host ?? '—', colors: ex.colors ?? '—',
      }].map(r => [r.gem, r.host, r.colors]),
    }
  }
  // aventurescence
  return {
    headers: isZh ? ['宝石', '包裹体薄片', '宿主矿物'] : ['Gem', 'Plates', 'Host'],
    rows: [{
      gem: ex.gem, plates: ex.plates ?? '—', host: ex.host ?? '—',
    }].map(r => [r.gem, r.plates, r.host]),
  }
}

function detailPage(p: typeof phenomena[number], locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const name = isZh ? p.name_zh : p.name_en
  const summary = isZh ? p.summary_zh : p.summary_en
  const mechanism = isZh ? p.mechanism_zh : p.mechanism_en

  const cols = (p.examples || []).map(ex => pickColumns(ex, p.id, isZh))
  const firstCols = cols[0] || { headers: [], rows: [] }
  const headers = firstCols.headers
  const tableRows = cols.map((c, i) => {
    const ex = (p.examples || [])[i]
    // rebuild row from picks (we already do this inside pickColumns above, but rows are singular per example)
    return c.rows[0].join(' | ')
  })
  const tableHeader = `| ${headers.join(' | ')} |`
  const tableSep = '|' + headers.map(() => '---|').join('')

  return [
    '---',
    `title: ${name}`,
    `phenomenon: ${p.id}`,
    '---',
    '',
    `# ${name}`,
    '',
    isZh ? '## 概述' : '## Overview',
    '',
    summary || '',
    '',
    isZh ? '## 机制' : '## Mechanism',
    '',
    mechanism || '',
    '',
    isZh ? '## 示例宝石' : '## Example Gemstones',
    '',
    tableHeader,
    tableSep,
    ...tableRows,
    '',
    renderReferences(parsed.references, locale),
    '',
    isZh ? '*详见[光学现象总览](intro)。*' : '*See the [optical phenomena overview](intro).*',
  ].join('\n')
}

function overviewPage(locale: 'en' | 'zh'): string {
  const isZh = locale === 'zh'
  const title = isZh ? '光学现象' : 'Optical Phenomena'
  const lede = isZh
    ? '除了基础颜色，天然宝石可通过内部结构展示多种独特的光学效应。以下七种是最具代表性、也最容易在鉴定中观察到的现象：'
    : 'Beyond base color, gems exhibit distinct optical phenomena through internal structure. The seven below are the most representative and observable during identification:'
  const rows = phenomena.map(p =>
    `| [${isZh ? p.name_zh : p.name_en}](${p.id}) | ${isZh ? p.short_zh : p.short_en} |`
  ).join('\n')
  const observationTips: Record<string, { zh: [string, string]; en: [string, string] }> = {
    asterism: { zh: ['单点光源直射并缓慢转动弧面宝石', '定向针状或管状包裹体'], en: ['Use a point light and slowly rotate the cabochon', 'Oriented needles or tubes'] },
    chatoyancy: { zh: ['移动光源或转动弧面宝石，追踪亮带', '平行纤维、管状包裹体或通道'], en: ['Move the light or cabochon and track the band', 'Parallel fibers, tubes, or channels'] },
    'color-change': { zh: ['分别在日光与暖色光源下比较', '不同光源光谱与选择性吸收'], en: ['Compare daylight with a warm incandescent source', 'Source spectrum and selective absorption'] },
    'play-of-color': { zh: ['缓慢倾斜，观察色斑移动与分布', '有序二氧化硅微球结构'], en: ['Tilt slowly and watch flashes move across the surface', 'Ordered silica-sphere domains'] },
    adularescence: { zh: ['转动弧面宝石，观察漂浮光晕', '长石内部交替层状结构'], en: ['Rotate the cabochon and watch the floating sheen', 'Alternating feldspar lamellae'] },
    labradorescence: { zh: ['改变角度，观察金属感色彩闪烁', '长石成分层状结构'], en: ['Change the angle and observe metallic flashes', 'Compositional feldspar lamellae'] },
    aventurescence: { zh: ['倾斜宝石，让片状包裹体依次反光', '定向金属片状包裹体'], en: ['Tilt the gem so platelets reflect in sequence', 'Oriented metallic platelets'] },
  }
  const guideRows = phenomena.map(p => {
    const tip = observationTips[p.id]
    const [observe, structure] = tip ? (isZh ? tip.zh : tip.en) : ['—', '—']
    return `| ${isZh ? p.name_zh : p.name_en} | ${observe} | ${structure} |`
  }).join('\n')

  return [
    '---',
    `title: ${title}`,
    '---',
    '',
    `# ${title}`,
    '',
    lede,
    '',
    isZh ? '## 先学会观察' : '## Start with Observation',
    '',
    isZh ? '| 现象 | 建议观察方式 | 优先寻找的结构线索 |' : '| Phenomenon | Suggested observation | Structural clue to look for |',
    '|---|---|---|',
    guideRows,
    '',
    isZh ? '## 七种主要现象' : '## Seven Major Phenomena',
    '',
    isZh ? '| 现象 | 一句话概述 |' : '| Phenomenon | One-line Summary |',
    '|---|---|',
    rows,
    '',
    isZh ? '观察到一个现象，只能说明宝石呈现了某种光学表现，不能单独作为最终鉴定结论。光源、切磨形状、观察角度和内部包裹体都会影响结果。'
         : 'An observed phenomenon describes an optical appearance, not a final identification by itself. Lighting, cut, viewing angle, and inclusions all affect the result.',
    '',
    renderReferences(parsed.references, locale),
    '',
    isZh ? '*参见[分类总览](../intro)了解矿物学分类框架。*'
         : '*See the [classification overview](../intro) for the mineralogical framework.*',
  ].join('\n')
}

fs.mkdirSync(OUT_EN_DIR, { recursive: true })
fs.mkdirSync(OUT_ZH_DIR, { recursive: true })

let ok = 0
try {
  fs.writeFileSync(OUT_EN_INTRO, overviewPage('en'), 'utf8')
  fs.writeFileSync(OUT_ZH_INTRO, overviewPage('zh'), 'utf8')
  ok++
  console.log(`  ✓ intro → optical-phenomena/{root,zh}/intro.md`)
} catch (e) {
  console.error(`  ✗ intro: ${(e as Error).message}`)
}

for (const p of phenomena) {
  try {
    fs.writeFileSync(path.join(OUT_EN_DIR, `${p.id}.md`), detailPage(p, 'en'), 'utf8')
    fs.writeFileSync(path.join(OUT_ZH_DIR, `${p.id}.md`), detailPage(p, 'zh'), 'utf8')
    ok++
    console.log(`  ✓ ${p.id} → optical-phenomena/{root,zh}/${p.id}.md`)
  } catch (e) {
    console.error(`  ✗ ${p.id}: ${(e as Error).message}`)
  }
}

console.log(`\nGenerated ${ok}/${1 + phenomena.length} optical-phenomenon pages`)
process.exit(ok === 1 + phenomena.length ? 0 : 1)
