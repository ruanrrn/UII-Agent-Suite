---
name: imaging-detection-skill
description: Perform imaging detection through user-level stdio MCP access powered by the globally installed @rayruan/imaging-detection-mcp npm package, or from https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp when source fallback is needed. Use when the user asks to install or verify imaging detection dependencies, run first-use guidance, or analyze DICOM imaging data / DICOM 7z URLs for ICH/stroke/brain hemorrhage or RIB/rib fracture analysis. Supports direct remote 7z URLs and local .7z archives that must be validated, temporarily served over HTTP, then analyzed by create_imaging_task followed by get_imaging_task. Default to stdio MCP access through a global/user-level MCP configuration; optionally guide HTTP MCP access when the user provides an HTTP endpoint and bearer API key. Use the bundled public 张三 ICH 7z URL only as an optional user-confirmed test sample.
---

# Imaging Detection Skill

Normalize user-provided imaging inputs into a task submission:

```json
{
  "type": "ich | rib",
  "storageUrl": "http(s)://.../*.7z"
}
```

Then use the two tools exposed by `imaging-detection-mcp`:

1. `create_imaging_task` submits the DICOM 7z URL and immediately returns a durable `taskId`.
2. `get_imaging_task` queries that `taskId`, optionally using `waitSeconds` for server-side bounded long-polling until the task is `running`, `completed`, or `failed`.

## Known Dependencies And Test Data

Use this npm package when the user needs to install the prerequisite MCP server:

```text
@rayruan/imaging-detection-mcp
```

Use this MCP source only when the user needs to inspect the source or install from source:

```text
https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp
```

Install/configure this MCP at global/user MCP scope, not as a project-local MCP inside the current workspace.

Default stdio MCP installation mode: install the npm package globally first, then configure the MCP client to run the installed CLI command directly. This avoids Windows/npm `npx` bin-resolution issues that can leave clients waiting for the MCP `initialize` response.

```bash
npm install -g @rayruan/imaging-detection-mcp
```

```json
{
  "mcpServers": {
    "imaging-detection": {
      "command": "imaging-detection-mcp",
      "args": ["stdio"],
      "env": {
        "AI_TASK_API_BASE": "http://10.9.54.49:30979/api/common"
      }
    }
  }
}
```

After installation, verify the CLI is visible on `PATH` from a new terminal:

```bash
imaging-detection-mcp --help
```

If the MCP client explicitly requires `npx`, use an explicit package-plus-bin form and choose the command for the client's operating system. Do not use the shorthand `npx -y @rayruan/imaging-detection-mcp stdio`, because some npm/Windows combinations cannot resolve the scoped package bin from that form.

macOS/Linux:

```json
{
  "mcpServers": {
    "imaging-detection": {
      "command": "npx",
      "args": [
        "-y",
        "-p",
        "@rayruan/imaging-detection-mcp",
        "imaging-detection-mcp",
        "stdio"
      ],
      "env": {
        "AI_TASK_API_BASE": "http://10.9.54.49:30979/api/common"
      }
    }
  }
}
```

Windows:

```json
{
  "mcpServers": {
    "imaging-detection": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "-p",
        "@rayruan/imaging-detection-mcp",
        "imaging-detection-mcp",
        "stdio"
      ],
      "env": {
        "AI_TASK_API_BASE": "http://10.9.54.49:30979/api/common"
      }
    }
  }
}
```

If a Windows MCP client cannot resolve `npx.cmd`, use `command: "cmd"` with `args: ["/c", "npx", "-y", "-p", "@rayruan/imaging-detection-mcp", "imaging-detection-mcp", "stdio"]`.

If the npm package is unavailable or the user wants to install from source, guide them to clone the repository and globally install the package from its subdirectory:

```bash
git clone https://github.com/ruanrrn/UII-Agent-Suite.git
cd UII-Agent-Suite/imaging-detection-mcp
npm install
npm install -g .
```

Do not add this MCP only to a project-local config such as `.vscode/mcp.json` unless the user explicitly asks for project scope.

Use this public DICOM 7z URL only for optional smoke/end-to-end testing after the MCP dependency is configured and the user confirms they want to submit a real test task:

```text
https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z
```

The test task submission is:

```json
{
  "type": "ich",
  "storageUrl": "https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z"
}
```

