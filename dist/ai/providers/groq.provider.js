"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GroqProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let GroqProvider = GroqProvider_1 = class GroqProvider {
    apiKey;
    model;
    logger = new common_1.Logger(GroqProvider_1.name);
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generateCompletion(messages, tools, options = {}) {
        const client = new groq_sdk_1.default({ apiKey: this.apiKey });
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
        try {
            const response = await client.chat.completions.create({
                model: this.model,
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
            this.logger.error(`Groq completion error: ${err.message}`);
            return { content: null, toolCalls: [], finishReason: 'error' };
        }
    }
};
exports.GroqProvider = GroqProvider;
exports.GroqProvider = GroqProvider = GroqProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, String])
], GroqProvider);
//# sourceMappingURL=groq.provider.js.map