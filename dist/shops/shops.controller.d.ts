import { ShopsService } from './shops.service';
export declare class ShopsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    getMyShop(user: any): Promise<{
        shop: any;
        stats: {
            totalMessages: any;
            totalContacts: any;
            totalTemplates: any;
        };
    }>;
    updateMyShop(user: any, body: any): Promise<any>;
    getWhatsAppCredentials(user: any): Promise<{
        id: any;
        businessAccountId: any;
        wabaId: any;
        businessName: any;
        phoneNumberId: any;
        status: any;
        tokenType: any;
        tokenExpiry: any;
        onboardingSource: any;
        phoneNumbers: any;
    } | null>;
    updateWhatsAppCredentials(user: any, body: any): Promise<any>;
}
