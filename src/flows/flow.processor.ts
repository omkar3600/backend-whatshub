import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { FlowEngineService } from './flow-engine.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('flow-execution')
@Injectable()
export class FlowProcessor extends WorkerHost {
    private readonly logger = new Logger(FlowProcessor.name);

    constructor(
        private readonly flowEngine: FlowEngineService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing delayed flow step for job ${job.id}`);
        const { nodeId, sessionId, definition, shopId, toPhone } = job.data;
        
        try {
            const session = await this.prisma.flowSession.findUnique({ where: { id: sessionId } });
            if (!session) {
                this.logger.warn(`Session ${sessionId} not found for delayed job`);
                return;
            }
            
            // Re-enter the flow engine at the NEXT node after the delay
            await this.flowEngine.moveToNextNative(nodeId, session, definition, shopId, toPhone, 0);
        } catch (error) {
            this.logger.error(`Failed to process delayed flow step: ${error.message}`);
            throw error;
        }
    }
}
