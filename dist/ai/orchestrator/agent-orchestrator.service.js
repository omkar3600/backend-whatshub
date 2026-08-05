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
var AgentOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_provider_factory_1 = require("../providers/llm-provider.factory");
const tool_registry_1 = require("../tools/registry/tool.registry");
const context_builder_service_1 = require("./context-builder.service");
const ai_policy_engine_service_1 = require("../policy/ai-policy-engine.service");
let AgentOrchestratorService = class AgentOrchestratorService {
    static { AgentOrchestratorService_1 = this; }
    prisma;
    llmFactory;
    toolRegistry;
    contextBuilder;
    policyEngine;
    logger = new common_1.Logger(AgentOrchestratorService_1.name);
    static PROMPT_INJECTION_PATTERNS = [
        /ignore (all )?(previous|prior|above) instructions/i,
        /you are now/i,
        /new persona/i,
        /act as (an? )?admin/i,
        /reveal (your )?(system|instructions|prompt)/i,
    ];
    constructor(prisma, llmFactory, toolRegistry, contextBuilder, policyEngine) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
        this.toolRegistry = toolRegistry;
        this.contextBuilder = contextBuilder;
        this.policyEngine = policyEngine;
    }
    sanitizeInput(text) {
        let sanitized = text;
        for (const pattern of AgentOrchestratorService_1.PROMPT_INJECTION_PATTERNS) {
            if (pattern.test(sanitized)) {
                this.logger.warn(`[Security] Potential prompt injection detected: "${sanitized.slice(0, 80)}"`);
                sanitized = sanitized.replace(pattern, '[message removed]');
            }
        }
        return sanitized;
    }
    async run(opts) {
        const toolsUsed = [];
        const actionsQueued = [];
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: opts.shopId } });
        if (!config?.isActive) {
            return { text: null, toolsUsed: [], actionsQueued: [] };
        }
        const autonomyLevel = config.autonomyLevel ?? 2;
        const maxIterations = config.maxIterations ?? 8;
        const allowedTools = config.allowedTools;
        let llm;
        try {
            llm = await this.llmFactory.create(config);
        }
        catch (err) {
            this.logger.error(`LLM factory error: ${err.message}`);
            return { text: null, error: err.message, toolsUsed: [], actionsQueued: [] };
        }
        const sanitizedMessage = this.sanitizeInput(opts.message);
        if (!config.agentMode) {
            const messages = await this.contextBuilder.build({
                shopId: opts.shopId,
                contactId: opts.contactId,
                conversationId: opts.conversationId,
                systemPrompt: config.systemPrompt || 'You are a helpful customer support assistant.',
                businessInfo: config.businessInfo,
                agentName: config.agentName || 'AI Assistant',
                currentMessage: sanitizedMessage,
            });
            const response = await llm.generateCompletion(messages, [], { temperature: config.temperature });
            return { text: response.content || null, toolsUsed: [], actionsQueued: [] };
        }
        const availableTools = this.toolRegistry.getAvailableTools(autonomyLevel, allowedTools);
        const toolDefs = availableTools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
        }));
        const messages = await this.contextBuilder.build({
            shopId: opts.shopId,
            contactId: opts.contactId,
            conversationId: opts.conversationId,
            systemPrompt: [
                config.systemPrompt || 'You are a helpful AI business assistant.',
                `\nPersonality: ${config.agentPersonality || 'Professional, friendly, concise.'}`,
                '\nYou have access to tools to help customers and business owners. Use them intelligently.',
                '\nAlways think step by step. If a question is simple, answer directly without tools.',
                '\nIf you cannot help or the issue is complex/emotional, use escalate_to_human.',
            ].join(''),
            businessInfo: config.businessInfo,
            agentName: config.agentName || 'AI Assistant',
            currentMessage: sanitizedMessage,
        });
        const toolCtx = {
            shopId: opts.shopId,
            contactId: opts.contactId,
            conversationId: opts.conversationId,
        };
        const deadline = Date.now() + 25000;
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            if (Date.now() > deadline) {
                this.logger.warn(`[Agent] Timeout after ${iteration} iterations for shop ${opts.shopId}`);
                break;
            }
            const response = await llm.generateCompletion(messages, toolDefs, { temperature: config.temperature });
            if (response.finishReason === 'stop' || !response.toolCalls.length) {
                return { text: response.content, toolsUsed, actionsQueued };
            }
            messages.push({ role: 'assistant', content: response.content || '', ...{ tool_calls: response.toolCalls.map(tc => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } })) } });
            for (const tc of response.toolCalls) {
                const tool = this.toolRegistry.get(tc.name);
                if (!tool) {
                    messages.push({ role: 'tool', content: JSON.stringify({ error: `Tool ${tc.name} not found` }), tool_call_id: tc.id, name: tc.name });
                    continue;
                }
                const start = Date.now();
                let toolResult;
                let toolSuccess = true;
                let toolError;
                try {
                    const needsApproval = tool.requiresApproval(autonomyLevel);
                    if (needsApproval) {
                        await this.prisma.aiAction.create({
                            data: {
                                shopId: opts.shopId,
                                contactId: opts.contactId || null,
                                toolName: tc.name,
                                toolInput: tc.arguments,
                                riskLevel: tool.riskLevel,
                                rationale: `AI wants to ${tool.description.split('.')[0]}`,
                                status: 'pending',
                                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            },
                        });
                        actionsQueued.push(tc.name);
                        toolResult = { queued: true, message: `Action queued for business approval: ${tc.name}` };
                    }
                    else {
                        const result = await tool.execute(toolCtx, tc.arguments);
                        toolResult = result.data || result;
                        toolSuccess = result.success;
                        if (!result.success)
                            toolError = result.error;
                        toolsUsed.push(tc.name);
                    }
                }
                catch (err) {
                    toolSuccess = false;
                    toolError = err.message;
                    toolResult = { error: err.message };
                }
                const durationMs = Date.now() - start;
                await this.prisma.aiAuditLog.create({
                    data: {
                        shopId: opts.shopId,
                        contactId: opts.contactId || null,
                        toolName: tc.name,
                        toolInput: tc.arguments,
                        toolOutput: toolResult,
                        riskLevel: tool.riskLevel,
                        success: toolSuccess,
                        errorMessage: toolError || null,
                        durationMs,
                    },
                }).catch(() => { });
                messages.push({
                    role: 'tool',
                    content: JSON.stringify(toolResult),
                    tool_call_id: tc.id,
                    name: tc.name,
                });
            }
        }
        this.logger.warn(`[Agent] Max iterations reached for shop ${opts.shopId}`);
        return { text: 'I\'m looking into this for you. Please give me a moment.', toolsUsed, actionsQueued };
    }
};
exports.AgentOrchestratorService = AgentOrchestratorService;
exports.AgentOrchestratorService = AgentOrchestratorService = AgentOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory,
        tool_registry_1.ToolRegistry,
        context_builder_service_1.ContextBuilderService,
        ai_policy_engine_service_1.AiPolicyEngineService])
], AgentOrchestratorService);
//# sourceMappingURL=agent-orchestrator.service.js.map