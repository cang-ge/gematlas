<!--
GalleryGrid — Filterable gallery of maison signature pieces.

Props:
  locale — 'en' (default) or 'zh'

Usage:
  <GalleryGrid locale="en" />

ponytail: hardcoded 18 pieces, plain filter(), no computed.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{ locale?: 'en' | 'zh' }>()

const pieces = [
  // Cartier
  { brand: 'Cartier', nameZh: 'Tutti Frutti 水果锦囊手链', nameEn: 'Tutti Frutti Bracelet', year: 1928, era: '1900-1950', gemType: 'Ruby,Sapphire,Emerald', craft: 'Calibré-cut', descZh: '三色宝石雕刻组合，Art Deco 风格标志', descEn: 'Carved gem-set suite, iconic Art Deco piece' },
  { brand: 'Cartier', nameZh: 'Panthere 猎豹胸针', nameEn: 'Panthere Brooch', year: 1949, era: '1900-1950', gemType: 'Sapphire,Emerald,Onyx', craft: 'Enamel,Paillonné', descZh: '猎豹造型，蓝宝石斑纹，Cartier 代表性图腾', descEn: 'Panther motif, sapphire spots, Cartier icon' },
  { brand: 'Cartier', nameZh: 'Love 手镯', nameEn: 'Love Bracelet', year: 1969, era: '1950-2000', gemType: 'None', craft: 'Screw-lock', descZh: '无需工具的螺锁设计，现代爱情象征', descEn: 'Tool-less screw lock, modern love icon' },
  // Van Cleef & Arpels
  { brand: 'Van Cleef & Arpels', nameZh: 'Zip 拉链项链', nameEn: 'Zip Necklace', year: 1951, era: '1900-1950', gemType: 'Ruby,Diamond', craft: 'Mystery Set', descZh: '可拉合为手链的专利设计', descEn: 'Patent design: zips into a bracelet' },
  { brand: 'Van Cleef & Arpels', nameZh: 'Alhambra 四叶草项链', nameEn: 'Alhambra Necklace', year: 1968, era: '1950-2000', gemType: 'None', craft: 'Gold bezel', descZh: '四叶草幸运象征，VCA 最经典系列', descEn: 'Clover luck motif, VCA\'s most iconic line' },
  { brand: 'Van Cleef & Arpels', nameZh: 'Mystery Set 隐密式镶嵌胸针', nameEn: 'Mystery Set Brooch', year: 1933, era: '1900-1950', gemType: 'Ruby,Diamond', craft: 'Mystery Set', descZh: '专利技术：宝石间无可见金属爪', descEn: 'Patented: no visible metal between gems' },
  // Boucheron
  { brand: 'Boucheron', nameZh: 'Question Mark 问号项链', nameEn: 'Question Mark Necklace', year: 1879, era: 'Pre-1900', gemType: 'Diamond', craft: 'Flexible set', descZh: '非对称无扣设计，自由悬挂', descEn: 'Asymmetrical clasp-less design, hangs freely' },
  { brand: 'Boucheron', nameZh: 'Plume de Paon 孔雀羽毛戒指', nameEn: 'Plume de Paon Ring', year: 2012, era: '2000+', gemType: 'Sapphire,Emerald', craft: 'Feather motif', descZh: '羽毛纹理，彩色宝石镶嵌', descEn: 'Feather texture, colored gem setting' },
  // Tiffany
  { brand: 'Tiffany & Co.', nameZh: 'Tiffany Setting 六爪钻戒', nameEn: 'Tiffany Setting Ring', year: 1886, era: 'Pre-1900', gemType: 'Diamond', craft: 'Six-prong', descZh: '六爪镶嵌开创者，全球经典求婚钻戒', descEn: 'Invented six-prong setting, global engagement icon' },
  { brand: 'Tiffany & Co.', nameZh: 'Blue Book 海蓝宝项链', nameEn: 'Blue Book Aquamarine', year: 2015, era: '2000+', gemType: 'Aquamarine,Diamond', craft: 'Platinum', descZh: 'Tiffany 高珠年度系列的标志款', descEn: 'Tiffany high jewelry annual series icon' },
  // Harry Winston
  { brand: 'Harry Winston', nameZh: 'Hope Diamond 希望之钻', nameEn: 'Hope Diamond', year: 1949, era: '1900-1950', gemType: 'Diamond', craft: 'Cushion-cut', descZh: '45.52 克拉蓝钻，HW 曾收藏并巡展', descEn: '45.52 ct blue diamond, HW owned and toured' },
  { brand: 'Harry Winston', nameZh: 'Cluster 锦簇镶嵌钻石耳环', nameEn: 'Cluster Earrings', year: 1950, era: '1900-1950', gemType: 'Diamond', craft: 'Cluster setting', descZh: '无金属爪的锦簇镶嵌，最大化光辉', descEn: 'Cluster setting with no visible metal, max brilliance' },
  { brand: 'Harry Winston', nameZh: 'Winston Blue 蓝钻', nameEn: 'Winston Blue', year: 2014, era: '2000+', gemType: 'Diamond', craft: 'Emerald-cut', descZh: '13.22 克拉祖母绿切蓝钻，极珍稀', descEn: '13.22 ct emerald-cut blue diamond, extremely rare' },
  // Graff
  { brand: 'Graff', nameZh: 'Graff Venus 心切割钻石', nameEn: 'Graff Venus', year: 2016, era: '2000+', gemType: 'Diamond', craft: 'Heart-cut', descZh: '心形切割钻石，118.78 克拉', descEn: 'Heart-cut diamond, 118.78 carats' },
  { brand: 'Graff', nameZh: 'Lesedi La Rona 祖母绿切钻石', nameEn: 'Lesedi La Rona', year: 2018, era: '2000+', gemType: 'Diamond', craft: 'Emerald-cut', descZh: '302.37 克拉祖母绿切，最大顶级色钻', descEn: '302.37 ct emerald-cut, largest top-color diamond' },
  // Chaumet
  { brand: 'Chaumet', nameZh: 'Joséphine 约瑟芬皇冠', nameEn: 'Joséphine Tiara', year: 2011, era: '2000+', gemType: 'Diamond', craft: 'Tiara', descZh: '拿破仑御用珠宝师设计灵感', descEn: 'Inspired by Napoleon\'s court jeweler' },
  { brand: 'Chaumet', nameZh: 'Liens 交叉连结戒指', nameEn: 'Liens Ring', year: 1977, era: '1950-2000', gemType: 'Diamond', craft: 'Cross-link', descZh: '交叉符号象征联结，Chaumet 经典', descEn: 'Cross symbol for connection, Chaumet classic' },
  { brand: 'Chaumet', nameZh: 'Bee My Love 蜂巢戒指', nameEn: 'Bee My Love Ring', year: 2015, era: '2000+', gemType: 'Diamond', craft: 'Hexagonal', descZh: '六角蜂巢设计，可堆叠组合', descEn: 'Hexagonal honeycomb design, stackable' },
]

