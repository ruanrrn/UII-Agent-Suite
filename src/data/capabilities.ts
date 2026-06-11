// src/data/capabilities.ts —— 唯一数据源
// FDA 信息均为真实可查（K 号 → fdaPdfUrl 推导官方 PDF）；
// MCP tools/prompts/resources 为概念示例（demo），真实 schema 随服务版本提供。
import type { Capability } from '@/types/capability';

export const CAPABILITIES: Capability[] = [
  {
    id: 'uai-discover-aortic-dissection',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🫀',
    series: 'uAI Discover',
    fda: {
      kNumber: 'K240411',
      decisionDate: '2024-09-06',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    mcp: {
      serverKey: 'uai-aortic',
      endpointUrl: 'https://hub.uii-ai.example/mcp/aortic-dissection',
      tools: [
        {
          name: 'analyze_aortic_cta',
          desc: {
            zh: '提交一例主动脉 CTA 研究，运行夹层检测、Stanford 分型与真假腔分割测量。',
            en: 'Submit an aortic CTA study; runs dissection detection, Stanford typing, and true/false lumen segmentation & measurement.'
          },
          input: 'study_uid: string · priority?: "routine"|"stat"',
          returns: 'AorticFindings'
        },
        {
          name: 'get_structured_report',
          desc: {
            zh: '获取指定研究的结构化报告。',
            en: 'Fetch the structured report for a study.'
          },
          input: 'study_uid: string · format?: "json"|"pdf"',
          returns: 'ReportDoc'
        },
        {
          name: 'get_triage_status',
          desc: {
            zh: '查询某研究的分诊优先级与处理状态。',
            en: 'Query triage priority and processing status for a study.'
          },
          input: 'study_uid: string',
          returns: 'TriageStatus'
        }
      ],
      prompts: [
        {
          name: 'draft_aortic_report',
          desc: {
            zh: '基于分析结果生成放射报告草稿，供医师审阅修改。',
            en: 'Draft a radiology report from analysis results for physician review.'
          },
          args: 'study_uid: string'
        },
        {
          name: 'explain_findings',
          desc: {
            zh: '用通俗语言解释夹层分型与关键测量，辅助医患沟通。',
            en: 'Explain dissection typing and key measurements in plain language.'
          },
          args: 'study_uid: string'
        }
      ],
      resources: [
        {
          uri: 'schema://aortic/report',
          desc: { zh: '结构化报告的 JSON Schema。', en: 'JSON Schema of the structured report.' }
        },
        {
          uri: 'report://aortic/{study_uid}',
          desc: {
            zh: '某次检查生成的结构化报告（按 study 读取）。',
            en: 'Structured report for a given study.'
          }
        },
        {
          uri: 'sample://aortic/demo-study',
          desc: {
            zh: '脱敏演示数据集，用于联调验证。',
            en: 'De-identified demo dataset for integration tests.'
          }
        }
      ]
    },
    i18n: {
      title: {
        zh: 'CT 主动脉智能分析系统',
        en: 'AI-Assisted Analysis System for Aortic Dissection'
      },
      tagline: { zh: '主动脉夹层 CT 智能分析', en: 'Aortic dissection CTA analysis' },
      description: {
        zh: '辅助分析主动脉 CTA，自动检测主动脉夹层、定位关键解剖标志并量化真假腔管径，为危急病例提供分诊提示。',
        en: 'Assists aortic CTA analysis — automatically detects aortic dissection, localizes key anatomical landmarks, quantifies true/false lumen diameters, and provides triage alerts for critical cases.'
      },
      clinicalUse: {
        zh: '急诊 / 血管外科的主动脉夹层快速识别与术前评估。',
        en: 'Rapid aortic dissection identification and pre-op assessment for ED / vascular surgery.'
      },
      overview: {
        zh: '将"主动脉夹层 CT 智能分析"封装为标准 MCP 服务：对外提供主动脉夹层的自动检测、Stanford 分型、真假腔分割与管径测量，并产出结构化报告与分诊提示。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps aortic-dissection CTA analysis as a standard MCP service: automatic dissection detection, Stanford classification, true/false lumen segmentation and diameter measurement, producing structured reports and triage alerts. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'uai-easy-triage-ich',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🧠',
    series: 'uAI EasyTriage',
    fda: {
      kNumber: 'K242292',
      decisionDate: '2024-09-24',
      productCode: 'QAS',
      productCodeName: 'Radiological Computer-Assisted Triage and Notification Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    mcp: {
      serverKey: 'uai-ich-triage',
      endpointUrl: 'https://hub.uii-ai.example/mcp/ich-triage',
      tools: [
        {
          name: 'detect_ich',
          desc: {
            zh: '提交一例非增强头颅 CT，检测疑似颅内出血并标记优先级。',
            en: 'Submit a non-contrast head CT; detects suspected ICH and flags priority.'
          },
          input: 'study_uid: string · priority?: "routine"|"stat"',
          returns: 'IchFindings'
        },
        {
          name: 'get_triage_status',
          desc: {
            zh: '查询某研究的分诊优先级与处理状态。',
            en: 'Query triage priority and processing status for a study.'
          },
          input: 'study_uid: string',
          returns: 'TriageStatus'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'uAI Easy Triage ICH', en: 'uAI Easy Triage ICH' },
      tagline: { zh: '颅内出血 CT 智能分诊', en: 'Intracranial hemorrhage CT triage' },
      description: {
        zh: '分析非增强头颅 CT，自动检测疑似颅内出血(ICH)并在工作列表中提示优先级，辅助分诊。',
        en: 'Analyzes non-contrast head CT to detect suspected intracranial hemorrhage (ICH) and flag worklist prioritization for triage.'
      },
      clinicalUse: {
        zh: '急诊 / 卒中通道的 ICH 优先级提醒（CADt）。',
        en: 'ICH prioritization & notification for ED / stroke pathways (CADt).'
      },
      overview: {
        zh: '将"颅内出血 CT 智能分诊"封装为标准 MCP 服务：自动检测非增强头颅 CT 中的疑似颅内出血，并输出工作列表优先级提示。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps ICH CT triage as a standard MCP service: automatically detects suspected intracranial hemorrhage on non-contrast head CT and emits worklist prioritization. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'uai-easytriage-rib',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🦴',
    series: 'uAI EasyTriage',
    fda: {
      kNumber: 'K193271',
      decisionDate: '2021-01-15',
      productCode: 'QFM',
      productCodeName: 'Radiological Computer-Aided Prioritization Software for Lesions',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    mcp: {
      serverKey: 'uai-rib-triage',
      endpointUrl: 'https://hub.uii-ai.example/mcp/rib-triage',
      tools: [
        {
          name: 'detect_rib_fractures',
          desc: {
            zh: '提交一例胸部 CT，检测肋骨骨折并标注优先级。',
            en: 'Submit a chest CT; detects rib fractures and assigns prioritization.'
          },
          input: 'study_uid: string',
          returns: 'RibFindings'
        },
        {
          name: 'get_priority_list',
          desc: {
            zh: '获取按优先级排序的待阅片列表。',
            en: 'Fetch the priority-ordered reading worklist.'
          },
          input: 'date?: string',
          returns: 'PriorityList'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'uAI EasyTriage-Rib', en: 'uAI EasyTriage-Rib' },
      tagline: { zh: '肋骨骨折 CT 智能优先级', en: 'Rib fracture CT prioritization' },
      description: {
        zh: '检测胸部 CT 上的肋骨骨折并标注优先级，辅助阅片排序。',
        en: 'Detects rib fractures on chest CT and assigns prioritization to assist reading order.'
      },
      clinicalUse: {
        zh: '创伤 / 急诊胸部 CT 的病灶优先级（CAD）。',
        en: 'Lesion prioritization for trauma / ED chest CT (CAD).'
      },
      overview: {
        zh: '将"肋骨骨折 CT 智能优先级"封装为标准 MCP 服务：自动检测胸部 CT 中的肋骨骨折并输出阅片优先级排序。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps rib-fracture CT prioritization as a standard MCP service: automatically detects rib fractures on chest CT and emits reading-order prioritization. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'uai-portal',
    type: 'platform',
    modality: 'Cross',
    icon: '🧩',
    series: 'uAI',
    fda: {
      kNumber: 'K240411',
      decisionDate: '2024-09-06',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    mcp: {
      serverKey: 'uai-portal',
      endpointUrl: 'https://hub.uii-ai.example/mcp/portal',
      tools: [
        {
          name: 'process_study',
          desc: {
            zh: '提交一例影像研究，运行自动化处理管线。',
            en: 'Submit an imaging study to run the automated processing pipeline.'
          },
          input: 'study_uid: string · pipeline?: string',
          returns: 'ProcessResult'
        },
        {
          name: 'list_ai_results',
          desc: {
            zh: '列出某研究的可用 AI 处理结果。',
            en: 'List available AI processing results for a study.'
          },
          input: 'study_uid: string',
          returns: 'AiResult[]'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'uAI Portal', en: 'uAI Portal' },
      tagline: { zh: 'AI 影像处理平台', en: 'AI image-processing platform' },
      description: {
        zh: '自动化放射影像处理与 AI 应用承载平台。',
        en: 'Automated radiological image processing and an AI application hosting platform.'
      },
      clinicalUse: {
        zh: '院内多模态影像的自动化 AI 处理底座。',
        en: 'In-house automated AI processing base for multi-modality imaging.'
      },
      overview: {
        zh: '将"uAI Portal 影像处理平台"封装为标准 MCP 服务：对外提供自动化放射影像处理与 AI 应用承载能力。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps the uAI Portal platform as a standard MCP service: automated radiological image processing and AI application hosting. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'uomnispace-ct',
    type: 'platform',
    modality: 'CT',
    icon: '🖥️',
    series: 'uOmnispace',
    fda: {
      kNumber: 'K233209',
      decisionDate: '2024-05-17',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'uomnispace-ct',
      endpointUrl: 'https://hub.uii-ai.example/mcp/omnispace-ct',
      tools: [
        {
          name: 'postprocess_ct_study',
          desc: {
            zh: '对一例 CT 研究运行 AI 后处理与高级可视化。',
            en: 'Run AI post-processing and advanced visualization on a CT study.'
          },
          input: 'study_uid: string · preset?: string',
          returns: 'PostProcessResult'
        },
        {
          name: 'get_processed_series',
          desc: {
            zh: '获取后处理生成的影像序列。',
            en: 'Fetch the post-processed image series.'
          },
          input: 'study_uid: string',
          returns: 'SeriesRef[]'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'uOmnispace.CT', en: 'uOmnispace.CT' },
      tagline: { zh: 'CT 影像 AI 后处理', en: 'CT AI post-processing' },
      description: {
        zh: 'CT 影像的 AI 后处理与高级可视化软件。',
        en: 'AI post-processing and advanced visualization software for CT.'
      },
      clinicalUse: {
        zh: 'CT 阅片的后处理工作站软件。',
        en: 'Post-processing workstation software for CT reading.'
      },
      overview: {
        zh: '将"uOmnispace.CT 后处理"封装为标准 MCP 服务：对外提供 CT 影像的 AI 后处理与高级可视化。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps uOmnispace.CT post-processing as a standard MCP service: AI post-processing and advanced visualization for CT. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'uomnispace-mr',
    type: 'platform',
    modality: 'MR',
    icon: '🖥️',
    series: 'uOmnispace',
    fda: {
      kNumber: 'K233186',
      decisionDate: '2024-04-17',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'uomnispace-mr',
      endpointUrl: 'https://hub.uii-ai.example/mcp/omnispace-mr',
      tools: [
        {
          name: 'postprocess_mr_study',
          desc: {
            zh: '对一例 MR 研究运行 AI 后处理与高级可视化。',
            en: 'Run AI post-processing and advanced visualization on an MR study.'
          },
          input: 'study_uid: string · preset?: string',
          returns: 'PostProcessResult'
        },
        {
          name: 'get_processed_series',
          desc: {
            zh: '获取后处理生成的影像序列。',
            en: 'Fetch the post-processed image series.'
          },
          input: 'study_uid: string',
          returns: 'SeriesRef[]'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'uOmnispace.MR', en: 'uOmnispace.MR' },
      tagline: { zh: 'MR 影像 AI 后处理', en: 'MR AI post-processing' },
      description: {
        zh: 'MR 影像的 AI 后处理与高级可视化软件（另见 K253077）。',
        en: 'AI post-processing and advanced visualization software for MR (see also K253077).'
      },
      clinicalUse: {
        zh: 'MR 阅片的后处理工作站软件。',
        en: 'Post-processing workstation software for MR reading.'
      },
      overview: {
        zh: '将"uOmnispace.MR 后处理"封装为标准 MCP 服务：对外提供 MR 影像的 AI 后处理与高级可视化。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps uOmnispace.MR post-processing as a standard MCP service: AI post-processing and advanced visualization for MR. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'hyper-dlr',
    type: 'reconstruction',
    modality: 'PET',
    icon: '✨',
    series: 'HYPER',
    fda: {
      kNumber: 'K193210',
      decisionDate: '2020-08-04',
      productCode: 'KPS',
      productCodeName: 'Cleared within PET/CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'hyper-dlr',
      endpointUrl: 'https://hub.uii-ai.example/mcp/hyper-dlr',
      tools: [
        {
          name: 'denoise_pet_series',
          desc: {
            zh: '对 FDG-PET 序列运行深度学习降噪。',
            en: 'Run deep-learning denoising on an FDG-PET series.'
          },
          input: 'series_uid: string',
          returns: 'JobRef'
        },
        {
          name: 'get_enhanced_series',
          desc: {
            zh: '获取增强重建后的影像序列。',
            en: 'Fetch the enhanced reconstructed series.'
          },
          input: 'job_id: string',
          returns: 'SeriesRef'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'HYPER DLR', en: 'HYPER DLR' },
      tagline: { zh: 'PET 深度学习降噪重建', en: 'PET deep-learning denoising' },
      description: {
        zh: '用预训练神经网络降低 FDG-PET 图像噪声、提升信噪比（随影像系统获批）。',
        en: 'Uses a pretrained neural network to reduce FDG-PET noise and improve SNR (cleared within the imaging system).'
      },
      clinicalUse: {
        zh: '分子影像 PET 的深度学习重建增强。',
        en: 'Deep-learning reconstruction enhancement for molecular PET.'
      },
      overview: {
        zh: '将"HYPER DLR 降噪重建"封装为标准 MCP 服务：对 FDG-PET 序列运行深度学习降噪、提升信噪比。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps HYPER DLR denoising as a standard MCP service: deep-learning denoising for FDG-PET series with improved SNR. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'deep-recon',
    type: 'reconstruction',
    modality: 'CT',
    icon: '✨',
    fda: {
      kNumber: 'K193073',
      decisionDate: '2020-07-06',
      productCode: 'JAK',
      productCodeName: 'Cleared within CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'deep-recon',
      endpointUrl: 'https://hub.uii-ai.example/mcp/deep-recon',
      tools: [
        {
          name: 'reconstruct_ct_series',
          desc: {
            zh: '对 CT 原始数据运行深度学习重建。',
            en: 'Run deep-learning reconstruction on CT raw data.'
          },
          input: 'series_uid: string',
          returns: 'JobRef'
        },
        {
          name: 'get_enhanced_series',
          desc: {
            zh: '获取增强重建后的影像序列。',
            en: 'Fetch the enhanced reconstructed series.'
          },
          input: 'job_id: string',
          returns: 'SeriesRef'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'Deep Recon', en: 'Deep Recon' },
      tagline: { zh: 'CT 深度学习重建', en: 'CT deep-learning reconstruction' },
      description: {
        zh: 'CT 图像的深度学习重建，提升图像质量（随影像系统获批）。',
        en: 'Deep-learning reconstruction for CT that improves image quality (cleared within the imaging system).'
      },
      clinicalUse: {
        zh: 'CT 成像的深度学习重建增强。',
        en: 'Deep-learning reconstruction enhancement for CT.'
      },
      overview: {
        zh: '将"Deep Recon 深度学习重建"封装为标准 MCP 服务：对 CT 序列运行深度学习重建、提升图像质量。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps Deep Recon as a standard MCP service: deep-learning reconstruction for CT series with improved image quality. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'hyper-air',
    type: 'reconstruction',
    modality: 'MR',
    icon: '✨',
    series: 'HYPER',
    fda: {
      kNumber: 'K210001',
      decisionDate: '2021-04-30',
      productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'hyper-air',
      endpointUrl: 'https://hub.uii-ai.example/mcp/hyper-air',
      tools: [
        {
          name: 'accelerate_mr_recon',
          desc: {
            zh: '对 MR 序列运行深度学习加速重建。',
            en: 'Run deep-learning accelerated reconstruction on an MR series.'
          },
          input: 'series_uid: string',
          returns: 'JobRef'
        },
        {
          name: 'get_enhanced_series',
          desc: {
            zh: '获取增强重建后的影像序列。',
            en: 'Fetch the enhanced reconstructed series.'
          },
          input: 'job_id: string',
          returns: 'SeriesRef'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'HYPER AiR', en: 'HYPER AiR' },
      tagline: { zh: 'MR 深度学习加速重建', en: 'MR deep-learning accelerated recon' },
      description: {
        zh: 'MR 的深度学习加速与重建（随影像系统获批）。',
        en: 'Deep-learning acceleration and reconstruction for MR (cleared within the imaging system).'
      },
      clinicalUse: {
        zh: 'MR 成像提速与重建增强。',
        en: 'Acceleration and reconstruction enhancement for MR.'
      },
      overview: {
        zh: '将"HYPER AiR 加速重建"封装为标准 MCP 服务：对 MR 序列运行深度学习加速与重建。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps HYPER AiR as a standard MCP service: deep-learning acceleration and reconstruction for MR series. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'hyper-focus',
    type: 'reconstruction',
    modality: 'Cross',
    icon: '✨',
    series: 'HYPER',
    fda: {
      kNumber: 'K210418',
      decisionDate: '2021-04-09',
      productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    mcp: {
      serverKey: 'hyper-focus',
      endpointUrl: 'https://hub.uii-ai.example/mcp/hyper-focus',
      tools: [
        {
          name: 'enhance_reconstruction',
          desc: {
            zh: '对影像序列运行深度学习重建增强。',
            en: 'Run deep-learning reconstruction enhancement on an image series.'
          },
          input: 'series_uid: string',
          returns: 'JobRef'
        },
        {
          name: 'get_enhanced_series',
          desc: {
            zh: '获取增强重建后的影像序列。',
            en: 'Fetch the enhanced reconstructed series.'
          },
          input: 'job_id: string',
          returns: 'SeriesRef'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'HYPER Focus', en: 'HYPER Focus' },
      tagline: { zh: '深度学习重建', en: 'Deep-learning reconstruction' },
      description: {
        zh: '深度学习重建技术，提升图像质量（随影像系统获批）。',
        en: 'Deep-learning reconstruction that improves image quality (cleared within the imaging system).'
      },
      clinicalUse: {
        zh: '影像重建的深度学习增强。',
        en: 'Deep-learning enhancement for image reconstruction.'
      },
      overview: {
        zh: '将"HYPER Focus 重建增强"封装为标准 MCP 服务：对影像序列运行深度学习重建增强。IT 可在院内私域将其接入 PACS / 智能体编排。',
        en: 'Wraps HYPER Focus as a standard MCP service: deep-learning reconstruction enhancement for image series. Hospital IT can wire it into PACS / agent orchestration inside the private domain.'
      }
    }
  },

  {
    id: 'vitallens-rppg',
    type: 'skill',
    modality: 'Cross',
    icon: '❤️',
    fda: null,
    mcp: {
      serverKey: 'vitallens',
      endpointUrl: 'https://hub.uii-ai.example/mcp/vitallens',
      tools: [
        {
          name: 'measure_vitals',
          desc: {
            zh: '通过摄像头视频无接触测量心率与呼吸率（约 12 秒）。',
            en: 'Contactless HR/RR measurement from ~12s webcam video.'
          },
          input: 'video: Blob',
          returns: 'VitalsResult'
        }
      ],
      prompts: [],
      resources: []
    },
    i18n: {
      title: { zh: 'vitallens-rppg', en: 'vitallens-rppg' },
      tagline: { zh: '摄像头无接触心率/呼吸率（演示）', en: 'Contactless HR/RR via webcam (demo)' },
      description: {
        zh: '用摄像头无接触采集约 12 秒视频，返回心率与呼吸率。研究/演示用，非医疗器械。',
        en: 'Contactless ~12s webcam capture returning heart rate and respiratory rate. Research/demo only, not a medical device.'
      },
      clinicalUse: {
        zh: '展示 "Skill 类型" 的开发者能力示例（非器械）。',
        en: 'Example of a developer "Skill" type (not a device).'
      },
      overview: {
        zh: '将"无接触生命体征测量"封装为标准 MCP 服务：通过摄像头视频返回心率与呼吸率。研究 / 演示用途，非医疗器械。',
        en: 'Wraps contactless vitals measurement as a standard MCP service: returns heart rate and respiratory rate from webcam video. Research/demo only — not a medical device.'
      }
    }
  }
];
