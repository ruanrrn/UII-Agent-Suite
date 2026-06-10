import type { DataSource } from './dataSource';
import type { Capability, ConsoleOverview } from '@/types/capability';

export class MockDataSource implements DataSource {
  constructor(private base: string) {}
  private async json<T>(path: string): Promise<T> {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error(`mock fetch failed: ${path}`);
    return res.json() as Promise<T>;
  }
  async listCapabilities() {
    return this.json<Capability[]>('mock/capabilities.json');
  }
  async getCapability(id: string) {
    const all = await this.listCapabilities();
    return all.find(c => c.id === id) ?? null;
  }
  async getConsoleOverview() {
    return this.json<ConsoleOverview>('mock/console.json');
  }
}