Do not run this test automatically during setup; it invokes the AI Task API.

## First Install / First Use

When this skill is installed, invoked for setup, or used while the MCP imaging tools are not available, perform prerequisite guidance before analysis.

Check or guide these items:

1. Node.js is available and is version 18 or later.
2. `@rayruan/imaging-detection-mcp` is installed globally and `imaging-detection-mcp --help` works from a new terminal. If not, guide `npm install -g @rayruan/imaging-detection-mcp`; use source installation from `https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp` only as last fallback.
3. The MCP client is configured globally/user-level using one of the supported access modes below.
4. Both `create_imaging_task` and `get_imaging_task` are visible in the active MCP tool list after the MCP client reloads.
5. The AI software API base URL is known for stdio mode. Default: `http://10.9.54.49:30979/api/common`.
6. For HTTP mode, the user has provided both the MCP HTTP URL and bearer API key.

Do not run imaging analysis until both `create_imaging_task` and `get_imaging_task` are available.

## MCP Tools

### `create_imaging_task`

Submits a DICOM 7z URL to the AI Task API and returns immediately. It does not wait for AI computation to finish.

Input:

```json
{
  "type": "ich",
  "storageUrl": "http://10.9.54.21:8001/ich/example.7z"
}
```

Fields:

| Field        | Required | Description                                                                                                       |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`       | Yes      | Detection type. Supported values: `ich`, `rib`.                                                                   |
| `storageUrl` | Yes      | Full downloadable DICOM 7z URL. The AI Task API must be able to access it. Do not use `localhost` or `127.0.0.1`. |

Structured output:

```json
{
  "type": "ich",
  "label": "CT_BRAIN",
  "taskId": "a1b2c3d4",
  "status": "submitted"
}
```

After a successful create call, preserve the returned `taskId` and use it for every later query.

### `get_imaging_task`

Queries an existing task by `taskId`. The `taskId` is globally unique, so do not pass `type` when querying.

Input:

```json
{
  "taskId": "a1b2c3d4",
  "waitSeconds": 60
}
```

Fields:

| Field         | Required | Description                                                                                                                                                                                                                                           |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `taskId`      | Yes      | The `taskId` returned by `create_imaging_task`.                                                                                                                                                                                                       |
| `waitSeconds` | No       | Server-side bounded long-poll budget. `0` means a single check. Omitted uses server default `AI_TASK_DEFAULT_WAIT_MS`, currently `0`. Values above `AI_TASK_MAX_WAIT_MS`, currently `120` seconds by default, are clamped. Recommended: `30` to `60`. |

Structured output by status:

- `running`: still computing. Call `get_imaging_task` again with the same `taskId`, usually with `waitSeconds: 30` to `60`.
- `failed`: computation failed. Present the message and stop unless the user asks to retry.
- `completed`: report is ready and includes `type`, `label`, `report.findings`, `report.conclusions`, `report.emergencies`, and `viewUrl`.

Do not high-frequency poll. Prefer a small number of `get_imaging_task` calls with `waitSeconds: 30` to `60` until the result is `completed` or `failed`.

## MCP Access Modes

Prefer stdio. Use HTTP only when the user explicitly wants remote/intranet service access or cannot use stdio.

### Default: stdio

Use stdio when the MCP server can run locally in the user's environment.

Before producing stdio configuration:

- Ask for the AI software API base URL if it is unknown.
- Offer this default AI software API base URL: `http://10.9.54.49:30979/api/common`.
- Confirm the configuration will be added to the MCP client's global/user-level settings, not the current workspace/project MCP file.

MCP client configuration example:

```json
{
  "mcpServers": {
    "imaging-detection": {
      "command": "imaging-detection-mcp",
      "args": ["stdio"],
      "env": {
        "AI_TASK_API_BASE": "http://10.9.54.49:30979/api/common"
      }
    }
  }
}
```

Rules for stdio:

