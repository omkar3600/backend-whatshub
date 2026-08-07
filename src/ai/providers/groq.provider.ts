import { Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { LlmMessage, LlmProvider, LlmResponse, LlmToolDefinition } from './llm-provider.interface';

export class GroqProvider implements LlmProvider {
  private readonly logger = new Logger(GroqProvider.name);

  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generateCompletion(
    messages: LlmMessage[],
    tools?: LlmToolDefinition[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<LlmResponse> {
    const client = new Groq({ apiKey: this.apiKey, timeout: 15000, maxRetries: 1 });

    const groqMessages: any[] = messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
      ...(m.name ? { name: m.name } : {}),
    }));

    const groqTools = tools?.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const attemptModel = async (targetModel: string): Promise<LlmResponse | null> => {
      try {
        const response = await client.chat.completions.create({
          model: targetModel,
          messages: groqMessages,
          tools: groqTools?.length ? groqTools : undefined,
          tool_choice: groqTools?.length ? 'auto' : undefined,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 1024,
        });

        const choice = response.choices[0];
        const msg = choice.message;

        const toolCalls = (msg.tool_calls || []).map((tc: any) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || '{}'),
        }));

        return {
          content: msg.content || null,
          toolCalls,
          finishReason: choice.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
          },
        };
      } catch (err: any) {
        this.logger.warn(`Groq completion error for model ${targetModel}: ${err.message}`);
        return null;
      }
    };

    // 1. Try configured model
    const primaryResult = await attemptModel(this.model || 'llama-3.3-70b-versatile');
    if (primaryResult) return primaryResult;

    // 2. Fallback to fast model if primary fails
    const fallbackModel = 'llama-3.1-8b-instant';
    if (this.model !== fallbackModel) {
      this.logger.log(`[GroqProvider] Retrying completion with fallback model ${fallbackModel}`);
      const fallbackResult = await attemptModel(fallbackModel);
      if (fallbackResult) return fallbackResult;
    }

    return { content: null, toolCalls: [], finishReason: 'error' };
  }
}
