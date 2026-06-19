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
            id: string;
            shopId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string | null;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    })[]>;
    getConversation(shopId: string, id: string): Promise<{
        contact: {
            id: string;
            shopId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string | null;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    findOrCreate(shopId: string, contactId: string): Promise<{
        contact: {
            id: string;
            shopId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string | null;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        };
    } & {
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    markAsRead(shopId: string, id: string): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
}
