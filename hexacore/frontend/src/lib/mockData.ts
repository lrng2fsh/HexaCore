export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline' | 'thinking';
export type TaskStatus = 'pending' | 'running' | 'blocked' | 'done' | 'failed';
export type MessageType = 'finding' | 'handoff' | 'result' | 'risk' | 'question' | 'approval_request';

export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: AgentStatus;
  model: string;
  tools: string[];
  skills: string[];
  currentTask?: string;
  confidence: number;
  messagesCount: number;
  outputCount: number;
  isQueen?: boolean;
  position?: { col: number; row: number };
}

export interface TaskNode {
  id: string;
  type: string;
  label: string;
  assigned_agent: string;
  status: TaskStatus;
  dependencies: string[];
  artifacts: string[];
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  nodes: TaskNode[];
  createdAt: string;
  summary?: string;
  riskLevel: 'low' | 'medium' | 'high';
  progress: number;
}

export interface HiveMessage {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  content: string;
  timestamp: string;
  taskId: string;
  payload?: Record<string, unknown>;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'report' | 'schema' | 'test' | 'build' | 'log';
  agent: string;
  size: string;
  timestamp: string;
  taskId: string;
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'queen',
    name: 'Queen',
    role: 'Queen Orchestrator',
    specialty: 'Task decomposition, DAG construction, agent coordination',
    status: 'busy',
    model: 'GPT-4o',
    tools: [],
    skills: ['orchestration', 'risk assessment', 'delegation', 'summary'],
    currentTask: 'Coordinating export fix workflow',
    confidence: 98,
    messagesCount: 24,
    outputCount: 6,
    isQueen: true,
    position: { col: 2, row: 1 },
  },
  {
    id: 'app-agent',
    name: 'AppAgent',
    role: 'Application Engineer',
    specialty: 'Code analysis, root cause analysis, TypeScript, Node.js',
    status: 'idle',
    model: 'GPT-4o',
    tools: ['file'],
    skills: ['code analysis', 'TypeScript', 'Node.js', 'API design'],
    currentTask: 'Analyzed ExportService.ts — null ref at line 142',
    confidence: 94,
    messagesCount: 8,
    outputCount: 3,
    position: { col: 1, row: 0 },
  },
  {
    id: 'dba-agent',
    name: 'DBAAgent',
    role: 'Database Administrator',
    specialty: 'Schema design, query optimization, index analysis',
    status: 'idle',
    model: 'GPT-4o',
    tools: ['sql'],
    skills: ['SQL', 'schema design', 'query optimization', 'indexing'],
    currentTask: 'Found missing index on exports.status',
    confidence: 91,
    messagesCount: 5,
    outputCount: 2,
    position: { col: 3, row: 0 },
  },
  {
    id: 'qa-agent',
    name: 'QAAgent',
    role: 'QA Engineer',
    specialty: 'Test automation, bug reproduction, regression testing',
    status: 'busy',
    model: 'GPT-4o',
    tools: ['file', 'build'],
    skills: ['test automation', 'bug reproduction', 'coverage analysis'],
    currentTask: 'Validating fix — running regression suite',
    confidence: 87,
    messagesCount: 11,
    outputCount: 4,
    position: { col: 1, row: 2 },
  },
  {
    id: 'build-agent',
    name: 'BuildAgent',
    role: 'Build Engineer',
    specialty: 'CI/CD, Docker, artifact management, deployment',
    status: 'idle',
    model: 'GPT-4o',
    tools: ['build', 'file'],
    skills: ['CI/CD', 'Docker', 'build automation', 'deployment'],
    currentTask: undefined,
    confidence: 100,
    messagesCount: 3,
    outputCount: 1,
    position: { col: 3, row: 2 },
  },
];

