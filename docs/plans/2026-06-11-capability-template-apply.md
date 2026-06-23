# 能力要素模板落地（Apply Capability Element Template）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `docs/design/2026-06-11-capability-element-template.md` 定稿的「5 槽位概览卡片 + MCP 规格详情页」应用到真实 Vue 站点，并新增旗舰示例「CT 主动脉智能分析系统」（真实 FDA 510(k) K240411）。

**Architecture:** 数据模型从 `connect`（endpoint/apiKeyHint/llmsTxt）升级为 `mcp`（serverKey/endpointUrl/tools/prompts/resources），i18n 块新增 `overview`；卡片重写为 5 槽位（icon · series chip · 名称 · 适用范围 · 可点 510k）；详情页用 Tabs 组件（Overview/Tools/Prompts/Resources/Config）替换 DualRail；FDA PDF 链接由 K 号纯函数推导（不存冗余数据）。机器视图（catalog.json/llms.txt/mock）随单一数据源再生成。

**Tech Stack:** Vue 3.5 + TS 5.9 + vue-i18n 9 + Vitest 3（jsdom）；样式沿用 `src/styles/tokens.css` 既有 token。

**约定（来自 spec）：**
- 卡片的「适用范围」复用现有 `i18n.description` 字段（语义即 intended use），不新增重复字段。
- `i18n.clinicalUse` 保留在数据与 markdown 中（喂 AI 有用），但 UI 不再展示。
- `type` 字段保留（HomeView featured 过滤、catalog.json 用），UI 不再展示类型；目录页删除类型筛选。
- `badges`、`inputs`、`outputs`、`CapConnect/connect` 从模型中删除。
- `series`、`brochureUrl` 可选；缺省时卡片/页脚对应元素不渲染。
- MCP tools/prompts/resources 为**示例（demo）**，UI 必须带"示例"说明；密钥仅 `${UII_API_KEY}` 占位。

---

### Task 1: FDA PDF 链接纯函数

**Files:**
- Create: `src/lib/fda.ts`
- Test: `tests/fda.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// tests/fda.test.ts
import { test, expect } from 'vitest';
import { fdaPdfUrl } from '@/lib/fda';

test('builds official accessdata PDF url from K-number', () => {
  expect(fdaPdfUrl('K240411')).toBe(
    'https://www.accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf'
  );
  expect(fdaPdfUrl('K193271')).toBe(
    'https://www.accessdata.fda.gov/cdrh_docs/pdf19/K193271.pdf'
  );
});
```

- [ ] **Step 2: 运行确认失败** — `pnpm test -- fda` → FAIL（模块不存在）

- [ ] **Step 3: 实现**

```ts
// src/lib/fda.ts —— K 号 → FDA 官方 510(k) summary PDF（accessdata 规范 URL，无冗余存储）
export function fdaPdfUrl(kNumber: string): string {
  return `https://www.accessdata.fda.gov/cdrh_docs/pdf${kNumber.slice(1, 3)}/${kNumber}.pdf`;
}
```

- [ ] **Step 4: 运行通过** — `pnpm test -- fda` → PASS
- [ ] **Step 5: Commit** — `feat(v2): fdaPdfUrl helper`

### Task 2: 类型升级（Capability + McpSpec）

**Files:**
- Modify: `src/types/capability.ts`

- [ ] **Step 1: 替换类型定义**（`ConsoleService/ConsoleOverview` 不动）

```ts
// src/types/capability.ts
export type CapType = 'clinical-ai' | 'platform' | 'reconstruction' | 'skill';
export type Modality = 'CT' | 'MR' | 'PET' | 'X-ray' | 'Cross';
export type Lang = 'zh' | 'en';
export interface Bi {
  zh: string;
  en: string;
}
export interface FdaInfo {
  kNumber: string;
  decisionDate: string;
  productCode: string;
  productCodeName: string;
  applicant: string;
}
export interface McpToolSpec {
  name: string;
  desc: Bi;
  input: string;
  returns: string;
}
export interface McpPromptSpec {
  name: string;
  desc: Bi;
  args: string;
}
export interface McpResourceSpec {
  uri: string;
  desc: Bi;
}
export interface McpSpec {
  serverKey: string;
  endpointUrl: string;
  tools: McpToolSpec[];
  prompts: McpPromptSpec[];
  resources: McpResourceSpec[];
}
export interface Capability {
  id: string;
  type: CapType;
  modality: Modality;
  icon: string;
  series?: string;
  fda: FdaInfo | null;
  brochureUrl?: string;
  mcp: McpSpec;
  i18n: { title: Bi; tagline: Bi; description: Bi; clinicalUse: Bi; overview: Bi };
}
```

（删除：`CapConnect`、`badges`、`inputs`、`outputs`、`connect`。）

- [ ] **Step 2: 此时 typecheck 预期大面积报错（数据/组件未迁移）— 不提交，连续进入 Task 3-5 后一起验证。**

### Task 3: 数据迁移 + 新增主动脉条目（11 条）

**Files:**
- Modify: `src/data/capabilities.ts`

- [ ] **Step 1: 每个现有条目删除 `badges/inputs/outputs/connect`，新增 `series?`/`mcp`/`i18n.overview`。逐条内容如下（其余字段不动）：**

| id | series | mcp.serverKey | mcp.endpointUrl (`https://hub.uii-ai.example/mcp/` + path) | tools |
|----|--------|---------------|--------------------|-------|
| uai-easy-triage-ich | uAI EasyTriage | uai-ich-triage | ich-triage | detect_ich · get_triage_status |
| uai-easytriage-rib | uAI EasyTriage | uai-rib-triage | rib-triage | detect_rib_fractures · get_priority_list |
| uai-portal | uAI | uai-portal | portal | process_study · list_ai_results |
| uomnispace-ct | uOmnispace | uomnispace-ct | omnispace-ct | postprocess_ct_study · get_processed_series |
| uomnispace-mr | uOmnispace | uomnispace-mr | omnispace-mr | postprocess_mr_study · get_processed_series |
| hyper-dlr | HYPER | hyper-dlr | hyper-dlr | denoise_pet_series · get_enhanced_series |
| deep-recon | （无） | deep-recon | deep-recon | reconstruct_ct_series · get_enhanced_series |
| hyper-air | HYPER | hyper-air | hyper-air | accelerate_mr_recon · get_enhanced_series |
| hyper-focus | HYPER | hyper-focus | hyper-focus | enhance_reconstruction · get_enhanced_series |
| vitallens-rppg | （无） | vitallens | vitallens | measure_vitals |

