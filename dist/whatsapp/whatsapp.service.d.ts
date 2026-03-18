import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatbotService } from '../chatbot/chatbot.service';
export declare class WhatsappService {
    private prisma;
    private httpService;
    private chatGateway;
    private chatbotService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService, chatGateway: ChatGateway, chatbotService: ChatbotService);
    verifyWebhook(mode: string, token: string, challenge: string, shopId?: string): Promise<string | null>;
    processWebhookEvent(body: any): Promise<void>;
    private handleTemplateStatusUpdate;
    private handleIncomingMessage;
    private handleMessageStatus;
    sendOutboundMessage(shopId: string, toPhone: string, type: string, content: any, mediaUrl?: string): Promise<any>;
}
