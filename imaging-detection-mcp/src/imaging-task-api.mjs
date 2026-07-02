import http from "node:http";
import https from "node:https";

import { TYPE_MAP, getAiTaskConfig } from "./config.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "");
}

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function requestJson(method, url, body, { requestTimeoutMs }) {
  const payload = body ? JSON.stringify(body) : undefined;
  const requestUrl = new URL(url);
  const transport = requestUrl.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      requestUrl,
      {
        method,
        timeout: requestTimeoutMs,
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
              new Error(`${method} ${url} failed with ${res.statusCode}: ${text}`),
            );
            return;
          }
          resolve(data);
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error(`${method} ${url} timed out after ${requestTimeoutMs}ms`));
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function createTask(fileUrl, config) {
  const result = await requestJson("POST", `${config.apiBase}/ai_task`, {
    url: fileUrl,
  }, config);

  if (!result?.task_id) {
    throw new Error(`创建任务失败，响应中没有 task_id: ${JSON.stringify(result)}`);
  }
  return result.task_id;
}

async function pollTask(taskId, config) {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= config.timeoutMs) {
    const result = await requestJson("GET", `${config.apiBase}/ai_task/${taskId}`, undefined, config);
    const status = result?.status;

    if (status === 4) return result;
    if (status === 3) {
      throw new Error(`AI 计算失败: ${JSON.stringify(result)}`);
    }

    await sleep(config.pollIntervalMs);
  }

  throw new Error(
    `AI 计算超时，超过 ${Math.round(config.timeoutMs / 1000)} 秒未成功。`,
  );
}

function extractDiagnostic(result, label) {
  const aiResult = result?.ai_result || {};
  const algorithmResult = aiResult[label];

  if (!algorithmResult) {
    throw new Error(
      `结果中没有算法标签 ${label}。可用标签: ${
        Object.keys(aiResult).join(", ") || "无"
      }`,
    );
  }

  const payload =
    algorithmResult.data && typeof algorithmResult.data === "object"
      ? algorithmResult.data
      : algorithmResult;

  const seriesList = Array.isArray(payload.seriesList) ? payload.seriesList : [];
  const findings = unique(seriesList.map((series) => series.imageFindings || ""));
  const conclusions = unique(seriesList.map((series) => series.conclusion || ""));
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

function formatReport({ typeConfig, diagnostic }) {
  const lines = ["=== 诊断结果 ===", `检查: ${typeConfig.displayName}`];

  if (diagnostic.findings.length > 0) {
    lines.push("", "影像所见:");
    for (const finding of diagnostic.findings) lines.push(finding);
  }
  if (diagnostic.conclusions.length > 0) {
    lines.push("", "结论:");
    for (const conclusion of diagnostic.conclusions) lines.push(conclusion);
  }
  if (diagnostic.emergencies.length > 0) {
    lines.push("", "危急值:");
    for (const emergency of diagnostic.emergencies) lines.push(`- ${emergency}`);
  }
  if (diagnostic.viewUrl) {
    lines.push("", `查看地址: ${diagnostic.viewUrl}`);
  }

  return lines.join("\n");
}

export async function detectImaging({ type, storageUrl }) {
  const typeConfig = TYPE_MAP.get(type);
  if (!typeConfig) {
    throw new Error(
      `暂不支持检测类型 ${type}，当前支持: ${[...TYPE_MAP.keys()].join(", ")}`,
    );
  }

  const config = getAiTaskConfig();
  const taskId = await createTask(storageUrl, config);
  const result = await pollTask(taskId, config);
  const diagnostic = extractDiagnostic(result, typeConfig.label);

  const structured = {
    type,
    label: typeConfig.label,
    taskId,
    report: {
      findings: diagnostic.findings,
      conclusions: diagnostic.conclusions,
      emergencies: diagnostic.emergencies,
    },
    viewUrl: diagnostic.viewUrl,
  };

  return {
    content: [{ type: "text", text: formatReport({ typeConfig, diagnostic }) }],
    structuredContent: structured,
  };
}
