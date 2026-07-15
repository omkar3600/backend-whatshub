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
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkflowsController = class WorkflowsController {
    engineService;
    prisma;
    constructor(engineService, prisma) {
        this.engineService = engineService;
        this.prisma = prisma;
    }
    async triggerTestWorkflow(id, body) {
        const instance = await this.engineService.startWorkflow(body.shopId, id, body.contactId, { source: 'manual-api-test' });
        return { success: true, instanceId: instance.id };
    }
    async createTestWorkflow(body) {
        const workflow = await this.prisma.workflow.create({
            data: {
                shopId: body.shopId,
                name: 'Test Workflow',
                status: 'published',
                versions: {
                    create: {
                        versionNumber: 1,
                        status: 'published',
                        graph: {
                            nodes: [
                                { id: '1', type: 'trigger', data: {} },
                                { id: '2', type: 'sendMessage', data: { messageType: 'text', text: 'Hello from Workflow Engine! Time is {{system.now}}' } },
                                { id: '3', type: 'delay', data: { delayValue: 5, delayUnit: 'seconds' } },
                                { id: '4', type: 'sendMessage', data: { messageType: 'text', text: 'This message comes after 5 seconds delay.' } }
                            ],
                            edges: [
                                { source: '1', target: '2' },
                                { source: '2', target: '3' },
                                { source: '3', target: '4' }
                            ]
                        }
                    }
                }
            }
        });
        return { success: true, workflowId: workflow.id };
    }
};
exports.WorkflowsController = WorkflowsController;
__decorate([
    (0, common_1.Post)(':id/test-trigger'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "triggerTestWorkflow", null);
__decorate([
    (0, common_1.Post)('create-test-workflow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "createTestWorkflow", null);
exports.WorkflowsController = WorkflowsController = __decorate([
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService,
        prisma_service_1.PrismaService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map