工具规格（input/returns 为展示字符串；desc 双语，按各产品语境写，模式同下例）。通用三件套示例（ICH）：

```ts
mcp: {
  serverKey: 'uai-ich-triage',
  endpointUrl: 'https://hub.uii-ai.example/mcp/ich-triage',
  tools: [
    {
      name: 'detect_ich',
      desc: {
        zh: '提交一例非增强头颅 CT，检测疑似颅内出血并标记优先级。',
        en: 'Submit a non-contrast head CT; detects suspected ICH and flags priority.'
      },
      input: 'study_uid: string · priority?: "routine"|"stat"',
      returns: 'IchFindings'
    },
    {
      name: 'get_triage_status',
      desc: {
        zh: '查询某研究的分诊优先级与处理状态。',
        en: 'Query triage priority and processing status for a study.'
      },
      input: 'study_uid: string',
      returns: 'TriageStatus'
    }
  ],
  prompts: [],
  resources: []
},
```

每条 `i18n.overview` 按「将"<tagline>"封装为标准 MCP 服务：<能力一句话>。IT 可在院内私域将其接入 PACS / 智能体编排。」双语撰写，例如 ICH：

```ts
overview: {
  zh: '将"颅内出血 CT 智能分诊"封装为标准 MCP 服务：自动检测非增强头颅 CT 中的疑似颅内出血，并输出工作列表优先级提示。IT 可在院内私域将其接入 PACS / 智能体编排。',
  en: 'Wraps ICH CT triage as a standard MCP service: automatically detects suspected intracranial hemorrhage on non-contrast head CT and emits worklist prioritization. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
}
```

- [ ] **Step 2: 数组**最前**插入新条目（完整）：**

