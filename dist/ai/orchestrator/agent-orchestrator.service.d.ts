import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ToolRegistry } from '../tools/registry/tool.registry';
import { ContextBuilderService } from './context-builder.service';
export interface OrchestratorResult {
    text: string | null;
    error?: string;
    toolsUsed: string[];
    actionsQueued: string[];
}
export declare class AgentOrchestratorService {
    private readonly prisma;
    private readonly llmFactory;
    private readonly toolRegistry;
    private readonly contextBuilder;
    private readonly logger;
    private static readonly PROMPT_INJECTION_PATTERNS;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory, toolRegistry: ToolRegistry, contextBuilder: ContextBuilderService);
    private sanitizeInput;
    run(opts: {
        shopId: string;
        contactId: string;
        conversationId: string;
        message: string;
    }): Promise<OrchestratorResult>;
}
