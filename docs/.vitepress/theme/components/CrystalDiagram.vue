<!--
CrystalDiagram — Simplified SVG illustration of a crystal system.

Props:
  systemId — one of: cubic, tetragonal, orthorhombic, hexagonal, trigonal,
             monoclinic, triclinic

Usage:
  <CrystalDiagram systemId="cubic" />
-->
<script setup lang="ts">
defineProps<{ systemId: string }>()

// ponytail: inline SVG path data, no external files.
// Each system gets a simplified wireframe in a 120×120 viewBox.
const SVG: Record<string, string> = {
  cubic: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20 L100 20 L100 100 L20 100 Z M20 20 L40 40 M100 20 L120 40 L120 120 L100 100 M20 100 L40 120 L120 120" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <path d="M40 40 L120 40 L120 120 L40 120 Z" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
  </svg>`,
  tetragonal: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 15 L95 15 L95 115 L25 115 Z M25 15 L45 35 M95 15 L115 35 L115 135 L95 115 M25 115 L45 135 L115 135" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <path d="M45 35 L115 35 L115 135 L45 135 Z" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
  </svg>`,
  orthorhombic: `<svg viewBox="0 0 130 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 20 L95 15 L115 95 L35 100 Z M15 20 L35 40 M95 15 L115 35 L135 115 L115 95 M35 100 L55 120 L135 115" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <path d="M35 40 L115 35 L135 115 L55 120 Z" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
  </svg>`,
  hexagonal: `<svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="60,10 110,35 110,85 60,110 10,85 10,35" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <polygon points="60,30 100,50 100,95 60,115 20,95 20,50" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
    <line x1="10" y1="35" x2="20" y2="50" stroke="currentColor" stroke-width="1.5"/>
    <line x1="110" y1="35" x2="100" y2="50" stroke="currentColor" stroke-width="1.5"/>
    <line x1="10" y1="85" x2="20" y2="95" stroke="currentColor" stroke-width="1.5"/>
    <line x1="110" y1="85" x2="100" y2="95" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  trigonal: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="60,10 10,105 110,105" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <polygon points="60,40 25,110 95,110" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
    <line x1="10" y1="105" x2="25" y2="110" stroke="currentColor" stroke-width="1.5"/>
    <line x1="110" y1="105" x2="95" y2="110" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  monoclinic: `<svg viewBox="0 0 130 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 15 L110 20 L130 105 L50 100 Z M30 15 L50 35 M110 20 L130 40 L150 125 L130 105 M50 100 L70 120 L150 125" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <path d="M50 35 L130 40 L150 125 L70 120 Z" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
  </svg>`,
  triclinic: `<svg viewBox="0 0 130 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 10 L115 25 L125 110 L45 95 Z M35 10 L55 30 M115 25 L135 45 L145 130 L125 110 M45 95 L65 115 L145 130" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.08)"/>
    <path d="M55 30 L135 45 L145 130 L65 115 Z" stroke="currentColor" stroke-width="1.5" fill="rgba(184,146,75,0.04)"/>
  </svg>`,
}
</script>

<template>
  <div class="crystal-diagram" role="img" :aria-label="systemId + ' crystal system'" v-html="SVG[systemId] || SVG.cubic" />
</template>

<style scoped>
.crystal-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  color: var(--color-accent, #b8924b);
}
.crystal-diagram :deep(svg) {
  width: 100%;
  max-width: 140px;
  height: auto;
}
</style>
