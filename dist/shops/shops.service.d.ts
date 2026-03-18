import { PrismaService } from '../prisma/prisma.service';
export declare class ShopsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getShopOverview(shopId: string): Promise<{
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
    updateShopDetails(shopId: string, data: any): Promise<{
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    }>;
    getWhatsAppCredentials(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        businessAccountId: string;
        phoneNumberId: string;
        accessToken: string;
        webhookVerifyToken: string | null;
    } | null>;
    updateWhatsAppCredentials(shopId: string, data: any): Promise<{
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
