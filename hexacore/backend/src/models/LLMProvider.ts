import { LLMConfig } from '../types';
import { logger } from '../utils/logger';

export interface LLMResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface LLMProvider {
  complete(prompt: string, systemPrompt?: string): Promise<LLMResponse>;
}

// ─── Mock Provider (default for MVP) ────────────────────────────────────────

export class MockLLMProvider implements LLMProvider {
  constructor(private config: LLMConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    logger.debug('MockLLM', `Completing prompt (${prompt.length} chars)`);
    await new Promise((r) => setTimeout(r, 200)); // simulate latency

    // Generate contextual mock responses based on prompt keywords
    const lower = prompt.toLowerCase();
    let content = '';

    if (lower.includes('analyze') || lower.includes('code')) {
      content = JSON.stringify({
        finding: 'Identified null reference in export handler at ExportService.ts:142',
        severity: 'high',
        recommendation: 'Add null check before accessing order.items',
        affectedFiles: ['src/services/ExportService.ts', 'src/models/Order.ts'],
      });
    } else if (lower.includes('schema') || lower.includes('database')) {
      content = JSON.stringify({
        finding: 'exports table missing index on status column, causing full table scan',
        severity: 'medium',
        recommendation: 'CREATE INDEX idx_exports_status ON exports(status)',
        affectedTables: ['exports', 'orders'],
      });
    } else if (lower.includes('reproduce') || lower.includes('test')) {
      content = JSON.stringify({
        reproduced: true,
        steps: ['Create order with 0 items', 'Trigger export', 'Observe NullReferenceException'],
        testCase: 'test_export_empty_order',
        evidence: 'Stack trace captured in logs/export-error-2024.log',
      });
    } else if (lower.includes('build') || lower.includes('compile')) {
      content = JSON.stringify({
        status: 'success',
        artifact: 'dist/app-fixed.zip',
        testsRun: 44,
        testsPassed: 44,
        coverage: '89%',
      });
    } else if (lower.includes('validate') || lower.includes('verify')) {
      content = JSON.stringify({
        validated: true,
        exportSuccess: true,
        regressionsPassed: true,
        summary: 'Fix verified — export now handles empty order gracefully',
      });
    } else {
      content = JSON.stringify({
        status: 'completed',
        message: 'Task processed successfully',
        timestamp: new Date().toISOString(),
      });
    }

    return { content, model: this.config.model, usage: { promptTokens: 100, completionTokens: 80 } };
  }
}

// ─── OpenAI Provider (stub — plug API key to activate) ──────────────────────

export class OpenAIProvider implements LLMProvider {
  constructor(private config: LLMConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    // Extension point: replace with real openai SDK call
    throw new Error('OpenAI provider not yet configured. Set OPENAI_API_KEY and enable in agent config.');
  }
}

// ─── Anthropic Provider (stub) ───────────────────────────────────────────────

export class AnthropicProvider implements LLMProvider {
  constructor(private config: LLMConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    throw new Error('Anthropic provider not yet configured.');
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createLLMProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai': return new OpenAIProvider(config);
    case 'anthropic': return new AnthropicProvider(config);
    case 'mock':
    default:
      return new MockLLMProvider(config);
  }
}
