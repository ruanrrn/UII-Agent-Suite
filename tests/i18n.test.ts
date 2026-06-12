import { test, expect } from 'vitest';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

test('zh and en have identical key sets', () => {
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
});
test('no empty values', () => {
  for (const [k, v] of Object.entries(zh)) expect(v, `zh.${k}`).toBeTruthy();
  for (const [k, v] of Object.entries(en)) expect(v, `en.${k}`).toBeTruthy();
});
test('core keys present', () => {
  for (const k of [
    'nav.market',
    'nav.how',
    'nav.console',
    'cta.browse',
    'hero.title',
    'badge.fda',
    'detail.tab.config',
    'filter.modality'
  ]) {
    expect(zh).toHaveProperty(k);
    expect(en).toHaveProperty(k);
  }
});
