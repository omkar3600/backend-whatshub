import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { BusinessAgentService } from '../../../ai/business/business-agent.service';
export declare class AiGoalAgentExecutor implements INodeExecutor {
    private readonly businessAgent;
    type: string;
    schema: INodeSchema;
    constructor(businessAgent: BusinessAgentService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
