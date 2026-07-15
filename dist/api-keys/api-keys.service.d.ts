import { PrismaService } from '../prisma/prisma.service';
export declare class ApiKeysService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private hashKey;
    createApiKey(shopId: string, name: string, scopes?: string[]): Promise<{
        apiKey: {
            id: string;
            name: string;
            scopes: any;
            status: string;
            createdAt: Date;
        };
        rawKey: string;
    }>;
    listApiKeys(shopId: string): Promise<{
        scopes: any;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        lastUsedAt: Date | null;
        expiresAt: Date | null;
    }[]>;
    revokeApiKey(shopId: string, keyId: string): Promise<{
        id: string;
        status: string;
    }>;
}
