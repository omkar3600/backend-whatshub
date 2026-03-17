import { WhatsappService } from '../whatsapp.service';
import type { Response } from 'express';
export declare class WebhooksController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string, shopId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    handleIncomingEvent(body: any, res: Response): Promise<void>;
}
