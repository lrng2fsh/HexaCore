import { ToolAdapter, ToolResult } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock SQL adapter — plug real DB driver here later
export class SqlAdapter implements ToolAdapter {
  name = 'sql';

  private mockSchema = {
    users: ['id', 'name', 'email', 'created_at'],
    orders: ['id', 'user_id', 'product', 'status', 'created_at'],
    exports: ['id', 'order_id', 'format', 'status', 'error_message'],
  };

  async execute(command: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    logger.debug('SqlAdapter', `Executing: ${command}`, args);

    switch (command) {
      case 'query': {
        const sql = String(args.sql ?? '');
        // Simulate schema inspection
        if (sql.toLowerCase().includes('information_schema')) {
          return { success: true, data: this.mockSchema };
        }
        if (sql.toLowerCase().includes('exports')) {
          return {
            success: true,
            data: [
              { id: 1, order_id: 42, format: 'CSV', status: 'failed', error_message: 'Null reference in export handler' },
            ],
          };
        }
        return { success: true, data: [] };
      }
      case 'schema': {
        return { success: true, data: this.mockSchema };
      }
      default:
        return { success: false, error: `Unknown SQL command: ${command}` };
    }
  }
}
