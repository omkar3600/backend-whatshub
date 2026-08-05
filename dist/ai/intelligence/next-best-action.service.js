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
exports.NextBestActionEngine = void 0;
const common_1 = require("@nestjs/common");
const customer_intelligence_service_1 = require("./customer-intelligence.service");
let NextBestActionEngine = class NextBestActionEngine {
    customerIntelligence;
    constructor(customerIntelligence) {
        this.customerIntelligence = customerIntelligence;
    }
    async predict(shopId, contactId) {
        const profile = await this.customerIntelligence.getProfile(shopId, contactId);
        if (!profile) {
            return {
                contactId,
                action: 'SEND_GREETING',
                confidence: 60,
                rationale: 'New customer without historical profile data.',
                recommendedTool: 'send_text_message',
            };
        }
        if (profile.leadScore >= 80 && profile.leadStage === 'PAYMENT_PENDING') {
            return {
                contactId,
                action: 'SEND_PAYMENT_REMINDER',
                confidence: 94,
                rationale: `Customer ${profile.name} has high purchase intent (score ${profile.leadScore}) with payment pending.`,
                recommendedTool: 'send_text_message',
                toolParams: { message: `Hi ${profile.name}, your order checkout is ready! Let us know if you need help finalizing payment.` },
            };
        }
        if (profile.topInterests.length > 0 && profile.purchaseHistory.length === 0) {
            return {
                contactId,
                action: 'RECOMMEND_INTEREST_PRODUCT',
                confidence: 88,
                rationale: `Customer interested in ${profile.topInterests.join(', ')} but has not purchased yet.`,
                recommendedTool: 'search_products',
                toolParams: { query: profile.topInterests[0] },
            };
        }
        if (profile.lifecycleStage === 'RETURNING_CUSTOMER') {
            return {
                contactId,
                action: 'OFFER_VIP_DISCOUNT',
                confidence: 82,
                rationale: `Returning customer with ${profile.purchaseHistory.length} past purchases.`,
                recommendedTool: 'send_interactive_buttons',
            };
        }
        return {
            contactId,
            action: 'QUALIFY_LEAD_REQUIREMENTS',
            confidence: 75,
            rationale: 'Moderate intent customer. Recommend asking for budget and timeline.',
            recommendedTool: 'send_text_message',
        };
    }
};
exports.NextBestActionEngine = NextBestActionEngine;
exports.NextBestActionEngine = NextBestActionEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_intelligence_service_1.CustomerIntelligenceService])
], NextBestActionEngine);
//# sourceMappingURL=next-best-action.service.js.map