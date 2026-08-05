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
exports.SubWorkflowExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SubWorkflowExecutor = class SubWorkflowExecutor {
    prisma;
    type = 'subWorkflow';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        const targetWorkflowId = nodeData.targetWorkflowId;
        if (!targetWorkflowId) {
            return { status: 'error', error: 'No target sub-workflow ID configured' };
        }
        const subWorkflow = await this.prisma.workflow.findFirst({
            where: { id: targetWorkflowId, shopId: context.shopId, status: 'published' },
            include: { versions: { where: { status: 'published' }, take: 1 } },
        });
        if (!subWorkflow || !subWorkflow.versions.length) {
            return { status: 'error', error: 'Target sub-workflow not found or unpublished' };
        }
        const subInstance = await this.prisma.workflowInstance.create({
            data: {
                shopId: context.shopId,
                workflowId: subWorkflow.id,
                workflowVersionId: subWorkflow.versions[0].id,
                contactId: context.contactId,
                status: 'active',
                variables: { ...context.variables, parentInstanceId: context.instanceId },
            },
        });
        context.variables.subInstanceId = subInstance.id;
        return {
            status: 'continue',
            branch: 'success',
        };
    }
};
exports.SubWorkflowExecutor = SubWorkflowExecutor;
exports.SubWorkflowExecutor = SubWorkflowExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubWorkflowExecutor);
//# sourceMappingURL=sub-workflow.node.js.map