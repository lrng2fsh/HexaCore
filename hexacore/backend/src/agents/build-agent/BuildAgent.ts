import { TaskNode } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';

export class BuildAgent extends BaseAgent {
  async executeTask(task: TaskNode): Promise<Record<string, unknown>> {
    this.status = 'busy';
    this.log('Build task started', { taskType: task.type });

    const instruction = String(task.input?.instruction ?? 'Build and package the fix');

    // Run build steps via build tool
    let buildResult: unknown = {};
    let testResult: unknown = {};
    let packageResult: unknown = {};

    if (this.config.tools.includes('build')) {
      const compile = await this.tools.execute('build', 'compile', {});
      buildResult = compile.data;

      const tests = await this.tools.execute('build', 'test', {});
      testResult = tests.data;

      const pkg = await this.tools.execute('build', 'package', {});
      packageResult = pkg.data;
    }

    const analysis = await this.reason(
      `Task: ${task.type}\nInstruction: ${instruction}\n
      Build results: ${JSON.stringify(buildResult)}\nTest results: ${JSON.stringify(testResult)}\n
      Summarize the build outcome.`
    );

    this.send('queen', 'handoff', task.id, {
      agent: this.config.id,
      taskType: task.type,
      buildResult,
      testResult,
      packageResult,
      analysis,
    });

    this.log('Build complete', { buildResult, testResult, packageResult });
    this.status = 'idle';
    return { buildResult, testResult, packageResult, analysis };
  }
}