- Do not ask for an HTTP address or API key.
- Use the user's AI software API base URL, or the default above when accepted.
- Configure the MCP client at global/user scope. For VS Code/Copilot MCP, add the server to user-level MCP settings; do not create or update `.vscode/mcp.json` unless the user explicitly requests project scope.
- Prefer global `npm install -g @rayruan/imaging-detection-mcp`, then run `imaging-detection-mcp stdio` from the MCP client. This direct CLI form is the default cross-platform path when the npm global bin directory is on `PATH`.
- If `npx` is required, use explicit package-plus-bin arguments: macOS/Linux `command: "npx"`; Windows `command: "npx.cmd"`, or `command: "cmd"` with `/c npx ...` only when the client cannot resolve `npx.cmd`. Avoid shorthand `npx -y @rayruan/imaging-detection-mcp stdio`.
- If the MCP client uses a different config format, preserve the same intent: run the globally installed CLI in stdio mode from global/user MCP configuration and set `AI_TASK_API_BASE`.
- After configuration, ask the user to reload/restart the MCP client, then verify both `create_imaging_task` and `get_imaging_task` are available.
- After both tools are available, offer the public 张三 ICH 7z URL as an optional test. Run it only after explicit user confirmation.

### Optional: HTTP

Use HTTP only when the user requests HTTP/remote/intranet access.

Before producing HTTP configuration, require:

- MCP HTTP endpoint, for example `http://10.5.178.21:8970/mcp`
- bearer API key

HTTP MCP client configuration example:

```json
{
  "mcpServers": {
    "imaging-detection": {
      "type": "http",
      "url": "http://10.5.178.21:8970/mcp",
      "headers": {
        "Authorization": "Bearer replace-with-a-long-random-key"
      }
    }
  }
}
```

Rules for HTTP:

- Replace the example `url` with the user-provided MCP HTTP endpoint when different.
- Replace `replace-with-a-long-random-key` with the user-provided key in the actual client config.
- Configure the HTTP MCP connection at global/user scope. For VS Code/Copilot MCP, add it to user-level MCP settings; do not create or update `.vscode/mcp.json` unless the user explicitly requests project scope.
- Do not store, echo, log, or write the bearer key into files unless the user explicitly asks to update their MCP config.
- If HTTP auth fails with `401`, stop and ask the user to verify the bearer key.
- After configuration, ask the user to reload/restart the MCP client, then verify both `create_imaging_task` and `get_imaging_task` are available.
- After both tools are available, offer the public 张三 ICH 7z URL as an optional test. Run it only after explicit user confirmation.

## Analysis Types

Normalize user intent to MCP `type`:

| User wording                                         | MCP type | AI Task label |
| ---------------------------------------------------- | -------- | ------------- |
| `ICH`, `ich`, `脑卒中`, `卒中`, `脑出血`, `颅内出血` | `ich`    | `CT_BRAIN`    |
| `RIB`, `rib`, `肋骨`, `肋骨骨折`                     | `rib`    | `CT_RIB`      |

If the analysis type is missing or ambiguous, ask the user to choose `ICH` or `RIB`.

## Input Channels

### Channel A: Remote 7z URL

Use this when the user provides both:

- a DICOM 7z URL
- an analysis type

Validate:

- URL uses `http://` or `https://`.
- URL is not `localhost` or `127.0.0.1`.
- URL path or user statement indicates a `.7z` archive.
- analysis type maps to `ich` or `rib`.

Then submit:

```json
{
  "type": "<normalized-type>",
  "storageUrl": "<user-provided-url>"
}
```

If the URL is internal, remind the user that the AI Task API network must be able to access it.

### Channel B: Local DICOM 7z Archive

Use this when the user provides a local file path or attached DICOM archive plus an analysis type.

Validate and serve the archive with this bundled script:

```powershell
node scripts/serve-dicom-7z.mjs "<path-to-file.7z>" --public-host "<intranet-ip>" --port 18080 --ttl 3600
```

The script:

- checks the file exists
- requires `.7z` extension
- verifies 7z magic bytes
- binds an HTTP server to `0.0.0.0` by default
- exposes only that one file under a random token URL
- prints JSON containing `url`, `healthUrl`, `port`, and `expiresAt`
- exits automatically after TTL

Use the printed `url` as `storageUrl` for `create_imaging_task`.

Important:

- Prefer an explicit `--public-host` provided by the user, such as the machine intranet IP.
- Do not use generated URLs with `localhost` or `127.0.0.1` for analysis.
- Ensure the selected port is allowed by the local firewall and reachable from the AI Task API network.
- Keep the file server alive until analysis finishes.
- Stop the temporary server after analysis, or let it expire via TTL.

