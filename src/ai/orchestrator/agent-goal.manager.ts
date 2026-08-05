import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type GoalStatus = 
  | 'PLANNING'
  | 'RUNNING'
  | 'WAITING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface AgentGoal {
  id: string;
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
  stepLogs: { stepIndex: number; action: string; result: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AgentGoalManager {
  private readonly logger = new Logger(AgentGoalManager.name);
  private goals = new Map<string, AgentGoal>();

  createGoal(opts: {
    shopId: string;
    contactId?: string;
    goalName: string;
    agentRole: string;
    maxSteps?: number;
    maxToolCalls?: number;
    successCriteria?: string[];
    failureCriteria?: string[];
    executionPlan?: string[];
  }): AgentGoal {
    const goal: AgentGoal = {
      id: `goal_${uuidv4().substring(0, 8)}`,
      shopId: opts.shopId,
      contactId: opts.contactId,
      goalName: opts.goalName,
      agentRole: opts.agentRole,
      status: 'PLANNING',
      maxSteps: opts.maxSteps ?? 8,
      maxToolCalls: opts.maxToolCalls ?? 10,
      currentStep: 0,
      toolCallsCount: 0,
      successCriteria: opts.successCriteria || ['objective_achieved'],
      failureCriteria: opts.failureCriteria || ['max_steps_exceeded', 'escalated'],
      executionPlan: opts.executionPlan || ['Analyze request', 'Execute tools', 'Verify outcome'],
      stepLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.goals.set(goal.id, goal);
    return goal;
  }

  getGoal(goalId: string): AgentGoal | undefined {
    return this.goals.get(goalId);
  }

  recordStep(goalId: string, action: string, result: string, isToolCall = false): GoalStatus {
    const goal = this.goals.get(goalId);
    if (!goal) return 'FAILED';

    goal.currentStep += 1;
    if (isToolCall) goal.toolCallsCount += 1;

    goal.stepLogs.push({
      stepIndex: goal.currentStep,
      action,
      result,
      timestamp: new Date().toISOString(),
    });

    goal.updatedAt = new Date().toISOString();

    if (goal.currentStep >= goal.maxSteps || goal.toolCallsCount >= goal.maxToolCalls) {
      goal.status = 'FAILED';
      this.logger.warn(`Goal ${goalId} reached step/tool limit (${goal.currentStep}/${goal.maxSteps})`);
    } else {
      goal.status = 'RUNNING';
    }

    return goal.status;
  }

  updateStatus(goalId: string, status: GoalStatus): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = status;
      goal.updatedAt = new Date().toISOString();
    }
  }
}
