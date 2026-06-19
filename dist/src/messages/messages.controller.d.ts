import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getMessages(user: any, conversationId: string): Promise<{
        id: string;
        shopId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        templateData: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }[]>;
    sendMessage(user: any, conversationId: string, body: any): Promise<{
        id: string;
        shopId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumberId: string | null;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        templateData: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }>;
    clearConversationMessages(user: any, conversationId: string): Promise<{
        message: string;
    }>;
    deleteMessage(user: any, messageId: string): Promise<{
        message: string;
    }>;
}
