import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SequencesService } from './sequences.service';
export declare class SequenceProcessor extends WorkerHost {
    private prisma;
    private whatsappService;
    private sequencesService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService, sequencesService: SequencesService);
    process(job: Job<any>): Promise<void>;
}
