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
var MemoryManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManagerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_provider_factory_1 = require("../providers/llm-provider.factory");
let MemoryManagerService = MemoryManagerService_1 = class MemoryManagerService {
    prisma;
    llmFactory;
    logger = new common_1.Logger(MemoryManagerService_1.name);
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async updateMemory(shopId, contactId, conversationId) {
        try {
            const recent = await this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { timestamp: 'desc' },
                take: 10,
            });
            if (recent.length < 3)
                return;
            const transcript = recent.reverse().map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');
            const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
            if (!config?.isActive)
                return;
            const llm = await this.llmFactory.create(config);
            const response = await llm.generateCompletion([
                { role: 'system', content: 'Extract customer preferences, interests, and purchase signals from this conversation transcript. Return JSON with keys: interests (array of strings), preferredLanguage (string), budgetSignal (string: low/medium/high/unknown), productInterest (array of strings). Be concise.' },
                { role: 'user', content: transcript },
            ], [], { maxTokens: 256 });
            if (response.content) {
                let extracted = {};
                try {
                    extracted = JSON.parse(response.content.replace(/```json\n?|```/g, '').trim());
                }
                catch { }
                const existing = await this.prisma.aiMemory.findUnique({ where: { contactId } });
                const currentPrefs = existing?.preferences || {};
                await this.prisma.aiMemory.upsert({
                    where: { contactId },
                    create: { shopId, contactId, preferences: extracted },
                    update: { preferences: { ...currentPrefs, ...extracted } },
                });
            }
        }
        catch (err) {
            this.logger.warn(`Memory update failed for contact ${contactId}: ${err.message}`);
        }
    }
    async generateSummary(shopId, conversationId) {
        try {
            const count = await this.prisma.message.count({ where: { conversationId } });
            if (count < 15)
                return;
            const msgs = await this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { timestamp: 'asc' },
                take: 30,
            });
            const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
            if (!config?.isActive)
                return;
            const transcript = msgs.map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');
            const llm = await this.llmFactory.create(config);
            const response = await llm.generateCompletion([
                { role: 'system', content: 'Summarize this WhatsApp conversation in 2-3 sentences. Focus on what the customer asked, what was resolved, and any pending items.' },
                { role: 'user', content: transcript },
            ], [], { maxTokens: 200 });
            if (response.content) {
                const lastMsg = msgs[msgs.length - 1];
                await this.prisma.aiConversationSummary.create({
                    data: {
                        shopId,
                        conversationId,
                        summary: response.content,
                        coveredUntil: lastMsg.timestamp,
                        messageCount: msgs.length,
                    },
                });
            }
        }
        catch (err) {
            this.logger.warn(`Summary generation failed for conversation ${conversationId}: ${err.message}`);
        }
    }
};
exports.MemoryManagerService = MemoryManagerService;
exports.MemoryManagerService = MemoryManagerService = MemoryManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], MemoryManagerService);
//# sourceMappingURL=memory-manager.service.js.map