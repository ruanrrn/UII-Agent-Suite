# Imaging Detection MCP Server

An MCP server for imaging detection. It exposes one tool, `detect_imaging`, which submits a DICOM 7z URL to an AI Task API, polls until the task is complete, and returns a structured diagnostic report plus a viewer URL.

This package supports both MCP transports:

- **stdio** for local MCP clients that spawn the server process.
- **Streamable HTTP** for intranet or remote MCP clients.

## Requirements

- Node.js 18+
- Network access from this server to the AI Task API
- A DICOM 7z URL that the AI Task API can access

## Installation

```bash
npm install
```

For GitHub/npm-style usage:

```bash
npx imaging-detection-mcp
```

## Tool

### `detect_imaging`

Input:

```json
{
  "type": "ich",
  "storageUrl": "http://10.9.54.21:8001/ich/example.7z"
}
```

Fields:

| Field | Required | Description |
| --- | --- | --- |
| `type` | Yes | Detection type. Supported values: `ich`, `rib`. |
| `storageUrl` | Yes | Full downloadable DICOM 7z URL. The AI Task API must be able to access it. Do not use `localhost` or `127.0.0.1`. |

Structured output:

```json
{
  "type": "ich",
  "label": "CT_BRAIN",
  "taskId": "a1b2c3d4",
  "report": {
    "findings": ["..."],
    "conclusions": ["..."],
    "emergencies": ["..."]
  },
  "viewUrl": "http://10.9.54.100:30979/index?StudyUID=..."
}
```

## Detection Type Mapping

| `type` | AI Task API label | Description |
| --- | --- | --- |
| `ich` | `CT_BRAIN` | Stroke / ICH imaging analysis |
| `rib` | `CT_RIB` | Rib fracture analysis |

To add a new detection type, update `TYPE_MAP` in `src/config.mjs`.

## stdio Usage

Start stdio transport:

```bash
npm run start:stdio
```

Equivalent:

```bash
node bin/imaging-detection-mcp.mjs
node bin/imaging-detection-mcp.mjs stdio
```

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

stdio does not use `MCP_API_KEY`, because the MCP client launches the process locally. Use normal OS/file permissions to control who can run it.

## Streamable HTTP Usage

Start HTTP transport:

```bash
npm run start:http
```

Equivalent:

```bash
node bin/imaging-detection-mcp.mjs http
node bin/imaging-detection-mcp-http.mjs
node server.mjs
```

Default endpoints:

- MCP endpoint: `http://0.0.0.0:8970/mcp`
- Health check: `http://127.0.0.1:8970/health`

For intranet publishing, set a bearer key:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="8970"
$env:MCP_PATH="/mcp"
$env:MCP_API_KEY="replace-with-a-long-random-key"
$env:AI_TASK_API_BASE="http://10.9.54.49:30979/api/common"
npm run start:http
```

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

The HTTP server accepts either:

- `Authorization: Bearer <key>`
- `X-Api-Key: <key>`

If `MCP_API_KEY` is unset, HTTP authentication is disabled. That is only recommended for local development.

## CLI

```bash
imaging-detection-mcp                 # stdio transport by default
imaging-detection-mcp stdio           # stdio transport
imaging-detection-mcp http            # Streamable HTTP transport
imaging-detection-mcp --transport=http
imaging-detection-mcp-http            # Streamable HTTP transport
```

## Environment Variables

| Variable | Default | Applies to | Description |
| --- | --- | --- | --- |
| `AI_TASK_API_BASE` | `http://10.9.54.49:30979/api/common` | both | AI Task API base URL. |
| `AI_TASK_POLL_INTERVAL_MS` | `5000` | both | AI task polling interval. |
| `AI_TASK_TIMEOUT_MS` | `600000` | both | Total AI task timeout. |
| `AI_TASK_REQUEST_TIMEOUT_MS` | `30000` | both | Per-request AI Task API timeout. |
| `HOST` | `0.0.0.0` | HTTP | HTTP bind host. |
| `PORT` | `8970` | HTTP | HTTP bind port. |
| `MCP_PATH` | `/mcp` | HTTP | MCP endpoint path. |
| `MCP_API_KEY` | empty | HTTP | Enables bearer/API-key authentication when set. |
| `MCP_SESSION_MODE` | `stateful` | HTTP | `stateful` uses `Mcp-Session-Id`; `stateless` creates a temporary instance per request. |
| `MCP_ENABLE_JSON_RESPONSE` | `false` | HTTP | Return JSON responses instead of SSE streams. |
| `MCP_BODY_LIMIT_BYTES` | `1048576` | HTTP | MCP request body size limit. |
| `MCP_ALLOWED_HOSTS` | empty | HTTP | Optional comma-separated allowed Host values. |
| `MCP_ALLOWED_ORIGINS` | empty | HTTP | Optional comma-separated allowed Origin values. |
| `MCP_CORS_ALLOW_ORIGIN` | empty | HTTP | Optional browser CORS allow-list. |

## Validation

Syntax check:

```bash
npm run check
```

stdio smoke test:

```bash
npm run smoke:stdio
```

HTTP smoke test:

```powershell
$env:MCP_API_KEY="smoke-key"
$env:PORT="8971"
npm run start:http

# In another terminal:
$env:MCP_API_KEY="smoke-key"
$env:MCP_SERVER_URL="http://127.0.0.1:8971/mcp"
npm run smoke:http
```

`smoke` tests only initialize MCP and list tools. They do not call `detect_imaging`, so they do not submit an AI task.

## Security Notes

- Do not commit real `MCP_API_KEY` values.
- Use a long random key when publishing the HTTP transport on an intranet.
- Prefer `stdio` for local-only clients.
- Use `MCP_ALLOWED_HOSTS` / `MCP_ALLOWED_ORIGINS` when the HTTP endpoint is exposed beyond a trusted subnet.
- `storageUrl` must not contain secrets unless the AI Task API is authorized to access them.