```ts
{
  id: 'uai-discover-aortic-dissection',
  type: 'clinical-ai',
  modality: 'CT',
  icon: '🫀',
  series: 'uAI Discover',
  fda: {
    kNumber: 'K240411',
    decisionDate: '2024-09-06',
    productCode: 'QIH',
    productCodeName: 'Automated Radiological Image Processing Software',
    applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
  },
  mcp: {
    serverKey: 'uai-aortic',
    endpointUrl: 'https://hub.uii-ai.example/mcp/aortic-dissection',
    tools: [
      {
        name: 'analyze_aortic_cta',
        desc: {
          zh: '提交一例主动脉 CTA 研究，运行夹层检测、Stanford 分型与真假腔分割测量。',
          en: 'Submit an aortic CTA study; runs dissection detection, Stanford typing, and true/false lumen segmentation & measurement.'
        },
        input: 'study_uid: string · priority?: "routine"|"stat"',
        returns: 'AorticFindings'
      },
      {
        name: 'get_structured_report',
        desc: {
          zh: '获取指定研究的结构化报告。',
          en: 'Fetch the structured report for a study.'
        },
        input: 'study_uid: string · format?: "json"|"pdf"',
        returns: 'ReportDoc'
      },
      {
        name: 'get_triage_status',
        desc: {
          zh: '查询某研究的分诊优先级与处理状态。',
          en: 'Query triage priority and processing status for a study.'
        },
        input: 'study_uid: string',
        returns: 'TriageStatus'
      }
    ],
    prompts: [
      {
        name: 'draft_aortic_report',
        desc: {
          zh: '基于分析结果生成放射报告草稿，供医师审阅修改。',
          en: 'Draft a radiology report from analysis results for physician review.'
        },
        args: 'study_uid: string'
      },
      {
        name: 'explain_findings',
        desc: {
          zh: '用通俗语言解释夹层分型与关键测量，辅助医患沟通。',
          en: 'Explain dissection typing and key measurements in plain language.'
        },
        args: 'study_uid: string'
      }
    ],
    resources: [
      {
        uri: 'schema://aortic/report',
        desc: { zh: '结构化报告的 JSON Schema。', en: 'JSON Schema of the structured report.' }
      },
      {
        uri: 'report://aortic/{study_uid}',
        desc: {
          zh: '某次检查生成的结构化报告（按 study 读取）。',
          en: 'Structured report for a given study.'
        }
      },
      {
        uri: 'sample://aortic/demo-study',
        desc: { zh: '脱敏演示数据集，用于联调验证。', en: 'De-identified demo dataset for integration tests.' }
      }
    ]
  },
  i18n: {
    title: {
      zh: 'CT 主动脉智能分析系统',
      en: 'AI-Assisted Analysis System for Aortic Dissection'
    },
    tagline: { zh: '主动脉夹层 CT 智能分析', en: 'Aortic dissection CTA analysis' },
    description: {
      zh: '辅助分析主动脉 CTA，自动检测主动脉夹层、定位关键解剖标志并量化真假腔管径，为危急病例提供分诊提示。',
      en: 'Assists aortic CTA analysis — automatically detects aortic dissection, localizes key anatomical landmarks, quantifies true/false lumen diameters, and provides triage alerts for critical cases.'
    },
    clinicalUse: {
      zh: '急诊 / 血管外科的主动脉夹层快速识别与术前评估。',
      en: 'Rapid aortic dissection identification and pre-op assessment for ED / vascular surgery.'
    },
    overview: {
      zh: '将"主动脉夹层 CT 智能分析"封装为标准 MCP 服务：对外提供主动脉夹层的自动检测、Stanford 分型、真假腔分割与管径测量，并产出结构化报告与分诊提示。IT 可在院内私域将其接入 PACS / 智能体编排。',
      en: 'Wraps aortic-dissection CTA analysis as a standard MCP service: automatic dissection detection, Stanford classification, true/false lumen segmentation and diameter measurement, producing structured reports and triage alerts. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
    }
  }
},
```

注：K240411 与 uAI Portal 同号（平台级清关，"一号多卡"属正常），spec §8 已注明。

### Task 4: lib + 测试随模型更新（TDD：先改测试）

**Files:**
- Modify: `tests/capabilities.test.ts`、`tests/catalogFormat.test.ts`、`tests/filters.test.ts`、`tests/dataSource.test.ts`、`tests/machineViews.test.ts`
- Modify: `src/lib/catalogFormat.ts`

- [ ] **Step 1: 更新测试断言**（10→11；badges 断言换成 fda/mcp 断言；catalog v2）：

`tests/capabilities.test.ts` 全文：

```ts
import { test, expect } from 'vitest';
import { CAPABILITIES } from '@/data/capabilities';

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('exactly 11 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(11);
  const ids = CAPABILITIES.map(c => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/));
});
test('valid type/modality + bilingual fields incl. overview', () => {
  for (const c of CAPABILITIES) {
    expect(TYPES).toContain(c.type);
    expect(MODS).toContain(c.modality);
    for (const f of ['title', 'tagline', 'description', 'clinicalUse', 'overview'] as const) {
      expect(c.i18n[f].zh).toBeTruthy();
      expect(c.i18n[f].en).toBeTruthy();
    }
  }
});
test('non-skill carry real FDA K-number; skill is demo (fda null)', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') {
      expect(c.fda).toBeNull();
      continue;
    }
    expect(c.fda!.kNumber).toMatch(/^K\d{6}$/);
    expect(c.fda!.decisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(c.fda!.productCode).toBeTruthy();
  }
});
test('every capability exposes an MCP spec', () => {
  for (const c of CAPABILITIES) {
    expect(c.mcp.serverKey).toMatch(/^[a-z0-9-]+$/);
    expect(c.mcp.endpointUrl).toMatch(/^https:\/\/hub\.uii-ai\.example\/mcp\//);
    expect(c.mcp.tools.length).toBeGreaterThanOrEqual(1);
    for (const t of c.mcp.tools) {
      expect(t.name).toMatch(/^[a-z0-9_]+$/);
      expect(t.desc.zh).toBeTruthy();
      expect(t.desc.en).toBeTruthy();
    }
  }
});
test('flagship aortic entry uses real K240411', () => {
  const a = CAPABILITIES.find(c => c.id === 'uai-discover-aortic-dissection')!;
  expect(a.series).toBe('uAI Discover');
  expect(a.fda!.kNumber).toBe('K240411');
  expect(a.mcp.prompts.length).toBe(2);
  expect(a.mcp.resources.length).toBe(3);
});
```

