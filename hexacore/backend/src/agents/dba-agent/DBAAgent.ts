import { TaskNode } from '../../types';
import { BaseAgent } from '../../core/agent-registry/BaseAgent';

export class DBAAgent extends BaseAgent {
  async executeTask(task: TaskNode): Promise<Record<string, unknown>> {
    this.status = 'busy';
    this.log('Checking database schema', { taskType: task.type });

    const instruction = String(task.input?.instruction ?? 'Check database schema for issues');

    // Query schema via SQL tool
    let schemaInfo: unknown = {};
    if (this.config.tools.includes('sql')) {
      const schemaResult = await this.tools.execute('sql', 'schema', {});
      schemaInfo = schemaResult.data;

      const queryResult = await this.tools.execute('sql', 'query', {
        sql: 'SELECT * FROM exports WHERE status = "failed" LIMIT 10',
      });
      this.log('Failed exports query', queryResult.data);
    }

    const analysis = await this.reason(
      `Task: ${task.type}\nInstruction: ${instruction}\nSchema: ${JSON.stringify(schemaInfo)}\n
      Identify database-level issues related to the export failure.`
    );

    this.send('queen', 'finding', task.id, {
      agent: this.config.id,
      taskType: task.type,
      schemaInfo,
      analysis,
    });

    this.log('Schema analysis complete', analysis);
    this.status = 'idle';
    return { schemaInfo, analysis };
  }
}
