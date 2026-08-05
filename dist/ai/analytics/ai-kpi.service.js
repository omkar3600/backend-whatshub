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
var AiKpiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiKpiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiKpiService = AiKpiService_1 = class AiKpiService {
    prisma;
    logger = new common_1.Logger(AiKpiService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpiOverview(shopId) {
        const [totalAuditLogs, successAuditLogs, hotLeads, pendingActions, conversationCount,] = await Promise.all([
            this.prisma.aiAuditLog.count({ where: { shopId } }),
            this.prisma.aiAuditLog.count({ where: { shopId, success: true } }),
            this.prisma.aiLeadScore.count({ where: { shopId, score: { gte: 70 } } }),
            this.prisma.aiAction.count({ where: { shopId, status: 'pending' } }),
            this.prisma.conversation.count({ where: { shopId } }),
        ]);
        const successRatePercentage = totalAuditLogs > 0 ? (successAuditLogs / totalAuditLogs) * 100 : 98.4;
        const conversionRatePercentage = conversationCount > 0 ? Math.min(Math.round((hotLeads / conversationCount) * 100), 100) : 18.5;
        const aiInfluencedRevenue = hotLeads * 3500 + successAuditLogs * 250;
        return {
            activeAgentCount: 4,
            totalConversationsHandled: conversationCount,
            totalToolsExecuted: totalAuditLogs,
            aiInfluencedRevenue,
            conversionRatePercentage,
            hotLeadsQualifiedCount: hotLeads,
            pendingApprovalsCount: pendingActions,
            successRatePercentage: Math.round(successRatePercentage * 10) / 10,
            avgResponseTimeMs: 1200,
        };
    }
};
exports.AiKpiService = AiKpiService;
exports.AiKpiService = AiKpiService = AiKpiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiKpiService);
//# sourceMappingURL=ai-kpi.service.js.map