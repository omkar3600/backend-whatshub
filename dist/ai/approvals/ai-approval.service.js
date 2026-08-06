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
exports.AiApprovalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tool_registry_1 = require("../tools/registry/tool.registry");
let AiApprovalService = class AiApprovalService {
    prisma;
    toolRegistry;
    constructor(prisma, toolRegistry) {
        this.prisma = prisma;
        this.toolRegistry = toolRegistry;
    }
    async getPendingActions(shopId) {
        if (!shopId)
            return [];
        await this.prisma.aiAction.updateMany({
            where: { shopId, status: 'pending', expiresAt: { lt: new Date() } },
            data: { status: 'expired' },
        });
        return this.prisma.aiAction.findMany({
            where: { shopId, status: 'pending' },
            orderBy: { createdAt: 'desc' },
            include: { contact: { select: { name: true, phone: true } } },
        });
    }
    async approveAction(actionId, shopId, userId) {
        const action = await this.prisma.aiAction.findFirst({ where: { id: actionId, shopId } });
        if (!action)
            throw new common_1.NotFoundException('Action not found');
        if (action.status !== 'pending')
            throw new common_1.ForbiddenException('Action is no longer pending');
        const tool = this.toolRegistry.get(action.toolName);
        if (!tool)
            throw new common_1.NotFoundException(`Tool ${action.toolName} not found`);
        const ctx = { shopId, contactId: action.contactId || undefined };
        const result = await tool.execute(ctx, action.toolInput);
        await this.prisma.aiAction.update({
            where: { id: actionId },
            data: {
                status: result.success ? 'executed' : 'rejected',
                result: result.data || null,
                errorMessage: result.error || null,
                approvedBy: userId,
                reviewedAt: new Date(),
            },
        });
        return { success: result.success, data: result.data, error: result.error };
    }
    async rejectAction(actionId, shopId, userId) {
        const action = await this.prisma.aiAction.findFirst({ where: { id: actionId, shopId } });
        if (!action)
            throw new common_1.NotFoundException('Action not found');
        await this.prisma.aiAction.update({
            where: { id: actionId },
            data: { status: 'rejected', approvedBy: userId, reviewedAt: new Date() },
        });
        return { success: true };
    }
};
exports.AiApprovalService = AiApprovalService;
exports.AiApprovalService = AiApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tool_registry_1.ToolRegistry])
], AiApprovalService);
//# sourceMappingURL=ai-approval.service.js.map