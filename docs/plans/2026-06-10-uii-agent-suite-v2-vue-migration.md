# UII Agent Suite v2 · Vue 工程化迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把已完成的 v0 vanilla 概念门户迁移为公司 MCSF2.0 规范栈（Vue 3 + TS + Vite）的工程化项目，引入 Mock 数据访问层、双产物构建（GitHub Pages 版 + 可移植 Mock 包）与本地部署命令，便于移交、维护与持续部署。

**Architecture:** Vite + Vue 3 SFC + TypeScript 单包应用；hash 路由（GitHub Pages 零 404）；页面只依赖 `DataSource` 接口，本期由 `MockDataSource`（静态 JSON 伪 API）实现，未来换 `HttpDataSource` 不动页面；能力数据、i18n 字典、CSS token、机器视图纯函数均从 v0 平移；机器视图（llms.txt / catalog.json / mock JSON）构建期由单一数据源生成。

**Tech Stack:** vue 3.5.18 · typescript 5.9.2 · vite（MCSF 建议 8.0.0，装不到取最新稳定）· vue-router 4 (hash) · vue-i18n 9 · vitest 3.1.1 · @vue/test-utils · jsdom · oxlint 1.39.0 · prettier 3.5.3 · stylelint 16.23.0 · husky 8.0.3 · pnpm ≥10.14 · node ≥22.18。零 UI 组件库（沿用 v0 自有 CSS 变量主题）。

**测试策略：** 纯逻辑（数据契约 / filter / 机器视图格式 / DataSource / i18n 覆盖）走 **Vitest TDD**（先写失败测试）。组件/视图走 **类型检查（`vue-tsc --noEmit`）+ 构建通过 + 控制器在 plan 末尾用预览做视觉 QA**。

**重要前置 —— v0 资产位置（平移来源，迁移期仍在仓库内可读）：**
- 能力数据：`assets/js/capabilities.js`（`CAPABILITIES` 数组）
- i18n 字典：`assets/js/i18n.js`（`I18N`）+ 内联双语：`assets/js/app-catalog.js`（TYPES 标签）、`assets/js/app-console.js`（表头/标签/段落）
- 纯函数：`assets/js/catalog-format.js`、`assets/js/filters.js`
- 样式 token：`assets/css/tokens.css`、`base.css`、`console.css`
- 页面结构/视觉参照：`index.html` 与 `assets/js/components.js`（card/detail/connectBlock/consoleShell）、各 `app-*.js`
> 这些文件在 Phase 6 才删除；前面所有任务都可直接打开它们作为「逐字来源」。

**版本兜底（适用所有安装步骤）：** 若某固定版本在 registry 上 404，改装最新兼容版（`pnpm add -D <pkg>@latest`），并在 `README.md` 的「版本偏差」小节记录实际版本。**绝不**因版本装不到而中止。

---

## 文件结构（决策锁定）

```
uii-agent-suite/
  package.json              # deps/scripts/engines（替换 v0 的 package.json）
  tsconfig.json  tsconfig.node.json
  vite.config.ts           # base 由 env 注入；含机器视图生成插件
  vitest.config.ts
  index.html               # Vite 入口（替换 v0 根 index.html）
  .oxlintrc.json  .prettierrc  .stylelintrc.json
  .husky/pre-commit
  .env.mock  .env.api      # VITE 模式变量
  src/
    main.ts  App.vue  i18n.ts
    router/index.ts
    types/capability.ts
    data/capabilities.ts        # v0 数据 → TS
    lib/catalogFormat.ts        # v0 catalog-format → TS
    lib/filters.ts              # v0 filters → TS
    locales/zh.json  en.json
    services/dataSource.ts mockDataSource.ts httpDataSource.ts index.ts
    styles/tokens.css base.css console.css
    components/ SiteHeader.vue SiteFooter.vue AppErrorBoundary.vue
                Badge.vue CapabilityCard.vue DualRail.vue
                ConnectBlock.vue TrustBand.vue ConsoleShell.vue
    views/ HomeView.vue CatalogView.vue CapabilityDetailView.vue
           HowItWorksView.vue NotFoundView.vue
           console/DashboardView.vue ServicesView.vue ConnectView.vue UsageView.vue
  public/
    mock/capabilities.json  mock/console.json   # 伪 API（构建期生成）
    llms.txt  catalog.json                       # 机器视图（构建期生成）
    assets/img/                                   # 复用 v0 assets/img（如有）
  scripts/build-machine-views.ts
  scripts/deploy-pages.mjs     # 本地部署命令（构建 + 推产物仓库）
  .github/workflows/deploy.yml # phase-2 预置模板（本期不调试）
  tests/  *.test.ts            # Vitest
  README.md
```

---

## Phase 0 · 脚手架与工具链

### Task 1: Vite + Vue + TS 脚手架

**Files:** Create `package.json`(替换), `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`(替换), `src/main.ts`, `src/App.vue`, `src/vite-env.d.ts`

- [ ] **Step 1: 备份并替换 package.json**

把 v0 的 `package.json` 内容用以下替换（注意：保留项目名）：
```json
{
  "name": "uii-agent-suite",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.18.0", "pnpm": ">=10.14.0" },
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "build:pages": "vue-tsc --noEmit && vite build --mode mock",
    "build:pkg": "vue-tsc --noEmit && vite build --mode mock --base ./ --outDir dist-pkg",
    "preview": "vite preview --port 5050",
    "gen:machine": "tsx scripts/build-machine-views.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "oxlint . && stylelint \"src/**/*.{css,vue}\"",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "deploy:pages": "node scripts/deploy-pages.mjs",
    "prepare": "husky || true"
  },
  "dependencies": {
    "vue": "3.5.18",
    "vue-router": "^4.4.5",
    "vue-i18n": "^9.14.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "@vue/test-utils": "^2.4.6",
    "typescript": "5.9.2",
    "vite": "^7.0.0",
    "vue-tsc": "^2.1.10",
    "vitest": "3.1.1",
    "jsdom": "^25.0.1",
    "tsx": "^4.19.2",
    "oxlint": "1.39.0",
    "prettier": "3.5.3",
    "stylelint": "16.23.0",
    "stylelint-config-standard": "^36.0.1",
    "husky": "8.0.3"
  }
}
```
> 注：MCSF 建议 vite 8.0.0；写 `^7.0.0` 作安全下限，`pnpm i` 会取可用的最新（7 或 8）。若想严格 8，装后改 pin 并记 README。

- [ ] **Step 2: tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"], "types": ["vite/client"],
    "strict": true, "noUnusedLocals": true, "noUnusedParameters": true,
    "jsx": "preserve", "resolveJsonModule": true, "isolatedModules": true,
    "skipLibCheck": true, "esModuleInterop": true,
    "baseUrl": ".", "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue", "scripts/**/*.ts", "tests/**/*.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: tsconfig.node.json**
```json
{
  "compilerOptions": {
    "composite": true, "module": "ESNext", "moduleResolution": "Bundler",
    "types": ["node"], "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: vite.config.ts**（base 由环境变量注入；机器视图在 build 前生成）
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

// 构建前生成机器视图（llms.txt / catalog.json / mock/*.json）
function machineViews() {
  return {
    name: 'machine-views',
    buildStart() { execSync('pnpm gen:machine', { stdio: 'inherit' }) }
  }
}

export default defineConfig({
  // GitHub Pages 子路径：用 VITE_BASE 覆盖；默认根路径
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), machineViews()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
})
```

- [ ] **Step 5: index.html（替换 v0 根文件）**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>联影智能 · Agent Hub</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono&display=swap" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 6: src/vite-env.d.ts**
```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: 最小 main.ts + App.vue（占位，后续任务替换）**
```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```
```vue
<!-- src/App.vue -->
<template><div>UII Agent Suite v2 scaffold</div></template>
```

- [ ] **Step 8: 安装依赖（含版本兜底）**

Run: `cd /e/UiiAgentHub && pnpm install`
Expected: 安装成功。若某 devDep 版本 404 → `pnpm add -D <pkg>@latest` 后在 README 记录。

- [ ] **Step 9: 类型检查通过**

Run: `cd /e/UiiAgentHub && pnpm exec vue-tsc --noEmit`
Expected: 无错误（占位 App 通过）。

- [ ] **Step 10: Commit**
```bash
cd /e/UiiAgentHub && git add -A
git commit -m "chore(v2): scaffold Vite + Vue 3 + TS project"
```
（提交体尾行加：`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`，以下所有提交同此约定）

---

### Task 2: 工具链配置（oxlint / prettier / stylelint / husky）

**Files:** Create `.oxlintrc.json`, `.prettierrc`, `.stylelintrc.json`, `.husky/pre-commit`

- [ ] **Step 1: .oxlintrc.json（照 MCSF 规范）**
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["unicorn", "typescript", "oxc"],
  "env": { "builtin": true },
  "categories": { "correctness": "error", "suspicious": "error" },
  "rules": {
    "no-unused-vars": "allow",
    "unicorn/no-empty-file": "allow",
    "typescript/no-extraneous-class": "allow",
    "preserve-caught-error": "allow",
    "typescript/no-this-alias": "allow",
    "unicorn/consistent-function-scoping": "allow",
    "unicorn/no-array-sort": "allow",
    "no-new-array": "allow",
    "unicorn/prefer-add-event-listener": "allow"
  },
  "ignorePatterns": ["dist", "dist-pkg", "public", "node_modules"]
}
```

