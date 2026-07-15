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
var ConditionExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionExecutor = void 0;
const common_1 = require("@nestjs/common");
const expression_engine_service_1 = require("../expression-engine.service");
class ConditionSchema {
    validate(config) {
        if (!config.expression) {
            throw new Error('expression is required for condition node');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                expression: { type: 'string' }
            },
            required: ['expression']
        };
    }
}
let ConditionExecutor = ConditionExecutor_1 = class ConditionExecutor {
    expressionEngine;
    type = 'condition';
    schema = new ConditionSchema();
    logger = new common_1.Logger(ConditionExecutor_1.name);
    constructor(expressionEngine) {
        this.expressionEngine = expressionEngine;
    }
    async execute(context, nodeData) {
        this.logger.debug(`Executing Condition for instance ${context.instanceId}`);
        try {
            const isTrue = await this.expressionEngine.evaluateCondition(nodeData.expression, {
                contact: context.variables.contact,
                workflow: context.variables.workflow,
                system: { now: new Date().toISOString() }
            });
            this.logger.log(`[Workflow] Condition "${nodeData.expression}" evaluated to ${isTrue}`);
            return {
                status: 'continue',
                branch: isTrue ? 'true' : 'false'
            };
        }
        catch (error) {
            this.logger.error(`Failed to evaluate condition: ${error.message}`);
            return { status: 'error', error: error.message };
        }
    }
};
exports.ConditionExecutor = ConditionExecutor;
exports.ConditionExecutor = ConditionExecutor = ConditionExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [expression_engine_service_1.ExpressionEngineService])
], ConditionExecutor);
//# sourceMappingURL=condition.node.js.map