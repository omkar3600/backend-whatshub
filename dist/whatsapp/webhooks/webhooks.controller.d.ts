import { WhatsappService } from '../whatsapp.service';
export declare class WebhooksController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null>;
    handleWebhook(body: any, req: any): Promise<{
        status: string;
    }>;
}
