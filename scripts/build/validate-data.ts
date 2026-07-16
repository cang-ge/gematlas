#!/usr/bin/env tsx
/**
 * validate-data — schema validation for GemAtlas YAML data layer.
 *
 * Validates every YAML under data/gems/v1/ against GemSchema,
 * and data/shared/*.yaml against their respective schemas.
 * Exits 0 if everything passes; 1 if anything fails.
 *
 * Usage:  pnpm validate:data
 */
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import {
  GemSchema,
  CrystalSystemsFile,
  MohsScaleFile,
  ColorCausesFile,
  OpticalPhenomenaFile,
  MineralGroupsFile,
} from './schema'

const GEM_DIR = 'data/gems/v1'
const SHARED_DIR = 'data/shared'

let pass = 0
let fail = 0

function validate(filePath: string, schema: { parse: (x: unknown) => unknown }, label: string) {
  try {
    const raw = yaml.load(fs.readFileSync(filePath, 'utf8'))
    schema.parse(raw)
    console.log(`  ✓ ${label}`)
    pass++
  } catch (e) {
    console.error(`  ✗ ${label}\n      ${(e as Error).message}`)
    fail++
  }
}

console.log(`\n── GemAtlas data validation ──\n`)

// 10 gems
for (const f of fs.readdirSync(GEM_DIR).filter(x => x.endsWith('.yaml'))) {
  validate(path.join(GEM_DIR, f), GemSchema, `gem: ${f}`)
}

// 2 shared
validate(path.join(SHARED_DIR, 'crystal-systems.yaml'), CrystalSystemsFile, 'shared: crystal-systems.yaml')
validate(path.join(SHARED_DIR, 'mohs-scale.yaml'),       MohsScaleFile,       'shared: mohs-scale.yaml')
const colorCausesPath = path.join(SHARED_DIR, 'color-causes.yaml')
if (fs.existsSync(colorCausesPath)) {
  validate(colorCausesPath, ColorCausesFile, 'shared: color-causes.yaml')
}
const opticalPhenomenaPath = path.join(SHARED_DIR, 'optical-phenomena.yaml')
if (fs.existsSync(opticalPhenomenaPath)) {
  validate(opticalPhenomenaPath, OpticalPhenomenaFile, 'shared: optical-phenomena.yaml')
}
const mineralGroupsPath = path.join(SHARED_DIR, 'mineral-groups.yaml')
if (fs.existsSync(mineralGroupsPath)) {
  validate(mineralGroupsPath, MineralGroupsFile, 'shared: mineral-groups.yaml')
}

console.log(`\nResult: ${pass}/${pass + fail} files valid`)
process.exit(fail === 0 ? 0 : 1)
