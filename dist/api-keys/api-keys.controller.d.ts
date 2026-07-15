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
            scopes: any;
            status: string;
            createdAt: Date;
        };
        rawKey: string;
    }>;
    listApiKeys(user: any): Promise<{
        scopes: any;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        lastUsedAt: Date | null;
        expiresAt: Date | null;
    }[]>;
    revokeApiKey(user: any, id: string): Promise<{
        id: string;
        status: string;
    }>;
}
