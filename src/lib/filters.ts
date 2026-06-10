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
  const needle = (q || '').trim().toLowerCase();
  return caps.filter(c => {
    if (type && c.type !== type) return false;
    if (modality && c.modality !== modality) return false;
    if (needle) {
      const hay = [c.id, JSON.stringify(c.i18n), c.fda?.kNumber, c.modality]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}
