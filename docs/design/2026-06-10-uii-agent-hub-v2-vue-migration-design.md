# UII Agent Hub v2 · Vue 工程化迁移设计（框架 + Mock 体系 + CI/CD）

- **日期**：2026-06-10
- **状态**：设计草案，待评审
- **前置**：v0 设计 `2026-06-04-uii-agent-hub-portal-design.md`（vanilla 原型已完成并合入 master，17/17 测试通过）
- **规范依据**：`docs/references/MCSF2.0前端开发框架和开发规范 V1.0.md`（公司前端规范，2026-06-10 提供）

---

## 1. 背景与目标

v0 以零依赖 vanilla 完成了概念展示门户。为了**移交与长期维护**，并支持 **GitHub Pages 托管 + Mock 数据 + CI 自动化 Mock 打包部署**，v2 进行工程化迁移。

### 目标
1. **框架化**：迁移到公司规范栈（Vue 3 + TypeScript + Vite），接手团队零认知障碍。
2. **Mock 体系**：数据访问层抽象——页面只依赖 `DataSource` 接口；现在走 Mock（静态 JSON 伪 API），未来真后端只换实现不改页面。Mock 的是**接口形态**，数据内容仍是真实 FDA 清单。
3. **双仓库部署**：源码不公开（本地 git → 将来公司私有仓库）；GitHub 公开仓库**只存编译压缩混淆后的产物**并开启 Pages。
4. **CI 自动化**：版本变更触发构建 → 测试 → 双产物（Pages 部署 + 可移植 Mock 包 zip）→ 自动推送公开产物仓库。

### 非目标（YAGNI）
- ❌ 真实后端 / 鉴权 / 支付（HttpDataSource 仅留 stub）。
- ❌ TDesign 组件库（本期不引入，控制台真实化时再议）。
- ❌ Playwright / UI 自动化测试（本期不做，移交后再议）。
- ❌ CI 触发约定细化（本期不定；workflow 仅作 phase-2 预置模板，见 §6）。
- ❌ SSR / SEO 深度优化（展示站 + hash 路由够用）。
- ❌ VitePress 文档站（未来可选）。
- ❌ 重型 JS obfuscator（见 §6.4 混淆边界）。

---

## 2. 决策依据：方案评审 + MCSF2.0 规范对齐

框架选型经三方案对比（Vue / React / Astro）后用户确认 **Vue 3 + Vite + TS**；随后获得公司 MCSF2.0 规范，逐项验证吻合：

| MCSF2.0 要求 | v2 采用 | 说明 |
|---|---|---|
| TypeScript 5.9.2 | ✅ 同版本 | |
| Vue 3.5.18 | ✅ 同版本 | |
| Vite 8.0.0（建议优先） | ✅ 同版本 | 若 registry 无此版本，取最近稳定版并在 README 记录偏差 |
| Vitest 3.1.1（建议优先） | ✅ 同版本 | v0 的 node:test 全部迁移 |
| vue-i18n@9.x | ✅ | v0 的 I18N 字典 + 页面内联双语文案**全部收编**进 locale 文件 |
| 换肤：原生 CSS 自定义属性 | ✅ 零改造 | v0 token 体系本就是 CSS 变量 |
| Node ≥22.18.0 / pnpm 10.14.0 | ✅ | 本机 Node 24.13 / pnpm 10.33，engines 字段约束 |
| oxlint 1.39.0（新项目） | ✅ | `.oxlintrc.json` 照规范配置 |
| prettier 3.5.3 / stylelint 16.23.0 / husky 8.0.3 | ✅ | prettier 配置照规范；husky 挂 pre-commit（lint+format）与 commit-msg |
| 多分辨率：渐进式增强、小尺寸优先 | ✅ 原则采纳 | 展示站不引入 px-to-viewport（面向移动 H5 阅片场景，本站不适用） |
| 错误隔离：onErrorCaptured 错误边界 | ✅ | 全局 `AppErrorBoundary` 组件 |
| Monorepo 优先 | ⚠ 单包起步 | 单应用无多包需求；目录风格按规范，未来并入公司 Monorepo 成本低 |
| TDesign（PC：tdesign-vue-next 1.18.0） | ⏸ 本期不引入 | 视觉高度定制且无重交互组件；控制台真实化时引入（TDesign 主题机制= CSS 变量，与 token 直接映射）。开放问题 ① |
| Midscene + Playwright UI 自动化 | ❌ 本期不做 | 用户决策：当前开发环节不予考虑 |

