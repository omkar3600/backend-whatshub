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
var BusinessAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAgentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_provider_factory_1 = require("../providers/llm-provider.factory");
const tool_registry_1 = require("../tools/registry/tool.registry");
let BusinessAgentService = BusinessAgentService_1 = class BusinessAgentService {
    prisma;
    llmFactory;
    toolRegistry;
    logger = new common_1.Logger(BusinessAgentService_1.name);
    constructor(prisma, llmFactory, toolRegistry) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
        this.toolRegistry = toolRegistry;
    }
    async query(shopId, question) {
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        if (!config?.isActive) {
            return { answer: 'AI is not configured for your business. Please enable it in Chatbot settings.' };
        }
        const llm = await this.llmFactory.create(config);
        const businessToolNames = ['get_conversation_stats', 'get_lead_pipeline_summary', 'get_campaign_stats', 'get_campaigns', 'get_hot_leads', 'search_contacts', 'get_business_info'];
        const tools = businessToolNames.map(n => this.toolRegistry.get(n)).filter(Boolean);
        const toolDefs = tools.map(t => ({ name: t.name, description: t.description, parameters: t.inputSchema }));
        const toolCtx = { shopId };
        const messages = [
            {
                role: 'system',
                content: `You are an AI business intelligence assistant for a WhatsApp business. Answer the owner's questions using the available tools. Be concise and data-driven. Today's date: ${new Date().toLocaleDateString('en-IN')}.`,
            },
            { role: 'user', content: question },
        ];
        for (let i = 0; i < 5; i++) {
            const response = await llm.generateCompletion(messages, toolDefs, { temperature: 0.2 });
            if (!response.toolCalls.length || response.finishReason === 'stop') {
                return { answer: response.content || 'No data available.' };
            }
            messages.push({ role: 'assistant', content: response.content || '' });
            for (const tc of response.toolCalls) {
                const tool = tools.find(t => t.name === tc.name);
                if (!tool)
                    continue;
                const result = await tool.execute(toolCtx, tc.arguments);
                messages.push({ role: 'tool', content: JSON.stringify(result.data || result), tool_call_id: tc.id, name: tc.name });
            }
        }
        return { answer: 'I was unable to retrieve the information at this time.' };
    }
};
exports.BusinessAgentService = BusinessAgentService;
exports.BusinessAgentService = BusinessAgentService = BusinessAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory,
        tool_registry_1.ToolRegistry])
], BusinessAgentService);
//# sourceMappingURL=business-agent.service.js.map