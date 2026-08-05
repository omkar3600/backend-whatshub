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
var FollowUpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const whatsapp_service_1 = require("../../whatsapp/whatsapp.service");
const llm_provider_factory_1 = require("../providers/llm-provider.factory");
const chat_gateway_1 = require("../../chat/chat.gateway");
let FollowUpService = FollowUpService_1 = class FollowUpService {
    prisma;
    whatsapp;
    llmFactory;
    chatGateway;
    logger = new common_1.Logger(FollowUpService_1.name);
    constructor(prisma, whatsapp, llmFactory, chatGateway) {
        this.prisma = prisma;
        this.whatsapp = whatsapp;
        this.llmFactory = llmFactory;
        this.chatGateway = chatGateway;
    }
    async createFollowUp(shopId, contactId, reason, delayMs = 24 * 60 * 60 * 1000) {
        try {
            const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
            if (!config?.followupEnabled)
                return;
            const existing = await this.prisma.aiFollowUp.findFirst({
                where: { shopId, contactId, status: 'pending' },
            });
            if (existing)
                return;
            const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
            if (!contact)
                return;
            const llm = await this.llmFactory.create(config);
            const response = await llm.generateCompletion([
                {
                    role: 'system',
                    content: `You are a friendly sales follow-up assistant for a WhatsApp business. Generate a brief, natural follow-up message for a customer who showed interest but hasn't responded. Reason: ${reason}. Customer name: ${contact.name}. Keep it short (1-2 sentences), warm, and not pushy.`,
                },
                { role: 'user', content: 'Generate the follow-up message.' },
            ], [], { maxTokens: 100, temperature: 0.7 });
            const message = response.content || `Hi ${contact.name}! Just checking in if you had any questions. We\'re here to help! 😊`;
            const isWindowOpen = await this.whatsapp.check24HourWindow(shopId, contact.phone);
            await this.prisma.aiFollowUp.create({
                data: {
                    shopId,
                    contactId,
                    reason,
                    scheduledAt: new Date(Date.now() + delayMs),
                    aiMessage: message,
                    useTemplate: !isWindowOpen,
                    status: 'pending',
                },
            });
            this.logger.log(`[FollowUp] Scheduled follow-up for contact ${contactId} in ${Math.round(delayMs / 60000)}min`);
        }
        catch (err) {
            this.logger.warn(`Follow-up creation failed: ${err.message}`);
        }
    }
    async executeFollowUp(followUpId) {
        const followUp = await this.prisma.aiFollowUp.findUnique({
            where: { id: followUpId },
            include: { contact: true },
        });
        if (!followUp || followUp.status !== 'pending')
            return;
        try {
            const isWindowOpen = await this.whatsapp.check24HourWindow(followUp.shopId, followUp.contact.phone);
            if (!isWindowOpen && !followUp.useTemplate) {
                await this.prisma.aiFollowUp.update({
                    where: { id: followUpId },
                    data: { status: 'skipped', errorMessage: '24h window closed and no template configured' },
                });
                return;
            }
            await this.whatsapp.sendOutboundMessage(followUp.shopId, followUp.contact.phone, 'text', followUp.aiMessage);
            await this.prisma.aiFollowUp.update({
                where: { id: followUpId },
                data: { status: 'sent', executedAt: new Date() },
            });
            this.logger.log(`[FollowUp] Sent follow-up to ${followUp.contact.phone}`);
        }
        catch (err) {
            await this.prisma.aiFollowUp.update({
                where: { id: followUpId },
                data: { status: 'failed', errorMessage: err.message },
            });
        }
    }
};
exports.FollowUpService = FollowUpService;
exports.FollowUpService = FollowUpService = FollowUpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService,
        llm_provider_factory_1.LlmProviderFactory,
        chat_gateway_1.ChatGateway])
], FollowUpService);
//# sourceMappingURL=followup.service.js.map