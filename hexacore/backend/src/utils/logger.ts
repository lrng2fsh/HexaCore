import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(__dirname, '../../../runtime/logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function timestamp() {
  return new Date().toISOString();
}

function write(level: string, context: string, message: string, data?: unknown) {
  const entry = {
    timestamp: timestamp(),
    level,
    context,
    message,
    ...(data !== undefined ? { data } : {}),
  };
  const line = JSON.stringify(entry);
  console.log(`[${level}] [${context}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`);
  try {
    ensureLogDir();
    const file = path.join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(file, line + '\n');
  } catch {
    // non-fatal
  }
}

export const logger = {
  info: (ctx: string, msg: string, data?: unknown) => write('INFO', ctx, msg, data),
  warn: (ctx: string, msg: string, data?: unknown) => write('WARN', ctx, msg, data),
  error: (ctx: string, msg: string, data?: unknown) => write('ERROR', ctx, msg, data),
  debug: (ctx: string, msg: string, data?: unknown) => write('DEBUG', ctx, msg, data),
};
