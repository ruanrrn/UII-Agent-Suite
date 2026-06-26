#!/usr/bin/env node
import { spawn, execSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = __dirname;
const SKILL_ROOT = path.resolve(__dirname, "..");
// 影像资源与文件服务脚本都随该 demo skill 一起分发，位于 skill 目录下。
const IMAGING_DATA_DIR = path.join(SKILL_ROOT, "imaging-data");

const API_BASE = (
  process.env.AI_TASK_API_BASE || "http://10.9.54.49:30979/api/common"
).replace(/\/$/, "");
const FILE_SERVER_PORT_OVERRIDE = process.env.FILE_SERVER_PORT
  ? Number(process.env.FILE_SERVER_PORT)
  : null;
const FILE_SERVER_HOST = process.env.FILE_SERVER_HOST || "0.0.0.0";
const FILE_SERVER_PUBLIC_HOST = process.env.FILE_SERVER_PUBLIC_HOST || "";
const POLL_INTERVAL_MS = Number(process.env.AI_TASK_POLL_INTERVAL_MS || 5000);
const TIMEOUT_MS = Number(process.env.AI_TASK_TIMEOUT_MS || 600000);

const SUPPORTED_TYPES = new Map([
  [
    "ich",
    { directory: "ich", label: "CT_BRAIN", displayName: "卒中影像分析（ICH）" },
  ],
]);

function parseArgs(argv) {
  const args = { type: "ich" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--patient" || arg === "-p") {
      args.patient = argv[index + 1];
      index += 1;
    } else if (arg === "--type" || arg === "-t") {
      args.type = argv[index + 1];
      index += 1;
    } else if (arg === "--public-host") {
      args.publicHost = argv[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(
    "Usage: node .\\stroke-imaging-analysis\\scripts\\run-imaging-task.mjs --patient 张三 --type ich",
  );
  console.log(
    "       node .\\stroke-imaging-analysis\\scripts\\run-imaging-task.mjs --patient 张三 --type ich --public-host 10.9.54.x",
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function request(method, url, body) {
  const payload = body ? JSON.stringify(body) : undefined;
  const requestUrl = new URL(url);

  return new Promise((resolve, reject) => {
    const req = http.request(
      requestUrl,
      {
        method,
        headers: {
          Accept: "application/json",
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data = null;
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              data = text;
            }
          }

          if ((res.statusCode || 0) >= 400) {
            reject(
              new Error(
                `${method} ${url} failed with ${res.statusCode}: ${text}`,
              ),
            );
            return;
          }

          resolve(data);
        });
      },
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function waitForServer(url, attempts = 20) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const check = () => {
      attempt += 1;
      const req = http.request(
        url,
        { method: "HEAD", timeout: 1500 },
        (res) => {
          res.resume();
          resolve(true);
        },
      );
      req.on("timeout", () => req.destroy(new Error("timeout")));
      req.on("error", () => {
        if (attempt >= attempts) {
          reject(new Error(`File server did not become ready at ${url}`));
          return;
        }
        setTimeout(check, 500);
      });
      req.end();
    };

    check();
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function startFileServer(port) {
  // 每次运行都启动一个本次专用的文件服务实例，不复用已有服务。使用 skill 内置的 file-server.mjs。
  const child = spawn(
    process.execPath,
    [path.join(SCRIPTS_DIR, "file-server.mjs")],
    {
      cwd: SCRIPTS_DIR,
      stdio: "ignore",
      env: {
        ...process.env,
        HOST: FILE_SERVER_HOST,
        PORT: String(port),
        ROOT_DIR: IMAGING_DATA_DIR,
      },
    },
  );

  child.on("error", (error) => {
    console.error(`文件服务进程错误: ${error.message}`);
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/`);
  } catch (error) {
    child.kill();
    throw error;
  }

  // 兜底：即使发生未捕获异常或被 Ctrl+C 中断，也要 kill 掉本次专用文件服务，避免遗留进程。
  const cleanup = () => {
    if (!child.killed) child.kill();
  };
  const onSignal = (signal) => {
    cleanup();
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  child.__cleanup = cleanup;
  child.__onSignal = onSignal;
  process.on("exit", cleanup);
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  console.log(`文件服务已启动（本次专用，端口 ${port}）`);
  return child;
}

function stopFileServer(child, port) {
  if (!child) return;
  if (child.__cleanup) process.removeListener("exit", child.__cleanup);
  if (child.__onSignal) {
    process.removeListener("SIGINT", child.__onSignal);
    process.removeListener("SIGTERM", child.__onSignal);
  }
  if (child.killed) return;
  child.kill();
  console.log(`文件服务已关闭（端口 ${port}）`);
}

function getPublicHost(overrideHost) {
  if (overrideHost) return overrideHost;
  if (FILE_SERVER_PUBLIC_HOST) return FILE_SERVER_PUBLIC_HOST;

  const addresses = Object.values(os.networkInterfaces())
    .flatMap((items) => items || [])
    .filter((item) => item.family === "IPv4" && !item.internal)
    .map((item) => item.address);

  const preferred = addresses.find((address) => address.startsWith("10.9.54."));
  if (preferred) return preferred;

  const fallback = addresses[0];
  if (fallback) return fallback;

  throw new Error(
    "未找到可用于远端下载的本机 IPv4 地址。可设置 FILE_SERVER_PUBLIC_HOST 手动指定。",
  );
}

function encodePathParts(parts) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

async function createTask(fileUrl) {
  console.log(`创建 AI 计算任务: ${fileUrl}`);
  const result = await request("POST", `${API_BASE}/ai_task`, { url: fileUrl });

  if (!result?.task_id) {
    throw new Error(
      `创建任务失败，响应中没有 task_id: ${JSON.stringify(result)}`,
    );
  }

  console.log(`任务 ID: ${result.task_id}`);
  return result.task_id;
}

async function pollTask(taskId) {
  const startedAt = Date.now();
  let lastStatus = null;

  while (Date.now() - startedAt <= TIMEOUT_MS) {
    const result = await request("GET", `${API_BASE}/ai_task/${taskId}`);
    const status = result?.status;

    if (status !== lastStatus) {
      console.log(`任务状态: ${statusText(status)} (${status})`);
      lastStatus = status;
    }

    if (status === 4) return result;
    if (status === 3) throw new Error(`AI 计算失败: ${JSON.stringify(result)}`);

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `AI 计算超时，超过 ${Math.round(TIMEOUT_MS / 1000)} 秒未成功。`,
  );
}

function statusText(status) {
  if (status === 1) return "未开始";
  if (status === 2) return "计算中";
  if (status === 3) return "失败";
  if (status === 4) return "成功";
  return "未知";
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "");
}

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractDiagnostic(result, label) {
  const aiResult = result?.ai_result || {};
  const algorithmResult = aiResult[label];

  if (!algorithmResult) {
    throw new Error(
      `结果中没有算法标签 ${label}。可用标签: ${Object.keys(aiResult).join(", ") || "无"}`,
    );
  }

  // 真实响应会把结果包在 data 字段里（含 code/success/msg/data/viewUrl），
  // 接口文档示例则是直接展开的，这里同时兼容两种结构。
  const payload =
    algorithmResult.data && typeof algorithmResult.data === "object"
      ? algorithmResult.data
      : algorithmResult;

  const seriesList = Array.isArray(payload.seriesList)
    ? payload.seriesList
    : [];
  const findings = unique(
    seriesList.map((series) => series.imageFindings || ""),
  );
  const conclusions = unique(
    seriesList.map((series) => series.conclusion || ""),
  );
  const emergencies = unique(
    seriesList.flatMap((series) =>
      Array.isArray(series.emergency)
        ? series.emergency
            .filter((item) => item.hasEmergency)
            .map((item) =>
              stripTags(item.aiContents?.content || item.emergencyItem || ""),
            )
        : [],
    ),
  );

  return {
    viewUrl: algorithmResult.viewUrl || payload.viewUrl || "",
    findings,
    conclusions,
    emergencies,
  };
}

function printDiagnostic({ patient, typeConfig, diagnostic }) {
  console.log("\n=== 诊断结果 ===");
  console.log(`患者: ${patient}`);
  console.log(`检查: ${typeConfig.displayName}`);

  if (diagnostic.findings.length > 0) {
    console.log("\n影像所见:");
    for (const finding of diagnostic.findings) console.log(finding);
  }

  if (diagnostic.conclusions.length > 0) {
    console.log("\n结论:");
    for (const conclusion of diagnostic.conclusions) console.log(conclusion);
  }

  if (diagnostic.emergencies.length > 0) {
    console.log("\n危急值:");
    for (const emergency of diagnostic.emergencies)
      console.log(`- ${emergency}`);
  }

  if (diagnostic.viewUrl) {
    console.log(`\n查看地址: ${diagnostic.viewUrl}`);
  }
}

/** 跨平台探测 Chromium 内核浏览器（Edge/Chrome/Chromium）路径。 */
function findBrowser() {
  const platform = process.platform;
  const candidates = [];

  if (platform === "win32") {
    const pf = process.env.ProgramFiles || "C:\\Program Files";
    const pfx86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    const localAppData = process.env.LOCALAPPDATA || "";
    candidates.push(
      path.join(pf, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(pfx86, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(pfx86, "Microsoft", "Edge", "Application", "msedge.exe"),
    );
    if (localAppData) {
      candidates.push(
        path.join(
          localAppData,
          "Google",
          "Chrome",
          "Application",
          "chrome.exe",
        ),
      );
    }
  } else if (platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else {
    for (const name of [
      "google-chrome",
      "google-chrome-stable",
      "chromium-browser",
      "chromium",
      "microsoft-edge",
    ]) {
      try {
        const resolved = execSync(`which ${name}`, { encoding: "utf8" }).trim();
        if (resolved) candidates.push(resolved);
      } catch {
        // ignore missing executables
      }
    }
  }

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

function fallbackOpen(url) {
  const isWin = process.platform === "win32";
  const command = isWin
    ? "powershell"
    : process.platform === "darwin"
      ? "open"
      : "xdg-open";
  const args = isWin
    ? ["-NoProfile", "-Command", `Start-Process '${url.replace(/'/g, "''")}'`]
    : [url];

  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "ignore", windowsHide: true });
    child.on("error", (error) => {
      console.error(`打开浏览器失败: ${error.message}`);
      console.error(`请手动复制以下地址在浏览器打开:\n${url}`);
      resolve();
    });
    child.on("exit", () => resolve());
  });
}

function openUrl(url) {
  if (!url) return Promise.resolve();

  console.log(`\n正在独立窗口打开浏览器查看完整地址:\n${url}`);

  const browserPath = findBrowser();
  if (!browserPath) {
    console.log(
      "未找到 Chromium 内核浏览器（Edge/Chrome），回退到系统默认方式打开。",
    );
    return fallbackOpen(url);
  }

  // 每次使用独立的临时 user-data-dir，强制启动一个全新的独立浏览器实例，
  // 这样即使已有浏览器在运行，也会新开一个独立窗口，而不会复用已打开的浏览器。
  // --app 让 viewUrl 以独立应用窗口打开，--start-fullscreen 让窗口默认全屏。
  const profileDir = mkdtempSync(path.join(os.tmpdir(), "stroke-imaging-"));
  const args = [
    `--app=${url}`,
    `--user-data-dir=${profileDir}`,
    "--new-window",
    "--start-fullscreen",
    "--no-first-run",
    "--no-default-browser-check",
  ];

  return new Promise((resolve) => {
    const child = spawn(browserPath, args, { detached: true, stdio: "ignore" });
    child.on("error", (error) => {
      console.error(`独立窗口启动失败，回退到系统默认方式: ${error.message}`);
      fallbackOpen(url).then(resolve);
    });
    // 等待进程真正 spawn 后再 unref，确保浏览器在脚本退出前已被拉起；
    // unref 让脚本不必等待这个独立窗口关闭即可结束。
    child.on("spawn", () => {
      console.log(`已用独立窗口打开（${path.basename(browserPath)}）`);
      child.unref();
      resolve();
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const patient = String(args.patient || "").trim();
  const type = String(args.type || "ich")
    .trim()
    .toLowerCase();
  const publicHostOverride = String(args.publicHost || "").trim();

  if (!patient) {
    printHelp();
    throw new Error("缺少患者姓名，请传入 --patient。");
  }

  const typeConfig = SUPPORTED_TYPES.get(type);
  if (!typeConfig) {
    throw new Error(
      `暂不支持检查类型 ${type}，当前仅支持: ${[...SUPPORTED_TYPES.keys()].join(", ")}`,
    );
  }

  const archiveName = `${patient}.7z`;
  const archivePath = path.join(
    IMAGING_DATA_DIR,
    typeConfig.directory,
    archiveName,
  );
  if (!(await exists(archivePath))) {
    throw new Error(`未找到去标识影像报告压缩包: ${archivePath}`);
  }

  const port = FILE_SERVER_PORT_OVERRIDE ?? (await findFreePort());
  const fileServer = await startFileServer(port);

  try {
    const publicHost = getPublicHost(publicHostOverride);
    const fileUrl = `http://${publicHost}:${port}/${encodePathParts([typeConfig.directory, archiveName])}`;
    const taskId = await createTask(fileUrl);

    let result;
    try {
      result = await pollTask(taskId);
    } catch (error) {
      if (String(error.message || "").includes("AI 计算失败")) {
        console.error("\n排查提示:");
        console.error(`- 本地文件 URL: ${fileUrl}`);
        console.error(
          `- 请确认 AI 服务主机可以反向访问 ${publicHost}:${port} 并下载该文件`,
        );
        console.error(
          "- 可用 --public-host <AI 服务可访问的本机IP> 或设置 FILE_SERVER_PUBLIC_HOST 指定地址",
        );
      }
      throw error;
    }

    const diagnostic = extractDiagnostic(result, typeConfig.label);
    printDiagnostic({ patient, typeConfig, diagnostic });
    await openUrl(diagnostic.viewUrl);
  } finally {
    stopFileServer(fileServer, port);
  }
}

main().catch((error) => {
  console.error(`\n错误: ${error.message}`);
  process.exitCode = 1;
});
