<!--
GemCard — A clickable gemstone card used on the home page and classification page.

Props:
  id        — gem identifier (kebab-case), used for link: /gems/{id}
  nameZh    — Chinese name
  nameEn    — English name
  mineral   — mineral family (e.g. "Corundum")
  hardness  — Mohs hardness number

Design: dark surface + brass border + hover glow.
Matching the module-card pattern in custom.css.

Usage:
  <GemCard id="ruby" nameZh="红宝石" nameEn="Ruby" mineral="Corundum" :hardness="9" />
-->
<script setup lang="ts">
defineProps<{
  id: string
  nameZh: string
  nameEn: string
  mineral: string
  hardness: number
}>()
</script>

<template>
  <a :href="`/gems/${id}`" class="gem-card" lang="en">
    <div class="gem-card__hardness">{{ hardness }}</div>
    <h3 class="gem-card__name">
      <span class="gem-card__name--en">{{ nameEn }}</span>
      <span class="gem-card__name--zh">{{ nameZh }}</span>
    </h3>
    <p class="gem-card__mineral">{{ mineral }}</p>
  </a>
</template>

<style scoped>
.gem-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  text-decoration: none;
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.gem-card:hover {
  border-color: rgba(184, 146, 75, 0.18);
  transform: translateY(-2px);
}

.gem-card__hardness {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-xl, 1.25rem);
  font-weight: var(--fw-semibold, 600);
  color: var(--color-accent, #b8924b);
  line-height: 1;
}

.gem-card__name {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin: 0;
  font-weight: var(--fw-semibold, 600);
  line-height: var(--lh-tight, 1.15);
}

.gem-card__name--en {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-base, 1rem);
  color: var(--color-fg-primary, #ece4d2);
}

.gem-card__name--zh {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-fg-secondary, #d6cdb8);
}

.gem-card__mineral {
  margin: 0;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
