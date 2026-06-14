import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/services/crypto.service';
export declare class AdminService {
    private prisma;
    private cryptoService;
    constructor(prisma: PrismaService, cryptoService: CryptoService);
    createShop(data: any): Promise<{
        message: string;
        shop: any;
        subscription: any;
    }>;
    getShops(): Promise<any>;
    updateShop(shopId: string, data: any): Promise<any>;
    updateSubscription(shopId: string, data: any): Promise<any>;
    toggleShopStatus(shopId: string, status: string): Promise<any>;
    deleteShop(shopId: string): Promise<any>;
    getRegistrationRequests(): Promise<any>;
    approveRegistrationRequest(requestId: string): Promise<any>;
    rejectRegistrationRequest(requestId: string): Promise<any>;
    getStats(): Promise<{
        totalShops: any;
        activeShops: any;
        disabledShops: any;
        expiredSubscriptions: any;
        connectedWabas: any;
        totalPhoneNumbers: any;
    }>;
    getTenantConnections(): Promise<any>;
    getWebhookFailures(shopId?: string): Promise<any>;
    getDeadLetterEvents(status?: string): Promise<any>;
    getTokenHealth(): Promise<any>;
    suspendShop(shopId: string): Promise<{
        message: string;
    }>;
    getOnboardingStatus(shopId: string): Promise<{
        status: string;
        events: any;
    }>;
    setWhatsAppCredentials(shopId: string, data: any): Promise<{
        message: string;
        account: any;
    }>;
}
