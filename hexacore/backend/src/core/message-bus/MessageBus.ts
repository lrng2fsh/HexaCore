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
    logger.debug('MessageBus', `Agent ${agentId} subscribed`);
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
    logger.info('MessageBus', `${from} → ${to} [${type}]`, { task_id, payload });

    const handlers = this.subscribers.get(to) ?? [];
    handlers.forEach((h) => h(message));

    // Also deliver to wildcard subscribers (e.g. UI monitor)
    const wildcardHandlers = this.subscribers.get('*') ?? [];
    wildcardHandlers.forEach((h) => h(message));

    return message;
  }

  getMessages(task_id?: string): Message[] {
    if (!task_id) return [...this.messageLog];
    return this.messageLog.filter((m) => m.task_id === task_id);
  }

  clear(): void {
    this.messageLog = [];
  }
}
