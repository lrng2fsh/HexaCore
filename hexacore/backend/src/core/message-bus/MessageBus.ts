import { Message, MessageType } from '../../types';
import { generateId } from '../../utils/id';
import { logger } from '../../utils/logger';

type Handler = (message: Message) => void;

export class MessageBus {
  private static instance: MessageBus;
  private subscribers: Map<string, Handler[]> = new Map();
  private messageLog: Message[] = [];

  static getInstance(): MessageBus {
    if (!MessageBus.instance) MessageBus.instance = new MessageBus();
    return MessageBus.instance;
  }

  subscribe(agentId: string, handler: Handler): void {
    const existing = this.subscribers.get(agentId) ?? [];
    this.subscribers.set(agentId, [...existing, handler]);
  }

  unsubscribe(agentId: string): void {
    this.subscribers.delete(agentId);
  }

  publish(
    from: string,
    to: string,
    type: MessageType,
    task_id: string,
    payload: Record<string, unknown>
  ): Message {
    const message: Message = {
      id: generateId('msg'),
      from,
      to,
      type,
      task_id,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.messageLog.push(message);
    logger.info('MessageBus', `${from} → ${to} [${type}]`, { task_id });

    const handlers = this.subscribers.get(to) ?? [];
    handlers.forEach(h => h(message));

    // Wildcard subscribers (UI monitor, audit hooks)
    const wildcardHandlers = this.subscribers.get('*') ?? [];
    wildcardHandlers.forEach(h => h(message));

    return message;
  }

  getMessages(filter?: { task_id?: string; workflowId?: string; from?: string; to?: string }): Message[] {
    if (!filter) return [...this.messageLog];
    return this.messageLog.filter(m => {
      if (filter.task_id && m.task_id !== filter.task_id) return false;
      if (filter.from && m.from !== filter.from) return false;
      if (filter.to && m.to !== filter.to) return false;
      return true;
    });
  }

  getByAgent(agentId: string): Message[] {
    return this.messageLog.filter(m => m.from === agentId || m.to === agentId);
  }

  clear(): void {
    this.messageLog = [];
  }
}