---

## 3. 技术栈与版本

```
运行环境  node >=22.18.0   pnpm >=10.14
核心      vue 3.5.18 · typescript 5.9.2 · vite 8.0.0 · vue-router 4.x(hash) · vue-i18n 9.x
质量      vitest 3.1.1 · oxlint 1.39.0 · prettier 3.5.3 · stylelint 16.23.0 · husky 8.0.3
零 UI 库  样式沿用 v0 自有 token 体系（tokens/base/console.css 平移）
```

---

## 4. 应用架构

### 4.1 目录结构

```
uii-agent-hub/
  index.html                  # Vite 入口
  vite.config.ts              # base 按构建目标注入；机器视图生成插件
  src/
    main.ts                   # createApp + router + i18n + DataSource 注入
    App.vue                   # 壳：SiteHeader / RouterView / SiteFooter / ErrorBoundary
    router/index.ts           # createWebHashHistory 路由表
    locales/zh.json, en.json  # 全部 UI 文案（含 v0 内联双语的收编）
    services/
      dataSource.ts           # interface DataSource（唯一页面依赖）
      mockDataSource.ts       # fetch('mock/*.json')
      httpDataSource.ts       # stub：fetch(`${VITE_API_BASE}/v1/...`)，本期不实现
      index.ts                # 按 import.meta.env.MODE 选择实现
    types/capability.ts       # Capability / ConsoleOverview 等类型（v0 schema 升 TS）
    lib/catalogFormat.ts      # v0 纯函数平移：capabilityToMarkdown/buildCatalogJson/buildLlmsTxt
    components/               # SiteHeader, SiteFooter, CapabilityCard, BadgeList,
                              # DualRail, ConnectBlock, ConsoleShell, TrustBand,
                              # AppErrorBoundary ...（约 12–15 个 SFC）
    views/                    # HomeView, CatalogView, CapabilityDetailView,
                              # HowItWorksView, console/{Dashboard,Services,Connect,Usage}View
    styles/                   # tokens.css, base.css, console.css（v0 平移，小尺寸优先重审）
  public/
    mock/capabilities.json    # 伪 API：能力目录（真实 FDA 数据）
    mock/console.json         # 伪 API：控制台演示数据
    assets/img/               # logo 等
  scripts/build-machine-views.ts  # 生成 llms.txt + catalog.json + public/mock/*.json
  tests/                      # Vitest：v0 的 17 个测试迁移 + dataSource 测试
  .github/workflows/deploy.yml    # 预置（源码上私有仓库后即生效）
  .oxlintrc.json  .prettierrc  .stylelintrc  .husky/
```

### 4.2 数据访问层（Mock 体系核心）

```ts
export interface DataSource {
  listCapabilities(): Promise<Capability[]>
  getCapability(id: string): Promise<Capability | null>
  getConsoleOverview(): Promise<ConsoleOverview>
}
```
- **MockDataSource**：`fetch(import.meta.env.BASE_URL + 'mock/capabilities.json')`——部署后这些 JSON 本身就是公开的伪 API 端点，与机器视图同源同理念。
- **HttpDataSource**：仅类型完整的 stub，`VITE_API_BASE` 环境变量预留。
- 选择：`--mode mock`（默认）/ `--mode api`；页面与组件**只 import 接口**。
- 路由从 v0 的 `?id=` 升级为 `/#/capability/:id`；保留 404 视图。

### 4.3 机器视图（贯穿不变）

`scripts/build-machine-views.ts` 在构建前生成：`public/llms.txt`、`public/catalog.json`、`public/mock/capabilities.json`——三者同源自 `src/data/capabilities.ts`（v0 数据升 TS，单一数据源纪律不变）。vite build 自动带入 dist。

### 4.4 i18n
- vue-i18n 9，`legacy: false`；语言持久化沿用 `uii_lang` localStorage 键 + `?lang=` 覆盖（v0 行为兼容）。
- **收编 v0 遗留**：v0 代码评审指出 app-console/app-catalog 存在内联 `lang==='zh'?:` 双语三元——v2 全部进 locale 文件，由 i18n 覆盖测试守护。

