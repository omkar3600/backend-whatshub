import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(user: any): Promise<({
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
    getConversation(user: any, id: string): Promise<{
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
    findOrCreate(user: any, contactId: string): Promise<{
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
    markAsRead(user: any, id: string): Promise<{
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
