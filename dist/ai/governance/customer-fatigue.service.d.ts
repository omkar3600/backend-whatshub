import { PrismaService } from '../../prisma/prisma.service';
export interface FatigueCheckResult {
    canContact: boolean;
    fatigueScore: number;
    reason?: string;
}
export declare class CustomerFatigueService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkFatigue(shopId: string, contactId: string): Promise<FatigueCheckResult>;
}
