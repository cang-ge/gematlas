<!--
GemGallery — Tabbed gallery of all 50 gem species, grouped by mineral family.
Props:
  locale — 'en' (default) or 'zh'

Usage:
  <GemGallery locale="en" />
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{ locale?: 'en' | 'zh' }>()

// ponytail: data grouped directly, no runtime fetch.
const GROUPS = [
  {
    id: 'prestige',
    name_zh: '经典名贵宝石',
    name_en: 'Prestige Gems',
    gems: [
      { id: 'diamond',           en: 'Diamond',       zh: '钻石',       mineral: 'Diamond', h: 10 },
      { id: 'ruby',              en: 'Ruby',          zh: '红宝石',      mineral: 'Corundum', h: 9 },
      { id: 'sapphire',          en: 'Sapphire',      zh: '蓝宝石',      mineral: 'Corundum', h: 9 },
      { id: 'emerald',           en: 'Emerald',       zh: '祖母绿',      mineral: 'Beryl', h: 7.75 },
      { id: 'alexandrite',       en: 'Alexandrite',   zh: '亚历山大石',   mineral: 'Chrysoberyl', h: 8.5 },
      { id: 'spinel',            en: 'Spinel',        zh: '尖晶石',      mineral: 'Spinel', h: 8 },
      { id: 'tanzanite',         en: 'Tanzanite',     zh: '坦桑石',      mineral: 'Zoisite', h: 6.75 },
      { id: 'opal',              en: 'Opal',          zh: '欧泊',        mineral: 'Opal', h: 6 },
    ],
  },
  {
    id: 'quartz',
    name_zh: '石英族',
    name_en: 'Quartz Family',
    gems: [
      { id: 'amethyst',          en: 'Amethyst',      zh: '紫晶',        mineral: 'Quartz', h: 7 },
      { id: 'citrine',           en: 'Citrine',       zh: '黄水晶',      mineral: 'Quartz', h: 7 },
      { id: 'rock-crystal',      en: 'Rock Crystal',  zh: '水晶',        mineral: 'Quartz', h: 7 },
      { id: 'rose-quartz',       en: 'Rose Quartz',   zh: '粉晶',        mineral: 'Quartz', h: 7 },
      { id: 'smoky-quartz',      en: 'Smoky Quartz',  zh: '烟晶',        mineral: 'Quartz', h: 7 },
      { id: 'tigers-eye',        en: "Tiger's Eye",   zh: '虎眼石',      mineral: 'Quartz', h: 7 },
      { id: 'aventurine-quartz', en: 'Aventurine',    zh: '东陵石',      mineral: 'Quartz', h: 7 },
      { id: 'chalcedony',        en: 'Chalcedony',    zh: '玉髓/玛瑙',    mineral: 'Quartz', h: 7 },
      { id: 'chrysoprase',       en: 'Chrysoprase',   zh: '绿玉髓',      mineral: 'Quartz', h: 7 },
      { id: 'quartz-catseye',    en: "Quartz Cat's-eye", zh: '石英猫眼', mineral: 'Quartz', h: 7 },
    ],
  },
  {
    id: 'beryl-garnet',
    name_zh: '绿柱石与石榴石',
    name_en: 'Beryl & Garnet',
    gems: [
      { id: 'aquamarine',        en: 'Aquamarine',    zh: '海蓝宝',      mineral: 'Beryl', h: 7.75 },
      { id: 'morganite',         en: 'Morganite',     zh: '摩根石',      mineral: 'Beryl', h: 7.75 },
      { id: 'tsavorite-garnet',  en: 'Tsavorite',     zh: '沙弗莱',      mineral: 'Garnet', h: 7.25 },
      { id: 'garnet-almandine',  en: 'Almandine',     zh: '铁铝榴石',    mineral: 'Garnet', h: 7.25 },
      { id: 'garnet-pyrope',     en: 'Pyrope',        zh: '镁铝榴石',    mineral: 'Garnet', h: 7.25 },
      { id: 'garnet-spessartine', en: 'Spessartine',  zh: '锰铝榴石',    mineral: 'Garnet', h: 7.25 },
      { id: 'garnet-demantoid',  en: 'Demantoid',     zh: '翠榴石',      mineral: 'Garnet', h: 6.5 },
      { id: 'peridot',           en: 'Peridot',       zh: '橄榄石',      mineral: 'Olivine', h: 6.75 },
      { id: 'iolite',            en: 'Iolite',        zh: '堇青石',      mineral: 'Cordierite', h: 7.25 },
      { id: 'zircon',            en: 'Zircon',        zh: '锆石',        mineral: 'Zircon', h: 7.25 },
    ],
  },
  {
    id: 'feldspar-jade',
    name_zh: '长石与玉类',
    name_en: 'Feldspar & Jade',
    gems: [
      { id: 'moonstone',         en: 'Moonstone',     zh: '月光石',      mineral: 'Feldspar', h: 6.25 },
      { id: 'labradorite',       en: 'Labradorite',   zh: '拉长石',      mineral: 'Feldspar', h: 6.25 },
      { id: 'amazonite',         en: 'Amazonite',     zh: '天河石',      mineral: 'Feldspar', h: 6.25 },
      { id: 'sunstone',          en: 'Sunstone',      zh: '太阳石',      mineral: 'Feldspar', h: 6.25 },
      { id: 'jadeite',           en: 'Jadeite',       zh: '翡翠',        mineral: 'Jadeite', h: 7 },
      { id: 'nephrite',          en: 'Nephrite',      zh: '软玉',        mineral: 'Nephrite', h: 6.25 },
      { id: 'serpentine',        en: 'Serpentine',    zh: '蛇纹石',      mineral: 'Serpentine', h: 4.5 },
      { id: 'prehnite',          en: 'Prehnite',      zh: '葡萄石',      mineral: 'Prehnite', h: 6.25 },
    ],
  },
  {
    id: 'color-gems',
    name_zh: '彩色珍贵宝石',
    name_en: 'Colored Gemstones',
    gems: [
      { id: 'tourmaline',        en: 'Tourmaline',    zh: '碧玺',        mineral: 'Tourmaline', h: 7.25 },
      { id: 'paraiba-tourmaline', en: 'Paraíba',      zh: '帕拉伊巴碧玺', mineral: 'Tourmaline', h: 7.25 },
      { id: 'topaz',             en: 'Topaz',         zh: '黄玉',        mineral: 'Topaz', h: 8 },
      { id: 'chrysoberyl',       en: 'Chrysoberyl',   zh: '金绿宝石',    mineral: 'Chrysoberyl', h: 8.5 },
      { id: 'sugilite',          en: 'Sugilite',      zh: '苏纪石',      mineral: 'Sugilite', h: 6.5 },
      { id: 'charoite',          en: 'Charoite',      zh: '紫硅碱钙石',  mineral: 'Charoite', h: 5.5 },
      { id: 'lapis-lazuli',      en: 'Lapis Lazuli',  zh: '青金石',      mineral: 'Lazurite', h: 5.5 },
      { id: 'sodalite',          en: 'Sodalite',      zh: '方钠石',      mineral: 'Sodalite', h: 6 },
    ],
  },
  {
    id: 'specialty',
    name_zh: '特色装饰宝石',
    name_en: 'Ornamental & Specialty',
    gems: [
      { id: 'malachite',         en: 'Malachite',     zh: '孔雀石',      mineral: 'Malachite', h: 4 },
      { id: 'rhodochrosite',     en: 'Rhodochrosite',  zh: '菱锰矿',     mineral: 'Rhodochrosite', h: 4 },
      { id: 'rhodonite',         en: 'Rhodonite',     zh: '蔷薇辉石',    mineral: 'Rhodonite', h: 6.25 },
      { id: 'dioptase',          en: 'Dioptase',      zh: '透视石',      mineral: 'Dioptase', h: 5.5 },
      { id: 'pyrite',            en: 'Pyrite',        zh: '黄铁矿',      mineral: 'Pyrite', h: 6.5 },
      { id: 'obsidian',          en: 'Obsidian',      zh: '黑曜石',      mineral: 'Obsidian', h: 5.5 },
    ],
  },
]

