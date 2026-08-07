import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(user: any, page?: string, limit?: string, search?: string): Promise<{
        data: ({
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
                aiSegment: string | null;
                aiLeadStage: string | null;
                lastAiInteractionAt: Date | null;
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
            aiState: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
        hasMore: boolean;
    }>;
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
            aiSegment: string | null;
            aiLeadStage: string | null;
            lastAiInteractionAt: Date | null;
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
        aiState: import("@prisma/client/runtime/library").JsonValue | null;
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
            aiSegment: string | null;
            aiLeadStage: string | null;
            lastAiInteractionAt: Date | null;
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
        aiState: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markAsRead(user: any, id: string): Promise<{
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
        aiState: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
