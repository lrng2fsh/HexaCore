import { Workflow, TaskNode, TaskStatus } from '../../types';
import { AgentRegistry } from '../agent-registry/AgentRegistry';
import { generateId } from '../../utils/id';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const SESSION_DIR = path.resolve(__dirname, '../../../../runtime/sessions');

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();

  constructor(private registry: AgentRegistry) {}

  createWorkflow(name: string, description: string, nodes: Omit<TaskNode, 'status' | 'artifacts'>[]): Workflow {
    const workflow: Workflow = {
      id: generateId('wf'),
      name,
      description,
      status: 'pending',
      nodes: nodes.map((n) => ({ ...n, status: 'pending', artifacts: [] })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.set(workflow.id, workflow);
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

    // DAG execution — process nodes in dependency order
    const completed = new Set<string>();
    const maxIterations = workflow.nodes.length * 2;
    let iterations = 0;

    while (completed.size < workflow.nodes.length) {
      if (++iterations > maxIterations) {
        workflow.status = 'failed';
        logger.error('WorkflowEngine', 'Workflow stuck — possible circular dependency');
        break;
      }

      const ready = workflow.nodes.filter(
        (n) =>
          n.status === 'pending' &&
          n.dependencies.every((dep) => completed.has(dep))
      );

      if (ready.length === 0) {
        const blocked = workflow.nodes.filter((n) => n.status === 'pending');
        if (blocked.length > 0) {
          blocked.forEach((n) => (n.status = 'blocked'));
          workflow.status = 'failed';
          logger.error('WorkflowEngine', 'Workflow blocked — unresolvable dependencies');
        }
        break;
      }

      // Execute ready nodes (sequential MVP — parallel extension point here)
      for (const node of ready) {
        await this.executeNode(workflow, node, completed);
      }
    }

    if (workflow.status === 'running') {
      const allDone = workflow.nodes.every((n) => n.status === 'done');
      workflow.status = allDone ? 'done' : 'failed';
    }

    workflow.updatedAt = new Date().toISOString();
    this.persist(workflow);
    logger.info('WorkflowEngine', `Workflow ${workflowId} finished: ${workflow.status}`);
    return workflow;
  }

  private async executeNode(workflow: Workflow, node: TaskNode, completed: Set<string>): Promise<void> {
    const agent = this.registry.get(node.assigned_agent);
    if (!agent) {
      node.status = 'failed';
      node.error = `Agent '${node.assigned_agent}' not found`;
      logger.error('WorkflowEngine', node.error);
      return;
    }

    node.status = 'running';
    node.startedAt = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();
    agent.status = 'busy';
    logger.info('WorkflowEngine', `Running node ${node.id} via ${node.assigned_agent}`);

    try {
      const output = await agent.executeTask(node);
      node.output = output;
      node.status = 'done';
      node.completedAt = new Date().toISOString();
      completed.add(node.id);
      agent.status = 'idle';
      logger.info('WorkflowEngine', `Node ${node.id} completed`);
    } catch (err) {
      node.status = 'failed';
      node.error = String(err);
      agent.status = 'error';
      logger.error('WorkflowEngine', `Node ${node.id} failed`, err);
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
