"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DelayExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayExecutor = void 0;
const common_1 = require("@nestjs/common");
class DelaySchema {
    validate(config) {
        if (!config.delayValue || !config.delayUnit) {
            throw new Error('delayValue and delayUnit are required');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                delayValue: { type: 'number' },
                delayUnit: { type: 'string', enum: ['seconds', 'minutes', 'hours', 'days'] }
            },
            required: ['delayValue', 'delayUnit']
        };
    }
}
let DelayExecutor = DelayExecutor_1 = class DelayExecutor {
    type = 'delay';
    schema = new DelaySchema();
    logger = new common_1.Logger(DelayExecutor_1.name);
    async execute(context, nodeData) {
        this.logger.debug(`Executing Delay for instance ${context.instanceId}`);
        let delayMs = 0;
        const value = nodeData.delayValue || 0;
        switch (nodeData.delayUnit) {
            case 'seconds':
                delayMs = value * 1000;
                break;
            case 'minutes':
                delayMs = value * 60 * 1000;
                break;
            case 'hours':
                delayMs = value * 60 * 60 * 1000;
                break;
            case 'days':
                delayMs = value * 24 * 60 * 60 * 1000;
                break;
        }
        this.logger.log(`Pausing workflow instance ${context.instanceId} for ${delayMs}ms`);
        return { status: 'pause', delayMs };
    }
};
exports.DelayExecutor = DelayExecutor;
exports.DelayExecutor = DelayExecutor = DelayExecutor_1 = __decorate([
    (0, common_1.Injectable)()
], DelayExecutor);
//# sourceMappingURL=delay.node.js.map