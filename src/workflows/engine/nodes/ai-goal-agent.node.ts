import { Injectable } from '@nestjs/common';
import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { AgentGoalManager } from '../../../ai/orchestrator/agent-goal.manager';

@Injectable()
export class AiGoalAgentExecutor implements INodeExecutor {
  type = 'aiGoalAgent';
  schema: INodeSchema = {
    validate: () => {},
    getSchema: () => ({ type: 'object' }),
  };

  constructor(private readonly goalManager: AgentGoalManager) {}

  async execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult> {
    const goalDescription = nodeData.goal || 'Qualify lead and recommend relevant products.';

    const goal = this.goalManager.createGoal({
      shopId: context.shopId,
      contactId: context.contactId,
      goalName: goalDescription,
      agentRole: nodeData.agentRole || 'SalesAgent',
      maxSteps: nodeData.maxSteps || 8,
      maxToolCalls: nodeData.maxToolCalls || 10,
    });

    context.variables.goalId = goal.id;
    context.variables.goalStatus = goal.status;

    return {
      status: 'continue',
      branch: 'success',
    };
  }
}
