import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ToolRegistry } from '../tools/registry/tool.registry';
export declare class BusinessAgentService {
    private readonly prisma;
    private readonly llmFactory;
    private readonly toolRegistry;
    private readonly logger;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory, toolRegistry: ToolRegistry);
    query(shopId: string, question: string): Promise<{
        answer: string;
        data?: any;
    }>;
}
