import { AgentTaskResult, TaskExecutionContext } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';

export class AppAgent extends BaseAgent {
  async executeTaskWithContext(ctx: TaskExecutionContext): Promise<AgentTaskResult> {
    this.status = 'busy';
    this.log('Code analysis started', { nodeId: ctx.nodeId, type: ctx.taskType });
    this.emitSignal(ctx.workflowId, 'active', {
      taskId: ctx.nodeId,
      message: 'Scanning codebase for root cause',
      activityLevel: 60,
    });

    // Scan files via tool
    let fileList: string[] = [];
    if (this.config.tools.includes('file')) {
      const result = await this.tools.execute('file', 'list', { path: 'src' });
      fileList = Array.isArray(result.data) ? result.data as string[] : [];
    }

    // Reason about the code
    const llmOutput = await this.reason(
      `Analyze code for: ${ctx.instruction}
Context: ${JSON.stringify({ taskType: ctx.taskType, fileList })}
Identify the root cause of the export failure. Return structured findings.`
    );

    // Build structured result
    const finding = String(llmOutput.finding ?? 'Null reference in ExportService.ts:142');
    const affectedFiles = (llmOutput.affectedFiles as string[]) ?? ['src/services/ExportService.ts'];

    // Create code analysis report artifact
    const reportContent = [
      `# Code Analysis Report`,
      `**Task:** ${ctx.taskType}`,
      `**Agent:** ${this.config.id}`,
      `**Timestamp:** ${new Date().toISOString()}`,
      ``,
      `## Finding`,
      finding,
      ``,
      `## Affected Files`,
      affectedFiles.map(f => `- ${f}`).join('\n'),
      ``,
      `## Recommendation`,
      String(llmOutput.recommendation ?? 'Add null check before accessing order.items'),
      ``,
      `## Raw LLM Output`,
      '```json',
      JSON.stringify(llmOutput, null, 2),
      '```',
    ].join('\n');

    const reportArtifact = this.createArtifact({
      type: 'report',
      name: 'code-analysis.md',
      content: reportContent,
      workflowId: ctx.workflowId,
      nodeId: ctx.nodeId,
      metadata: { affectedFiles, severity: llmOutput.severity },
    });

    // Ask DBAAgent about DB dependencies via MessageBus
    this.sendStructuredMessage('dba-agent', 'question', ctx.nodeId, {
      workflowId: ctx.workflowId,
      question: 'Does the exports table have any stored procedures or triggers that could cause null propagation?',
      context: { affectedFiles, finding },
    });

    // Report findings to Queen
    this.sendStructuredMessage('queen', 'finding', ctx.nodeId, {
      workflowId: ctx.workflowId,
      summary: finding,
      artifactId: reportArtifact.id,
      severity: llmOutput.severity ?? 'high',
    });

    this.emitSignal(ctx.workflowId, 'complete', {
      taskId: ctx.nodeId,
      message: finding,
      activityLevel: 100,
      linkedAgents: ['queen', 'dba-agent'],
    });

    this.status = 'idle';
    this.log('Code analysis complete', { finding });

    const decision = this.recordDecision(
      ctx.workflowId,
      'Root cause identified as null reference in ExportService',
      `LLM analysis of ${affectedFiles.length} files identified unguarded access to order.items`
    );

    return {
      status: 'success',
      summary: finding,
      findings: [
        finding,
        `Affected files: ${affectedFiles.join(', ')}`,
        String(llmOutput.recommendation ?? ''),
      ].filter(Boolean),
      risks: [
        this.buildRisk('high', 'Null reference causes unhandled exception in export path', 'Add null guard before order.items access'),
      ],
      artifacts: [reportArtifact],
      decisions: [decision],
      nextActions: ['DBAAgent should verify schema constraints', 'QAAgent should reproduce with empty order fixture'],
      handoffRecommendations: ['dba-agent: check exports table constraints', 'qa-agent: reproduce_bug'],
      rawOutput: llmOutput,
    };
  }
}
