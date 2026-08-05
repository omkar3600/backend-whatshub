import { PrismaService } from '../../prisma/prisma.service';
export interface SimulationStep {
    nodeId: string;
    nodeType: string;
    simulatedOutput: any;
    status: 'passed' | 'failed' | 'branch_selected';
    branchSelected?: string;
}
export declare class AiWorkflowSimulatorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    simulateWorkflow(shopId: string, workflowId: string, testMessage: string): Promise<{
        success: boolean;
        steps: SimulationStep[];
        finalVariables: Record<string, any>;
    }>;
}
