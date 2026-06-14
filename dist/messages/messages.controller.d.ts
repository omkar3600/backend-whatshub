import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getMessages(user: any, conversationId: string): Promise<any>;
    sendMessage(user: any, conversationId: string, body: any): Promise<any>;
    clearConversationMessages(user: any, conversationId: string): Promise<{
        message: string;
    }>;
    deleteMessage(user: any, messageId: string): Promise<{
        message: string;
    }>;
}
