import {
  AgentConfig, AgentStatus, AgentTaskResult, Artifact, ArtifactType,
  Decision, Message, MessageType, Risk, TaskExecutionContext, TaskNode,
} from '../../types';
import { MessageBus } from '../message-bus/MessageBus';
import { ToolRegistry } from '../tool-adapters/ToolRegistry';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';
import { ArtifactStore } from '../artifacts/ArtifactStore';
import { SignalService } from '../signals/SignalService';
import { AuditTrail } from '../audit/AuditTrail';
import { createLLMProvider, LLMProvider } from '../../models/LLMProvider';
import { logger } from '../../utils/logger';

export abstract class BaseAgent {
  protected llm: LLMProvider;
  protected bus: MessageBus;
  protected tools: ToolRegistry;
  protected knowledge: KnowledgeBase;
  protected artifacts: ArtifactStore;
  protected signals: SignalService;
  protected audit: AuditTrail;
  public status: AgentStatus = 'idle';

  constructor(
    public readonly config: AgentConfig,
    bus: MessageBus,
    tools: ToolRegistry,
    knowledge: KnowledgeBase
  ) {
    this.bus = bus;
    this.tools = tools;
    this.knowledge = knowledge;
    this.artifacts = ArtifactStore.getInstance();
    this.signals = SignalService.getInstance();
    this.audit = AuditTrail.getInstance();
    this.llm = createLLMProvider(config.llm);

    this.bus.subscribe(config.id, msg => this.onMessage(msg));
    logger.info(config.id, `Agent initialized — role: ${config.role}`);
  }

  // ─── Abstract contract ────────────────────────────────────────────────────

  abstract executeTaskWithContext(ctx: TaskExecutionContext): Promise<AgentTaskResult>;

  // ─── Legacy shim — WorkflowEngine calls this ──────────────────────────────

  async executeTask(task: TaskNode): Promise<AgentTaskResult> {
    const ctx: TaskExecutionContext = {
      workflowId: (task.input?.workflowId as string) ?? 'unknown',
      nodeId: task.id,
      assignedAgentId: this.config.id,
      taskType: task.type,
      instruction: String(task.input?.instruction ?? task.type),
      dependencies: task.dependencies,
      inputArtifacts: [],
      sharedFacts: [],
      upstreamOutputs: (task.input?.upstreamOutputs as Record<string, AgentTaskResult>) ?? {},
    };
    return this.executeTaskWithContext(ctx);
  }

  // ─── Primitives available to all agents ──────────────────────────────────

  protected emitSignal(
    workflowId: string,
    status: 'idle' | 'active' | 'blocked' | 'waiting' | 'complete' | 'error',
    opts: { taskId?: string; message?: string; linkedAgents?: string[]; activityLevel?: number } = {}
  ): void {
    this.signals.emit(this.config.id, workflowId, status, {
      currentTaskId: opts.taskId,
      lastMessage: opts.message,
      linkedAgents: opts.linkedAgents,
      activityLevel: opts.activityLevel,
    });
  }

  protected sendStructuredMessage(
    to: string,
    type: MessageType,
    taskId: string,
    payload: Record<string, unknown>
  ): Message {
    const msg = this.bus.publish(this.config.id, to, type, taskId, payload);
    this.audit.record('message_sent', (payload.workflowId as string) ?? taskId, {
      messageId: msg.id, from: this.config.id, to, type,
    }, { agentId: this.config.id });
    return msg;
  }

  protected createArtifact(params: {
    type: ArtifactType;
    name: string;
    content: string;
    workflowId: string;
    nodeId: string;
    metadata?: Record<string, unknown>;
  }): Artifact {
    const artifact = this.artifacts.create({ ...params, createdBy: this.config.id });
    this.audit.record('artifact_created', params.workflowId, {
      artifactId: artifact.id, name: artifact.name, type: artifact.type,
    }, { agentId: this.config.id, nodeId: params.nodeId });
    return artifact;
  }

  protected recordDecision(
    workflowId: string,
    summary: string,
    rationale: string
  ): Decision {
    const decision: Decision = {
      summary,
      rationale,
      decidedBy: this.config.id,
      decidedAt: new Date().toISOString(),
    };
    this.audit.record('decision_recorded', workflowId, { decision }, { agentId: this.config.id });
    return decision;
  }

  protected buildRisk(severity: Risk['severity'], summary: string, mitigation?: string): Risk {
    return { severity, summary, mitigation };
  }

  protected async reason(prompt: string): Promise<Record<string, unknown>> {
    const systemPrompt = `You are ${this.config.role}. ${this.config.description}
Skills: ${this.config.skills.join(', ')}.
Respond with structured JSON only.`;

    try {
      const response = await this.llm.complete(prompt, systemPrompt);
      return JSON.parse(response.content);
    } catch {
      if (this.config.fallbackLlm) {
        logger.warn(this.config.id, 'Primary LLM failed, using fallback');
        const fallback = createLLMProvider(this.config.fallbackLlm);
        const response = await fallback.complete(prompt, systemPrompt);
        return JSON.parse(response.content);
      }
      throw new Error(`LLM reasoning failed for agent ${this.config.id}`);
    }
  }

  protected log(msg: string, data?: unknown): void {
    logger.info(this.config.id, msg, data);
  }

  protected onMessage(message: Message): void {
    logger.debug(this.config.id, `Received [${message.type}] from ${message.from}`);
  }

  getInfo() {
    return {
      id: this.config.id,
      role: this.config.role,
      description: this.config.description,
      status: this.status,
      llm: this.config.llm,
      tools: this.config.tools,
      skills: this.config.skills,
      signal: this.signals.get(this.config.id),
    };
  }
}
