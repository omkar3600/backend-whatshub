import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
export declare class ConversationsService {
    private prisma;
    private chatGateway;
    constructor(prisma: PrismaService, chatGateway: ChatGateway);
    getConversations(shopId: string): Promise<any>;
    getConversation(shopId: string, id: string): Promise<any>;
    findOrCreate(shopId: string, contactId: string): Promise<any>;
    markAsRead(shopId: string, id: string): Promise<any>;
}
