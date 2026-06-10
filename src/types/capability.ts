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
export interface CapConnect {
  mcpEndpoint: string;
  apiKeyHint: string;
  llmsTxt: string;
}
export interface Capability {
  id: string;
  type: CapType;
  modality: Modality;
  icon: string;
  badges: Array<'fda' | 'demo' | 'system'>;
  fda: FdaInfo | null;
  inputs: string[];
  outputs: string[];
  connect: CapConnect;
  i18n: { title: Bi; tagline: Bi; description: Bi; clinicalUse: Bi };
}
export interface ConsoleService {
  id: string;
  title: Bi;
  modality: Modality;
  kNumber: string | null;
  status: 'online' | 'expiring';
}
export interface ConsoleOverview {
  activated: number;
  callsThisMonth: string;
  services: ConsoleService[];
}
