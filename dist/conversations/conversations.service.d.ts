import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
export declare class ConversationsService {
    private prisma;
    private chatGateway;
    constructor(prisma: PrismaService, chatGateway: ChatGateway);
    getConversations(shopId: string): Promise<({
        contact: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            city: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        lastMessageAt: Date;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    })[]>;
    getConversation(shopId: string, id: string): Promise<{
        contact: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            city: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        lastMessageAt: Date;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    findOrCreate(shopId: string, contactId: string): Promise<{
        contact: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            city: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        lastMessageAt: Date;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    markAsRead(shopId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        lastMessageAt: Date;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
}
