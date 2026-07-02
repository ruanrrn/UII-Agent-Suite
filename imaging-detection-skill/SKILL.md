---
name: imaging-detection-skill
description: Perform imaging detection through imaging-detection-mcp from https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp. Use when the user asks to install or verify imaging detection dependencies, run first-use guidance, or analyze DICOM imaging data / DICOM 7z URLs for ICH/stroke/brain hemorrhage or RIB/rib fracture analysis. Supports direct remote 7z URLs and local .7z archives that must be validated, temporarily served over HTTP, then analyzed with detect_imaging. Default to stdio MCP access; optionally guide HTTP MCP access when the user provides an HTTP endpoint and bearer API key. Use the bundled public 张三 ICH 7z URL only as an optional user-confirmed test sample.
---

# Imaging Detection Skill

Normalize user-provided imaging inputs into:

```json
{
  "type": "ich | rib",
  "storageUrl": "http(s)://.../*.7z"
}
```

Then call the `detect_imaging` tool exposed by `imaging-detection-mcp`.

## Known Dependencies And Test Data

Use this MCP source when the user needs to install or locate the prerequisite MCP server:

```text
https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp
```

If the user wants to install from source, guide them to clone the repository and use the `imaging-detection-mcp` subdirectory:

```bash
git clone https://github.com/ruanrrn/UII-Agent-Suite.git
cd UII-Agent-Suite/imaging-detection-mcp
npm install
```

Use this public DICOM 7z URL only for optional smoke/end-to-end testing after the MCP dependency is configured and the user confirms they want to submit a real test task:

```text
https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z
```

The test input is:

```json
{
  "type": "ich",
  "storageUrl": "https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z"
}
```

Do not run this test automatically during setup; it invokes the AI Task API.

## First Install / First Use

When this skill is installed, invoked for setup, or used while `detect_imaging` is not available, perform prerequisite guidance before analysis.

Check or guide these items:

1. Node.js is available and is version 18 or later.
2. `imaging-detection-mcp` is installed or available from a local absolute path. If not, guide installation from `https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp`.
3. The MCP client is configured using one of the supported access modes below.
4. `detect_imaging` is visible in the active MCP tool list after the MCP client reloads.
5. The AI software API base URL is known for stdio mode. Default: `http://10.9.54.49:30979/api/common`.
6. For HTTP mode, the user has provided both the MCP HTTP URL and bearer API key.

Do not run imaging analysis until `detect_imaging` is available.

## MCP Access Modes

Prefer stdio. Use HTTP only when the user explicitly wants remote/intranet service access or cannot use stdio.

### Default: stdio

Use stdio when the MCP server can run locally in the user's environment.

Before producing stdio configuration:

- Ask for the absolute path to `imaging-detection-mcp` if it is unknown.
- Ask for the AI software API base URL if it is unknown.
- Offer this default AI software API base URL: `http://10.9.54.49:30979/api/common`.

MCP client configuration example:

```json
{
  "mcpServers": {
    "imaging-detection": {
      "command": "node",
      "args": [
        "/absolute/path/to/imaging-detection-mcp/bin/imaging-detection-mcp.mjs",
        "stdio"
      ],
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
- If the MCP client uses a different config format, preserve the same intent: run `imaging-detection-mcp` with `stdio` and set `AI_TASK_API_BASE`.
- After configuration, ask the user to reload/restart the MCP client, then verify `detect_imaging` is available.
- After `detect_imaging` is available, offer the public 张三 ICH 7z URL as an optional test. Run it only after explicit user confirmation.

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
- Do not store, echo, log, or write the bearer key into files unless the user explicitly asks to update their MCP config.
- If HTTP auth fails with `401`, stop and ask the user to verify the bearer key.
- After configuration, ask the user to reload/restart the MCP client, then verify `detect_imaging` is available.
- After `detect_imaging` is available, offer the public 张三 ICH 7z URL as an optional test. Run it only after explicit user confirmation.

## Analysis Types

Normalize user intent to MCP `type`:

| User wording                                         | MCP type |
| ---------------------------------------------------- | -------- |
| `ICH`, `ich`, `脑卒中`, `卒中`, `脑出血`, `颅内出血` | `ich`    |
| `RIB`, `rib`, `肋骨`, `肋骨骨折`                     | `rib`    |

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

Then call:

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

Use the printed `url` as `storageUrl`.

Important:

- Prefer an explicit `--public-host` provided by the user, such as the machine intranet IP.
- Do not use generated URLs with `localhost` or `127.0.0.1` for analysis.
- Ensure the selected port is allowed by the local firewall and reachable from the AI Task API network.
- Keep the file server alive until analysis finishes.
- Stop the temporary server after analysis, or let it expire via TTL.

If `--public-host` is unknown, ask the user for the intranet IP that the AI Task API can reach.

## Analysis Workflow

1. Check `detect_imaging` availability. If missing, run the First Install / First Use guidance.
2. Identify the input channel.
3. Normalize the analysis type to `ich` or `rib`.
4. Produce a valid remote `storageUrl`:
   - Channel A: validate the provided URL.
   - Channel B: run `scripts/serve-dicom-7z.mjs` and use its printed `url`.
5. Call `detect_imaging` with the normalized `type` and `storageUrl`.
6. Present:
   - findings
   - conclusions
   - emergencies
   - viewer URL
7. Attempt to open the viewer URL with an available browser/open-url capability.
8. If automatic opening fails, provide the viewer URL clearly.

## Optional End-To-End Test

Use this only when the user asks to verify the full analysis path or accepts a proposed test:

```json
{
  "type": "ich",
  "storageUrl": "https://github.com/ruanrrn/UII-Agent-Suite/raw/refs/heads/main/stroke-imaging-analysis/imaging-data/ich/%E5%BC%A0%E4%B8%89.7z"
}
```

Before running it, state that it submits a real AI Task API job. After it finishes, present the same report fields as a normal analysis and attempt to open the viewer URL.

## Error Guidance

Give the smallest missing correction:

- Missing analysis type: ask for `ICH` or `RIB`.
- Unsupported type: explain supported values are `ICH` and `RIB`.
- Missing URL/file: ask for a remote `.7z` URL or local `.7z` path.
- URL is `localhost` or `127.0.0.1`: explain the AI Task API cannot access the user's loopback address.
- Local file is not `.7z`: ask for a DICOM `.7z` archive.
- Local file fails 7z magic check: ask for a valid 7z archive.
- File server URL is not reachable: ask for a reachable intranet IP, open port, or remote storage URL.
- MCP server missing: guide installation from `https://github.com/ruanrrn/UII-Agent-Suite/tree/main/imaging-detection-mcp`.
- MCP tool missing: guide first-use setup, using stdio by default.
- stdio setup missing AI software API URL: ask for it and offer `http://10.9.54.49:30979/api/common` as the default.
- HTTP requested but URL/key missing: ask the user for both HTTP endpoint and bearer API key.
- HTTP `401`: ask the user to verify the bearer key.
- AI analysis failure: show the error from `detect_imaging` and the normalized `type`/`storageUrl` used, but never expose secrets.

## Response Style

For successful analysis, use this shape:

```text
影像分析完成

检查类型: ICH/RIB

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
