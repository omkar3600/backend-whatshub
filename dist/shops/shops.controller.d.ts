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
                shopId: string;
                startDate: Date;
                expiryDate: Date;
            } | null;
            whatsappAccounts: ({
                phoneNumbers: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    shopId: string;
                    wabaAccountId: string;
                    phoneNumberId: string;
                    displayPhoneNumber: string | null;
                    verifiedName: string | null;
                    qualityRating: string | null;
                    messagingLimit: string | null;
                    nameStatus: string | null;
                    pendingName: string | null;
                    isDefault: boolean;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                shopId: string;
                businessAccountId: string;
                wabaId: string | null;
                businessName: string | null;
                accessToken: string;
                tokenType: string;
                tokenExpiry: Date | null;
                webhookVerifyToken: string | null;
                onboardingSource: string;
            })[];
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
        businessAccountId: string;
        wabaId: string | null;
        businessName: string | null;
        phoneNumberId: string;
        status: string;
        tokenType: string;
        tokenExpiry: Date | null;
        onboardingSource: string;
        phoneNumbers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            shopId: string;
            wabaAccountId: string;
            phoneNumberId: string;
            displayPhoneNumber: string | null;
            verifiedName: string | null;
            qualityRating: string | null;
            messagingLimit: string | null;
            nameStatus: string | null;
            pendingName: string | null;
            isDefault: boolean;
        }[];
    } | null>;
    updateWhatsAppCredentials(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        businessAccountId: string;
        wabaId: string | null;
        businessName: string | null;
        accessToken: string;
        tokenType: string;
        tokenExpiry: Date | null;
        webhookVerifyToken: string | null;
        onboardingSource: string;
    }>;
}
