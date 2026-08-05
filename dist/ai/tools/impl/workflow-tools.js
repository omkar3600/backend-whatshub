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
exports.WorkflowTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let WorkflowTools = class WorkflowTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'trigger_workflow',
                description: 'Programmatically trigger a published visual workflow for a contact.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        workflowId: { type: 'string', description: 'ID of the published workflow' },
                        triggerVariables: { type: 'object', description: 'Key-value parameters for workflow execution' },
                    },
                    required: ['workflowId'],
                },
                riskLevel: 'MEDIUM',
                requiresApproval: (autonomyLevel) => autonomyLevel < 2,
                execute: async (ctx, params) => {
                    const workflow = await this.prisma.workflow.findFirst({
                        where: { id: params.workflowId, shopId: ctx.shopId, status: 'published' },
                        include: { versions: { where: { status: 'published' }, take: 1 } },
                    });
                    if (!workflow) {
                        return { success: false, error: 'Published workflow not found or inactive.' };
                    }
                    if (!ctx.contactId) {
                        return { success: false, error: 'No target contact in context to run workflow for.' };
                    }
                    const publishedVersion = workflow.versions[0];
                    if (!publishedVersion) {
                        return { success: false, error: 'No published version available for this workflow.' };
                    }
                    const instance = await this.prisma.workflowInstance.create({
                        data: {
                            shopId: ctx.shopId,
                            workflowId: workflow.id,
                            workflowVersionId: publishedVersion.id,
                            contactId: ctx.contactId,
                            status: 'active',
                            variables: params.triggerVariables || {},
                        },
                    });
                    return {
                        success: true,
                        data: {
                            instanceId: instance.id,
                            workflowName: workflow.name,
                            status: 'STARTED',
                            message: `Workflow '${workflow.name}' triggered successfully for contact.`,
                        },
                    };
                },
            },
            {
                name: 'get_active_workflows',
                description: 'List active and published visual workflows available in the system.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    const workflows = await this.prisma.workflow.findMany({
                        where: { shopId: ctx.shopId, status: 'published' },
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            status: true,
                            updatedAt: true,
                        },
                    });
                    return {
                        success: true,
                        data: {
                            count: workflows.length,
                            workflows,
                        },
                    };
                },
            },
        ];
    }
};
exports.WorkflowTools = WorkflowTools;
exports.WorkflowTools = WorkflowTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowTools);
//# sourceMappingURL=workflow-tools.js.map