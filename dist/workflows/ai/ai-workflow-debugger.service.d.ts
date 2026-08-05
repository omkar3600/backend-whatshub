import { PrismaService } from '../../prisma/prisma.service';
export interface DebugReport {
    instanceId: string;
    workflowId: string;
    status: string;
    executedPath: {
        nodeId: string;
        status: string;
        durationMs?: number | null;
        error?: string | null;
        timestamp: Date;
    }[];
    failureNodeId?: string;
    rootCauseAnalysis: string;
    recommendedAction: string;
}
export declare class AiWorkflowDebuggerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    debugExecution(instanceId: string): Promise<DebugReport>;
}
