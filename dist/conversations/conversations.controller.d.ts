import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    getConversations(user: any): Promise<any>;
    getConversation(user: any, id: string): Promise<any>;
    findOrCreate(user: any, contactId: string): Promise<any>;
    markAsRead(user: any, id: string): Promise<any>;
}
