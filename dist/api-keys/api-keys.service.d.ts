import { PrismaService } from '../prisma/prisma.service';
export declare class ApiKeysService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private hashKey;
    private parseScopes;
    createApiKey(shopId: string, name: string, scopes?: string[]): Promise<{
        apiKey: {
            id: string;
            name: string;
            scopes: string[];
            status: string;
            createdAt: Date;
        };
        rawKey: string;
    }>;
    listApiKeys(shopId: string): Promise<{
        scopes: string[];
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        expiresAt: Date | null;
        lastUsedAt: Date | null;
    }[]>;
    revokeApiKey(shopId: string, keyId: string): Promise<{
        id: string;
        status: string;
    }>;
}
