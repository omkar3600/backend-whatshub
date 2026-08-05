import { BusinessAgentService } from './business-agent.service';
export declare class BusinessAgentController {
    private readonly businessAgent;
    constructor(businessAgent: BusinessAgentService);
    query(body: {
        question: string;
    }, req: any): Promise<{
        answer: string;
        data?: any;
    }>;
}
