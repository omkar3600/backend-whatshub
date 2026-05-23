import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FlowEngineService } from './flow-engine.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class FlowProcessor extends WorkerHost {
    private readonly flowEngine;
    private readonly prisma;
    private readonly logger;
    constructor(flowEngine: FlowEngineService, prisma: PrismaService);
    process(job: Job<any, any, string>): Promise<any>;
}
