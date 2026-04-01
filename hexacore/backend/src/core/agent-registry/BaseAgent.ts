import { AgentConfig, AgentStatus, Message, TaskNode } from '../../types';
import { MessageBus } from '../message-bus/MessageBus';
import { ToolRegistry } from '../tool-adapters/ToolRegistry';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';
import { createLLMProvider, LLMProvider } from '../../models/LLMProvider';
import { logger } from '../../utils/logger';

export abstract class BaseAgent {
  protected llm: LLMProvider;
  protected bus: MessageBus;
  protected tools: ToolRegistry;
  protected knowledge: KnowledgeBase;
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
    this.llm = createLLMProvider(config.llm);

    // Subscribe to messages addressed to this agent
    this.bus.subscribe(config.id, (msg) => this.onMessage(msg));
    logger.info(config.id, `Agent initialized — role: ${config.role}`);
  }

  protected onMessage(message: Message): void {
    logger.debug(this.config.id, `Received message [${message.type}] from ${message.from}`);
  }

  abstract executeTask(task: TaskNode): Promise<Record<string, unknown>>;

  protected async reason(prompt: string): Promise<Record<string, unknown>> {
    const systemPrompt = `You are ${this.config.role}. ${this.config.description}
Your skills: ${this.config.skills.join(', ')}.
Respond with structured JSON only.`;

    try {
      const response = await this.llm.complete(prompt, systemPrompt);
      return JSON.parse(response.content);
    } catch (err) {
      // Fallback if LLM fails
      if (this.config.fallbackLlm) {
        logger.warn(this.config.id, 'Primary LLM failed, using fallback');
        const fallback = createLLMProvider(this.config.fallbackLlm);
        const response = await fallback.complete(prompt, systemPrompt);
        return JSON.parse(response.content);
      }
      throw err;
    }
  }

  protected send(to: string, type: Message['type'], task_id: string, payload: Record<string, unknown>): void {
    this.bus.publish(this.config.id, to, type, task_id, payload);
  }

  protected log(msg: string, data?: unknown): void {
    logger.info(this.config.id, msg, data);
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
    };
  }
}
