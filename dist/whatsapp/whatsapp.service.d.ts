import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
import { SystemConfigService } from '../admin/system-config.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatbotService } from '../chatbot/chatbot.service';
import { WorkflowEngineService } from '../workflows/engine/workflow-engine.service';
import { TriggerRegistry } from '../workflows/engine/registries/trigger.registry';
import { Queue } from 'bullmq';
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
    private systemConfigService;
    private chatGateway;
    private chatbotService;
    private workflowEngineService;
    private triggerRegistry;
    private aiQueue;
    private readonly logger;
    private readonly graphApiBase;
    constructor(prisma: PrismaService, httpService: HttpService, cryptoService: CryptoService, systemConfigService: SystemConfigService, chatGateway: ChatGateway, chatbotService: ChatbotService, workflowEngineService: WorkflowEngineService, triggerRegistry: TriggerRegistry, aiQueue: Queue);
    private getGraphApiBase;
    getCredentials(shopId: string): Promise<WhatsAppCredentials>;
    getCredentialsByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppCredentials | null>;
    getShopByWabaId(wabaId: string): Promise<string | null>;
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null>;
    processWebhookEvent(body: any): Promise<void>;
    private handlePhoneNumberNameUpdate;
    private handleTemplateStatusUpdate;
    private handleMessageStatus;
    private handleIncomingMessage;
    markMessageAsRead(shopId: string, messageId: string): Promise<void>;
    check24HourWindow(shopId: string, toPhone: string): Promise<boolean>;
    private getAppSecretProof;
    sendOutboundMessage(shopId: string, toPhone: string, type: string, content: any, mediaUrl?: string): Promise<any>;
    processDeadLetterQueue(): Promise<{
        processed: number;
        resolved: number;
    }>;
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
