import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentOrchestratorService } from '../orchestrator/agent-orchestrator.service';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { MemoryManagerService } from '../orchestrator/memory-manager.service';
import { LeadScoringService } from '../intelligence/lead-scoring.service';
import { FollowUpService } from '../followup/followup.service';
export declare class AiJobProcessor extends WorkerHost {
    private readonly prisma;
    private readonly orchestrator;
    private readonly whatsapp;
    private readonly chatGateway;
    private readonly memoryManager;
    private readonly leadScoring;
    private readonly followUp;
    private readonly logger;
    constructor(prisma: PrismaService, orchestrator: AgentOrchestratorService, whatsapp: WhatsappService, chatGateway: ChatGateway, memoryManager: MemoryManagerService, leadScoring: LeadScoringService, followUp: FollowUpService);
    process(job: Job): Promise<void>;
    private processAgentMessage;
}
