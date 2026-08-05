import { PrismaService } from '../../prisma/prisma.service';
export interface OpportunityItem {
    id: string;
    type: 'HOT_LEAD' | 'ABANDONED_CART' | 'UPSELL' | 'AT_RISK' | 'HUMAN_ESCALATION';
    score: number;
    title: string;
    reason: string;
    contactId: string;
    contactName: string;
    contactPhone: string;
    estimatedValue: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedAction: string;
    createdAt: string;
}
export declare class OpportunityDetectionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    detectOpportunities(shopId: string): Promise<OpportunityItem[]>;
}
