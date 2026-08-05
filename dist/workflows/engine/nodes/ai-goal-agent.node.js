"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGoalAgentExecutor = void 0;
const common_1 = require("@nestjs/common");
const agent_goal_manager_1 = require("../../../ai/orchestrator/agent-goal.manager");
let AiGoalAgentExecutor = class AiGoalAgentExecutor {
    goalManager;
    type = 'aiGoalAgent';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(goalManager) {
        this.goalManager = goalManager;
    }
    async execute(context, nodeData) {
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
};
exports.AiGoalAgentExecutor = AiGoalAgentExecutor;
exports.AiGoalAgentExecutor = AiGoalAgentExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_goal_manager_1.AgentGoalManager])
], AiGoalAgentExecutor);
//# sourceMappingURL=ai-goal-agent.node.js.map