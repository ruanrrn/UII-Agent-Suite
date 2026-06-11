# 能力要素模板（Capability Element Template）— 设计规范

- 日期：2026-06-11
- 分支：feat/v2-vue
- 适用范围：联影智能 · Agent Hub 门户中**所有上线产品**的「概览卡片 + 详情页」统一展示格式
- 状态：设计定稿（待应用到真实站点）

---

## 1. 背景与定位

门户是**概念展示型**的，核心用户是 **医院 IT（集成/运维方）**。每个产品被理解为：**一项已获 FDA 510(k) 认证、并封装为 MCP 服务的影像 AI 能力**。

人（IT）和智能体共用同一份 MCP 规格——IT 据此接入与运维，智能体据此直接调用。详情页因此采用 **MCP server 规格页** 的形态（参考 mcp.so 的服务页）。

> 临床决策类内容（分型精度、输入/产出明细、临床场景）**不是** IT 的关注点，统一**降级**到「产品手册」外链；门户只承载"是什么 / 长什么样 / 怎么接入"。

---

## 2. 设计原则

1. **i18n 单语言呈现**：站点中英文可切换，名称/文案**同一时刻只显示一种语言**，绝不中英并列。
2. **品牌**：黑 `#121212` + 单一关键色 青绿 `#0fd78a`；FDA 资质用琥珀色 `#b45309` 作信任锚点。
3. **无捏造（铁律）**：
   - FDA 与任何临床事实必须**真实可查**（K 号 + 官方 PDF）。
   - MCP 的 endpoint / tools / prompts / resources / config 在概念阶段为**示例（demo）**，必须显式标注"示例，真实 schema 随服务版本提供"。
   - 界面截图标注来源（官方手册）。
4. **安全**：任何密钥/敏感信息**永不进前端**（对齐 MCSF2.0 §6.4）；配置里只出现 `${UII_API_KEY}` 占位，运行期注入。
5. **两层机器信息不可混淆**（见 §5）。

---

## 3. 概览卡片（Overview Card）

目录页中代表一个产品的卡片。**固定 5 个要素**：

| # | 要素 | 字段 | 说明 |
|---|------|------|------|
| 1 | 图标 | `icon` | 每个产品**独立**的 emoji/图标（不再按"能力类型"区分） |
| 2 | 产品线 chip | `series` | 如 `uAI Discover`，让同系列产品在目录里成组可辨 |
| 3 | 产品名称 | `name.{zh,en}` | 单语言显示（随站点切换） |
| 4 | 适用范围 intended use | `intendedUse.{zh,en}` | 1–2 行简述 |
| 5 | 可点击 510(k) | `fda.kNumber` + `fda.pdfUrl` | 琥珀徽章，点击 → FDA 官方 PDF（新窗口） |

**交互**：
- 整卡可点 → 进入详情页。
- 510(k) 徽章独立可点 → FDA PDF；需 `stopPropagation`，避免误触发进详情。

**不放在卡片上**：标语、brochure 链接、订阅按钮、能力类型徽章（均移至详情页或删除）。

---

## 4. 详情页（MCP Server 规格页）

整页是一张 frame，结构 = **头部 + Tabs + Footer**。

### 4.1 头部（极简）
- `icon` + `name`（单语言）+ **订阅服务**（primary CTA）。
- 不含：英文代号、`by 联影智能`、接入协议行、能力类型/模态/产品线徽章（这些走目录卡片或 Config）。

### 4.2 Tabs（顺序：Overview · Tools · Prompts · Resources · Config 配置）

| Tab | 内容 | 字段 | 空态 |
|-----|------|------|------|
| **Overview** | ① 服务说明 What it is（一段）② 界面示例 What it looks like（截图） | `overview.{zh,en}`、`screenshot` | — |
| **Tools** | 本服务暴露的可调用工具：工具名（mono）+ 描述 + 输入/返回 | `mcp.tools[]` | — |
| **Prompts** | 内置提示模板：名称 + 描述 + 参数 | `mcp.prompts[]` | 无则显示"暂无" |
| **Resources** | **本服务**暴露的资源 URI（如 `schema://`、`report://`、`sample://`） | `mcp.resources[]` | 无则显示"暂无" |
| **Config 配置** | MCP 客户端 JSON 配置 + 复制配置 + Copy as markdown + 机器发现指引 | `mcp.endpointUrl`、`mcp.serverKey` | — |

- **Tools/Prompts** 的 tab 标签后带计数（如 `Tools 3`）。
- **Config** 的 JSON 形如：
  ```json
  {
    "mcpServers": {
      "<serverKey>": {
        "url": "<endpointUrl>",
        "headers": { "Authorization": "Bearer ${UII_API_KEY}" }
      }
    }
  }
  ```
  其后附一行 **🔎 机器发现 / Discovery**：`/llms.txt`、`/catalog.json`（站点级，见 §5）。

