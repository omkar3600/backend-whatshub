import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getMessages(user: any, conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        timestamp: Date;
    }[]>;
    sendMessage(user: any, conversationId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        conversationId: string;
        direction: string;
        type: string;
        content: string | null;
        mediaUrl: string | null;
        timestamp: Date;
    }>;
    clearConversationMessages(user: any, conversationId: string): Promise<{
        message: string;
    }>;
    deleteMessage(user: any, messageId: string): Promise<{
        message: string;
    }>;
}
