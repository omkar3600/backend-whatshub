import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class MessagesService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    getMessages(shopId: string, conversationId: string): Promise<any>;
    sendMessage(shopId: string, conversationId: string, data: any): Promise<any>;
}
