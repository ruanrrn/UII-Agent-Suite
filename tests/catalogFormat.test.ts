import { test, expect } from 'vitest';
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat';
import { CAPABILITIES } from '@/data/capabilities';
const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich')!;

test('markdown has title, K-number + pdf url, MCP endpoint and tools', () => {
  const md = capabilityToMarkdown(ich, 'en');
  expect(md).toMatch(/uAI Easy Triage ICH/);
  expect(md).toMatch(/K242292/);
  expect(md).toContain('https://www.accessdata.fda.gov/cdrh_docs/pdf24/K242292.pdf');
  expect(md).toContain('https://hub.uii-ai.example/mcp/ich-triage');
  expect(md).toContain('detect_ich');
});
test('catalog json v2 stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  expect(cat.version).toBe(2);
  expect(cat.items.length).toBe(11);
  const it = cat.items.find(i => i.id === 'uai-easy-triage-ich')!;
  expect(it.fda!.kNumber).toBe('K242292');
  expect(it.fda!.pdfUrl).toContain('K242292.pdf');
  expect(it.mcp.endpointUrl).toBeTruthy();
  expect(it.mcp.tools).toContain('detect_ich');
});
test('llms.txt lists every K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  expect(txt).toMatch(/^# 联影智能 · Agent Hub/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => expect(txt).toContain(c.fda!.kNumber));
});
