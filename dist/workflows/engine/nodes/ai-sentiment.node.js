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
exports.AiSentimentExecutor = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AiSentimentExecutor = class AiSentimentExecutor {
    prisma;
    llmFactory;
    type = 'aiSentiment';
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
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: context.shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `Analyze customer sentiment from the text. Choose EXACTLY ONE category from: ["positive", "neutral", "negative", "angry", "urgent"].
Text: "${inputText}"
Category:`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are a sentiment classification engine.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.1 });
            const category = (response.content || 'neutral').toLowerCase().trim();
            const validCategories = ['positive', 'neutral', 'negative', 'angry', 'urgent'];
            const finalSentiment = validCategories.find(c => category.includes(c)) || 'neutral';
            context.variables.lastSentiment = finalSentiment;
            return {
                status: 'continue',
                branch: finalSentiment,
            };
        }
        catch (e) {
            return {
                status: 'continue',
                branch: 'neutral',
            };
        }
    }
};
exports.AiSentimentExecutor = AiSentimentExecutor;
exports.AiSentimentExecutor = AiSentimentExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiSentimentExecutor);
//# sourceMappingURL=ai-sentiment.node.js.map