`tests/catalogFormat.test.ts` 全文：

```ts
import { test, expect } from 'vitest';
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat';
import { CAPABILITIES } from '@/data/capabilities';
const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich')!;

test('markdown has title, K-number + pdf url, MCP endpoint and tools', () => {
  const md = capabilityToMarkdown(ich, 'en');
  expect(md).toMatch(/uAI Easy Triage ICH/);
  expect(md).toMatch(/K242292/);
  expect(md).toContain('https://www.accessdata.fda.gov/cdrh_docs/pdf24/K242292.pdf');
  expect(md).toContain('https://hub.uii-ai.example/mcp/ich-triage');
  expect(md).toContain('detect_ich');
});
test('catalog json v2 stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  expect(cat.version).toBe(2);
  expect(cat.items.length).toBe(11);
  const it = cat.items.find(i => i.id === 'uai-easy-triage-ich')!;
  expect(it.fda!.kNumber).toBe('K242292');
  expect(it.fda!.pdfUrl).toContain('K242292.pdf');
  expect(it.mcp.endpointUrl).toBeTruthy();
  expect(it.mcp.tools).toContain('detect_ich');
});
test('llms.txt lists every K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  expect(txt).toMatch(/^# 联影智能 · Agent Suite/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => expect(txt).toContain(c.fda!.kNumber));
});
```

`tests/filters.test.ts`：两处 `toBe(10)` → `toBe(11)`。
`tests/dataSource.test.ts`：`toBe(10)` → `toBe(11)`。
`tests/machineViews.test.ts`：`cat.version` 1→2，两处 `length` 10→11。

- [ ] **Step 2: 更新 `src/lib/catalogFormat.ts` 全文**

```ts
// src/lib/catalogFormat.ts —— 纯函数；浏览器"复制成 markdown"与 Node 构建共用
import type { Capability, Lang } from '@/types/capability';
import { fdaPdfUrl } from './fda';

export function capabilityToMarkdown(c: Capability, lang: Lang = 'zh'): string {
  const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse' | 'overview') =>
    c.i18n[f][lang] || c.i18n[f].zh;
  const lines = [
    `# ${tx('title')} — ${tx('tagline')}`,
    '',
    tx('overview'),
    '',
    `- Modality: ${c.modality}`,
    `- Clinical use: ${tx('clinicalUse')}`
  ];
  if (c.fda)
    lines.push(
      `- FDA 510(k): ${c.fda.kNumber} (${c.fda.decisionDate}) — ${fdaPdfUrl(c.fda.kNumber)}`
    );
  else lines.push('- Status: demo, not a medical device');
  lines.push(
    `- MCP endpoint: ${c.mcp.endpointUrl}`,
    `- MCP server key: ${c.mcp.serverKey}`,
    `- Tools: ${c.mcp.tools.map(t => t.name).join(', ')}`,
    '- Discovery: /llms.txt · /catalog.json'
  );
  return lines.join('\n');
}

export function buildCatalogJson(caps: Capability[]) {
  return {
    version: 2 as const,
    name: '联影智能 · Agent Suite',
    items: caps.map(c => ({
      id: c.id,
      type: c.type,
      modality: c.modality,
      series: c.series ?? null,
      title: c.i18n.title,
      tagline: c.i18n.tagline,
      description: c.i18n.description,
      fda: c.fda ? { ...c.fda, pdfUrl: fdaPdfUrl(c.fda.kNumber) } : null,
      mcp: {
        endpointUrl: c.mcp.endpointUrl,
        serverKey: c.mcp.serverKey,
        tools: c.mcp.tools.map(t => t.name)
      }
    }))
  };
}