// ponytail: plain string filter, not multi-select checkboxes.
const brands = [...new Set(pieces.map(p => p.brand))]
const filterBrand = ref<string>('')
const filterGem = ref<string>('')
const filteredPieces = computed(() => pieces.filter(p => {
  if (filterBrand.value && p.brand !== filterBrand.value) return false
  if (filterGem.value && !p.gemType.split(',').includes(filterGem.value)) return false
  return true
}))
// ponytail: derive filterable gem types from data rather than hardcoding.
const gemTypes = computed(() => [...new Set(pieces.flatMap(p => p.gemType.split(',')))])
</script>

<template>
  <div class="gallery-grid" :lang="locale || 'en'">
    <!-- Filters -->
    <div class="gallery-grid__filters">
      <select v-model="filterBrand">
        <option value="">{{ locale === 'zh' ? '全部品牌' : 'All Brands' }}</option>
        <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
      </select>
      <select v-model="filterGem">
        <option value="">{{ locale === 'zh' ? '全部宝石' : 'All Gems' }}</option>
        <option v-for="t in gemTypes" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Grid -->
    <div class="gallery-grid__grid">
      <div v-for="p in filteredPieces" :key="p.nameEn" class="gallery-grid__card">
        <h4 class="gallery-grid__brand">{{ p.brand }}</h4>
        <h5 class="gallery-grid__name">{{ locale === 'zh' ? p.nameZh : p.nameEn }}</h5>
        <div class="gallery-grid__meta">
          <span class="gallery-grid__year">{{ p.year }}</span>
          <span class="gallery-grid__craft">{{ p.craft }}</span>
        </div>
        <p class="gallery-grid__gems">{{ p.gemType }}</p>
        <p class="gallery-grid__desc">{{ locale === 'zh' ? p.descZh : p.descEn }}</p>
      </div>
    </div>

    <div v-if="filteredPieces.length === 0" class="gallery-grid__empty">
      {{ locale === 'zh' ? '无匹配作品' : 'No pieces match your filters' }}
    </div>
  </div>
</template>

<style scoped>
.gallery-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.gallery-grid__filters {
  display: flex;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
}
.gallery-grid__filters select {
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-sm, 2px);
  color: var(--color-fg-primary, #ece4d2);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-sm, 0.875rem);
  min-width: 140px;
}
.gallery-grid__filters select option { background: var(--color-bg-surface, #1a1814); }

.gallery-grid__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4, 1rem);
}
@media (max-width: 1024px) { .gallery-grid__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .gallery-grid__grid { grid-template-columns: 1fr; } }

.gallery-grid__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-4, 1rem);
  background: var(--color-bg-surface, #1a1814);
  border: 1px solid rgba(184, 146, 75, 0.22);
  border-radius: var(--radius-md, 4px);
  transition: border-color 0.2s ease;
}
.gallery-grid__card:hover { border-color: rgba(184, 146, 75, 0.40); }

.gallery-grid__brand {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-accent, #b8924b);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0;
}

.gallery-grid__name {
  font-family: var(--font-display, 'Cormorant Garamond', serif);
  font-size: var(--text-lg, 1.125rem);
  color: var(--color-fg-primary, #ece4d2);
  font-weight: var(--fw-semibold, 600);
  margin: 0;
}
:lang(zh) .gallery-grid__name { font-family: var(--font-zh-display, 'Noto Serif SC', serif); font-size: var(--text-base, 1rem); }

.gallery-grid__meta {
  display: flex;
  gap: var(--space-2, 0.5rem);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-muted, #a89e8a);
}
.gallery-grid__year, .gallery-grid__craft {
  font-family: var(--font-body, 'Inter', sans-serif);
}

.gallery-grid__gems {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-accent, #b8924b);
  margin: 0;
}

.gallery-grid__desc {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-fg-secondary, #d6cdb8);
  margin: 0;
  line-height: var(--lh-snug, 1.3);
}

.gallery-grid__empty {
  text-align: center;
  padding: var(--space-8, 2rem);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-fg-muted, #a89e8a);
}
</style>
