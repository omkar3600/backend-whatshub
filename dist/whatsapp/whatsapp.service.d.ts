import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ChatGateway } from '../chat/chat.gateway';
export declare class WhatsappService {
    private prisma;
    private httpService;
    private chatGateway;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService, chatGateway: ChatGateway);
    verifyWebhook(mode: string, token: string, challenge: string, shopId?: string): Promise<string | null>;
    processWebhookEvent(body: any): Promise<void>;
    private handleTemplateStatusUpdate;
    private handleIncomingMessage;
    private handleMessageStatus;
    sendOutboundMessage(shopId: string, toPhone: string, type: string, content: string, mediaUrl?: string): Promise<any>;
}
