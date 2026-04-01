import { ToolAdapter, ToolResult } from '../../types';
import { logger } from '../../utils/logger';

export class ToolRegistry {
  private adapters: Map<string, ToolAdapter> = new Map();

  register(adapter: ToolAdapter): void {
    this.adapters.set(adapter.name, adapter);
    logger.info('ToolRegistry', `Registered tool: ${adapter.name}`);
  }

  async execute(toolName: string, command: string, args?: Record<string, unknown>): Promise<ToolResult> {
    const adapter = this.adapters.get(toolName);
    if (!adapter) {
      return { success: false, error: `Tool '${toolName}' not found` };
    }
    try {
      return await adapter.execute(command, args);
    } catch (err) {
      logger.error('ToolRegistry', `Tool ${toolName} failed`, err);
      return { success: false, error: String(err) };
    }
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }
}
