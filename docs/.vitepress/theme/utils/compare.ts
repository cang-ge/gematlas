export const MAX_COMPARE_GEMS = 4

export function normalizeCompareIds(
  ids: Iterable<string>,
  knownIds: ReadonlySet<string>,
): string[] {
  const normalized: string[] = []
  const seen = new Set<string>()

  for (const rawId of ids) {
    const id = rawId.trim().toLowerCase()
    if (!id || seen.has(id) || !knownIds.has(id)) continue
    seen.add(id)
    normalized.push(id)
    if (normalized.length === MAX_COMPARE_GEMS) break
  }

  return normalized
}

export function parseCompareIds(search: string, knownIds: ReadonlySet<string>): string[] {
  const raw = new URLSearchParams(search).get('gems') || ''
  return normalizeCompareIds(raw.split(/[\s,]+/), knownIds)
}

export function serializeCompareIds(ids: readonly string[]): string {
  return ids.slice(0, MAX_COMPARE_GEMS).join(',')
}
