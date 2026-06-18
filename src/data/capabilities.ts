// src/data/capabilities.ts —— 唯一数据源
// 当前仅 ICH 已填充完整信息并可见，其余 Skill 留空，后续逐个补充后放出。
import type { Capability, SkillDetail } from '@/types/capability';

const empty = { zh: '', en: '' };

const blankI18n = (title: { zh: string; en: string }) => ({
  title,
  tagline: { ...empty },
  description: { ...empty },
  clinicalUse: { ...empty },
  overview: { ...empty }
});

const blankMcp = (serverKey: string) => ({
  serverKey,
  endpointUrl: `https://hub.uii-ai.example/mcp/${serverKey}`,
  tools: [],
  prompts: [],
  resources: []
});

const ichDetail: SkillDetail = {
  intro: {
    zh: '当急诊科医生需要评估患者头颅 CT 是否存在颅内出血时，自动完成 ICH 筛查与量化分析，输出结构化分诊结论，辅助医生快速识别危急病情。',
    en: "When an ER physician needs to evaluate a patient's head CT for intracranial hemorrhage, this Skill automatically performs ICH screening and quantitative analysis, outputs a structured triage summary, and assists the physician in rapidly identifying critical conditions."
  },
  stats: [
    {
      label: { zh: 'AI 灵敏度', en: 'AI Sensitivity' },
      value: '92%',
      sub: { zh: 'ICH 阳性检出\nFDA 验证集', en: 'ICH positive detection\nFDA validation set' }
    },
    {
      label: { zh: 'AI 特异度', en: 'AI Specificity' },
      value: '95%',
      sub: { zh: 'ICH 阴性排除\nFDA 验证集', en: 'ICH negative exclusion\nFDA validation set' }
    },
    {
      label: { zh: '覆盖出血亚型', en: 'Hemorrhage subtypes' },
      value: '5',
      sub: { zh: 'IPH · IVH · SAH\nSDH · EDH', en: 'IPH · IVH · SAH\nSDH · EDH' }
    }
  ],
  capabilities: [
    {
      zh: '检测颅内出血阳性/阴性，输出总体积及 5 种亚型分量（IPH / IVH / SAH / SDH / EDH）',
      en: 'Detect ICH positive/negative, output total volume and 5 subtype volumes (IPH / IVH / SAH / SDH / EDH)'
    },
    {
      zh: '检出水肿并量化中线位移距离及方向',
      en: 'Detect edema and quantify midline shift distance and direction'
    },
    {
      zh: '按固化规则自动判定危急值（ICH 阳性 / 中线位移 > 5mm）',
      en: 'Automatically determine critical values by fixed rules (ICH positive / midline shift > 5mm)'
    },
    {
      zh: '生成结构化分诊摘要',
      en: 'Generate structured triage summary'
    }
  ],
  workflow: [
    {
      nodeType: 'default',
      nodeLabel: '①',
      title: { zh: '医生自然语言请求', en: 'Physician natural language request' },
      desc: {
        zh: '急诊医生向 Agent 描述评估需求，或 PACS 收到新扫描完成事件后自动触发',
        en: 'ER physician describes assessment needs to Agent, or PACS triggers automatically upon new scan completion'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '②',
      title: { zh: '检查类型验证', en: 'Exam type validation' },
      desc: {
        zh: '确认：模态 = CT · 序列 = 非增强 · 部位 = 头颅；不符则终止并提示',
        en: 'Verify: modality = CT · series = non-contrast · region = head; abort with notice if mismatch'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '③',
      title: { zh: 'DICOM 调阅', en: 'DICOM retrieval' },
      desc: {
        zh: '调用 PACS 基础工具，按患者 ID / 检查号获取目标序列',
        en: 'Call PACS base tools to retrieve target series by patient ID / accession number'
      }
    },
    {
      nodeType: 'warn',
      nodeLabel: '④',
      title: { zh: '去标识化', en: 'De-identification' },
      desc: {
        zh: '影像出院内网前必须完成，调用 PACS 去标识化工具处理 DICOM',
        en: 'Must be completed before images leave the intranet; call PACS de-identification tool to process DICOM'
      }
    },
    {
      nodeType: 'mcp',
      nodeLabel: 'MCP',
      title: { zh: '提交推理', en: 'Submit inference' },
      desc: {
        zh: '传入去标识后 DICOM URI，返回 job_id',
        en: 'Pass de-identified DICOM URI, returns job_id'
      }
    },
    {
      nodeType: 'mcp',
      nodeLabel: 'MCP',
      title: { zh: '轮询进度', en: 'Poll status' },
      desc: {
        zh: '循环查询直至 status = completed；失败则终止返回错误',
        en: 'Poll until status = completed; abort and return error on failure'
      }
    },
    {
      nodeType: 'mcp',
      nodeLabel: 'MCP',
      title: { zh: '获取结果', en: 'Get result' },
      desc: {
        zh: '返回：出血阳性/阴性 · 总体积 · 5 种亚型体积 · 水肿 · 中线位移 · 危急值标记',
        en: 'Returns: hemorrhage pos/neg · total volume · 5 subtype volumes · edema · midline shift · critical flag'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '⑧',
      title: { zh: '危急值判定', en: 'Critical value determination' },
      desc: {
        zh: '规则固化，不由 LLM 推断：ICH 阳性 → 危急（T/CHAS 10-4-9-2019）；中线位移 > 5mm → 危急（产品参考值）',
        en: 'Rules are hardcoded, not inferred by LLM: ICH positive → critical (T/CHAS 10-4-9-2019); midline shift > 5mm → critical (product reference)'
      }
    },
    {
      nodeType: 'end',
      nodeLabel: '⑨',
      title: { zh: '输出结构化分诊摘要', en: 'Output structured triage summary' },
      desc: {
        zh: '返回给 Agent / 医生，含免责声明',
        en: 'Return to Agent / physician, with disclaimer'
      }
    }
  ],
  prerequisites: [
    {
      name: { zh: 'UII MCP Server', en: 'UII MCP Server' },
      desc: {
        zh: '联影智能 ICH 推理服务，提供 submit_inference / poll_status / get_result 三个工具接口',
        en: 'UII ICH inference service, providing submit_inference / poll_status / get_result tool interfaces'
      },
      iconType: 'mcp'
    },
    {
      name: { zh: 'PACS 基础工具', en: 'PACS Base Tools' },
      desc: {
        zh: '需支持 DICOM 调阅 · DICOM 去标识化两项操作；去标识化为合规强制步骤，不可跳过',
        en: 'Must support DICOM retrieval and DICOM de-identification; de-identification is a mandatory compliance step'
      },
      iconType: 'pacs'
    },
    {
      name: { zh: '合规要求', en: 'Compliance requirements' },
      desc: {
        zh: '影像出院内网前须完成去标识化，Skill 内已将此步骤设为强制执行，Agent 不可绕过',
        en: 'Images must be de-identified before leaving the intranet; this step is enforced within the Skill and cannot be bypassed by the Agent'
      },
      iconType: 'compliance'
    }
  ],
  triggers: {
    phrases: [],
    note: {
      zh: '急诊医生向 Agent 描述评估需求，或 PACS 收到新扫描完成事件后自动触发。',
      en: 'The ER physician describes the assessment request to the Agent, or PACS triggers automatically when a new scan-complete event is received.'
    }
  },
  quickStart: {
    hint: {
      zh: '复制下面这段话，粘贴给任一能读懂自然语言、可执行本地脚本的 AI 助手',
      en: 'Copy the text below and paste it to any AI assistant that can read natural language and execute local scripts'
    },
    code: {
      zh: '安装 ich_emergency_triage：\n\n源码：https://github.com/uii-ai/agents-hub/tree/main/skills/ich-emergency-triage\n\n依赖：\n  • UII MCP Server（联影智能 ICH 推理接口）\n  • PACS 基础工具（DICOM 调阅 + 去标识化）',
      en: 'Install ich_emergency_triage:\n\nSource: https://github.com/uii-ai/agents-hub/tree/main/skills/ich-emergency-triage\n\nDependencies:\n  • UII MCP Server (UII ICH inference API)\n  • PACS Base Tools (DICOM retrieval + de-identification)'
    },
    links: [
      {
        label: 'SKILL.md',
        href: 'https://github.com/uii-ai/agents-hub/tree/main/skills/ich-emergency-triage/SKILL.md'
      },
      {
        label: 'References',
        href: 'https://github.com/uii-ai/agents-hub/tree/main/skills/ich-emergency-triage/references'
      }
    ]
  }
};

const vitallensDetail: SkillDetail = {
  intro: {
    zh: '当用户想快速了解自己的心率与呼吸率时，Vitallens 通过约 12 秒录制完成一次 rPPG（远程光电容积脉搏波）测量，调用 VitalLens API 返回心率、呼吸率及各自的置信度。',
    en: 'When a user wants a quick read of their heart and respiratory rate, Vitallens runs a single ~12-second rPPG (remote photoplethysmography) measurement, calls the VitalLens API, and returns heart rate, respiratory rate, and a confidence score for each.'
  },
  stats: [
    {
      label: { zh: '录制时长', en: 'Capture time' },
      value: '~12s',
      sub: {
        zh: '单次网络摄像头录制\n3 秒倒计时后开始',
        en: 'Single webcam capture\nstarts after a 3s countdown'
      }
    },
    {
      label: { zh: '输出指标', en: 'Vitals returned' },
      value: '2',
      sub: {
        zh: '心率 HR · 呼吸率 RR\n各带置信度',
        en: 'Heart rate · Respiratory rate\neach with confidence'
      }
    },
    {
      label: { zh: '置信度阈值', en: 'Confidence threshold' },
      value: '0.7',
      sub: {
        zh: '低于此值提示\n结果可能不可靠',
        en: 'Below this, the reading\nmay be unreliable'
      }
    }
  ],
  capabilities: [
    {
      zh: '通过约 12 秒录制，无需穿戴设备即可估算心率（HR）',
      en: 'Estimate heart rate (HR) from a ~12-second webcam recording — no wearable required'
    },
    {
      zh: '同步估算呼吸率（RR），并为每项指标返回 0–1 置信度',
      en: 'Estimate respiratory rate (RR) in the same pass, with a 0–1 confidence score per vital'
    },
    {
      zh: '单条命令完成：预检 → 本地服务 → 自动授权摄像头 → 录制 → 调用 API → 输出结果',
      en: 'One command runs the whole flow: preflight → local server → auto-granted camera → capture → API → result'
    },
    {
      zh: '跨平台（Windows / macOS / Linux），自动检测 Node、浏览器与摄像头',
      en: 'Cross-platform (Windows / macOS / Linux); auto-checks Node, browser and webcam'
    },
    {
      zh: '置信度低于 0.7 时提示结果可能不可靠，并建议在良好光照、保持静止下重测',
      en: 'Flags readings below 0.7 confidence and suggests a retry in good lighting while staying still'
    }
  ],
  workflow: [
    {
      nodeType: 'default',
      nodeLabel: '①',
      title: { zh: '自然语言请求', en: 'Natural-language request' },
      desc: {
        zh: '用户说“测一下心率”“我现在心率多少”等，Agent 识别意图并触发本 Skill',
        en: 'The user says "check my pulse" / "what\'s my heart rate", and the Agent recognizes the intent and triggers this Skill'
      }
    },
    {
      nodeType: 'warn',
      nodeLabel: '②',
      title: { zh: '环境预检', en: 'Environment preflight' },
      desc: {
        zh: '检查 Node 18+、Chromium 浏览器与摄像头；缺失则中止并引导配置',
        en: 'Verify Node 18+, a Chromium browser and a webcam; abort and guide setup if any is missing'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '③',
      title: { zh: '启动本地服务', en: 'Launch local server' },
      desc: {
        zh: '运行 node scripts/launch.js，在空闲端口启动本地 HTTP 服务并打开无边框 Chromium 窗口',
        en: 'Run node scripts/launch.js to start a local HTTP server on a free port and open a chromeless Chromium window'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '④',
      title: { zh: '摄像头录制', en: 'Webcam capture' },
      desc: {
        zh: '摄像头自动授权，页面 3 秒倒计时后录制约 12 秒，全程无需手动点击“允许”',
        en: 'Camera is auto-granted; the page counts down 3s then records ~12s — no manual "Allow" click needed'
      }
    },
    {
      nodeType: 'default',
      nodeLabel: '⑤',
      title: { zh: '调用 VitalLens API', en: 'Call VitalLens API' },
      desc: {
        zh: '上传录制片段，远程 rPPG 推理返回心率、呼吸率及置信度',
        en: 'Upload the clip; remote rPPG inference returns heart rate, respiratory rate and confidence'
      }
    },
    {
      nodeType: 'end',
      nodeLabel: '⑥',
      title: { zh: '结果输出', en: 'Result output' },
      desc: {
        zh: '自然语音描述测量结果，并自动清除临时服务。',
        en: 'Describe the measurement results in natural language and automatically clear the temporary service.'
      }
    }
  ],
  prerequisites: [
    {
      name: { zh: '运行环境', en: 'Runtime' },
      desc: {
        zh: 'Node.js 18+ 与 Chromium 内核浏览器（Edge / Chrome），跨平台运行 launch.js',
        en: 'Node.js 18+ and a Chromium-based browser (Edge / Chrome); launch.js runs cross-platform'
      },
      iconType: 'pacs'
    },
    {
      name: { zh: '摄像头与合规', en: 'Camera & compliance' },
      desc: {
        zh: '需可用摄像头；单人入镜、保持静止以保证信号质量',
        en: 'A working camera; one person in frame, staying still for signal quality'
      },
      iconType: 'compliance'
    }
  ],
  triggers: {
    phrases: [],
    note: {
      zh: '用户向 Agent 提及测量心率或呼吸时自动触发',
      en: 'Automatically triggers when the user mentions measuring heart rate or breathing to the Agent.'
    }
  },
  quickStart: {
    hint: {
      zh: '复制下面这段话，粘贴给任一能执行本地脚本的 AI 助手（如 Claude Code）',
      en: 'Copy the text below and paste it to any AI assistant that can run local scripts (e.g. Claude Code)'
    },
    code: {
      zh: '安装 vitallens-rppg：\n\n源码：https://github.com/ruanrrn/uii-agents-hub/tree/main/vitallens\n\n运行：node scripts/launch.js\n\n依赖：\n  • Node.js 18+\n  • Chromium 内核浏览器（Edge / Chrome）\n  • 可用摄像头',
      en: 'Install vitallens-rppg:\n\nSource: https://github.com/ruanrrn/uii-agents-hub/tree/main/vitallens\n\nRun: node scripts/launch.js\n\nDependencies:\n  • Node.js 18+\n  • Chromium-based browser (Edge / Chrome)\n  • A working camera'
    },
    links: [
      {
        label: 'SKILL.md',
        href: 'https://github.com/ruanrrn/uii-agents-hub/blob/main/vitallens/SKILL.md'
      },
      {
        label: 'VitalLens API',
        href: 'https://www.rouast.com/api'
      }
    ]
  }
};

export const CAPABILITIES: Capability[] = [
  {
    id: 'easy-triage-rib',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Easy-Triage-System(RiB).png',
    visible: true,
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
    visible: true,
    fda: {
      kNumber: 'K242292',
      decisionDate: '2024-12-20',
      productCode: 'QAS',
      productCodeName: 'Radiology Computer Aided Triage And Notification Software',
      applicant: 'Shanghai United Imaging Intelligence Co., Ltd.'
    },
    mcp: blankMcp('easy-triage-ich'),
    i18n: {
      title: {
        zh: '智能危急预警系统 - 颅内出血检测',
        en: 'Easy Triage System - ICH'
      },
      tagline: {
        zh: '急诊颅内出血 AI 辅助筛查与分诊',
        en: 'AI-assisted ICH screening and triage for emergency'
      },
      description: {
        zh: '当急诊科医生需要评估患者头颅 CT 是否存在颅内出血时，自动完成 ICH 筛查与量化分析，输出结构化分诊结论，辅助医生快速识别危急病情。',
        en: "When an ER physician needs to evaluate a patient's head CT for intracranial hemorrhage, this Skill automatically performs ICH screening and quantitative analysis, outputs a structured triage summary, and assists the physician in rapidly identifying critical conditions."
      },
      clinicalUse: { ...empty },
      overview: {
        zh: '急诊颅内出血 AI 辅助筛查与分诊',
        en: 'AI-assisted ICH screening and triage for emergency'
      }
    },
    detail: ichDetail
  },
  {
    id: 'bony-thorax-fractures',
    type: 'skill',
    modality: 'CT',
    icon: '/assets/Bony-Thorax-Fractures.png',
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
    fda: null,
    mcp: blankMcp('intracerebral-hemorrhage'),
    i18n: blankI18n({
      zh: 'CT 颅内出血智能分析系统',
      en: 'AI-Assisted Analysis System for Intracerebral Hemorrhage'
    })
  },
  {
    id: 'vitallens-rppg',
    type: 'skill',
    modality: 'Cross',
    icon: '/assets/vitallens.svg',
    visible: true,
    fda: null,
    mcp: blankMcp('vitallens-rppg'),
    i18n: {
      title: { zh: 'Vitallens', en: 'Vitallens' },
      tagline: {
        zh: '网络摄像头 rPPG 心率与呼吸率估算',
        en: 'Webcam rPPG heart & respiratory rate estimation'
      },
      description: {
        zh: '约 12 秒录制，通过 rPPG 远程光电容积脉搏波技术估算心率与呼吸率，并返回置信度。',
        en: 'A ~12-second recording estimates heart rate and respiratory rate via rPPG (remote photoplethysmography), returning a confidence score for each.'
      },
      clinicalUse: { ...empty },
      overview: {
        zh: '网络摄像头 rPPG 心率与呼吸率估算',
        en: 'Webcam rPPG heart & respiratory rate estimation'
      }
    },
    detail: vitallensDetail
  }
];
