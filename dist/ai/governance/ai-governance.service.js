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
var AiGovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiGovernanceService = AiGovernanceService_1 = class AiGovernanceService {
    prisma;
    logger = new common_1.Logger(AiGovernanceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(shopId) {
        if (!shopId) {
            return {
                shopId: '',
                autonomyLevel: 2,
                maxIterationsLimit: 8,
                totalAuditLogs: 0,
                successfulToolExecutions: 0,
                pendingApprovals: 0,
                estimatedDailyCost: 0,
                allowedTools: [],
            };
        }
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        const [totalAuditLogs, successfulLogs, pendingActions] = await Promise.all([
            this.prisma.aiAuditLog.count({ where: { shopId } }),
            this.prisma.aiAuditLog.count({ where: { shopId, success: true } }),
            this.prisma.aiAction.count({ where: { shopId, status: 'pending' } }),
        ]);
        const estimatedDailyCost = Math.round((totalAuditLogs * 0.002) * 100) / 100;
        return {
            shopId,
            autonomyLevel: config?.autonomyLevel ?? 2,
            maxIterationsLimit: config?.maxIterations ?? 8,
            totalAuditLogs,
            successfulToolExecutions: successfulLogs,
            pendingApprovals: pendingActions,
            estimatedDailyCost,
            allowedTools: config?.allowedTools || [],
        };
    }
    async setAutonomyLevel(shopId, level) {
        await this.prisma.chatbotConfig.upsert({
            where: { shopId },
            create: { shopId, autonomyLevel: level },
            update: { autonomyLevel: level },
        });
    }
};
exports.AiGovernanceService = AiGovernanceService;
exports.AiGovernanceService = AiGovernanceService = AiGovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiGovernanceService);
//# sourceMappingURL=ai-governance.service.js.map