- [ ] **Step 2: .prettierrc（照 MCSF 规范）**
```json
{
  "printWidth": 100, "tabWidth": 2, "useTabs": false, "proseWrap": "always",
  "trailingComma": "none", "semi": true, "singleQuote": true,
  "bracketSameLine": false, "bracketSpacing": true, "quoteProps": "consistent",
  "arrowParens": "avoid", "endOfLine": "auto",
  "overrides": [
    { "files": "*.json", "options": { "parser": "json", "useTabs": false } },
    { "files": "*.ts", "options": { "parser": "typescript" } }
  ]
}
```
Also create `.prettierignore`:
```
dist
dist-pkg
public/llms.txt
public/catalog.json
public/mock
node_modules
```

- [ ] **Step 3: .stylelintrc.json**
```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,
    "selector-class-pattern": null,
    "no-descending-specificity": null
  },
  "ignoreFiles": ["dist/**", "dist-pkg/**", "node_modules/**"]
}
```

- [ ] **Step 4: husky pre-commit**

Run: `cd /e/UiiAgentHub && pnpm exec husky init` (creates `.husky/`)
Then overwrite `.husky/pre-commit` with:
```sh
pnpm format:check && pnpm lint
```

- [ ] **Step 5: 验证 lint/format 可运行**

Run: `cd /e/UiiAgentHub && pnpm format:check; pnpm exec oxlint .`
Expected: oxlint 运行无 correctness/suspicious 报错（占位代码应通过）；prettier 若报格式问题先 `pnpm format` 再继续。

- [ ] **Step 6: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "chore(v2): oxlint + prettier + stylelint + husky per MCSF2.0"
```

---

### Task 3: Vitest 配置 + 冒烟测试

**Files:** Create `vitest.config.ts`, `tests/smoke.test.ts`

- [ ] **Step 1: vitest.config.ts**
```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', globals: true, include: ['tests/**/*.test.ts'] }
})
```

- [ ] **Step 2: 写冒烟测试 tests/smoke.test.ts**
```ts
import { test, expect } from 'vitest'
test('vitest runs', () => { expect(1 + 1).toBe(2) })
```

- [ ] **Step 3: 运行**

Run: `cd /e/UiiAgentHub && pnpm test`
Expected: 1 passed.

- [ ] **Step 4: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "chore(v2): vitest config + smoke test"
```

---

## Phase 1 · 类型 / 数据 / 纯函数 / i18n（TDD 平移）

### Task 4: 领域类型

**Files:** Create `src/types/capability.ts`

- [ ] **Step 1: 写类型**
```ts
// src/types/capability.ts
export type CapType = 'clinical-ai' | 'platform' | 'reconstruction' | 'skill';
export type Modality = 'CT' | 'MR' | 'PET' | 'X-ray' | 'Cross';
export type Lang = 'zh' | 'en';
export interface Bi { zh: string; en: string }
export interface FdaInfo {
  kNumber: string; decisionDate: string; productCode: string;
  productCodeName: string; applicant: string;
}
export interface CapConnect { mcpEndpoint: string; apiKeyHint: string; llmsTxt: string }
export interface Capability {
  id: string; type: CapType; modality: Modality; icon: string; badges: string[];
  fda: FdaInfo | null; inputs: string[]; outputs: string[]; connect: CapConnect;
  i18n: { title: Bi; tagline: Bi; description: Bi; clinicalUse: Bi };
}
export interface ConsoleService { id: string; title: Bi; modality: Modality; kNumber: string | null; status: 'online' | 'expiring' }
export interface ConsoleOverview { activated: number; callsThisMonth: string; services: ConsoleService[] }
```

- [ ] **Step 2: 类型检查**

Run: `cd /e/UiiAgentHub && pnpm exec vue-tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): domain types"
```

---

### Task 5: 能力数据（平移 v0 → TS）+ 契约测试

**Files:** Create `src/data/capabilities.ts`, `tests/capabilities.test.ts`

- [ ] **Step 1: 写失败测试 tests/capabilities.test.ts**
```ts
import { test, expect } from 'vitest'
import { CAPABILITIES } from '@/data/capabilities'

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill']
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross']

test('exactly 10 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(10)
  const ids = CAPABILITIES.map(c => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/))
})
test('valid type/modality + bilingual fields', () => {
  for (const c of CAPABILITIES) {
    expect(TYPES).toContain(c.type)
    expect(MODS).toContain(c.modality)
    for (const f of ['title', 'tagline', 'description', 'clinicalUse'] as const) {
      expect(c.i18n[f].zh).toBeTruthy(); expect(c.i18n[f].en).toBeTruthy()
    }
  }
})
test('non-skill carry real FDA K-number; skill is demo', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') { expect(c.badges).toContain('demo'); expect(c.fda).toBeNull(); continue }
    expect(c.fda!.kNumber).toMatch(/^K\d{6}$/)
    expect(c.fda!.decisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(c.fda!.productCode).toBeTruthy()
  }
})
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && pnpm test tests/capabilities.test.ts`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 平移数据**

打开 v0 `assets/js/capabilities.js`，把其中的 `CAPABILITIES` 数组**逐字复制**到 `src/data/capabilities.ts`，改为 TS 导出并加类型：
```ts
// src/data/capabilities.ts
import type { Capability } from '@/types/capability'
export const CAPABILITIES: Capability[] = [
  /* ←← 从 assets/js/capabilities.js 复制 10 个对象字面量，内容一字不改
        （id/type/modality/icon/badges/fda/inputs/outputs/connect/i18n 全部保留）。
        删除文件末尾的 UMD 尾巴（module.exports / window 两行），改为上面的 export。*/
]
```
> 关键：FDA 字段（K 号/日期/productCode/applicant）必须与 v0 完全一致；不得增删条目。

- [ ] **Step 4: 运行确认通过**

Run: `cd /e/UiiAgentHub && pnpm test tests/capabilities.test.ts && pnpm exec vue-tsc --noEmit`
Expected: 3 passed；类型检查通过。

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): port FDA capability dataset to typed module + contract tests"
```

---

### Task 6: 机器视图格式化纯函数（平移 → TS）

**Files:** Create `src/lib/catalogFormat.ts`, `tests/catalogFormat.test.ts`

- [ ] **Step 1: 失败测试 tests/catalogFormat.test.ts**
```ts
import { test, expect } from 'vitest'
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat'
import { CAPABILITIES } from '@/data/capabilities'
const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich')!

test('markdown has title, K-number, MCP', () => {
  const md = capabilityToMarkdown(ich, 'en')
  expect(md).toMatch(/uAI Easy Triage ICH/); expect(md).toMatch(/K242292/)
  expect(md).toMatch(/mcp:\/\/hub\.uii-ai\.example\/ich-triage/)
})
test('catalog json stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES)
  expect(cat.version).toBe(1); expect(cat.items.length).toBe(10)
  const it = cat.items.find(i => i.id === 'uai-easy-triage-ich')!
  expect(it.fda!.kNumber).toBe('K242292'); expect(it.mcpEndpoint).toBeTruthy()
})
test('llms.txt lists every K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES)
  expect(txt).toMatch(/^# 联影智能 · Agent Hub/m)
  CAPABILITIES.filter(c => c.fda).forEach(c => expect(txt).toContain(c.fda!.kNumber))
})
```

- [ ] **Step 2: 运行确认失败**

Run: `cd /e/UiiAgentHub && pnpm test tests/catalogFormat.test.ts` → FAIL.

- [ ] **Step 3: 平移实现**

把 v0 `assets/js/catalog-format.js` 的三个函数体平移到 `src/lib/catalogFormat.ts`，加类型、改 ESM export（删 UMD 尾巴）：
```ts
// src/lib/catalogFormat.ts
import type { Capability, Lang } from '@/types/capability'
export function capabilityToMarkdown(c: Capability, lang: Lang = 'zh'): string {
  const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse') => c.i18n[f][lang] || c.i18n[f].zh
  const lines = [
    `# ${tx('title')} — ${tx('tagline')}`, '', tx('description'), '',
    `- Type: ${c.type}`, `- Modality: ${c.modality}`, `- Clinical use: ${tx('clinicalUse')}`
  ]
  if (c.fda) lines.push(`- FDA 510(k): ${c.fda.kNumber} (${c.fda.decisionDate}, ${c.fda.productCode}) — ${c.fda.applicant}`)
  else lines.push('- Status: demo, not a medical device')
  lines.push(`- MCP endpoint: ${c.connect.mcpEndpoint}`, `- llms.txt: ${c.connect.llmsTxt}`)
  return lines.join('\n')
}
export function buildCatalogJson(caps: Capability[]) {
  return {
    version: 1 as const, name: '联影智能 · Agent Hub',
    items: caps.map(c => ({
      id: c.id, type: c.type, modality: c.modality,
      title: c.i18n.title, tagline: c.i18n.tagline, description: c.i18n.description,
      fda: c.fda, mcpEndpoint: c.connect.mcpEndpoint
    }))
  }
}
export function buildLlmsTxt(caps: Capability[]): string {
  const out = [
    '# 联影智能 · Agent Hub / United Imaging Intelligence · Agent Hub', '',
    '> 把院内影像 AI 变成人和智能体都能直接调用的标准服务。本文件为机器可读的能力目录摘要。',
    '> Turn in-house imaging AI into services people and agents can call. Machine-readable catalog summary.',
    '', '## Capabilities', ''
  ]
  for (const c of caps) {
    const fda = c.fda ? ` — FDA ${c.fda.kNumber} (${c.fda.decisionDate})` : ' — demo (not a device)'
    out.push(`- **${c.i18n.title.en}** [${c.type}/${c.modality}]${fda}: ${c.i18n.description.en} MCP: ${c.connect.mcpEndpoint}`)
  }
  out.push('')
  return out.join('\n')
}
```

- [ ] **Step 4: 运行确认通过**

Run: `cd /e/UiiAgentHub && pnpm test tests/catalogFormat.test.ts` → 3 passed.

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): port machine-view formatters to TS + tests"
```

