import { TaskNode } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';

export class QAAgent extends BaseAgent {
  async executeTask(task: TaskNode): Promise<Record<string, unknown>> {
    this.status = 'busy';
    this.log('QA task started', { taskType: task.type });

    const instruction = String(task.input?.instruction ?? 'Test and validate');

    const isValidation = task.type === 'validate_fix';
    const prompt = isValidation
      ? `Task: validate_fix\nInstruction: ${instruction}\nVerify the fix resolves the issue and no regressions exist.`
      : `Task: reproduce_bug\nInstruction: ${instruction}\nReproduce the reported failure and document evidence.`;

    const result = await this.reason(prompt);

    const messageType = isValidation ? 'result' : 'finding';
    this.send('queen', messageType, task.id, {
      agent: this.config.id,
      taskType: task.type,
      result,
    });

    this.log(`QA ${task.type} complete`, result);
    this.status = 'idle';
    return result;
  }
}
