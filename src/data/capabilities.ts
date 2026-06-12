// src/data/capabilities.ts —— 唯一数据源
// 目录对应 uAI Portal（FDA 510(k) · K240411）对外暴露的五个血管/心脏 CT 分析应用。
// FDA 信息真实可查（K 号 → fdaPdfUrl 推导官方 PDF）；
// MCP tools/prompts/resources 为预览数据，真实 schema 随服务版本提供。
// 来源：FDA 510(k) K240411 Summary (accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf)。
import type {
  Capability,
  FdaInfo,
  McpToolSpec,
  McpPromptSpec,
  McpResourceSpec
} from '@/types/capability';

// uAI Portal 单一器械，五个应用共用同一 510(k) 获批
const FDA_K240411: FdaInfo = {
  kNumber: 'K240411',
  decisionDate: '2024-09-06',
  productCode: 'QIH, LLZ',
  productCodeName: 'Medical Image Management and Processing System (21 CFR 892.2050)',
  applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
};

// 各应用通用的 MCP 工具（图像浏览/编辑、状态、报告、归档）
const commonTools = (): McpToolSpec[] => [
  {
    name: 'list_studies',
    desc: { zh: '列出与筛选已接入的检查', en: 'List and filter ingested studies' },
    input: 'application?: AppName · date_from? · date_to? · status?',
    returns: 'StudySummary[]'
  },
  {
    name: 'get_processing_status',
    desc: { zh: '查询某检查的处理状态', en: 'Query the processing state for a study' },
    input: 'study_uid: string',
    returns: 'ProcessingStatus'
  },
  {
    name: 'get_structured_report',
    desc: { zh: '获取某检查的结构化报告', en: 'Fetch the structured report for a study' },
    input: 'study_uid: string · format?: "json"|"pdf"',
    returns: 'ReportDoc'
  },
  {
    name: 'edit_centerline',
    desc: {
      zh: '提交医师对中心线/分割的修正并重新测量',
      en: 'Submit physician corrections to centerline/segmentation and re-run measurement'
    },
    input: 'study_uid: string · corrections: CenterlineEdit[]',
    returns: 'AnalysisResult'
  },
  {
    name: 'export_to_pacs',
    desc: { zh: '结果归档或送至胶片', en: 'Archive results or send to filming' },
    input: 'study_uid: string · target: "pacs"|"filming"',
    returns: 'ExportReceipt'
  }
];

// 编排上述工具的可复用提示词模板
const PROMPT_TRIAGE_CHEST_PAIN: McpPromptSpec = {
  name: 'triage_acute_chest_pain',
  desc: {
    zh: '识别模态并以 stat 优先级调用对应分析器，概述血管重建状态与关键测量，附 JSON 报告并注明需医师确认',
    en: 'Detect modality and call the matching analyzer at stat priority; summarize vessel reconstruction and key measurements, attach the JSON report, and flag for physician confirmation'
  },
  args: 'study_uid: string'
};
const PROMPT_GENERATE_REPORT: McpPromptSpec = {
  name: 'generate_vascular_report',
  desc: {
    zh: '获取结构化报告并撰写与应用相符的简明报告：重建解剖、关键测量与标注的狭窄/腔径；说明为测量/可视化辅助而非诊断',
    en: 'Fetch the structured report and write a concise, application-specific report: reconstructed anatomy, key measurements, and flagged stenosis/diameters; states it is a measurement/visualization aid, not a diagnosis'
  },
  args: 'study_uid: string · language?: string'
};
const PROMPT_BATCH_QC: McpPromptSpec = {
  name: 'batch_qc_review',
  desc: {
    zh: '对指定日期调用 list_studies，概述各检查分割状态，挑出 error 状态或测量异常者供医师复核',
    en: 'Call list_studies for a date, summarize segmentation status per study, and surface error states or out-of-range measurements for physician review'
  },
  args: 'date: string'
};