---

### Task 7: 筛选纯函数（平移 → TS）

**Files:** Create `src/lib/filters.ts`, `tests/filters.test.ts`

- [ ] **Step 1: 失败测试 tests/filters.test.ts**
```ts
import { test, expect } from 'vitest'
import { filterCapabilities } from '@/lib/filters'
import { CAPABILITIES } from '@/data/capabilities'

test('no filters → all', () => { expect(filterCapabilities(CAPABILITIES, {}).length).toBe(10) })
test('type filter', () => {
  const r = filterCapabilities(CAPABILITIES, { type: 'clinical-ai' })
  expect(r.length).toBeGreaterThanOrEqual(2); expect(r.every(c => c.type === 'clinical-ai')).toBe(true)
})
test('modality filter', () => {
  expect(filterCapabilities(CAPABILITIES, { modality: 'PET' }).every(c => c.modality === 'PET')).toBe(true)
})
test('bilingual query', () => {
  expect(filterCapabilities(CAPABILITIES, { q: 'ICH' }).some(c => c.id === 'uai-easy-triage-ich')).toBe(true)
  expect(filterCapabilities(CAPABILITIES, { q: '肋骨' }).some(c => c.id === 'uai-easytriage-rib')).toBe(true)
})
```

- [ ] **Step 2: 失败** Run: `pnpm test tests/filters.test.ts` → FAIL.

- [ ] **Step 3: 实现**
```ts
// src/lib/filters.ts
import type { Capability, CapType, Modality } from '@/types/capability'
export interface FilterState { q?: string; type?: CapType | ''; modality?: Modality | '' }
export function filterCapabilities(caps: Capability[], { q, type, modality }: FilterState): Capability[] {
  const needle = (q || '').trim().toLowerCase()
  return caps.filter(c => {
    if (type && c.type !== type) return false
    if (modality && c.modality !== modality) return false
    if (needle) {
      const hay = [c.id, JSON.stringify(c.i18n), c.fda?.kNumber, c.modality].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
}
```

- [ ] **Step 4: 通过** Run: `pnpm test tests/filters.test.ts` → 4 passed.

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): port capability filter to TS + tests"
```

---

### Task 8: i18n 语言包（平移字典 + 收编内联文案）

**Files:** Create `src/locales/zh.json`, `src/locales/en.json`, `tests/i18n.test.ts`

- [ ] **Step 1: 失败测试 tests/i18n.test.ts**
```ts
import { test, expect } from 'vitest'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'

test('zh and en have identical key sets', () => {
  const zk = Object.keys(zh).sort(), ek = Object.keys(en).sort()
  expect(zk).toEqual(ek)
})
test('no empty values', () => {
  for (const [k, v] of Object.entries(zh)) expect(v, `zh.${k}`).toBeTruthy()
  for (const [k, v] of Object.entries(en)) expect(v, `en.${k}`).toBeTruthy()
})
test('core keys present', () => {
  for (const k of ['nav.market','nav.how','nav.console','cta.browse','hero.title','badge.fda','console.demo','filter.type','filter.modality']) {
    expect(zh).toHaveProperty(k); expect(en).toHaveProperty(k)
  }
})
```

- [ ] **Step 2: 失败** Run: `pnpm test tests/i18n.test.ts` → FAIL.

- [ ] **Step 3: 构造语言包**

来源逐字平移 + 收编内联：
1. 从 v0 `assets/js/i18n.js` 的 `I18N` 取每个 key 的 `zh`/`en`，拆进 `zh.json`/`en.json`（扁平 key，如 `"nav.market": "市场"`）。
2. **收编内联双语**（v0 代码评审遗留）：
   - `assets/js/app-catalog.js` 的 `TYPES` 标签 → keys `type.all/type.clinical-ai/type.platform/type.reconstruction/type.skill`、`filter.all`。
   - `assets/js/app-home.js` 的「它是什么」4 卡、steps 3 步、trust note → keys `what.audience.title/desc`、`what.private.title/desc`、`what.mcp.title/desc`、`what.real.title/desc`、`step.discover.title/desc`、`step.activate.title/desc`、`step.connect.title/desc`、`trust.note`、`home.eyebrow`、`home.viewAll`。
   - `assets/js/app-console.js` 表头/标签/段落 → keys `col.capability/col.status/col.modality/col.expires`、`console.activated/console.calls/console.online/console.expiring/console.plan/console.renews/console.enterprise`、`connect.lead`、`usage.note`。
   - `assets/js/app-how.js` 标题/引语/4 步 → keys `how.title/how.lead/how.s1.title/how.s1.desc … how.s4.title/how.s4.desc`。
   - 详情页 404 → `detail.notfound`。

`src/locales/zh.json`（示意结构，键值从上述来源逐条填全，确保与 en.json 键集一致）：
```json
{
  "nav.market": "市场", "nav.how": "如何工作", "nav.console": "体验控制台",
  "cta.browse": "浏览能力", "cta.activate": "开通能力",
  "hero.title": "把院内影像 AI，变成人和智能体都能直接调用的标准服务",
  "hero.sub": "一个门户，人用 Web、智能体用 MCP，同一套能力，私域安全。",
  "home.eyebrow": "人 + 智能体 · 双轨门户",
  "section.what": "它是什么", "section.featured": "精选能力", "section.trust": "真实认证",
  "home.viewAll": "查看全部 →",
  "what.audience.title": "双受众", "what.audience.desc": "你的人用 Web，你的 AI PACS 用 MCP，同一套能力。",
  "what.private.title": "私域安全", "what.private.desc": "AI 能力与数据在院内私域运行，数据不出院。",
  "what.mcp.title": "MCP 标准输出", "what.mcp.desc": "能力按 MCP 标准协议输出给智能体。",
  "what.real.title": "真实认证", "what.real.desc": "目录全部为可查 FDA 510(k) 的真实 AI 软件。",
  "step.discover.title": "发现", "step.discover.desc": "在门户浏览并评估能力",
  "step.activate.title": "开通", "step.activate.desc": "拿到凭据与连接配置",
  "step.connect.title": "连接", "step.connect.desc": "AI PACS 经 MCP 在私域内调用",
  "trust.note": "数据不出院 · 院内隔离 · 审计",
  "catalog.title": "能力目录", "catalog.search": "搜索能力", "catalog.count": "个能力",
  "filter.type": "类型", "filter.modality": "模态", "filter.all": "全部",
  "type.clinical-ai": "临床 AI 辅助", "type.platform": "AI 影像平台", "type.reconstruction": "AI 重建增强", "type.skill": "Skill",
  "detail.human": "人类视图", "detail.agent": "机器视图 / 智能体", "detail.clinical": "临床用途",
  "detail.copyMd": "复制成 markdown 喂给你的 AI", "detail.connect": "连接配置", "detail.notfound": "未找到该能力",
  "badge.fda": "FDA 510(k) 认证", "badge.demo": "演示·非器械", "badge.system": "随系统获批",
  "console.demo": "DEMO · 演示数据", "console.dashboard": "控制台", "console.services": "我的服务",
  "console.connect": "连接与凭据", "console.usage": "用量 / 订阅",
  "console.activated": "已开通能力", "console.calls": "本月调用", "console.online": "在线",
  "console.expiring": "即将到期", "console.plan": "当前订阅", "console.renews": "续费日", "console.enterprise": "企业版",
  "status.online": "智能体已连接",
  "col.capability": "能力", "col.status": "状态", "col.modality": "模态", "col.expires": "到期",
  "connect.lead": "智能体经此连接：复制 MCP 端点与凭据到你的 AI PACS。",
  "usage.note": "（计量与账单为概念演示）",
  "how.title": "如何工作：发现 → 开通 → 连接",
  "how.lead": "同一套能力，人用门户、智能体用 MCP；调用发生在医院私域内，数据不出院。",
  "how.s1.title": "① 人在门户发现并开通", "how.s1.desc": "院方 IT 在门户浏览能力、评估临床价值与 FDA 认证，完成开通。",
  "how.s2.title": "② 获取连接配置", "how.s2.desc": "开通后获得 MCP 端点与 API Key（详情页机器视图可复制）。",
  "how.s3.title": "③ 智能体经 MCP 连接", "how.s3.desc": "院内 AI PACS（LLM+Agent）加载 Skill/MCP，按标准协议连接能力。",
  "how.s4.title": "④ 私域内调用", "how.s4.desc": "能力在医院私域内执行，数据不出院，过程可审计。",
  "copy.done": "已复制 ✓", "copy.label": "复制", "foot.copy": "© 2026 联影智能 · Agent Hub"
}
```
`src/locales/en.json`：同样的 key 集，value 取 v0 对应英文（`I18N[k].en`；收编项按 v0 内联 ternary 的英文分支；如 `"nav.market": "Marketplace"`、`"type.clinical-ai": "Clinical AI"`、`"how.title": "How it works: Discover → Activate → Connect"` …）。**两个文件 key 必须逐一对应**（测试会校验）。

- [ ] **Step 4: 通过** Run: `pnpm test tests/i18n.test.ts` → 3 passed.

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): i18n locale files (ported dict + collected inline strings)"
```

