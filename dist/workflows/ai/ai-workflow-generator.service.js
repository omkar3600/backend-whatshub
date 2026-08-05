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
var AiWorkflowGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiWorkflowGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiWorkflowGeneratorService = AiWorkflowGeneratorService_1 = class AiWorkflowGeneratorService {
    prisma;
    llmFactory;
    logger = new common_1.Logger(AiWorkflowGeneratorService_1.name);
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async generateGraphFromPrompt(shopId, prompt) {
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        const llm = await this.llmFactory.create(config || {});
        const systemPrompt = `You are a visual workflow automation architect. Translate the user prompt into a valid React Flow graph JSON for WhatsApp automation.
Available Node Types:
- trigger (source only)
- sendMessage
- delay
- condition
- waitReply
- aiAgent
- aiIntentRouter
- searchProducts
- askQuestion
- httpRequest
- crmAction
- abTestSplitter
- dataTransform
- forEach
- businessHours
- teamHandoff
- approvalNode

Output ONLY a JSON object with format:
{
  "nodes": [ { "id": "node_1", "type": "trigger", "data": { "label": "Start" }, "position": { "x": 250, "y": 0 } } ],
  "edges": [ { "id": "edge_1", "source": "node_1", "target": "node_2" } ],
  "explanation": "Brief description of the workflow logic."
}`;
        const response = await llm.generateCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
        ], [], { temperature: 0.2 });
        try {
            const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return {
                nodes: parsed.nodes || [],
                edges: parsed.edges || [],
                explanation: parsed.explanation || 'Workflow generated successfully.',
            };
        }
        catch (e) {
            this.logger.warn(`Failed to parse generated workflow graph: ${response.content}`);
            return {
                nodes: [
                    { id: '1', type: 'trigger', data: { label: 'Start Trigger' }, position: { x: 250, y: 0 } },
                    { id: '2', type: 'aiAgent', data: { label: 'AI Agent' }, position: { x: 250, y: 150 } },
                ],
                edges: [{ id: 'e1-2', source: '1', target: '2' }],
                explanation: 'Fallback workflow generated.',
            };
        }
    }
};
exports.AiWorkflowGeneratorService = AiWorkflowGeneratorService;
exports.AiWorkflowGeneratorService = AiWorkflowGeneratorService = AiWorkflowGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiWorkflowGeneratorService);
//# sourceMappingURL=ai-workflow-generator.service.js.map