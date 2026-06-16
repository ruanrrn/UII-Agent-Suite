import { test, expect } from 'vitest';
import { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } from '@/lib/catalogFormat';
import { CAPABILITIES } from '@/data/capabilities';
const coronary = CAPABILITIES.find(c => c.id === 'coronary-cta')!;

test('markdown has title, status line and MCP endpoint', () => {
  const md = capabilityToMarkdown(coronary, 'en');
  expect(md).toMatch(/AI-Assisted Analysis System for Coronary CTA Imaging/);
  expect(md).toContain('research only, not a medical device');
  expect(md).toContain('https://hub.uii-ai.example/mcp/coronary-cta');
});
test('catalog json v2 stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  expect(cat.version).toBe(2);
  expect(cat.items.length).toBe(8);
  const it = cat.items.find(i => i.id === 'coronary-cta')!;
  expect(it.fda).toBeNull();
  expect(it.mcp.endpointUrl).toBeTruthy();
});
test('llms.txt lists every capability title', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  expect(txt).toMatch(/^# 联影智能 AI 能力平台/m);
  CAPABILITIES.forEach(c => expect(txt).toContain(c.i18n.title.en));
});
