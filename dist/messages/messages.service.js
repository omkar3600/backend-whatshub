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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const chat_gateway_1 = require("../chat/chat.gateway");
let MessagesService = class MessagesService {
    prisma;
    whatsappService;
    chatGateway;
    constructor(prisma, whatsappService, chatGateway) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.chatGateway = chatGateway;
    }
    async getMessages(shopId, conversationId) {
        return this.prisma.message.findMany({
            where: { shopId, conversationId },
            orderBy: { timestamp: 'asc' },
        });
    }
    async sendMessage(shopId, conversationId, data) {
        const { type: rawType, content, mediaUrl } = data;
        const type = rawType || (mediaUrl ? 'image' : 'text');
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, shopId },
            include: { contact: true }
        });
        if (!conversation || !conversation.contact) {
            throw new common_1.NotFoundException('Conversation or contact not found');
        }
        let wamid = null;
        let status = 'sent';
        let failReason = null;
        let sendError = null;
        try {
            if (type !== 'template') {
                await this.whatsappService.check24HourWindow(shopId, conversation.contact.phone).catch(() => true);
            }
            const metaRes = await this.whatsappService.sendOutboundMessage(shopId, conversation.contact.phone, type, content, mediaUrl);
            wamid = metaRes?.messages?.[0]?.id || null;
        }
        catch (e) {
            status = 'failed';
            sendError = e;
            const metaError = e?.response?.data?.error?.message;
            failReason = metaError || (e instanceof Error ? e.message : String(e));
        }
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        const message = await this.prisma.message.create({
            data: {
                id: wamid || undefined,
                shopId,
                conversationId,
                direction: 'outbound',
                type,
                content: typeof content === 'string' ? content : JSON.stringify(content || ''),
                mediaUrl,
                status
            },
        });
        try {
            this.chatGateway.notifyNewMessage(shopId, message);
        }
        catch (e) { }
        return message;
    }
    async deleteMessage(shopId, messageId) {
        const msg = await this.prisma.message.findFirst({ where: { id: messageId, shopId } });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        await this.prisma.message.delete({ where: { id: messageId } });
        return { message: 'Message deleted' };
    }
    async clearConversationMessages(shopId, conversationId) {
        const convo = await this.prisma.conversation.findFirst({ where: { id: conversationId, shopId } });
        if (!convo)
            throw new common_1.NotFoundException('Conversation not found');
        const result = await this.prisma.message.deleteMany({ where: { conversationId, shopId } });
        return { message: `Cleared ${result.count} messages` };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService,
        chat_gateway_1.ChatGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map