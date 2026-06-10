// src/lib/catalogFormat.ts —— 纯函数；浏览器"复制成 markdown"与 Node 构建共用
import type { Capability, Lang } from '@/types/capability';

export function capabilityToMarkdown(c: Capability, lang: Lang = 'zh'): string {
  const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse') =>
    c.i18n[f][lang] || c.i18n[f].zh;
  const lines = [
    `# ${tx('title')} — ${tx('tagline')}`,
    '',
    tx('description'),
    '',
    `- Type: ${c.type}`,
    `- Modality: ${c.modality}`,
    `- Clinical use: ${tx('clinicalUse')}`
  ];
  if (c.fda)
    lines.push(
      `- FDA 510(k): ${c.fda.kNumber} (${c.fda.decisionDate}, ${c.fda.productCode}) — ${c.fda.applicant}`
    );
  else lines.push('- Status: demo, not a medical device');
  lines.push(`- MCP endpoint: ${c.connect.mcpEndpoint}`, `- llms.txt: ${c.connect.llmsTxt}`);
  return lines.join('\n');
}

export function buildCatalogJson(caps: Capability[]) {
  return {
    version: 1 as const,
    name: '联影智能 · Agent Hub',
    items: caps.map(c => ({
      id: c.id,
      type: c.type,
      modality: c.modality,
      title: c.i18n.title,
      tagline: c.i18n.tagline,
      description: c.i18n.description,
      fda: c.fda,
      mcpEndpoint: c.connect.mcpEndpoint
    }))
  };
}

export function buildLlmsTxt(caps: Capability[]): string {
  const out = [
    '# 联影智能 · Agent Hub / United Imaging Intelligence · Agent Hub',
    '',
    '> 把院内影像 AI 变成人和智能体都能直接调用的标准服务。本文件为机器可读的能力目录摘要。',
    '> Turn in-house imaging AI into services people and agents can call. Machine-readable catalog summary.',
    '',
    '## Capabilities',
    ''
  ];
  for (const c of caps) {
    const fda = c.fda
      ? ` — FDA ${c.fda.kNumber} (${c.fda.decisionDate})`
      : ' — demo (not a device)';
    out.push(
      `- **${c.i18n.title.en}** [${c.type}/${c.modality}]${fda}: ${c.i18n.description.en} MCP: ${c.connect.mcpEndpoint}`
    );
  }
  out.push('');
  return out.join('\n');
}
