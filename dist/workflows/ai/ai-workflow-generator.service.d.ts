import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AiWorkflowGeneratorService {
    private readonly prisma;
    private readonly llmFactory;
    private readonly logger;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    generateGraphFromPrompt(shopId: string, prompt: string): Promise<{
        nodes: any[];
        edges: any[];
        explanation: string;
    }>;
}