export function buildLlmsTxt(caps: Capability[]): string {
  const out = [
    '# 联影智能 · Agent Suite / United Imaging Intelligence · Agent Suite',
    '',
    '> 把院内影像 AI 变成人和智能体都能直接调用的标准服务。本文件为机器可读的能力目录摘要。',
    '> Turn in-house imaging AI into services people and agents can call. Machine-readable catalog summary.',
    '',
    '## Capabilities',
    ''
  ];
  for (const c of caps) {
    const fda = c.fda
      ? ` — FDA ${c.fda.kNumber} (${c.fda.decisionDate})`
      : ' — demo (not a device)';
    out.push(
      `- **${c.i18n.title.en}** [${c.type}/${c.modality}]${fda}: ${c.i18n.description.en} MCP: ${c.mcp.endpointUrl}`
    );
  }
  out.push('');
  return out.join('\n');
}
```

- [ ] **Step 3: `pnpm test`** — capabilities/catalogFormat/filters/dataSource/fda 应 PASS；machineViews 仍 FAIL（public 未再生成，Task 8 解决）。组件相关 typecheck 仍红，继续。

### Task 5: i18n 键更新

**Files:**
- Modify: `src/locales/zh.json`、`src/locales/en.json`、`tests/i18n.test.ts`

- [ ] **Step 1: 两个 locale 同步增删。删除键：** `filter.type`、`type.clinical-ai`、`type.platform`、`type.reconstruction`、`type.skill`、`detail.human`、`detail.agent`、`detail.clinical`。**新增键：**

| key | zh | en |
|-----|----|----|
| card.use | 适用范围 | Intended use |
| detail.subscribe | 订阅服务 | Subscribe |
| detail.brochure | 产品手册 | Brochure |
| detail.tab.overview | Overview | Overview |
| detail.tab.tools | Tools | Tools |
| detail.tab.prompts | Prompts | Prompts |
| detail.tab.resources | Resources | Resources |
| detail.tab.config | Config 配置 | Config |
| detail.whatItIs | 服务说明 | What it is |
| detail.looksLike | 界面示例 | What it looks like |
| detail.shotPlaceholder | 产品分析界面截图（来自官方手册 · 占位） | Product UI screenshot (from official brochure · placeholder) |
| detail.toolsLead | 该服务对外暴露的可调用工具（示例） | Callable tools exposed by this service (sample) |
| detail.promptsLead | 服务内置的提示模板（示例） | Built-in prompt templates (sample) |
| detail.resourcesLead | 本服务暴露的资源 / URI（示例） | Resources / URIs exposed by this service (sample) |
| detail.configLead | 加入你的 MCP 客户端 / 编排 | Add to your MCP client / orchestration |
| detail.copyConfig | 复制配置 | Copy config |
| detail.input | 输入 | Input |
| detail.returns | 返回 | Returns |
| detail.args | 参数 | Args |
| detail.none | 暂无 | None yet |
| detail.demoNote | 工具名 / 参数为示例（demo），真实 schema 随服务版本提供。 | Tool names/params are samples (demo); the real schema ships with the service. |
| detail.configNote | 需先「订阅服务」在控制台获取 UII_API_KEY；密钥永不写入前端，运行期注入环境变量。 | Subscribe first to get UII_API_KEY from the console; keys never ship in the frontend — inject at runtime. |
| detail.discoveryLabel | 机器发现 / Discovery | Machine discovery |
| detail.discovery | 本能力已登记于站点级目录，智能体可自动发现： | Registered in the site-level catalog; agents can discover it via: |

保留：`detail.connect`（console ConnectBlock 标题）、`badge.*`（Badge 组件）、`detail.copyMd`、`detail.notfound`、`copy.*`。

- [ ] **Step 2: `tests/i18n.test.ts` core keys 列表中 `'filter.type'` 替换为 `'detail.tab.config'`。**
- [ ] **Step 3: `pnpm test -- i18n`** → PASS

### Task 6: 概览卡片重写 + 目录页去类型筛选

**Files:**
- Modify: `src/components/CapabilityCard.vue`（全文替换）
- Modify: `src/views/CatalogView.vue`（删 type 筛选）
- Modify: `src/styles/base.css`（卡片新样式）

- [ ] **Step 1: `CapabilityCard.vue` 全文**（卡片用 div+router.push，避免 `<a>` 嵌套；510k 徽章独立 `<a>` + `@click.stop`）：

```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import Badge from './Badge.vue';
const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'description') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const open = () => router.push(`/capability/${props.cap.id}`);
</script>
<template>
  <div
    class="cap-card"
    role="link"
    tabindex="0"
    @click="open"
    @keydown.enter="open"
  >
    <div class="cap-top">
      <span class="cap-icon">{{ cap.icon }}</span>
      <span v-if="cap.series" class="cap-series">{{ cap.series }}</span>
    </div>
    <h3 class="cap-name">{{ tx('title') }}</h3>
    <div class="cap-use-label">{{ t('card.use') }}</div>
    <p class="cap-desc">{{ tx('description') }}</p>
    <div class="cap-foot">
      <a
        v-if="cap.fda"
        class="fda-pill"
        :href="fdaPdfUrl(cap.fda.kNumber)"
        target="_blank"
        rel="noopener"
        @click.stop
        >FDA 510(k) · <span class="fda-k">{{ cap.fda.kNumber }}</span> ↗</a
      >
      <Badge v-else kind="demo" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: `CatalogView.vue`** — 删除 `type` ref、`types` 数组、`typeLabel`、类型侧栏块（`filter.type` 那段 side-label + side-list）；`filterCapabilities` 调用去掉 `type` 参数；其余不动。

