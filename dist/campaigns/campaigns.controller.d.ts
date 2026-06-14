import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    createCampaign(user: any, body: any): Promise<any>;
    getCampaigns(user: any): Promise<any>;
    getCampaignAnalytics(user: any, id: string): Promise<{
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
    addTagsToContacts(user: any, id: string, body: any): Promise<{
        updated: number;
        message: string;
    }>;
    resendFailed(user: any, id: string): Promise<any>;
    abortCampaign(user: any, id: string): Promise<any>;
    launchRetarget(user: any, id: string, body: any): Promise<any>;
    deleteCampaign(user: any, id: string): Promise<any>;
}
