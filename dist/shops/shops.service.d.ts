import { PrismaService } from '../prisma/prisma.service';
export declare class ShopsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getShopOverview(shopId: string): Promise<{
        shop: any;
        stats: {
            totalMessages: any;
            totalContacts: any;
            totalTemplates: any;
        };
    }>;
    updateShopDetails(shopId: string, data: any): Promise<any>;
    getWhatsAppCredentials(shopId: string): Promise<any>;
    updateWhatsAppCredentials(shopId: string, data: any): Promise<any>;
}