---

### Task 9: 机器视图生成脚本 + Mock JSON

**Files:** Create `scripts/build-machine-views.ts`, `src/data/console.ts`, `tests/machineViews.test.ts`

- [ ] **Step 1: 控制台演示数据 src/data/console.ts**
```ts
// src/data/console.ts —— 伪控制台演示数据（假数据，从 FDA 能力派生前 5 个“已开通”）
import type { ConsoleOverview } from '@/types/capability'
import { CAPABILITIES } from '@/data/capabilities'
const fdaCaps = CAPABILITIES.filter(c => c.fda).slice(0, 5)
export const CONSOLE_OVERVIEW: ConsoleOverview = {
  activated: fdaCaps.length,
  callsThisMonth: '128k',
  services: fdaCaps.map((c, i) => ({
    id: c.id, title: c.i18n.title, modality: c.modality, kNumber: c.fda!.kNumber,
    status: i === fdaCaps.length - 1 ? 'expiring' : 'online'
  }))
}
```

- [ ] **Step 2: 失败测试 tests/machineViews.test.ts**
```ts
import { test, expect } from 'vitest'
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

test('gen:machine writes catalog.json, llms.txt, mock JSON', () => {
  execSync('pnpm gen:machine', { cwd: process.cwd() })
  for (const f of ['public/catalog.json','public/llms.txt','public/mock/capabilities.json','public/mock/console.json'])
    expect(existsSync(f), f).toBe(true)
  const cat = JSON.parse(readFileSync('public/catalog.json','utf8'))
  expect(cat.version).toBe(1); expect(cat.items.length).toBe(10)
  expect(readFileSync('public/llms.txt','utf8')).toContain('K242292')
  const mock = JSON.parse(readFileSync('public/mock/capabilities.json','utf8'))
  expect(mock.length).toBe(10)
})
```

- [ ] **Step 3: 失败** Run: `pnpm test tests/machineViews.test.ts` → FAIL.

- [ ] **Step 4: 生成脚本 scripts/build-machine-views.ts**
```ts
// scripts/build-machine-views.ts —— 单一数据源 → 机器视图 + mock 伪 API
import { mkdirSync, writeFileSync } from 'node:fs'
import { CAPABILITIES } from '../src/data/capabilities'
import { CONSOLE_OVERVIEW } from '../src/data/console'
import { buildCatalogJson, buildLlmsTxt } from '../src/lib/catalogFormat'

mkdirSync('public/mock', { recursive: true })
writeFileSync('public/catalog.json', JSON.stringify(buildCatalogJson(CAPABILITIES), null, 2) + '\n')
writeFileSync('public/llms.txt', buildLlmsTxt(CAPABILITIES))
writeFileSync('public/mock/capabilities.json', JSON.stringify(CAPABILITIES, null, 2) + '\n')
writeFileSync('public/mock/console.json', JSON.stringify(CONSOLE_OVERVIEW, null, 2) + '\n')
console.log('machine views + mock written')
```
> `pnpm gen:machine` 用 `tsx` 直接跑 TS（package.json 已配）。

- [ ] **Step 5: 通过** Run: `cd /e/UiiAgentHub && pnpm gen:machine && pnpm test tests/machineViews.test.ts` → passed.

- [ ] **Step 6: gitignore 生成物**

把以下加入 `.gitignore`（生成物不入源码仓库，构建时再生成）：
```
public/catalog.json
public/llms.txt
public/mock/
```

- [ ] **Step 7: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): machine-view + mock generator from single source"
```

---

## Phase 2 · 数据访问层（Mock）

### Task 10: DataSource 抽象 + Mock 实现 + 选择器

**Files:** Create `src/services/dataSource.ts`, `mockDataSource.ts`, `httpDataSource.ts`, `index.ts`, `tests/dataSource.test.ts`; create `.env.mock`, `.env.api`

- [ ] **Step 1: 失败测试 tests/dataSource.test.ts**
```ts
import { test, expect, vi, beforeEach } from 'vitest'
import { MockDataSource } from '@/services/mockDataSource'
import { CAPABILITIES } from '@/data/capabilities'
import { CONSOLE_OVERVIEW } from '@/data/console'

beforeEach(() => {
  // mock fetch to serve the in-repo data as if from /mock/*.json
  globalThis.fetch = vi.fn(async (url: any) => {
    const u = String(url)
    const body = u.includes('console') ? CONSOLE_OVERVIEW : CAPABILITIES
    return { ok: true, json: async () => body } as Response
  })
})

test('listCapabilities returns all', async () => {
  const ds = new MockDataSource('/')
  expect((await ds.listCapabilities()).length).toBe(10)
})
test('getCapability by id, null when missing', async () => {
  const ds = new MockDataSource('/')
  expect((await ds.getCapability('uai-easy-triage-ich'))?.id).toBe('uai-easy-triage-ich')
  expect(await ds.getCapability('nope')).toBeNull()
})
test('getConsoleOverview', async () => {
  const ds = new MockDataSource('/')
  expect((await ds.getConsoleOverview()).activated).toBeGreaterThan(0)
})
```

- [ ] **Step 2: 失败** Run: `pnpm test tests/dataSource.test.ts` → FAIL.

- [ ] **Step 3: 接口 + 实现**
```ts
// src/services/dataSource.ts
import type { Capability, ConsoleOverview } from '@/types/capability'
export interface DataSource {
  listCapabilities(): Promise<Capability[]>
  getCapability(id: string): Promise<Capability | null>
  getConsoleOverview(): Promise<ConsoleOverview>
}
```
```ts
// src/services/mockDataSource.ts
import type { DataSource } from './dataSource'
import type { Capability, ConsoleOverview } from '@/types/capability'
export class MockDataSource implements DataSource {
  constructor(private base: string) {}
  private async json<T>(path: string): Promise<T> {
    const res = await fetch(this.base + path)
    if (!res.ok) throw new Error(`mock fetch failed: ${path}`)
    return res.json() as Promise<T>
  }
  async listCapabilities() { return this.json<Capability[]>('mock/capabilities.json') }
  async getCapability(id: string) {
    const all = await this.listCapabilities()
    return all.find(c => c.id === id) ?? null
  }
  async getConsoleOverview() { return this.json<ConsoleOverview>('mock/console.json') }
}
```
```ts
// src/services/httpDataSource.ts —— 未来真后端，本期仅 stub（不实现）
import type { DataSource } from './dataSource'
import type { Capability, ConsoleOverview } from '@/types/capability'
export class HttpDataSource implements DataSource {
  constructor(private apiBase: string) {}
  async listCapabilities(): Promise<Capability[]> { throw new Error('HttpDataSource not implemented') }
  async getCapability(_id: string): Promise<Capability | null> { throw new Error('HttpDataSource not implemented') }
  async getConsoleOverview(): Promise<ConsoleOverview> { throw new Error('HttpDataSource not implemented') }
}
```
```ts
// src/services/index.ts —— 按构建模式选择实现
import type { DataSource } from './dataSource'
import { MockDataSource } from './mockDataSource'
import { HttpDataSource } from './httpDataSource'
export function createDataSource(): DataSource {
  const base = import.meta.env.BASE_URL // Vite 注入，含 GH Pages 子路径
  if (import.meta.env.VITE_DATA === 'api') return new HttpDataSource(import.meta.env.VITE_API_BASE || '')
  return new MockDataSource(base)
}
export type { DataSource }
```

- [ ] **Step 4: env 文件**

`.env.mock`:
```
VITE_DATA=mock
```
`.env.api`:
```
VITE_DATA=api
VITE_API_BASE=https://api.example/v1
```

- [ ] **Step 5: 通过** Run: `pnpm test tests/dataSource.test.ts && pnpm exec vue-tsc --noEmit` → passed.

- [ ] **Step 6: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): DataSource abstraction + MockDataSource + selector"
```

---

## Phase 3 · 样式、壳、路由、i18n 接线

