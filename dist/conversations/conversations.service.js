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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("../chat/chat.gateway");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let ConversationsService = class ConversationsService {
    prisma;
    chatGateway;
    whatsappService;
    constructor(prisma, chatGateway, whatsappService) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.whatsappService = whatsappService;
    }
    async getConversations(shopId) {
        return this.prisma.conversation.findMany({
            where: { shopId },
            include: { contact: true },
            orderBy: { lastMessageAt: 'desc' },
        });
    }
    async getConversation(shopId, id) {
        const convo = await this.prisma.conversation.findFirst({
            where: { id, shopId },
            include: { contact: true },
        });
        if (!convo)
            throw new common_1.NotFoundException('Conversation not found');
        return convo;
    }
    async findOrCreate(shopId, contactId) {
        let convo = await this.prisma.conversation.findFirst({
            where: { shopId, contactId },
            include: { contact: true },
        });
        if (!convo) {
            convo = await this.prisma.conversation.create({
                data: {
                    shopId,
                    contactId,
                    lastMessageAt: new Date(),
                },
                include: { contact: true },
            });
        }
        return convo;
    }
    async markAsRead(shopId, id) {
        const updated = await this.prisma.conversation.update({
            where: { id, shopId },
            data: { unreadCount: 0 },
        });
        this.chatGateway.notifyRead(shopId, id);
        const unreadMessages = await this.prisma.message.findMany({
            where: { conversationId: id, direction: 'inbound', status: { not: 'read' } }
        });
        if (unreadMessages.length > 0) {
            await this.prisma.message.updateMany({
                where: { id: { in: unreadMessages.map(m => m.id) } },
                data: { status: 'read' }
            });
            for (const msg of unreadMessages) {
                if (msg.id.startsWith('wamid.')) {
                    await this.whatsappService.markMessageAsRead(shopId, msg.id);
                }
            }
        }
        return updated;
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        whatsapp_service_1.WhatsappService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map