- [ ] **Step 3: base.css** — `.cap-card` 增加 `cursor: pointer;`；删除 `.cap-tagline`、`.cap-modality`、`.cap-k` 规则（若有）；新增：

```css
.cap-series {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-2);
  background: var(--bg-pill);
  border-radius: var(--radius-pill);
  padding: 3px 10px;
}

.cap-use-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 4px;
}

.fda-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--key-ink);
  background: var(--key);
  border-radius: var(--radius-pill);
  padding: 5px 12px;
  text-decoration: none;
}

.fda-pill:hover {
  filter: brightness(0.95);
  text-decoration: underline;
}

.fda-pill .fda-k {
  font-family: var(--font-mono);
  font-weight: 600;
}
```

- [ ] **Step 4: `pnpm test` + `pnpm exec vue-tsc --noEmit`**（详情页未迁移仍可能红，记录后进 Task 7）。

### Task 7: 详情页 = MCP 规格页（Tabs）

**Files:**
- Create: `src/components/McpSpecCard.vue`（tools/prompts/resources 通用条目卡）
- Create: `src/components/McpConfigBlock.vue`
- Create: `src/components/CapabilityDetail.vue`
- Modify: `src/views/CapabilityDetailView.vue`（换用 CapabilityDetail）
- Modify: `src/components/ConnectBlock.vue`（改用 mcp 字段）
- Delete: `src/components/DualRail.vue`
- Modify: `src/styles/base.css`（详情新样式，替换 `.detail-dual/.dual-*` 区块）

- [ ] **Step 1: `McpSpecCard.vue`**

```vue
<script setup lang="ts">
defineProps<{ name: string; desc: string; rows: Array<[string, string]> }>();
</script>
<template>
  <div class="spec-card">
    <span class="spec-name">{{ name }}</span>
    <p class="spec-desc">{{ desc }}</p>
    <div v-for="[k, v] in rows" :key="k" class="spec-row">
      <span class="spec-k">{{ k }}</span><code>{{ v }}</code>
    </div>
  </div>
</template>
```

- [ ] **Step 2: `McpConfigBlock.vue`**（配置 JSON 由 mcp 字段生成；两个复制按钮；发现指引）

```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { capabilityToMarkdown } from '@/lib/catalogFormat';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const cfg = computed(() =>
  JSON.stringify(
    {
      mcpServers: {
        [props.cap.mcp.serverKey]: {
          url: props.cap.mcp.endpointUrl,
          headers: { Authorization: 'Bearer ${UII_API_KEY}' }
        }
      }
    },
    null,
    2
  )
);
const cfgLabel = ref('');
const mdLabel = ref('');
async function copyText(s: string) {
  try {
    await navigator.clipboard.writeText(s);
  } catch {
    /* ignore */
  }
}
async function copyCfg() {
  await copyText(cfg.value);
  cfgLabel.value = t('copy.done');
  setTimeout(() => (cfgLabel.value = ''), 1500);
}
async function copyMd() {
  await copyText(capabilityToMarkdown(props.cap, locale.value as 'zh' | 'en'));
  mdLabel.value = t('copy.done');
  setTimeout(() => (mdLabel.value = ''), 1500);
}
</script>
<template>
  <div>
    <div class="tab-lead">{{ t('detail.configLead') }}</div>
    <pre class="cfg-code">{{ cfg }}</pre>
    <div class="cfg-acts">
      <button class="btn btn-key" type="button" @click="copyCfg">
        {{ cfgLabel || t('detail.copyConfig') }}
      </button>
      <button class="btn btn-ghost" type="button" @click="copyMd">
        {{ mdLabel || t('detail.copyMd') }}
      </button>
    </div>
    <p class="cfg-note">{{ t('detail.configNote') }}</p>
    <div class="cfg-disc">
      <b>🔎 {{ t('detail.discoveryLabel') }}</b>
      <span>{{ t('detail.discovery') }}</span>
      <code>/llms.txt</code><code>/catalog.json</code>
    </div>
  </div>
</template>
```

