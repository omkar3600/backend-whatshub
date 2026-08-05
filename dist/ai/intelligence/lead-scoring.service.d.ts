import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ChatGateway } from '../../chat/chat.gateway';
export declare class LeadScoringService {
    private readonly prisma;
    private readonly llmFactory;
    private readonly chatGateway;
    private readonly logger;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory, chatGateway: ChatGateway);
    scoreContact(shopId: string, contactId: string, conversationId: string): Promise<void>;
}
