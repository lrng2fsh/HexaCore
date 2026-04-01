import { TaskNode } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';

export class AppAgent extends BaseAgent {
  async executeTask(task: TaskNode): Promise<Record<string, unknown>> {
    this.status = 'busy';
    this.log('Analyzing code', { taskType: task.type, taskId: task.id });

    const instruction = String(task.input?.instruction ?? 'Analyze the codebase for issues');

    // Use file tool if available
    if (this.config.tools.includes('file')) {
      const result = await this.tools.execute('file', 'list', { path: 'src' });
      this.log('File scan result', result);
    }

    const analysis = await this.reason(
      `Task: ${task.type}\nInstruction: ${instruction}\nContext: ${JSON.stringify(task.input)}\n
      Analyze the code and identify the root cause. Return structured findings.`
    );

    this.send('queen', 'finding', task.id, {
      agent: this.config.id,
      taskType: task.type,
      analysis,
    });

    this.log('Analysis complete', analysis);
    this.status = 'idle';
    return analysis;
  }
}
