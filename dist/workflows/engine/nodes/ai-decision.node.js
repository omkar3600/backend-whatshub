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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDecisionExecutor = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AiDecisionExecutor = class AiDecisionExecutor {
    prisma;
    llmFactory;
    type = 'aiDecision';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async execute(context, nodeData) {
        const inputText = nodeData.text || context.variables.lastMessageText || '';
        const allowedChoices = nodeData.choices || ['DISCOUNT', 'NO_DISCOUNT', 'HUMAN', 'FOLLOW_UP'];
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: context.shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `Evaluate the customer situation and select EXACTLY ONE choice from: ${JSON.stringify(allowedChoices)}.
Context/Text: "${inputText}"
Return JSON: { "decision": "CHOICE", "confidence": 0.95 }`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are an AI decision engine.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.1 });
            const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            const decision = allowedChoices.includes(parsed.decision) ? parsed.decision : allowedChoices[0];
            context.variables.lastDecision = decision;
            context.variables.decisionConfidence = parsed.confidence || 0.9;
            return {
                status: 'continue',
                branch: decision.toLowerCase(),
            };
        }
        catch (e) {
            return {
                status: 'continue',
                branch: allowedChoices[0].toLowerCase(),
            };
        }
    }
};
exports.AiDecisionExecutor = AiDecisionExecutor;
exports.AiDecisionExecutor = AiDecisionExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiDecisionExecutor);
//# sourceMappingURL=ai-decision.node.js.map