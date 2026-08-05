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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiIntentRouterExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiIntentRouterExecutor = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../../prisma/prisma.service");
class AiIntentRouterSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                intents: { type: 'array', items: { type: 'string' } },
                fallbackBranch: { type: 'string' },
            },
        };
    }
}
let AiIntentRouterExecutor = AiIntentRouterExecutor_1 = class AiIntentRouterExecutor {
    prisma;
    llmFactory;
    type = 'aiIntentRouter';
    schema = new AiIntentRouterSchema();
    logger = new common_1.Logger(AiIntentRouterExecutor_1.name);
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing AI Intent Router for instance ${context.instanceId}`);
        const userMessage = context.variables.lastMessageText || 'Hello';
        const intentList = nodeData.intents || ['sales', 'support', 'billing', 'general'];
        try {
            const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: context.shopId } });
            const llm = await this.llmFactory.create(config || {});
            const systemPrompt = `You are an intent classification system for a business.
Analyze the customer's message and classify it into EXACTLY ONE of the following intent categories:
${intentList.map((i) => `- ${i}`).join('\n')}

Respond ONLY with the category name string. Nothing else.`;
            const response = await llm.generateCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ]);
            const classified = (response.content || '').trim().toLowerCase();
            const match = intentList.find((i) => i.toLowerCase() === classified) || nodeData.fallbackBranch || 'general';
            this.logger.log(`[Workflow Intent Router] Classified message "${userMessage}" as intent: ${match}`);
            context.variables.detectedIntent = match;
            return { status: 'continue', branch: match };
        }
        catch (error) {
            this.logger.error(`[Workflow Intent Router Error] ${error.message}`);
            return { status: 'continue', branch: nodeData.fallbackBranch || 'general' };
        }
    }
};
exports.AiIntentRouterExecutor = AiIntentRouterExecutor;
exports.AiIntentRouterExecutor = AiIntentRouterExecutor = AiIntentRouterExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => llm_provider_factory_1.LlmProviderFactory))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiIntentRouterExecutor);
//# sourceMappingURL=ai-intent-router.node.js.map