### Task 11: 样式平移

**Files:** Create `src/styles/tokens.css`, `base.css`, `console.css`

- [ ] **Step 1: 平移三个 CSS**

把 v0 的 `assets/css/tokens.css`、`base.css`、`console.css` **逐字复制**到 `src/styles/` 同名文件（内容不改——它们已是 CSS 变量主题，符合 MCSF 换肤规范）。

- [ ] **Step 2: stylelint 通过**

Run: `cd /e/UiiAgentHub && pnpm exec stylelint "src/styles/*.css"`
Expected: 无 error（如个别规则与既有写法冲突，按 `.stylelintrc.json` 已放开的项即可；不要改动颜色值/token）。

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): port CSS token theme (tokens/base/console)"
```

---

### Task 12: i18n 接线 + main.ts + App.vue 壳

**Files:** Create `src/i18n.ts`; Modify `src/main.ts`, `src/App.vue`

- [ ] **Step 1: src/i18n.ts**
```ts
// src/i18n.ts
import { createI18n } from 'vue-i18n'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'
const KEY = 'uii_lang'
function detect(): 'zh' | 'en' {
  const u = new URLSearchParams(location.search).get('lang')
  if (u === 'zh' || u === 'en') { localStorage.setItem(KEY, u); return u }
  const s = localStorage.getItem(KEY)
  return s === 'en' ? 'en' : 'zh'
}
export const i18n = createI18n({ legacy: false, locale: detect(), fallbackLocale: 'zh', messages: { zh, en } })
export function setLang(l: 'zh' | 'en') { localStorage.setItem(KEY, l); location.reload() }
```

- [ ] **Step 2: src/main.ts**
```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { createDataSource } from './services'
import './styles/tokens.css'
import './styles/base.css'
import './styles/console.css'

const app = createApp(App)
app.provide('dataSource', createDataSource())
app.use(router).use(i18n).mount('#app')
```

- [ ] **Step 3: src/App.vue（壳 + 错误边界）**
```vue
<!-- src/App.vue -->
<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import AppErrorBoundary from '@/components/AppErrorBoundary.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const isConsole = computed(() => String(route.path).startsWith('/console'))
</script>
<template>
  <SiteHeader />
  <AppErrorBoundary>
    <RouterView />
  </AppErrorBoundary>
  <SiteFooter v-if="!isConsole" />
</template>
```
> 注：控制台页自带全高布局，沿用 v0「控制台无页脚」的设计；`isConsole` 控制页脚显隐。

- [ ] **Step 4: 类型检查（此时 Header/Footer/ErrorBoundary/router 尚未建，预期报错——下一任务补齐后再验证）**

跳过验证，直接到 Task 13/14；在 Task 14 末尾统一 `vue-tsc --noEmit`。

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): i18n setup + app bootstrap + shell"
```

---

### Task 13: 路由

**Files:** Create `src/router/index.ts`

- [ ] **Step 1: 路由表（hash 历史，GH Pages 免 404）**
```ts
// src/router/index.ts
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/catalog', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/capability/:id', name: 'capability', component: () => import('@/views/CapabilityDetailView.vue') },
  { path: '/how-it-works', name: 'how', component: () => import('@/views/HowItWorksView.vue') },
  { path: '/console', name: 'console', component: () => import('@/views/console/DashboardView.vue') },
  { path: '/console/services', name: 'console-services', component: () => import('@/views/console/ServicesView.vue') },
  { path: '/console/connect', name: 'console-connect', component: () => import('@/views/console/ConnectView.vue') },
  { path: '/console/usage', name: 'console-usage', component: () => import('@/views/console/UsageView.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/NotFoundView.vue') }
]
export const router = createRouter({ history: createWebHashHistory(import.meta.env.BASE_URL), routes })
```

- [ ] **Step 2: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): hash router"
```

---

### Task 14: 页头 / 页脚 / 错误边界

**Files:** Create `src/components/SiteHeader.vue`, `SiteFooter.vue`, `AppErrorBoundary.vue`

- [ ] **Step 1: SiteHeader.vue**（复刻 v0 `main.js` 的 header，class 不变）
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLang } from '@/i18n'
const { t, locale } = useI18n()
const other = () => (locale.value === 'zh' ? 'en' : 'zh')
function toggle() { setLang(locale.value === 'zh' ? 'en' : 'zh') }
</script>
<template>
  <header id="site-header">
    <div class="container nav-inner">
      <RouterLink class="brand" to="/"><span class="brand-mark">UII</span><span class="brand-text">联影智能 · Agent Hub</span></RouterLink>
      <nav class="nav-links">
        <RouterLink to="/catalog">{{ t('nav.market') }}</RouterLink>
        <RouterLink to="/how-it-works">{{ t('nav.how') }}</RouterLink>
        <RouterLink class="nav-cta" to="/console">{{ t('nav.console') }}</RouterLink>
        <button class="lang-toggle" type="button" @click="toggle">{{ other() }}</button>
      </nav>
    </div>
  </header>
</template>
```
> 滚动加 `.scrolled` 边框：在 `onMounted` 加 scroll 监听（可选，视觉细节）。最小实现可省略；若加：
```ts
import { onMounted, onUnmounted } from 'vue'
onMounted(() => { const h = document.getElementById('site-header'); const f = () => h?.classList.toggle('scrolled', scrollY > 12); addEventListener('scroll', f, { passive: true }); f() })
```

- [ ] **Step 2: SiteFooter.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const base = import.meta.env.BASE_URL
</script>
<template>
  <footer id="site-footer">
    <div class="container foot-inner">
      <span>{{ t('foot.copy') }}</span>
      <a :href="base + 'llms.txt'">llms.txt</a>
      <a :href="base + 'catalog.json'">catalog.json</a>
      <a href="https://github.com/ruanrrn/UII-Agent-Suite" target="_blank" rel="noopener">GitHub</a>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: AppErrorBoundary.vue（MCSF 错误隔离：onErrorCaptured）**
```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
const err = ref<Error | null>(null)
onErrorCaptured(e => { err.value = e as Error; return false })
</script>
<template>
  <div v-if="err" class="empty">⚠ {{ err.message }}</div>
  <slot v-else />
</template>
```

- [ ] **Step 4: 类型检查（Header/Footer/ErrorBoundary 已建；views 仍缺 → 仍会报缺失。先验证这三个组件单独无类型错）**

Run: `cd /e/UiiAgentHub && pnpm exec vue-tsc --noEmit 2>&1 | grep -E "SiteHeader|SiteFooter|AppErrorBoundary" || echo "no errors in shell components"`
Expected: 这三个组件无报错（views 缺失的报错此刻忽略，Phase 5 补齐）。

- [ ] **Step 5: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): site header/footer + error boundary"
```

---

## Phase 4 · 组件

### Task 15: Badge + CapabilityCard

**Files:** Create `src/components/Badge.vue`, `CapabilityCard.vue`

- [ ] **Step 1: Badge.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const props = defineProps<{ kind: string }>()
const { t } = useI18n()
const cls = { fda: 'badge-fda', demo: 'badge-demo', system: 'badge-sys' }[props.kind] || ''
const label = () => props.kind === 'fda' ? t('badge.fda') : props.kind === 'demo' ? t('badge.demo') : t('badge.system')
</script>
<template><span class="badge" :class="cls">{{ label() }}</span></template>
```

- [ ] **Step 2: CapabilityCard.vue**（复刻 v0 card 结构）
```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability'
import { useI18n } from 'vue-i18n'
import Badge from './Badge.vue'
const props = defineProps<{ cap: Capability }>()
const { locale } = useI18n()
const L = () => locale.value as 'zh' | 'en'
const tx = (f: 'title' | 'tagline' | 'description') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh
</script>
<template>
  <RouterLink class="cap-card" :to="`/capability/${cap.id}`">
    <div class="cap-top">
      <span class="cap-icon">{{ cap.icon }}</span>
      <span class="cap-badges"><Badge v-for="b in cap.badges" :key="b" :kind="b" /></span>
    </div>
    <h3 class="cap-name">{{ tx('title') }}</h3>
    <div class="cap-tagline">{{ tx('tagline') }}</div>
    <p class="cap-desc">{{ tx('description') }}</p>
    <div class="cap-foot"><span class="cap-modality">{{ cap.modality }}</span><span v-if="cap.fda" class="cap-k">{{ cap.fda.kNumber }}</span></div>
  </RouterLink>
</template>
```

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): Badge + CapabilityCard components"
```

---

### Task 16: DualRail + ConnectBlock

**Files:** Create `src/components/ConnectBlock.vue`, `DualRail.vue`

- [ ] **Step 1: ConnectBlock.vue**（机器视图 + 复制 markdown）
```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { capabilityToMarkdown } from '@/lib/catalogFormat'
const props = defineProps<{ cap: Capability }>()
const { t, locale } = useI18n()
const label = ref('')
async function copy() {
  const md = capabilityToMarkdown(props.cap, locale.value as 'zh' | 'en')
  try { await navigator.clipboard.writeText(md) } catch { /* ignore */ }
  label.value = t('copy.done'); setTimeout(() => (label.value = t('detail.copyMd')), 1500)
}
const rows = () => [['MCP endpoint', props.cap.connect.mcpEndpoint], ['API Key', props.cap.connect.apiKeyHint], ['llms.txt', props.cap.connect.llmsTxt]]
</script>
<template>
  <div class="machine-block">
    <div class="mc-title">{{ t('detail.connect') }}</div>
    <div v-for="[k, v] in rows()" :key="k" class="mc-row"><span class="mc-k">{{ k }}</span><code>{{ v }}</code></div>
    <button class="mc-copy" type="button" @click="copy">{{ label || t('detail.copyMd') }}</button>
  </div>
