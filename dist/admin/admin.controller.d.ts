import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createShop(body: any): Promise<{
        message: string;
        shop: {
            phone: string;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopName: string;
            ownerId: string;
        };
        subscription: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            startDate: Date;
            expiryDate: Date;
        };
    }>;
    getShops(): Promise<({
        subscription: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            startDate: Date;
            expiryDate: Date;
        } | null;
        owner: {
            id: string;
            username: string;
        };
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
    })[]>;
    updateSubscription(shopId: string, body: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        startDate: Date;
        expiryDate: Date;
    }>;
    updateShop(shopId: string, body: any): Promise<{
        subscription: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            startDate: Date;
            expiryDate: Date;
        } | null;
        owner: {
            id: string;
            username: string;
        };
    } & {
        phone: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopName: string;
        ownerId: string;
    }>;
    toggleShopStatus(shopId: string, body: any): Promise<{
        phone: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopName: string;
        ownerId: string;
    }>;
    deleteShop(shopId: string): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalShops: number;
        activeShops: number;
        disabledShops: number;
        expiredSubscriptions: number;
        connectedWabas: number;
        totalPhoneNumbers: number;
    }>;
    getDemoRequests(): Promise<{
        name: string;
        phone: string;
        businessName: string;
        businessType: string;
        city: string;
        state: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    resolveRequest(id: string): Promise<{
        message: string;
    }>;
    rejectRequest(id: string): Promise<{
        name: string;
        phone: string;
        businessName: string;
        businessType: string;
        city: string;
        state: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTenantConnections(): Promise<{
        shopId: string;
        shopName: string;
        owner: {
            id: string;
            username: string;
        };
        status: string;
        subscription: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            startDate: Date;
            expiryDate: Date;
        } | null;
        isConnected: boolean;
        accounts: {
            id: string;
            wabaId: string;
            businessName: string | null;
            status: string;
            tokenHealth: string;
            tokenExpiry: Date | null;
            onboardingSource: string;
            phoneNumbers: {
                phoneNumberId: string;
                displayPhoneNumber: string | null;
                verifiedName: string | null;
                qualityRating: string | null;
                messagingLimit: string | null;
                status: string;
            }[];
        }[];
    }[]>;
    getWebhookFailures(shopId?: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string | null;
        phoneNumberId: string | null;
        eventType: string;
        waMessageId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processingStatus: string;
        errorMessage: string | null;
        retryCount: number;
    }[]>;
    getDeadLetterEvents(status?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        errorMessage: string | null;
        retryCount: number;
        sourceType: string;
        originalPayload: import("@prisma/client/runtime/library").JsonValue;
        maxRetries: number;
        lastAttemptAt: Date | null;
        resolvedAt: Date | null;
    }[]>;
    getTokenHealth(): Promise<{
        shopName: string;
        wabaId: string;
        businessName: string | null;
        status: string;
        tokenHealth: string;
        tokenExpiry: Date | null;
    }[]>;
    suspendShop(shopId: string): Promise<{
        message: string;
    }>;
    getOnboardingStatus(shopId: string): Promise<{
        status: string;
        events: {
            id: string;
            createdAt: Date;
            shopId: string;
            eventType: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    setWhatsAppCredentials(shopId: string, body: any): Promise<{
        message: string;
        account: {
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
        };
    }>;
}
