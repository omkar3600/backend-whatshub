import { PrismaService } from '../../prisma/prisma.service';
export interface NegotiationResult {
    permitted: boolean;
    approvedDiscountPercentage: number;
    reason: string;
}
export declare class NegotiationEngineService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    evaluateDiscount(shopId: string, contactId: string, requestedDiscountPercentage: number, productPrice: number): Promise<NegotiationResult>;
}
