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
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workflow_publishing_service_1 = require("./engine/workflow-publishing.service");
let WorkflowsService = class WorkflowsService {
    prisma;
    publishingService;
    constructor(prisma, publishingService) {
        this.prisma = prisma;
        this.publishingService = publishingService;
    }
    async listWorkflows(shopId) {
        return this.prisma.workflow.findMany({
            where: { shopId },
            include: {
                _count: {
                    select: { instances: { where: { status: 'active' } } }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }
    async getWorkflow(shopId, id) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id, shopId },
            include: {
                versions: {
                    orderBy: { versionNumber: 'desc' },
                    take: 1
                }
            }
        });
        if (!workflow)
            throw new common_1.NotFoundException('Workflow not found');
        return workflow;
    }
    async getWorkflowVersions(shopId, id) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id, shopId },
            include: {
                versions: {
                    orderBy: { versionNumber: 'desc' },
                }
            }
        });
        if (!workflow)
            throw new common_1.NotFoundException('Workflow not found');
        return workflow.versions;
    }
    async createWorkflow(shopId, name) {
        return this.prisma.workflow.create({
            data: {
                shopId,
                name,
                status: 'draft',
                versions: {
                    create: {
                        versionNumber: 1,
                        status: 'draft',
                        graph: { nodes: [], edges: [] }
                    }
                }
            },
            include: {
                versions: true
            }
        });
    }
    async updateWorkflowGraph(shopId, id, graph) {
        const workflow = await this.getWorkflow(shopId, id);
        let latestVersion = workflow.versions[0];
        if (latestVersion.status === 'published') {
            latestVersion = await this.prisma.workflowVersion.create({
                data: {
                    workflowId: workflow.id,
                    versionNumber: latestVersion.versionNumber + 1,
                    status: 'draft',
                    graph: graph,
                }
            });
            await this.prisma.workflow.update({
                where: { id: workflow.id },
                data: { status: 'draft' }
            });
        }
        else {
            latestVersion = await this.prisma.workflowVersion.update({
                where: { id: latestVersion.id },
                data: { graph }
            });
        }
        return latestVersion;
    }
    async publishWorkflow(shopId, id) {
        const workflow = await this.getWorkflow(shopId, id);
        const latestVersion = workflow.versions[0];
        if (!latestVersion || latestVersion.status === 'published') {
            return workflow;
        }
        this.publishingService.validateGraph(latestVersion.graph);
        await this.prisma.workflowVersion.update({
            where: { id: latestVersion.id },
            data: { status: 'published' }
        });
        return this.prisma.workflow.update({
            where: { id },
            data: { status: 'published' }
        });
    }
    async deleteWorkflow(shopId, id) {
        await this.prisma.workflowInstance.deleteMany({ where: { workflowId: id, shopId } });
        await this.prisma.workflowVersion.deleteMany({ where: { workflowId: id } });
        return this.prisma.workflow.delete({ where: { id, shopId } });
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_publishing_service_1.WorkflowPublishingService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map