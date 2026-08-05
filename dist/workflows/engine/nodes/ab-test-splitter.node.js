"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AbTestSplitterExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbTestSplitterExecutor = void 0;
const common_1 = require("@nestjs/common");
class AbTestSplitterSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                splitPercentage: { type: 'number', default: 50 },
            },
        };
    }
}
let AbTestSplitterExecutor = AbTestSplitterExecutor_1 = class AbTestSplitterExecutor {
    type = 'abTestSplitter';
    schema = new AbTestSplitterSchema();
    logger = new common_1.Logger(AbTestSplitterExecutor_1.name);
    async execute(context, nodeData) {
        const percentage = typeof nodeData.splitPercentage === 'number' ? nodeData.splitPercentage : 50;
        const randomVal = Math.random() * 100;
        const chosenBranch = randomVal < percentage ? 'pathA' : 'pathB';
        this.logger.log(`[Workflow A/B Splitter] Instance ${context.instanceId} random ${randomVal.toFixed(1)}% -> ${chosenBranch}`);
        context.variables.abChoice = chosenBranch;
        return { status: 'continue', branch: chosenBranch };
    }
};
exports.AbTestSplitterExecutor = AbTestSplitterExecutor;
exports.AbTestSplitterExecutor = AbTestSplitterExecutor = AbTestSplitterExecutor_1 = __decorate([
    (0, common_1.Injectable)()
], AbTestSplitterExecutor);
//# sourceMappingURL=ab-test-splitter.node.js.map