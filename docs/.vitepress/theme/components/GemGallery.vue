<!--
GemGallery — Tabbed gallery of all 60 gem species, grouped by mineral family.
Props:
  locale — 'en' (default) or 'zh'

Usage:
  <GemGallery locale="en" />
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

// Let Vite fingerprint and emit the gallery assets. Runtime-built absolute
// paths such as /images/gems/... are not part of VitePress's asset graph.
const GEM_IMAGE_URLS = import.meta.glob<string>('../../../images/gems/*/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

type Locale = 'en' | 'zh'
type Gem = {
  id: string
  en: string
  zh: string
  mineral: string
  h: number
}
type GemGroup = {
  id: string
  name_zh: string
  name_en: string
  gems: Gem[]
}

const props = defineProps<{ locale?: Locale }>()

// ponytail: data grouped directly, no runtime fetch.
const GROUPS: GemGroup[] = [
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
      { id: 'pearl',             en: 'Pearl',         zh: '珍珠',        mineral: 'Organic', h: 2.5 },
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
      { id: 'heliodor',          en: 'Heliodor',      zh: '金绿柱石',    mineral: 'Beryl', h: 7.75 },
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
      { id: 'turquoise',         en: 'Turquoise',     zh: '绿松石',      mineral: 'Turquoise', h: 6 },
      { id: 'kunzite',           en: 'Kunzite',       zh: '紫锂辉石',    mineral: 'Spodumene', h: 7 },
      { id: 'kyanite',           en: 'Kyanite',       zh: '蓝晶石',      mineral: 'Kyanite', h: 5.5 },
      { id: 'apatite',           en: 'Apatite',       zh: '磷灰石',      mineral: 'Apatite', h: 5 },
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
      { id: 'amber',             en: 'Amber',         zh: '琥珀',        mineral: 'Organic resin', h: 2.5 },
      { id: 'coral',             en: 'Coral',         zh: '珊瑚',        mineral: 'Organic', h: 3.5 },
      { id: 'fluorite',          en: 'Fluorite',      zh: '萤石',        mineral: 'Fluorite', h: 4 },
      { id: 'sphalerite',        en: 'Sphalerite',    zh: '闪锌矿',      mineral: 'Sphalerite', h: 3.5 },
    ],
  },
]

const ALL_GEMS = GROUPS.flatMap(group => group.gems.map(gem => ({ ...gem, groupId: group.id })))
const totalCount = ALL_GEMS.length
const query = ref('')
const activeGroup = ref('all')
const sortBy = ref<'curated' | 'name' | 'hardness'>('curated')

const mineralNamesZh: Record<string, string> = {
  Diamond: '金刚石',
  Corundum: '刚玉',
  Beryl: '绿柱石',
  Chrysoberyl: '金绿宝石',
  Spinel: '尖晶石',
  Zoisite: '黝帘石',
  Opal: '蛋白石',
  Organic: '有机材料',
  Quartz: '石英',
  Garnet: '石榴石',
  Olivine: '橄榄石',
  Cordierite: '堇青石',
  Zircon: '锆石',
  Feldspar: '长石',
  Jadeite: '硬玉',
  Nephrite: '软玉',
  Serpentine: '蛇纹石',
  Prehnite: '葡萄石',
  Tourmaline: '电气石',
  Topaz: '黄玉',
  Sugilite: '苏纪石',
  Charoite: '紫硅碱钙石',
  Lazurite: '青金石',
  Sodalite: '方钠石',
  Turquoise: '绿松石',
  Spodumene: '锂辉石',
  Kyanite: '蓝晶石',
  Apatite: '磷灰石',
  Malachite: '孔雀石',
  Rhodochrosite: '菱锰矿',
  Rhodonite: '蔷薇辉石',
  Dioptase: '透视石',
  Pyrite: '黄铁矿',
  Obsidian: '黑曜石',
  'Organic resin': '有机树脂',
  Fluorite: '萤石',
  Sphalerite: '闪锌矿',
}

const imageExtensions: Record<string, string> = {
  morganite: 'png',
  moonstone: 'png',
  apatite: 'png',
}

