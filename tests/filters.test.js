// tests/filters.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { filterCapabilities } = require('../assets/js/filters.js');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

test('no filters returns all', () => {
  assert.strictEqual(filterCapabilities(CAPABILITIES, {}).length, CAPABILITIES.length);
});
test('type filter works', () => {
  const r = filterCapabilities(CAPABILITIES, { type: 'clinical-ai' });
  assert.ok(r.length >= 2 && r.every(c => c.type === 'clinical-ai'));
});
test('modality filter works', () => {
  const r = filterCapabilities(CAPABILITIES, { modality: 'PET' });
  assert.ok(r.every(c => c.modality === 'PET'));
});
test('query matches title/tagline/description bilingually', () => {
  assert.ok(filterCapabilities(CAPABILITIES, { q: 'ICH' }).some(c => c.id === 'uai-easy-triage-ich'));
  assert.ok(filterCapabilities(CAPABILITIES, { q: '肋骨' }).some(c => c.id === 'uai-easytriage-rib'));
  assert.ok(filterCapabilities(CAPABILITIES, { q: 'reconstruction' }).every(c => c.type === 'reconstruction' || /recon/i.test(JSON.stringify(c.i18n))));
});
