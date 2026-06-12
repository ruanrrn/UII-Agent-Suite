import { test, expect } from 'vitest';
import { CAPABILITIES } from '@/data/capabilities';

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('exactly 5 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(5);
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
test('all entries are uAI Portal apps cleared under K240411', () => {
  for (const c of CAPABILITIES) {
    expect(c.series).toBe('uAI Portal');
    expect(c.fda!.kNumber).toBe('K240411');
  }
  const aorta = CAPABILITIES.find(c => c.id === 'uai-aorta-analysis')!;
  expect(aorta.mcp.prompts.length).toBe(2);
  expect(aorta.mcp.resources.length).toBe(3);
});
