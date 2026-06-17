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
                status: string;
                createdAt: Date;
                updatedAt: Date;
                shopId: string;
                startDate: Date;
                expiryDate: Date;
            } | null;
            whatsappAccounts: ({
                phoneNumbers: {
                    id: string;
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
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
                businessName: string | null;
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                shopId: string;
                businessAccountId: string;
                wabaId: string | null;
                accessToken: string;
                tokenType: string;
                tokenExpiry: Date | null;
                webhookVerifyToken: string | null;
                onboardingSource: string;
            })[];
        } & {
            phone: string;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopName: string;
            ownerId: string;
        };
        stats: {
            totalMessages: number;
            totalContacts: number;
            totalTemplates: number;
        };
    }>;
    updateShopDetails(shopId: string, data: any): Promise<{
        phone: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
    updateWhatsAppCredentials(shopId: string, data: any): Promise<{
        businessName: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
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
