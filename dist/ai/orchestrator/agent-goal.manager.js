"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgentGoalManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentGoalManager = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let AgentGoalManager = AgentGoalManager_1 = class AgentGoalManager {
    logger = new common_1.Logger(AgentGoalManager_1.name);
    goals = new Map();
    createGoal(opts) {
        const goalId = `goal_${(0, uuid_1.v4)().substring(0, 8)}`;
        const goal = {
            id: goalId,
            parentGoalId: opts.parentGoalId,
            subGoalIds: [],
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
        if (opts.parentGoalId) {
            const parent = this.goals.get(opts.parentGoalId);
            if (parent) {
                parent.subGoalIds.push(goalId);
                parent.updatedAt = new Date().toISOString();
            }
        }
        this.goals.set(goal.id, goal);
        return goal;
    }
    getGoal(goalId) {
        return this.goals.get(goalId);
    }
    recordStep(goalId, action, result, isToolCall = false) {
        const goal = this.goals.get(goalId);
        if (!goal)
            return 'FAILED';
        goal.currentStep += 1;
        if (isToolCall)
            goal.toolCallsCount += 1;
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
        }
        else {
            goal.status = 'RUNNING';
        }
        return goal.status;
    }
    updateStatus(goalId, status) {
        const goal = this.goals.get(goalId);
        if (goal) {
            goal.status = status;
            goal.updatedAt = new Date().toISOString();
            if (goal.parentGoalId && status === 'COMPLETED') {
                const parent = this.goals.get(goal.parentGoalId);
                if (parent) {
                    const allSubsCompleted = parent.subGoalIds.every(id => this.goals.get(id)?.status === 'COMPLETED');
                    if (allSubsCompleted) {
                        parent.status = 'COMPLETED';
                        parent.updatedAt = new Date().toISOString();
                    }
                }
            }
        }
    }
};
exports.AgentGoalManager = AgentGoalManager;
exports.AgentGoalManager = AgentGoalManager = AgentGoalManager_1 = __decorate([
    (0, common_1.Injectable)()
], AgentGoalManager);
//# sourceMappingURL=agent-goal.manager.js.map