import { describe, it, expect } from 'vitest'
import { findErrors } from '../scripts/build/sync-content'

describe('i18n sync (en ↔ zh)', () => {
  it('every file in docs/en has a matching docs/zh pair (and vice versa)', () => {
    const missing = findErrors().filter(e => e.kind === 'MISSING')
    expect(missing, `${missing.length} file(s) missing on one side`).toEqual([])
  })

  it('frontmatter shared keys (gem, crystalSystem) match across locales', () => {
    const fm = findErrors().filter(e => e.kind === 'FRONTMATTER')
    expect(fm, `${fm.length} frontmatter mismatch(es)`).toEqual([])
  })

  it('zero total issues — overall invariant', () => {
    expect(findErrors()).toEqual([])
  })
})
