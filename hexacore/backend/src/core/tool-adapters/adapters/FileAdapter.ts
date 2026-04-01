import fs from 'fs';
import path from 'path';
import { ToolAdapter, ToolResult } from '../../../types';

export class FileAdapter implements ToolAdapter {
  name = 'file';

  async execute(command: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    const filePath = String(args.path ?? '');

    switch (command) {
      case 'read': {
        if (!fs.existsSync(filePath)) return { success: false, error: 'File not found' };
        const data = fs.readFileSync(filePath, 'utf-8');
        return { success: true, data };
      }
      case 'write': {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, String(args.content ?? ''), 'utf-8');
        return { success: true, data: `Written to ${filePath}` };
      }
      case 'list': {
        if (!fs.existsSync(filePath)) return { success: false, error: 'Directory not found' };
        const files = fs.readdirSync(filePath);
        return { success: true, data: files };
      }
      default:
        return { success: false, error: `Unknown command: ${command}` };
    }
  }
}
