---
name: stroke-imaging-analysis
description: "Use when: the user asks to run a stroke/ICH imaging AI analysis for a named patient, such as '给张三做一次卒中影像分析（ich）检查', '给张三做ich检查', or '卒中影像分析'. It serves imaging-data files, finds the patient's de-identified 7z package, creates and polls the AI Task API, shows diagnostic text, and opens the returned viewUrl."
argument-hint: "<患者姓名> [ich]"
---

# Stroke Imaging Analysis

## When To Use

Use this skill when the user asks to run an ICH/stroke imaging AI check for a patient by name.

Supported examples:

- `给张三做一次卒中影像分析（ich）检查`
- `给张三做ich检查`
- `张三 卒中影像分析`

## Inputs

- Patient name: usually the Chinese name before `做`, `的`, or near `ich`.
- Exam type: currently only `ich` is supported.

The expected local file is (bundled inside this skill as demo data):

```text
stroke-imaging-analysis/imaging-data/ich/<患者姓名>.7z
```

## Procedure

1. Run the bundled script from the project root:

   ```powershell
   node .\stroke-imaging-analysis\scripts\run-imaging-task.mjs --patient 张三 --type ich
   ```

2. The script will:
   - ensure `stroke-imaging-analysis/imaging-data/ich/<患者姓名>.7z` exists;
   - start a dedicated local imaging file service for this run (never reuse an existing one) and shut it down when finished;
   - choose a non-loopback local IP, preferring the `10.9.54.*` network;
   - build the file URL for the de-identified 7z package;
   - call `POST http://10.9.54.49:30979/api/common/ai_task`;
   - poll `GET http://10.9.54.49:30979/api/common/ai_task/<task_id>` until success, failure, or timeout;
   - extract `CT_BRAIN.seriesList[].imageFindings`, `conclusion`, and emergency text;
   - print the diagnostic text;
   - open the complete returned `viewUrl` in the browser.

3. Report the printed diagnostic result back to the user, including any failure reason if the task fails or times out.

## Configuration

Optional environment variables:

- `AI_TASK_API_BASE`: default `http://10.9.54.49:30979/api/common`
- `FILE_SERVER_PORT`: optional fixed port; by default each run picks a free port for its dedicated file service
- `FILE_SERVER_HOST`: default `0.0.0.0`
- `FILE_SERVER_PUBLIC_HOST`: override the public host/IP sent to the AI Task API
- `AI_TASK_POLL_INTERVAL_MS`: default `5000`
- `AI_TASK_TIMEOUT_MS`: default `600000`

You can also override the public host from the command line:

```powershell
node .\stroke-imaging-analysis\scripts\run-imaging-task.mjs --patient 张三 --type ich --public-host 10.9.54.x
```

## Notes

- This skill is self-contained: the imaging demo data (`imaging-data/`) and the file server (`scripts/file-server.mjs`) are bundled inside the skill folder.
- Do not send `localhost` or `127.0.0.1` as the file URL because the remote AI service must download the package.
- The file service is started fresh for each run and stopped afterwards; it is never reused across runs.
- Chinese file names must be URL encoded. The script handles this automatically.
- The `viewUrl` contains `&`; it is opened in a dedicated, fullscreen Chromium window (Chrome/Edge) using an isolated temporary user-data-dir, so it never reuses an already-open browser and the full URL is not truncated.
- For ICH, the AI result label is `CT_BRAIN`.
