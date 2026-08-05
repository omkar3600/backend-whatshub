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
exports.AiExtractionExecutor = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AiExtractionExecutor = class AiExtractionExecutor {
    prisma;
    llmFactory;
    type = 'aiExtraction';
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
        const extractionSchema = nodeData.schema || { category: 'string', budget: 'number' };
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: context.shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `Extract structured data from the following text based on this schema: ${JSON.stringify(extractionSchema)}.
Text: "${inputText}"
Return ONLY valid JSON matching the schema.`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are an AI entity extraction engine.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.1 });
            const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
            const extracted = JSON.parse(jsonStr);
            context.variables[`extracted_${nodeData.variableName || 'data'}`] = extracted;
            return {
                status: 'continue',
                branch: 'success',
            };
        }
        catch (e) {
            return {
                status: 'continue',
                branch: 'failure',
                error: e.message,
            };
        }
    }
};
exports.AiExtractionExecutor = AiExtractionExecutor;
exports.AiExtractionExecutor = AiExtractionExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiExtractionExecutor);
//# sourceMappingURL=ai-extraction.node.js.map