- [ ] **Step 3: `CapabilityDetail.vue`**（header + tabbar + panels + footer）

```vue
<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import Badge from './Badge.vue';
import McpSpecCard from './McpSpecCard.vue';
import McpConfigBlock from './McpConfigBlock.vue';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'overview') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const bi = (b: { zh: string; en: string }) => b[L()] || b.zh;
type Tab = 'overview' | 'tools' | 'prompts' | 'resources' | 'config';
const TABS: Tab[] = ['overview', 'tools', 'prompts', 'resources', 'config'];
const tab = ref<Tab>('overview');
const count = (k: Tab) =>
  k === 'tools'
    ? props.cap.mcp.tools.length
    : k === 'prompts'
      ? props.cap.mcp.prompts.length
      : k === 'resources'
        ? props.cap.mcp.resources.length
        : 0;
</script>
<template>
  <div class="detail-frame">
    <div class="detail-top">
      <div class="detail-id">
        <span class="cap-icon big">{{ cap.icon }}</span>
        <h1>{{ tx('title') }}</h1>
      </div>
      <RouterLink class="btn btn-key" to="/console">{{ t('detail.subscribe') }}</RouterLink>
    </div>

    <div class="tabbar" role="tablist">
      <button
        v-for="k in TABS"
        :key="k"
        class="tab"
        :class="{ on: tab === k }"
        role="tab"
        :aria-selected="tab === k"
        type="button"
        @click="tab = k"
      >
        {{ t(`detail.tab.${k}`) }}
        <span v-if="count(k)" class="tab-n">{{ count(k) }}</span>
      </button>
    </div>

    <div class="detail-panels">
      <section v-if="tab === 'overview'">
        <div class="tab-lead">{{ t('detail.whatItIs') }}</div>
        <p class="ov-text">{{ tx('overview') }}</p>
        <div class="tab-lead mt">{{ t('detail.looksLike') }}</div>
        <div class="ov-shot">{{ t('detail.shotPlaceholder') }}</div>
      </section>

      <section v-else-if="tab === 'tools'">
        <div class="tab-lead">{{ t('detail.toolsLead') }}</div>
        <McpSpecCard
          v-for="tool in cap.mcp.tools"
          :key="tool.name"
          :name="tool.name"
          :desc="bi(tool.desc)"
          :rows="[
            [t('detail.input'), tool.input],
            [t('detail.returns'), tool.returns]
          ]"
        />
        <p class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'prompts'">
        <div class="tab-lead">{{ t('detail.promptsLead') }}</div>
        <p v-if="!cap.mcp.prompts.length" class="empty">{{ t('detail.none') }}</p>
        <McpSpecCard
          v-for="p in cap.mcp.prompts"
          :key="p.name"
          :name="p.name"
          :desc="bi(p.desc)"
          :rows="[[t('detail.args'), p.args]]"
        />
        <p v-if="cap.mcp.prompts.length" class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'resources'">
        <div class="tab-lead">{{ t('detail.resourcesLead') }}</div>
        <p v-if="!cap.mcp.resources.length" class="empty">{{ t('detail.none') }}</p>
        <McpSpecCard
          v-for="r in cap.mcp.resources"
          :key="r.uri"
          :name="r.uri"
          :desc="bi(r.desc)"
          :rows="[]"
        />
      </section>

      <section v-else>
        <McpConfigBlock :cap="cap" />
      </section>
    </div>

    <div class="detail-foot">
      <a
        v-if="cap.fda"
        class="fda-pill amber"
        :href="fdaPdfUrl(cap.fda.kNumber)"
        target="_blank"
        rel="noopener"
        >FDA 510(k) · <span class="fda-k">{{ cap.fda.kNumber }}</span> ↗</a
      >
      <Badge v-else kind="demo" />
      <a
        v-if="cap.brochureUrl"
        class="foot-link"
        :href="cap.brochureUrl"
        target="_blank"
        rel="noopener"
        >{{ t('detail.brochure') }} ↗</a
      >
    </div>
  </div>
</template>
```

- [ ] **Step 4: `CapabilityDetailView.vue`** — `import DualRail` → `import CapabilityDetail from '@/components/CapabilityDetail.vue'`；模板 `<DualRail ...>` → `<CapabilityDetail v-if="cap" :cap="cap" />`。删除 `src/components/DualRail.vue`。

