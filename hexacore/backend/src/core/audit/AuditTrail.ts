import fs from 'fs';
import path from 'path';
import { AuditEvent, AuditEventType } from '../../types';
import { generateId } from '../../utils/id';
import { logger } from '../../utils/logger';

const AUDIT_DIR = path.resolve(__dirname, '../../../../runtime/sessions');

export class AuditTrail {
  private static instance: AuditTrail;
  private events: Map<string, AuditEvent[]> = new Map(); // keyed by workflowId

  static getInstance(): AuditTrail {
    if (!AuditTrail.instance) AuditTrail.instance = new AuditTrail();
    return AuditTrail.instance;
  }

  record(
    type: AuditEventType,
    workflowId: string,
    detail: Record<string, unknown>,
    opts: { nodeId?: string; agentId?: string } = {}
  ): AuditEvent {
    const event: AuditEvent = {
      id: generateId('audit'),
      type,
      workflowId,
      nodeId: opts.nodeId,
      agentId: opts.agentId,
      timestamp: new Date().toISOString(),
      detail,
    };

    const existing = this.events.get(workflowId) ?? [];
    existing.push(event);
    this.events.set(workflowId, existing);

    logger.debug('AuditTrail', `[${type}] wf=${workflowId}`, detail);
    this.persist(workflowId, existing);
    return event;
  }

  getByWorkflow(workflowId: string): AuditEvent[] {
    return this.events.get(workflowId) ?? [];
  }

  private persist(workflowId: string, events: AuditEvent[]): void {
    try {
      if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(AUDIT_DIR, `${workflowId}.audit.json`),
        JSON.stringify(events, null, 2)
      );
    } catch {
      // non-fatal
    }
  }
}
