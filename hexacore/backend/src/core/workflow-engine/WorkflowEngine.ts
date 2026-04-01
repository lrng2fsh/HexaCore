import { AgentTaskResult, Artifact, TaskExecutionContext, TaskNode, Workflow } from '../../types';
import { AgentRegistry } from '../agent-registry/AgentRegistry';
import { ArtifactStore } from '../artifacts/ArtifactStore';
import { AuditTrail } from '../audit/AuditTrail';
import { SignalService } from '../signals/SignalService';
import { generateId } from '../../utils/id';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const SESSION_DIR = path.resolve(__dirname, '../../../../runtime/sessions');

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private artifactStore = ArtifactStore.getInstance();
  private audit = AuditTrail.getInstance();
  private signals = SignalService.getInstance();

  constructor(private registry: AgentRegistry) {}

  createWorkflow(
    name: string,
    description: string,
    nodes: Omit<TaskNode, 'status' | 'artifacts' | 'output'>[],
    opts: { category?: Workflow['category']; priority?: Workflow['priority'] } = {}
  ): Workflow {
    const workflow: Workflow = {
      id: generateId('wf'),
      name,
      description,
      category: opts.category ?? 'bug',
      priority: opts.priority ?? 'medium',
      status: 'pending',
      nodes: nodes.map(n => ({ ...n, status: 'pending', artifacts: [] })),
      artifacts: [],
      auditTrail: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(workflow.id, workflow);
    this.audit.record('workflow_created', workflow.id, { name, nodeCount: nodes.length });
    this.persist(workflow);
    logger.info('WorkflowEngine', `Created workflow: ${workflow.id} — ${name}`);
    return workflow;
  }

  async execute(workflowId: string): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    workflow.status = 'running';
    workflow.updatedAt = new Date().toISOString();
    logger.info('WorkflowEngine', `Executing workflow: ${workflowId}`);

    const completed = new Set<string>();
    const completedOutputs: Record<string, AgentTaskResult> = {};
    const maxIterations = workflow.nodes.length * 2;
    let iterations = 0;

    while (completed.size < workflow.nodes.length) {
      if (++iterations > maxIterations) {
        workflow.status = 'failed';
        this.audit.record('workflow_failed', workflowId, { reason: 'circular dependency or stuck' });
        logger.error('WorkflowEngine', 'Workflow stuck — possible circular dependency');
        break;
      }

      const ready = workflow.nodes.filter(
        n => n.status === 'pending' && n.dependencies.every(dep => completed.has(dep))
      );

      if (ready.length === 0) {
        const blocked = workflow.nodes.filter(n => n.status === 'pending');
        if (blocked.length > 0) {
          blocked.forEach(n => {
            n.status = 'blocked';
            this.audit.record('node_failed', workflowId, { reason: 'blocked' }, { nodeId: n.id });
          });
          workflow.status = 'failed';
          this.audit.record('workflow_failed', workflowId, { reason: 'unresolvable dependencies' });
        }
        break;
      }

      // Sequential execution (parallel extension point: Promise.all(ready.map(...)))
      for (const node of ready) {
        await this.executeNode(workflow, node, completed, completedOutputs);
      }
    }

    if (workflow.status === 'running') {
      const allDone = workflow.nodes.every(n => n.status === 'done');
      workflow.status = allDone ? 'done' : 'failed';
      this.audit.record(
        allDone ? 'workflow_completed' : 'workflow_failed',
        workflowId,
        { nodesDone: completed.size, total: workflow.nodes.length }
      );
    }

    // Aggregate all artifacts produced during this workflow
    workflow.artifacts = this.artifactStore.getByWorkflow(workflowId);
    workflow.auditTrail = this.audit.getByWorkflow(workflowId);
    workflow.updatedAt = new Date().toISOString();
    this.persist(workflow);
    logger.info('WorkflowEngine', `Workflow ${workflowId} finished: ${workflow.status}`);
    return workflow;
  }

  private async executeNode(
    workflow: Workflow,
    node: TaskNode,
    completed: Set<string>,
    completedOutputs: Record<string, AgentTaskResult>
  ): Promise<void> {
    const agent = this.registry.get(node.assigned_agent);
    if (!agent) {
      node.status = 'failed';
      node.error = `Agent '${node.assigned_agent}' not found`;
      this.audit.record('node_failed', workflow.id, { error: node.error }, { nodeId: node.id });
      logger.error('WorkflowEngine', node.error);
      return;
    }

    node.status = 'running';
    node.startedAt = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();
    agent.status = 'busy';

    this.audit.record('node_started', workflow.id, {
      nodeId: node.id, type: node.type, agent: node.assigned_agent,
    }, { nodeId: node.id, agentId: node.assigned_agent });

    this.signals.emit(node.assigned_agent, workflow.id, 'active', {
      currentTaskId: node.id,
      lastMessage: `Starting ${node.type}`,
    });

    // Build upstream artifacts for context
    const inputArtifacts: Artifact[] = node.dependencies.flatMap(depId =>
      this.artifactStore.getByNode(depId)
    );

    // Build full execution context
    const ctx: TaskExecutionContext = {
      workflowId: workflow.id,
      nodeId: node.id,
      assignedAgentId: node.assigned_agent,
      taskType: node.type,
      instruction: String(node.input?.instruction ?? node.type),
      dependencies: node.dependencies,
      inputArtifacts,
      sharedFacts: [],
      upstreamOutputs: Object.fromEntries(
        node.dependencies
          .filter(d => completedOutputs[d])
          .map(d => [d, completedOutputs[d]])
      ),
    };

    // Inject workflowId into node input for agents
    node.input = { ...node.input, workflowId: workflow.id };

    logger.info('WorkflowEngine', `Running node ${node.id} [${node.type}] via ${node.assigned_agent}`);

    try {
      const result = await agent.executeTaskWithContext(ctx);
      node.output = result;
      node.status = result.status === 'blocked' ? 'blocked' : result.status === 'failed' ? 'failed' : 'done';
      node.completedAt = new Date().toISOString();

      // Attach artifact IDs to node
      node.artifacts = result.artifacts.map(a => a.id);

      if (node.status === 'done') {
        completed.add(node.id);
        completedOutputs[node.id] = result;
        agent.status = 'idle';
        this.audit.record('node_completed', workflow.id, {
          nodeId: node.id, summary: result.summary, artifactCount: result.artifacts.length,
        }, { nodeId: node.id, agentId: node.assigned_agent });
        this.signals.emit(node.assigned_agent, workflow.id, 'complete', {
          currentTaskId: node.id,
          lastMessage: result.summary,
          activityLevel: 100,
        });
      } else {
        agent.status = 'error';
        this.audit.record('node_failed', workflow.id, {
          nodeId: node.id, status: node.status,
        }, { nodeId: node.id, agentId: node.assigned_agent });
        this.signals.emit(node.assigned_agent, workflow.id, 'error', {
          currentTaskId: node.id,
          lastMessage: result.summary,
        });
      }
    } catch (err) {
      node.status = 'failed';
      node.error = String(err);
      agent.status = 'error';
      this.audit.record('node_failed', workflow.id, {
        nodeId: node.id, error: node.error,
      }, { nodeId: node.id, agentId: node.assigned_agent });
      this.signals.emit(node.assigned_agent, workflow.id, 'error', {
        currentTaskId: node.id, lastMessage: node.error,
      });
      logger.error('WorkflowEngine', `Node ${node.id} threw`, err);
    }

    this.persist(workflow);
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  private persist(workflow: Workflow): void {
    try {
      if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(SESSION_DIR, `${workflow.id}.json`),
        JSON.stringify(workflow, null, 2)
      );
    } catch {
      // non-fatal
    }
  }
}
