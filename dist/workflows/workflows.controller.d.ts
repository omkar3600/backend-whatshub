import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowsController {
    private readonly engineService;
    private readonly prisma;
    constructor(engineService: WorkflowEngineService, prisma: PrismaService);
    triggerTestWorkflow(id: string, body: {
        shopId: string;
        contactId: string;
    }): Promise<{
        success: boolean;
        instanceId: string;
    }>;
    createTestWorkflow(body: {
        shopId: string;
    }): Promise<{
        success: boolean;
        workflowId: string;
    }>;
}
