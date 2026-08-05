import { LlmMessage, LlmProvider, LlmResponse, LlmToolDefinition } from './llm-provider.interface';
export declare class GroqProvider implements LlmProvider {
    private readonly apiKey;
    private readonly model;
    private readonly logger;
    constructor(apiKey: string, model: string);
    generateCompletion(messages: LlmMessage[], tools?: LlmToolDefinition[], options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<LlmResponse>;
}
