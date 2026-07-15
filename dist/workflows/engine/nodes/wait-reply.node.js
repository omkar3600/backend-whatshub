"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WaitReplyExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitReplyExecutor = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
class WaitReplySchema {
    validate(config) {
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                timeoutMinutes: { type: 'number' }
            }
        };
    }
}
let WaitReplyExecutor = WaitReplyExecutor_1 = class WaitReplyExecutor {
    type = 'waitReply';
    schema = new WaitReplySchema();
    logger = new common_1.Logger(WaitReplyExecutor_1.name);
    async execute(context, nodeData) {
        this.logger.debug(`Executing WaitReply for instance ${context.instanceId}`);
        const resumeToken = (0, uuid_1.v4)();
        this.logger.log(`[Workflow] Instance paused, waiting for reply with token: ${resumeToken}`);
        return {
            status: 'wait',
            resumeToken
        };
    }
};
exports.WaitReplyExecutor = WaitReplyExecutor;
exports.WaitReplyExecutor = WaitReplyExecutor = WaitReplyExecutor_1 = __decorate([
    (0, common_1.Injectable)()
], WaitReplyExecutor);
//# sourceMappingURL=wait-reply.node.js.map