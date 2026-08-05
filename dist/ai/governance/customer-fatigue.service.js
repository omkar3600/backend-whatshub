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
var CustomerFatigueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerFatigueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerFatigueService = CustomerFatigueService_1 = class CustomerFatigueService {
    prisma;
    logger = new common_1.Logger(CustomerFatigueService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkFatigue(shopId, contactId) {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= 22 || currentHour < 8) {
            return {
                canContact: false,
                fatigueScore: 90,
                reason: 'Quiet hours policy active (10 PM - 8 AM). Proactive messages blocked.',
            };
        }
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const messagesCount = await this.prisma.message.count({
            where: {
                shopId,
                direction: 'outbound',
                timestamp: { gte: dayAgo },
                conversation: { contactId },
            },
        });
        if (messagesCount >= 3) {
            return {
                canContact: false,
                fatigueScore: 85,
                reason: `Customer reached daily message limit (${messagesCount}/3).`,
            };
        }
        const fatigueScore = Math.min(messagesCount * 25, 100);
        return {
            canContact: true,
            fatigueScore,
        };
    }
};
exports.CustomerFatigueService = CustomerFatigueService;
exports.CustomerFatigueService = CustomerFatigueService = CustomerFatigueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerFatigueService);
//# sourceMappingURL=customer-fatigue.service.js.map