- [ ] **Step 5: `ConnectBlock.vue`** rows 改为：

```ts
const rows = () => [
  ['MCP endpoint', props.cap.mcp.endpointUrl],
  ['Server key', props.cap.mcp.serverKey],
  ['API Key', '${UII_API_KEY}']
];
```

- [ ] **Step 6: base.css** — 删除 `.detail-head/.detail-tag/.detail-dual/.dual-human/.dual-agent/.dual-label/.dual-sub/.fda-line/.fda-applicant`（及其 @media 引用）；新增：

```css
/* detail = MCP spec page */
.detail-frame {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--border);
}

.detail-id {
  display: flex;
  align-items: center;
  gap: 14px;
}

.detail-id h1 {
  font-family: var(--font-display);
  font-size: 24px;
  margin: 0;
}

.tabbar {
  display: flex;
  gap: 2px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-section);
  flex-wrap: wrap;
}

.tab {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-3);
  padding: 13px 16px;
  cursor: pointer;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab:hover {
  color: var(--ink);
}

.tab.on {
  color: var(--ink);
  border-bottom-color: var(--key);
}

.tab-n {
  color: var(--key-strong);
}

.detail-panels {
  padding: 24px;
}

.tab-lead {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
}

.tab-lead.mt {
  margin-top: 22px;
}

.ov-text {
  color: var(--ink-2);
  line-height: 1.7;
  margin: 0;
  max-width: 64em;
}

.ov-shot {
  height: 200px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: repeating-linear-gradient(45deg, #fafbfc, #fafbfc 10px, #f2f4f6 10px, #f2f4f6 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  font-size: 13px;
}

.spec-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 12px;
}

.spec-name {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--key-ink);
  background: var(--key-tint);
  border: 1px solid #c8efdd;
  border-radius: var(--radius-sm);
  padding: 2px 9px;
}

.spec-desc {
  font-size: 13px;
  color: var(--ink-2);
  margin: 9px 0 8px;
  line-height: 1.6;
}

.spec-row {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--ink-3);
  padding: 3px 0;
}

.spec-k {
  color: var(--ink-muted);
  min-width: 48px;
}

.spec-row code {
  font-family: var(--font-mono);
  background: var(--bg-pill);
  border-radius: 4px;
  padding: 1px 6px;
}

.tab-note,
.cfg-note {
  font-size: 12px;
  color: var(--ink-muted);
  margin-top: 12px;
}

.cfg-code {
  background: var(--near-black);
  color: var(--on-dark);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.65;
  overflow: auto;
  margin: 0;
}

.cfg-acts {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.cfg-disc {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 11px 14px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  font-size: 12.5px;
  color: var(--ink-2);
}

.cfg-disc code {
  font-family: var(--font-mono);
  background: var(--bg-pill);
  border-radius: 4px;
  padding: 2px 7px;
}

.detail-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-section);
}

.fda-pill.amber {
  color: #b45309;
  background: #fff3df;
}

.foot-link {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 600;
}
```

- [ ] **Step 7: `pnpm test` 全绿（除 machineViews）+ `pnpm exec vue-tsc --noEmit` 全绿。**

### Task 8: 机器视图再生成 + 全门禁 + 提交

- [ ] **Step 1:** `pnpm gen:machine`（再生 public/catalog.json、llms.txt、mock/*）
- [ ] **Step 2:** `pnpm test`（18+ 全绿，含 machineViews）；`pnpm exec vue-tsc --noEmit`；`pnpm lint`；`pnpm format`（写回）；`pnpm build`
- [ ] **Step 3:** Commit — `feat(v2): apply capability element template (5-slot card + MCP spec detail tabs); add uAI Discover Aortic Dissection (K240411)`

### Task 9: 预览验证（看实际效果）

- [ ] **Step 1:** preview_start（pnpm dev，5173）
- [ ] **Step 2:** 目录页：卡片 5 槽位、series chip、FDA pill 链接 href 正确；点卡进详情
- [ ] **Step 3:** 主动脉详情：5 个 tab 切换、Tools 3/Prompts 2/Resources 3 计数、Config JSON + 复制、footer K240411 链接
- [ ] **Step 4:** 切英文（?lang=en）复验卡片+详情；无 FDA 的 vitallens 显示 demo Badge
- [ ] **Step 5:** preview_console_logs 无错误；截图（zh 目录、zh 详情、en 详情）交给用户

### Task 10: Ultracode 终审

- [ ] **Step 1:** Workflow 多镜头对抗评审（正确性 / spec 符合度 / i18n 完整性 / 可访问性与回归），逐条核实修复
- [ ] **Step 2:** 修复后重跑门禁，最终提交
