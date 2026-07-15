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
exports.AutomationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AutomationsService = class AutomationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAutomation(shopId, data) {
        const { type, triggerKeyword, replyText, isActive } = data;
        return this.prisma.automation.create({
            data: {
                shopId,
                type,
                triggerKeyword,
                replyText,
                isActive: isActive !== undefined ? isActive : true,
            },
        });
    }
    async getAutomations(shopId) {
        return this.prisma.automation.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateAutomation(shopId, id, data) {
        const existing = await this.prisma.automation.findFirst({ where: { id, shopId } });
        if (!existing)
            throw new common_1.NotFoundException('Automation not found');
        return this.prisma.automation.update({
            where: { id },
            data,
        });
    }
    async deleteAutomation(shopId, id) {
        const existing = await this.prisma.automation.findFirst({ where: { id, shopId } });
        if (!existing)
            throw new common_1.NotFoundException('Automation not found');
        await this.prisma.automation.delete({ where: { id } });
        return { message: 'Automation deleted' };
    }
};
exports.AutomationsService = AutomationsService;
exports.AutomationsService = AutomationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationsService);
//# sourceMappingURL=automations.service.js.map