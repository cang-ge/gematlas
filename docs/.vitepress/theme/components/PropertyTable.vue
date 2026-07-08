<!--
PropertyTable — Side-by-side comparison of gem physical properties.

Props:
  gemIds  — array of gem IDs to compare (e.g. ['ruby','sapphire','emerald','diamond'])
  locale  — 'en' (default) or 'zh'

Data: hardcoded reference set for the 10 V1.0 gems.
  ponytail: static data, no runtime YAML loading needed.

Usage:
  <PropertyTable :gemIds="['ruby','sapphire']" locale="en" />
-->
<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  gemIds: { type: Array as PropType<string[]>, required: true },
  locale: { type: String as PropType<'en' | 'zh'>, default: 'en' },
})

// ponytail: hardcoded reference data for the 10 V1.0 gems.
// Add new gems here when expanding the collection.
const GEM_DATA: Record<string, {
  name_zh: string; name_en: string; mineral: string; hardness: number;
  ri: string; sg: number; system: string
}> = {
  ruby:   { name_zh: '红宝石', name_en: 'Ruby',     mineral: 'Corundum',   hardness: 9,   ri: '1.762-1.770', sg: 4.00, system: 'Trigonal' },
  sapphire: { name_zh: '蓝宝石', name_en: 'Sapphire', mineral: 'Corundum',   hardness: 9,   ri: '1.762-1.770', sg: 4.00, system: 'Trigonal' },
  emerald: { name_zh: '祖母绿', name_en: 'Emerald',  mineral: 'Beryl',      hardness: 7.75, ri: '1.577-1.583', sg: 2.72, system: 'Hexagonal' },
  diamond: { name_zh: '钻石',   name_en: 'Diamond',  mineral: 'Diamond',    hardness: 10,  ri: '2.417-2.419', sg: 3.52, system: 'Cubic' },
  spinel: { name_zh: '尖晶石', name_en: 'Spinel',   mineral: 'Spinel',     hardness: 8,   ri: '1.712-1.762', sg: 3.60, system: 'Cubic' },
  tanzanite: { name_zh: '坦桑石', name_en: 'Tanzanite', mineral: 'Zoisite',   hardness: 6.5, ri: '1.691-1.700', sg: 3.35, system: 'Orthorhombic' },
  alexandrite: { name_zh: '亚历山大石', name_en: 'Alexandrite', mineral: 'Chrysoberyl', hardness: 8.5, ri: '1.746-1.755', sg: 3.73, system: 'Orthorhombic' },
  'paraiba-tourmaline': { name_zh: '帕拉伊巴碧玺', name_en: 'Paraíba Tourmaline', mineral: 'Tourmaline', hardness: 7.5, ri: '1.614-1.666', sg: 3.06, system: 'Trigonal' },
  'tsavorite-garnet': { name_zh: '沙弗莱石榴石', name_en: 'Tsavorite Garnet', mineral: 'Garnet', hardness: 7.25, ri: '1.739-1.744', sg: 3.61, system: 'Cubic' },
  opal: { name_zh: '欧泊',   name_en: 'Opal',      mineral: 'Opal',       hardness: 5.5, ri: '1.370-1.470', sg: 2.10, system: 'Amorphous' },
}
</script>

<template>
  <div class="property-table" :lang="locale || 'en'">
    <table>
      <thead>
        <tr>
          <th scope="col">{{ locale === 'zh' ? '属性' : 'Property' }}</th>
          <th scope="col" v-for="id in gemIds" :key="id">
            {{ locale === 'zh' ? GEM_DATA[id]?.name_zh : GEM_DATA[id]?.name_en }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ locale === 'zh' ? '莫氏硬度' : 'Mohs Hardness' }}</td>
          <td v-for="id in gemIds" :key="'h-'+id">{{ GEM_DATA[id]?.hardness }}</td>
        </tr>
        <tr>
          <td>{{ locale === 'zh' ? '折射率' : 'Refractive Index' }}</td>
          <td v-for="id in gemIds" :key="'ri-'+id">{{ GEM_DATA[id]?.ri }}</td>
        </tr>
        <tr>
          <td>{{ locale === 'zh' ? '比重' : 'Specific Gravity' }}</td>
          <td v-for="id in gemIds" :key="'sg-'+id">{{ GEM_DATA[id]?.sg }}</td>
        </tr>
        <tr>
          <td>{{ locale === 'zh' ? '晶系' : 'Crystal System' }}</td>
          <td v-for="id in gemIds" :key="'sys-'+id">{{ GEM_DATA[id]?.system }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.property-table {
  overflow-x: auto;
}
.property-table table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-sm, 0.875rem);
}
.property-table th,
.property-table td {
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  border: 1px solid rgba(184, 146, 75, 0.18);
  text-align: left;
  white-space: nowrap;
}
.property-table th {
  background: var(--color-bg-elevated, #25221c);
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
}
.property-table td:first-child {
  font-weight: var(--fw-medium, 500);
  color: var(--color-fg-secondary, #d6cdb8);
  background: var(--color-bg-surface, #1a1814);
}
.property-table td {
  color: var(--color-fg-primary, #ece4d2);
}
</style>
