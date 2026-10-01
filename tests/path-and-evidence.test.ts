import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const ZH_GEM_DIR = path.join('docs', 'zh', 'gems')
const EN_GEM_DIR = path.join('docs', 'gems')
const GENERATED_CLASSIFICATION_DIRS = [
  'docs/classification/crystal-systems',
  'docs/classification/mineral-groups',
  'docs/classification/optical-phenomena',
  'docs/classification/color-causes',
  'docs/zh/classification/crystal-systems',
  'docs/zh/classification/mineral-groups',
  'docs/zh/classification/optical-phenomena',
  'docs/zh/classification/color-causes',
]

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => path.join(directory, file))
}

describe('P0 generated-page contracts', () => {
  it('keeps all Chinese gem taxonomy links inside the Chinese locale', () => {
    for (const file of markdownFiles(ZH_GEM_DIR)) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content, `${file} should use the Chinese classification root`).toContain('/gematlas/zh/classification/')
      expect(content, `${file} should not link to the English classification root`).not.toContain('href="/gematlas/classification/')
    }
  })

  it('keeps all English gem taxonomy links inside the English locale', () => {
    for (const file of markdownFiles(EN_GEM_DIR)) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content, `${file} should use the English classification root`).toContain('/gematlas/classification/')
      expect(content, `${file} should not link to the Chinese classification root`).not.toContain('href="/gematlas/zh/classification/')
    }
  })

  it('renders a source and evidence-boundary block on every generated classification page', () => {
    for (const directory of GENERATED_CLASSIFICATION_DIRS) {
      for (const file of markdownFiles(directory)) {
        const content = fs.readFileSync(file, 'utf8')
        expect(content, `${file} should render the evidence block`).toContain('<aside class="gem-reference-block"')
        expect(content, `${file} should include at least one source link`).toMatch(/<li><a href="https:\/\//)
        expect(content, `${file} should state the identification boundary`).toMatch(/Evidence Boundary|证据边界/)
      }
    }
  })
})
