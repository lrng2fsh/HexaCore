// ─── Agent Types ────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export type MessageType = 'question' | 'finding' | 'handoff' | 'risk' | 'approval_request' | 'result';
export type TaskStatus = 'pending' | 'running' | 'blocked' | 'done' | 'failed';
export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'mock';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentPermissions {
  canReadFiles: boolean;
  canWriteFiles: boolean;
  canExecuteCommands: boolean;
  canAccessDatabase: boolean;
  canApprove: boolean;
}

export interface AgentConfig {
  id: string;
  role: string;
  description: string;
  llm: LLMConfig;
  fallbackLlm?: LLMConfig;
  tools: string[];
  knowledgeSources: string[];
  permissions: AgentPermissions;
  communicationRules: string[];
  skills: string[];
}

// ─── Message Types ───────────────────────────────────────────────────────────

export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  task_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ─── Workflow / Task Types ───────────────────────────────────────────────────

export interface TaskNode {
  id: string;
  type: string;
  assigned_agent: string;
  status: TaskStatus;
  dependencies: string[];
  artifacts: string[];
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  nodes: TaskNode[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
}

// ─── Tool Types ──────────────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolAdapter {
  name: string;
  execute(command: string, args?: Record<string, unknown>): Promise<ToolResult>;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface TaskRequest {
  title: string;
  description: string;
  context?: Record<string, unknown>;
}

export interface AgentInfo {
  id: string;
  role: string;
  description: string;
  status: AgentStatus;
  llm: LLMConfig;
  tools: string[];
  skills: string[];
}
