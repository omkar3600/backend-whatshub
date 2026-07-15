import { ITriggerExecutor } from '../interfaces/trigger-executor.interface';
import { WorkflowEngineService } from '../workflow-engine.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class IncomingMessageTrigger implements ITriggerExecutor {
    private readonly engine;
    private readonly prisma;
    type: string;
    private readonly logger;
    constructor(engine: WorkflowEngineService, prisma: PrismaService);
    evaluate(payload: any): Promise<void>;
}
