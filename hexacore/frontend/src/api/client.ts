const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
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

export interface TaskNode {
  id: string;
  type: string;
  assigned_agent: string;
  status: 'pending' | 'running' | 'blocked' | 'done' | 'failed';
  dependencies: string[];
  artifacts: string[];
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentInfo {
  id: string;
  role: string;
  description: string;
  status: string;
  llm: { provider: string; model: string };
  tools: string[];
  skills: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  task_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export const api = {
  submitTask: (title: string, description: string) =>
    request<Workflow>('/task', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  getWorkflow: (id: string) => request<Workflow>(`/workflow/${id}`),

  getWorkflows: () => request<Workflow[]>('/workflows'),

  getAgents: () => request<AgentInfo[]>('/agents'),

  getMessages: (task_id?: string) =>
    request<Message[]>(`/messages${task_id ? `?task_id=${task_id}` : ''}`),
};
