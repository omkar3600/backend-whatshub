import { PrismaService } from '../../prisma/prisma.service';
export interface PolicyEvaluationResult {
    allowed: boolean;
    reason?: string;
    requiresApproval?: boolean;
}
export declare class AiPolicyEngineService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    evaluateToolCall(shopId: string, toolName: string, params: any, autonomyLevel?: number): Promise<PolicyEvaluationResult>;
}
