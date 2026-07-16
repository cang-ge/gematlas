import { defineConfig } from 'vitepress'

/**
 * GemAtlas — VitePress configuration
 *
 * Bilingual (root = English, /zh/ = Chinese).
 * Visual: deep ink background + brass accent + serif display.
 * i18n routing: automatic (/foo → /zh/foo) via default VitePress behavior.
 */
export default defineConfig({
  base: '/gematlas/',
  title: 'GemAtlas',
  // Title prefix; ':title' is replaced by per-page title.
  // Bare title on '/' (no suffix) reads cleanly — no leading colon.
  titleTemplate: ':title | GemAtlas',
  description:
    'GemAtlas — A bilingual open-source gemological knowledge platform covering classification, identification, cutting, grading, and luxury maison craftsmanship.',
  lastUpdated: true,
  ignoreDeadLinks: true,

  // Dark mode is the only mode for now (the brand demands it)
  appearance: 'dark',

  // ─── Head: webfonts + favicon ─────────────────────────────────
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/gematlas/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap',
      },
    ],
  ],

  // ─── i18n: root (en) + /zh/ (zh) ─────────────────────────────────
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'The Open Gemological Compendium',
      themeConfig: {
        nav: navEn(),
        sidebar: sidebarEn(),
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: '宝石学的完备图典',
      themeConfig: {
        nav: navZh(),
        sidebar: sidebarZh(),
      },
    },
  },

  // ─── Shared theme config ─────────────────────────────────────────
  themeConfig: {
    siteTitle: 'GemAtlas',

    // Logo source (dark SVG mark). Resolves to /logo.svg at build time.
    // A brass-tinted gem mark SVG lands in P3.
    logo: { src: '/logo.svg', alt: 'GemAtlas' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/<owner>/gematlas' },
    ],

    footer: {
      message: 'GemAtlas · Open-source gemological knowledge',
      copyright: `MIT Licensed · Copyright © 2026–present GemAtlas contributors`,
    },

    // Local search (FlexSearch under the hood)
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    outline: { level: [2, 3], label: 'On this page' },

    docFooter: { prev: 'Previous', next: 'Next' },
  },
})

// ─── Navigation ─────────────────────────────────────────────────────

function navEn() {
  return [
    { text: 'Classification', link: '/classification/intro' },
    { text: 'Identification', link: '/identification/intro' },
    { text: 'Cutting', link: '/cutting/intro' },
    { text: 'Grading', link: '/grading/intro' },
    { text: 'Gallery', link: '/gallery/intro' },
  ]
}

function navZh() {
  return [
    { text: '分类', link: '/zh/classification/intro' },
    { text: '鉴定', link: '/zh/identification/intro' },
    { text: '切割', link: '/zh/cutting/intro' },
    { text: '分级', link: '/zh/grading/intro' },
    { text: '画廊', link: '/zh/gallery/intro' },
  ]
}

// ─── Sidebar (V1.0 stub; expanded when module pages land in P3–P7) ──

