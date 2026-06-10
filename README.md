# 联影智能 · Agent Hub (v2 · Vue + Vite + TS)

概念展示门户。MCSF2.0 规范栈。零运行时后端（Mock 数据）。

## 开发

```
pnpm install
pnpm dev            # 本地开发（mock 数据），默认 http://localhost:5173
pnpm test           # Vitest
pnpm lint           # oxlint + stylelint
```

## 构建

- `pnpm build:pages`：GitHub Pages 版（用 `VITE_BASE=/<仓库名>/`）
- `pnpm pkg:zip`：可移植 Mock 包 zip（相对路径，解压即用）

## 部署（阶段 1 · 本地）

```
DEPLOY_REPO=git@github.com:<org>/uii-agent-hub-site.git PAGES_BASE=/uii-agent-hub-site/ pnpm deploy:pages
```

源码推上私有仓库后，`.github/workflows/deploy.yml` 可启用自动部署（配置 `DEPLOY_TOKEN` secret 与
`PAGES_REPO`/`PAGES_BASE` vars）。

## 数据

- 源：`src/data/capabilities.ts`（真实 FDA 510(k) 清单，单一数据源）
- 机器视图 / Mock：构建期由 `pnpm gen:machine` 生成 `public/{llms.txt,catalog.json,mock/*.json}`
- 切真后端：实现 `src/services/httpDataSource.ts`，`--mode api` 即可，页面不变

## 版本偏差

The following packages were installed at a version different from the one pinned in `package.json`
at scaffold time due to registry resolution or compatibility:

| 包                   | package.json 指定 | 实际安装 | 原因                                                                     |
| -------------------- | ----------------- | -------- | ------------------------------------------------------------------------ |
| `@vitejs/plugin-vue` | `^5.2.0`          | `6.0.7`  | v5 不兼容 vite 7（peer requires `^5.0.0 \|\| ^6.0.0`），升级至 v6 latest |
| `vite`               | `^7.0.0`          | `7.3.5`  | semver 范围内最新                                                        |
| `vue-tsc`            | `^2.1.10`         | `2.2.12` | semver 范围内最新                                                        |
| `vue-router`         | `^4.4.5`          | `4.6.4`  | semver 范围内最新                                                        |
| `tsx`                | `^4.19.2`         | `4.22.4` | semvar 范围内最新                                                        |
