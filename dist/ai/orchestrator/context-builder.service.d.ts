import { PrismaService } from '../../prisma/prisma.service';
import { LlmMessage } from '../providers/llm-provider.interface';
export declare class ContextBuilderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    build(opts: {
        shopId: string;
        contactId: string;
        conversationId: string;
        systemPrompt: string;
        businessInfo?: string | null;
        agentName?: string;
        currentMessage: string;
    }): Promise<LlmMessage[]>;
}
