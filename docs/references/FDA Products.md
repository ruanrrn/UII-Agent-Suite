# uAI Portal — AI-Assisted CT Analysis System
# uAI Portal — CT 智能分析系统

> **uAI Discover** — `FDA 510(k) · K240411`
> 联影智能 / Shanghai United Imaging Intelligence Co., Ltd.
> Class II · Product Code QIH, LLZ · 21 CFR 892.2050 · SE decision Sep 6, 2024 · Predicate uWS-CT (K183170)

---

## INTENDED USE / 预期用途

**EN —** uAI Portal is a software solution for viewing, manipulation, communication, and storage of medical images. It supports interpretation and evaluation of examinations within healthcare institutions, using AI-generated automatic segmentation to reconstruct CT studies. It exposes **five vascular/cardiac CT analysis applications** as a standard MCP service so AI-PACS and downstream agents can call them via the MCP protocol.

**中文 —** uAI Portal 是用于医学图像查看、操作、通信与存储的软件方案，支持医疗机构内的检查解读与评估，并利用 AI 自动分割重建 CT 检查。它以标准 MCP 服务形式对外暴露**五个血管/心脏 CT 分析应用**，AI-PACS 与下游智能体可通过 MCP 协议直接调用。

> ⚠️ **Scope note / 范围说明:** The FDA-cleared intended use is limited to **viewing, manipulating, and evaluating** CT images (segmentation, centerline extraction, measurement, stenosis/lumen measurement). Downstream clinical labels marketed under NMPA/CE — e.g. dissection typing, plaque characterization, CT-FFR, calcium scoring — are **not part of this 510(k)** and are **not interpretation/diagnosis claims**. A trained, licensed physician interprets all results per standard practice. / FDA 获批预期用途仅限于 CT 图像的**查看、操作与评估**（分割、中心线提取、测量、狭窄/腔径测量）。NMPA/CE 下宣称的临床能力（如夹层分型、斑块定性、CT-FFR、钙化积分）**不属于本 510(k)**，**不构成诊断/解读结论**。所有结果由具备资质的执业医师按标准流程解读。

---

## What it is / 产品概述

**EN —** uAI Portal parses DICOM 3.0 studies, runs AI segmentation algorithms in memory, and serves reconstructed vessels/organs with multi-view display (VR, MIP, MPR, Probe, CPR, SCPR). Results can be measured, edited, saved to PACS, or sent to filming. Wrapped as a standard MCP service: one endpoint, five callable applications, structured outputs and reports. Cloud SaaS, HIPAA / BAA-ready.

**中文 —** uAI Portal 解析 DICOM 3.0 检查，在内存中运行 AI 分割算法，输出重建后的血管/器官并支持多视图显示（VR、MIP、MPR、探针、CPR、SCPR）。结果可测量、编辑、存入 PACS 或送至胶片。封装为标准 MCP 服务：单一端点、五个可调用应用、结构化输出与报告。云端 SaaS，满足 HIPAA / BAA 合规。

### Five applications / 五大应用
| # | Application / 应用 | Modality / 模态 | Core output / 核心输出 |
|---|---|---|---|
| 1 | **Coronary Analysis** / 冠脉分析 | CCTA | Heart + coronary vessel segmentation, centerline, stenosis measurement / 心脏+冠脉分割、中心线、狭窄测量 |
| 2 | **Aorta Analysis** / 主动脉分析 | Aorta CTA | Trunk + branch segmentation, centerline, lumen-diameter measurement / 主干+分支分割、中心线、腔径测量 |
| 3 | **Pulmonary Artery Analysis** / 肺动脉分析 | CTPA | Artery/vein segmentation, centerline, measurement / 动静脉分割、中心线、测量 |
| 4 | **Head and Neck Vessel Analysis** / 头颈血管分析 | Head & neck CTA | Vessel + bone segmentation, centerline, measurement / 血管+骨分割、中心线、测量 |
| 5 | **Lower Extremity Vessel Analysis** / 下肢血管分析 | Lower-extremity CTA | Vessel + bone segmentation, centerline, ROI, stenosis measurement / 血管+骨分割、中心线、ROI、狭窄测量 |

