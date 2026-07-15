import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FlowEngineService } from '../flows/flow-engine.service';
interface WhatsAppCredentials {
    shopId: string;
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
    wabaId: string;
}
export declare class WhatsappService {
    private prisma;
    private httpService;
    private cryptoService;
    private chatGateway;
    private chatbotService;
    private flowEngineService;
    private readonly logger;
    private readonly graphApiBase;
    constructor(prisma: PrismaService, httpService: HttpService, cryptoService: CryptoService, chatGateway: ChatGateway, chatbotService: ChatbotService, flowEngineService: FlowEngineService);
    getCredentials(shopId: string): Promise<WhatsAppCredentials>;
    getCredentialsByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppCredentials | null>;
    getShopByWabaId(wabaId: string): Promise<string | null>;
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null>;
    processWebhookEvent(body: any): Promise<void>;
    private handlePhoneNumberNameUpdate;
    private handleTemplateStatusUpdate;
    private handleIncomingMessage;
    private handleMessageStatus;
    markMessageAsRead(shopId: string, messageId: string): Promise<void>;
    sendOutboundMessage(shopId: string, toPhone: string, type: string, content: any, mediaUrl?: string): Promise<any>;
    private logWebhookAudit;
    getBusinessProfile(shopId: string): Promise<any>;
    updateBusinessProfile(shopId: string, data: any): Promise<any>;
    uploadProfilePicture(shopId: string, file: any): Promise<any>;
    updateDisplayName(shopId: string, newName: string): Promise<any>;
    registerActiveNumber(shopId: string, customPin?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
export {};
