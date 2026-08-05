import { PrismaService } from '../../prisma/prisma.service';
export interface AiKpiOverview {
    activeAgentCount: number;
    totalConversationsHandled: number;
    totalToolsExecuted: number;
    aiInfluencedRevenue: number;
    conversionRatePercentage: number;
    hotLeadsQualifiedCount: number;
    pendingApprovalsCount: number;
    successRatePercentage: number;
    avgResponseTimeMs: number;
}
export declare class AiKpiService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getKpiOverview(shopId: string): Promise<AiKpiOverview>;
}
