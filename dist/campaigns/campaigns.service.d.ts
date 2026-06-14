import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    private campaignsQueue;
    constructor(prisma: PrismaService, campaignsQueue: Queue);
    createCampaign(shopId: string, data: any): Promise<any>;
    getCampaigns(shopId: string): Promise<any>;
    deleteCampaign(shopId: string, campaignId: string): Promise<any>;
    abortCampaign(shopId: string, campaignId: string): Promise<any>;
    launchRetarget(shopId: string, campaignId: string, body: {
        name: string;
        templateId: string;
        phones: string[];
    }): Promise<any>;
    getCampaignAnalytics(shopId: string, campaignId: string): Promise<{
        campaign: any;
        stats: {
            total: any;
            sent: any;
            delivered: any;
            read: any;
            clicked: any;
            failed: any;
            unread: any;
        };
        contacts: {
            sent: any;
            delivered: any;
            read: any;
            clicked: any;
            failed: any;
            unread: any;
        };
    }>;
    addTagsToContacts(shopId: string, campaignId: string, body: {
        phones: string[];
        tags: string[];
    }): Promise<{
        updated: number;
        message: string;
    }>;
    resendFailed(shopId: string, campaignId: string): Promise<any>;
}
