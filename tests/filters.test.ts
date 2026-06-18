import { test, expect } from 'vitest';
import { filterCapabilities } from '@/lib/filters';
import { CAPABILITIES } from '@/data/capabilities';

test('no filters → all', () => {
  expect(filterCapabilities(CAPABILITIES, {}).length).toBe(9);
});
test('type filter', () => {
  const r = filterCapabilities(CAPABILITIES, { type: 'skill' });
  expect(r.length).toBeGreaterThanOrEqual(2);
  expect(r.every(c => c.type === 'skill')).toBe(true);
});
test('modality filter', () => {
  expect(filterCapabilities(CAPABILITIES, { modality: 'CT' }).every(c => c.modality === 'CT')).toBe(
    true
  );
});
test('bilingual query', () => {
  expect(
    filterCapabilities(CAPABILITIES, { q: 'Coronary' }).some(c => c.id === 'coronary-cta')
  ).toBe(true);
  expect(
    filterCapabilities(CAPABILITIES, { q: '主动脉' }).some(c => c.id === 'aortic-dissection')
  ).toBe(true);
});
