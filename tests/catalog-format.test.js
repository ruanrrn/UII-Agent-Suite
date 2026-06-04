// tests/catalog-format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { capabilityToMarkdown, buildCatalogJson, buildLlmsTxt } = require('../assets/js/catalog-format.js');
const { CAPABILITIES } = require('../assets/js/capabilities.js');

const ich = CAPABILITIES.find(c => c.id === 'uai-easy-triage-ich');

test('capabilityToMarkdown includes title, K-number and MCP endpoint', () => {
  const md = capabilityToMarkdown(ich, 'en');
  assert.match(md, /uAI Easy Triage ICH/);
  assert.match(md, /K242292/);
  assert.match(md, /mcp:\/\/hub\.uii-ai\.example\/ich-triage/);
});
test('buildCatalogJson returns machine catalog with stable shape', () => {
  const cat = buildCatalogJson(CAPABILITIES);
  assert.strictEqual(cat.version, 1);
  assert.strictEqual(cat.items.length, CAPABILITIES.length);
  const item = cat.items.find(i => i.id === 'uai-easy-triage-ich');
  assert.strictEqual(item.fda.kNumber, 'K242292');
  assert.ok(item.title.zh && item.title.en && item.mcpEndpoint);
});
test('buildLlmsTxt is markdown listing every capability with K-number', () => {
  const txt = buildLlmsTxt(CAPABILITIES);
  assert.match(txt, /^# 联影智能 · Agent Hub/m);
  CAPABILITIES.filter(c => c.fda).forEach(c => assert.ok(txt.includes(c.fda.kNumber), `llms.txt missing ${c.fda.kNumber}`));
});
