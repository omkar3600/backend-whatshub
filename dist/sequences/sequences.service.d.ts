import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class SequencesService {
    private prisma;
    private sequencesQueue;
    constructor(prisma: PrismaService, sequencesQueue: Queue);
    createSequence(shopId: string, data: {
        name: string;
        triggerTag: string;
        steps: any[];
    }): Promise<any>;
    getSequences(shopId: string): Promise<any>;
    toggleSequence(shopId: string, id: string, isActive: boolean): Promise<any>;
    deleteSequence(shopId: string, id: string): Promise<any>;
    handleContactTagsUpdated(shopId: string, contactId: string, tags: string[]): Promise<void>;
    enqueueStep(subscriberId: string, stepId: string, delayHours: number): Promise<void>;
}