If `--public-host` is unknown, ask the user for the intranet IP that the AI Task API can reach.

## Analysis Workflow

1. Check both `create_imaging_task` and `get_imaging_task` availability. If either is missing, run the First Install / First Use guidance.
2. Identify the input channel.
3. Normalize the analysis type to `ich` or `rib`.
4. Produce a valid remote `storageUrl`:
   - Channel A: validate the provided URL.
   - Channel B: run `scripts/serve-dicom-7z.mjs` and use its printed `url`.
5. Call `create_imaging_task` with the normalized `type` and `storageUrl`.
6. Save the returned `taskId` and present it if the task may take time.
7. Call `get_imaging_task` with `{ "taskId": "<taskId>", "waitSeconds": 30 }` or `{ "taskId": "<taskId>", "waitSeconds": 60 }`.
8. If status is `running`, repeat `get_imaging_task` with the same `taskId` and a bounded `waitSeconds` value. Do not submit a duplicate task unless the user asks to restart.
9. If status is `failed`, show the message and stop.
10. If status is `completed`, present:
    - findings
    - conclusions
    - emergencies
    - viewer URL
11. Attempt to open the viewer URL with an available browser/open-url capability.
12. If automatic opening fails, provide the viewer URL clearly.

## Optional End-To-End Test

Use this only when the user asks to verify the full analysis path or accepts a proposed test:

```json
{
  "type": "ich",
  "storageUrl": "https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z"
}
```

Before running it, state that it submits a real AI Task API job. After creating the task, preserve and show the `taskId`, then query it with `get_imaging_task` using `waitSeconds: 30` to `60` until it completes or fails. After it finishes, present the same report fields as a normal analysis and attempt to open the viewer URL.

## Error Guidance

Give the smallest missing correction:

- Missing analysis type: ask for `ICH` or `RIB`.
- Unsupported type: explain supported values are `ICH` and `RIB`.
- Missing URL/file: ask for a remote `.7z` URL or local `.7z` path.
- URL is `localhost` or `127.0.0.1`: explain the AI Task API cannot access the user's loopback address.
- Local file is not `.7z`: ask for a DICOM `.7z` archive.
- Local file fails 7z magic check: ask for a valid 7z archive.
- File server URL is not reachable: ask for a reachable intranet IP, open port, or remote storage URL.
- MCP server missing or stuck at `Waiting for server to respond to initialize request`: first verify `imaging-detection-mcp --help` works in a new terminal. If not, guide `npm install -g @rayruan/imaging-detection-mcp`. Then configure user-level stdio MCP with `command: "imaging-detection-mcp"` and `args: ["stdio"]`. If `npx` is required, use explicit package-plus-bin form for the user's OS (`npx` on macOS/Linux, `npx.cmd` on Windows, or `cmd /c npx` only as a Windows fallback). Avoid shorthand `npx -y @rayruan/imaging-detection-mcp stdio`; use source installation from `https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp` only as last fallback.
- MCP tools missing: guide first-use setup, using stdio by default, and verify both `create_imaging_task` and `get_imaging_task` appear in the active MCP tool list.
- stdio setup missing AI software API URL: ask for it and offer `http://10.9.54.49:30979/api/common` as the default.
- HTTP requested but URL/key missing: ask the user for both HTTP endpoint and bearer API key.
- HTTP `401`: ask the user to verify the bearer key.
- Task remains `running`: keep the `taskId` and call `get_imaging_task` again with `waitSeconds: 30` to `60`; do not create a duplicate task.
- AI analysis failure: show the error from `create_imaging_task` or `get_imaging_task` and the relevant non-secret context (`type`, `storageUrl`, `taskId` when available), but never expose secrets.

## Response Style

After task creation but before completion, use this shape when helpful:

```text
影像检测任务已创建

检查类型: ICH/RIB
任务 ID: <taskId>

正在等待 AI 计算结果...
```

For successful analysis, use this shape:

```text
影像分析完成

检查类型: ICH/RIB
任务 ID: <taskId>

影像所见:
...

结论:
...

危急值:
...

Viewer:
<viewer url>
```

If no emergencies are returned, say `危急值: 未返回`.
