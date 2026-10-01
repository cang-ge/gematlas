import { describe, expect, it } from 'vitest'
import {
  MAX_COMPARE_GEMS,
  normalizeCompareIds,
  parseCompareIds,
  serializeCompareIds,
} from '../docs/.vitepress/theme/utils/compare'

const knownIds = new Set(['diamond', 'ruby', 'sapphire', 'emerald', 'opal'])

describe('compare route contract', () => {
  it('reads, normalizes, deduplicates, and bounds URL IDs', () => {
    expect(parseCompareIds(
      '?gems=DIAMOND,%20ruby,unknown,diamond,sapphire,emerald,opal',
      knownIds,
    )).toEqual(['diamond', 'ruby', 'sapphire', 'emerald'])
  })

  it('keeps ordering while serializing the bounded selection', () => {
    const ids = normalizeCompareIds(['ruby', 'diamond', 'ruby', 'sapphire', 'opal'], knownIds)
    expect(ids).toHaveLength(MAX_COMPARE_GEMS)
    expect(serializeCompareIds(ids)).toBe('ruby,diamond,sapphire,opal')
  })
})
