import { test, expect } from 'vitest';
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat';
import { CAPABILITIES } from '@/data/capabilities';
const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich')!;

test('markdown has title, K-number, MCP', () => {
  const md = capabilityToMarkdown(ich, 'en');
  expect(md).toMatch(/uAI Easy Triage ICH/);
  expect(md).toMatch(/K242292/);
  expect(md).toMatch(/mcp:\/\/hub\.uii-ai\.example\/ich-triage/);
});
test('catalog json stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  expect(cat.version).toBe(1);
  expect(cat.items.length).toBe(10);
  const it = cat.items.find(i => i.id === 'uai-easy-triage-ich')!;
  expect(it.fda!.kNumber).toBe('K242292');
  expect(it.mcpEndpoint).toBeTruthy();
});
test('llms.txt lists every K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  expect(txt).toMatch(/^# 联影智能 · Agent Hub/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => expect(txt).toContain(c.fda!.kNumber));
});
