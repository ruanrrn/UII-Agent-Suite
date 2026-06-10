# MCSF2\.0前端开发框架和开发规范 V1\.0

本文阅读对象：MCSF2\.0 前端软件开发人员



# 写在前面

2\.0前端开发语言为TypeScript，开发框架为Vue，具体决策相关的文档为[2\.0产品软件平台技术栈选型\-客户端](https://uih.feishu.cn/docx/BaUodlXMVozhdzxJ2YwcFNQPnse)。



在此选择基础上我们需要明确2\.0前端的各个主要场景（如打包工具，UT工具等）的框架选型和开发规范，期望大家在MCSF2\.0的开发和二次开发过程中能直接运用最适合我们的选择，而不是每个团队摸索，以期降低沟通成本，降低认知负荷和提升开发效率。



# 基本工具链和规范

建议优先采用Monorepo \+ Vue3/HTML5 \+ TS方案。

若组件业务无相关性可独立使用，如通信、日志、Dicom结构化数据可以考虑采用Microrepo \+ Vue3/HTML5\+TS方案。

### 仓库策略

|对比维度|Microrepo |Monorepo|
|---|---|---|
|仓库|独立仓库、独立管理，便于独立开发|单个仓库、统一管理，便于理解项目结构|
|依赖|独立选择，依赖管理较简单|共享依赖和库，管理复杂|
|版本|独立版本号|共享版本号|
|协作|独立自治，更高的自主性和灵活性|减少跨仓库协调，便于协作|
|工具链|独立工具链|统一的工具链\(编译、发布、测试\)|
|发布节奏|独立发布、快速迭代，风险较低|发布可能存在依赖影响，风险较高|
|集成测试|独立测试、组件兼容性开发要求高|集成测试，确保不同组件兼容性|

### 工具链

#### 开发环境

**"node": "\>=22\.18\.0"**



**"pnpm": "10\.14\.0"  //monorepo专用**

#### 开发语言

**"typescript": "5\.9\.2"**

**"vue": "3\.5\.18" //vue项目**

#### 打包工具

**"vite": "****8\.0\.0****"**** ****//**** 建议优先使用**

|维度|Webpack|Rollup|Vite√|Esbuild|
|---|---|---|---|---|
|核心定位|通用型打包工具，支持一切资源类型的模块化处理|专注于 ES 模块的库 / 框架打包工具|基于 ESBuild 和原生 ESM 的快速构建工具|基于 Go 语言的超高速构建工具|
|构建原理|从入口文件递归解析依赖，生成资源图后打包|基于 ES 模块静态分析，Tree\-shaking 更彻底<br>|开发环境使用原生 ESM \+ ESBuild（预构建），生产环境用 Rollup 打包|全链路使用 Go 语言实现，速度比 JS 工具快 10\-100 倍|
|适用场景|中大型应用（SPA、MPA）、复杂资源处理|库 / 框架开发（如 React、Vue）、ES 模块打包|现代应用开发（Vue/React 项目）、快速原型|工具链、CLI 工具、需要极致性能的场景|
|性能（速度）|较慢（尤其是冷启动和大型项目）|中等（比 Webpack 快，但依赖 JS 实现）|极快（开发阶段秒级启动，HMR 即时响应）|最快（毫秒级启动和增量构建）|
|生态系统|最完善（数万插件，覆盖所有场景）|中等（专注 ES 模块，对非 ESM 支持较弱）|快速增长（Vue 官方推荐，兼容 Rollup 插件）|快速发展（插件生态尚不完善）|
|配置复杂度|高（需掌握 Loader、Plugin、Optimization 等概念）|中（核心配置简单，复杂场景需插件）<br>|低（零配置或简单配置文件）<br>|极低（API 简洁，选项少）<br>|

总结

1. 速度优先：选 ESBuild（构建工具、性能敏感场景）或 Vite（开发体验最佳）。

2. 库 / 框架开发：选 Rollup（ES 模块优化）或 ESBuild（性能优先）。

3. 复杂应用：选 Webpack（生态完善、功能全面）或 Vite（现代生态、开发体验好）。

4. 学习成本：从低到高依次为 ESBuild → Vite → Rollup → Webpack。

现代项目中，Vite 因兼顾开发体验和性能，被众多公司（OpenAl、Google、Apple、Microsoft、NASA等）使用，成为中大型应用的首选；而 Webpack 仍在复杂企业级场景中不可替代。ESBuild 和 Rollup 则分别在极致性能和库开发领域占据优势。

### 开发规范

#### js/ts规范

老项目建议

**"eslint": "9\.****3****2\.0"**

新项目建议

**"oxlint": "1\.39\.0"**

**\.oxlintrc\.json**推荐配置如下:

```JSON
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["unicorn", "typescript", "oxc"],
  "env": {
    "builtin": true
  },
  "categories": {
    "correctness": "error",
    "suspicious": "error"
  },
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
  "ignorePatterns": []
}
```

#### css规范

**"stylelint": "16\.****23****\.0"**

\[CSS代码规范\.md\]

#### git提交规范

**"husky": "8\.0\.3"**

#### 代码格式化规范

**"prettier": "3\.5\.3"**

**\.prettierrc**推荐配置如下：

```JSON
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "proseWrap": "always",
  "trailingComma": "none",
  "semi": true,
  "singleQuote": true,
  "bracketSameLine": false,
  "bracketSpacing": true,
  "quoteProps": "consistent",
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "parser": "json",
        "useTabs": false
      }
    },
    {
      "files": "*.ts",
      "options": {
        "parser": "typescript"
      }
    }
  ]
}
```

### 单元测试

**"vitest": "3\.1\.1"  // 建议优先使用**

**"jest": "27\.5\.1" **

[Jest 迁移至 Vitest 方案分析](https://uih.feishu.cn/wiki/Jue2wFDB3iWGupk2lozcTNFOnPc)

|维度|Jest|Mocha|Jasmine|Vitest√|
|---|---|---|---|---|
|核心定位|零配置、一体化测试框架|灵活的测试运行器，需搭配断言库和 spies|全功能一体化测试框架|Vite 生态的高性能测试框架|
|Mock 能力|内置强大的 Jest\.mock \(\)|需外部集成（如 Sinon）|内置 spyOn、mock 等功能|兼容 Jest Mock API|
|测试运行方式|串行执行，支持快照测试|灵活配置，支持串行 / 并行|串行执行，支持异步测试|基于 Vite，并行执行且热更新|
|性能|中等到高（依赖缓存机制）|中等（需手动优化配置）|中等|极高（基于 ESBuild 和 Vite 预构建）|
|生态系统|最完善（React、Vue 官方推荐）|成熟但需自行组合工具|完善但逐渐被 Jest 取代|快速增长（Vite 生态优先）|
|配置复杂度<br>|低（零配置开箱即用）|中（需配置断言库、覆盖率工具等）|低（一体化设计）|低（继承 Vite 配置）|
|覆盖率工具|内置 Istanbul（nyc）|需外部集成（如 Istanbul、c8）|需外部集成（如 Istanbul）|内置 c8（基于 Istanbul）|
|典型场景|大型项目（React/Vue）、快照测试|复杂测试场景、自定义测试流程|小型项目、无需额外配置|Vite 项目、开发阶段即时测试|
|学习成本|低（API 简单直观）|中（需掌握多个工具）|低（一体化设计）|低（熟悉 Jest 即可）|

总结

1. 初学者友好：选 Jest（零配置、内置所有工具）或 Vitest（Jest 兼容 \+ Vite 生态）。

2. 灵活扩展性：选 Mocha（可自由组合断言库、Mock 工具）。

3. 性能优先：选 Vitest（基于 ESBuild）。

4. 快照测试：选 Jest（原生支持且社区成熟）。

5. Vite 项目：优先选 Vitest（与开发环境共享配置，热更新极快）。

现代前端项目中，Jest 因生态完善和易用性成为主流选择，而 Vitest 凭借 Vite 生态的性能优势正在快速崛起。

#### 单元测试开发规范

[前端 UT 测试用例编写规范](https://uih.feishu.cn/docx/JGEWdBbXNo5E7WxoMcscg2PunVh)

### 基础UI组件库

PC端

**"****tdesign\-vue\-next****": "****1\.18\.0****"**

移动端

**"tdesign\-mobile\-vue": "1\.12\.0"**

> 后续统一切换成CDIC自研组件库
> 
> 

### css构建

**建议使用 ****"postcss": "8\.5\.3"**

|对比维度|PostCSS√|Sass/SCSS|Less|
|---|---|---|---|
|核心定位|CSS 后处理器（转换现有 CSS）|CSS 预处理器（扩展 CSS 语法）|CSS 预处理器（类似 Sass）|
|语法扩展|需插件（如 autoprefixer、cssnano）|原生支持变量、嵌套、混合（Mixins）、函数、继承等|原生支持变量、嵌套、函数、运算等|
|执行阶段|编译后（处理生成的 CSS）|编译前（转换为标准 CSS）|编译前（转换为标准 CSS）|
|典型场景|自动兼容性处理、CSS 压缩、模块化|大型项目样式复用、复杂逻辑编写|轻量级项目或与 Node\.js 生态集成|
|生态系统|丰富（数万插件，社区活跃）|成熟（Ruby 和 JS 实现，工具链完善）|中等（活跃度低于 Sass，依赖 Node）|
|学习成本|中（需理解插件机制和配置）|低（语法直观，贴近 CSS）|低（类似 Sass，语法更简单）|
|配置复杂度|高（需手动配置插件，如 postcss\.config\.js）|低（基本配置简单，框架集成友好）|低（类似 Sass，适合快速上手）|
|性能|快（基于 JS，插件按需执行）|中等（Ruby 版本较慢，Dart Sass 更快）|快（基于 Node\.js，编译速度稳定）|
|典型案例|现代前端项目（React/Vue 工程标配）|大型框架（如 Bootstrap 5 部分模块）、复杂样式系统|早期 Node\.js 项目、后台管理系统样式|

总结

- 简单项目：直接用 Less 或原生 CSS（若无需复杂逻辑）。

- 中大型项目：选 Sass（SCSS），搭配 PostCSS 处理兼容性和优化（如 `autoprefixer` \+ `cssnano`）。

- 追求极致定制化：用 PostCSS 插件组合（如 `postcss-preset-env` 实现未来 CSS 特性）



### 文档库

**"Storybook": "9\.1\.1"  // 纯ts项目建议**

**"vitepress": "1\.6\.3"   // vue项目建议**

文档库对比

|对比维度|VitePress√|Docusaurus|Gatsby|Storybook|dumi|
|---|---|---|---|---|---|
|核心定位|Vite 驱动的轻量级静态文档站点|功能全面的多语言文档平台|高性能 React 静态站点生成器|组件级开发与文档工具|Umi 生态的 React 组件文档工具|
|框架适配|Vue/React（通过 MDX）|主要 React，支持部分框架插件|仅 React<br>|多框架（React/Vue/Svelte 等）|仅 React（深度集成 Umi/JSX）|
|构建速度|极快（Vite 按需编译）|中等（基于 Webpack）|中等（大型项目可能较慢）|快（专注组件级编译）|快（Umi \+ Webpack/Vite 双模式）|
|学习成本|低（类似 VuePress，配置简单）|中（需掌握 React \+ 插件系统）|高（React \+ GraphQL \+ 复杂配置）|中（需理解组件隔离开发模式）|中（需了解 Umi 生态和 JSX）|
|主题定制|灵活（Vue 组件 \+ CSS 变量）|中等（需修改 React 组件）|高（完全自定义 React 组件）|高（支持自定义渲染器）|高（支持 JSX 组件 \+ CSS 变量）|
|性能优化|优秀（Vite 构建 \+ 按需加载）|良好（代码分割 \+ 懒加载）|极致（预渲染 \+ 资源优化）|良好（组件级优化）|良好（Umi 内置优化策略）|
|组件集成|原生支持 Vue，React 需 MDX|原生 React，支持 JSX/MDX|原生 React，支持 JSX/MDX|多框架原生支持|深度集成 React（支持 TSX/JSX 演示）|
|社区活跃度|高（Vue 官方维护，增长迅速）|高（Meta 维护，插件丰富）|高（大型社区，插件生态成熟）|高（广泛用于组件开发）|高（阿里系生态，中文社区活跃）|
|典型案例|Vue 官方文档、个人技术博客|Meta 开源项目、大型产品文档|Netlify、The New York Times|Ant Design、Element UI|Ant Design、Umi 官方文档|

总结

1. 性能优先：选 VitePress（开发体验最佳）或 Gatsby（生产环境极致优化）。

2. 多语言需求：选 Docusaurus（内置完整 i18n 系统）。

3. 组件库文档：选 Storybook（多框架支持）或 React Styleguidist（React 专属）。

4. 技术栈匹配：

    - Vue 项目：VitePress

    - React 项目：Docusaurus、Gatsby或dumi

    - 跨框架组件库：Storybook



现代项目中，VitePress 因开发体验和 Vue 生态优势逐渐成为主流选择，而 Docusaurus 在多语言和企业级文档场景中不可替代。另外打包工具使用了Vite。因此综合选择使用VitePress。



# 多分辨率开发方案和开发规范（含竖屏）

## 方案结论：

建议方案：渐进式增强（同一代码，差异化功能）\>响应式设计\>混合方案

## 选型过程：

1. **需求说明**

- Web应用适配不同尺寸的设备，如PC端Web页面、手机端H5页面、平板端H5页面。

- 平板端H5比较特殊，布局设计跟PC端接近，而交互行为又跟手机端一致

2. **方案对比**

|方案|响应式设计（同一代码，不同样式）<br>|混合方案（共享核心，差异化UI，不同代码）|渐进式增强（同一代码，差异化功能）|
|---|---|---|---|
|核心逻辑|通过媒体查询或动态布局算法，根据屏幕尺寸自动调整UI|共享API调用、数据处理等核心功能代码，根据设备类型加载不同的UI组件|基础功能对所有设备可用，高级功能仅在平板/桌面端通过特性检测开放|
|适用场景|界面结构相似，元素尺寸、排列方式需适配不同屏幕|大多数场景，希望平衡开发效率与用户体验|适合基础功能通用，平板端可提供更丰富功能的应用|
|典型案例|微信公众号H5页面、Twitter网页版、淘宝H5版|微信国际版、Instagram|Google Docs移动版、YouTube移动端|
|技术优势|代码维护成本低，只需一套代码库；功能迭代效率高，所有设备同步更新|平衡开发效率与用户体验，核心功能迭代只需维护一套代码|代码复用率高，用户体验随设备能力自动升级|
|局限性<br>|复杂布局难以完全适配；性能优化受限，平板可能加载多余手机端资源|UI层仍需投入额外开发资源，跨设备调试复杂度较高|需谨慎设计功能边界，避免平板版体验降级|

- 友商案例

[**微至云动云影像**](https://www.weiyunyingxiang.com/demo/demo.htm?action=TECH)[\-\-专注互联网医疗影像](https://www.weiyunyingxiang.com/demo/demo.htm?action=TECH)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MDExZWU3NjI2NGI4ZTA1MGQ5ZjhlNWMxYjEyZjJiMzJfM2UwNzM0NjJmMjQ1Mzc2NGEwNDljZTYwOTJhMzAzY2RfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

PC端 vs 移动端

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDEwZWUxYThiOGIwNWU5ZjExMDc2MmM2NzJjZWY5MmVfM2M3MGJlMDg4Y2M0ZjFiMDU5YzdjYzFmMjI0ZTc2MjZfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YmQxYTEwMzQ1YWI3ZDA2NDdhMzg0MDg2YjZjMGM3ZDZfZDIxMGIwMmIzZDg2OGVkNmUxNDc5YmE1YWYyMDA5MTRfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

3. **使用一套代码的优缺点**

- 优点

    - **提高用户体验**：能够根据不同设备的屏幕大小自动调整布局和样式，确保内容呈现清晰、易读，操作便捷，为用户提供一致且优质的体验。

    - **适应多种设备**：可以兼容电脑、平板、手机等各种终端设备，无需为每种设备单独开发不同的版本，节省了开发时间和成本。

    - **便于维护**：由于只有一套代码库，开发者在更新和维护网站时更加方便，只需对一处代码进行修改，就能在所有设备上生效。

- 缺点

    - **产品设计难度大**

        - 布局差异大

        下图为uMetaViewer的PC和移动端截图，可以看出两个端布局和功能差异较大，用一套代码比较难实现

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YzVhYmNiZDYwMjc1MDMyNmNlMGUxNjZhMmNiNDVlYWJfMzYwNWE1YTUzZGExZjFjZTc4MmI4MzgzYTBjZjZhMTRfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzYwZjVlMjRjMGQwMDZkN2VjMGJiYjg4ZTkyMzY5ZDNfNzgwYTNhZmUxZGFmOWM1ZmEwOTM5OTM4NWFmNzFhZjRfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

        - 交互差异大

            1. 移动端没有鼠标右键操作，所以右键菜单功能可能需要用其他方式来实现

            2. 下拉框、对话框、列表布局也不太一样

            3. 一些ROI绘制，用鼠标可以比较精细的绘制，用触摸手势可能没那么精细

    - **逻辑复杂**

    代码中存在许多PC端和移动端差异判断逻辑，增加后期维护成本

    - **一套组件库难以覆盖两种端**

        目前市面上前端UI组件库的PC端和移动端基本上都是分开的，如

        - 蚂蚁库：[Ant Desgin PC版 ](https://www.antdv.com/components/modal-cn)vs [Ant Design Mobile版](https://mobile.ant.design/zh/components/button)

        - 腾讯UI库：[TDesign PC版](https://tdesign.tencent.com/vue/overview) vs [TDesign Mobile版](https://tdesign.tencent.com/mobile-vue/overview)

4. **总结**

**渐进式增强**比较符合我们当前实用场景，只是这个比较考验设计能力，为了UI上实现多端适配，需要考虑的因素比较多，甚至可能有些端的体验上需要做出一些妥协，如移动端放弃右键菜单、隐藏部分功能等。

## 开发规范：

1. 小尺寸优先，再逐步适配大尺寸

2. 使用响应式样式

3. 配合postcss的px\-to\-viewport插件

规范细节：

[多分辨率开发规范](https://uih.feishu.cn/docx/D1ZSdZ2KRoWDTbxVMUicaFcjnbd?from=from_copylink)

# 跨端开发方案和开发规范

## 方案结论：

首先考虑到跟PC端可以共用一套代码，H5开发成本是最低的；

其次目前我们的移动端阅片功能应该相对比较简单，所以H5的性能基本上可以覆盖；

综合考虑，**优先建议H5**，如果在移动端有对性能要求较高的页面，可以考虑使用混合开发等方式。

## 选型过程：

1. **方案对比**

PC端一般都采用Web的方式，以下是移动端三种开发方案对比

|**对比维度**|**移动端 H5 开发**|**混合开发（Hybrid App）**|**原生 APP 开发**|
|---|---|---|---|
|**开发技术栈**|HTML5 \+ CSS3 \+ JavaScript \+ 浏览器 API<br>|前端技术（HTML/JS/CSS）\+ 原生容器（如 uniapp\-x、React Native）<br>Dart 语言\+ Flutter容器|安卓：Java/Kotlin；<br>iOS：Swift/Objective\-C|
|**开发成本**|**低**，一次开发，多端适配|**中**，一次开发，但需处理一些兼容性问题以及开发原生插件|**高**，需为双端独立开发，人力/时间成本高|
|**性能表现**|**低**，依赖浏览器内核，性能较弱，复杂交互易卡顿|**中**，部分功能调用原生 API，性能中等|**高**，直接调用系统底层，性能最优，交互流畅|
|**访问硬件功能**|**受限**，受到浏览器沙箱安全限制，仅支持基础功能如摄像头、定位等|**不受限**，可通过插件调用原生硬件（如传感器、蓝牙等）|**不受限**，直接访问所有硬件功能（摄像头、GPS、指纹识别等）|
|**典型应用场景**|轻量级应用、营销活动页、官网适配移动端|功能中等复杂、需跨平台的应用（如企业办公 App）|高性能需求、复杂交互的应用（如游戏、视频类 App）|
|**案例**|小米、苹果等官网|微信、抖音等|王者荣耀、和平精英等|

2. **总结**

    **性能**：原生APP ≈ Flutter \> React Native \> H5

    **开发成本**：H5 \< Flutter ≈ React Native \< 原生APP

# 换肤开发方案和开发规范

## 方案结论：

原生css自定义属性

## 选型过程：

- **需求说明**

1. 切换主题。现有应用需要支持主题切换功能，提升用户体验。

2. 实时预览。用户调整颜色时立即生效。

3. 需要和CSS选型结果一致（[css规范](https://uih.feishu.cn/wiki/EHQswkyoZiDccpkSDb7cOk6onEe#share-OjwOdzUEoonewwxWMuucSz1enaf)，**"postcss": "8\.5\.3"**）

## 开发规范：

应用方使用统一样式选择器ID，由通用样式层，通过js/ts选择不同样式加载，来控制整体视觉效果

优势：换肤配置修改后，样式可以做到统一的切换；未来有新的换肤需求仅需修改Common样式，应用方基本不需要修改

[Web换肤开发规范](https://uih.feishu.cn/wiki/QoXBwiLh0i0hc0kkgOccChx2nBh)

# 国际化开发方案和开发规范

## 方案结论：

建议使用`vue-i18n@9.x`作为核心插件

## 开发规范：

See [国际化开发规范V1\.0\.1](https://uih.feishu.cn/docx/G3tNdF4ymo46M8xH1dOcWInEnGf)

# 单应用跨双屏开发方案和开发规范

## 方案结论：

See [Web 自动打开双屏方案](https://uih.feishu.cn/wiki/FB75wVTKniQVS7k3D4dcOL8EnEe) [Web Browser 双屏同步交互方案](https://uih.feishu.cn/wiki/JC5swXSrni5HfzkeWdUc5948n9f)

# 多端协同开发方案和开发规范

## 方案结论：

使用混合协同方案，使用websocket将协同结果保存至数据库，并且转发给其他客户端

## 选型过程：

1. **需求说明**

- 多个设备端可以协同工作。如：

    - 在设备上自动后处理未完成，离开扫描间后，在PC端打开应用，迁移到PC端继续工作（扫描间外到办公室）

    - 在console端完成规划路径后，迁移到pad端继续工作（扫描间外到扫描间内）

- 远程办公：工作相关的、科研、远程写报告、远程扫描

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTViMzg4OWMyYjQ0Nzg3YTMzYWNhNmYwNzg3Y2FmNjdfYmVmZTNlODVhZjYyMjVlZjE3NjY1MDBlZGY1ZTg0YjVfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

2. **方案对比**

|维度|操作协同（OT/CRDT）|状态协同（Diff Sync）|
|---|---|---|
|实时性|高（毫秒级）|低（秒级或分钟级）|
|流量消耗|低（仅操作指令）|中高（状态数据或 diff 片段）|
|冲突处理|复杂（需 OT/CRDT 算法）|简单（覆盖或合并状态）|
|适用场景|实时协同编辑（如 Google Docs）|异步协同或轻量级同步（如表格）|

3. **操作协同（Operational Collaboration）**

定义与特点

- 核心逻辑：记录用户的操作行为（如图像缩放、平移、ROI绘制坐标和形状等），并将操作序列实时同步到其他客户端，最终通过操作重放实现图像状态一致。

- 关键技术：

    - 操作转换（OT，Operational Transformation）：解决多用户同时操作同一位置的冲突（如在多人同时对图像进行操作时，可能会出现操作冲突），确保操作在不同客户端按正确顺序执行。

    - 操作日志：服务端存储所有操作记录，用于版本回溯和状态重建。

- 典型场景：

    - 多人同时对图像进行操作。



4. **状态协同（State Collaboration）**

- 核心逻辑：服务器定期向各个客户端发送完整状态信息，包括图像的缩放比例、平移位置、窗宽窗位值以及 ROI 的相关数据等

- 关键技术：

    - 状态合并：通过 diff 算法（如 Google Diff Match Patch）对比本地状态与服务端状态，仅同步差异部分。

    - 版本控制：服务端维护多个状态版本，客户端可请求特定版本的状态。

- 典型场景：

    - 非实时性协同或对实时性要求较低的场景，如软件启动时初始化图像状态



5. **总结**

一般都是采用采用混合协同方案，结合操作协同和状态协同的优点。例如：

- 在实时性要求高的场景下，如多人同时实时对图像进行操作时，使用操作协同方案，确保操作的即时同步和一致性。

- 而在一些非实时场景，如软件启动时初始化图像状态、长时间未操作后的状态更新等，采用状态协同方案，快速获取图像的完整状态或差异状态，提高系统的稳定性和效率。



# UI自动化测试开发方案和规范

## 方案结论：

框架选型：**Midscene\+Playwright**

核心脚本选择：**Playwright**

非核心脚本选择：**Midscene\(AI\)**

## 选型过程：

**详细分析**

1. **Playwright**

    - **优缺点**：Playwright 由 Microsoft 开发，支持 Chromium、Firefox、WebKit，适合现代网页应用。其自动等待功能减少了测试不稳定，执行速度快。但作为较新工具，社区规模不如 Selenium，部分高级功能可能需要学习。

    - **成熟度**：自 2019 年推出，截至 2025 年已建立一定基础，文档完善，社区活跃。

    - **开发效率**：API 设计简洁，内置等待机制减少编码量，适合快速开发。

    - **维护成本**：因可靠性高，测试波动少，维护成本较低。

    - **兼容性**：浏览器端支持多浏览器，移动端仅支持网页模拟（如设备仿真），无原生应用支持。

    - **开发规范**：鼓励页面对象模型，测试可读性强，支持团队协作。

2. **Selenium**

    - **优缺点**：作为老牌框架，支持多种语言（Java、Python 等）和浏览器，社区资源丰富，可通过 Appium 扩展至移动测试。但执行可能较慢，测试易不稳定，设置复杂。

    - **成熟度**：自 2004 年起发展，文档和社区支持非常成熟。

    - **开发效率**：需手动处理等待等细节，编码量较大，效率较低。

    - **维护成本**：测试不稳定可能增加调整需求，维护成本较高。

    - **兼容性**：浏览器端支持广泛，移动端通过 Appium 支持安卓和 iOS。

    - **开发规范**：灵活，支持页面对象模型，但规范性依赖团队实践。

3. **Cypress**

    - **优缺点**：专注于 JavaScript 环境，执行快，内置自动等待、实时重载等功能，适合前端测试。但浏览器支持有限（如无 Safari），不支持移动端。

    - **成熟度**：自推出后在 JavaScript 社区建立，文档完善，社区活跃。

    - **开发效率**：高，特别适合 JavaScript 开发者，内置功能减少配置。

    - **维护成本**：因架构稳定，测试波动少，维护成本低。

    - **兼容性**：浏览器端支持 Chrome、Firefox、Edge、Electron，移动端不支持。

    - **开发规范**：内置最佳实践，如自动等待，鼓励清晰测试编写。

4. **DrissionPage**

    - **优缺点**：基于 Python，整合 Selenium 和 Requests，API 简洁，内置自动等待和重试功能，适合 Python 用户。但知名度低，社区小，移动支持不明确。

    - **成熟度**：较新，GitHub 活动显示积极维护，但社区规模有限。

    - **开发效率**：高，代码量少，适合快速开发，特别对 Python 新手友好。

    - **维护成本**：稳定性特性可能降低调整需求，但社区支持有限可能增加问题解决成本。

    - **兼容性**：浏览器端支持 Chromium 内核，移动端未明确支持，可能通过 Selenium/Appium 实现。

    - **开发规范**：使用 POM 模式，封装常用方法，鼓励模块化设计。

5. **Midscene\.js（结合 Playwright）**

    - **优缺点**：AI 驱动，通过天然语言交互简化测试创建，支持网页（通过 Playwright）和安卓自动化（通过 ADB）。但执行时间慢（如登录测试 45\.8 秒 vs Playwright 1\.9 秒），AI 可靠性需验证，发送截图至 AI 服务可能有隐私风险。

    - **成熟度**：非常新，开源项目，截至 2025 年社区规模小，发展潜力大但现阶段风险高。

    - **开发效率**：可能很高，天然语言减少编码需求，适合非技术用户，但复杂场景可能受限。

    - **维护成本**：若 AI 能适应 UI 变化，可能降低成本，但调试复杂，需验证。

    - **兼容性**：浏览器端通过 Playwright 支持多浏览器，移动端仅安卓支持，无 iOS。

    - **开发规范**：通过天然语言描述测试，抽象编码细节，可能需额外规范确保一致性。



选择Midscene\+Playwright

**适用场景**：若项目需要 AI 辅助和安卓自动化，Midscene\.js 提供创新解决方案，结合 Playwright 可利用其成熟的网页测试能力。

**风险提示**：执行时间慢、社区支持有限、AI 可靠性需验证，适合愿意尝试新工具且风险承受能力较高的团队。

**实施建议**：建议先在小规模项目中试点，评估其性能和稳定性，特别关注执行时间和复杂场景处理能力。



**网页测试为主**：选择 Playwright 或 Cypress，视语言偏好（Playwright 多语言，Cypress 仅 JavaScript）。

**移动测试为主**：Selenium 通过 Appium 支持安卓和 iOS，适合全面移动测试需求。

**Python 用户**：DrissionPage 是轻量选择，但需注意社区和移动支持。

## 开发规范：

详见：[Web AI自动化测试](https://uih.feishu.cn/docx/EPsWd2LAoobnC6xlkCac4f0RnWe)



# 单页面多应用/模块错误、异常隔离方案和规范

## 方案结论：

- 业务模块运行时错误：错误边界组件\(onErrorCaptured\)

- CPU密集型任务: Web Worker子线程中执行

- 需要绝对隔离：iframe 



## 选型过程：

1. **需求说明**

web单页面中可能会显示运行多个业务模块的功能，为了保证某一个业务模块异常\(代码运行时错误、渲染异常、内存泄漏、UI卡顿等\)不影响其它模块的显示运行，需要进行业务模块隔离的设计。



2. **方案对比**

|方案|方案说明|优点|缺点|
|---|---|---|---|
|错误边界组件<br>|错误边界组件例如Vue使用的onErrorCaptured生命周期钩子捕获其子组件的渲染错误。<br>当子组件抛出错误时，错误边界会显示降级UI而不是崩溃整个应用。|实现简单，轻量级|无法捕获异步错误和事件处理程序错误，以及内存泄露造成的程序崩溃或cpu占用阻塞问题|
|iframe沙箱隔离|iframe提供完全独立的JavaScript执行环境和DOM树，即使iframe内的应用完全崩溃，也不会影响父应用。|最高级别的隔离，支持跨域|资源消耗大，通信复杂<br>具体问题：[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)|
|Web Worker隔离<br>|Web Workers允许在后台线程中运行脚本，独立于主线程。即使Worker中的任务崩溃或死循环，也不会阻塞UI渲染。|完全隔离执行环境，防止阻塞UI|通信成本高，无法访问DOM|
|异步组件隔离|异步组件通过动态导入\(defineAsyncComponent\)加载组件。如果组件加载失败，错误会被隔离，不会影响其他已加载的组件。|支持代码分割，错误隔离效果好<br>|需要处理加载状态，实现稍复杂|
|微前端隔离|单个子应用崩溃不影响其他区域，CSS/JS 完全沙箱化|共享公共依赖，减少重复加载，无 iframe 的上下文开销，路由统一管理，全局组件易于实现|引入成本较高，复杂度高，内存泄漏可能污染主应用|

调研demo：

http://10\.2\.55\.62:7777/

https://vcp\-testing\.uicloud\.com/advapp/web\-error/

> 说明 ：纯web实现能支持同一页面中某模块因内存泄漏崩溃不影响其它模块的显示和运行，目前调研只能用iframe沙箱隔离的方案去解决 。
> 
> 



## 开发规范：

See [Web 多应用隔离规范](https://uih.feishu.cn/wiki/Gzz1wW1AxilrJOk5dZicXze9n1t)



# 附录1



### **响应式布局****概念**

响应式设计（Responsive Web Design，简称RWD）是一种Web设计方法，旨在使网站能够根据用户设备的不同屏幕尺寸和分辨率，自适应地调整页面的布局和内容，以提供最佳的用户体验。这种设计方法的核心在于只用一套代码实现页面布局和内容能够智能地根据设备环境（如系统平台、屏幕尺寸、屏幕定向等）进行相应的响应和调整。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjYyYmQ3ZGEzZTZlZmFmYTFjNDNhNTQzMzkwOGNkMjZfYjYwN2ZiYzhhNjYwODhlNjI0MDhhN2UxYmU0OWU2NjJfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

### **混合方案****概念**

- 概念：共享API调用、数据处理等核心功能代码，根据设备类型加载不同的UI组件

- 代码份数：不同的分辨率，会创建多套UI应用，业务逻辑共用一套

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=YWQ4ZDljNmUyYzRiZGMxOTk3ZDlmY2JjMWJiZTU1NjFfMGMxOWYwYjdmZDZjZTIyNjAxMTRjNzY5MTdlNzYyNTRfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

### **渐进式增强****概念**

跟响应式类似，一套代码适配多端，只是对于不同的端，功能显示上有区别

如图：PC端大屏增加了D功能区域

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NmE0MzYyM2YxYzE3MDk4Y2MyNmZkZWE1ZWFmMWU0MjVfMDY1NDA1NmVhNzI1NWVkNzczY2I2MGQyMDU4OTRiMzRfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

### **React Native**

简介

React Native是Facebook开源的跨平台移动应用开发框架，借助JavaScript和React来构建原生移动应用。它允许开发者使用熟悉的Web开发技术，一套代码同时适配iOS和Android平台，极大提高开发效率。凭借原生组件渲染，能让应用达到接近原生应用的性能和用户体验，还可调用原生API实现复杂功能。 

实现原理

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTJkOTE5NGFhNjBmOTBmOGRlOTE5MDBjZWIyOGZkN2ZfMmQ0NDM3Yzk1MzkxNTE3Mzg3ZTNjMWUyNGZiMTk3MzNfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

React Native 的实现原理核心在于结合 JavaScript 与原生开发，实现跨平台移动应用开发

- **JavaScript 层**：开发者使用 JavaScript 和 React 语法编写应用的业务逻辑和 UI 组件。在这一层，借助 React 的虚拟 DOM（Virtual DOM）特性，通过状态管理来描述 UI 的变化。虚拟 DOM 是真实 DOM 的抽象表示，它以 JavaScript 对象的形式存在，对其进行操作比对真实 DOM 操作性能更高。

- **桥接层（Bridge）**：作为 JavaScript 层和原生层之间的通信桥梁，负责两者之间的数据传递和方法调用。当 JavaScript 层有 UI 更新或需要调用原生功能时，会通过桥接层将相关信息传递给原生层；反之，原生层的事件和数据也通过桥接层传递给 JavaScript 层。桥接层的通信是异步的，以避免阻塞 JavaScript 线程。

- **原生层**：包含 iOS 和 Android 各自的原生代码。原生层接收到桥接层传递的信息后，使用原生的 UI 组件和系统 API 来渲染界面和执行相应的操作。例如在 iOS 上使用 UIKit 框架，在 Android 上使用 Android SDK 来创建和管理 UI 元素。

优点

- **跨平台开发**：一套代码可同时用于 iOS 和 Android 平台开发，大幅节省开发时间和成本，提高开发效率。例如，开发一款电商应用，不用分别为两个平台编写独立代码。

- **开发效率较高**：采用热更新机制，开发者修改代码后无需完全重启应用就能快速看到更新效果，能快速迭代开发。

- **接近原生体验**：使用原生组件渲染界面，在性能和用户体验上接近原生应用，响应速度快，能为用户提供流畅的交互。

- **技术生态丰富**：基于 JavaScript 和 React，有大量的开源库、插件和工具可供使用，还能借鉴前端开发领域的成熟经验和解决方案。

- **开发者学习成本较低**：对于熟悉 JavaScript 和 React 的前端开发者来说，容易上手，只需学习少量原生开发知识即可进行移动应用开发。

缺点

- **性能存在一定局限**：由于需要通过桥接器在 JavaScript 和原生代码间通信，在处理复杂动画和高帧率场景时可能出现性能瓶颈，不如原生应用流畅。

- **原生功能集成复杂**：集成一些复杂的原生功能时，需编写额外的桥接代码来实现 JavaScript 和原生代码的交互，增加了开发难度和工作量。

- **应用包体积较大**：除了自身代码，还包含 JavaScript 运行环境等内容，导致安装包体积相对较大，影响用户下载意愿。

- **版本兼容性问题：**随着 React Native、iOS 和 Android 系统不断更新，可能出现版本兼容性问题，需要开发者投入时间进行适配和调试。

- **UI 一致性挑战：**虽然尽量保证跨平台 UI 一致性，但不同平台的原生组件存在细微差异，在实现完全一致的视觉和交互效果上有一定挑战。

方案实践

- **Facebook**：Facebook的主应用包含750多个用React Native编写的页面，部分功能模块完全用React Native重写以提升性能。

- **Instagram**：Instagram的“保存”“推送通知”“帖子推广”“评论管理”等许多页面都使用了React Native。

- **Microsoft Office、Outlook、Teams、Skype等**：微软在这些产品中采用React Native进行“棕地开发”，添加新功能。

### **Flutter**

简介

Flutter是谷歌开发的一款跨平台移动应用开发框架，采用Dart语言，利用丰富的组件库和强大的渲染引擎Skia，能为iOS和Android以及Windows、macOS、Linux 桌面端开发等多平台快速构建高性能、高保真的原生应用，热重载等特性使其开发效率极高。

实现原理

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Yzc3NTAwMjE3MzQzNGQ4ZmU2YjZlMjAxOTU2OWU1MDNfMTljODViN2Q1MjI0NDhmNWQwMzJmNGRhOTlmOGFjYTNfSUQ6NzIxNjI1MDE2NTY4MTMyNDAzM18xNzgxMDU3Njg3OjE3ODExNDQwODdfVjM)

Flutter的实现原理主要涉及语言基础、渲染机制、框架结构等方面，以下是具体介绍：

- Dart语言基础

    Flutter以Dart语言为基础，Dart具有以下特性为Flutter提供支持：

    - **高效执行**：Dart在运行时具有高效的执行性能，能够快速处理各种计算任务和响应用户交互。它采用了Just\-In\-Time（JIT）和 Ahead\-Of\-Time（AOT）编译技术，在开发阶段使用JIT编译，支持热重载，方便开发者快速看到代码修改的效果；在发布阶段使用AOT编译，将代码编译为本地机器码，提高应用的启动速度和运行性能。

    - **面向对象和响应式编程**：Dart是面向对象的语言，一切皆为对象，这与Flutter的组件化架构相契合。同时，Dart支持响应式编程范式，通过流（Stream）和异步编程等特性，方便处理用户输入、网络请求等异步操作，使开发者能够轻松构建响应式的用户界面。

- 渲染机制

    Flutter有自己的渲染引擎，核心是Skia图形库：

    - **图形绘制**：Skia负责将Flutter应用中的各种图形元素，如矩形、圆形、文本等，绘制到屏幕上。它具有高效的图形渲染能力，能够处理复杂的图形计算和绘制操作，确保应用界面的流畅显示。

    - **合成与显示**：Flutter通过将不同的图形层进行合成，最终将合成后的图像显示在屏幕上。在这个过程中，Flutter会根据组件的布局和属性，计算每个图形元素的位置和样式，然后由Skia进行绘制和合成。

- 框架结构

    Flutter框架主要分为三层：

    - **Widgets层**：这是Flutter框架的最上层，也是开发者与框架交互的主要接口。Widgets是Flutter应用的基本构建块，包括文本框、按钮、图像等各种UI元素。开发者通过组合和嵌套不同的Widgets来构建应用的用户界面。

    - **Rendering层**：负责处理Widgets的布局和渲染。当Widgets的属性发生变化时，Rendering层会根据布局算法重新计算Widgets的位置和大小，并将这些信息传递给Skia渲染引擎进行绘制。

    - **Foundation层**：提供了一些基础的功能和服务，如事件处理、手势识别、动画管理等。它是Flutter框架的底层支撑，为上层的Widgets和Rendering层提供了必要的基础设施。

- 跨平台实现

    Flutter通过抽象底层平台差异来实现跨平台：

    - **平台通道（Platform Channel）**：Flutter提供了平台通道机制，允许Dart代码与原生平台（iOS和Android）的代码进行通信。通过平台通道，Flutter应用可以调用原生平台的API，实现一些Flutter框架本身不直接支持的功能，如访问设备传感器、调用系统相机等。

    - **适配不同平台**：Flutter在不同平台上会根据平台的特点和规范，对应用的外观和行为进行适当的调整。例如，在iOS上，Flutter应用会遵循iOS的设计风格和交互习惯；在Android上，则会遵循Android的规范。

优点

- **跨平台开发能力出色**：使用 Flutter，开发者可以用一套代码库同时开发 iOS 和 Android 应用，大大节省了开发时间和成本，提高了开发效率。比如开发一款通用的办公软件，无需为两个平台分别编写大量重复代码。

- **高性能**：Flutter 采用自有的渲染引擎 Skia，能够实现流畅的 UI 渲染和高效的图形处理，为用户带来接近原生应用的体验。即使是在处理复杂动画和大量数据展示的应用中，也能保持较高的帧率和响应速度。

- **丰富的 UI 组件库**：提供了大量丰富且可定制的 UI 组件，涵盖各种常见的界面元素和交互组件，如按钮、文本框、导航栏等，开发者可以轻松构建出美观、个性化的用户界面。

- **热重载功能强大**：在开发过程中，热重载功能允许开发者即时看到代码修改后的效果，无需重新启动应用，这大大加快了开发和调试的速度，提高了开发效率，方便快速迭代和优化应用。

- **社区支持活跃**：拥有庞大且活跃的社区，开发者可以在社区中分享经验、获取资源、寻求帮助。大量的开源项目和插件可供使用，能够方便地实现各种复杂功能，如网络请求、数据存储等。

缺点

- **学习曲线较陡**：对于没有相关编程经验或不熟悉 Dart 语言的开发者来说，学习 Flutter 可能具有一定的难度，需要花费时间掌握 Dart 语言以及 Flutter 的框架和组件使用方法。

- **部分原生功能集成复杂**：虽然 Flutter 提供了平台通道来与原生平台交互，但对于一些复杂的、特定于平台的原生功能，如深度集成系统底层功能、访问特定硬件设备等，集成起来可能相对复杂，需要开发者具备一定的原生开发知识。

- **插件生态有待完善**：尽管有大量的插件可供使用，但与一些成熟的原生开发生态相比，Flutter 的插件生态还不够完善，可能存在某些特定功能的插件缺失或不够稳定的情况。

- **应用包体积较大**：Flutter 应用通常会包含 Flutter 运行时和相关资源，导致最终生成的应用包体积相对较大，这可能会影响应用的下载和安装速度，尤其是在网络环境较差或存储容量有限的设备上。

方案实践

- **谷歌系**：Google Ads、Google Assistant、Google Pay。

- **腾讯系**：微信、QQ、QQ邮箱、NOW直播。

- **阿里系**：闲鱼、淘宝、支付宝（部分功能）、菜鸟、UC浏览器、盒马、饿了么。

- **字节跳动系**：抖音、火山小视频、今日头条。

- **其他**：百度网盘、B站、微博、快手、链家。

### **CSS 自定义属性（CSS Variables）**

- 概念
CSS 原生提供的变量机制，通过 `--variable-name` 语法定义，使用 `var()` 函数引用。变量可继承、可通过 JavaScript 动态修改，作用域由 DOM 层级决定（如 `:root` 定义全局变量）。

- 优点

    - 原生支持，无需编译，浏览器直接解析。

    - 动态性强，可实时响应运行时变化（如主题切换）。

    - 与 CSS 特性（如媒体查询、动画）无缝结合。

- 缺点

    - 浏览器兼容性有限（IE 不支持）。

    - 功能单一，仅支持变量存储，无嵌套、循环等高级特性。一般配合postcss插件使用

### **PostCSS**

- 概念
是一个用 JavaScript 转换 CSS 的工具链，通过插件生态（如 Autoprefixer、CSS Modules）实现自动化处理、未来 CSS 语法兼容和性能优化，兼具灵活性与原生 CSS 语法的简洁性。常见插件包括：

    - `autoprefixer`：自动添加浏览器前缀。

    - `postcss-preset-env`：将未来 CSS 语法转换为当前兼容版本。

    - `cssnano`：压缩优化 CSS。

- 优点

    - 插件生态丰富，可按需组合功能，灵活适配项目需求。

    - 不改变 CSS 语法，学习成本低，适合渐进式集成。

- 缺点

    - 需配置多个插件，构建流程复杂。

    - 本身不提供预处理器功能（如变量、嵌套），需配合其他工具。





# 附录2

## Web与WPF性能对比

[Web与WPF对比验证](https://uih.feishu.cn/docx/RwnRdB0fAoM00nxd8Xhc2bCAnAc)





# 评审记录和评审意见整理@叶极宁

[评审记录：MCSF2\.0前端开发框架和开发规范 V1\.0](https://uih.feishu.cn/sheets/WFFUsts1ehrQkFt0Azoc29j5nue)

评审建议整理：@叶极宁



软键盘的设计（考虑国际化）

触控笔

眼控手势

省电模式

QT功能转移工作量，哪些技术是被允许的，考虑内嵌部分功能







