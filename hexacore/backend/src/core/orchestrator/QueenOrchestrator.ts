import { TaskRequest, Workflow } from '../../types';
import { AgentRegistry } from '../agent-registry/AgentRegistry';
import { WorkflowEngine } from '../workflow-engine/WorkflowEngine';
import { MessageBus } from '../message-bus/MessageBus';
import { ToolRegistry } from '../tool-adapters/ToolRegistry';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';
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
  private queen?: QueenAgent;

  constructor() {
    this.bus = MessageBus.getInstance();
    this.tools = new ToolRegistry();
    this.knowledge = new KnowledgeBase();
    this.registry = new AgentRegistry(this.bus, this.tools, this.knowledge);
    this.engine = new WorkflowEngine(this.registry);
  }

  async initialize(): Promise<void> {
    logger.info('Orchestrator', 'Initializing Hexacore...');

    // Register tools
    this.tools.register(new FileAdapter());
    this.tools.register(new SqlAdapter());
    this.tools.register(new BuildAdapter());

    // Load agents from config
    const configDir = path.resolve(__dirname, '../../../../config/agents');
    this.registry.loadFromDirectory(configDir);

    // Wire Queen to engine
    const queenAgent = this.registry.get('queen');
    if (queenAgent instanceof QueenAgent) {
      queenAgent.setEngine(this.engine);
      this.queen = queenAgent;
    }

    logger.info('Orchestrator', 'Hexacore initialized', {
      agents: this.registry.list().map((a) => a.id),
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

  getMessages(task_id?: string) {
    return this.bus.getMessages(task_id);
  }
}
