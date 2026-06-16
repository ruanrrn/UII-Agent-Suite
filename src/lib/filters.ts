// src/lib/filters.ts
import type { Capability, CapType, Modality } from '@/types/capability';

export interface FilterState {
  q?: string;
  type?: CapType | '';
  modality?: Modality | '';
}

export function filterCapabilities(
  caps: Capability[],
  { q, type, modality }: FilterState
): Capability[] {
  const needle = normalizeSearch(q || '');
  return caps.filter(c => {
    if (type && c.type !== type) return false;
    if (modality && c.modality !== modality) return false;
    if (needle) {
      const names = [c.i18n.title.zh, c.i18n.title.en, c.i18n.tagline.zh, c.i18n.tagline.en, c.id]
        .filter(Boolean)
        .map(normalizeSearch);
      if (!names.some(name => fuzzyIncludes(name, needle))) return false;
    }
    return true;
  });
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  if (haystack.includes(needle)) return true;
  let cursor = 0;
  for (const ch of needle) {
    cursor = haystack.indexOf(ch, cursor);
    if (cursor === -1) return false;
    cursor += 1;
  }
  return true;
}