</template>
```

- [ ] **Step 2: DualRail.vue**（人/机双栏）
```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability'
import { useI18n } from 'vue-i18n'
import Badge from './Badge.vue'
import ConnectBlock from './ConnectBlock.vue'
const props = defineProps<{ cap: Capability }>()
const { t, locale } = useI18n()
const L = () => locale.value as 'zh' | 'en'
const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh
</script>
<template>
  <div class="detail-head">
    <span class="cap-icon big">{{ cap.icon }}</span>
    <div>
      <h1>{{ tx('title') }}</h1>
      <div class="detail-tag">{{ tx('tagline') }}</div>
      <div class="cap-badges"><Badge v-for="b in cap.badges" :key="b" :kind="b" /></div>
    </div>
  </div>
  <div class="detail-dual">
    <div class="dual-human">
      <div class="dual-label">{{ t('detail.human') }}</div>
      <p>{{ tx('description') }}</p>
      <div class="dual-sub">{{ t('detail.clinical') }}</div><p>{{ tx('clinicalUse') }}</p>
      <div v-if="cap.fda" class="fda-line">
        <b>{{ t('badge.fda') }}</b> · {{ cap.fda.kNumber }} · {{ cap.fda.decisionDate }} · {{ cap.fda.productCode }}<br>
        <span class="fda-applicant">{{ cap.fda.applicant }}</span>
      </div>
      <div v-else class="fda-line">{{ t('badge.demo') }}</div>
    </div>
    <div class="dual-agent">
      <div class="dual-label dark">{{ t('detail.agent') }}</div>
      <ConnectBlock :cap="cap" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): DualRail + ConnectBlock (copy-as-markdown)"
```

---

### Task 17: TrustBand + ConsoleShell

**Files:** Create `src/components/TrustBand.vue`, `ConsoleShell.vue`

- [ ] **Step 1: TrustBand.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CAPABILITIES } from '@/data/capabilities'
const { t } = useI18n()
const ks = [...new Set(CAPABILITIES.filter(c => c.fda).map(c => c.fda!.kNumber))]
</script>
<template>
  <div class="trust-band">
    <span class="trust-chip">FDA 510(k)</span>
    <span v-for="k in ks" :key="k" class="trust-k">{{ k }}</span>
    <span class="trust-note">{{ t('trust.note') }}</span>
  </div>
</template>
```

- [ ] **Step 2: ConsoleShell.vue**（深色侧栏；slot 放页面内容）
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
defineProps<{ active: 'index' | 'services' | 'connect' | 'usage' }>()
const { t } = useI18n()
const nav: Array<['index' | 'services' | 'connect' | 'usage', string, string]> = [
  ['index', '/console', 'console.dashboard'],
  ['services', '/console/services', 'console.services'],
  ['connect', '/console/connect', 'console.connect'],
  ['usage', '/console/usage', 'console.usage']
]
</script>
<template>
  <div class="cn-wrap">
    <aside class="cn-side">
      <div class="cn-brand">UII Console</div>
      <nav>
        <RouterLink v-for="[k, to, key] in nav" :key="k" class="cn-link" :class="{ on: k === active }" :to="to">{{ t(key) }}</RouterLink>
      </nav>
    </aside>
    <main class="cn-main"><span class="cn-demo">{{ t('console.demo') }}</span><slot /></main>
  </div>
</template>
```

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): TrustBand + ConsoleShell"
```

---

## Phase 5 · 视图

### Task 18: HomeView

**Files:** Create `src/views/HomeView.vue`

- [ ] **Step 1: HomeView.vue**（复刻 v0 首页叙事；用 i18n keys + 组件）
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CAPABILITIES } from '@/data/capabilities'
import CapabilityCard from '@/components/CapabilityCard.vue'
import TrustBand from '@/components/TrustBand.vue'
const { t } = useI18n()
const featured = CAPABILITIES.filter(c => c.type !== 'skill').slice(0, 6)
const what = ['audience', 'private', 'mcp', 'real'] as const
const steps = ['discover', 'activate', 'connect'] as const
</script>
<template>
  <main>
    <section class="hero section dark"><div class="container">
      <p class="hero-eyebrow">{{ t('home.eyebrow') }}</p>
      <h1 class="hero-title">{{ t('hero.title') }}</h1>
      <p class="hero-sub">{{ t('hero.sub') }}</p>
      <div class="hero-cta">
        <RouterLink class="btn btn-key" to="/catalog">{{ t('cta.browse') }}</RouterLink>
        <RouterLink class="btn btn-ghost ghost-on-dark" to="/console">{{ t('nav.console') }}</RouterLink>
      </div>
    </div></section>

    <section class="section"><div class="container">
      <h2>{{ t('section.what') }}</h2>
      <div class="what-grid">
        <div v-for="w in what" :key="w" class="what-card"><div class="what-dot"></div>
          <h3>{{ t(`what.${w}.title`) }}</h3><p>{{ t(`what.${w}.desc`) }}</p></div>
      </div>
    </div></section>

    <section class="section" style="background:var(--bg-section)"><div class="container">
      <div class="row-between"><h2>{{ t('section.featured') }}</h2><RouterLink to="/catalog">{{ t('home.viewAll') }}</RouterLink></div>
      <div class="cap-grid"><CapabilityCard v-for="c in featured" :key="c.id" :cap="c" /></div>
    </div></section>

    <section class="section dark"><div class="container">
      <h2>{{ t('nav.how') }}</h2>
      <div class="steps">
        <div v-for="(s, i) in steps" :key="s" class="step"><span class="step-n">{{ i + 1 }}</span>
          <h3>{{ t(`step.${s}.title`) }}</h3><p>{{ t(`step.${s}.desc`) }}</p></div>
        <RouterLink class="btn btn-key" to="/how-it-works">{{ t('nav.how') }} →</RouterLink>
      </div>
    </div></section>

    <section class="section"><div class="container">
      <h2>{{ t('section.trust') }}</h2><TrustBand />
    </div></section>
  </main>
</template>
```

- [ ] **Step 2: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): HomeView"
```

---

### Task 19: CatalogView

**Files:** Create `src/views/CatalogView.vue`

- [ ] **Step 1: CatalogView.vue**（搜索 + 筛选；用 DataSource）
```vue
<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataSource } from '@/services'
import type { Capability, CapType, Modality } from '@/types/capability'
import { filterCapabilities } from '@/lib/filters'
import CapabilityCard from '@/components/CapabilityCard.vue'
const { t } = useI18n()
const ds = inject<DataSource>('dataSource')!
const all = ref<Capability[]>([])
const q = ref(''); const type = ref<CapType | ''>(''); const modality = ref<Modality | ''>('')
onMounted(async () => { all.value = await ds.listCapabilities() })
const types: Array<CapType | ''> = ['', 'clinical-ai', 'platform', 'reconstruction', 'skill']
const mods: Array<Modality | ''> = ['', 'CT', 'MR', 'PET', 'X-ray', 'Cross']
const result = computed(() => filterCapabilities(all.value, { q: q.value, type: type.value, modality: modality.value }))
const typeLabel = (v: CapType | '') => v === '' ? t('filter.all') : t(`type.${v}`)
</script>
<template>
  <main class="container catalog-wrap">
    <div class="catalog-head"><h1>{{ t('catalog.title') }}</h1>
      <input v-model="q" class="cat-search" type="search" :placeholder="t('catalog.search')"></div>
    <div class="catalog-body">
      <aside class="cat-side">
        <div class="side-label">{{ t('filter.type') }}</div>
        <div class="side-list">
          <button v-for="v in types" :key="v" class="side-item" :class="{ on: type === v }" @click="type = v">{{ typeLabel(v) }}</button>
        </div>
        <div class="side-label">{{ t('filter.modality') }}</div>
        <div class="side-chips">
          <button v-for="m in mods" :key="m" class="side-chip" :class="{ on: modality === m }" @click="modality = m">{{ m || t('filter.all') }}</button>
        </div>
      </aside>
      <section>
        <p class="cat-count">{{ result.length }} {{ t('catalog.count') }}</p>
        <div class="cap-grid"><CapabilityCard v-for="c in result" :key="c.id" :cap="c" /></div>
      </section>
    </div>
  </main>
</template>
```

