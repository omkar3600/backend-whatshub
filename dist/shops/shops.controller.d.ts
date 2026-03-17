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
    getWhatsAppCredentials(user: any): Promise<any>;
    updateWhatsAppCredentials(user: any, body: any): Promise<any>;
}
