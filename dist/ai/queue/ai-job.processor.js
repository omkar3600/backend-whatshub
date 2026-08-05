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
var AiJobProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiJobProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const agent_orchestrator_service_1 = require("../orchestrator/agent-orchestrator.service");
const whatsapp_service_1 = require("../../whatsapp/whatsapp.service");
const chat_gateway_1 = require("../../chat/chat.gateway");
const memory_manager_service_1 = require("../orchestrator/memory-manager.service");
const lead_scoring_service_1 = require("../intelligence/lead-scoring.service");
const followup_service_1 = require("../followup/followup.service");
let AiJobProcessor = AiJobProcessor_1 = class AiJobProcessor extends bullmq_1.WorkerHost {
    prisma;
    orchestrator;
    whatsapp;
    chatGateway;
    memoryManager;
    leadScoring;
    followUp;
    logger = new common_1.Logger(AiJobProcessor_1.name);
    constructor(prisma, orchestrator, whatsapp, chatGateway, memoryManager, leadScoring, followUp) {
        super();
        this.prisma = prisma;
        this.orchestrator = orchestrator;
        this.whatsapp = whatsapp;
        this.chatGateway = chatGateway;
        this.memoryManager = memoryManager;
        this.leadScoring = leadScoring;
        this.followUp = followUp;
    }
    async process(job) {
        const { name, data } = job;
        if (name === 'process-agent-message') {
            await this.processAgentMessage(data);
        }
        else if (name === 'score-lead') {
            await this.leadScoring.scoreContact(data.shopId, data.contactId, data.conversationId);
        }
        else if (name === 'send-followup') {
            await this.followUp.executeFollowUp(data.followUpId);
        }
        else if (name === 'update-memory') {
            await this.memoryManager.updateMemory(data.shopId, data.contactId, data.conversationId);
            await this.memoryManager.generateSummary(data.shopId, data.conversationId);
        }
    }
    async processAgentMessage(data) {
        try {
            const result = await this.orchestrator.run({
                shopId: data.shopId,
                contactId: data.contactId,
                conversationId: data.conversationId,
                message: data.messageText,
            });
            if (result.text) {
                const metaRes = await this.whatsapp.sendOutboundMessage(data.shopId, data.contactPhone, 'text', result.text);
                const wamid = metaRes?.messages?.[0]?.id;
                const contact = await this.prisma.contact.findUnique({ where: { id: data.contactId } });
                const savedMsg = await this.prisma.message.create({
                    data: {
                        id: wamid || undefined,
                        shopId: data.shopId,
                        conversationId: data.conversationId,
                        direction: 'outbound',
                        type: 'text',
                        content: result.text,
                        status: 'sent',
                    },
                });
                this.chatGateway.notifyNewMessage(data.shopId, {
                    ...savedMsg,
                    contact: { name: contact?.name, phone: contact?.phone },
                });
                await this.prisma.conversation.update({
                    where: { id: data.conversationId },
                    data: { lastMessageAt: new Date(), lastAiInteractionAt: new Date() },
                }).catch(() => { });
                await this.prisma.contact.update({
                    where: { id: data.contactId },
                    data: { lastAiInteractionAt: new Date() },
                }).catch(() => { });
            }
            if (result.actionsQueued.length > 0) {
                this.chatGateway.server?.to(data.shopId).emit('newAiAction', {
                    shopId: data.shopId,
                    tools: result.actionsQueued,
                });
            }
        }
        catch (err) {
            this.logger.error(`[AI Agent] Failed to process message for shop ${data.shopId}: ${err.message}`);
        }
    }
};
exports.AiJobProcessor = AiJobProcessor;
exports.AiJobProcessor = AiJobProcessor = AiJobProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('ai-agent-queue'),
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        agent_orchestrator_service_1.AgentOrchestratorService,
        whatsapp_service_1.WhatsappService,
        chat_gateway_1.ChatGateway,
        memory_manager_service_1.MemoryManagerService,
        lead_scoring_service_1.LeadScoringService,
        followup_service_1.FollowUpService])
], AiJobProcessor);
//# sourceMappingURL=ai-job.processor.js.map