import { test, expect } from 'vitest';
import { filterCapabilities } from '@/lib/filters';
import { CAPABILITIES } from '@/data/capabilities';

test('no filters → all', () => {
  expect(filterCapabilities(CAPABILITIES, {}).length).toBe(11);
});
test('type filter', () => {
  const r = filterCapabilities(CAPABILITIES, { type: 'clinical-ai' });
  expect(r.length).toBeGreaterThanOrEqual(2);
  expect(r.every(c => c.type === 'clinical-ai')).toBe(true);
});
test('modality filter', () => {
  expect(
    filterCapabilities(CAPABILITIES, { modality: 'PET' }).every(c => c.modality === 'PET')
  ).toBe(true);
});
test('bilingual query', () => {
  expect(
    filterCapabilities(CAPABILITIES, { q: 'ICH' }).some(c => c.id === 'uai-easy-triage-ich')
  ).toBe(true);
  expect(
    filterCapabilities(CAPABILITIES, { q: '肋骨' }).some(c => c.id === 'uai-easytriage-rib')
  ).toBe(true);
});
