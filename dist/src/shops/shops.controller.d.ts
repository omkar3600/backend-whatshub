import { ShopsService } from './shops.service';
export declare class ShopsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    getMyShop(user: any): Promise<{
        shop: {
            subscription: {
                id: string;
                shopId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                expiryDate: Date;
            } | null;
            whatsappAccounts: ({
                phoneNumbers: {
                    id: string;
                    shopId: string;
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
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
                shopId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                businessName: string | null;
                businessAccountId: string;
                wabaId: string | null;
                accessToken: string;
                tokenType: string;
                tokenExpiry: Date | null;
                webhookVerifyToken: string | null;
                onboardingSource: string;
            })[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            shopName: string;
            ownerId: string;
        };
        stats: {
            totalMessages: number;
            totalContacts: number;
            totalTemplates: number;
            contactGrowth: number;
            newContacts: number;
        };
        campaignFunnel: {
            sent: number;
            delivered: number;
            read: number;
            failed: number;
        };
        recentCampaigns: {
            id: string;
            name: string;
            status: string;
            stats: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        }[];
        messageVolume: {
            date: string;
            inbound: number;
            outbound: number;
        }[];
    }>;
    updateMyShop(user: any, body: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        shopName: string;
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
            shopId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
        shopId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        businessName: string | null;
        businessAccountId: string;
        wabaId: string | null;
        accessToken: string;
        tokenType: string;
        tokenExpiry: Date | null;
        webhookVerifyToken: string | null;
        onboardingSource: string;
    }>;
}
