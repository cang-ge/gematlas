import { z } from 'zod'
import { BilingualName } from '../utils/i18n-helpers'

/* ─── Shared taxonomies (data/shared/*.yaml) ─────────────────── */

export const CrystalSystemEntry = z.object({
  id: z.enum([
    'cubic', 'tetragonal', 'orthorhombic',
    'hexagonal', 'trigonal', 'monoclinic', 'triclinic',
    'amorphous', // opal, obsidian, amber
  ]),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  examples: z.array(z.string()).optional(),
  symmetry: z.string().optional(),
  // Phase A: expanded fields for crystal-system reference pages.
  axial_lengths: z.string().optional(),
  angles: z.string().optional(),
  optical_class: z.string().optional(),
  optic_sign: z.string().optional(),
  birefringence: z.string().optional(),
  cleavage: z.string().optional(),
  habit_en: z.string().optional(),
  habit_zh: z.string().optional(),
  description_en: z.string().optional(),
  description_zh: z.string().optional(),
  notable_gems: z.array(z.object({
    name: z.string(),
    ri: z.string(),
    sg: z.string(),
  })).optional(),
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

// Phase D: cause-of-color taxonomy
export const ColorCauseEntry = z.object({
  id: z.enum(['transition-metal', 'color-centers', 'charge-transfer']),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  summary_zh: z.string().optional(),
  summary_en: z.string().optional(),
  mechanism_zh: z.string().optional(),
  mechanism_en: z.string().optional(),
  examples: z.array(z.object({
    gem: z.string(),
    // examples use different field names per cause; validate flexibly
    element: z.string().optional(),
    defect: z.string().optional(),
    pair: z.string().optional(),
    host: z.string(),
    color: z.string(),
  })).optional(),
})
export const ColorCausesFile = z.object({
  causes: z.array(ColorCauseEntry).min(1),
})

// Phase C: optical phenomena taxonomy
export const OpticalPhenomenonEntry = z.object({
  id: z.string().min(1),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  short_zh: z.string().optional(),
  short_en: z.string().optional(),
  summary_zh: z.string().optional(),
  summary_en: z.string().optional(),
  mechanism_zh: z.string().optional(),
  mechanism_en: z.string().optional(),
  // flex-schema examples: vary by phenomenon
  examples: z.array(z.object({
    gem: z.string(),
    host: z.string().optional(),
    needles: z.string().optional(),
    tubes: z.string().optional(),
    layers: z.string().optional(),
    plates: z.string().optional(),
    rays: z.number().optional(),
    day: z.string().optional(),
    incandescent: z.string().optional(),
    base: z.string().optional(),
    colors: z.string().optional(),
  })).optional(),
})
export const OpticalPhenomenaFile = z.object({
  phenomena: z.array(OpticalPhenomenonEntry).min(1),
})

// Phase B: mineral group taxonomy (chemistry-based, Strunz)
export const MineralGroupEntry = z.object({
  id: z.string().min(1),
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  formula_class: z.string().optional(),
  formula_class_en: z.string().optional(),
  structural_zh: z.string().optional(),
  structural_en: z.string().optional(),
  summary_zh: z.string().optional(),
  summary_en: z.string().optional(),
  gems: z.array(z.object({
    name: z.string(),
    formula: z.string(),
    subgroup: z.string().optional(),
  })).optional(),
})
export const MineralGroupsFile = z.object({
  groups: z.array(MineralGroupEntry).min(1),
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

/** Combined shared taxonomy file shapes (for validate-data.ts) */
export const SharedSchema = z.object({
  crystal_systems: CrystalSystemsFile,
  mohs_scale: MohsScaleFile,
  color_causes: ColorCausesFile.optional(),
  optical_phenomena: OpticalPhenomenaFile.optional(),
  mineral_groups: MineralGroupsFile.optional(),
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
