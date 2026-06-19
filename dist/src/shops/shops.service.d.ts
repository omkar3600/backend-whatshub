import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/services/crypto.service';
export declare class ShopsService {
    private prisma;
    private cryptoService;
    private readonly logger;
    constructor(prisma: PrismaService, cryptoService: CryptoService);
    getShopOverview(shopId: string): Promise<{
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
    updateShopDetails(shopId: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        shopName: string;
        ownerId: string;
    }>;
    getWhatsAppCredentials(shopId: string): Promise<{
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
    updateWhatsAppCredentials(shopId: string, data: any): Promise<{
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
    private getExistingAccountId;
}
