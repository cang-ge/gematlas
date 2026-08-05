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

// ─── Sidebar ────────────────────────────────────────────────────────

function sidebarEn() {
  return {
    '/classification/': [{ text: 'Classification', items: [
      { text: 'Overview', link: '/classification/intro' },
      { text: 'Crystal Systems', items: [
        { text: 'Cubic (Isometric)', link: '/classification/crystal-systems/cubic' },
        { text: 'Tetragonal', link: '/classification/crystal-systems/tetragonal' },
        { text: 'Orthorhombic', link: '/classification/crystal-systems/orthorhombic' },
        { text: 'Hexagonal', link: '/classification/crystal-systems/hexagonal' },
        { text: 'Trigonal', link: '/classification/crystal-systems/trigonal' },
        { text: 'Monoclinic', link: '/classification/crystal-systems/monoclinic' },
        { text: 'Triclinic', link: '/classification/crystal-systems/triclinic' },
      ] },
      { text: 'Mineral Groups', items: [
        { text: 'Overview', link: '/classification/mineral-groups/intro' },
        { text: 'Native Elements', link: '/classification/mineral-groups/native-elements' },
        { text: 'Oxides', link: '/classification/mineral-groups/oxides' },
        { text: 'Silicates — Framework', link: '/classification/mineral-groups/silicates-framework' },
        { text: 'Silicates — Chain / Band', link: '/classification/mineral-groups/silicates-chain' },
        { text: 'Silicates — Isolated / Rings', link: '/classification/mineral-groups/silicates-isolated' },
        { text: 'Phosphates', link: '/classification/mineral-groups/phosphates' },
        { text: 'Carbonates', link: '/classification/mineral-groups/carbonates' },
        { text: 'Sulfides', link: '/classification/mineral-groups/sulfides' },
        { text: 'Halides', link: '/classification/mineral-groups/halides' },
      ] },
      { text: 'Optical Phenomena', items: [
        { text: 'Overview', link: '/classification/optical-phenomena/intro' },
        { text: 'Asterism (Star)', link: '/classification/optical-phenomena/asterism' },
        { text: 'Chatoyancy (Cat\'s-Eye)', link: '/classification/optical-phenomena/chatoyancy' },
        { text: 'Color Change', link: '/classification/optical-phenomena/color-change' },
        { text: 'Adularescence (Moonstone)', link: '/classification/optical-phenomena/adularescence' },
        { text: 'Labradorescence (Spectrolite)', link: '/classification/optical-phenomena/labradorescence' },
        { text: 'Aventurescence (Sunstone)', link: '/classification/optical-phenomena/aventurescence' },
      ] },
      { text: 'Color Cause', items: [
        { text: 'Overview', link: '/classification/color-causes/intro' },
        { text: 'Transition-Metal Ions', link: '/classification/color-causes/transition-metal' },
        { text: 'Color Centers', link: '/classification/color-causes/color-centers' },
        { text: 'Charge Transfer', link: '/classification/color-causes/charge-transfer' },
      ] },
    ] }],
    '/identification/': [{ text: 'Identification', items: [
      { text: 'Overview', link: '/identification/intro' },
      { text: 'Physical Tests', link: '/identification/physical-tests' },
      { text: 'Optical Tests', link: '/identification/optical-tests' },
      { text: 'Synthetics & Imitations', link: '/identification/synthetic-and-imitation' },
      { text: 'Same-Colour Gems', link: '/identification/same-color-gems' },
    ] }],
    '/cutting/':         [{ text: 'Cutting', items: [
      { text: 'Overview', link: '/cutting/intro' },
      { text: 'Round Brilliant Cut', link: '/cutting/brilliant-cut' },
      { text: 'Fancy Cuts', link: '/cutting/fancy-cuts' },
      { text: 'Cabochon & Carving', link: '/cutting/cabochon-and-carving' },
    ] }],
    '/grading/':         [{ text: 'Grading', items: [
      { text: 'Overview', link: '/grading/intro' },
      { text: 'GIA 4Cs (Diamond)', link: '/grading/diamond-4cs' },
      { text: 'Coloured-Stone Grading', link: '/grading/colored-stones' },
      { text: 'Clarity Inclusion Types', link: '/grading/clarity-types' },
      { text: 'Origin & Treatment Disclosure', link: '/grading/origin-disclosure' },
    ] }],
    '/gallery/':         [{ text: 'Gallery', items: [
      { text: 'Overview', link: '/gallery/intro' },
      { text: 'By Maison', link: '/gallery/by-house' },
      { text: 'By Style Era', link: '/gallery/by-style' },
      { text: 'Legendary Stones', link: '/gallery/legendary-stones' },
    ] }],
  }
}

