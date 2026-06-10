import type { DataSource } from './dataSource';
import { MockDataSource } from './mockDataSource';
import { HttpDataSource } from './httpDataSource';

export function createDataSource(): DataSource {
  const base = import.meta.env.BASE_URL;
  if (import.meta.env.VITE_DATA === 'api')
    return new HttpDataSource(import.meta.env.VITE_API_BASE || '');
  return new MockDataSource(base);
}
export type { DataSource };
