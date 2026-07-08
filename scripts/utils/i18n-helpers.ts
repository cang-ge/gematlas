import { z } from 'zod'

/** Bilingual name pair (zh + en). Used everywhere content has translations. */
export const BilingualName = z.object({
  zh: z.string().min(1),
  en: z.string().min(1),
})
export type BilingualName = z.infer<typeof BilingualName>
