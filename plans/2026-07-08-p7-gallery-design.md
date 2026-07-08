# P7 Design Spec — Gallery Module (Module ⑥)

**Goal:** GalleryGrid.vue with 18 pieces × 7 brands + filtering + gallery pages.

## Component

### GalleryGrid.vue

**Path:** `docs/.vitepress/theme/components/GalleryGrid.vue`

**Props:** `locale?: 'en' | 'zh'`

**Data:** Hardcoded array of 18 pieces with: brand, name (zh+en), year, craft, gemTypes, description (zh+en).

**Filter buttons:** 3 categories: Brand (7 brands), Era (Pre-1900/1900-1950/1950-2000/2000+), Gem Type (Ruby/Sapphire/Emerald/Diamond/...)

**Layout:** Responsive grid. Each card: brand name + piece name + year + craft + gems. Clickable? No (static). Hover: brass border highlight.

## Pages

### docs/{en,zh}/gallery/intro.md

- Brief intro
- `<GalleryGrid locale="en" />`
