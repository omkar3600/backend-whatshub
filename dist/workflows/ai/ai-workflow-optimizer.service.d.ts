import { PrismaService } from '../../prisma/prisma.service';
export interface OptimizationRecommendation {
    workflowId: string;
    bottleneckNodeId?: string;
    dropOffRate: number;
    recommendation: string;
    proposedVariantGraph?: any;
}
export declare class AiWorkflowOptimizerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    analyzeAndOptimize(workflowId: string): Promise<OptimizationRecommendation>;
}
