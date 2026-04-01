import { TaskRequest, Workflow } from '../../types';
import { AgentRegistry } from '../agent-registry/AgentRegistry';
import { WorkflowEngine } from '../workflow-engine/WorkflowEngine';
import { MessageBus } from '../message-bus/MessageBus';
import { ToolRegistry } from '../tool-adapters/ToolRegistry';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';
import { ArtifactStore } from '../artifacts/ArtifactStore';
import { SignalService } from '../signals/SignalService';
import { AuditTrail } from '../audit/AuditTrail';
import { QueenAgent } from '../../agents/queen/QueenAgent';
import { FileAdapter } from '../tool-adapters/adapters/FileAdapter';
import { SqlAdapter } from '../tool-adapters/adapters/SqlAdapter';
import { BuildAdapter } from '../tool-adapters/adapters/BuildAdapter';
import { logger } from '../../utils/logger';
import path from 'path';

export class QueenOrchestrator {
  private registry: AgentRegistry;
  private engine: WorkflowEngine;
  private bus: MessageBus;
  private tools: ToolRegistry;
  private knowledge: KnowledgeBase;
  private artifactStore: ArtifactStore;
  private signals: SignalService;
  private audit: AuditTrail;
  private queen?: QueenAgent;

  constructor() {
    this.bus = MessageBus.getInstance();
    this.tools = new ToolRegistry();
    this.knowledge = new KnowledgeBase();
    this.artifactStore = ArtifactStore.getInstance();
    this.signals = SignalService.getInstance();
    this.audit = AuditTrail.getInstance();
    this.registry = new AgentRegistry(this.bus, this.tools, this.knowledge);
    this.engine = new WorkflowEngine(this.registry);
  }

  async initialize(): Promise<void> {
    logger.info('Orchestrator', 'Initializing Hexacore...');

    this.tools.register(new FileAdapter());
    this.tools.register(new SqlAdapter());
    this.tools.register(new BuildAdapter());

    const configDir = path.resolve(__dirname, '../../../../config/agents');
    this.registry.loadFromDirectory(configDir);

    const queenAgent = this.registry.get('queen');
    if (queenAgent instanceof QueenAgent) {
      queenAgent.setEngine(this.engine);
      this.queen = queenAgent;
    }

    logger.info('Orchestrator', 'Hexacore initialized', {
      agents: this.registry.list().map(a => a.id),
      tools: this.tools.list(),
    });
  }

  async submitTask(request: TaskRequest): Promise<Workflow> {
    if (!this.queen) throw new Error('Queen agent not initialized');
    logger.info('Orchestrator', 'Task submitted', { title: request.title });
    return this.queen.intakeTask(request);
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.engine.getWorkflow(id);
  }

  getAllWorkflows(): Workflow[] {
    return this.engine.getAllWorkflows();
  }

  getAgents() {
    return this.registry.list();
  }

  getMessages(filter?: { task_id?: string; workflowId?: string }) {
    return this.bus.getMessages(filter);
  }

  getSignals(workflowId?: string) {
    return workflowId
      ? this.signals.getByWorkflow(workflowId)
      : this.signals.getAll();
  }

  getAuditTrail(workflowId: string) {
    return this.audit.getByWorkflow(workflowId);
  }

  getArtifacts(workflowId?: string) {
    return workflowId
      ? this.artifactStore.getByWorkflow(workflowId)
      : this.artifactStore.getAll();
  }

  getAgentActivity(agentId: string) {
    return {
      agent: this.registry.get(agentId)?.getInfo(),
      signal: this.signals.get(agentId),
      messages: this.bus.getByAgent(agentId),
    };
  }
}