function sidebarZh() {
  return {
    '/zh/classification/': [{ text: '分类', items: [
      { text: '总览', link: '/zh/classification/intro' },
      { text: '晶系', items: [
        { text: '等轴晶系', link: '/zh/classification/crystal-systems/cubic' },
        { text: '四方晶系', link: '/zh/classification/crystal-systems/tetragonal' },
        { text: '斜方晶系', link: '/zh/classification/crystal-systems/orthorhombic' },
        { text: '六方晶系', link: '/zh/classification/crystal-systems/hexagonal' },
        { text: '三方晶系', link: '/zh/classification/crystal-systems/trigonal' },
        { text: '单斜晶系', link: '/zh/classification/crystal-systems/monoclinic' },
        { text: '三斜晶系', link: '/zh/classification/crystal-systems/triclinic' },
      ] },
      { text: '矿物分类组', items: [
        { text: '总览', link: '/zh/classification/mineral-groups/intro' },
        { text: '单质（原生元素）', link: '/zh/classification/mineral-groups/native-elements' },
        { text: '氧化物', link: '/zh/classification/mineral-groups/oxides' },
        { text: '硅酸盐 · 架状', link: '/zh/classification/mineral-groups/silicates-framework' },
        { text: '硅酸盐 · 链状', link: '/zh/classification/mineral-groups/silicates-chain' },
        { text: '硅酸盐 · 孤立/环状', link: '/zh/classification/mineral-groups/silicates-isolated' },
        { text: '磷酸盐', link: '/zh/classification/mineral-groups/phosphates' },
        { text: '碳酸盐', link: '/zh/classification/mineral-groups/carbonates' },
        { text: '硫化物', link: '/zh/classification/mineral-groups/sulfides' },
        { text: '卤化物', link: '/zh/classification/mineral-groups/halides' },
      ] },
      { text: '光学现象', items: [
        { text: '总览', link: '/zh/classification/optical-phenomena/intro' },
        { text: '星光效应', link: '/zh/classification/optical-phenomena/asterism' },
        { text: '猫眼效应', link: '/zh/classification/optical-phenomena/chatoyancy' },
        { text: '变色效应', link: '/zh/classification/optical-phenomena/color-change' },
        { text: '月光效应', link: '/zh/classification/optical-phenomena/adularescence' },
        { text: '拉长晕彩', link: '/zh/classification/optical-phenomena/labradorescence' },
        { text: '砂金效应', link: '/zh/classification/optical-phenomena/aventurescence' },
      ] },
      { text: '颜色成因', items: [
        { text: '总览', link: '/zh/classification/color-causes/intro' },
        { text: '过渡金属离子', link: '/zh/classification/color-causes/transition-metal' },
        { text: '色心致色', link: '/zh/classification/color-causes/color-centers' },
        { text: '电荷转移', link: '/zh/classification/color-causes/charge-transfer' },
      ] },
    ] }],
    '/zh/identification/': [{ text: '鉴定', items: [
      { text: '总览', link: '/zh/identification/intro' },
      { text: '物理性质测试', link: '/zh/identification/physical-tests' },
      { text: '光学测试', link: '/zh/identification/optical-tests' },
      { text: '合成品与仿品鉴别', link: '/zh/identification/synthetic-and-imitation' },
      { text: '同色宝石判别', link: '/zh/identification/same-color-gems' },
    ] }],
    '/zh/cutting/':        [{ text: '切割', items: [
      { text: '总览', link: '/zh/cutting/intro' },
      { text: '圆明亮式切工', link: '/zh/cutting/brilliant-cut' },
      { text: '花式切工', link: '/zh/cutting/fancy-cuts' },
      { text: '蛋面与雕刻', link: '/zh/cutting/cabochon-and-carving' },
    ] }],
    '/zh/grading/':        [{ text: '分级', items: [
      { text: '总览', link: '/zh/grading/intro' },
      { text: 'GIA 4C 钻石分级', link: '/zh/grading/diamond-4cs' },
      { text: '彩色宝石分级', link: '/zh/grading/colored-stones' },
      { text: '净度瑕疵类型', link: '/zh/grading/clarity-types' },
      { text: '产地与处理披露', link: '/zh/grading/origin-disclosure' },
    ] }],
    '/zh/gallery/':        [{ text: '画廊', items: [
      { text: '总览', link: '/zh/gallery/intro' },
      { text: '顶级珠宝工坊', link: '/zh/gallery/by-house' },
      { text: '设计风格史', link: '/zh/gallery/by-style' },
      { text: '传奇宝石', link: '/zh/gallery/legendary-stones' },
    ] }],
  }
}
