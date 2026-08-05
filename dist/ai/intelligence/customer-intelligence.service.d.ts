import { PrismaService } from '../../prisma/prisma.service';
export interface CustomerIntelligenceProfile {
    contactId: string;
    name: string;
    phone: string;
    city?: string | null;
    segment?: string | null;
    leadStage?: string | null;
    leadScore: number;
    preferences: Record<string, any>;
    purchaseHistory: any[];
    interactionsCount: number;
    lastInteractionAt?: Date | null;
    topInterests: string[];
    lifecycleStage: string;
}
export declare class CustomerIntelligenceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProfile(shopId: string, contactId: string): Promise<CustomerIntelligenceProfile | null>;
}
