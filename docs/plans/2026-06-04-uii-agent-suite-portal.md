# 联影智能 Agent Hub 门户 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个中英双语、黑底+青绿的 vanilla 静态「概念展示型门户」，用真实 FDA 数据的能力目录 + 人机双轨详情 + 可点击伪控制台 demo + 真实机器视图产物（llms.txt / catalog.json），向医院展示联影智能 AI 能力平台理念。

**Architecture:** 纯静态多页站点（无后端、无构建框架）。数据与逻辑放在 UMD 风格 JS 模块（浏览器用 `<script>` 全局、Node 用 `require` 测试两用）。页面是薄壳，渲染交给共享 `components.js`；`main.js` 注入统一深色页头/页脚并管理语言切换。机器视图 `catalog.json` / `llms.txt` 由 Node 脚本从同一份能力数据生成，保证人机两侧同源。

**Tech Stack:** HTML5 + CSS（设计 token 分层）+ vanilla JS（UMD）。测试用 Node 内置 `node:test` + `node:assert`（`node --test`）。字体 Space Grotesk / Inter / JetBrains Mono。零运行时依赖。

**测试策略说明（重要）：** 本项目是静态展示站。**纯逻辑单元（数据校验、筛选、markdown/json/llms 生成）走 TDD（先写失败测试）**；**页面/视觉走"验证步骤"**（用本地静态服务器在浏览器/预览中核对具体可见结果）。两者都要有明确的"运行 + 预期"。

**本地预览约定：** 用零依赖静态服务器：`npx -y serve -l 5050 .`（或 `python -m http.server 5050`）。下文"验证"步骤默认站点已通过它在 `http://localhost:5050` 提供。

---

## 文件结构（决策锁定）

```
E:\UiiAgentHub\
  index.html                      # 首页 /（单页叙事）
  catalog.html                    # 能力目录 /catalog
  capability.html                 # 能力详情（用 ?id= 读取）
  how-it-works.html               # 如何工作
  console/
    index.html                    # 伪控制台首页
    services.html                 # 我的服务
    connect.html                  # 连接与凭据（机器视图落点）
    usage.html                    # 用量 / 订阅
  assets/
    css/tokens.css                # 设计 token（黑+青绿、字体、圆角、阴影、明暗）
    css/base.css                  # 基础排版/布局/组件（页头页脚/卡片/详情/连接块/徽章）
    css/console.css               # 伪控制台外壳样式
    js/i18n.js                    # UMD：双语字典 + 语言状态 + t()
    js/capabilities.js            # UMD：能力数据（真实 FDA，双语）——唯一数据源
    js/filters.js                 # UMD：filterCapabilities()（纯函数）
    js/catalog-format.js          # UMD：capabilityToMarkdown/buildCatalogJson/buildLlmsTxt（纯函数）
    js/components.js              # UMD：渲染函数（卡片/详情/连接块/徽章/复制）
    js/main.js                    # 注入页头页脚、语言切换、滚动头
    js/app-catalog.js             # 目录页逻辑
    js/app-capability.js          # 详情页逻辑
    js/app-console.js             # 控制台各页逻辑
    img/                          # logo 等（复用 v1 assets）
  data/catalog.json               # 机器视图（脚本生成，勿手改）
  llms.txt                        # 机器视图（脚本生成，勿手改）
  scripts/build-machine-views.js  # Node：从 capabilities.js 生成 catalog.json + llms.txt
  tests/capabilities.test.js
  tests/filters.test.js
  tests/catalog-format.test.js
  tests/build.test.js
  package.json                    # 仅声明 scripts；无运行时依赖
```

**UMD 模块约定**（所有 `assets/js/*.js` 数据/逻辑模块统一用此尾部，使浏览器全局与 Node `require` 两用）：

```js
// 文件末尾统一写法（以 capabilities.js 为例）
if (typeof module !== 'undefined' && module.exports) module.exports = { CAPABILITIES };
if (typeof window !== 'undefined') window.CAPABILITIES = CAPABILITIES;
```

**参考真实文件**：v1 的样式与渲染模式在 `E:\Workspace_API team\20260526-skill-hub-web\styles.css` 与 `app.js`，可作为卡片/弹窗/排版的成熟参考——本计划在需要时给出"从该文件移植 X 并把颜色替换为 token"的具体指令（非占位符，是明确的来源文件 + 改法）。

---

## Phase 0 · 项目骨架与数据/逻辑（TDD）

### Task 1: 初始化项目 + 设计 token

**Files:**
- Create: `E:\UiiAgentHub\package.json`
- Create: `E:\UiiAgentHub\assets\css\tokens.css`
- Create: `E:\UiiAgentHub\assets\css\base.css`（本任务先建空文件，后续任务填充）
- Create: `E:\UiiAgentHub\_scratch.html`（临时验证页，最后删除）

- [ ] **Step 1: 写 package.json**

```json
{
  "name": "uii-agent-suite",
  "version": "0.1.0",
  "private": true,
  "description": "联影智能 Agent Hub 概念展示门户",
  "scripts": {
    "test": "node --test",
    "build:machine": "node scripts/build-machine-views.js",
    "serve": "npx -y serve -l 5050 ."
  }
}
```

- [ ] **Step 2: 写 tokens.css（颜色/字体/圆角/阴影，全部按 spec 锁定值）**

```css
/* assets/css/tokens.css — 黑底 + 青绿单一关键色 */
:root {
  /* 关键色（唯一） */
  --key: #0fd78a;            /* 青绿：AI/智能体/在线/主 CTA/强调 */
  --key-ink: #063b2a;        /* 青绿底上的深色文字 */
  --key-strong: #0a8f5d;     /* 浅底上的青绿文字（保对比） */
  --key-tint: #e6faf2;       /* 浅青绿底 */
  --key-glow: rgba(15,215,138,.14);

  /* 中性基底 */
  --black: #121212;          /* hero/页头/深色叙事/控制台外壳 */
  --near-black: #0d1117;     /* 机器视图/代码/连接块 */
  --white: #ffffff;
  --bg-section: #fafbfc;
  --bg-pill: #f3f4f6;
  --border: #e5e7eb;
  --border-strong: #d1d5db;
  --ink: #111827;
  --ink-2: #4b5563;
  --ink-3: #6b7280;
  --ink-muted: #9ca3af;
  --on-dark: #e5e7eb;
  --on-dark-muted: #9aa0a6;

  /* 装饰色（极少量） */
  --gold: #c59d62;           /* 仅“企业版/认证”点缀 */
  --blue: #0599c8;           /* 仅次级链接等极少量 */

  /* 字体 */
  --font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;

  /* 圆角/阴影/尺寸（沿用 v1 量纲） */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-pill: 999px;
  --shadow-card: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
  --shadow-card-hover: 0 6px 20px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
  --max-width: 1280px;
}
* , *::before, *::after { box-sizing: border-box; }
```

- [ ] **Step 3: 建空 base.css**

写入一行注释占位：`/* assets/css/base.css — filled in later tasks */`

- [ ] **Step 4: 写 _scratch.html 验证 token 生效**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<link rel="stylesheet" href="assets/css/tokens.css"></head>
<body style="margin:0">
  <div style="background:var(--black);color:#fff;padding:24px;font-family:var(--font-body)">
    黑底 <span style="color:var(--key)">青绿 #0fd78a</span>
    <button style="background:var(--key);color:var(--key-ink);border:0;padding:8px 14px;border-radius:8px">开通能力 / Activate</button>
  </div>
  <div style="background:#fff;padding:24px">浅底 <a style="color:var(--key-strong)">青绿链接</a></div>
</body></html>
```

- [ ] **Step 5: 验证**

Run: `cd /e/UiiAgentHub && npx -y serve -l 5050 .` 然后浏览器打开 `http://localhost:5050/_scratch.html`
Expected: 看到黑底块上有青绿文字与青绿按钮（深色字）、白底块上有加深青绿链接。颜色与 `#0fd78a` 一致。

- [ ] **Step 6: Commit**

```bash
cd /e/UiiAgentHub && git init -q 2>/dev/null; printf "node_modules/\n.superpowers/\n.DS_Store\n" > .gitignore
git add package.json assets/css/tokens.css assets/css/base.css .gitignore
git commit -q -m "chore: scaffold project + design tokens (black + teal-green)"
```

---

### Task 2: i18n 模块（双语字典 + t()）

**Files:**
- Create: `assets/js/i18n.js`
- Test: `tests/i18n.test.js`

- [ ] **Step 1: 写失败测试**

```js
// tests/i18n.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { I18N, t, LANGS } = require('../assets/js/i18n.js');

test('LANGS contains zh and en', () => {
  assert.deepStrictEqual(LANGS, ['zh', 'en']);
});
test('t() returns the right language string', () => {
  assert.strictEqual(t('nav.market', 'zh'), '市场');
  assert.strictEqual(t('nav.market', 'en'), 'Marketplace');
});
test('t() falls back to key when missing', () => {
  assert.strictEqual(t('nope.key', 'zh'), 'nope.key');
});
test('every chrome key has both zh and en', () => {
  for (const [k, v] of Object.entries(I18N)) {
    assert.ok(v.zh && v.en, `missing translation for ${k}`);
  }
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /e/UiiAgentHub && node --test tests/i18n.test.js`
Expected: FAIL（Cannot find module '../assets/js/i18n.js'）

- [ ] **Step 3: 写 i18n.js**

