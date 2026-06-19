import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class CampaignProcessor extends WorkerHost {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    process(job: Job<any>): Promise<void>;
}
