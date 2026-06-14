import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createShop(body: any): Promise<{
        message: string;
        shop: any;
        subscription: any;
    }>;
    getShops(): Promise<any>;
    updateSubscription(shopId: string, body: any): Promise<any>;
    updateShop(shopId: string, body: any): Promise<any>;
    toggleShopStatus(shopId: string, body: any): Promise<any>;
    deleteShop(shopId: string): Promise<any>;
    getStats(): Promise<{
        totalShops: any;
        activeShops: any;
        disabledShops: any;
        expiredSubscriptions: any;
        connectedWabas: any;
        totalPhoneNumbers: any;
    }>;
    getRegistrationRequests(): Promise<any>;
    approveRequest(id: string): Promise<any>;
    rejectRequest(id: string): Promise<any>;
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
    setWhatsAppCredentials(shopId: string, body: any): Promise<{
        message: string;
        account: any;
    }>;
}
