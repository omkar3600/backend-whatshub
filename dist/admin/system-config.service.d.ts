import { PrismaService } from '../prisma/prisma.service';
export declare class SystemConfigService {
    private prisma;
    private readonly logger;
    private cache;
    private cacheLoadedAt;
    private readonly cacheTtlMs;
    constructor(prisma: PrismaService);
    private loadCache;
    get(key: string, envFallback?: string): Promise<string | undefined>;
    set(key: string, value: string, isSecret?: boolean, updatedBy?: string): Promise<void>;
    getAll(): Promise<Array<{
        key: string;
        value: string;
        isSecret: boolean;
        updatedAt: Date;
        updatedBy: string | null;
    }>>;
    delete(key: string): Promise<void>;
    invalidateCache(): void;
}
