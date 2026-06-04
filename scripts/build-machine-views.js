// scripts/build-machine-views.js
const fs = require('node:fs');
const path = require('node:path');
const { CAPABILITIES } = require('../assets/js/capabilities.js');
const { buildCatalogJson, buildLlmsTxt } = require('../assets/js/catalog-format.js');
const root = path.join(__dirname, '..');
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/catalog.json'), JSON.stringify(buildCatalogJson(CAPABILITIES), null, 2) + '\n');
fs.writeFileSync(path.join(root, 'llms.txt'), buildLlmsTxt(CAPABILITIES));
console.log('Wrote data/catalog.json and llms.txt');
