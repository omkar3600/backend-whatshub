import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ChatGateway } from '../../chat/chat.gateway';
export declare class FollowUpService {
    private readonly prisma;
    private readonly whatsapp;
    private readonly llmFactory;
    private readonly chatGateway;
    private readonly logger;
    constructor(prisma: PrismaService, whatsapp: WhatsappService, llmFactory: LlmProviderFactory, chatGateway: ChatGateway);
    createFollowUp(shopId: string, contactId: string, reason: string, delayMs?: number): Promise<void>;
    executeFollowUp(followUpId: string): Promise<void>;
}
