import type { DataSource } from './dataSource';
import type { Capability, ConsoleOverview } from '@/types/capability';

export class HttpDataSource implements DataSource {
  protected readonly apiBase: string;
  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }
  async listCapabilities(): Promise<Capability[]> {
    throw new Error('HttpDataSource not implemented');
  }
  async getCapability(_id: string): Promise<Capability | null> {
    throw new Error('HttpDataSource not implemented');
  }
  async getConsoleOverview(): Promise<ConsoleOverview> {
    throw new Error('HttpDataSource not implemented');
  }
}
