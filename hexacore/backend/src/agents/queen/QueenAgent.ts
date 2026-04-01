import { AgentTaskResult, TaskExecutionContext, TaskNode, TaskRequest, Workflow } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';
import { WorkflowEngine } from '../../core/workflow-engine/WorkflowEngine';
import { generateId } from '../../utils/id';

export class QueenAgent extends BaseAgent {
  private engine?: WorkflowEngine;

  setEngine(engine: WorkflowEngine): void {
    this.engine = engine;
  }

  // Queen orchestrates only — no specialist work
  async executeTaskWithContext(ctx: TaskExecutionContext): Promise<AgentTaskResult> {
    this.status = 'busy';
    this.log('Queen coordination task', { nodeId: ctx.nodeId });
    this.emitSignal(ctx.workflowId, 'active', {
      taskId: ctx.nodeId,
      message: 'Coordinating workflow',
      activityLevel: 50,
    });

    const decision = this.recordDecision(
      ctx.workflowId,
      `Coordination checkpoint: ${ctx.taskType}`,
      'Queen reviewed upstream outputs and confirmed workflow progression'
    );

    this.sendStructuredMessage('*', 'status_update', ctx.nodeId, {
      workflowId: ctx.workflowId,
      message: 'Queen coordination complete',
      taskType: ctx.taskType,
    });

    this.emitSignal(ctx.workflowId, 'complete', { taskId: ctx.nodeId, activityLevel: 100 });
    this.status = 'idle';

    return {
      status: 'success',
      summary: `Queen coordination complete for ${ctx.taskType}`,
      findings: [],
      risks: [],
      artifacts: [],
      decisions: [decision],
    };
  }

  async intakeTask(request: TaskRequest): Promise<Workflow> {
    if (!this.engine) throw new Error('WorkflowEngine not attached to Queen');

    this.log('Intake task', { title: request.title });
    this.status = 'busy';

    const dag = this.buildDAG(request);
    const workflow = this.engine.createWorkflow(
      request.title,
      request.description,
      dag,
      { category: request.category ?? 'bug', priority: request.priority ?? 'medium' }
    );

    this.emitSignal(workflow.id, 'active', {
      message: `Workflow created: ${workflow.id} — ${dag.length} nodes`,
      activityLevel: 30,
      linkedAgents: dag.map(n => n.assigned_agent),
    });

    this.sendStructuredMessage('*', 'finding', workflow.id, {
      workflowId: workflow.id,
      message: `Queen created workflow: ${workflow.id}`,
      nodes: dag.map(n => ({ id: n.id, type: n.type, agent: n.assigned_agent })),
    });

    this.log('Executing workflow', { workflowId: workflow.id });
    const result = await this.engine.execute(workflow.id);

    // Build final summary from all node outputs
    result.summary = this.buildFinalSummary(result);

    // Record final decision
    const finalDecision = this.recordDecision(
      workflow.id,
      `Workflow ${result.status.toUpperCase()}: ${result.name}`,
      this.buildDecisionRationale(result)
    );

    // Create decision note artifact
    const decisionArtifact = this.createArtifact({
      type: 'decision_note',
      name: 'queen-summary.md',
      content: result.summary,
      workflowId: workflow.id,
      nodeId: 'queen',
      metadata: { status: result.status, nodeCount: result.nodes.length },
    });

    this.sendStructuredMessage('*', 'result', workflow.id, {
      workflowId: workflow.id,
      status: result.status,
      summary: result.summary,
      artifactId: decisionArtifact.id,
      totalArtifacts: result.artifacts.length,
    });

    this.emitSignal(workflow.id, result.status === 'done' ? 'complete' : 'error', {
      message: result.summary.slice(0, 120),
      activityLevel: result.status === 'done' ? 100 : 20,
    });

    this.status = 'idle';
    return result;
  }

  private buildDAG(request: TaskRequest): Omit<TaskNode, 'status' | 'artifacts' | 'output'>[] {
    const title = request.title.toLowerCase();
    if (title.includes('export') || title.includes('fix') || title.includes('bug')) {
      return this.exportFixDAG(request);
    }
    // Generic analysis DAG
    return [
      {
        id: generateId('task'),
        type: 'analyze',
        assigned_agent: 'app-agent',
        dependencies: [],
        input: { request, instruction: 'Analyze the codebase for issues', workflowId: '' },
      },
      {
        id: generateId('task'),
        type: 'validate',
        assigned_agent: 'qa-agent',
        dependencies: [],
        input: { request, instruction: 'Validate the system state', workflowId: '' },
      },
    ];
  }

  private exportFixDAG(request: TaskRequest): Omit<TaskNode, 'status' | 'artifacts' | 'output'>[] {
    const t1 = generateId('task');
    const t2 = generateId('task');
    const t3 = generateId('task');
    const t4 = generateId('task');
    const t5 = generateId('task');

    return [
      {
        id: t1, type: 'analyze_code', assigned_agent: 'app-agent',
        dependencies: [],
        input: { request, instruction: 'Analyze code for export failure root cause' },
      },
      {
        id: t2, type: 'check_schema', assigned_agent: 'dba-agent',
        dependencies: [],
        input: { request, instruction: 'Check database schema for export-related issues' },
      },
      {
        id: t3, type: 'reproduce_bug', assigned_agent: 'qa-agent',
        dependencies: [t1, t2],
        input: { request, instruction: 'Reproduce the export failure using upstream findings' },
      },
      {
        id: t4, type: 'build_fix', assigned_agent: 'build-agent',
        dependencies: [t3],
        input: { request, instruction: 'Build and package the null-check fix' },
      },
      {
        id: t5, type: 'validate_fix', assigned_agent: 'qa-agent',
        dependencies: [t4],
        input: { request, instruction: 'Validate the fix resolves the export failure with no regressions' },
      },
    ];
  }

  private buildFinalSummary(workflow: Workflow): string {
    const done = workflow.nodes.filter(n => n.status === 'done').length;
    const total = workflow.nodes.length;
    const allRisks = workflow.nodes
      .flatMap(n => n.output?.risks ?? [])
      .map(r => `[${r.severity.toUpperCase()}] ${r.summary}`);
    const allFindings = workflow.nodes
      .flatMap(n => n.output?.findings ?? [])
      .slice(0, 6);

    return [
      `# Workflow Summary: ${workflow.name}`,
      `**Status:** ${workflow.status.toUpperCase()} | **Progress:** ${done}/${total} tasks`,
      `**Artifacts:** ${workflow.artifacts.length} produced`,
      ``,
      `## Key Findings`,
      allFindings.map(f => `- ${f}`).join('\n'),
      ``,
      `## Risks Identified`,
      allRisks.length > 0 ? allRisks.map(r => `- ${r}`).join('\n') : '- None',
    ].join('\n');
  }

  private buildDecisionRationale(workflow: Workflow): string {
    const decisions = workflow.nodes.flatMap(n => n.output?.decisions ?? []);
    return decisions.map(d => `${d.decidedBy}: ${d.summary}`).join('; ') || 'Workflow executed to completion';
  }
}
