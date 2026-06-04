// assets/js/i18n.js
const LANGS = ['zh', 'en'];
const I18N = {
  'nav.market':      { zh: '市场',        en: 'Marketplace' },
  'nav.how':         { zh: '如何工作',     en: 'How it works' },
  'nav.console':     { zh: '体验控制台',   en: 'Try the Console' },
  'cta.browse':      { zh: '浏览能力',     en: 'Browse capabilities' },
  'cta.activate':    { zh: '开通能力',     en: 'Activate' },
  'hero.title':      { zh: '把院内影像 AI，变成人和智能体都能直接调用的标准服务',
                       en: 'Turn in-house imaging AI into standard services your people AND your agents can call directly' },
  'hero.sub':        { zh: '一个门户，人用 Web、智能体用 MCP，同一套能力，私域安全。',
                       en: 'One portal. People use the web, agents use MCP — same capabilities, private and secure.' },
  'section.what':    { zh: '它是什么',     en: 'What it is' },
  'section.featured':{ zh: '精选能力',     en: 'Featured capabilities' },
  'section.trust':   { zh: '真实认证',     en: 'Real clearances' },
  'catalog.title':   { zh: '能力目录',     en: 'Capability catalog' },
  'catalog.search':  { zh: '搜索能力',     en: 'Search capabilities' },
  'catalog.count':   { zh: '个能力',       en: 'capabilities' },
  'filter.type':     { zh: '类型',         en: 'Type' },
  'filter.modality': { zh: '模态',         en: 'Modality' },
  'detail.human':    { zh: '人类视图',     en: 'Human view' },
  'detail.agent':    { zh: '机器视图 / 智能体', en: 'Machine view / Agent' },
  'detail.clinical': { zh: '临床用途',     en: 'Clinical use' },
  'detail.copyMd':   { zh: '复制成 markdown 喂给你的 AI', en: 'Copy as markdown for your AI' },
  'detail.connect':  { zh: '连接配置',     en: 'Connection config' },
  'badge.fda':       { zh: 'FDA 510(k) 认证', en: 'FDA 510(k) Cleared' },
  'badge.demo':      { zh: '演示·非器械',  en: 'Demo · not a device' },
  'console.demo':    { zh: 'DEMO · 演示数据', en: 'DEMO · sample data' },
  'console.dashboard':{ zh: '控制台',      en: 'Console' },
  'console.services':{ zh: '我的服务',     en: 'My services' },
  'console.connect': { zh: '连接与凭据',   en: 'Connect & credentials' },
  'console.usage':   { zh: '用量 / 订阅',  en: 'Usage / Plan' },
  'status.online':   { zh: '智能体已连接', en: 'Agent connected' },
  'copy.done':       { zh: '已复制 ✓',     en: 'Copied ✓' },
  'copy.label':      { zh: '复制',         en: 'Copy' },
  'foot.copy':       { zh: '© 2026 联影智能 · Agent Hub', en: '© 2026 United Imaging Intelligence · Agent Hub' }
};
function t(key, lang) {
  const e = I18N[key];
  if (!e) return key;
  return e[lang] || e.zh || key;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { I18N, t, LANGS };
if (typeof window !== 'undefined') { window.I18N = I18N; window.t = t; window.LANGS = LANGS; }
