import { PrismaService } from '../prisma/prisma.service';
export declare class SystemSchedulerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cleanupExpiredAiActions(): Promise<void>;
    dailyMaintenanceCleanup(): Promise<void>;
}