const currentLocale = computed<Locale>(() => props.locale || 'en')
const currentGroup = computed(() => GROUPS.find(group => group.id === activeGroup.value))
const visibleGems = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  const filtered = ALL_GEMS.filter(gem => {
    const inGroup = activeGroup.value === 'all' || gem.groupId === activeGroup.value
    const localizedMineral = mineralNamesZh[gem.mineral] || ''
    const searchable = `${gem.en} ${gem.zh} ${gem.mineral} ${localizedMineral}`.toLocaleLowerCase()
    return inGroup && (!term || searchable.includes(term))
  })

  if (sortBy.value === 'name') {
    return [...filtered].sort((a, b) => {
      const aName = currentLocale.value === 'zh' ? a.zh : a.en
      const bName = currentLocale.value === 'zh' ? b.zh : b.en
      return aName.localeCompare(bName, currentLocale.value === 'zh' ? 'zh-CN' : 'en')
    })
  }
  if (sortBy.value === 'hardness') {
    return [...filtered].sort((a, b) => b.h - a.h || a.en.localeCompare(b.en))
  }
  return filtered
})

function groupName(group: GemGroup): string {
  return currentLocale.value === 'zh' ? group.name_zh : group.name_en
}

function groupCount(group: GemGroup): number {
  return group.gems.length
}

function mineralName(mineral: string): string {
  return currentLocale.value === 'zh' ? (mineralNamesZh[mineral] || mineral) : mineral
}

function imageLink(id: string): string {
  const extension = imageExtensions[id] || 'jpg'
  const sourcePath = `../../../images/gems/${id}/${id}.${extension}`
  return GEM_IMAGE_URLS[sourcePath] || withBase(`/images/gems/${id}/${id}.${extension}`)
}

function resultSummary(): string {
  const count = visibleGems.value.length
  if (currentLocale.value === 'zh') {
    return query.value.trim() || activeGroup.value !== 'all' ? `找到 ${count} 种宝石` : `全部 ${count} 种宝石`
  }
  return query.value.trim() || activeGroup.value !== 'all' ? `${count} species found` : `All ${count} species`
}

function resetFilters(): void {
  query.value = ''
  activeGroup.value = 'all'
  sortBy.value = 'curated'
}
</script>

