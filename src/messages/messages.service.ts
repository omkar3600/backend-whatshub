import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
        private chatGateway: ChatGateway,
    ) { }

    async getMessages(shopId: string, conversationId: string) {
        return this.prisma.message.findMany({
            where: { shopId, conversationId },
            orderBy: { timestamp: 'asc' },
        });
    }

    async sendMessage(shopId: string, conversationId: string, data: any) {
        const { type: rawType, content, mediaUrl } = data;
        const type = rawType || (mediaUrl ? 'image' : 'text');

        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, shopId },
            include: { contact: true }
        });

        if (!conversation || !conversation.contact) {
            throw new NotFoundException('Conversation or contact not found');
        }

        let wamid: string | null = null;
        let status = 'sent';
        let failReason: string | null = null;
        let sendError: any = null;

        try {
            // Validate 24-hour window safely if Meta WABA is connected
            if (type !== 'template') {
                await this.whatsappService.check24HourWindow(shopId, conversation.contact.phone).catch(() => true);
            }
            const metaRes = await this.whatsappService.sendOutboundMessage(shopId, conversation.contact.phone, type, content, mediaUrl);
            wamid = metaRes?.messages?.[0]?.id || null;
        } catch (e: any) {
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

        // Broadcast real-time message event to connected Socket.IO clients
        try {
            this.chatGateway.notifyNewMessage(shopId, message);
        } catch (e) {}

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
