import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/services/crypto.service';
export declare class ShopsService {
    private prisma;
    private cryptoService;
    private readonly logger;
    constructor(prisma: PrismaService, cryptoService: CryptoService);
    getShopOverview(shopId: string): Promise<{
        shop: any;
        stats: {
            totalMessages: any;
            totalContacts: any;
            totalTemplates: any;
        };
    }>;
    updateShopDetails(shopId: string, data: any): Promise<any>;
    getWhatsAppCredentials(shopId: string): Promise<{
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
    updateWhatsAppCredentials(shopId: string, data: any): Promise<any>;
    private getExistingAccountId;
}
