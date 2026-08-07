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
const business_agent_service_1 = require("../../../ai/business/business-agent.service");
let AiGoalAgentExecutor = class AiGoalAgentExecutor {
    businessAgent;
    type = 'aiGoalAgent';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(businessAgent) {
        this.businessAgent = businessAgent;
    }
    async execute(context, nodeData) {
        const goalDescription = nodeData.goal || 'Qualify lead and recommend relevant products.';
        const result = await this.businessAgent.query(context.shopId, `Goal: ${goalDescription}`);
        context.variables.goalStatus = 'COMPLETED';
        context.variables.aiGoalReply = result.answer;
        return {
            status: 'continue',
            branch: 'success',
        };
    }
};
exports.AiGoalAgentExecutor = AiGoalAgentExecutor;
exports.AiGoalAgentExecutor = AiGoalAgentExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [business_agent_service_1.BusinessAgentService])
], AiGoalAgentExecutor);
//# sourceMappingURL=ai-goal-agent.node.js.map