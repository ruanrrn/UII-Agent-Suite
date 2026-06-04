// tests/build.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const root = path.join(__dirname, '..');

test('build script generates valid catalog.json and llms.txt', () => {
  execSync('node scripts/build-machine-views.js', { cwd: root });
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
  assert.strictEqual(cat.version, 1);
  assert.ok(cat.items.length >= 10);
  const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
  assert.match(llms, /Agent Hub/);
  assert.ok(llms.includes('K242292'));
});
