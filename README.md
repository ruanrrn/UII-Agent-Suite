# UII Agent Hub

联影智能 Agent Hub — 把医疗 AI 能力（影像检测、卒中影像分析、生命体征测量）封装成院内智能体（Agent / MCP 客户端）可以直接调用的标准化技能与服务。

**仓库地址**: [https://github.com/ruanrrn/UII-Agent-Suite](https://github.com/ruanrrn/UII-Agent-Suite)

## 项目结构

本仓库是一个「Agent 技能 + MCP 服务」集合，包含一个 MCP 服务器和三个 Agent 技能（Skill）：

```
├── imaging-detection-mcp/     # 影像检测 MCP 服务器（npm 包 @rayruan/imaging-detection-mcp）
├── imaging-detection-skill/   # 影像检测 Skill：经 MCP 完成 ICH/RIB 检测
├── stroke-imaging-analysis/   # 卒中影像分析 Skill：含演示数据与运行脚本
└── vitallens/                 # vitallens-rppg Skill：摄像头测量心率/呼吸率
```

## 组件

| 名称                    | 类型       | 说明                                                                                                                                    |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| imaging-detection-mcp   | MCP Server | 影像检测 MCP 服务，支持 stdio 与 Streamable HTTP；提供 `create_imaging_task` / `get_imaging_task` 工具，调用 AI Task API 完成 ICH/RIB 检测并返回诊断报告与查看链接 |
| imaging-detection-skill | Skill      | 将用户输入的 DICOM 7z（远程 URL 或本地文件）归一化后，经 `imaging-detection-mcp` 完成 ICH（脑出血/卒中）或 RIB（肋骨骨折）检测            |
| stroke-imaging-analysis | Skill      | 按患者姓名运行卒中/ICH 影像 AI 分析：发布本地影像数据、调用并轮询 AI Task API、输出诊断文本并打开查看页                                   |
| vitallens-rppg          | Skill      | 用摄像头无接触采集约 12 秒视频，返回心率与呼吸率（基于 VitalLens API，仅供研究，非医疗器械）                                             |

## 环境要求

- Node.js 18+
- 影像相关组件需要能访问 AI Task API 的网络环境（默认 `http://10.9.54.49:30979/api/common`）
- vitallens-rppg 需要摄像头、Chromium 内核浏览器（Edge/Chrome）以及 `VITALLENS_API_KEY` 环境变量

## 使用

各组件相互独立，按需进入对应目录使用。

### imaging-detection-mcp（MCP 服务器）

```bash
cd imaging-detection-mcp
npm install
npm run start:stdio   # stdio 传输，供本地 MCP 客户端拉起
npm run start:http    # Streamable HTTP 传输，供内网/远程客户端
npm test              # 单元测试
npm run smoke         # 冒烟测试
```

### Skills

每个 Skill 目录都包含供 Agent 读取的 `SKILL.md` 及配套脚本，需 Node.js 18+。

```bash
# 卒中影像分析
node ./stroke-imaging-analysis/scripts/run-imaging-task.mjs --patient 张三 --type ich

# vitallens-rppg 测量心率/呼吸率
node ./vitallens/scripts/launch.js
```

## License

UNLICENSED · © 2026 UII
