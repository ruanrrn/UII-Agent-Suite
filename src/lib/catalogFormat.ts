// src/lib/catalogFormat.ts —— 纯函数；浏览器"复制成 markdown"与 Node 构建共用
import type { Capability, Lang } from '@/types/capability';
import { fdaPdfUrl } from './fda';

export function capabilityToMarkdown(c: Capability, lang: Lang = 'zh'): string {
  const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse' | 'overview') =>
    c.i18n[f][lang] || c.i18n[f].zh;
  const lines = [
    `# ${tx('title')} — ${tx('tagline')}`,
    '',
    tx('overview'),
    '',
    `- Modality: ${c.modality}`,
    `- Clinical use: ${tx('clinicalUse')}`
  ];
  if (c.fda)
    lines.push(
      `- FDA 510(k): ${c.fda.kNumber} (${c.fda.decisionDate}) — ${fdaPdfUrl(c.fda.kNumber)}`
    );
  else lines.push('- Status: research only, not a medical device');
  lines.push(
    `- MCP endpoint: ${c.mcp.endpointUrl}`,
    `- MCP server key: ${c.mcp.serverKey}`,
    `- Tools: ${c.mcp.tools.map(t => t.name).join(', ')}`,
    '- Discovery: /llms.txt · /catalog.json'
  );
  return lines.join('\n');
}

export function buildCatalogJson(caps: Capability[]) {
  return {
    version: 2 as const,
    name: '联影智能 AI 能力平台',
    items: caps.map(c => ({
      id: c.id,
      type: c.type,
      modality: c.modality,
      series: c.series ?? null,
      title: c.i18n.title,
      tagline: c.i18n.tagline,
      description: c.i18n.description,
      fda: c.fda ? { ...c.fda, pdfUrl: fdaPdfUrl(c.fda.kNumber) } : null,
      mcp: {
        endpointUrl: c.mcp.endpointUrl,
        serverKey: c.mcp.serverKey,
        tools: c.mcp.tools.map(t => t.name)
      }
    }))
  };
}

export function buildLlmsTxt(caps: Capability[]): string {
  const out = [
    '# 联影智能 AI 能力平台 / UII AI Capability Hub',
    '',
    '> 把联影自研影像 AI 变成人和智能体都能直接调用的标准服务（云 SaaS 交付，HIPAA/BAA 合规）。本文件为机器可读的能力目录摘要。',
    '> Turn UII first-party imaging AI into cloud services people and agents can call. Machine-readable catalog summary.',
    '',
    '## Capabilities',
    ''
  ];
  for (const c of caps) {
    const fda = c.fda
      ? ` — FDA ${c.fda.kNumber} (${c.fda.decisionDate})`
      : ' — research (not a device)';
    out.push(
      `- **${c.i18n.title.en}** [${c.type}/${c.modality}]${fda}: ${c.i18n.description.en} MCP: ${c.mcp.endpointUrl}`
    );
  }
  out.push('');
  return out.join('\n');
}
