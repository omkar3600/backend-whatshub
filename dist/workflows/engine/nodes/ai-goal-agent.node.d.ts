import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { AgentGoalManager } from '../../../ai/orchestrator/agent-goal.manager';
export declare class AiGoalAgentExecutor implements INodeExecutor {
    private readonly goalManager;
    type: string;
    schema: INodeSchema;
    constructor(goalManager: AgentGoalManager);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
