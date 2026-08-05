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
var AiPolicyEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPolicyEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiPolicyEngineService = AiPolicyEngineService_1 = class AiPolicyEngineService {
    prisma;
    logger = new common_1.Logger(AiPolicyEngineService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateToolCall(shopId, toolName, params, autonomyLevel = 2) {
        const writeTools = ['create_order', 'apply_coupon', 'send_campaign', 'update_lead_stage'];
        if (autonomyLevel <= 1 && writeTools.includes(toolName)) {
            return {
                allowed: false,
                reason: 'Shop autonomy level 1 requires explicit manual approval for write tools.',
                requiresApproval: true,
            };
        }
        if (toolName === 'apply_coupon' && params?.discountPercentage > 20) {
            return {
                allowed: false,
                reason: 'Policy Violation: AI discount cannot exceed 20%.',
                requiresApproval: true,
            };
        }
        if (toolName === 'create_order' && params?.totalAmount > 10000) {
            return {
                allowed: true,
                requiresApproval: true,
                reason: 'High-value order requires human manager sign-off.',
            };
        }
        return { allowed: true };
    }
};
exports.AiPolicyEngineService = AiPolicyEngineService;
exports.AiPolicyEngineService = AiPolicyEngineService = AiPolicyEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiPolicyEngineService);
//# sourceMappingURL=ai-policy-engine.service.js.map