const activeTab = ref(GROUPS[0].id)

const currentGroup = computed(() => GROUPS.find(g => g.id === activeTab.value) || GROUPS[0])
</script>

<template>
  <div class="gem-gallery" :lang="locale || 'en'">
    <!-- Tab bar -->
    <nav class="gem-gallery__tabs" role="tablist">
      <button
        v-for="g in GROUPS"
        :key="g.id"
        class="gem-gallery__tab"
        :class="{ 'gem-gallery__tab--active': activeTab === g.id }"
        role="tab"
        :aria-selected="activeTab === g.id"
        @click="activeTab = g.id"
      >
        {{ locale === 'zh' ? g.name_zh : g.name_en }}
      </button>
    </nav>

    <!-- Active group gems -->
    <div class="gem-gallery__grid" role="tabpanel">
      <GemCard
        v-for="gem in currentGroup.gems"
        :key="gem.id"
        :id="gem.id"
        :name-zh="gem.zh"
        :name-en="gem.en"
        :mineral="gem.mineral"
        :hardness="gem.h"
        :locale="locale || 'en'"
      />
    </div>
  </div>
</template>

<style scoped>
.gem-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.gem-gallery__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  border-bottom: var(--brass-line, 1px solid rgba(184,146,75,0.22));
  padding-bottom: var(--space-3, 0.75rem);
}

.gem-gallery__tab {
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm, 2px);
  color: var(--color-fg-secondary, #d6cdb8);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: var(--text-sm, 0.875rem);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  white-space: nowrap;
}

.gem-gallery__tab:hover {
  color: var(--color-accent-hover, #c8a868);
  border-color: var(--color-divider, rgba(184,146,75,0.22));
}

.gem-gallery__tab--active {
  color: var(--color-accent, #b8924b);
  border-color: var(--color-accent, #b8924b);
  background: var(--color-accent-soft, rgba(184,146,75,0.18));
}

.gem-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4, 1rem);
}
</style>
