import { test, expect } from 'vitest';
import { CAPABILITIES } from '@/data/capabilities';

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('exactly 11 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(11);
  const ids = CAPABILITIES.map(c => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/));
});
test('valid type/modality + bilingual fields incl. overview', () => {
  for (const c of CAPABILITIES) {
    expect(TYPES).toContain(c.type);
    expect(MODS).toContain(c.modality);
    for (const f of ['title', 'tagline', 'description', 'clinicalUse', 'overview'] as const) {
      expect(c.i18n[f].zh).toBeTruthy();
      expect(c.i18n[f].en).toBeTruthy();
    }
  }
});
test('non-skill carry real FDA K-number; skill is demo (fda null)', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') {
      expect(c.fda).toBeNull();
      continue;
    }
    expect(c.fda!.kNumber).toMatch(/^K\d{6}$/);
    expect(c.fda!.decisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(c.fda!.productCode).toBeTruthy();
  }
});
test('every capability exposes an MCP spec', () => {
  for (const c of CAPABILITIES) {
    expect(c.mcp.serverKey).toMatch(/^[a-z0-9-]+$/);
    expect(c.mcp.endpointUrl).toMatch(/^https:\/\/hub\.uii-ai\.example\/mcp\//);
    expect(c.mcp.tools.length).toBeGreaterThanOrEqual(1);
    for (const t of c.mcp.tools) {
      expect(t.name).toMatch(/^[a-z0-9_]+$/);
      expect(t.desc.zh).toBeTruthy();
      expect(t.desc.en).toBeTruthy();
    }
  }
});
test('flagship aortic entry uses real K240411', () => {
  const a = CAPABILITIES.find(c => c.id === 'uai-discover-aortic-dissection')!;
  expect(a.series).toBe('uAI Discover');
  expect(a.fda!.kNumber).toBe('K240411');
  expect(a.mcp.prompts.length).toBe(2);
  expect(a.mcp.resources.length).toBe(3);
});
