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
exports.AiWorkflowOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiWorkflowOptimizerService = class AiWorkflowOptimizerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyzeAndOptimize(workflowId) {
        const analytics = await this.prisma.workflowAnalytics.findUnique({
            where: { workflowId },
        });
        const totalStarted = analytics?.totalStarted || 1;
        const totalCompleted = analytics?.totalCompleted || 0;
        const completionRate = Math.round((totalCompleted / totalStarted) * 100);
        const dropOffRate = 100 - completionRate;
        return {
            workflowId,
            dropOffRate,
            recommendation: dropOffRate > 25
                ? `Observed ${dropOffRate}% drop-off. Recommend replacing plain text replies with interactive product buttons or reducing delay nodes.`
                : 'Workflow performing optimally with high completion rate.',
        };
    }
};
exports.AiWorkflowOptimizerService = AiWorkflowOptimizerService;
exports.AiWorkflowOptimizerService = AiWorkflowOptimizerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiWorkflowOptimizerService);
//# sourceMappingURL=ai-workflow-optimizer.service.js.map