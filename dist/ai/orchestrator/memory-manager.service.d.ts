import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
export declare class MemoryManagerService {
    private readonly prisma;
    private readonly llmFactory;
    private readonly logger;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    updateMemory(shopId: string, contactId: string, conversationId: string): Promise<void>;
    generateSummary(shopId: string, conversationId: string): Promise<void>;
}
