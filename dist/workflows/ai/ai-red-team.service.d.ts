import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';
export interface RedTeamReport {
    overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    vulnerabilities: Array<{
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        title: string;
        description: string;
        nodeId?: string;
        recommendation: string;
    }>;
}
export declare class AiRedTeamService {
    private readonly prisma;
    private readonly llmFactory;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    runRedTeamAudit(shopId: string, graph: {
        nodes: any[];
        edges: any[];
    }): Promise<RedTeamReport>;
}
