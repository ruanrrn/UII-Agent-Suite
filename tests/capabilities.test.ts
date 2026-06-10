import { test, expect } from 'vitest';
import { CAPABILITIES } from '@/data/capabilities';

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('exactly 10 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(10);
  const ids = CAPABILITIES.map(c => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/));
});
test('valid type/modality + bilingual fields', () => {
  for (const c of CAPABILITIES) {
    expect(TYPES).toContain(c.type);
    expect(MODS).toContain(c.modality);
    for (const f of ['title', 'tagline', 'description', 'clinicalUse'] as const) {
      expect(c.i18n[f].zh).toBeTruthy();
      expect(c.i18n[f].en).toBeTruthy();
    }
  }
});
test('non-skill carry real FDA K-number; skill is demo', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') {
      expect(c.badges).toContain('demo');
      expect(c.fda).toBeNull();
      continue;
    }
    expect(c.fda!.kNumber).toMatch(/^K\d{6}$/);
    expect(c.fda!.decisionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(c.fda!.productCode).toBeTruthy();
  }
});
