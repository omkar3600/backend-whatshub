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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsController = void 0;
const common_1 = require("@nestjs/common");
const workflows_service_1 = require("./workflows.service");
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const workflow_linter_service_1 = require("./engine/workflow-linter.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkflowsController = class WorkflowsController {
    engineService;
    prisma;
    workflowsService;
    linterService;
    constructor(engineService, prisma, workflowsService, linterService) {
        this.engineService = engineService;
        this.prisma = prisma;
        this.workflowsService = workflowsService;
        this.linterService = linterService;
    }
    async listWorkflows(shopId) {
        if (!shopId)
            throw new common_1.BadRequestException('shopId is required');
        return this.workflowsService.listWorkflows(shopId);
    }
    async getWorkflowVersions(id, shopId) {
        if (!shopId)
            throw new common_1.BadRequestException('shopId is required');
        return this.workflowsService.getWorkflowVersions(shopId, id);
    }
    async getWorkflow(id, shopId) {
        if (!shopId)
            throw new common_1.BadRequestException('shopId is required');
        return this.workflowsService.getWorkflow(shopId, id);
    }
    async createWorkflow(body) {
        if (!body.shopId || !body.name) {
            throw new common_1.BadRequestException('shopId and name are required');
        }
        try {
            return await this.workflowsService.createWorkflow(body.shopId, body.name);
        }
        catch (error) {
            console.error('Failed to create workflow:', error);
            throw new common_1.BadRequestException(error.message || 'Failed to create workflow');
        }
    }
    async createWorkflowVersion(id, queryShopId, body) {
        const shopId = body?.shopId || queryShopId;
        if (!shopId || !body?.graph)
            throw new common_1.BadRequestException('shopId and graph are required');
        return this.workflowsService.updateWorkflowGraph(shopId, id, body.graph);
    }
    async updateWorkflowGraph(id, queryShopId, body) {
        const shopId = body?.shopId || queryShopId;
        if (!shopId || !body?.graph)
            throw new common_1.BadRequestException('shopId and graph are required');
        return this.workflowsService.updateWorkflowGraph(shopId, id, body.graph);
    }
    async publishWorkflow(id, body) {
        if (!body.shopId)
            throw new common_1.BadRequestException('shopId is required');
        return this.workflowsService.publishWorkflow(body.shopId, id);
    }
    async deleteWorkflow(id, shopId) {
        if (!shopId)
            throw new common_1.BadRequestException('shopId is required');
        return this.workflowsService.deleteWorkflow(shopId, id);
    }
    async lintWorkflow(body) {
        if (!body.graph)
            throw new common_1.BadRequestException('graph is required');
        return { issues: this.linterService.lintGraph(body.graph) };
    }
    async triggerTestWorkflow(id, body) {
        const instance = await this.engineService.startWorkflow(body.shopId, id, body.contactId, { source: 'manual-api-test' });
        return { success: true, instanceId: instance.id };
    }
};
exports.WorkflowsController = WorkflowsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listWorkflows", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getWorkflowVersions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "createWorkflowVersion", null);
__decorate([
    (0, common_1.Put)([':id/version', ':id/versions']),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "updateWorkflowGraph", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "publishWorkflow", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "deleteWorkflow", null);
__decorate([
    (0, common_1.Post)('ai/lint'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "lintWorkflow", null);
__decorate([
    (0, common_1.Post)(':id/test-trigger'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "triggerTestWorkflow", null);
exports.WorkflowsController = WorkflowsController = __decorate([
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService,
        prisma_service_1.PrismaService,
        workflows_service_1.WorkflowsService,
        workflow_linter_service_1.WorkflowLinterService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map