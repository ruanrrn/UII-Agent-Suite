// scripts/build-machine-views.ts —— 单一数据源 → 机器视图 + mock 伪 API
import { mkdirSync, writeFileSync } from 'node:fs';
import { CAPABILITIES } from '../src/data/capabilities';
import { CONSOLE_OVERVIEW } from '../src/data/console';
import { buildCatalogJson, buildLlmsTxt } from '../src/lib/catalogFormat';

mkdirSync('public/mock', { recursive: true });
writeFileSync(
  'public/catalog.json',
  JSON.stringify(buildCatalogJson(CAPABILITIES), null, 2) + '\n'
);
writeFileSync('public/llms.txt', buildLlmsTxt(CAPABILITIES));
writeFileSync('public/mock/capabilities.json', JSON.stringify(CAPABILITIES, null, 2) + '\n');
writeFileSync('public/mock/console.json', JSON.stringify(CONSOLE_OVERVIEW, null, 2) + '\n');
console.log('machine views + mock written');