---

## 5. 构建：双产物

| 产物 | 命令 | base | 用途 |
|---|---|---|---|
| **Pages 版** | `pnpm build:pages` | `/<产物仓库名>/` | 推送公开仓库 → GitHub Pages |
| **可移植 Mock 包** | `pnpm build:pkg` | `./` | zip 后可在任意静态环境直接部署（内网 Nginx / 演示机 / OSS），hash 路由保证免配置 |

---

## 6. 部署：双仓库模式

### 6.1 拓扑
```
[源码仓库]（本地 git → 将来公司私有 GitHub 仓库）
   │ 版本变更（push master / tag）
   ▼
[GitHub Actions]（workflow 预置在源码仓库）
   │ pnpm i → lint → test → build:pages + build:pkg
   ├─▶ 推送 dist → [公开产物仓库]（仅产物 + .nojekyll）→ Pages 上线
   └─▶ 上传 uii-agent-hub-mock-<version>.zip artifact（可直接下载部署）
```

### 6.2 阶段化
- **阶段 1（本期，源码留本地）**：`pnpm deploy:pages` 本地命令完成 构建→推送产物仓库（git push，需要产物仓库推送权限）。这是本期唯一要落地的部署路径。
- **阶段 2（未来，源码推上私有仓库后）**：预置 `deploy.yml` 模板（`peaceiris/actions-gh-pages` + `external_repository` + `DEPLOY_TOKEN` secret）即可启用。**触发约定本期不定**（用户决策：当前不予考虑），模板默认用最简单的 `push: master`，移交时再细化。本期仅放置模板文件，不做 CI 验证/调试。

### 6.3 产物仓库
仅含 dist 内容 + `.nojekyll`；Pages 开在该公开仓库（绕开"私有仓库 Pages 需付费"限制）。仓库名待定（开放问题 ②），决定 Pages 版 base。

### 6.4 混淆边界（纪律声明）
Vite 生产构建标准 minify（压缩+标识符重命名），源码不可直读；**不引入**重型 obfuscator（加载/排错代价高，纯前端无真正秘密）。**任何密钥/敏感信息永不进前端**；本站数据（FDA 清单、市场文案）本就公开。

---

## 7. 质量保障

- **Vitest**：v0 全部 17 个测试逻辑迁移（i18n 覆盖、FDA 数据契约、filter、机器视图格式、构建产物校验）+ 新增 DataSource mock 测试。
- **静态检查**：oxlint + stylelint + prettier --check，husky pre-commit 本地门禁。
- **本地门禁**：lint + test 全绿才允许 `deploy:pages`（脚本内置前置校验）。
- UI 自动化（Playwright/Midscene）本期不做。

---

## 8. 迁移策略与资产平移

- master = v0 里程碑（可工作退路）；新分支 `feat/v2-vue`；v2 验收后删除 v0 根级 html/assets/js（git 历史保留）。
- **平移清单**（零重写）：FDA 能力数据 → `src/data/capabilities.ts`；I18N 字典 → locales；CSS token/样式 → styles/；机器视图纯函数 → lib/；测试逻辑 → Vitest；页面结构/视觉 1:1 复刻。
- **重写部分**：渲染层（模板字符串 → SFC）、路由（多页 → hash SPA）、数据获取（全局变量 → DataSource 注入）。

---

## 9. 评审决议（已确认 2026-06-10）

| # | 问题 | 决议 |
|---|---|---|
| ① | TDesign 本期是否引入 | **否**——纯展示站自有视觉已完备；控制台真实化时再议 |
| ② | 公开产物仓库的账号/仓库名 | **待用户提供**（如 `<org>/uii-agent-hub-site`）；执行部署任务前给到即可，不阻塞迁移开发 |
| ③ | Playwright smoke | **本期不做**（当前开发环节不予考虑） |
| ④ | CI 触发约定 | **本期不定**；workflow 仅作 phase-2 预置模板，默认 `push: master`，移交时再细化 |

> 本期实现聚焦：**Vue 工程化迁移 + Mock 数据体系 + 双产物构建 + 本地 `deploy:pages` 命令**。GitHub Action 仅放置模板（不调试）。
