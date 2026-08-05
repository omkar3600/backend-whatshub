import { ApiKeysService } from './api-keys.service';
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    createApiKey(user: any, body: {
        name: string;
        scopes?: string[];
    }): Promise<{
        apiKey: {
            id: string;
            name: string;
            scopes: string[];
            status: string;
            createdAt: Date;
        };
        rawKey: string;
    }>;
    listApiKeys(user: any): Promise<{
        scopes: string[];
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        expiresAt: Date | null;
        lastUsedAt: Date | null;
    }[]>;
    revokeApiKey(user: any, id: string): Promise<{
        id: string;
        status: string;
    }>;
}
