import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class MessagesService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    getMessages(shopId: string, conversationId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        templateData: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }[]>;
    sendMessage(shopId: string, conversationId: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        templateData: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }>;
    deleteMessage(shopId: string, messageId: string): Promise<{
        message: string;
    }>;
    clearConversationMessages(shopId: string, conversationId: string): Promise<{
        message: string;
    }>;
}
