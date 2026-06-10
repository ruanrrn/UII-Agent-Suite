// src/data/capabilities.ts —— 唯一数据源（从 v0 平移）
import type { Capability } from '@/types/capability';

export const CAPABILITIES: Capability[] = [
  {
    id: 'uai-easy-triage-ich',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🧠',
    badges: ['fda'],
    fda: {
      kNumber: 'K242292',
      decisionDate: '2024-09-24',
      productCode: 'QAS',
      productCodeName: 'Radiological Computer-Assisted Triage and Notification Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    inputs: ['CT'],
    outputs: ['triage-flag'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/ich-triage',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'uai-easytriage-rib',
    type: 'clinical-ai',
    modality: 'CT',
    icon: '🦴',
    badges: ['fda'],
    fda: {
      kNumber: 'K193271',
      decisionDate: '2021-01-15',
      productCode: 'QFM',
      productCodeName: 'Radiological Computer-Aided Prioritization Software for Lesions',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    inputs: ['CT'],
    outputs: ['priority-list'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/rib-triage',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'uai-portal',
    type: 'platform',
    modality: 'Cross',
    icon: '🧩',
    badges: ['fda'],
    fda: {
      kNumber: 'K240411',
      decisionDate: '2024-09-06',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    inputs: ['CT', 'MR'],
    outputs: ['processed-image'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/portal',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'uomnispace-ct',
    type: 'platform',
    modality: 'CT',
    icon: '🖥️',
    badges: ['fda'],
    fda: {
      kNumber: 'K233209',
      decisionDate: '2024-05-17',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['CT'],
    outputs: ['post-processed'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/omnispace-ct',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'uomnispace-mr',
    type: 'platform',
    modality: 'MR',
    icon: '🖥️',
    badges: ['fda'],
    fda: {
      kNumber: 'K233186',
      decisionDate: '2024-04-17',
      productCode: 'QIH',
      productCodeName: 'Automated Radiological Image Processing Software',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['MR'],
    outputs: ['post-processed'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/omnispace-mr',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'hyper-dlr',
    type: 'reconstruction',
    modality: 'PET',
    icon: '✨',
    badges: ['fda', 'system'],
    fda: {
      kNumber: 'K193210',
      decisionDate: '2020-08-04',
      productCode: 'KPS',
      productCodeName: 'Cleared within PET/CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['PET'],
    outputs: ['denoised-image'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-dlr',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'deep-recon',
    type: 'reconstruction',
    modality: 'CT',
    icon: '✨',
    badges: ['fda', 'system'],
    fda: {
      kNumber: 'K193073',
      decisionDate: '2020-07-06',
      productCode: 'JAK',
      productCodeName: 'Cleared within CT system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['CT'],
    outputs: ['reconstructed-image'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/deep-recon',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'hyper-air',
    type: 'reconstruction',
    modality: 'MR',
    icon: '✨',
    badges: ['fda', 'system'],
    fda: {
      kNumber: 'K210001',
      decisionDate: '2021-04-30',
      productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['MR'],
    outputs: ['reconstructed-image'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-air',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'hyper-focus',
    type: 'reconstruction',
    modality: 'Cross',
    icon: '✨',
    badges: ['fda', 'system'],
    fda: {
      kNumber: 'K210418',
      decisionDate: '2021-04-09',
      productCode: 'KPS',
      productCodeName: 'Cleared within imaging system submission',
      applicant: 'Shanghai United Imaging Healthcare Co., Ltd.'
    },
    inputs: ['PET'],
    outputs: ['reconstructed-image'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/hyper-focus',
      apiKeyHint: 'uii_sk_••••',
      llmsTxt: '/llms.txt'
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
      }
    }
  },

  {
    id: 'vitallens-rppg',
    type: 'skill',
    modality: 'Cross',
    icon: '❤️',
    badges: ['demo'],
    fda: null,
    inputs: ['video'],
    outputs: ['data'],
    connect: {
      mcpEndpoint: 'mcp://hub.uii-ai.example/vitallens',
      apiKeyHint: 'demo',
      llmsTxt: '/llms.txt'
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
      }
    }
  }
];
