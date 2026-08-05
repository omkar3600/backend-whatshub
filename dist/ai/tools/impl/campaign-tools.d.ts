import { PrismaService } from '../../../prisma/prisma.service';
import { CampaignsService } from '../../../campaigns/campaigns.service';
import { AiTool } from '../tool.interface';
export declare class CampaignTools {
    private readonly prisma;
    private readonly campaigns;
    constructor(prisma: PrismaService, campaigns: CampaignsService);
    getTools(): AiTool[];
}
