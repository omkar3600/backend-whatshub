import { ShopsService } from './shops.service';
export declare class ShopsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    getMyShop(user: any): Promise<{
        shop: {
            subscription: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                expiryDate: Date;
                startDate: Date;
                shopId: string;
            } | null;
            whatsappCreds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shopId: string;
                businessAccountId: string;
                phoneNumberId: string;
                accessToken: string;
                webhookVerifyToken: string | null;
            } | null;
        } & {
            shopName: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            ownerId: string;
        };
        stats: {
            totalMessages: number;
            totalContacts: number;
            totalTemplates: number;
        };
    }>;
    updateMyShop(user: any, body: any): Promise<{
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    }>;
    getWhatsAppCredentials(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        businessAccountId: string;
        phoneNumberId: string;
        accessToken: string;
        webhookVerifyToken: string | null;
    } | null>;
    updateWhatsAppCredentials(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        businessAccountId: string;
        phoneNumberId: string;
        accessToken: string;
        webhookVerifyToken: string | null;
    }>;
}
