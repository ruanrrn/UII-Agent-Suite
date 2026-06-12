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
export interface Capability {
  id: string;
  type: CapType;
  modality: Modality;
  icon: string;
  series?: string;
  fda: FdaInfo | null;
  brochureUrl?: string;
  mcp: McpSpec;
  i18n: { title: Bi; tagline: Bi; description: Bi; clinicalUse: Bi; overview: Bi };
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