- [ ] **Step 2: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): CatalogView (search + filters via DataSource)"
```

---

### Task 20: CapabilityDetailView + NotFoundView

**Files:** Create `src/views/CapabilityDetailView.vue`, `src/views/NotFoundView.vue`

- [ ] **Step 1: CapabilityDetailView.vue**
```vue
<script setup lang="ts">
import { ref, inject, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { DataSource } from '@/services'
import type { Capability } from '@/types/capability'
import DualRail from '@/components/DualRail.vue'
const route = useRoute()
const { t } = useI18n()
const ds = inject<DataSource>('dataSource')!
const cap = ref<Capability | null>(null); const loaded = ref(false)
watchEffect(async () => { loaded.value = false; cap.value = await ds.getCapability(String(route.params.id)); loaded.value = true })
</script>
<template>
  <main class="container detail-wrap">
    <DualRail v-if="cap" :cap="cap" />
    <p v-else-if="loaded" class="empty">{{ t('detail.notfound') }}</p>
  </main>
</template>
```
> `{{ }}` 插值天然转义，v0 评审的 XSS（未转义 id）在 Vue 模板里不复现。

- [ ] **Step 2: NotFoundView.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<template><main class="container" style="padding:60px 32px"><p class="empty">404 · {{ t('detail.notfound') }}</p></main></template>
```

- [ ] **Step 3: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): CapabilityDetailView + NotFoundView"
```

---

### Task 21: HowItWorksView

**Files:** Create `src/views/HowItWorksView.vue`

- [ ] **Step 1: HowItWorksView.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const steps = ['s1', 's2', 's3', 's4'] as const
</script>
<template>
  <main><section class="section dark"><div class="container">
    <h1>{{ t('how.title') }}</h1>
    <p class="how-lead">{{ t('how.lead') }}</p>
    <div class="flow">
      <div v-for="s in steps" :key="s" class="flow-step"><h3>{{ t(`how.${s}.title`) }}</h3><p>{{ t(`how.${s}.desc`) }}</p></div>
    </div>
  </div></section></main>
</template>
```

- [ ] **Step 2: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): HowItWorksView"
```

---

### Task 22: 控制台四视图

**Files:** Create `src/views/console/DashboardView.vue`, `ServicesView.vue`, `ConnectView.vue`, `UsageView.vue`

- [ ] **Step 1: DashboardView.vue**
```vue
<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataSource } from '@/services'
import type { ConsoleOverview } from '@/types/capability'
import ConsoleShell from '@/components/ConsoleShell.vue'
const { t, locale } = useI18n()
const ds = inject<DataSource>('dataSource')!
const ov = ref<ConsoleOverview | null>(null)
onMounted(async () => { ov.value = await ds.getConsoleOverview() })
const L = () => locale.value as 'zh' | 'en'
const services = computed(() => ov.value?.services ?? [])
</script>
<template>
  <ConsoleShell active="index">
    <h1>{{ t('console.dashboard') }}</h1>
    <div class="cn-cards">
      <div class="cn-stat"><div class="num">{{ ov?.activated ?? 0 }}</div><div class="lbl">{{ t('console.activated') }}</div></div>
      <div class="cn-stat"><div class="num">{{ ov?.callsThisMonth ?? '—' }}</div><div class="lbl">{{ t('console.calls') }}</div></div>
      <div class="cn-stat"><div class="num cn-online" style="font-size:20px">{{ t('console.online') }}</div><div class="lbl">{{ t('status.online') }}</div></div>
    </div>
    <table class="cn-table">
      <thead><tr><th>{{ t('col.capability') }}</th><th>{{ t('col.status') }}</th><th>K#</th></tr></thead>
      <tbody><tr v-for="s in services" :key="s.id"><td>{{ s.title[L()] }}</td><td class="cn-online">{{ t('status.online') }}</td><td>{{ s.kNumber }}</td></tr></tbody>
    </table>
  </ConsoleShell>
</template>
```

- [ ] **Step 2: ServicesView.vue**
```vue
<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataSource } from '@/services'
import type { ConsoleOverview } from '@/types/capability'
import ConsoleShell from '@/components/ConsoleShell.vue'
const { t, locale } = useI18n()
const ds = inject<DataSource>('dataSource')!
const ov = ref<ConsoleOverview | null>(null)
onMounted(async () => { ov.value = await ds.getConsoleOverview() })
const L = () => locale.value as 'zh' | 'en'
const services = computed(() => ov.value?.services ?? [])
</script>
<template>
  <ConsoleShell active="services">
    <h1>{{ t('console.services') }}</h1>
    <table class="cn-table">
      <thead><tr><th>{{ t('col.capability') }}</th><th>{{ t('col.modality') }}</th><th>{{ t('col.status') }}</th><th>{{ t('col.expires') }}</th></tr></thead>
      <tbody>
        <tr v-for="s in services" :key="s.id">
          <td>{{ s.title[L()] }}</td><td>{{ s.modality }}</td>
          <td :class="s.status === 'expiring' ? 'cn-soon' : 'cn-online'">{{ s.status === 'expiring' ? t('console.expiring') : t('status.online') }}</td>
          <td>2027-01-01</td>
        </tr>
      </tbody>
    </table>
  </ConsoleShell>
</template>
```

- [ ] **Step 3: ConnectView.vue**
```vue
<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataSource } from '@/services'
import type { Capability } from '@/types/capability'
import ConsoleShell from '@/components/ConsoleShell.vue'
import ConnectBlock from '@/components/ConnectBlock.vue'
const { t } = useI18n()
const ds = inject<DataSource>('dataSource')!
const caps = ref<Capability[]>([])
onMounted(async () => { caps.value = (await ds.listCapabilities()).filter(c => c.fda).slice(0, 5) })
</script>
<template>
  <ConsoleShell active="connect">
    <h1>{{ t('console.connect') }}</h1>
    <p style="color:var(--ink-3);max-width:46em">{{ t('connect.lead') }}</p>
    <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <div v-for="c in caps" :key="c.id"><ConnectBlock :cap="c" /></div>
    </div>
  </ConsoleShell>
</template>
```

- [ ] **Step 4: UsageView.vue**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ConsoleShell from '@/components/ConsoleShell.vue'
const { t } = useI18n()
</script>
<template>
  <ConsoleShell active="usage">
    <h1>{{ t('console.usage') }}</h1>
    <div class="cn-cards">
      <div class="cn-stat"><div class="num">128k</div><div class="lbl">{{ t('console.calls') }}</div></div>
      <div class="cn-stat"><div class="num">{{ t('console.enterprise') }}</div><div class="lbl">{{ t('console.plan') }}</div></div>
      <div class="cn-stat"><div class="num">2027-01</div><div class="lbl">{{ t('console.renews') }}</div></div>
    </div>
    <p style="color:var(--ink-3)">{{ t('usage.note') }}</p>
  </ConsoleShell>
</template>
```

- [ ] **Step 5: 全量类型检查 + 测试 + dev 构建**

Run: `cd /e/UiiAgentHub && pnpm exec vue-tsc --noEmit && pnpm test && pnpm gen:machine && pnpm build`
Expected: 类型 0 错；所有 Vitest 通过；`pnpm build` 成功产出 `dist/`（构建期 machineViews 插件已生成机器视图）。

