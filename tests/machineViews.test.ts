import { test, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

test('gen:machine writes catalog.json, llms.txt, mock JSON', () => {
  execSync('pnpm gen:machine', { cwd: process.cwd() });
  for (const f of [
    'public/catalog.json',
    'public/llms.txt',
    'public/mock/capabilities.json',
    'public/mock/console.json'
  ])
    expect(existsSync(f), f).toBe(true);
  const cat = JSON.parse(readFileSync('public/catalog.json', 'utf8'));
  expect(cat.version).toBe(2);
  expect(cat.items.length).toBe(11);
  expect(readFileSync('public/llms.txt', 'utf8')).toContain('K242292');
  const mock = JSON.parse(readFileSync('public/mock/capabilities.json', 'utf8'));
  expect(mock.length).toBe(11);
});