// 服务暴露的只读上下文资源
const commonResources = (): McpResourceSpec[] => [
  {
    uri: 'fda://K240411',
    desc: {
      zh: '获批函与 510(k) 摘要（uAI Portal，Class II，QIH/LLZ）',
      en: 'Clearance letter & 510(k) summary (uAI Portal, Class II, QIH/LLZ)'
    }
  },
  {
    uri: 'doc://ifu/uai-portal',
    desc: { zh: '获批预期用途与各应用范围', en: 'Cleared intended use & per-application scope' }
  },
  {
    uri: 'doc://validation/dice-metrics',
    desc: {
      zh: '各应用 Dice 指标与亚组分析',
      en: 'Per-application Dice metrics & subgroup analysis'
    }
  }
];

export const CAPABILITIES: Capability[] = [
  {
    id: 'uai-coronary-analysis',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '❤️',
    series: 'uAI Portal',
    fda: FDA_K240411,
    mcp: {
      serverKey: 'uai-portal-coronary',
      endpointUrl: 'https://hub.uii-ai.example/mcp/uai-portal/coronary',
      tools: [
        {
          name: 'analyze_coronary_cta',
          desc: {
            zh: '提交一例 CCTA 检查；执行心脏与冠脉分割、中心线提取与狭窄测量',
            en: 'Submit a CCTA study; runs heart & coronary segmentation, centerline extraction, and stenosis measurement'
          },
          input: 'study_uid: string · priority?: "routine"|"stat"',
          returns: 'CoronaryFindings'
        },
        ...commonTools()
      ],
      prompts: [PROMPT_TRIAGE_CHEST_PAIN, PROMPT_GENERATE_REPORT],
      resources: commonResources()
    },
    i18n: {
      title: { zh: '冠脉分析', en: 'Coronary Analysis' },
      tagline: { zh: '冠脉 CTA 分割与狭窄测量', en: 'CCTA segmentation & stenosis measurement' },
      description: {
        zh: '对冠脉 CTA(CCTA) 进行 AI 自动分割与重建，提取心脏与冠脉中心线，支持狭窄测量与多视图可视化',
        en: 'AI auto-segmentation and reconstruction for coronary CTA (CCTA) — extracts heart and coronary centerlines and supports stenosis measurement and multi-view visualization'
      },
      clinicalUse: {
        zh: '冠脉 CTA 的血管重建、中心线提取与狭窄测量（查看/测量辅助，非诊断）',
        en: 'Vessel reconstruction, centerline extraction and stenosis measurement for CCTA (viewing/measurement aid, not diagnosis)'
      },
      overview: {
        zh: '将 uAI Portal「冠脉分析」应用封装为标准 MCP 服务：自动分割心脏与冠脉(LM/LAD/LCX/RCA)、提取中心线并测量狭窄，输出结构化结果供医师审阅（验证 Dice：冠脉 0.920、心脏 0.980）',
        en: 'Wraps the uAI Portal Coronary Analysis app as a standard MCP service: segments heart and coronary vessels (LM/LAD/LCX/RCA), extracts centerlines, and measures stenosis — structured outputs for physician review (validation Dice: coronary 0.920, heart 0.980)'
      }
    }
  },

  {
    id: 'uai-aorta-analysis',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🩸',
    series: 'uAI Portal',
    fda: FDA_K240411,
    mcp: {
      serverKey: 'uai-portal-aorta',
      endpointUrl: 'https://hub.uii-ai.example/mcp/uai-portal/aorta',
      tools: [
        {
          name: 'analyze_aortic_cta',
          desc: {
            zh: '提交一例主动脉 CTA 检查；执行主干与分支分割、中心线提取与腔径测量',
            en: 'Submit an aortic CTA study; runs trunk & branch segmentation, centerline extraction, and lumen-diameter measurement'
          },
          input: 'study_uid: string · priority?: "routine"|"stat"',
          returns: 'AorticFindings'
        },
        ...commonTools()
      ],
      prompts: [PROMPT_TRIAGE_CHEST_PAIN, PROMPT_GENERATE_REPORT],
      resources: commonResources()
    },
    i18n: {
      title: { zh: '主动脉分析', en: 'Aorta Analysis' },
      tagline: {
        zh: '主动脉 CTA 分割与腔径测量',
        en: 'Aorta CTA segmentation & lumen measurement'
      },
      description: {
        zh: '对主动脉 CTA 进行 AI 自动分割与重建，提取主干与分支中心线，支持腔径测量与多视图可视化',
        en: 'AI auto-segmentation and reconstruction for aortic CTA — extracts trunk and branch centerlines and supports lumen-diameter measurement and multi-view visualization'
      },
      clinicalUse: {
        zh: '主动脉 CTA 的主干/分支重建、中心线提取与腔径测量（查看/测量辅助，非诊断）',
        en: 'Trunk/branch reconstruction, centerline extraction and lumen-diameter measurement for aortic CTA (viewing/measurement aid, not diagnosis)'
      },
      overview: {
        zh: '将 uAI Portal「主动脉分析」应用封装为标准 MCP 服务：自动分割主动脉主干与分支、提取中心线并测量腔径，输出结构化结果供医师审阅（验证 Dice：主干 0.946、分支 0.846）',
        en: 'Wraps the uAI Portal Aorta Analysis app as a standard MCP service: segments aortic trunk and branches, extracts centerlines, and measures lumen diameter — structured outputs for physician review (validation Dice: trunk 0.946, branches 0.846)'
      }
    }
  },

  {
    id: 'uai-pulmonary-analysis',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '💨',
    series: 'uAI Portal',
    fda: FDA_K240411,
    mcp: {
      serverKey: 'uai-portal-pulmonary',
      endpointUrl: 'https://hub.uii-ai.example/mcp/uai-portal/pulmonary',
      tools: [
        {
          name: 'analyze_pulmonary_cta',
          desc: {
            zh: '提交一例 CTPA 检查；执行动/静脉分割、中心线提取与测量',
            en: 'Submit a CTPA study; runs artery/vein segmentation, centerline extraction, and measurement'
          },
          input: 'study_uid: string · priority?: "routine"|"stat"',
          returns: 'PulmonaryFindings'
        },
        ...commonTools()
      ],
      prompts: [PROMPT_TRIAGE_CHEST_PAIN, PROMPT_GENERATE_REPORT],
      resources: commonResources()
    },
    i18n: {
      title: { zh: '肺动脉分析', en: 'Pulmonary Artery Analysis' },
      tagline: { zh: '肺动脉 CTPA 分割与测量', en: 'CTPA segmentation & measurement' },
      description: {
        zh: '对肺动脉 CTA(CTPA) 进行 AI 自动分割与重建，提取动/静脉中心线并支持测量与多视图可视化',
        en: 'AI auto-segmentation and reconstruction for pulmonary CTA (CTPA) — extracts artery/vein centerlines and supports measurement and multi-view visualization'
      },
      clinicalUse: {
        zh: '肺动脉 CTPA 的动/静脉重建、中心线提取与测量（查看/测量辅助，非诊断）',
        en: 'Artery/vein reconstruction, centerline extraction and measurement for CTPA (viewing/measurement aid, not diagnosis)'
      },
      overview: {
        zh: '将 uAI Portal「肺动脉分析」应用封装为标准 MCP 服务：自动分割肺动脉与肺静脉、提取中心线并测量，输出结构化结果供医师审阅（验证 Dice：动脉 0.953、静脉 0.933）',
        en: 'Wraps the uAI Portal Pulmonary Artery Analysis app as a standard MCP service: segments pulmonary arteries and veins, extracts centerlines, and measures — structured outputs for physician review (validation Dice: arteries 0.953, veins 0.933)'
      }
    }
  },

  {
    id: 'uai-head-neck-analysis',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🧠',
    series: 'uAI Portal',
    fda: FDA_K240411,
    mcp: {
      serverKey: 'uai-portal-head-neck',
      endpointUrl: 'https://hub.uii-ai.example/mcp/uai-portal/head-neck',
      tools: [
        {
          name: 'analyze_head_neck_cta',
          desc: {
            zh: '提交一例头颈 CTA 检查；执行血管与骨分割、中心线提取与测量',
            en: 'Submit a head & neck CTA study; runs vessel & bone segmentation, centerline extraction, and measurement'
          },
          input: 'study_uid: string',
          returns: 'HeadNeckFindings'
        },
        ...commonTools()
      ],
      prompts: [PROMPT_GENERATE_REPORT, PROMPT_BATCH_QC],
      resources: commonResources()
    },
    i18n: {
      title: { zh: '头颈血管分析', en: 'Head and Neck Vessel Analysis' },
      tagline: { zh: '头颈 CTA 血管/骨分割与测量', en: 'Head & neck CTA vessel/bone segmentation' },
      description: {
        zh: '对头颈 CTA 进行 AI 自动分割与重建，分离血管与骨、提取中心线并支持测量与多视图可视化',
        en: 'AI auto-segmentation and reconstruction for head & neck CTA — separates vessel and bone, extracts centerlines and supports measurement and multi-view visualization'
      },
      clinicalUse: {
        zh: '头颈 CTA 的血管/骨分离、中心线提取与测量（查看/测量辅助，非诊断）',
        en: 'Vessel/bone separation, centerline extraction and measurement for head & neck CTA (viewing/measurement aid, not diagnosis)'
      },
      overview: {
        zh: '将 uAI Portal「头颈血管分析」应用封装为标准 MCP 服务：自动分割头颈血管与骨、提取中心线并测量，输出结构化结果供医师审阅（验证 Dice：头部血管 0.902、颈部血管 0.967）',
        en: 'Wraps the uAI Portal Head & Neck Vessel Analysis app as a standard MCP service: segments head/neck vessels and bone, extracts centerlines, and measures — structured outputs for physician review (validation Dice: head vessels 0.902, neck vessels 0.967)'
      }
    }
  },

  {
    id: 'uai-lower-extremity-analysis',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🦵',
    series: 'uAI Portal',
    fda: FDA_K240411,
    mcp: {
      serverKey: 'uai-portal-lower-extremity',
      endpointUrl: 'https://hub.uii-ai.example/mcp/uai-portal/lower-extremity',
      tools: [
        {
          name: 'analyze_lower_extremity_cta',
          desc: {
            zh: '提交一例下肢 CTA 检查；执行血管与骨分割、中心线提取、ROI 与狭窄测量',
            en: 'Submit a lower-extremity CTA study; runs vessel & bone segmentation, centerline extraction, ROI, and stenosis measurement'
          },
          input: 'study_uid: string',
          returns: 'LowerExtremityFindings'
        },
        ...commonTools()
      ],
      prompts: [PROMPT_GENERATE_REPORT, PROMPT_BATCH_QC],
      resources: commonResources()
    },
    i18n: {
      title: { zh: '下肢血管分析', en: 'Lower Extremity Vessel Analysis' },
      tagline: {
        zh: '下肢 CTA 血管/骨分割与狭窄测量',
        en: 'Lower-extremity CTA vessel/bone segmentation'
      },
      description: {
        zh: '对下肢 CTA 进行 AI 自动分割与重建，分离血管与骨、提取中心线并支持 ROI 与狭窄测量',
        en: 'AI auto-segmentation and reconstruction for lower-extremity CTA — separates vessel and bone, extracts centerlines and supports ROI and stenosis measurement'
      },
      clinicalUse: {
        zh: '下肢 CTA 的血管/骨分离、中心线提取、ROI 与狭窄测量（查看/测量辅助，非诊断）',
        en: 'Vessel/bone separation, centerline extraction, ROI and stenosis measurement for lower-extremity CTA (viewing/measurement aid, not diagnosis)'
      },
      overview: {
        zh: '将 uAI Portal「下肢血管分析」应用封装为标准 MCP 服务：自动分割下肢血管与骨、提取中心线，支持 ROI 与狭窄测量，输出结构化结果供医师审阅（验证 Dice：动脉 0.892）',
        en: 'Wraps the uAI Portal Lower Extremity Vessel Analysis app as a standard MCP service: segments lower-extremity vessels and bone, extracts centerlines, supports ROI and stenosis measurement — structured outputs for physician review (validation Dice: arteries 0.892)'
      }
    }
  }
];