<template>
  <div class="gem-gallery" :lang="currentLocale">
    <div class="gem-gallery__toolbar">
      <label class="gem-gallery__search">
        <span class="gem-gallery__search-label">{{ currentLocale === 'zh' ? '搜索名录' : 'Search the index' }}</span>
        <input
          v-model="query"
          type="search"
          :placeholder="currentLocale === 'zh' ? '名称、矿物族或英文名' : 'Name, mineral family, or synonym'"
          :aria-label="currentLocale === 'zh' ? '搜索 60 种宝石' : 'Search 60 gemstone species'"
        >
        <button
          v-if="query"
          type="button"
          class="gem-gallery__clear"
          :aria-label="currentLocale === 'zh' ? '清除搜索' : 'Clear search'"
          @click="query = ''"
        >
          ×
        </button>
      </label>

      <label class="gem-gallery__sort">
        <span>{{ currentLocale === 'zh' ? '排序' : 'Sort' }}</span>
        <select v-model="sortBy">
          <option value="curated">{{ currentLocale === 'zh' ? '编辑顺序' : 'Curated order' }}</option>
          <option value="name">{{ currentLocale === 'zh' ? '名称 A–Z' : 'Name A–Z' }}</option>
          <option value="hardness">{{ currentLocale === 'zh' ? '硬度高 → 低' : 'Hardness high → low' }}</option>
        </select>
      </label>
    </div>

    <nav class="gem-gallery__filters" :aria-label="currentLocale === 'zh' ? '按编辑分类筛选' : 'Filter by editorial group'">
      <button
        type="button"
        class="gem-gallery__filter"
        :class="{ 'gem-gallery__filter--active': activeGroup === 'all' }"
        :aria-pressed="activeGroup === 'all'"
        @click="activeGroup = 'all'"
      >
        {{ currentLocale === 'zh' ? '全部宝石' : 'All stones' }}
        <span>· {{ totalCount }}</span>
      </button>
      <button
        v-for="group in GROUPS"
        :key="group.id"
        type="button"
        class="gem-gallery__filter"
        :class="{ 'gem-gallery__filter--active': activeGroup === group.id }"
        :aria-pressed="activeGroup === group.id"
        @click="activeGroup = group.id"
      >
        {{ groupName(group) }}
        <span>· {{ groupCount(group) }}</span>
      </button>
    </nav>

    <div class="gem-gallery__summary" role="status" aria-live="polite">
      <span>{{ resultSummary() }}</span>
      <span v-if="currentGroup" class="gem-gallery__summary-group">{{ groupName(currentGroup) }}</span>
    </div>

    <div v-if="visibleGems.length" class="gem-gallery__grid">
      <GemCard
        v-for="gem in visibleGems"
        :key="gem.id"
        :id="gem.id"
        :name-zh="gem.zh"
        :name-en="gem.en"
        :mineral="mineralName(gem.mineral)"
        :group-label="groupName(GROUPS.find(group => group.id === gem.groupId) || GROUPS[0])"
        :hardness="gem.h"
        :image-src="imageLink(gem.id)"
        :locale="currentLocale"
      />
    </div>

    <div v-else class="gem-gallery__empty">
      <p>{{ currentLocale === 'zh' ? '没有找到匹配的宝石。' : 'No gemstone matches this search.' }}</p>
      <button type="button" @click="resetFilters">
        {{ currentLocale === 'zh' ? '清除筛选' : 'Clear filters' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.gem-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.gem-gallery__toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 1rem;
  padding: 1.25rem 0;
  border-block: var(--brass-line, 1px solid rgba(184, 146, 75, 0.22));
}

.gem-gallery__search,
.gem-gallery__sort {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: var(--color-fg-muted, #a89e8a);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gem-gallery__search {
  position: relative;
}

.gem-gallery__search input,
.gem-gallery__sort select {
  min-height: 2.75rem;
  border: 1px solid rgba(184, 146, 75, 0.32);
  border-radius: var(--radius-sm, 2px);
  background: rgba(13, 25, 29, 0.86);
  color: var(--color-fg-primary, #ece4d2);
  font: inherit;
  letter-spacing: 0.02em;
  text-transform: none;
}

.gem-gallery__search input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 0.9rem;
  font-size: 0.95rem;
}

.gem-gallery__search input::placeholder { color: var(--color-fg-muted, #a89e8a); }
.gem-gallery__sort select { padding: 0 2.2rem 0 0.8rem; }
.gem-gallery__search input:focus-visible,
.gem-gallery__sort select:focus-visible,
.gem-gallery__filter:focus-visible,
.gem-gallery__clear:focus-visible,
.gem-gallery__empty button:focus-visible {
  outline: 2px solid var(--color-accent, #b8924b);
  outline-offset: 2px;
}

.gem-gallery__clear {
  position: absolute;
  right: 0.5rem;
  bottom: 0.35rem;
  width: 2rem;
  height: 2rem;
  border: 0;
  background: transparent;
  color: var(--color-accent, #b8924b);
  font-size: 1.25rem;
  cursor: pointer;
}

.gem-gallery__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.gem-gallery__filter {
  min-height: 2.5rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--color-fg-secondary, #d6cdb8);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.82rem;
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.gem-gallery__filter span {
  color: var(--color-fg-muted, #a89e8a);
  font-variant-numeric: tabular-nums;
}

.gem-gallery__filter:hover,
.gem-gallery__filter--active {
  border-color: var(--color-accent, #b8924b);
  background: var(--color-accent-soft, rgba(184, 146, 75, 0.18));
  color: var(--color-accent-hover, #c8a868);
}

.gem-gallery__summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-fg-secondary, #d6cdb8);
  font-family: var(--font-body, Inter, sans-serif);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.gem-gallery__summary-group { color: var(--color-accent, #b8924b); }

.gem-gallery__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.gem-gallery__empty {
  padding: 4rem 1rem;
  border-block: var(--brass-line, 1px solid rgba(184, 146, 75, 0.22));
  text-align: center;
}

.gem-gallery__empty button {
  min-height: 2.75rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-accent, #b8924b);
  background: transparent;
  color: var(--color-accent, #b8924b);
  cursor: pointer;
}

:lang(zh) .gem-gallery__search,
:lang(zh) .gem-gallery__sort,
:lang(zh) .gem-gallery__filter,
:lang(zh) .gem-gallery__summary {
  font-family: var(--font-zh-display, 'Noto Serif SC', serif);
  text-transform: none;
  letter-spacing: 0.04em;
}

:lang(zh) .gem-gallery__search input,
:lang(zh) .gem-gallery__sort select { font-family: var(--font-zh-display, 'Noto Serif SC', serif); }

@media (max-width: 1100px) {
  .gem-gallery__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .gem-gallery__toolbar { grid-template-columns: 1fr; }
  .gem-gallery__sort { width: min(100%, 16rem); }
  .gem-gallery__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .gem-gallery__grid { grid-template-columns: minmax(0, 1fr); }
  .gem-gallery__summary { align-items: flex-start; flex-direction: column; gap: 0.3rem; }
}

@media (prefers-reduced-motion: reduce) {
  .gem-gallery__filter { transition: none; }
}
</style>
