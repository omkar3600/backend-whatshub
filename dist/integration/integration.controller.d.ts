import { IntegrationService } from './integration.service';
export declare class IntegrationController {
    private readonly integrationService;
    constructor(integrationService: IntegrationService);
    sendMessage(req: any, body: {
        phone: string;
        text: string;
    }): Promise<{
        success: boolean;
        messageId: string;
        status: string;
    }>;
    sendMediaMessage(req: any, body: {
        phone: string;
        caption?: string;
    }, file: Express.Multer.File): Promise<{
        success: boolean;
        messageId: string;
        status: string;
        mediaUrl: string;
    }>;
    syncContact(req: any, body: {
        name: string;
        phone: string;
        email?: string;
    }): Promise<{
        success: boolean;
        contactId: string;
    }>;
}
