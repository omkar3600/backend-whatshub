import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class MessagesService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    getMessages(shopId: string, conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        timestamp: Date;
        conversationId: string;
    }[]>;
    sendMessage(shopId: string, conversationId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        timestamp: Date;
        conversationId: string;
    }>;
}
