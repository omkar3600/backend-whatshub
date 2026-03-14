import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    // Fetch messages for a specific conversation
    async getMessages(shopId: string, conversationId: string) {
        return this.prisma.message.findMany({
            where: { shopId, conversationId },
            orderBy: { timestamp: 'asc' },
        });
    }

    // Handle a new sending request from API
    async sendMessage(shopId: string, conversationId: string, data: any) {
        const { type, content, mediaUrl } = data;

        // Create the message in database first (simulate pending/sending)
        const message = await this.prisma.message.create({
            data: {
                shopId,
                conversationId,
                direction: 'outbound',
                type,
                content,
                mediaUrl,
                status: 'sent',
            },
        });

        // Update conversation lastMessageAt
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });

        // Actually send it to WhatsApp API
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
        });

        try {
            if (conversation?.contact?.phone) {
                await this.whatsappService.sendOutboundMessage(
                    shopId,
                    conversation.contact.phone,
                    type,
                    content,
                    mediaUrl
                );
            }
        } catch (e) {
            // Mark as failed if it didn't go through
            await this.prisma.message.update({
                where: { id: message.id },
                data: { status: 'failed' }
            });
        }

        return message;
    }
}