> Shared functions across all applications / 各应用通用功能: Image Browsing 图像浏览 · Image Editing 图像编辑 · Centerline Extraction 中心线提取 · Measurement 测量 · Print 打印 · Archive 归档 · User Configuration 用户配置.

---

## What it looks like / 产品界面
> _Product UI screenshot (from official brochure · placeholder) / 产品界面截图（取自官方彩页 · 占位）_

---

## Tools / 可调用工具

> Callable tools exposed by this MCP service. Full schema and parameter details ship with the service version.
> 本 MCP 服务对外暴露的可调用工具；完整 schema 与参数随服务版本提供。

### Common / 通用工具

#### `list_studies`
List/filter ingested studies. / 列出与筛选已接入的检查。
- **Input:** `application?: AppName` · `date_from?` · `date_to?` · `status?` — **Returns:** `StudySummary[]`

#### `get_processing_status`
Query processing state for a study. / 查询某检查的处理状态。
- **Input:** `study_uid: string` — **Returns:** `ProcessingStatus` (`app` · `state: queued|processing|done|error`)

#### `get_structured_report`
Fetch the structured report for a study. / 获取结构化报告。
- **Input:** `study_uid: string` · `format?: "json" | "pdf"` — **Returns:** `ReportDoc`

#### `edit_centerline`
Submit physician corrections to centerline/segmentation and re-run measurement. / 提交医师对中心线/分割的修正并重新测量。
- **Input:** `study_uid: string` · `corrections: CenterlineEdit[]` — **Returns:** `AnalysisResult`

#### `export_to_pacs`
Archive results / send to filming. / 结果归档/送至胶片。
- **Input:** `study_uid: string` · `target: "pacs" | "filming"` — **Returns:** `ExportReceipt`

---

### 1. Coronary Analysis / 冠脉分析 (CCTA)

#### `analyze_coronary_cta`
Submit a CCTA study; runs heart & coronary segmentation, centerline extraction, and stenosis measurement. / 提交 CCTA 检查；执行心脏与冠脉分割、中心线提取与狭窄测量。
- **Input:** `study_uid: string` · `priority?: "routine" | "stat"` — **Returns:** `CoronaryFindings`
- `CoronaryFindings` → `vessels: VesselTree` (LM/LAD/LCX/RCA) · `stenosis: StenosisMeasurement[]` · `centerlines` · `heart_mask`
- **Validation Dice:** coronary vessels **0.920**, heart **0.980**

---

### 2. Aorta Analysis / 主动脉分析 (Aorta CTA)

#### `analyze_aortic_cta`
Submit an aortic CTA study; runs trunk & branch segmentation, centerline extraction, and lumen-diameter measurement. / 提交主动脉 CTA 检查；执行主干与分支分割、中心线提取与腔径测量。
- **Input:** `study_uid: string` · `priority?: "routine" | "stat"` — **Returns:** `AorticFindings`
- `AorticFindings` → `trunk_mask` · `branch_masks` · `centerlines` · `lumen_diameters: DiameterProfile`
- **Validation Dice:** trunk **0.946**, branches **0.846**

---

### 3. Pulmonary Artery Analysis / 肺动脉分析 (CTPA)

#### `analyze_pulmonary_cta`
Submit a CTPA study; runs artery/vein segmentation, centerline extraction, and measurement. / 提交 CTPA 检查；执行动/静脉分割、中心线提取与测量。
- **Input:** `study_uid: string` · `priority?: "routine" | "stat"` — **Returns:** `PulmonaryFindings`
- `PulmonaryFindings` → `artery_mask` · `vein_mask` · `centerlines` · `measurements`
- **Validation Dice:** arteries **0.953**, veins **0.933**

---

### 4. Head and Neck Vessel Analysis / 头颈血管分析 (Head & Neck CTA)

