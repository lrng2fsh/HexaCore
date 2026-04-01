import { AgentActivitySignal, SignalStatus } from '../../types';
import { logger } from '../../utils/logger';

export class SignalService {
  private static instance: SignalService;
  private signals: Map<string, AgentActivitySignal> = new Map();

  static getInstance(): SignalService {
    if (!SignalService.instance) SignalService.instance = new SignalService();
    return SignalService.instance;
  }

  emit(
    agentId: string,
    workflowId: string,
    status: SignalStatus,
    opts: {
      currentTaskId?: string;
      activityLevel?: number;
      lastMessage?: string;
      linkedAgents?: string[];
    } = {}
  ): AgentActivitySignal {
    const existing = this.signals.get(agentId);
    const signal: AgentActivitySignal = {
      agentId,
      workflowId,
      currentTaskId: opts.currentTaskId ?? existing?.currentTaskId,
      status,
      activityLevel: opts.activityLevel ?? this.defaultActivityLevel(status),
      lastUpdatedAt: new Date().toISOString(),
      lastMessage: opts.lastMessage ?? existing?.lastMessage,
      linkedAgents: opts.linkedAgents ?? existing?.linkedAgents ?? [],
    };

    this.signals.set(agentId, signal);
    logger.debug('SignalService', `Signal: ${agentId} → ${status}`, { activityLevel: signal.activityLevel });
    return signal;
  }

  get(agentId: string): AgentActivitySignal | undefined {
    return this.signals.get(agentId);
  }

  getAll(): AgentActivitySignal[] {
    return Array.from(this.signals.values());
  }

  getByWorkflow(workflowId: string): AgentActivitySignal[] {
    return Array.from(this.signals.values()).filter(s => s.workflowId === workflowId);
  }

  private defaultActivityLevel(status: SignalStatus): number {
    const levels: Record<SignalStatus, number> = {
      idle: 0, waiting: 20, active: 80, blocked: 10, complete: 100, error: 5,
    };
    return levels[status] ?? 0;
  }
}
