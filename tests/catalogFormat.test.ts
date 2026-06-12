import { test, expect } from 'vitest';
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat';
import { CAPABILITIES } from '@/data/capabilities';
const coronary = CAPABILITIES.find(c => c.id === 'uai-coronary-analysis')!;

test('markdown has title, K-number + pdf url, MCP endpoint and tools', () => {
  const md = capabilityToMarkdown(coronary, 'en');
  expect(md).toMatch(/Coronary Analysis/);
  expect(md).toMatch(/K240411/);
  expect(md).toContain('https://www.accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf');
  expect(md).toContain('https://hub.uii-ai.example/mcp/uai-portal/coronary');
  expect(md).toContain('analyze_coronary_cta');
});
test('catalog json v2 stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  expect(cat.version).toBe(2);
  expect(cat.items.length).toBe(5);
  const it = cat.items.find(i => i.id === 'uai-coronary-analysis')!;
  expect(it.fda!.kNumber).toBe('K240411');
  expect(it.fda!.pdfUrl).toContain('K240411.pdf');
  expect(it.mcp.endpointUrl).toBeTruthy();
  expect(it.mcp.tools).toContain('analyze_coronary_cta');
});
test('llms.txt lists every K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  expect(txt).toMatch(/^# 联影智能 AI 能力平台/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => expect(txt).toContain(c.fda!.kNumber));
});
