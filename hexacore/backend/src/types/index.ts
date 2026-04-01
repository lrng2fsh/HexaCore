// ─── Primitives ──────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline' | 'waiting';
export type TaskStatus = 'pending' | 'running' | 'blocked' | 'done' | 'failed';
export type LLMProviderName = 'openai' | 'anthropic' | 'ollama' | 'mock';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TaskCategory = 'bug' | 'feature' | 'incident' | 'release' | 'analysis';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ArtifactType =
  | 'log'
  | 'report'
  | 'diff'
  | 'sql'
  | 'test_result'
  | 'build_output'
  | 'config_snapshot'
  | 'decision_note';

export type MessageType =
  | 'question'
  | 'finding'
  | 'handoff'
  | 'risk'
  | 'approval_request'
  | 'result'
  | 'status_update'
  | 'artifact_ready'
  | 'blocked'
  | 'escalation';

// ─── LLM Config ──────────────────────────────────────────────────────────────

export interface LLMConfig {
  provider: LLMProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// ─── Agent Config ─────────────────────────────────────────────────────────────

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

// ─── Task Contracts ───────────────────────────────────────────────────────────

export interface TaskRequest {
  title: string;
  description: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface TaskExecutionContext {
  workflowId: string;
  nodeId: string;
  assignedAgentId: string;
  taskType: string;
  instruction: string;
  dependencies: string[];
  inputArtifacts: Artifact[];
  sharedFacts: string[];
  upstreamOutputs: Record<string, AgentTaskResult>;
}

// ─── Artifact ─────────────────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  content: string;
  createdBy: string;
  createdAt: string;
  workflowId: string;
  nodeId: string;
  metadata?: Record<string, unknown>;
}

// ─── Risk & Decision ──────────────────────────────────────────────────────────

export interface Risk {
  severity: RiskSeverity;
  summary: string;
  mitigation?: string;
}

export interface Decision {
  summary: string;
  rationale: string;
  decidedBy: string;
  decidedAt: string;
}

// ─── Agent Task Result ────────────────────────────────────────────────────────

export interface AgentTaskResult {
  status: 'success' | 'failed' | 'blocked';
  summary: string;
  findings: string[];
  risks: Risk[];
  artifacts: Artifact[];
  decisions: Decision[];
  nextActions?: string[];
  handoffRecommendations?: string[];
  rawOutput?: Record<string, unknown>;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  task_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ─── Workflow / Task Node ─────────────────────────────────────────────────────

export interface TaskNode {
  id: string;
  type: string;
  assigned_agent: string;
  status: TaskStatus;
  dependencies: string[];
  artifacts: string[];           // artifact IDs
  input?: Record<string, unknown>;
  output?: AgentTaskResult;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: 'pending' | 'running' | 'done' | 'failed';
  nodes: TaskNode[];
  artifacts: Artifact[];         // all artifacts produced by this workflow
  auditTrail: AuditEvent[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'workflow_created'
  | 'node_started'
  | 'node_completed'
  | 'node_failed'
  | 'message_sent'
  | 'artifact_created'
  | 'decision_recorded'
  | 'approval_requested'
  | 'agent_blocked'
  | 'workflow_completed'
  | 'workflow_failed';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  workflowId: string;
  nodeId?: string;
  agentId?: string;
  timestamp: string;
  detail: Record<string, unknown>;
}

// ─── Activity Signal ──────────────────────────────────────────────────────────

export type SignalStatus = 'idle' | 'active' | 'blocked' | 'waiting' | 'complete' | 'error';

export interface AgentActivitySignal {
  agentId: string;
  workflowId: string;
  currentTaskId?: string;
  status: SignalStatus;
  activityLevel: number;   // 0–100
  lastUpdatedAt: string;
  lastMessage?: string;
  linkedAgents?: string[];
}

// ─── Tool Types ───────────────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolAdapter {
  name: string;
  execute(command: string, args?: Record<string, unknown>): Promise<ToolResult>;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface AgentInfo {
  id: string;
  role: string;
  description: string;
  status: AgentStatus;
  llm: LLMConfig;
  tools: string[];
  skills: string[];
  signal?: AgentActivitySignal;
}
