import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AiCopilotService {
    private readonly prisma;
    private readonly llmFactory;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    editGraphWithInstruction(shopId: string, graph: {
        nodes: any[];
        edges: any[];
    }, instruction: string): Promise<{
        nodes: any[];
        edges: any[];
        explanation: string;
    }>;
    explainWorkflowGraph(shopId: string, graph: {
        nodes: any[];
        edges: any[];
    }): Promise<{
        explanation: string;
    }>;
}
