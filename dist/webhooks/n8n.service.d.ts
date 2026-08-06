import { ConfigService } from '@nestjs/config';
export declare class N8nWebhookService {
    private configService;
    private readonly logger;
    private readonly n8nWebhookUrl;
    constructor(configService: ConfigService);
    private ntfyUrl;
    dispatchN8nEvent(eventType: string, data: any): Promise<boolean>;
}
