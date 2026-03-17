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
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("../chat/chat.gateway");
let ConversationsService = class ConversationsService {
    prisma;
    chatGateway;
    constructor(prisma, chatGateway) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
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
        return updated;
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map