# UII Agent Hub v2

Vue 3 + Vite + TypeScript migration of the Agent Hub portal.

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
