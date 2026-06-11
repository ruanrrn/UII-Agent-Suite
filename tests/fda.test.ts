import { test, expect } from 'vitest';
import { fdaPdfUrl } from '@/lib/fda';

test('builds official accessdata PDF url from K-number', () => {
  expect(fdaPdfUrl('K240411')).toBe('https://www.accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf');
  expect(fdaPdfUrl('K193271')).toBe('https://www.accessdata.fda.gov/cdrh_docs/pdf19/K193271.pdf');
});
