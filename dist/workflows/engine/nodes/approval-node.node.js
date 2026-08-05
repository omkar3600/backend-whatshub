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
var ApprovalExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
class ApprovalSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                actionDescription: { type: 'string' },
                riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            },
        };
    }
}
let ApprovalExecutor = ApprovalExecutor_1 = class ApprovalExecutor {
    prisma;
    type = 'approvalNode';
    schema = new ApprovalSchema();
    logger = new common_1.Logger(ApprovalExecutor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing ApprovalNode for instance ${context.instanceId}`);
        const approval = await this.prisma.aiAction.create({
            data: {
                shopId: context.shopId,
                contactId: context.contactId,
                toolName: nodeData.actionDescription || 'Workflow Action',
                toolInput: nodeData,
                riskLevel: nodeData.riskLevel || 'MEDIUM',
                rationale: 'Workflow requested owner approval before proceeding.',
                status: 'PENDING',
            },
        });
        this.logger.log(`[Approval Node] Created approval request ID: ${approval.id}. Pausing workflow instance.`);
        return { status: 'wait', resumeToken: `approval_${approval.id}` };
    }
};
exports.ApprovalExecutor = ApprovalExecutor;
exports.ApprovalExecutor = ApprovalExecutor = ApprovalExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalExecutor);
//# sourceMappingURL=approval-node.node.js.map