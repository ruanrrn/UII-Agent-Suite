// src/data/capabilities.ts —— 唯一数据源
// 当前仅录入中文/英文名称与图标，其余字段留空，后续补充。
import type { Capability } from '@/types/capability';

const empty = { zh: '', en: '' };

// 占位的空 i18n（除标题外其余留空）
const blankI18n = (title: { zh: string; en: string }) => ({
  title,
  tagline: { ...empty },
  description: { ...empty },
  clinicalUse: { ...empty },
  overview: { ...empty }
});

// 空 MCP 规格（后续补充 tools/prompts/resources）
const blankMcp = (serverKey: string) => ({
  serverKey,
  endpointUrl: `https://hub.uii-ai.example/mcp/${serverKey}`,
  tools: [],
  prompts: [],
  resources: []
});

export const CAPABILITIES: Capability[] = [
  {
    id: 'easy-triage-rib',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Easy-Triage-System(RiB).png',
    fda: null,
    mcp: blankMcp('easy-triage-rib'),
    i18n: blankI18n({
      zh: '智能危急预警系统 - 肋骨骨折检测',
      en: 'AI-Assisted Easy Triage System - Rib'
    })
  },
  {
    id: 'easy-triage-ich',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Triage-System-ICH.png',
    fda: null,
    mcp: blankMcp('easy-triage-ich'),
    i18n: blankI18n({
      zh: '智能危急预警系统 - 颅内出血检测',
      en: 'AI-Assisted Easy Triage System - ICH'
    })
  },
  {
    id: 'bony-thorax-fractures',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Bony-Thorax-Fractures.png',
    fda: null,
    mcp: blankMcp('bony-thorax-fractures'),
    i18n: blankI18n({
      zh: 'CT 胸部骨折智能分析系统',
      en: 'AI-Assisted Analysis System for Bony Thorax Fractures'
    })
  },
  {
    id: 'aortic-dissection',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Aortic-Dissection.png',
    fda: null,
    mcp: blankMcp('aortic-dissection'),
    i18n: blankI18n({
      zh: 'CT 主动脉智能分析系统',
      en: 'AI-Assisted Analysis System for Aortic Dissection'
    })
  },
  {
    id: 'cerebral-carotid-vessels',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Cerebral-and-Carotid-Vessels.png',
    fda: null,
    mcp: blankMcp('cerebral-carotid-vessels'),
    i18n: blankI18n({
      zh: 'CT头颈血管智能分析系统',
      en: 'AI-Assisted Analysis System for Cerebral and Carotid Vessels'
    })
  },
  {
    id: 'coronary-cta',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Coronary-CTA-Imaging.png',
    fda: null,
    mcp: blankMcp('coronary-cta'),
    i18n: blankI18n({
      zh: 'CT 冠脉智能分析系统',
      en: 'AI-Assisted Analysis System for Coronary CTA Imaging'
    })
  },
  {
    id: 'lower-extremity-cta',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Lower-Extremity-CTA-Imaging.png',
    fda: null,
    mcp: blankMcp('lower-extremity-cta'),
    i18n: blankI18n({
      zh: 'CT 下肢血管智能评估系统',
      en: 'AI-Assisted Analysis System for Lower Extremity CTA Imaging'
    })
  },
  {
    id: 'intracerebral-hemorrhage',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Intracerebral-Hemorrhage.png',
    fda: null,
    mcp: blankMcp('intracerebral-hemorrhage'),
    i18n: blankI18n({
      zh: 'CT 颅内出血智能分析系统',
      en: 'AI-Assisted Analysis System for Intracerebral Hemorrhage'
    })
  }
];
