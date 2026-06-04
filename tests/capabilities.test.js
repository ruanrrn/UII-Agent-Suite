// tests/capabilities.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

const TYPES = ['clinical-ai', 'platform', 'reconstruction', 'skill'];
const MODALITIES = ['CT', 'MR', 'PET', 'X-ray', 'Cross'];

test('has at least 10 capabilities', () => {
  assert.ok(CAPABILITIES.length >= 10);
});
test('ids are unique and kebab-case', () => {
  const ids = CAPABILITIES.map(c => c.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  ids.forEach(id => assert.match(id, /^[a-z0-9-]+$/));
});
test('each capability has valid type/modality and bilingual text', () => {
  for (const c of CAPABILITIES) {
    assert.ok(TYPES.includes(c.type), `${c.id} bad type`);
    assert.ok(MODALITIES.includes(c.modality), `${c.id} bad modality`);
    for (const f of ['title', 'tagline', 'description', 'clinicalUse']) {
      assert.ok(c.i18n[f] && c.i18n[f].zh && c.i18n[f].en, `${c.id} missing i18n.${f}`);
    }
  }
});
test('non-skill capabilities carry a real FDA K-number', () => {
  for (const c of CAPABILITIES) {
    if (c.type === 'skill') continue;
    assert.match(c.fda.kNumber, /^K\d{6}$/, `${c.id} bad K-number`);
    assert.match(c.fda.decisionDate, /^\d{4}-\d{2}-\d{2}$/, `${c.id} bad date`);
    assert.ok(c.fda.productCode, `${c.id} missing productCode`);
  }
});
test('skill items are flagged demo and not a device', () => {
  const skills = CAPABILITIES.filter(c => c.type === 'skill');
  assert.ok(skills.length >= 1);
  skills.forEach(c => assert.ok((c.badges || []).includes('demo')));
});
