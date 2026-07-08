import { z } from 'zod'
import { BilingualName } from '../utils/i18n-helpers'

/* ─── Shared taxonomies (data/shared/*.yaml) ─────────────────── */

export const CrystalSystemEntry = z.object({
  id: z.enum([
    'cubic', 'tetragonal', 'orthorhombic',
    'hexagonal', 'trigonal', 'monoclinic', 'triclinic',
  ]),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  examples: z.array(z.string()).optional(),
  symmetry: z.string().optional(),
})
export const CrystalSystemsFile = z.object({
  systems: z.array(CrystalSystemEntry).length(7),
})

export const MohsEntry = z.object({
  hardness: z.number().int().min(1).max(10),
  mineral_zh: z.string().min(1),
  mineral_en: z.string().min(1),
})
export const MohsScaleFile = z.object({
  scale: z.array(MohsEntry).length(10),
})

/* ─── Gem (data/gemstones/v1/*.yaml) — core 5 modules ───────── */

/** Each gem's mineralogical / chemical identity. */
export const GemCategory = z.object({
  mineral_zh: z.string().min(1),
  mineral_en: z.string().min(1),
  chemical_formula: z.string().min(1),
  crystal_system: CrystalSystemEntry.shape.id,
})

/** Physical / optical measurements used in identification. */
export const GemPhysical = z.object({
  hardness_mohs: z.number().min(1).max(10),
  hardness_note_zh: z.string().optional(),
  hardness_note_en: z.string().optional(),
  specific_gravity: z.number().positive(),
  refractive_index: z.string().regex(/^\d+\.\d+-\d+\.\d+$/, 'Use "min-max" format e.g. "1.762-1.770"'),
})

/** Optical phenomena and color causes. */
export const GemOptical = z.object({
  pleochroism: z.enum(['none', 'weak', 'moderate', 'strong']).optional(),
  typical_colors: z.array(BilingualName).min(1),
  color_causes_zh: z.string().min(1),
  color_causes_en: z.string().min(1),
})

/** Common treatments and disclosure requirements. */
export const GemTreatments = z.object({
  common: z.array(z.string()).default([]),
  disclosure_required: z.boolean(),
  note_zh: z.string().optional(),
  note_en: z.string().optional(),
})

/** The full Gem YAML shape. */
export const GemSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'kebab-case id'),
  names: BilingualName,
  category: GemCategory,
  physical: GemPhysical,
  optical: GemOptical,
  treatments: GemTreatments,
})
export type Gem = z.infer<typeof GemSchema>
