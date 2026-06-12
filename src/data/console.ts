// src/data/console.ts —— 控制台数据（从 FDA 能力派生前 5 个"已开通"）
import type { ConsoleOverview } from '@/types/capability';
import { CAPABILITIES } from '@/data/capabilities';

const fdaCaps = CAPABILITIES.filter(c => c.fda).slice(0, 5);

// 各服务开通日期（用于计算"已使用天数"）
const ACTIVATED_AT = ['2025-08-15', '2025-09-20', '2025-11-05', '2026-01-10', '2026-03-01'];

export const CONSOLE_OVERVIEW: ConsoleOverview = {
  activated: fdaCaps.length,
  callsThisMonth: '128k',
  services: fdaCaps.map((c, i) => {
    const expiring = i === fdaCaps.length - 1;
    return {
      id: c.id,
      title: c.i18n.title,
      modality: c.modality,
      kNumber: c.fda!.kNumber,
      status: expiring ? 'expiring' : 'online',
      activatedAt: ACTIVATED_AT[i] ?? '2025-09-01',
      expires: expiring ? '2026-06-30' : '2027-01-01'
    };
  })
};
