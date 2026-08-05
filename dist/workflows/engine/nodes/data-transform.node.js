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
var DataTransformExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransformExecutor = void 0;
const common_1 = require("@nestjs/common");
const expression_engine_service_1 = require("../expression-engine.service");
class DataTransformSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                operation: { type: 'string', enum: ['extract', 'format', 'merge', 'pick'] },
                sourceExpression: { type: 'string' },
                outputVariable: { type: 'string' },
            },
        };
    }
}
let DataTransformExecutor = DataTransformExecutor_1 = class DataTransformExecutor {
    expressionEngine;
    type = 'dataTransform';
    schema = new DataTransformSchema();
    logger = new common_1.Logger(DataTransformExecutor_1.name);
    constructor(expressionEngine) {
        this.expressionEngine = expressionEngine;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing DataTransform for instance ${context.instanceId}`);
        const expr = nodeData.sourceExpression || '';
        const varName = nodeData.outputVariable || 'transformedData';
        try {
            const evalCtx = {
                contact: context.variables.contact || {},
                variables: context.variables,
                workflow: context.variables.workflow || {},
            };
            const result = await this.expressionEngine.evaluateCondition(expr, evalCtx);
            context.variables[varName] = result;
            return { status: 'continue' };
        }
        catch (e) {
            this.logger.error(`[DataTransform Error] ${e.message}`);
            return { status: 'error', error: e.message };
        }
    }
};
exports.DataTransformExecutor = DataTransformExecutor;
exports.DataTransformExecutor = DataTransformExecutor = DataTransformExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [expression_engine_service_1.ExpressionEngineService])
], DataTransformExecutor);
//# sourceMappingURL=data-transform.node.js.map