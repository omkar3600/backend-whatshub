"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ForEachExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForEachExecutor = void 0;
const common_1 = require("@nestjs/common");
class ForEachSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                arrayVariable: { type: 'string' },
                maxIterations: { type: 'number', default: 100 },
                itemVariable: { type: 'string', default: 'currentItem' },
            },
        };
    }
}
let ForEachExecutor = ForEachExecutor_1 = class ForEachExecutor {
    type = 'forEach';
    schema = new ForEachSchema();
    logger = new common_1.Logger(ForEachExecutor_1.name);
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing ForEach for instance ${context.instanceId}`);
        const arrName = nodeData.arrayVariable || 'items';
        const targetArr = context.variables[arrName];
        if (!Array.isArray(targetArr) || targetArr.length === 0) {
            this.logger.log(`[ForEach Node] Array "${arrName}" is empty or not an array. Exiting loop.`);
            return { status: 'continue', branch: 'completed' };
        }
        const maxLimit = Math.min(nodeData.maxIterations || 100, 500);
        const currentIndex = (context.variables._loopIndex || 0);
        if (currentIndex >= targetArr.length || currentIndex >= maxLimit) {
            this.logger.log(`[ForEach Node] Loop finished at index ${currentIndex}.`);
            delete context.variables._loopIndex;
            return { status: 'continue', branch: 'completed' };
        }
        const itemVar = nodeData.itemVariable || 'currentItem';
        context.variables[itemVar] = targetArr[currentIndex];
        context.variables._loopIndex = currentIndex + 1;
        this.logger.log(`[ForEach Node] Iteration ${currentIndex + 1}/${targetArr.length}: item = ${JSON.stringify(targetArr[currentIndex])}`);
        return { status: 'continue', branch: 'loop' };
    }
};
exports.ForEachExecutor = ForEachExecutor;
exports.ForEachExecutor = ForEachExecutor = ForEachExecutor_1 = __decorate([
    (0, common_1.Injectable)()
], ForEachExecutor);
//# sourceMappingURL=for-each.node.js.map