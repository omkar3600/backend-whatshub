import { AiGovernanceService } from './ai-governance.service';
export declare class AiGovernanceController {
    private readonly governance;
    constructor(governance: AiGovernanceService);
    getOverview(req: any): Promise<import("./ai-governance.service").GovernanceOverview>;
    setAutonomy(req: any, autonomyLevel: number): Promise<{
        success: boolean;
        autonomyLevel: number;
    }>;
}
