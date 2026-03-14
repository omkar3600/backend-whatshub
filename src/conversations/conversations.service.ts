import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class ConversationsService {
    constructor(
        private prisma: PrismaService,
        private chatGateway: ChatGateway,
    ) { }

    async getConversations(shopId: string) {
        return this.prisma.conversation.findMany({
            where: { shopId },
            include: { contact: true },
            orderBy: { lastMessageAt: 'desc' },
        });
    }

    async getConversation(shopId: string, id: string) {
        const convo = await this.prisma.conversation.findFirst({
            where: { id, shopId },
            include: { contact: true },
        });
        if (!convo) throw new NotFoundException('Conversation not found');
        return convo;
    }

    async findOrCreate(shopId: string, contactId: string) {
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

    async markAsRead(shopId: string, id: string) {
        const updated = await this.prisma.conversation.update({
            where: { id, shopId },
            data: { unreadCount: 0 },
        });
        this.chatGateway.notifyRead(shopId, id);
        return updated;
    }
}
