import { TaskNode, TaskRequest, Workflow } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';
import { WorkflowEngine } from '../../core/workflow-engine/WorkflowEngine';
import { generateId } from '../../utils/id';

export class QueenAgent extends BaseAgent {
  private engine?: WorkflowEngine;

  setEngine(engine: WorkflowEngine): void {
    this.engine = engine;
  }

  // Queen does NOT do specialist work — only orchestrates
  async executeTask(task: TaskNode): Promise<Record<string, unknown>> {
    this.status = 'busy';
    this.log('Queen received orchestration task', { taskId: task.id });

    const result = await this.reason(
      `Orchestration task: ${task.type}\nInput: ${JSON.stringify(task.input)}\nProduce a coordination summary.`
    );

    this.send('*', 'finding', task.id, {
      from: 'queen',
      summary: result,
      message: 'Queen coordination complete',
    });

    this.status = 'idle';
    return result;
  }

  async intakeTask(request: TaskRequest): Promise<Workflow> {
    if (!this.engine) throw new Error('WorkflowEngine not attached to Queen');

    this.log('Intake task', { title: request.title });

    // Queen generates the DAG based on the task
    const dag = this.buildDAG(request);

    const workflow = this.engine.createWorkflow(
      request.title,
      request.description,
      dag
    );

    this.send('*', 'finding', workflow.id, {
      message: `Queen created workflow: ${workflow.id}`,
      nodes: dag.map((n) => n.id),
    });

    this.log('Executing workflow', { workflowId: workflow.id });
    const result = await this.engine.execute(workflow.id);

    result.summary = this.buildSummary(result);

    this.send('*', 'result', workflow.id, {
      message: 'Workflow complete',
      status: result.status,
      summary: result.summary,
    });

    return result;
  }

  private buildDAG(request: TaskRequest): Omit<TaskNode, 'status' | 'artifacts'>[] {
    // Queen dynamically builds task graph based on request keywords
    const title = request.title.toLowerCase();

    if (title.includes('export') || title.includes('fix') || title.includes('bug')) {
      return this.exportFixDAG(request);
    }

    // Default generic DAG
    return [
      {
        id: generateId('task'),
        type: 'analyze',
        assigned_agent: 'app-agent',
        dependencies: [],
        input: { request },
      },
      {
        id: generateId('task'),
        type: 'validate',
        assigned_agent: 'qa-agent',
        dependencies: [],
        input: { request },
      },
    ];
  }

  private exportFixDAG(request: TaskRequest): Omit<TaskNode, 'status' | 'artifacts'>[] {
    const t1 = generateId('task');
    const t2 = generateId('task');
    const t3 = generateId('task');
    const t4 = generateId('task');
    const t5 = generateId('task');

    return [
      {
        id: t1,
        type: 'analyze_code',
        assigned_agent: 'app-agent',
        dependencies: [],
        input: { request, instruction: 'Analyze code for export failure root cause' },
      },
      {
        id: t2,
        type: 'check_schema',
        assigned_agent: 'dba-agent',
        dependencies: [],
        input: { request, instruction: 'Check database schema for export-related issues' },
      },
      {
        id: t3,
        type: 'reproduce_bug',
        assigned_agent: 'qa-agent',
        dependencies: [t1, t2],
        input: { request, instruction: 'Reproduce the export failure using findings from analysis' },
      },
      {
        id: t4,
        type: 'build_fix',
        assigned_agent: 'build-agent',
        dependencies: [t3],
        input: { request, instruction: 'Build and package the fix' },
      },
      {
        id: t5,
        type: 'validate_fix',
        assigned_agent: 'qa-agent',
        dependencies: [t4],
        input: { request, instruction: 'Validate the fix resolves the export failure' },
      },
    ];
  }

  private buildSummary(workflow: Workflow): string {
    const done = workflow.nodes.filter((n) => n.status === 'done').length;
    const total = workflow.nodes.length;
    const outputs = workflow.nodes
      .filter((n) => n.output)
      .map((n) => `[${n.assigned_agent}] ${JSON.stringify(n.output).slice(0, 100)}`)
      .join('\n');
    return `Workflow ${workflow.status.toUpperCase()}: ${done}/${total} tasks completed.\n${outputs}`;
  }
}
