"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
class GroqProvider {
    apiKey;
    model;
    logger = new common_1.Logger(GroqProvider.name);
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generateCompletion(messages, tools, options = {}) {
        const client = new groq_sdk_1.default({ apiKey: this.apiKey, timeout: 15000, maxRetries: 1 });
        const groqMessages = messages.map(m => ({
            role: m.role,
            content: m.content,
            ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
            ...(m.name ? { name: m.name } : {}),
        }));
        const groqTools = tools?.map(t => ({
            type: 'function',
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }));
        const attemptModel = async (targetModel) => {
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
                const toolCalls = (msg.tool_calls || []).map((tc) => ({
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
            }
            catch (err) {
                this.logger.warn(`Groq completion error for model ${targetModel}: ${err.message}`);
                return null;
            }
        };
        const primaryResult = await attemptModel(this.model || 'llama-3.3-70b-versatile');
        if (primaryResult)
            return primaryResult;
        const fallbackModel = 'llama-3.1-8b-instant';
        if (this.model !== fallbackModel) {
            this.logger.log(`[GroqProvider] Retrying completion with fallback model ${fallbackModel}`);
            const fallbackResult = await attemptModel(fallbackModel);
            if (fallbackResult)
                return fallbackResult;
        }
        return { content: null, toolCalls: [], finishReason: 'error' };
    }
}
exports.GroqProvider = GroqProvider;
//# sourceMappingURL=groq.provider.js.map