import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(user: any): Promise<({
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
    getConversation(user: any, id: string): Promise<{
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
    findOrCreate(user: any, contactId: string): Promise<{
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
    markAsRead(user: any, id: string): Promise<{
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
