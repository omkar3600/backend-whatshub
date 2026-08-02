import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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

        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, shopId },
            include: { contact: true }
        });

        if (!conversation || !conversation.contact) {
            throw new NotFoundException('Conversation or contact not found');
        }

        // Validate 24-hour customer service window for non-template messages
        if (type !== 'template') {
            const isWithinWindow = await this.whatsappService.check24HourWindow(shopId, conversation.contact.phone);
            if (!isWithinWindow) {
                throw new BadRequestException('24-hour customer service window closed. Please select an approved template message to re-engage this contact.');
            }
        }

        let wamid: string | null = null;
        let status = 'sent';
        let failReason: string | null = null;
        let sendError: any = null;

        try {
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
                content: typeof content === 'string' ? content : JSON.stringify(content), 
                mediaUrl, 
                status 
            },
        });

        if (status === 'failed' && sendError) {
            const metaMsg = sendError?.response?.data?.error?.message || failReason;
            throw new HttpException(`Failed to send message: ${metaMsg}`, HttpStatus.BAD_REQUEST);
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

