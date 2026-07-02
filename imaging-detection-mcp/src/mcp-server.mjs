import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { SERVER_INFO, TYPE_MAP } from "./config.mjs";
import { detectImaging } from "./imaging-task-api.mjs";

export function buildMcpServer() {
  const server = new McpServer(SERVER_INFO);

  server.registerTool(
    "detect_imaging",
    {
      title: "影像检测",
      description:
        "提交一份影像检测任务：根据检测类型和 DICOM 7z 下载地址调用 AI Task API，轮询完成后返回结构化诊断报告和 viewer url。",
      inputSchema: {
        type: z
          .enum([...TYPE_MAP.keys()])
          .describe(
            `影像检测类型，决定提取哪个算法标签。支持: ${[
              ...TYPE_MAP.keys(),
            ].join(", ")}`,
          ),
        storageUrl: z
          .string()
          .url()
          .describe(
            "DICOM 7z 压缩包的完整可下载 URL。AI 服务必须能访问该地址，请不要使用 localhost 或 127.0.0.1。",
          ),
      },
      outputSchema: {
        type: z.string(),
        label: z.string(),
        taskId: z.string(),
        report: z.object({
          findings: z.array(z.string()),
          conclusions: z.array(z.string()),
          emergencies: z.array(z.string()),
        }),
        viewUrl: z.string(),
      },
      annotations: {
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
        readOnlyHint: false,
      },
    },
    async (args) => {
      try {
        return await detectImaging(args);
      } catch (error) {
        return {
          content: [
            { type: "text", text: `错误: ${error.message || String(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
