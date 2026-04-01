import fs from 'fs';
import path from 'path';
import { AgentConfig } from '../../types';
import { BaseAgent } from './BaseAgent';
import { MessageBus } from '../message-bus/MessageBus';
import { ToolRegistry } from '../tool-adapters/ToolRegistry';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';
import { logger } from '../../utils/logger';

// Agent implementations
import { QueenAgent } from '../../agents/queen/QueenAgent';
import { AppAgent } from '../../agents/app-agent/AppAgent';
import { DBAAgent } from '../../agents/dba-agent/DBAAgent';
import { QAAgent } from '../../agents/qa-agent/QAAgent';
import { BuildAgent } from '../../agents/build-agent/BuildAgent';

type AgentConstructor = new (
  config: AgentConfig,
  bus: MessageBus,
  tools: ToolRegistry,
  knowledge: KnowledgeBase
) => BaseAgent;

const AGENT_CLASSES: Record<string, AgentConstructor> = {
  queen: QueenAgent,
  'app-agent': AppAgent,
  'dba-agent': DBAAgent,
  'qa-agent': QAAgent,
  'build-agent': BuildAgent,
};

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor(
    private bus: MessageBus,
    private tools: ToolRegistry,
    private knowledge: KnowledgeBase
  ) {}

  loadFromDirectory(configDir: string): void {
    if (!fs.existsSync(configDir)) {
      logger.warn('AgentRegistry', `Config dir not found: ${configDir}`);
      return;
    }
    const files = fs.readdirSync(configDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(configDir, file), 'utf-8');
      const config: AgentConfig = JSON.parse(raw);
      this.instantiate(config);
    }
    logger.info('AgentRegistry', `Loaded ${files.length} agents from ${configDir}`);
  }

  instantiate(config: AgentConfig): BaseAgent {
    const AgentClass = AGENT_CLASSES[config.id] ?? AGENT_CLASSES[config.role];
    if (!AgentClass) {
      throw new Error(`No agent class registered for id '${config.id}' or role '${config.role}'`);
    }
    const agent = new AgentClass(config, this.bus, this.tools, this.knowledge);
    this.agents.set(config.id, agent);
    logger.info('AgentRegistry', `Instantiated agent: ${config.id}`);
    return agent;
  }

  get(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  list() {
    return this.getAll().map((a) => a.getInfo());
  }
}
