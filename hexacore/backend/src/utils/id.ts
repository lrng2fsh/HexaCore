import { randomUUID } from 'crypto';

export const generateId = (prefix?: string): string =>
  prefix ? `${prefix}-${randomUUID()}` : randomUUID();