- [ ] **Step 6: Commit**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "feat(v2): console views (dashboard/services/connect/usage)"
```

---

## Phase 6 · 构建产物、部署、清理

### Task 23: 双产物构建验证 + 可移植 Mock 包

**Files:** Modify `package.json`(已含 build:pages/build:pkg); Create `scripts/zip-pkg.mjs`

- [ ] **Step 1: 验证 Pages 版构建（带子路径 base）**

Run: `cd /e/UiiAgentHub && VITE_BASE=/UII-Agent-Suite/ pnpm build:pages`
Expected: `dist/` 生成；`dist/index.html` 内资源引用以 `/UII-Agent-Suite/` 前缀；`dist/llms.txt`、`dist/catalog.json`、`dist/mock/*.json` 存在。

- [ ] **Step 2: 验证可移植 Mock 包构建（相对 base）**

Run: `cd /e/UiiAgentHub && pnpm build:pkg`
Expected: `dist-pkg/` 生成；`dist-pkg/index.html` 资源引用为相对路径（`./assets/...`）；含 mock/llms/catalog。

- [ ] **Step 3: 打包 zip 脚本 scripts/zip-pkg.mjs**
```js
// scripts/zip-pkg.mjs —— 把 dist-pkg 打成可直接部署的 zip（用系统自带工具，跨平台优先 Node）
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
if (!existsSync('dist-pkg')) { console.error('run build:pkg first'); process.exit(1) }
const out = 'uii-agent-suite-mock.zip'
try {
  // Windows PowerShell Compress-Archive
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path dist-pkg/* -DestinationPath ${out} -Force"`, { stdio: 'inherit' })
} catch {
  execSync(`cd dist-pkg && zip -r ../${out} .`, { stdio: 'inherit' }) // POSIX 回退
}
console.log('wrote', out)
```
Add script to package.json `"pkg:zip": "pnpm build:pkg && node scripts/zip-pkg.mjs"`.

- [ ] **Step 4: 验证 zip**

Run: `cd /e/UiiAgentHub && pnpm pkg:zip`
Expected: 生成 `uii-agent-suite-mock.zip`（解压后任意静态服务器/双击 index.html via 本地服务器即可运行——hash 路由免配置）。

- [ ] **Step 5: gitignore 构建产物 + 提交脚本**

`.gitignore` 追加：
```
dist
dist-pkg
*.zip
```
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "build(v2): dual-product build (pages + portable mock zip)"
```

---

### Task 24: 本地部署命令 + workflow 模板 + README

**Files:** Create `scripts/deploy-pages.mjs`, `.github/workflows/deploy.yml`, `public/.nojekyll`, `README.md`

- [ ] **Step 1: public/.nojekyll**（空文件，禁用 Pages 的 Jekyll）

创建空文件 `public/.nojekyll`。

- [ ] **Step 2: scripts/deploy-pages.mjs（阶段 1 本地部署：构建→推产物仓库）**
```js
// scripts/deploy-pages.mjs —— 本地把 Pages 版部署到“公开产物仓库”
// 用法：DEPLOY_REPO=git@github.com:<org>/UII-Agent-Suite.git PAGES_BASE=/UII-Agent-Suite/ node scripts/deploy-pages.mjs
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
const repo = process.env.DEPLOY_REPO
const base = process.env.PAGES_BASE
if (!repo || !base) { console.error('Set DEPLOY_REPO and PAGES_BASE env vars (产物仓库地址与子路径)'); process.exit(1) }
const run = (c, o = {}) => execSync(c, { stdio: 'inherit', ...o })
run('pnpm lint'); run('pnpm test')                  // 本地门禁
run(`node -e "process.exit(0)"`)
process.env.VITE_BASE = base
run('pnpm build:pages')
writeFileSync('dist/.nojekyll', '')
// 在 dist 内初始化一次性 git，强推到产物仓库的 gh-pages 分支
run('git init -q', { cwd: 'dist' })
run('git checkout -q -B gh-pages', { cwd: 'dist' })
run('git add -A', { cwd: 'dist' })
run('git -c user.email=deploy@uii-ai.example -c user.name=deploy commit -q -m "deploy: pages build"', { cwd: 'dist' })
run(`git push -f ${repo} gh-pages`, { cwd: 'dist' })
console.log('Deployed dist → ', repo, 'gh-pages. 到产物仓库 Settings→Pages 选择 gh-pages 分支。')
if (!existsSync('dist/index.html')) process.exit(1)
```
> 阶段 1 唯一部署路径；产物仓库名（`②` 决议待用户提供）通过 env 传入，不写死。

- [ ] **Step 3: .github/workflows/deploy.yml（phase-2 预置模板，本期不调试）**
```yaml
# 预置模板：源码推上私有仓库后启用。本期不验证/不调试（用户决策：CI 触发本期不定）。
name: deploy-pages
on:
  push: { branches: [master] }   # 触发约定移交时再细化
  workflow_dispatch: {}
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10.14.0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22.18.0, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm test
      - run: pnpm build:pages
        env: { VITE_BASE: ${{ vars.PAGES_BASE }} }
      - run: cp public/.nojekyll dist/.nojekyll || true
      - name: Push to public pages repo
        uses: peaceiris/actions-gh-pages@v4
        with:
          personal_token: ${{ secrets.DEPLOY_TOKEN }}
          external_repository: ${{ vars.PAGES_REPO }}
          publish_branch: gh-pages
          publish_dir: ./dist
      - uses: actions/upload-artifact@v4
        with: { name: uii-agent-suite-mock, path: dist-pkg }
```

- [ ] **Step 4: README.md**
```markdown
# 联影智能 · Agent Hub (v2 · Vue + Vite + TS)

概念展示门户。MCSF2.0 规范栈。零运行时后端（Mock 数据）。

## 开发
\`\`\`
pnpm install
pnpm dev            # 本地开发（mock 数据）
pnpm test           # Vitest
pnpm lint           # oxlint + stylelint
\`\`\`

## 构建
- \`pnpm build:pages\`：GitHub Pages 版（用 \`VITE_BASE=/<仓库名>/\`）
- \`pnpm pkg:zip\`：可移植 Mock 包（相对路径，解压即用）

## 部署（阶段 1 · 本地）
\`\`\`
DEPLOY_REPO=git@github.com:<org>/UII-Agent-Suite.git PAGES_BASE=/UII-Agent-Suite/ pnpm deploy:pages
\`\`\`
源码推上私有仓库后，\`.github/workflows/deploy.yml\` 可启用自动部署（需配置 \`DEPLOY_TOKEN\` secret 与 \`PAGES_REPO\`/\`PAGES_BASE\` vars）。

## 数据
- 源：\`src/data/capabilities.ts\`（真实 FDA 510(k) 清单，单一数据源）
- 机器视图/Mock：构建期由 \`pnpm gen:machine\` 生成 \`public/{llms.txt,catalog.json,mock/*.json}\`
- 切真后端：实现 \`src/services/httpDataSource.ts\`，\`--mode api\` 即可，页面不变

## 版本偏差
（若安装时某依赖版本与 MCSF 规范不一致，在此记录实际版本与原因）
```

- [ ] **Step 5: 提交（注意 dist 已 ignore，workflow/readme/scripts 入库）**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "build(v2): local deploy command + CI template + README + .nojekyll"
```

---

### Task 25: 移除 v0 资产 + 最终验收

**Files:** Delete v0 根级文件；最终验证

- [ ] **Step 1: 删除 v0 vanilla 资产**（已全部被 src/ 取代；git 历史保留）
```bash
cd /e/UiiAgentHub && git rm -q index.html catalog.html capability.html how-it-works.html \
  assets/js/*.js assets/css/*.css console/*.html data/catalog.json llms.txt 2>/dev/null; \
  git rm -q -r assets/css assets/js console data 2>/dev/null; \
  git rm -q tests/*.test.js 2>/dev/null; true
```
> 注意：保留 `assets/img/`（若被 src 引用，已在 Task 11/Header 处理；本站 logo 用文字 mark，无图片依赖——确认 `assets/img` 无被引用后一并 `git rm -r assets`）。`.claude/launch.json` 指向旧静态服务，更新见 Step 2。

- [ ] **Step 2: 更新预览配置**（旧 launch.json 跑的是 v0 静态服务；改为 Vite preview）

把 `.claude/launch.json` 的 `static` 配置改为：
```json
{ "version": "0.0.1", "configurations": [ { "name": "vite-preview", "runtimeExecutable": "pnpm", "runtimeArgs": ["preview", "--port", "4173"], "port": 4173 } ] }
```

- [ ] **Step 3: 干净构建 + 全量验证**

Run:
```bash
cd /e/UiiAgentHub && pnpm install && pnpm exec vue-tsc --noEmit && pnpm lint && pnpm test && pnpm gen:machine && pnpm build && pnpm build:pkg
```
Expected: 类型 0 错；lint 通过；所有 Vitest 通过；`dist/` 与 `dist-pkg/` 均成功生成；构建期机器视图存在。**任一失败则 STOP 并报告，不提交。**

- [ ] **Step 4: 最终提交**
```bash
cd /e/UiiAgentHub && git add -A && git commit -m "chore(v2): remove v0 vanilla assets; finalize Vue migration"
```

---

## Self-Review（计划作者已核对）

**1. Spec 覆盖**：
- 框架化 Vue3+Vite+TS（MCSF 版本）→ Task 1–3。
- DataSource Mock 体系（接口/Mock/Http stub/选择器/env）→ Task 10；Mock JSON 生成 → Task 9。
- i18n vue-i18n + 收编内联文案 → Task 8、12。
- CSS 变量主题平移（换肤规范）→ Task 11。
- 错误边界 onErrorCaptured → Task 14。
- 工具链 oxlint/prettier/stylelint/husky/vitest（MCSF 版本）→ Task 1–3。
- 机器视图同源生成 → Task 9；构建期注入 → Task 1 vite 插件。
- 双产物（Pages + 可移植 Mock 包）→ Task 23。
- 本地部署命令 + workflow 模板（phase-2，不调试）→ Task 24。
- 真实 FDA 数据契约不变 → Task 5。
- 8 页 IA（home/catalog/detail/how/console×4）+ 404 → Task 13、18–22。
- 非目标守住：无 TDesign、无 Playwright、CI 触发不定 → 计划无相关任务。

**2. 占位符扫描**：无 TODO/“稍后”。逐字平移项均指向**真实存在的 v0 文件**并给出确定转换规则（非占位）。所有新代码均给全。

**3. 类型/命名一致**：`Capability/FdaInfo/ConsoleOverview/Lang`、`DataSource.{listCapabilities,getCapability,getConsoleOverview}`、`createDataSource`、`filterCapabilities/FilterState`、`capabilityToMarkdown/buildCatalogJson/buildLlmsTxt`、组件 props（`cap`/`kind`/`active`）、i18n key 命名在数据/服务/组件/视图/测试间一致；`import.meta.env.BASE_URL` 统一用于 base/路由/footer/Mock fetch。

> 注：UI 任务（Phase 3–6）以 `vue-tsc` 类型检查 + `vite build` 通过为门禁；视觉正确性由控制器在执行末尾用预览（`pnpm preview` + 截图/eval）做跨页 + 中英 QA，沿用 v0 验收方式。
