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
exports.AiCopilotService = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiCopilotService = class AiCopilotService {
    prisma;
    llmFactory;
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async editGraphWithInstruction(shopId, graph, instruction) {
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `You are an expert AI Workflow Architect for WhatsHub.
Current Workflow Graph: ${JSON.stringify(graph)}

User Instruction: "${instruction}"

Modify the React Flow graph according to the user instruction. Keep existing valid nodes where appropriate, add new nodes if needed, and update edges cleanly.
Return a JSON object matching this exact structure:
{
  "nodes": [...],
  "edges": [...],
  "explanation": "Brief explanation of changes made"
}`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are an AI Workflow Copilot for modifying visual workflow graphs.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.2 });
            const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return {
                nodes: parsed.nodes || graph.nodes,
                edges: parsed.edges || graph.edges,
                explanation: parsed.explanation || 'Graph updated based on instruction.',
            };
        }
        catch (e) {
            return {
                nodes: graph.nodes,
                edges: graph.edges,
                explanation: `Failed to edit graph: ${e.message}`,
            };
        }
    }
    async explainWorkflowGraph(shopId, graph) {
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `Explain the following visual workflow graph in simple business terms:
Graph: ${JSON.stringify(graph)}

Summarize step-by-step how customer messages flow through this workflow.`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are an AI Workflow Explainer.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.3 });
            return { explanation: response.content || 'Workflow graph consists of triggers and action nodes.' };
        }
        catch (e) {
            return { explanation: 'Could not generate explanation.' };
        }
    }
};
exports.AiCopilotService = AiCopilotService;
exports.AiCopilotService = AiCopilotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiCopilotService);
//# sourceMappingURL=ai-copilot.service.js.map