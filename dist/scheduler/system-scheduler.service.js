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
var SystemSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemSchedulerService = SystemSchedulerService_1 = class SystemSchedulerService {
    prisma;
    logger = new common_1.Logger(SystemSchedulerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async cleanupExpiredAiActions() {
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const res = await this.prisma.aiAction.updateMany({
                where: {
                    status: 'pending',
                    createdAt: { lt: yesterday },
                },
                data: {
                    status: 'expired',
                    errorMessage: 'Automatically expired after 24 hours without manager approval.',
                },
            });
            if (res.count > 0) {
                this.logger.log(`[Scheduler] Expired ${res.count} stale AI pending actions.`);
            }
        }
        catch (err) {
            this.logger.error(`[Scheduler] Error cleaning expired AI actions: ${err.message}`);
        }
    }
    async dailyMaintenanceCleanup() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const deletedDeadLetters = await this.prisma.deadLetterEvent.deleteMany({
                where: {
                    status: 'resolved',
                    createdAt: { lt: thirtyDaysAgo },
                },
            });
            this.logger.log(`[Scheduler] Daily maintenance completed. Pruned ${deletedDeadLetters.count} resolved dead letter events.`);
        }
        catch (err) {
            this.logger.error(`[Scheduler] Error executing daily maintenance: ${err.message}`);
        }
    }
};
exports.SystemSchedulerService = SystemSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSchedulerService.prototype, "cleanupExpiredAiActions", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSchedulerService.prototype, "dailyMaintenanceCleanup", null);
exports.SystemSchedulerService = SystemSchedulerService = SystemSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemSchedulerService);
//# sourceMappingURL=system-scheduler.service.js.map