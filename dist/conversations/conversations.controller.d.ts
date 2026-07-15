import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(user: any): Promise<({
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
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    })[]>;
    getConversation(user: any, id: string): Promise<{
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
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    findOrCreate(user: any, contactId: string): Promise<{
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
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
    markAsRead(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        phoneNumberId: string | null;
        lastMessageAt: Date;
        lastContactMessageAt: Date | null;
        unreadCount: number;
        aiPaused: boolean;
        contactId: string;
    }>;
}
