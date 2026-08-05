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
var CustomerIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerIntelligenceService = CustomerIntelligenceService_1 = class CustomerIntelligenceService {
    prisma;
    logger = new common_1.Logger(CustomerIntelligenceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(shopId, contactId) {
        const contact = await this.prisma.contact.findUnique({
            where: { id: contactId },
            include: {
                aiMemory: true,
                aiLeadScore: true,
                conversations: { take: 1, orderBy: { updatedAt: 'desc' } },
            },
        });
        if (!contact || contact.shopId !== shopId)
            return null;
        const memory = contact.aiMemory;
        const score = contact.aiLeadScore?.score || 0;
        const preferences = memory?.preferences || {};
        const purchaseHistory = memory?.purchaseHistory || [];
        const interests = preferences.interests || [];
        let lifecycleStage = 'NEW';
        if (purchaseHistory.length > 0)
            lifecycleStage = 'RETURNING_CUSTOMER';
        else if (score >= 80)
            lifecycleStage = 'HOT_LEAD';
        else if (score >= 50)
            lifecycleStage = 'QUALIFIED_LEAD';
        return {
            contactId: contact.id,
            name: contact.name,
            phone: contact.phone,
            city: contact.city,
            segment: contact.aiSegment,
            leadStage: contact.aiLeadStage || 'NEW',
            leadScore: score,
            preferences,
            purchaseHistory,
            interactionsCount: contact.conversations.length,
            lastInteractionAt: contact.lastAiInteractionAt,
            topInterests: interests,
            lifecycleStage,
        };
    }
};
exports.CustomerIntelligenceService = CustomerIntelligenceService;
exports.CustomerIntelligenceService = CustomerIntelligenceService = CustomerIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerIntelligenceService);
//# sourceMappingURL=customer-intelligence.service.js.map