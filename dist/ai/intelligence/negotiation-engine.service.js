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
var NegotiationEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NegotiationEngineService = NegotiationEngineService_1 = class NegotiationEngineService {
    prisma;
    logger = new common_1.Logger(NegotiationEngineService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateDiscount(shopId, contactId, requestedDiscountPercentage, productPrice) {
        const MAX_AUTO_DISCOUNT = 10;
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        const tags = contact?.tags || [];
        const isVip = tags.includes('VIP');
        const maxAllowed = isVip ? 15 : MAX_AUTO_DISCOUNT;
        if (requestedDiscountPercentage > maxAllowed) {
            return {
                permitted: false,
                approvedDiscountPercentage: maxAllowed,
                reason: `Requested discount (${requestedDiscountPercentage}%) exceeds policy limit (${maxAllowed}%). Counter-offer capped at ${maxAllowed}%.`,
            };
        }
        return {
            permitted: true,
            approvedDiscountPercentage: requestedDiscountPercentage,
            reason: `Discount of ${requestedDiscountPercentage}% is within approved policy bounds.`,
        };
    }
};
exports.NegotiationEngineService = NegotiationEngineService;
exports.NegotiationEngineService = NegotiationEngineService = NegotiationEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NegotiationEngineService);
//# sourceMappingURL=negotiation-engine.service.js.map