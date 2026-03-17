import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    createCampaign(user: any, body: any): Promise<any>;
    getCampaigns(user: any): Promise<any>;
    resendFailed(user: any, id: string): Promise<any>;
}
