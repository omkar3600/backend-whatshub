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
var LeadScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadScoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_provider_factory_1 = require("../providers/llm-provider.factory");
const chat_gateway_1 = require("../../chat/chat.gateway");
let LeadScoringService = LeadScoringService_1 = class LeadScoringService {
    prisma;
    llmFactory;
    chatGateway;
    logger = new common_1.Logger(LeadScoringService_1.name);
    constructor(prisma, llmFactory, chatGateway) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
        this.chatGateway = chatGateway;
    }
    async scoreContact(shopId, contactId, conversationId) {
        try {
            const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
            if (!config?.isActive)
                return;
            const messages = await this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { timestamp: 'desc' },
                take: 20,
            });
            if (messages.length < 2)
                return;
            const transcript = messages.reverse().map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');
            const llm = await this.llmFactory.create(config);
            const response = await llm.generateCompletion([
                {
                    role: 'system',
                    content: `You are a sales intelligence analyst. Analyze this WhatsApp conversation and return a JSON object with:
- score (integer 0-100): purchase intent score
- stage (one of: NEW, INTERESTED, QUALIFIED, PRODUCT_SELECTED, NEGOTIATING, PAYMENT_PENDING, PURCHASED, INACTIVE)
- intent (string, 1 sentence describing what customer wants)
- sentiment (positive, neutral, or negative)
- urgency (low, medium, or high)
- followUpRequired (boolean, true if customer has shown interest but hasn't committed)
Return ONLY valid JSON.`,
                },
                { role: 'user', content: transcript },
            ], [], { maxTokens: 300, temperature: 0.2 });
            if (!response.content)
                return;
            let scored;
            try {
                scored = JSON.parse(response.content.replace(/```json\n?|```/g, '').trim());
            }
            catch {
                this.logger.warn(`Failed to parse lead score JSON: ${response.content}`);
                return;
            }
            const prevScore = await this.prisma.aiLeadScore.findUnique({ where: { contactId } });
            const newScore = await this.prisma.aiLeadScore.upsert({
                where: { contactId },
                create: { shopId, contactId, ...scored, lastScoredAt: new Date() },
                update: { ...scored, lastScoredAt: new Date() },
            });
            await this.prisma.contact.update({ where: { id: contactId }, data: { aiLeadStage: scored.stage } }).catch(() => { });
            const threshold = config.hotLeadThreshold ?? 70;
            if (newScore.score >= threshold && (!prevScore || prevScore.score < threshold)) {
                const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
                this.chatGateway.server?.to(shopId).emit('hotLead', {
                    contactId,
                    name: contact?.name,
                    phone: contact?.phone,
                    score: newScore.score,
                    intent: scored.intent,
                });
                this.logger.log(`[Lead] Hot lead detected: ${contact?.name} (score: ${newScore.score}) for shop ${shopId}`);
            }
        }
        catch (err) {
            this.logger.warn(`Lead scoring failed for ${contactId}: ${err.message}`);
        }
    }
};
exports.LeadScoringService = LeadScoringService;
exports.LeadScoringService = LeadScoringService = LeadScoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory,
        chat_gateway_1.ChatGateway])
], LeadScoringService);
//# sourceMappingURL=lead-scoring.service.js.map