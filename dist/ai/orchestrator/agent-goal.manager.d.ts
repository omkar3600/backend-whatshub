export type GoalStatus = 'NOT_STARTED' | 'PLANNING' | 'RUNNING' | 'WAITING' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface AgentGoal {
    id: string;
    parentGoalId?: string;
    subGoalIds: string[];
    shopId: string;
    contactId?: string;
    goalName: string;
    agentRole: string;
    status: GoalStatus;
    maxSteps: number;
    maxToolCalls: number;
    currentStep: number;
    toolCallsCount: number;
    successCriteria: string[];
    failureCriteria: string[];
    executionPlan: string[];
    stepLogs: {
        stepIndex: number;
        action: string;
        result: string;
        timestamp: string;
    }[];
    createdAt: string;
    updatedAt: string;
}
export declare class AgentGoalManager {
    private readonly logger;
    private goals;
    createGoal(opts: {
        shopId: string;
        parentGoalId?: string;
        contactId?: string;
        goalName: string;
        agentRole: string;
        maxSteps?: number;
        maxToolCalls?: number;
        successCriteria?: string[];
        failureCriteria?: string[];
        executionPlan?: string[];
    }): AgentGoal;
    getGoal(goalId: string): AgentGoal | undefined;
    recordStep(goalId: string, action: string, result: string, isToolCall?: boolean): GoalStatus;
    updateStatus(goalId: string, status: GoalStatus): void;
}
