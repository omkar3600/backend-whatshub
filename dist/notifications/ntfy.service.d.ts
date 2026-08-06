import { ConfigService } from '@nestjs/config';
export declare class NtfyService {
    private configService;
    private readonly logger;
    private readonly ntfyUrl;
    private readonly defaultTopic;
    constructor(configService: ConfigService);
    sendAlert(options: {
        topic?: string;
        title: string;
        message: string;
        priority?: 1 | 2 | 3 | 4 | 5;
        tags?: string[];
        actionUrl?: string;
    }): Promise<boolean>;
    notifyPendingAiAction(action: {
        id: string;
        toolName: string;
        riskLevel: string;
        rationale: string;
        shopId: string;
    }): Promise<boolean>;
    notifyCampaignCompleted(campaign: {
        id: string;
        name: string;
        totalSent: number;
        totalFailed: number;
    }): Promise<boolean>;
}
