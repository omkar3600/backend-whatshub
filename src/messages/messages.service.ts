import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    async getMessages(shopId: string, conversationId: string) {
        return this.prisma.message.findMany({
            where: { shopId, conversationId },
            orderBy: { timestamp: 'asc' },
        });
    }

    async sendMessage(shopId: string, conversationId: string, data: any) {
        const { type, content, mediaUrl } = data;

        const message = await this.prisma.message.create({
            data: { shopId, conversationId, direction: 'outbound', type, content, mediaUrl, status: 'sent' },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });

        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
        });

        try {
            if (conversation?.contact?.phone) {
                await this.whatsappService.sendOutboundMessage(shopId, conversation.contact.phone, type, content, mediaUrl);
            }
        } catch (e) {
            await this.prisma.message.update({ where: { id: message.id }, data: { status: 'failed' } });
        }

        return message;
    }

    async deleteMessage(shopId: string, messageId: string) {
        const msg = await this.prisma.message.findFirst({ where: { id: messageId, shopId } });
        if (!msg) throw new NotFoundException('Message not found');
        await this.prisma.message.delete({ where: { id: messageId } });
        return { message: 'Message deleted' };
    }

    async clearConversationMessages(shopId: string, conversationId: string) {
        const convo = await this.prisma.conversation.findFirst({ where: { id: conversationId, shopId } });
        if (!convo) throw new NotFoundException('Conversation not found');
        const result = await this.prisma.message.deleteMany({ where: { conversationId, shopId } });
        return { message: `Cleared ${result.count} messages` };
    }
}