```js
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /e/UiiAgentHub && node --test tests/i18n.test.js`
Expected: PASS（4 tests）

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/i18n.js tests/i18n.test.js
git commit -q -m "feat: bilingual i18n module + tests"
```

---

### Task 3: 能力数据（真实 FDA · 双语）

**Files:**
- Create: `assets/js/capabilities.js`
- Test: `tests/capabilities.test.js`

- [ ] **Step 1: 写失败测试（数据契约 + 真实性约束）**

```js
// tests/capabilities.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODALITIES = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('has at least 10 capabilities', () => {
  assert.ok(CAPABILITIES.length >= 10);
});
test('ids are unique and kebab-case', () => {
  const ids = CAPABILITIES.map(c => c.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  ids.forEach(id => assert.match(id, /^[a-z0-9-]+$/));
});
test('each capability has valid type/modality and bilingual text', () => {
  for (const c of CAPABILITIES) {
    assert.ok(TYPES.includes(c.type), `${c.id} bad type`);
    assert.ok(MODALITIES.includes(c.modality), `${c.id} bad modality`);
    for (const f of ['title', 'tagline', 'description', 'clinicalUse']) {
      assert.ok(c.i18n[f] && c.i18n[f].zh && c.i18n[f].en, `${c.id} missing i18n.${f}`);
    }
  }
});
test('non-skill capabilities carry a real FDA K-number', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') continue;
    assert.match(c.fda.kNumber, /^K\d{6}$/, `${c.id} bad K-number`);
    assert.match(c.fda.decisionDate, /^\d{4}-\d{2}-\d{2}$/, `${c.id} bad date`);
    assert.ok(c.fda.productCode, `${c.id} missing productCode`);
  }
});
test('skill items are flagged demo and not a device', () => {
  const skills = CAPABILITIES.filter(c => c.type === 'skill');
  assert.ok(skills.length >= 1);
  skills.forEach(c => assert.ok((c.badges || []).includes('demo')));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && node --test tests/capabilities.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 写 capabilities.js（真实 FDA 数据，来自 openFDA 510(k)，2026-06-04 核验）**

```js
// assets/js/capabilities.js  —— 唯一数据源；勿在页面里另存副本
const CAPABILITIES = [
  { id: 'uai-easy-triage-ich', type: 'clinical-ai', modality: 'CT', icon: '🧠', badges: ['fda'],
    fda: { kNumber: 'K242292', decisionDate: '2024-09-24', productCode: 'QAS',
      productCodeName: 'Radiological Computer-Assisted Triage and Notification Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.' },
    inputs: ['CT'], outputs: ['triage-flag'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/ich-triage', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'uAI Easy Triage ICH', en: 'uAI Easy Triage ICH' },
      tagline: { zh: '颅内出血 CT 智能分诊', en: 'Intracranial hemorrhage CT triage' },
      description: { zh: '分析非增强头颅 CT，自动检测疑似颅内出血(ICH)并在工作列表中提示优先级，辅助分诊。',
        en: 'Analyzes non-contrast head CT to detect suspected intracranial hemorrhage (ICH) and flag worklist prioritization for triage.' },
      clinicalUse: { zh: '急诊 / 卒中通道的 ICH 优先级提醒（CADt）。', en: 'ICH prioritization & notification for ED / stroke pathways (CADt).' } } },

  { id: 'uai-easytriage-rib', type: 'clinical-ai', modality: 'CT', icon: '🦴', badges: ['fda'],
    fda: { kNumber: 'K193271', decisionDate: '2021-01-15', productCode: 'QFM',
      productCodeName: 'Radiological Computer-Aided Prioritization Software for Lesions',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.' },
    inputs: ['CT'], outputs: ['priority-list'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/rib-triage', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'uAI EasyTriage-Rib', en: 'uAI EasyTriage-Rib' },
      tagline: { zh: '肋骨骨折 CT 智能优先级', en: 'Rib fracture CT prioritization' },
      description: { zh: '检测胸部 CT 上的肋骨骨折并标注优先级，辅助阅片排序。',
        en: 'Detects rib fractures on chest CT and assigns prioritization to assist reading order.' },
      clinicalUse: { zh: '创伤 / 急诊胸部 CT 的病灶优先级（CAD）。', en: 'Lesion prioritization for trauma / ED chest CT (CAD).' } } },

  { id: 'uai-portal', type: 'platform', modality: 'Cross', icon: '🧩', badges: ['fda'],
    fda: { kNumber: 'K240411', decisionDate: '2024-09-06', productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.' },
    inputs: ['CT', 'MR'], outputs: ['processed-image'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/portal', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'uAI Portal', en: 'uAI Portal' },
      tagline: { zh: 'AI 影像处理平台', en: 'AI image-processing platform' },
      description: { zh: '自动化放射影像处理与 AI 应用承载平台。',
        en: 'Automated radiological image processing and an AI application hosting platform.' },
      clinicalUse: { zh: '院内多模态影像的自动化 AI 处理底座。', en: 'In-house automated AI processing base for multi-modality imaging.' } } },

  { id: 'uomnispace-ct', type: 'platform', modality: 'CT', icon: '🖥️', badges: ['fda'],
    fda: { kNumber: 'K233209', decisionDate: '2024-05-17', productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['CT'], outputs: ['post-processed'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/omnispace-ct', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'uOmnispace.CT', en: 'uOmnispace.CT' },
      tagline: { zh: 'CT 影像 AI 后处理', en: 'CT AI post-processing' },
      description: { zh: 'CT 影像的 AI 后处理与高级可视化软件。',
        en: 'AI post-processing and advanced visualization software for CT.' },
      clinicalUse: { zh: 'CT 阅片的后处理工作站软件。', en: 'Post-processing workstation software for CT reading.' } } },

  { id: 'uomnispace-mr', type: 'platform', modality: 'MR', icon: '🖥️', badges: ['fda'],
    fda: { kNumber: 'K233186', decisionDate: '2024-04-17', productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['MR'], outputs: ['post-processed'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/omnispace-mr', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'uOmnispace.MR', en: 'uOmnispace.MR' },
      tagline: { zh: 'MR 影像 AI 后处理', en: 'MR AI post-processing' },
      description: { zh: 'MR 影像的 AI 后处理与高级可视化软件（另见 K253077）。',
        en: 'AI post-processing and advanced visualization software for MR (see also K253077).' },
      clinicalUse: { zh: 'MR 阅片的后处理工作站软件。', en: 'Post-processing workstation software for MR reading.' } } },

  { id: 'hyper-dlr', type: 'reconstruction', modality: 'PET', icon: '✨', badges: ['fda', 'system'],
    fda: { kNumber: 'K193210', decisionDate: '2020-08-04', productCode: 'KPS',
      productCodeName: 'Cleared within PET/CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['PET'], outputs: ['denoised-image'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-dlr', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'HYPER DLR', en: 'HYPER DLR' },
      tagline: { zh: 'PET 深度学习降噪重建', en: 'PET deep-learning denoising' },
      description: { zh: '用预训练神经网络降低 FDG-PET 图像噪声、提升信噪比（随影像系统获批）。',
        en: 'Uses a pretrained neural network to reduce FDG-PET noise and improve SNR (cleared within the imaging system).' },
      clinicalUse: { zh: '分子影像 PET 的深度学习重建增强。', en: 'Deep-learning reconstruction enhancement for molecular PET.' } } },

  { id: 'deep-recon', type: 'reconstruction', modality: 'CT', icon: '✨', badges: ['fda', 'system'],
    fda: { kNumber: 'K193073', decisionDate: '2020-07-06', productCode: 'JAK',
      productCodeName: 'Cleared within CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['CT'], outputs: ['reconstructed-image'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/deep-recon', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'Deep Recon', en: 'Deep Recon' },
      tagline: { zh: 'CT 深度学习重建', en: 'CT deep-learning reconstruction' },
      description: { zh: 'CT 图像的深度学习重建，提升图像质量（随影像系统获批）。',
        en: 'Deep-learning reconstruction for CT that improves image quality (cleared within the imaging system).' },
      clinicalUse: { zh: 'CT 成像的深度学习重建增强。', en: 'Deep-learning reconstruction enhancement for CT.' } } },

  { id: 'hyper-air', type: 'reconstruction', modality: 'MR', icon: '✨', badges: ['fda', 'system'],
    fda: { kNumber: 'K210001', decisionDate: '2021-04-30', productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['MR'], outputs: ['reconstructed-image'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-air', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'HYPER AiR', en: 'HYPER AiR' },
      tagline: { zh: 'MR 深度学习加速重建', en: 'MR deep-learning accelerated recon' },
      description: { zh: 'MR 的深度学习加速与重建（随影像系统获批）。',
        en: 'Deep-learning acceleration and reconstruction for MR (cleared within the imaging system).' },
      clinicalUse: { zh: 'MR 成像提速与重建增强。', en: 'Acceleration and reconstruction enhancement for MR.' } } },

  { id: 'hyper-focus', type: 'reconstruction', modality: 'Cross', icon: '✨', badges: ['fda', 'system'],
    fda: { kNumber: 'K210418', decisionDate: '2021-04-09', productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.' },
    inputs: ['PET'], outputs: ['reconstructed-image'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-focus', apiKeyHint: 'uii_sk_••••', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'HYPER Focus', en: 'HYPER Focus' },
      tagline: { zh: '深度学习重建', en: 'Deep-learning reconstruction' },
      description: { zh: '深度学习重建技术，提升图像质量（随影像系统获批）。',
        en: 'Deep-learning reconstruction that improves image quality (cleared within the imaging system).' },
      clinicalUse: { zh: '影像重建的深度学习增强。', en: 'Deep-learning enhancement for image reconstruction.' } } },

  { id: 'vitallens-rppg', type: 'skill', modality: 'Cross', icon: '❤️', badges: ['demo'],
    fda: null, inputs: ['video'], outputs: ['data'],
    connect: { mcpEndpoint: 'mcp://hub.uii-ai.example/vitallens', apiKeyHint: 'demo', llmsTxt: '/llms.txt' },
    i18n: {
      title: { zh: 'vitallens-rppg', en: 'vitallens-rppg' },
      tagline: { zh: '摄像头无接触心率/呼吸率（演示）', en: 'Contactless HR/RR via webcam (demo)' },
      description: { zh: '用摄像头无接触采集约 12 秒视频，返回心率与呼吸率。研究/演示用，非医疗器械。',
        en: 'Contactless ~12s webcam capture returning heart rate and respiratory rate. Research/demo only, not a medical device.' },
      clinicalUse: { zh: '展示 “Skill 类型” 的开发者能力示例（非器械）。', en: 'Example of a developer “Skill” type (not a device).' } } }
];
if (typeof module !== 'undefined' && module.exports) module.exports = { CAPABILITIES };
if (typeof window !== 'undefined') window.CAPABILITIES = CAPABILITIES;
```

- [ ] **Step 4: 运行确认通过**

Run: `cd /e/UiiAgentHub && node --test tests/capabilities.test.js`
Expected: PASS（5 tests）

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/capabilities.js tests/capabilities.test.js
git commit -q -m "feat: FDA-verified bilingual capability dataset + contract tests"
```

---

### Task 4: 筛选纯函数

**Files:**
- Create: `assets/js/filters.js`
- Test: `tests/filters.test.js`

- [ ] **Step 1: 写失败测试**

```js
// tests/filters.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { filterCapabilities } = require('../assets/js/filters.js');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

test('no filters returns all', () => {
  assert.strictEqual(filterCapabilities(CAPABILITIES, {}).length, CAPABILITIES.length);
});
test('type filter works', () => {
  const r = filterCapabilities(CAPABILITIES, { type: 'clinical-ai' });
  assert.ok(r.length >= 2 && r.every(c => c.type === 'clinical-ai'));
});
test('modality filter works', () => {
  const r = filterCapabilities(CAPABILITIES, { modality: 'PET' });
  assert.ok(r.every(c => c.modality === 'PET'));
});
test('query matches title/tagline/description bilingually', () => {
  assert.ok(filterCapabilities(CAPABILITIES, { q: 'ICH' }).some(c => c.id === 'uai-easy-triage-ich'));
  assert.ok(filterCapabilities(CAPABILITIES, { q: '肋骨' }).some(c => c.id === 'uai-easytriage-rib'));
  assert.ok(filterCapabilities(CAPABILITIES, { q: 'reconstruction' }).every(c => c.type === 'reconstruction' || /recon/i.test(JSON.stringify(c.i18n))));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && node --test tests/filters.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 写 filters.js**

```js
// assets/js/filters.js
function filterCapabilities(caps, { q, type, modality } = {}) {
  const needle = (q || '').trim().toLowerCase();
  return caps.filter(c => {
    if (type && c.type !== type) return false;
    if (modality && c.modality !== modality) return false;
    if (needle) {
      const hay = [c.id, JSON.stringify(c.i18n), c.fda && c.fda.kNumber, c.modality]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}
if (typeof module !== 'undefined' && module.exports) module.exports = { filterCapabilities };
if (typeof window !== 'undefined') window.filterCapabilities = filterCapabilities;
```

- [ ] **Step 4: 运行确认通过**

Run: `cd /e/UiiAgentHub && node --test tests/filters.test.js`
Expected: PASS（4 tests）

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/filters.js tests/filters.test.js
git commit -q -m "feat: capability filter (pure) + tests"
```

---

### Task 5: 机器视图格式化纯函数（markdown / catalog.json / llms.txt）

**Files:**
- Create: `assets/js/catalog-format.js`
- Test: `tests/catalog-format.test.js`

- [ ] **Step 1: 写失败测试**

```js
// tests/catalog-format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } = require('../assets/js/catalog-format.js');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich');

test('capabilityToMarkdown includes title, K-number and MCP endpoint', () => {
  const md = capabilityToMarkdown(ich, 'en');
  assert.match(md, /uAI Easy Triage ICH/);
  assert.match(md, /K242292/);
  assert.match(md, /mcp:\/\/hub\.uii-ai\.example\/ich-triage/);
});
test('buildCatalogJson returns machine catalog with stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  assert.strictEqual(cat.version, 1);
  assert.strictEqual(cat.items.length, CAPABILITIES.length);
  const item = cat.items.find(i => i.id === 'uai-easy-triage-ich');
  assert.strictEqual(item.fda.kNumber, 'K242292');
  assert.ok(item.title.zh && item.title.en && item.mcpEndpoint);
});
test('buildLlmsTxt is markdown listing every capability with K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  assert.match(txt, /^# 联影智能 · Agent Hub/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => assert.ok(txt.includes(c.fda.kNumber), `llms.txt missing ${c.fda.kNumber}`));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && node --test tests/catalog-format.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 写 catalog-format.js**

```js
// assets/js/catalog-format.js  —— 纯函数；浏览器“复制成 markdown”与 Node 构建共用
function capabilityToMarkdown(c, lang = 'zh') {
  const tx = f => (c.i18n[f][lang] || c.i18n[f].zh);
  const lines = [
    `# ${tx('title')} — ${tx('tagline')}`,
    '',
    tx('description'),
    '',
    `- Type: ${c.type}`,
    `- Modality: ${c.modality}`,
    `- Clinical use: ${tx('clinicalUse')}`,
  ];
  if (c.fda) lines.push(`- FDA 510(k): ${c.fda.kNumber} (${c.fda.decisionDate}, ${c.fda.productCode}) — ${c.fda.applicant}`);
  else lines.push(`- Status: demo, not a medical device`);
  lines.push(`- MCP endpoint: ${c.connect.mcpEndpoint}`, `- llms.txt: ${c.connect.llmsTxt}`);
  return lines.join('\n');
}
function buildCatalogJson(caps) {
  return {
    version: 1,
    name: '联影智能 · Agent Hub',
    items: caps.map(c => ({
      id: c.id, type: c.type, modality: c.modality,
      title: c.i18n.title, tagline: c.i18n.tagline, description: c.i18n.description,
      fda: c.fda, mcpEndpoint: c.connect.mcpEndpoint
    }))
  };
}
function buildLlmsTxt(caps) {
  const out = [
    '# 联影智能 · Agent Hub / United Imaging Intelligence · Agent Hub',
    '',
    '> 把院内影像 AI 变成人和智能体都能直接调用的标准服务。本文件为机器可读的能力目录摘要。',
    '> Turn in-house imaging AI into services people and agents can call. Machine-readable catalog summary.',
    '', '## Capabilities', ''
  ];
  for (const c of caps) {
    const fda = c.fda ? ` — FDA ${c.fda.kNumber} (${c.fda.decisionDate})` : ' — demo (not a device)';
    out.push(`- **${c.i18n.title.en}** [${c.type}/${c.modality}]${fda}: ${c.i18n.description.en} MCP: ${c.connect.mcpEndpoint}`);
  }
  out.push('');
  return out.join('\n');
}
if (typeof module !== 'undefined' && module.exports) module.exports = { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt };
if (typeof window !== 'undefined') Object.assign(window, { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt });
```

- [ ] **Step 4: 运行确认通过**

Run: `cd /e/UiiAgentHub && node --test tests/catalog-format.test.js`
Expected: PASS（3 tests）

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/catalog-format.js tests/catalog-format.test.js
git commit -q -m "feat: machine-view formatters (markdown/catalog.json/llms.txt) + tests"
```

---

## Phase 1 · 共享外壳与组件

### Task 6: main.js（页头/页脚注入 + 语言切换）+ base.css 外壳样式

**Files:**
- Create: `assets/js/main.js`
- Modify: `assets/css/base.css`（追加：reset/排版/容器/页头/页脚）
- Modify: `_scratch.html`（改为引入 main.js 验证）

- [ ] **Step 1: 写 main.js**

语言状态存 localStorage；切换即 `location.reload()`（刻意简化，prototype 可接受）。页头/页脚以字符串注入到 `#site-header` / `#site-footer` 挂载点。

```js
// assets/js/main.js
(function () {
  const LANG_KEY = 'uii_lang';
  function getLang() {
    const u = new URLSearchParams(location.search).get('lang');
    if (u && window.LANGS.includes(u)) { localStorage.setItem(LANG_KEY, u); return u; }
    return localStorage.getItem(LANG_KEY) || 'zh';
  }
  function setLang(l) { localStorage.setItem(LANG_KEY, l); location.reload(); }
  window.UII = { getLang, setLang };

  const lang = getLang();
  document.documentElement.lang = (lang === 'zh' ? 'zh-CN' : 'en');
  const T = (k) => window.t(k, lang);
  const base = location.pathname.includes('/console/') ? '..' : '.';

  function header() {
    const other = lang === 'zh' ? 'en' : '中文';
    return `<div class="container nav-inner">
      <a class="brand" href="${base}/index.html"><span class="brand-mark">UII</span><span class="brand-text">联影智能 · Agent Hub</span></a>
      <nav class="nav-links">
        <a href="${base}/catalog.html">${T('nav.market')}</a>
        <a href="${base}/how-it-works.html">${T('nav.how')}</a>
        <a class="nav-cta" href="${base}/console/index.html">${T('nav.console')}</a>
        <button class="lang-toggle" type="button" aria-label="language">${other}</button>
      </nav></div>`;
  }
  function footer() {
    return `<div class="container foot-inner">
      <span>${T('foot.copy')}</span>
      <a href="${base}/llms.txt">llms.txt</a><a href="${base}/data/catalog.json">catalog.json</a>
      <a href="https://github.com/ruanrrn/UII-Agent-Suite" target="_blank" rel="noopener">GitHub</a>
    </div>`;
  }
  function mount() {
    const h = document.getElementById('site-header'); if (h) h.innerHTML = header();
    const f = document.getElementById('site-footer'); if (f) f.innerHTML = footer();
    const btn = document.querySelector('.lang-toggle');
    if (btn) btn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));
    const onScroll = () => h && h.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
```

- [ ] **Step 2: 追加 base.css 外壳样式**

```css
/* assets/css/base.css */
html,body{margin:0;min-height:100%}
body{font-family:var(--font-body);font-size:14px;line-height:1.5;color:var(--ink);background:var(--white);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.container{max-width:var(--max-width);margin:0 auto;padding:0 32px}
/* 深色页头 */
#site-header{position:sticky;top:0;z-index:60;background:var(--black);color:var(--on-dark);border-bottom:1px solid transparent;transition:border-color .2s}
#site-header.scrolled{border-bottom-color:#242424}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:60px}
.brand{display:inline-flex;align-items:center;gap:10px;color:#fff}
.brand-mark{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;background:var(--key);color:var(--key-ink);font-weight:700;font-family:var(--font-display)}
.brand-text{font-family:var(--font-display);font-weight:600}
.nav-links{display:flex;align-items:center;gap:22px}
.nav-links a{color:var(--on-dark-muted);font-weight:500}
.nav-links a:hover{color:#fff}
.nav-cta{color:var(--key) !important}
.lang-toggle{background:transparent;border:1px solid #333;color:var(--on-dark);border-radius:var(--radius-pill);padding:5px 12px;cursor:pointer;font-family:inherit}
.lang-toggle:hover{border-color:var(--key);color:var(--key)}
/* 页脚 */
#site-footer{border-top:1px solid var(--border);background:var(--bg-section);color:var(--ink-3)}
.foot-inner{display:flex;gap:18px;align-items:center;flex-wrap:wrap;min-height:52px;font-size:12px}
.foot-inner a:hover{color:var(--key-strong)}
/* 通用按钮 */
.btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:var(--radius-md);padding:10px 18px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-key{background:var(--key);color:var(--key-ink)}
.btn-key:hover{filter:brightness(1.05)}
.btn-ghost{background:transparent;border:1px solid var(--border-strong);color:var(--ink)}
.section{padding:64px 0}
.section.dark{background:var(--black);color:var(--on-dark)}
.section.dark h2{color:#fff}
```

- [ ] **Step 3: 改 _scratch.html 验证外壳**

```html
<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<header id="site-header"></header>
<main class="container" style="padding:40px 32px">外壳验证 / shell check</main>
<footer id="site-footer"></footer>
<script src="assets/js/i18n.js"></script><script src="assets/js/main.js"></script>
</body></html>
```

- [ ] **Step 4: 验证**

Run: 浏览器打开 `http://localhost:5050/_scratch.html`
Expected: 顶部黑色页头：左侧 `UII` 青绿方块 + "联影智能 · Agent Hub"，右侧「市场 / 如何工作 / 体验控制台(青绿) / 语言按钮(EN)」。点语言按钮 → 整页文案切英文（页头变 Marketplace / How it works / Try the Console / 中文）。底部页脚有 llms.txt / catalog.json / GitHub。滚动时页头出现下边框。

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/main.js assets/css/base.css _scratch.html
git commit -q -m "feat: shared dark header/footer + language toggle"
```

---

### Task 7: components.js（卡片 + 徽章 + 复制）+ base.css 卡片样式

**Files:**
- Create: `assets/js/components.js`
- Modify: `assets/css/base.css`（追加卡片/徽章/网格样式）

- [ ] **Step 1: 写 components.js（渲染层；顶层不触碰 DOM，仅函数内用）**

```js
// assets/js/components.js
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tx = (cap, f, lang) => esc(cap.i18n[f][lang] || cap.i18n[f].zh);

  function badge(kind, lang) {
    if (kind === 'fda') return `<span class="badge badge-fda">${esc(window.t('badge.fda', lang))}</span>`;
    if (kind === 'demo') return `<span class="badge badge-demo">${esc(window.t('badge.demo', lang))}</span>`;
    if (kind === 'system') return `<span class="badge badge-sys">${lang==='zh'?'随系统获批':'within system'}</span>`;
    return '';
  }
  function card(cap, lang, base) {
    const badges = (cap.badges || []).map(b => badge(b, lang)).join('');
    const k = cap.fda ? `<span class="card-k">${esc(cap.fda.kNumber)}</span>` : '';
    return `<a class="cap-card" href="${base}/capability.html?id=${esc(cap.id)}&lang=${lang}">
      <div class="cap-top"><span class="cap-icon">${cap.icon}</span><span class="cap-badges">${badges}</span></div>
      <h3 class="cap-name">${tx(cap,'title',lang)}</h3>
      <div class="cap-tagline">${tx(cap,'tagline',lang)}</div>
      <p class="cap-desc">${tx(cap,'description',lang)}</p>
      <div class="cap-foot"><span class="cap-modality">${esc(cap.modality)}</span>${k}</div>
    </a>`;
  }
  function grid(caps, lang, base) {
    if (!caps.length) return `<div class="empty">🔭 ${lang==='zh'?'没有匹配的能力':'No matching capabilities'}</div>`;
    return caps.map(c => card(c, lang, base)).join('');
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return true; }
  }
  window.Components = { esc, tx, badge, card, grid, copyText };
})();
```

- [ ] **Step 2: 追加 base.css 卡片/徽章样式**

```css
/* cards */
.cap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:20px}
.cap-card{display:flex;flex-direction:column;padding:22px;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);transition:transform .2s,box-shadow .2s,border-color .2s}
.cap-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-card-hover);border-color:var(--key)}
.cap-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.cap-icon{font-size:24px}
.cap-badges{display:inline-flex;gap:6px;flex-wrap:wrap}
.badge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:var(--radius-pill)}
.badge-fda{background:var(--key-tint);color:var(--key-strong)}
.badge-demo{background:var(--bg-pill);color:var(--ink-3)}
.badge-sys{background:#eef2f6;color:var(--ink-2)}
.cap-name{font-family:var(--font-display);font-size:20px;font-weight:600;margin:0 0 4px}
.cap-tagline{color:var(--ink-2);font-size:13px;margin-bottom:10px}
.cap-desc{color:var(--ink-3);font-size:13.5px;line-height:1.6;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.cap-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:12px;color:var(--ink-muted)}
.cap-modality{background:var(--bg-pill);padding:2px 8px;border-radius:var(--radius-sm)}
.cap-k{color:var(--key-strong)}
.empty{padding:60px;text-align:center;color:var(--ink-3)}
```

- [ ] **Step 3: 验证（临时挂到 _scratch.html）**

在 `_scratch.html` 的 `<main>` 内加挂载点与脚本（验证后下个任务会删 _scratch）：

```html
<div class="cap-grid" id="g"></div>
<script src="assets/js/capabilities.js"></script><script src="assets/js/components.js"></script>
<script>document.getElementById('g').innerHTML = Components.grid(window.CAPABILITIES, UII.getLang(), '.');</script>
```

Run: 浏览器打开 `http://localhost:5050/_scratch.html`
Expected: 出现 10 张能力卡片网格；FDA 项显示青绿「FDA 510(k) 认证」徽章 + K 号（如 K242292）；vitallens 显示灰色「演示·非器械」；hover 卡片上浮、边框变青绿。

- [ ] **Step 4: Commit**

```bash
cd /e/UiiAgentHub && git add assets/js/components.js assets/css/base.css _scratch.html
git commit -q -m "feat: capability card/badge components + styles"
```

---

## Phase 2 · 公开展示页

### Task 8: 能力目录页 `/catalog`

**Files:**
- Create: `catalog.html`
- Create: `assets/js/app-catalog.js`
- Modify: `assets/css/base.css`（追加目录布局/工具条/侧栏样式）

- [ ] **Step 1: 写 catalog.html（薄壳）**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>能力目录 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<header id="site-header"></header>
<main class="container catalog-wrap">
  <div class="catalog-head"><h1 id="cat-title"></h1>
    <input id="cat-search" class="cat-search" type="search"></div>
  <div class="catalog-body">
    <aside class="cat-side" id="cat-side"></aside>
    <section><p class="cat-count" id="cat-count"></p><div class="cap-grid" id="cat-grid"></div></section>
  </div>
</main>
<footer id="site-footer"></footer>
<script src="assets/js/i18n.js"></script><script src="assets/js/main.js"></script>
<script src="assets/js/capabilities.js"></script><script src="assets/js/filters.js"></script>
<script src="assets/js/components.js"></script><script src="assets/js/app-catalog.js"></script>
</body></html>
```

- [ ] **Step 2: 写 app-catalog.js**

```js
// assets/js/app-catalog.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const TYPES = [['', lang==='zh'?'全部':'All'], ['clinical-ai', lang==='zh'?'临床 AI 辅助':'Clinical AI'],
    ['platform', lang==='zh'?'AI 影像平台':'AI platform'], ['reconstruction', lang==='zh'?'AI 重建增强':'Reconstruction'],
    ['skill', 'Skill']];
  const MODS = ['', 'CT', 'MR', 'PET', 'X-ray', 'Cross'];
  const state = { q: '', type: '', modality: '' };

  document.getElementById('cat-title').textContent = T('catalog.title');
  document.getElementById('cat-search').placeholder = T('catalog.search');

  function side() {
    const tBtns = TYPES.map(([v,l]) => `<button class="side-item${v===state.type?' on':''}" data-type="${v}">${l}</button>`).join('');
    const mBtns = MODS.map(m => `<button class="side-chip${m===state.modality?' on':''}" data-mod="${m}">${m||(lang==='zh'?'全部':'All')}</button>`).join('');
    return `<div class="side-label">${T('filter.type')}</div><div class="side-list">${tBtns}</div>
      <div class="side-label">${T('filter.modality')}</div><div class="side-chips">${mBtns}</div>`;
  }
  function render() {
    const res = filterCapabilities(window.CAPABILITIES, state);
    document.getElementById('cat-count').textContent = `${res.length} ${T('catalog.count')}`;
    document.getElementById('cat-grid').innerHTML = Components.grid(res, lang, '.');
  }
  function bind() {
    document.getElementById('cat-side').innerHTML = side();
    document.getElementById('cat-side').addEventListener('click', e => {
      const tb = e.target.closest('[data-type]'); const mb = e.target.closest('[data-mod]');
      if (tb) state.type = tb.dataset.type; if (mb) state.modality = mb.dataset.mod;
      bind(); render();
    });
    document.getElementById('cat-search').addEventListener('input', e => { state.q = e.target.value; render(); });
  }
  bind(); render();
})();
```

- [ ] **Step 3: 追加 base.css 目录样式**

```css
.catalog-wrap{padding:32px}
.catalog-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.catalog-head h1{font-family:var(--font-display);font-size:32px;margin:0}
.cat-search{height:40px;width:300px;max-width:100%;border:1px solid var(--border);border-radius:var(--radius-pill);padding:0 16px;font-size:14px;outline:none}
.cat-search:focus{border-color:var(--key)}
.catalog-body{display:grid;grid-template-columns:220px 1fr;gap:36px;align-items:start}
.cat-side{position:sticky;top:84px;display:flex;flex-direction:column;gap:8px}
.side-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-muted);font-weight:700;margin-top:10px}
.side-list{display:flex;flex-direction:column;gap:2px}
.side-item{text-align:left;padding:9px 12px;border-radius:var(--radius-md);background:transparent;color:var(--ink-2);cursor:pointer;font-weight:500}
.side-item:hover{background:var(--bg-section)}
.side-item.on{background:var(--black);color:#fff}
.side-chips{display:flex;flex-wrap:wrap;gap:6px}
.side-chip{padding:5px 11px;border-radius:var(--radius-pill);background:var(--bg-pill);color:var(--ink-2);cursor:pointer;font-size:12px}
.side-chip.on{background:var(--key);color:var(--key-ink)}
.cat-count{color:var(--ink-3);font-size:13px;margin:0 0 16px}
@media(max-width:860px){.catalog-body{grid-template-columns:1fr}.cat-side{position:static}}
```

- [ ] **Step 4: 验证**

Run: 浏览器打开 `http://localhost:5050/catalog.html`
Expected: 标题「能力目录」+ 搜索框；左侧类型（全部/临床 AI 辅助/AI 影像平台/AI 重建增强/Skill）与模态 chips；右侧 10 张卡片 + 计数。点「临床 AI 辅助」→ 仅剩 2 张（ICH、Rib）；点模态 PET → 仅 HYPER DLR/Focus 等 PET 项；搜索框输入 `ICH` → 仅 1 张。点卡片跳到 `capability.html?id=...`。切英文后类型/模态/计数文案变英文。

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add catalog.html assets/js/app-catalog.js assets/css/base.css
git commit -q -m "feat: capability catalog page with search + filters"
```

---

### Task 9: 能力详情页 `/capability`（人机双轨 + 连接块 + 复制成 markdown）

**Files:**
- Create: `capability.html`
- Create: `assets/js/app-capability.js`
- Modify: `assets/js/components.js`（追加 `connectBlock`、`detail`）
- Modify: `assets/css/base.css`（追加详情/双栏/连接块样式）

- [ ] **Step 1: 给 components.js 追加 detail + connectBlock**

在 `window.Components = {...}` 之前加入这两个函数，并把它们加进导出对象：

```js
  function connectBlock(cap, lang) {
    const md = window.capabilityToMarkdown(cap, lang);
    const rows = [
      ['MCP endpoint', cap.connect.mcpEndpoint],
      ['API Key', cap.connect.apiKeyHint],
      ['llms.txt', cap.connect.llmsTxt]
    ].map(([k,v]) => `<div class="mc-row"><span class="mc-k">${k}</span><code>${esc(v)}</code></div>`).join('');
    return `<div class="machine-block">
      <div class="mc-title">${esc(window.t('detail.connect', lang))}</div>
      ${rows}
      <button class="mc-copy" data-md="${esc(md)}">${esc(window.t('detail.copyMd', lang))}</button>
    </div>`;
  }
  function detail(cap, lang) {
    const badges = (cap.badges||[]).map(b=>badge(b,lang)).join('');
    const fda = cap.fda ? `<div class="fda-line"><b>${esc(window.t('badge.fda',lang))}</b> · ${esc(cap.fda.kNumber)} · ${esc(cap.fda.decisionDate)} · ${esc(cap.fda.productCode)}<br><span class="fda-applicant">${esc(cap.fda.applicant)}</span></div>` : `<div class="fda-line">${esc(window.t('badge.demo',lang))}</div>`;
    return `<div class="detail-head"><span class="cap-icon big">${cap.icon}</span>
        <div><h1>${tx(cap,'title',lang)}</h1><div class="detail-tag">${tx(cap,'tagline',lang)}</div><div class="cap-badges">${badges}</div></div></div>
      <div class="detail-dual">
        <div class="dual-human"><div class="dual-label">${esc(window.t('detail.human',lang))}</div>
          <p>${tx(cap,'description',lang)}</p>
          <div class="dual-sub">${esc(window.t('detail.clinical',lang))}</div><p>${tx(cap,'clinicalUse',lang)}</p>
          ${fda}</div>
        <div class="dual-agent"><div class="dual-label dark">${esc(window.t('detail.agent',lang))}</div>
          ${connectBlock(cap, lang)}</div>
      </div>`;
  }
```

把导出改为：`window.Components = { esc, tx, badge, card, grid, copyText, connectBlock, detail };`

- [ ] **Step 2: 写 capability.html（薄壳）**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>能力详情 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<header id="site-header"></header>
<main class="container detail-wrap" id="detail-root"></main>
<footer id="site-footer"></footer>
<script src="assets/js/i18n.js"></script><script src="assets/js/main.js"></script>
<script src="assets/js/capabilities.js"></script><script src="assets/js/catalog-format.js"></script>
<script src="assets/js/components.js"></script><script src="assets/js/app-capability.js"></script>
</body></html>
```

- [ ] **Step 3: 写 app-capability.js**

```js
// assets/js/app-capability.js
(function () {
  const lang = UII.getLang();
  const id = new URLSearchParams(location.search).get('id');
  const cap = (window.CAPABILITIES || []).find(c => c.id === id);
  const root = document.getElementById('detail-root');
  if (!cap) { root.innerHTML = `<p class="empty">404 · ${id || ''}</p>`; return; }
  root.innerHTML = Components.detail(cap, lang);
  root.addEventListener('click', async e => {
    const b = e.target.closest('.mc-copy'); if (!b) return;
    await Components.copyText(b.dataset.md);
    b.textContent = t('copy.done', lang); setTimeout(() => b.textContent = t('detail.copyMd', lang), 1500);
  });
})();
```

- [ ] **Step 4: 追加 base.css 详情/连接块样式**

```css
.detail-wrap{padding:40px 32px;max-width:980px}
.detail-head{display:flex;gap:16px;align-items:center;margin-bottom:28px}
.cap-icon.big{font-size:40px}
.detail-head h1{font-family:var(--font-display);font-size:30px;margin:0 0 4px}
.detail-tag{color:var(--ink-2);margin-bottom:8px}
.detail-dual{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.dual-human,.dual-agent{border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px}
.dual-agent{background:var(--near-black);border-color:#1f2937;color:var(--on-dark)}
.dual-label{font-size:12px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px}
.dual-label.dark{color:var(--key)}
.dual-sub{font-size:12px;color:var(--ink-muted);margin-top:14px;font-weight:600}
.fda-line{margin-top:16px;padding:12px;background:var(--key-tint);border-radius:var(--radius-md);font-size:12.5px;color:var(--key-strong)}
.fda-applicant{color:var(--ink-3)}
.machine-block{font-family:var(--font-mono)}
.mc-title{color:var(--key);font-size:12px;margin-bottom:10px}
.mc-row{display:flex;gap:8px;margin-bottom:8px;font-size:12.5px}
.mc-k{color:var(--on-dark-muted);min-width:96px}
.dual-agent code{color:var(--key);background:rgba(15,215,138,.1);padding:2px 6px;border-radius:4px;word-break:break-all}
.mc-copy{margin-top:12px;background:var(--key);color:var(--key-ink);border:0;border-radius:var(--radius-md);padding:8px 14px;font-weight:600;cursor:pointer;font-family:var(--font-body)}
@media(max-width:760px){.detail-dual{grid-template-columns:1fr}}
```

- [ ] **Step 5: 验证**

Run: 浏览器打开 `http://localhost:5050/capability.html?id=uai-easy-triage-ich`
Expected: 左栏「人类视图」：描述 + 临床用途 + 青绿底 FDA 行（K242292 · 2024-09-24 · QAS · Shanghai United Imaging Intelligence）；右栏深色「机器视图/智能体」：MCP endpoint / API Key / llms.txt（青绿等宽字）+「复制成 markdown」按钮。点按钮→变「已复制 ✓」，粘贴到记事本可见含标题/K242292/mcp:// 的 markdown。打开 `?id=vitallens-rppg` 显示「演示·非器械」而非 FDA 行。`?id=nope` 显示 404。

- [ ] **Step 6: Commit**

```bash
cd /e/UiiAgentHub && git add capability.html assets/js/app-capability.js assets/js/components.js assets/css/base.css
git commit -q -m "feat: capability detail with human/agent dual-rail + copy-as-markdown"
```

---

### Task 10: 首页 `/`（单页叙事）

**Files:**
- Create: `index.html`
- Create: `assets/js/app-home.js`
- Modify: `assets/css/base.css`（追加 hero/理念/信任带样式）

- [ ] **Step 1: 写 index.html（薄壳 + 叙事区块挂载点）**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>联影智能 · Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<header id="site-header"></header>
<main>
  <section class="hero section dark"><div class="container">
    <p class="hero-eyebrow" id="he"></p>
    <h1 class="hero-title" id="ht"></h1>
    <p class="hero-sub" id="hs"></p>
    <div class="hero-cta"><a class="btn btn-key" id="c1"></a><a class="btn btn-ghost ghost-on-dark" id="c2"></a></div>
  </div></section>

  <section class="section"><div class="container">
    <h2 id="what-title"></h2><div class="what-grid" id="what-grid"></div>
  </div></section>

  <section class="section" style="background:var(--bg-section)"><div class="container">
    <div class="row-between"><h2 id="feat-title"></h2><a id="feat-all" href="catalog.html"></a></div>
    <div class="cap-grid" id="home-grid"></div>
  </div></section>

  <section class="section dark"><div class="container">
    <h2 id="how-title"></h2><div class="steps" id="how-steps"></div>
  </div></section>

  <section class="section"><div class="container">
    <h2 id="trust-title"></h2><div class="trust-band" id="trust-band"></div>
  </div></section>
</main>
<footer id="site-footer"></footer>
<script src="assets/js/i18n.js"></script><script src="assets/js/main.js"></script>
<script src="assets/js/capabilities.js"></script><script src="assets/js/components.js"></script>
<script src="assets/js/app-home.js"></script>
</body></html>
```

- [ ] **Step 2: 写 app-home.js**

```js
// assets/js/app-home.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('he', lang==='zh'?'人 + 智能体 · 双轨门户':'People + Agents · dual-rail portal');
  set('ht', T('hero.title')); set('hs', T('hero.sub'));
  set('c1', T('cta.browse')); document.getElementById('c1').href = 'catalog.html';
  set('c2', T('nav.console')); document.getElementById('c2').href = 'console/index.html';

  set('what-title', T('section.what'));
  const what = [
    [lang==='zh'?'双受众':'Two audiences', lang==='zh'?'你的人用 Web，你的 AI PACS 用 MCP，同一套能力。':'Your people use the web; your AI PACS uses MCP — same capabilities.'],
    [lang==='zh'?'私域安全':'Private & secure', lang==='zh'?'AI 能力与数据在院内私域运行，数据不出院。':'AI and data run inside the hospital — data never leaves.'],
    [lang==='zh'?'MCP 标准输出':'MCP standard', lang==='zh'?'能力按 MCP 标准协议输出给智能体。':'Capabilities exposed to agents via the MCP standard.'],
    [lang==='zh'?'真实认证':'Real clearances', lang==='zh'?'目录全部为可查 FDA 510(k) 的真实 AI 软件。':'Catalog is real FDA 510(k)-cleared AI software.']
  ];
  document.getElementById('what-grid').innerHTML = what.map(([h,p]) =>
    `<div class="what-card"><div class="what-dot"></div><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('');

  set('feat-title', T('section.featured'));
  set('feat-all', lang==='zh'?'查看全部 →':'View all →');
  const featured = window.CAPABILITIES.filter(c => c.type !== 'skill').slice(0, 6);
  document.getElementById('home-grid').innerHTML = Components.grid(featured, lang, '.');

  set('how-title', T('nav.how'));
  const steps = [
    ['1', lang==='zh'?'发现':'Discover', lang==='zh'?'在门户浏览并评估能力':'Browse & evaluate in the portal'],
    ['2', lang==='zh'?'开通':'Activate', lang==='zh'?'拿到凭据与连接配置':'Get credentials & connection config'],
    ['3', lang==='zh'?'连接':'Connect', lang==='zh'?'AI PACS 经 MCP 在私域内调用':'AI PACS calls via MCP, inside your domain']
  ];
  document.getElementById('how-steps').innerHTML = steps.map(([n,h,p]) =>
    `<div class="step"><span class="step-n">${n}</span><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('')
    + `<a class="btn btn-key" href="how-it-works.html">${T('nav.how')} →</a>`;

  set('trust-title', T('section.trust'));
  const ks = [...new Set(window.CAPABILITIES.filter(c=>c.fda).map(c=>c.fda.kNumber))];
  document.getElementById('trust-band').innerHTML =
    `<span class="trust-chip">FDA 510(k)</span>` +
    ks.map(k=>`<span class="trust-k">${k}</span>`).join('') +
    `<span class="trust-note">${lang==='zh'?'数据不出院 · 院内隔离 · 审计':'Data stays in-house · isolation · audit'}</span>`;
})();
```

- [ ] **Step 3: 追加 base.css 首页样式**

```css
.ghost-on-dark{border-color:#333;color:#fff}
.hero{padding:96px 0}
.hero-eyebrow{font-family:var(--font-mono);font-size:12px;color:var(--key);margin:0 0 16px}
.hero-title{font-family:var(--font-display);font-size:clamp(30px,5vw,56px);line-height:1.12;margin:0;max-width:18em;color:#fff}
.hero-sub{color:var(--on-dark-muted);font-size:17px;margin:18px 0 28px;max-width:40em}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap}
.section h2{font-family:var(--font-display);font-size:30px;margin:0 0 28px}
.what-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.what-card{border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px}
.what-dot{width:10px;height:10px;border-radius:50%;background:var(--key);margin-bottom:12px}
.what-card h3{font-size:16px;margin:0 0 6px}
.what-card p{color:var(--ink-3);font-size:13.5px;line-height:1.6;margin:0}
.row-between{display:flex;justify-content:space-between;align-items:baseline}
.row-between a{color:var(--key-strong);font-weight:600}
.steps{display:flex;gap:18px;flex-wrap:wrap;align-items:stretch}
.step{flex:1 1 200px;border:1px solid #242424;border-radius:var(--radius-lg);padding:20px}
.step-n{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--key);color:var(--key-ink);font-weight:700;margin-bottom:10px}
.step h3{margin:0 0 6px;color:#fff}.step p{color:var(--on-dark-muted);font-size:13.5px;margin:0}
.trust-band{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.trust-chip{background:var(--key);color:var(--key-ink);font-weight:700;padding:6px 12px;border-radius:var(--radius-pill)}
.trust-k{font-family:var(--font-mono);font-size:12px;color:var(--ink-2);background:var(--bg-pill);padding:4px 9px;border-radius:var(--radius-sm)}
.trust-note{color:var(--ink-3);font-size:13px}
```

- [ ] **Step 4: 验证**

Run: 浏览器打开 `http://localhost:5050/index.html`
Expected: 黑色 Hero（青绿 eyebrow + 大标题主张 + 副文案 + 青绿「浏览能力」+ 描边「体验控制台」）；「它是什么」4 张卡；「精选能力」6 张 FDA 卡 + 查看全部；黑色「如何工作」3 步 + 青绿按钮；「真实认证」带 FDA 510(k) + 各 K 号 chips。切英文整页英文。

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add index.html assets/js/app-home.js assets/css/base.css
git commit -q -m "feat: home page single-scroll narrative"
```

---

### Task 11: 如何工作页 `/how-it-works`

**Files:**
- Create: `how-it-works.html`
- Create: `assets/js/app-how.js`
- Modify: `assets/css/base.css`（追加流程叙事样式）

- [ ] **Step 1: 写 how-it-works.html（薄壳）**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>如何工作 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="assets/css/tokens.css"><link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<header id="site-header"></header>
<main><section class="section dark"><div class="container">
  <h1 id="how-h"></h1><p class="how-lead" id="how-lead"></p>
  <div class="flow" id="flow"></div>
</div></section></main>
<footer id="site-footer"></footer>
<script src="assets/js/i18n.js"></script><script src="assets/js/main.js"></script>
<script src="assets/js/components.js"></script><script src="assets/js/app-how.js"></script>
</body></html>
```

- [ ] **Step 2: 写 app-how.js**

```js
// assets/js/app-how.js
(function () {
  const lang = UII.getLang();
  document.getElementById('how-h').textContent = lang==='zh'?'如何工作：发现 → 开通 → 连接':'How it works: Discover → Activate → Connect';
  document.getElementById('how-lead').textContent = lang==='zh'
    ? '同一套能力，人用门户、智能体用 MCP；调用发生在医院私域内，数据不出院。'
    : 'Same capabilities — people via the portal, agents via MCP. Calls happen inside the hospital domain; data never leaves.';
  const steps = [
    [lang==='zh'?'① 人在门户发现并开通':'① A person discovers & activates', lang==='zh'?'院方 IT 在门户浏览能力、评估临床价值与 FDA 认证，完成开通。':'Hospital IT browses, evaluates clinical value & FDA clearance, and activates.'],
    [lang==='zh'?'② 获取连接配置':'② Get connection config', lang==='zh'?'开通后获得 MCP 端点与 API Key（详情页机器视图可复制）。':'After activation, get the MCP endpoint and API Key (copyable in the detail machine view).'],
    [lang==='zh'?'③ 智能体经 MCP 连接':'③ Agent connects via MCP', lang==='zh'?'院内 AI PACS（LLM+Agent）加载 Skill/MCP，按标准协议连接能力。':'In-house AI PACS (LLM+Agent) loads Skill/MCP and connects via the standard protocol.'],
    [lang==='zh'?'④ 私域内调用':'④ Runs inside your domain', lang==='zh'?'能力在医院私域内执行，数据不出院，过程可审计。':'Capabilities run inside the hospital domain; data stays in-house and is auditable.']
  ];
  document.getElementById('flow').innerHTML = steps.map(([h,p]) =>
    `<div class="flow-step"><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('');
})();
```

- [ ] **Step 3: 追加 base.css 流程样式**

```css
.how-lead{color:var(--on-dark-muted);font-size:16px;max-width:46em;margin:0 0 32px}
.flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.flow-step{border:1px solid #242424;border-left:3px solid var(--key);border-radius:var(--radius-md);padding:18px;background:var(--near-black)}
.flow-step h3{margin:0 0 8px;color:#fff;font-size:15px}
.flow-step p{margin:0;color:var(--on-dark-muted);font-size:13.5px;line-height:1.6}
```

- [ ] **Step 4: 验证**

Run: 浏览器打开 `http://localhost:5050/how-it-works.html`
Expected: 黑底页，标题「如何工作：发现 → 开通 → 连接」+ 引语 + 4 个青绿左边框步骤卡。切英文整段英文。

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add how-it-works.html assets/js/app-how.js assets/css/base.css
git commit -q -m "feat: how-it-works flow narrative page"
```

---

## Phase 3 · 伪控制台 demo

### Task 12: 控制台外壳 + 首页（假数据）

**Files:**
- Create: `assets/css/console.css`
- Create: `console/index.html`
- Create: `assets/js/app-console.js`
- Modify: `assets/js/components.js`（追加 `consoleShell`）

- [ ] **Step 1: 给 components.js 追加 consoleShell（深色侧栏 + DEMO 横幅 + 内容挂点）**

在导出前加入并加进导出对象（导出变为 `{ esc, tx, badge, card, grid, copyText, connectBlock, detail, consoleShell }`）：

```js
  function consoleShell(active, lang, base) {
    const nav = [
      ['index', 'console.dashboard'], ['services', 'console.services'],
      ['connect', 'console.connect'], ['usage', 'console.usage']
    ].map(([k,key]) => `<a class="cn-link${k===active?' on':''}" href="${base}/console/${k}.html">${esc(window.t(key,lang))}</a>`).join('');
    return `<aside class="cn-side"><div class="cn-brand">UII Console</div><nav>${nav}</nav></aside>`;
  }
```

- [ ] **Step 2: 写 console.css**

```css
/* assets/css/console.css */
.cn-wrap{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 60px)}
.cn-side{background:var(--black);color:var(--on-dark);padding:20px 12px;display:flex;flex-direction:column;gap:4px}
.cn-brand{font-family:var(--font-display);color:#fff;font-weight:700;padding:8px 12px 16px}
.cn-link{padding:10px 12px;border-radius:var(--radius-md);color:var(--on-dark-muted);font-weight:500}
.cn-link:hover{background:#1d1d1d;color:#fff}
.cn-link.on{background:var(--key);color:var(--key-ink)}
.cn-main{padding:28px 32px;background:var(--bg-section)}
.cn-demo{display:inline-block;background:var(--key-tint);color:var(--key-strong);font-weight:700;font-size:12px;padding:4px 12px;border-radius:var(--radius-pill);margin-bottom:18px}
.cn-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px}
.cn-stat{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px}
.cn-stat .num{font-family:var(--font-display);font-size:30px;font-weight:700}
.cn-stat .lbl{color:var(--ink-3);font-size:13px}
.cn-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.cn-table th,.cn-table td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--border);font-size:13.5px}
.cn-table th{background:var(--bg-section);color:var(--ink-3);font-weight:600}
.cn-online{color:var(--key-strong);font-weight:600}
.cn-online::before{content:'●';margin-right:5px}
.cn-soon{color:var(--gold);font-weight:600}
@media(max-width:760px){.cn-wrap{grid-template-columns:1fr}}
```

- [ ] **Step 3: 写 console/index.html（薄壳）**

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>控制台 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="../assets/css/tokens.css"><link rel="stylesheet" href="../assets/css/base.css"><link rel="stylesheet" href="../assets/css/console.css"></head>
<body>
<header id="site-header"></header>
<div class="cn-wrap" id="cn-root"></div>
<script src="../assets/js/i18n.js"></script><script src="../assets/js/main.js"></script>
<script src="../assets/js/capabilities.js"></script><script src="../assets/js/components.js"></script>
<script src="../assets/js/app-console.js"></script>
</body></html>
```

- [ ] **Step 4: 写 app-console.js（按 body 上的 data-page 决定渲染哪一页；假数据内置）**

```js
// assets/js/app-console.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const page = document.body.getAttribute('data-console') || 'index';
  const root = document.getElementById('cn-root');
  const caps = window.CAPABILITIES.filter(c => c.fda).slice(0, 5); // 假装“已开通”
  const demo = `<span class="cn-demo">${T('console.demo')}</span>`;

  function dashboard() {
    return `<main class="cn-main">${demo}<h1>${T('console.dashboard')}</h1>
      <div class="cn-cards">
        <div class="cn-stat"><div class="num">${caps.length}</div><div class="lbl">${lang==='zh'?'已开通能力':'Activated'}</div></div>
        <div class="cn-stat"><div class="num">128k</div><div class="lbl">${lang==='zh'?'本月调用':'Calls this month'}</div></div>
        <div class="cn-stat"><div class="num cn-online" style="font-size:20px">${lang==='zh'?'在线':'Online'}</div><div class="lbl">${T('status.online')}</div></div>
      </div>
      <table class="cn-table"><thead><tr><th>${lang==='zh'?'能力':'Capability'}</th><th>${lang==='zh'?'状态':'Status'}</th><th>K#</th></tr></thead><tbody>
      ${caps.map(c=>`<tr><td>${c.i18n.title[lang]||c.i18n.title.zh}</td><td class="cn-online">${T('status.online')}</td><td>${c.fda.kNumber}</td></tr>`).join('')}
      </tbody></table></main>`;
  }
  function services() {
    return `<main class="cn-main">${demo}<h1>${T('console.services')}</h1>
      <table class="cn-table"><thead><tr><th>${lang==='zh'?'能力':'Capability'}</th><th>${lang==='zh'?'模态':'Modality'}</th><th>${lang==='zh'?'状态':'Status'}</th><th>${lang==='zh'?'到期':'Expires'}</th></tr></thead><tbody>
      ${caps.map((c,i)=>`<tr><td>${c.i18n.title[lang]||c.i18n.title.zh}</td><td>${c.modality}</td><td class="${i===caps.length-1?'cn-soon':'cn-online'}">${i===caps.length-1?(lang==='zh'?'即将到期':'Expiring'):T('status.online')}</td><td>2027-01-01</td></tr>`).join('')}
      </tbody></table></main>`;
  }
  function connect() {
    const blocks = caps.map(c => `<div style="margin-bottom:16px">${Components.connectBlock(c, lang)}</div>`).join('');
    return `<main class="cn-main">${demo}<h1>${T('console.connect')}</h1>
      <p style="color:var(--ink-3);max-width:46em">${lang==='zh'?'智能体经此连接：复制 MCP 端点与凭据到你的 AI PACS。':'Agents connect here: copy the MCP endpoint and credentials into your AI PACS.'}</p>
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${blocks}</div></main>`;
  }
  function usage() {
    return `<main class="cn-main">${demo}<h1>${T('console.usage')}</h1>
      <div class="cn-cards">
        <div class="cn-stat"><div class="num">128k</div><div class="lbl">${lang==='zh'?'本月调用':'Calls'}</div></div>
        <div class="cn-stat"><div class="num">企业版</div><div class="lbl">${lang==='zh'?'当前订阅':'Plan'}</div></div>
        <div class="cn-stat"><div class="num">2027-01</div><div class="lbl">${lang==='zh'?'续费日':'Renews'}</div></div>
      </div>
      <p style="color:var(--ink-3)">${lang==='zh'?'（计量与账单为概念演示）':'(Metering & billing are conceptual demos)'}</p></main>`;
  }
  const pages = { index: dashboard, services, connect, usage };
  root.innerHTML = Components.consoleShell(page, lang, '..') + (pages[page] || dashboard)();
  root.addEventListener('click', async e => {
    const b = e.target.closest('.mc-copy'); if (!b) return;
    await Components.copyText(b.dataset.md); b.textContent = T('copy.done'); setTimeout(()=>b.textContent=T('detail.copyMd'),1500);
  });
})();
```

- [ ] **Step 5: 给 console/index.html 的 body 加 `data-console="index"`**

把 `<body>` 改为 `<body data-console="index">`。

- [ ] **Step 6: 验证**

Run: 浏览器打开 `http://localhost:5050/console/index.html`
Expected: 顶部仍是站点深色页头；下方左侧深色控制台侧栏（控制台/我的服务/连接与凭据/用量订阅，当前项青绿高亮）+ 右侧浅色内容；顶部「DEMO·演示数据」青绿胶囊；3 个统计卡 + 已开通能力表（青绿"智能体已连接" + K 号）。

- [ ] **Step 7: Commit**

```bash
cd /e/UiiAgentHub && git add console/index.html assets/css/console.css assets/js/app-console.js assets/js/components.js
git commit -q -m "feat: pseudo-console shell + dashboard (sample data)"
```

---

### Task 13: 控制台其余三页（services / connect / usage）

**Files:**
- Create: `console/services.html`, `console/connect.html`, `console/usage.html`

- [ ] **Step 1: 写 console/services.html**

与 `console/index.html` 完全相同，仅两处不同：`<title>` 改为「我的服务 · …」，`<body>` 为 `<body data-console="services">`。完整内容：

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>我的服务 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="../assets/css/tokens.css"><link rel="stylesheet" href="../assets/css/base.css"><link rel="stylesheet" href="../assets/css/console.css"></head>
<body data-console="services">
<header id="site-header"></header>
<div class="cn-wrap" id="cn-root"></div>
<script src="../assets/js/i18n.js"></script><script src="../assets/js/main.js"></script>
<script src="../assets/js/capabilities.js"></script><script src="../assets/js/components.js"></script>
<script src="../assets/js/app-console.js"></script>
</body></html>
```

- [ ] **Step 2: 写 console/connect.html**

同上，`<title>` 为「连接与凭据 · …」，`<body data-console="connect">`：

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>连接与凭据 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="../assets/css/tokens.css"><link rel="stylesheet" href="../assets/css/base.css"><link rel="stylesheet" href="../assets/css/console.css"></head>
<body data-console="connect">
<header id="site-header"></header>
<div class="cn-wrap" id="cn-root"></div>
<script src="../assets/js/i18n.js"></script><script src="../assets/js/main.js"></script>
<script src="../assets/js/capabilities.js"></script><script src="../assets/js/components.js"></script>
<script src="../assets/js/app-console.js"></script>
</body></html>
```

- [ ] **Step 3: 写 console/usage.html**

同上，`<title>` 为「用量 / 订阅 · …」，`<body data-console="usage">`：

```html
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>用量 / 订阅 · 联影智能 Agent Hub</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap">
<link rel="stylesheet" href="../assets/css/tokens.css"><link rel="stylesheet" href="../assets/css/base.css"><link rel="stylesheet" href="../assets/css/console.css"></head>
<body data-console="usage">
<header id="site-header"></header>
<div class="cn-wrap" id="cn-root"></div>
<script src="../assets/js/i18n.js"></script><script src="../assets/js/main.js"></script>
<script src="../assets/js/capabilities.js"></script><script src="../assets/js/components.js"></script>
<script src="../assets/js/app-console.js"></script>
</body></html>
```

- [ ] **Step 4: 验证**

Run: 依次打开 `http://localhost:5050/console/services.html`、`/console/connect.html`、`/console/usage.html`
Expected: services 显示能力表（最后一行金色"即将到期"）；connect 显示每个已开通能力的深色连接块 + 可复制 markdown；usage 显示 3 个统计卡 + 概念说明。侧栏当前项分别高亮。

- [ ] **Step 5: Commit**

```bash
cd /e/UiiAgentHub && git add console/services.html console/connect.html console/usage.html
git commit -q -m "feat: console services/connect/usage pages (sample data)"
```

---

## Phase 4 · 机器视图产物

### Task 14: 构建 catalog.json + llms.txt（真实静态文件）

**Files:**
- Create: `scripts/build-machine-views.js`
- Test: `tests/build.test.js`
- Generated: `data/catalog.json`, `llms.txt`

- [ ] **Step 1: 写失败测试**

```js
// tests/build.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const root = path.join(__dirname, '..');

test('build script generates valid catalog.json and llms.txt', () => {
  execSync('node scripts/build-machine-views.js', { cwd: root });
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
  assert.strictEqual(cat.version, 1);
  assert.ok(cat.items.length >= 10);
  const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
  assert.match(llms, /Agent Hub/);
  assert.ok(llms.includes('K242292'));
});
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && node --test tests/build.test.js`
Expected: FAIL（build 脚本不存在）

- [ ] **Step 3: 写 scripts/build-machine-views.js**

```js
// scripts/build-machine-views.js
const fs = require('node:fs');
const path = require('node:path');
const { CAPABILITIES } = require('../assets/js/capabilities.js');
const { buildCatalogJson, buildLlmsTxt } = require('../assets/js/catalog-format.js');
const root = path.join(__dirname, '..');
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/catalog.json'), JSON.stringify(buildCatalogJson(CAPABILITIES), null, 2));
fs.writeFileSync(path.join(root, 'llms.txt'), buildLlmsTxt(CAPABILITIES));
console.log('Wrote data/catalog.json and llms.txt');
```

- [ ] **Step 4: 运行构建 + 测试确认通过**

Run: `cd /e/UiiAgentHub && node scripts/build-machine-views.js && node --test tests/build.test.js`
Expected: 打印 "Wrote data/catalog.json and llms.txt"；测试 PASS。
再 Run: `cd /e/UiiAgentHub && node --test`（全量）Expected: 全部 PASS。

- [ ] **Step 5: 浏览器验证机器视图可访问**

Run: 打开 `http://localhost:5050/llms.txt` 与 `http://localhost:5050/data/catalog.json`
Expected: llms.txt 为双语 markdown，含每个能力与 K 号；catalog.json 为结构化 JSON。页脚的 llms.txt / catalog.json 链接可达。

- [ ] **Step 6: Commit**

```bash
cd /e/UiiAgentHub && git add scripts/build-machine-views.js tests/build.test.js data/catalog.json llms.txt
git commit -q -m "feat: generate machine views (catalog.json + llms.txt) from single source"
```

---

## Phase 5 · 收尾与跨页 QA

### Task 15: 清理 + 跨页一致性 + 双语 QA

**Files:**
- Delete: `_scratch.html`
- Modify: 视验证结果做小修

- [ ] **Step 1: 删除临时验证页**

```bash
cd /e/UiiAgentHub && git rm -q _scratch.html
```

- [ ] **Step 2: 全量测试**

Run: `cd /e/UiiAgentHub && node --test`
Expected: 所有测试 PASS（i18n / capabilities / filters / catalog-format / build）。

- [ ] **Step 3: 跨页人工验证清单（中英各走一遍）**

Run: 从 `http://localhost:5050/index.html` 开始，依次点击页头「市场 / 如何工作 / 体验控制台」、首页「浏览能力 / 查看全部」、目录卡片进详情、详情复制 markdown、控制台四页与侧栏切换、页脚 llms.txt/catalog.json。然后点语言按钮切到英文重复一遍。
Expected（逐条确认）：
- 所有页面页头/页脚一致（黑底、青绿 CTA、语言按钮）。
- 任意页面均无中英混排残留（切英文后无遗漏的中文 UI 文案；产品名 uAI… 保持英文属正常）。
- 关键色只有青绿；金仅出现在「即将到期/企业版」等极少处；无绿色以外的高饱和主色。
- 详情页人/机双栏齐全；机器视图为深色、青绿等宽字。
- 控制台所有页带「DEMO·演示数据」。

- [ ] **Step 4: 修正发现的问题（如有）**

针对上一步发现的任何不一致（如某处未走 i18n、某处颜色用错 token）就地修正；每修一处 `git add <file> && git commit -m "fix: ..."`。若无问题则跳过。

- [ ] **Step 5: 最终提交**

```bash
cd /e/UiiAgentHub && git add -A && git commit -q -m "chore: remove scratch page; cross-page + bilingual QA pass"
```

---

## Self-Review（计划作者已核对）

- **Spec 覆盖**：①双语 → Task 2/6 + 全页；②黑+青绿单关键色（金/青蓝极少量）→ tokens.css + QA Step3；③FDA 真实能力清单 → Task 3 数据 + 契约测试；④去预约演示 → 页脚仅 体验控制台/llms.txt/catalog.json/GitHub；⑤vanilla 沿用 → 无框架无依赖；⑥命名沿用 → 页头/页脚/llms.txt。8 页 IA → Task 8/9/10/11（公开）+ Task 12/13（控制台 4 页）。机器视图线 → Task 5 + Task 14（llms.txt/catalog.json/复制 markdown）。
- **占位符扫描**：无 TODO/“稍后实现”；所有代码步骤含完整可运行代码；引用 v1 `styles.css` 仅作"可选移植参考"，不构成实现依赖（核心样式均已在本计划内给全）。
- **类型/命名一致**：`Components.{card,grid,detail,connectBlock,consoleShell,copyText,esc,tx,badge}`、`filterCapabilities`、`capabilityToMarkdown/buildCatalogJson/buildLlmsTxt`、`UII.getLang/setLang`、`t(key,lang)`、能力字段 `id/type/modality/icon/badges/fda/connect/i18n` 在数据、组件、测试间一致。

---

## Execution Handoff
见对话——计划保存后将提供两种执行方式供选择。
