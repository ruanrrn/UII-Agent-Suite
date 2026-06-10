// src/data/console.ts —— 伪控制台演示数据（假数据，从 FDA 能力派生前 5 个"已开通"）
import type { ConsoleOverview } from '@/types/capability';
import { CAPABILITIES } from '@/data/capabilities';

const fdaCaps = CAPABILITIES.filter(c => c.fda).slice(0, 5);

export const CONSOLE_OVERVIEW: ConsoleOverview = {
  activated: fdaCaps.length,
  callsThisMonth: '128k',
  services: fdaCaps.map((c, i) => ({
    id: c.id,
    title: c.i18n.title,
    modality: c.modality,
    kNumber: c.fda!.kNumber,
    status: i === fdaCaps.length - 1 ? 'expiring' : 'online'
  }))
};
