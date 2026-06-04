// tests/i18n.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { I18N, t, LANGS } = require('../assets/js/i18n.js');

test('LANGS contains zh and en', () => {
  assert.deepStrictEqual(LANGS, ['zh', 'en']);
});
test('t() returns the right language string', () => {
  assert.strictEqual(t('nav.market', 'zh'), '市场');
  assert.strictEqual(t('nav.market', 'en'), 'Marketplace');
});
test('t() falls back to key when missing', () => {
  assert.strictEqual(t('nope.key', 'zh'), 'nope.key');
});
test('every chrome key has both zh and en', () => {
  for (const [k, v] of Object.entries(I18N)) {
    assert.ok(v.zh && v.en, `missing translation for ${k}`);
  }
});
