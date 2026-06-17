import { test, expect } from 'vitest';
import { CAPABILITIES } from '@/data/capabilities';

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODS = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('exactly 8 capabilities, unique kebab ids', () => {
  expect(CAPABILITIES.length).toBe(8);
  const ids = CAPABILITIES.map(c => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/));
});
test('valid type/modality + bilingual title present', () => {
  for (const c of CAPABILITIES) {
    expect(TYPES).toContain(c.type);
    expect(MODS).toContain(c.modality);
    expect(c.i18n.title.zh).toBeTruthy();
    expect(c.i18n.title.en).toBeTruthy();
  }
});
test('any FDA clearance is well-formed (K-number shape)', () => {
  for (const c of CAPABILITIES) {
    if (c.fda) expect(c.fda.kNumber).toMatch(/^K\d{6}$/);
  }
});
test('every capability declares an MCP server', () => {
  for (const c of CAPABILITIES) {
    expect(c.mcp.serverKey).toMatch(/^[a-z0-9-]+$/);
    expect(c.mcp.endpointUrl).toMatch(/^https:\/\/hub\.uii-ai\.example\/mcp\//);
  }
});
test('each capability references an icon asset', () => {
  for (const c of CAPABILITIES) {
    expect(c.icon).toBeTruthy();
  }
});