export const MOCK_WORKFLOW: Workflow = {
  id: 'wf-001',
  name: 'Fix Export Failure in QA',
  description: 'Null reference error in ExportService when processing empty orders',
  status: 'running',
  riskLevel: 'medium',
  progress: 72,
  createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  nodes: [
    {
      id: 't1',
      type: 'analyze_code',
      label: 'Analyze Code',
      assigned_agent: 'app-agent',
      status: 'done',
      dependencies: [],
      artifacts: ['analysis-report.json'],
      duration: '1m 12s',
      completedAt: new Date(Date.now() - 6 * 60000).toISOString(),
      output: { finding: 'Null ref at ExportService.ts:142', severity: 'high' },
    },
    {
      id: 't2',
      type: 'check_schema',
      label: 'Check Schema',
      assigned_agent: 'dba-agent',
      status: 'done',
      dependencies: [],
      artifacts: ['schema-analysis.json'],
      duration: '0m 58s',
      completedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      output: { finding: 'Missing index on exports.status', severity: 'medium' },
    },
    {
      id: 't3',
      type: 'reproduce_bug',
      label: 'Reproduce Bug',
      assigned_agent: 'qa-agent',
      status: 'done',
      dependencies: ['t1', 't2'],
      artifacts: ['reproduction-steps.md', 'error-trace.log'],
      duration: '2m 04s',
      completedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      output: { reproduced: true, testCase: 'test_export_empty_order' },
    },
    {
      id: 't4',
      type: 'build_fix',
      label: 'Build Fix',
      assigned_agent: 'build-agent',
      status: 'done',
      dependencies: ['t3'],
      artifacts: ['dist/app-fixed.zip'],
      duration: '1m 33s',
      completedAt: new Date(Date.now() - 1 * 60000).toISOString(),
      output: { artifact: 'dist/app-fixed.zip', tests: '44/44 passed' },
    },
    {
      id: 't5',
      type: 'validate_fix',
      label: 'Validate Fix',
      assigned_agent: 'qa-agent',
      status: 'running',
      dependencies: ['t4'],
      artifacts: [],
      startedAt: new Date(Date.now() - 45000).toISOString(),
    },
  ],
};

export const MOCK_MESSAGES: HiveMessage[] = [
  {
    id: 'm1', from: 'app-agent', to: 'queen', type: 'finding',
    content: 'Null reference identified at ExportService.ts:142 — order.items accessed without null check',
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    taskId: 't1',
  },
  {
    id: 'm2', from: 'dba-agent', to: 'queen', type: 'finding',
    content: 'Missing index on exports(status) causing full table scan on every export query',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    taskId: 't2',
  },
  {
    id: 'm3', from: 'queen', to: 'qa-agent', type: 'handoff',
    content: 'Reproduce the export failure using findings from AppAgent and DBAAgent',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    taskId: 't3',
  },
  {
    id: 'm4', from: 'qa-agent', to: 'queen', type: 'finding',
    content: 'Bug reproduced — empty order triggers NullReferenceException in export handler',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    taskId: 't3',
  },
  {
    id: 'm5', from: 'queen', to: 'build-agent', type: 'handoff',
    content: 'Build and package the fix for ExportService null check',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    taskId: 't4',
  },
  {
    id: 'm6', from: 'build-agent', to: 'queen', type: 'result',
    content: 'Build successful — 44/44 tests passing, artifact ready at dist/app-fixed.zip',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    taskId: 't4',
  },
  {
    id: 'm7', from: 'queen', to: 'qa-agent', type: 'handoff',
    content: 'Validate the fix resolves the export failure with no regressions',
    timestamp: new Date(Date.now() - 50000).toISOString(),
    taskId: 't5',
  },
  {
    id: 'm8', from: 'qa-agent', to: 'queen', type: 'risk',
    content: 'Validation in progress — 38/44 regression tests passed, 6 remaining',
    timestamp: new Date(Date.now() - 20000).toISOString(),
    taskId: 't5',
  },
];

export const MOCK_ARTIFACTS: Artifact[] = [
  { id: 'a1', name: 'analysis-report.json', type: 'report', agent: 'app-agent', size: '4.2 KB', timestamp: new Date(Date.now() - 6 * 60000).toISOString(), taskId: 't1' },
  { id: 'a2', name: 'schema-analysis.json', type: 'schema', agent: 'dba-agent', size: '2.8 KB', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), taskId: 't2' },
  { id: 'a3', name: 'reproduction-steps.md', type: 'report', agent: 'qa-agent', size: '1.1 KB', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), taskId: 't3' },
  { id: 'a4', name: 'error-trace.log', type: 'log', agent: 'qa-agent', size: '8.7 KB', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), taskId: 't3' },
  { id: 'a5', name: 'dist/app-fixed.zip', type: 'build', agent: 'build-agent', size: '2.4 MB', timestamp: new Date(Date.now() - 60000).toISOString(), taskId: 't4' },
];
