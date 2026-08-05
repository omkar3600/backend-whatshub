import { PrismaService } from '../../prisma/prisma.service';
export interface GovernanceOverview {
    shopId: string;
    autonomyLevel: number;
    maxIterationsLimit: number;
    totalAuditLogs: number;
    successfulToolExecutions: number;
    pendingApprovals: number;
    estimatedDailyCost: number;
    allowedTools: string[];
}
export declare class AiGovernanceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOverview(shopId: string): Promise<GovernanceOverview>;
    setAutonomyLevel(shopId: string, level: number): Promise<void>;
}
