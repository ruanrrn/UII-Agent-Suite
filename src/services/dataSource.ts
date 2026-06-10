import type { Capability, ConsoleOverview } from '@/types/capability';
export interface DataSource {
  listCapabilities(): Promise<Capability[]>;
  getCapability(id: string): Promise<Capability | null>;
  getConsoleOverview(): Promise<ConsoleOverview>;
}