function sidebarEn() {
  return {
    '/classification/': [{ text: 'Classification', items: [
      { text: 'Overview', link: 'intro' },
      { text: 'Crystal Systems', items: [
        { text: 'Cubic (Isometric)', link: 'crystal-systems/cubic' },
        { text: 'Tetragonal', link: 'crystal-systems/tetragonal' },
        { text: 'Orthorhombic', link: 'crystal-systems/orthorhombic' },
        { text: 'Hexagonal', link: 'crystal-systems/hexagonal' },
        { text: 'Trigonal', link: 'crystal-systems/trigonal' },
        { text: 'Monoclinic', link: 'crystal-systems/monoclinic' },
        { text: 'Triclinic', link: 'crystal-systems/triclinic' },
      ] },
      { text: 'Mineral Groups', items: [
        { text: 'Overview', link: 'mineral-groups/intro' },
        { text: 'Native Elements', link: 'mineral-groups/native-elements' },
        { text: 'Oxides', link: 'mineral-groups/oxides' },
        { text: 'Silicates — Framework', link: 'mineral-groups/silicates-framework' },
        { text: 'Silicates — Chain / Band', link: 'mineral-groups/silicates-chain' },
        { text: 'Silicates — Isolated / Rings', link: 'mineral-groups/silicates-isolated' },
        { text: 'Phosphates', link: 'mineral-groups/phosphates' },
        { text: 'Carbonates', link: 'mineral-groups/carbonates' },
        { text: 'Sulfides', link: 'mineral-groups/sulfides' },
        { text: 'Halides', link: 'mineral-groups/halides' },
      ] },
      { text: 'Optical Phenomena', items: [
        { text: 'Overview', link: 'optical-phenomena/intro' },
        { text: 'Asterism (Star)', link: 'optical-phenomena/asterism' },
        { text: 'Chatoyancy (Cat\'s-Eye)', link: 'optical-phenomena/chatoyancy' },
        { text: 'Color Change', link: 'optical-phenomena/color-change' },
        { text: 'Adularescence (Moonstone)', link: 'optical-phenomena/adularescence' },
        { text: 'Labradorescence (Spectrolite)', link: 'optical-phenomena/labradorescence' },
        { text: 'Aventurescence (Sunstone)', link: 'optical-phenomena/aventurescence' },
      ] },
      { text: 'Color Cause', items: [
        { text: 'Overview', link: 'color-causes/intro' },
        { text: 'Transition-Metal Ions', link: 'color-causes/transition-metal' },
        { text: 'Color Centers', link: 'color-causes/color-centers' },
        { text: 'Charge Transfer', link: 'color-causes/charge-transfer' },
      ] },
    ] }],
    '/identification/': [{ text: 'Identification', items: [{ text: 'Overview', link: 'intro' }] }],
    '/cutting/':         [{ text: 'Cutting',         items: [{ text: 'Overview', link: 'intro' }] }],
    '/grading/':         [{ text: 'Grading',         items: [{ text: 'Overview', link: 'intro' }] }],
    '/gallery/':         [{ text: 'Gallery',         items: [{ text: 'Overview', link: 'intro' }] }],
  }
}

function sidebarZh() {
  return {
    '/zh/classification/': [{ text: '分类', items: [
      { text: '总览', link: 'intro' },
      { text: '晶系', items: [
        { text: '等轴晶系', link: 'crystal-systems/cubic' },
        { text: '四方晶系', link: 'crystal-systems/tetragonal' },
        { text: '斜方晶系', link: 'crystal-systems/orthorhombic' },
        { text: '六方晶系', link: 'crystal-systems/hexagonal' },
        { text: '三方晶系', link: 'crystal-systems/trigonal' },
        { text: '单斜晶系', link: 'crystal-systems/monoclinic' },
        { text: '三斜晶系', link: 'crystal-systems/triclinic' },
      ] },
      { text: '矿物分类组', items: [
        { text: '总览', link: 'mineral-groups/intro' },
        { text: '单质（原生元素）', link: 'mineral-groups/native-elements' },
        { text: '氧化物', link: 'mineral-groups/oxides' },
        { text: '硅酸盐 · 架状', link: 'mineral-groups/silicates-framework' },
        { text: '硅酸盐 · 链状', link: 'mineral-groups/silicates-chain' },
        { text: '硅酸盐 · 孤立/环状', link: 'mineral-groups/silicates-isolated' },
        { text: '磷酸盐', link: 'mineral-groups/phosphates' },
        { text: '碳酸盐', link: 'mineral-groups/carbonates' },
        { text: '硫化物', link: 'mineral-groups/sulfides' },
        { text: '卤化物', link: 'mineral-groups/halides' },
      ] },
      { text: '光学现象', items: [
        { text: '总览', link: 'optical-phenomena/intro' },
        { text: '星光效应', link: 'optical-phenomena/asterism' },
        { text: '猫眼效应', link: 'optical-phenomena/chatoyancy' },
        { text: '变色效应', link: 'optical-phenomena/color-change' },
        { text: '月光效应', link: 'optical-phenomena/adularescence' },
        { text: '拉长晕彩', link: 'optical-phenomena/labradorescence' },
        { text: '砂金效应', link: 'optical-phenomena/aventurescence' },
      ] },
      { text: '颜色成因', items: [
        { text: '总览', link: 'color-causes/intro' },
        { text: '过渡金属离子', link: 'color-causes/transition-metal' },
        { text: '色心致色', link: 'color-causes/color-centers' },
        { text: '电荷转移', link: 'color-causes/charge-transfer' },
      ] },
    ] }],
    '/zh/identification/': [{ text: '鉴定', items: [{ text: '总览', link: 'intro' }] }],
    '/zh/cutting/':        [{ text: '切割', items: [{ text: '总览', link: 'intro' }] }],
    '/zh/grading/':        [{ text: '分级', items: [{ text: '总览', link: 'intro' }] }],
    '/zh/gallery/':        [{ text: '画廊', items: [{ text: '总览', link: 'intro' }] }],
  }
}
