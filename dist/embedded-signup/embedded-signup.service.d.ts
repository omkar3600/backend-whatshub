import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
export declare class EmbeddedSignupService {
    private prisma;
    private httpService;
    private cryptoService;
    private readonly logger;
    private readonly graphApiBase;
    constructor(prisma: PrismaService, httpService: HttpService, cryptoService: CryptoService);
    getConfig(): {
        appId: string;
        configId: string;
        scopes: string;
    };
    processCallback(userId: string, code: string, sessionInfo?: Record<string, any>, redirectUri?: string): Promise<{
        success: boolean;
        message: string;
        wabaAccount: {
            id: any;
            businessName: string | undefined;
            wabaId: string;
            status: string;
        };
        phoneNumbers: {
            phoneNumberId: string;
            displayPhoneNumber: any;
            verifiedName: any;
            qualityRating: any;
        }[];
    }>;
    getConnectionStatus(userId: string): Promise<{
        shopId: string;
        isConnected: boolean;
        accounts: {
            id: string;
            wabaId: string;
            businessName: string | null;
            status: string;
            tokenHealth: string;
            tokenExpiry: Date | null;
            onboardingSource: string;
            createdAt: Date;
            phoneNumbers: {
                id: string;
                phoneNumberId: string;
                displayPhoneNumber: string | null;
                verifiedName: string | null;
                qualityRating: string | null;
                messagingLimit: string | null;
                status: string;
                isDefault: boolean;
            }[];
        }[];
    }>;
    disconnectWaba(userId: string, wabaAccountId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reconnectWaba(userId: string, wabaAccountId: string, code: string, redirectUri?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private exchangeCodeForToken;
    private debugToken;
    private fetchOwnedWabas;
    private fetchWabaDetails;
    private fetchPhoneNumbers;
    private subscribeToWebhooks;
    private registerPhoneNumber;
    private logOnboardingEvent;
    getOnboardingLogs(userId: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        eventType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