#### `analyze_head_neck_cta`
Submit a head & neck CTA study; runs vessel & bone segmentation, centerline extraction, and measurement. / 提交头颈 CTA 检查；执行血管与骨分割、中心线提取与测量。
- **Input:** `study_uid: string` — **Returns:** `HeadNeckFindings`
- `HeadNeckFindings` → `head_vessel_mask` · `neck_vessel_mask` · `bone_mask` · `centerlines` · `measurements`
- **Validation Dice:** head vessels **0.902**, neck vessels **0.967**

---

### 5. Lower Extremity Vessel Analysis / 下肢血管分析 (Lower-Extremity CTA)

#### `analyze_lower_extremity_cta`
Submit a lower-extremity CTA study; runs vessel & bone segmentation, centerline extraction, ROI, and stenosis measurement. / 提交下肢 CTA 检查；执行血管与骨分割、中心线提取、ROI 与狭窄测量。
- **Input:** `study_uid: string` — **Returns:** `LowerExtremityFindings`
- `LowerExtremityFindings` → `artery_mask` · `bone_mask` · `centerlines` · `roi[]` · `stenosis: StenosisMeasurement[]`
- **Validation Dice:** arteries **0.892**

---

## Prompts / 提示词模板

> Reusable prompt templates that orchestrate the tools above.
> 编排上述工具的可复用提示词模板。

### 1. `triage_acute_chest_pain` — 急性胸痛三联分诊
**EN —** "For incoming study `{study_uid}`, detect modality and call the matching analyzer (`analyze_coronary_cta` / `analyze_aortic_cta` / `analyze_pulmonary_cta`) with priority=stat. Summarize vessel reconstruction status and key measurements (coronary stenosis / aortic lumen diameters / pulmonary findings), attach the JSON report, and flag that findings require physician confirmation."
**中文 —** "对新到检查 `{study_uid}`，识别模态并调用对应分析器（冠脉/主动脉/肺动脉），priority=stat。概述血管重建状态与关键测量（冠脉狭窄/主动脉腔径/肺动脉结果），附 JSON 报告，并注明结果需医师确认。"

### 2. `generate_vascular_report` — 血管结构化报告
**EN —** "Retrieve the structured report for `{study_uid}` via `get_structured_report` (json), then write a concise report in {language} appropriate to the application: anatomy reconstructed, key measurements, and any flagged stenosis/diameters. State clearly that this is a measurement/visualization aid, not a diagnosis."
**中文 —** "通过 `get_structured_report`(json) 获取 `{study_uid}` 报告，随后以 {language} 撰写与应用相符的简明报告：重建解剖、关键测量、标注的狭窄/腔径。明确说明本结果为测量/可视化辅助，非诊断结论。"

### 3. `batch_qc_review` — 批量质控复核
**EN —** "Call `list_studies` for {date}, then for each `done` study summarize segmentation status and surface any with `error` state or measurements outside expected ranges for physician review."
**中文 —** "对 {date} 调用 `list_studies`，对每个 `done` 检查概述分割状态，并挑出 `error` 状态或测量值异常的检查供医师复核。"

---

## Resources / 资源

> Read-only context resources the service exposes for grounding.
> 服务暴露的只读上下文资源，用于事实支撑。

| Resource | URI | Description / 说明 |
|---|---|---|
| **FDA 510(k) Clearance** | `fda://K240411` | Clearance letter & 510(k) summary (uAI Portal, Class II, QIH/LLZ). / 获批函与 510(k) 摘要。 |
| **Indications for Use** | `doc://ifu/uai-portal` | Cleared intended use & per-application scope. / 获批预期用途与各应用范围。 |
| **Validation Performance** | `doc://validation/dice-metrics` | Per-application Dice metrics & subgroup (gender/age/vendor/artifact/anatomy) analysis. / 各应用 Dice 指标与亚组（性别/年龄/厂商/伪影/解剖变异）分析。 |
| **DICOM Conformance** | `doc://dicom-conformance` | DICOM 3.0 conformance & supported series. / DICOM 3.0 一致性与支持序列。 |
| **Security & Compliance** | `doc://security/hipaa-baa` | HIPAA / BAA, IEC 62304, ISO 14971, FDA cybersecurity posture. / HIPAA/BAA、IEC 62304、ISO 14971、FDA 网络安全。 |

