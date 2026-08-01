import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class ConversationsService {
    private prisma;
    private chatGateway;
    private whatsappService;
    constructor(prisma: PrismaService, chatGateway: ChatGateway, whatsappService: WhatsappService);
    getConversations(shopId: string): Promise<({
        contact: {
            name: string;
            phone: string;
            city: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        contactId: string;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
    })[]>;
    getConversation(shopId: string, id: string): Promise<{
        contact: {
            name: string;
            phone: string;
            city: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        contactId: string;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
    }>;
    findOrCreate(shopId: string, contactId: string): Promise<{
        contact: {
            name: string;
            phone: string;
            city: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        contactId: string;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
    }>;
    markAsRead(shopId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        contactId: string;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
    }>;
}
