// src/types/capability.ts
export type CapType = 'clinical-ai' | 'platform' | 'reconstruction' | 'skill';
export type Modality = 'CT' | 'MR' | 'PET' | 'X-ray' | 'Cross';
export type Lang = 'zh' | 'en';
export interface Bi {
  zh: string;
  en: string;
}
export interface FdaInfo {
  kNumber: string;
  decisionDate: string;
  productCode: string;
  productCodeName: string;
  applicant: string;
}
export interface McpToolSpec {
  name: string;
  desc: Bi;
  input: string;
  returns: string;
}
export interface McpPromptSpec {
  name: string;
  desc: Bi;
  args: string;
}
export interface McpResourceSpec {
  uri: string;
  desc: Bi;
}
export interface McpSpec {
  serverKey: string;
  endpointUrl: string;
  tools: McpToolSpec[];
  prompts: McpPromptSpec[];
  resources: McpResourceSpec[];
}
export interface SkillStat {
  label: Bi;
  value: string | Bi;
  sub: Bi;
}
export interface FlowStep {
  nodeType: 'default' | 'warn' | 'mcp' | 'end';
  nodeLabel: string;
  title: Bi;
  desc: Bi;
  tags?: { text: string; type: 'warn' | 'mcp' }[];
}
export interface Prerequisite {
  name: Bi;
  desc: Bi;
  iconType: 'mcp' | 'pacs' | 'compliance';
}
export interface SkillDetail {
  intro: Bi;
  stats: SkillStat[];
  capabilities: Bi[];
  workflow: FlowStep[];
  prerequisites: Prerequisite[];
  triggers: { phrases: string[]; note: Bi };
  quickStart: { hint: Bi; code: Bi; links: { label: string; href: string }[] };
}
export interface Capability {
  id: string;
  type: CapType;
  modality: Modality;
  icon: string;
  series?: string;
  visible?: boolean;
  fda: FdaInfo | null;
  brochureUrl?: string;
  mcp: McpSpec;
  i18n: { title: Bi; tagline: Bi; description: Bi; clinicalUse: Bi; overview: Bi };
  detail?: SkillDetail;
}
export interface ConsoleService {
  id: string;
  title: Bi;
  modality: Modality;
  kNumber: string | null;
  status: 'online' | 'expiring';
  activatedAt: string;
  expires: string;
}
export interface ConsoleOverview {
  activated: number;
  callsThisMonth: string;
  services: ConsoleService[];
}