---

## Config / 配置

| Key | Example | Notes / 说明 |
|---|---|---|
| `endpoint` | `https://mcp.uii-ai.com/uai-portal` | MCP service base URL. / MCP 服务基址。 |
| `api_key` | `••••••••` | Per-tenant key; rotate per policy. / 租户级密钥，按策略轮换。 |
| `region` | `us` / `cn` | Data-residency region. / 数据驻留区域。 |
| `enabled_apps` | `["coronary","aorta","pulmonary","head_neck","lower_extremity"]` | Applications exposed to callers. / 对调用方开放的应用。 |
| `default_priority` | `routine` | `routine` \| `stat` default for submissions. / 提交默认优先级。 |
| `report_format` | `json` | Default report format for agents. / 智能体默认报告格式。 |
| `phi_handling` | `baa` | HIPAA / BAA-governed PHI processing. / 受 HIPAA/BAA 约束的 PHI 处理。 |

---

## Regulatory & Validation snapshot / 监管与验证概览

| Item / 项目 | Detail / 详情 |
|---|---|
| 510(k) Number | **K240411** |
| Trade Name | uAI Portal (single device / 单一器械) |
| Applications | 5 — Coronary, Aorta, Pulmonary Artery, Head & Neck, Lower Extremity / 5 个应用 |
| Decision | Substantially Equivalent (SE), Sep 6, 2024 |
| Predicate | uWS-CT (K183170) |
| Class / Panel | Class II · Radiology |
| Product Code | QIH, LLZ |
| Regulation | 21 CFR 892.2050 (Medical Image Management and Processing System) |
| Standards | DICOM (NEMA PS 3.x), ISO 14971, IEC 62304, FDA Cybersecurity (2023) |

**Validation cohort / 验证集:** 150 independent US images (Female 73 / Male 77; age median 66, range 19–91; SIEMENS 55 / GE 85 / TOSHIBA 10; 33 with artifacts; 30 with anatomical variation). Ground truth annotated by two ≥5-yr Chinese radiologists, adjudicated by a US board-certified radiologist (≥10 yr). / 150 例独立美国数据（女 73/男 77；年龄中位 66、范围 19–91；西门子 55/GE 85/东芝 10；33 例含伪影；30 例含解剖变异）。金标准由两名 ≥5 年中国放射科医师标注，并由一名 ≥10 年美国注册放射科医师裁定。

**Average Dice by application / 各应用平均 Dice:**

| Application / 应用 | Algorithm / 算法 | Avg Dice | Acceptance / 验收 |
|---|---|---|---|
| Coronary / 冠脉 | Vessels segmentation | 0.920 | ≥0.85 |
| Coronary / 冠脉 | Heart segmentation | 0.980 | ≥0.90 |
| Head & Neck / 头颈 | Head vessel | 0.902 | ≥0.85 |
| Head & Neck / 头颈 | Neck vessel | 0.967 | ≥0.90 |
| Aorta / 主动脉 | Trunk | 0.946 | ≥0.90 |
| Aorta / 主动脉 | Branches | 0.846 | ≥0.80 |
| Pulmonary / 肺动脉 | Arteries | 0.953 | ≥0.85 |
| Pulmonary / 肺动脉 | Veins | 0.933 | ≥0.85 |
| Lower Extremity / 下肢 | Arteries | 0.892 | ≥0.80 |

---

_Source / 来源: FDA 510(k) K240411 Summary (accessdata.fda.gov/cdrh_docs/pdf24/K240411.pdf) + 联影智能产品资料 / United Imaging Intelligence product materials._