### 4.3 Footer（页脚凭证）
- 左：`FDA 510(k) · {kNumber} ↗`（点击 → 官方 PDF）。
- 右：`产品手册 ↗`（brochure 外链）。

---

## 5. 两层「机器信息」约定（重要）

| 层 | 回答 | 产物 | 位置 |
|----|------|------|------|
| ① **站点级 · 发现层** | 智能体怎么知道 hub 里有哪些能力？ | `/llms.txt`、`/catalog.json`（全站唯一，列出**所有**能力） | 站点根 + 首页"面向机器"轨；详情页 Config 末尾仅做**指引** |
| ② **单服务 · MCP 原语** | 连上这一个能力后能调什么、读什么？ | `Tools / Prompts / Resources / Config` | 详情页 Tabs |

> `llms.txt`、`catalog.json` **不是**某个服务的 MCP Resource，**禁止**放进 Resources tab。

---

## 6. 数据模型（字段定义）

本模板对现有 `Capability` 类型的**修订方向**（实际迁移时再定具体 TS 形态）：

```
Capability {
  id: string
  icon: string                      // 每产品独立
  series: string                    // 产品线，如 "uAI Discover"
  name:        { zh, en }
  intendedUse: { zh, en }           // 卡片用简述
  overview:    { zh, en }           // 详情 Overview 段落
  screenshot?: string               // 界面示例图（来源：官方手册）
  fda:      { kNumber, pdfUrl }     // 真实 510(k) + 官方 PDF
  brochureUrl: string               // 产品手册外链
  mcp: {
    serverKey:   string             // 配置里的键名，如 "uai-aortic"
    endpointUrl: string             // 示例 Remote MCP 端点
    tools:     [{ name, desc:{zh,en}, inputs, returns }]
    prompts:   [{ name, desc:{zh,en}, args }]
    resources: [{ uri,  desc:{zh,en} }]
  }
}
```

**对比现状**（`src/types/capability.ts`）需要的变化：
- 新增：`series`、`intendedUse`、`overview`、`screenshot`、`fda.pdfUrl`、`brochureUrl`、`mcp.{serverKey,tools,prompts,resources}`。
- 弱化/移除：`type`（不再区分能力类型）、`modality`/`inputs`/`outputs` 作为**展示**要素（数据层可保留供筛选，但卡片/详情不再展示技术规格组）。
- 复用：`fda.kNumber`、`connect.mcpEndpoint`（并入 `mcp.endpointUrl`）。

---

## 7. 内容来源与占位规则

| 内容 | 来源 | 占位标注 |
|------|------|----------|
| FDA 510(k) | 真实 K 号 + `accessdata.fda.gov` 官方 PDF | 无 → 留空并标注，**不得编造** |
| 名称 / 适用范围 / Overview | 官方 brochure / 注册信息 | — |
| 界面截图 | 官方 brochure | 标注"来自官方手册" |
| MCP endpoint / tools / prompts / resources / serverKey | **示例（demo）** | 必须标注"示例，真实 schema 随服务版本提供" |
| API Key | `${UII_API_KEY}` 占位 | 永不进前端 |

---

## 8. 参考样例：CT 主动脉智能分析系统

- `name`：CT 主动脉智能分析系统 / AI-Assisted Analysis System for Aortic Dissection
- `series`：uAI Discover（代号 `uAI Discover · Aortic Dissection`）
- `icon`：🫀
- `intendedUse`：辅助分析主动脉 CTA，自动检测主动脉夹层、定位关键解剖标志并量化真假腔管径，为危急病例提供分诊提示。
- `fda`：**K240411** · https://www.accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf
  - ⚠️ K240411 在现有目录中亦为 **uAI Portal**（QIH，平台级清关）所用——主动脉分析挂在该平台许可下，属正常的"一号多卡"。
- `mcp`（示例）：`serverKey=uai-aortic`，`endpoint=https://hub.uii-ai.example/mcp/aortic-dissection`
  - tools：`analyze_aortic_cta` / `get_structured_report` / `get_triage_status`
  - prompts：`draft_aortic_report` / `explain_findings`
  - resources：`schema://aortic/report` / `report://aortic/{study_uid}` / `sample://aortic/demo-study`

---

## 9. 待办 / 决策

- [x] tab 顺序：**Overview 优先**（默认）；Config 提前为备选。
- [ ] 将本模板应用到真实 Vue 站点（需解除"先不改真实页面"约束）——涉及 `types/capability.ts`、`CapabilityCard.vue`、详情页（替换 `DualRail` 为 Tabs 版）、i18n、`capabilities.ts` 示例数据、`scripts/build-machine-views.ts`。
- [ ] 主动脉产品是否作为正式条目加入 `capabilities.ts`（当前 10 条未含）。
- [ ] 各产品真实 MCP endpoint/tools 由产品方提供后替换示例。
