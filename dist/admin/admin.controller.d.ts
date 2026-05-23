import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createShop(body: any): Promise<{
        message: string;
        shop: {
            shopName: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            ownerId: string;
        };
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        };
    }>;
    getShops(): Promise<({
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        } | null;
        owner: {
            username: string;
            id: string;
        };
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
    })[]>;
    updateSubscription(shopId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        expiryDate: Date;
        startDate: Date;
        shopId: string;
    }>;
    updateShop(shopId: string, body: any): Promise<{
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        } | null;
        owner: {
            username: string;
            id: string;
        };
    } & {
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    }>;
    toggleShopStatus(shopId: string, body: any): Promise<{
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
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
    getRegistrationRequests(): Promise<{
        username: string;
        password: string;
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    }[]>;
    approveRequest(id: string): Promise<{
        message: string;
        user: {
            username: string;
            id: string;
            passwordHash: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        };
        shop: {
            shopName: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            ownerId: string;
        };
    }>;
    rejectRequest(id: string): Promise<{
        username: string;
        password: string;
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    }>;
    getTenantConnections(): Promise<{
        shopId: string;
        shopName: string;
        owner: {
            username: string;
            id: string;
        };
        status: string;
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
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
        createdAt: Date;
        status: string;
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
        };
    }>;
}
