import { CustomerIntelligenceService } from './customer-intelligence.service';
export interface NextBestAction {
    contactId: string;
    action: string;
    confidence: number;
    rationale: string;
    recommendedTool?: string;
    toolParams?: Record<string, any>;
}
export declare class NextBestActionEngine {
    private readonly customerIntelligence;
    constructor(customerIntelligence: CustomerIntelligenceService);
    predict(shopId: string, contactId: string): Promise<NextBestAction>;
}
