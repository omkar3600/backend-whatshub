import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkflowEngineService } from '../workflow-engine.service';
export declare class WorkflowQueueProcessor extends WorkerHost {
    private readonly workflowEngine;
    private readonly logger;
    constructor(workflowEngine: WorkflowEngineService);
    process(job: Job<any, any, string>): Promise<any>;
}
