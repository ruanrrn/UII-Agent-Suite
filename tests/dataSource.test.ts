import { test, expect, vi, beforeEach } from 'vitest';
import { MockDataSource } from '@/services/mockDataSource';
import { CAPABILITIES } from '@/data/capabilities';
import { CONSOLE_OVERVIEW } from '@/data/console';

beforeEach(() => {
  globalThis.fetch = vi.fn(async (url: any) => {
    const u = String(url);
    const body = u.includes('console') ? CONSOLE_OVERVIEW : CAPABILITIES;
    return { ok: true, json: async () => body } as Response;
  });
});

test('listCapabilities returns all', async () => {
  const ds = new MockDataSource('/');
  expect((await ds.listCapabilities()).length).toBe(9);
});
test('getCapability by id, null when missing', async () => {
  const ds = new MockDataSource('/');
  expect((await ds.getCapability('coronary-cta'))?.id).toBe('coronary-cta');
  expect(await ds.getCapability('nope')).toBeNull();
});
test('getConsoleOverview', async () => {
  const ds = new MockDataSource('/');
  expect((await ds.getConsoleOverview()).activated).toBeGreaterThan(0);
});
