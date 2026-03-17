import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    private campaignsQueue;
    constructor(prisma: PrismaService, campaignsQueue: Queue);
    createCampaign(shopId: string, data: any): Promise<any>;
    getCampaigns(shopId: string): Promise<any>;
    resendFailed(shopId: string, campaignId: string): Promise<any>;
}
