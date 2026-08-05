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
var OpportunityDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityDetectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OpportunityDetectionService = OpportunityDetectionService_1 = class OpportunityDetectionService {
    prisma;
    logger = new common_1.Logger(OpportunityDetectionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async detectOpportunities(shopId) {
        const opportunities = [];
        const hotLeads = await this.prisma.aiLeadScore.findMany({
            where: { shopId, score: { gte: 70 } },
            include: { contact: true },
            take: 10,
        });
        for (const lead of hotLeads) {
            if (!lead.contact)
                continue;
            opportunities.push({
                id: `opp_lead_${lead.id.slice(0, 8)}`,
                type: 'HOT_LEAD',
                score: lead.score,
                title: `🔥 High-Intent Lead: ${lead.contact.name}`,
                reason: `High lead score (${lead.score}/100) at stage '${lead.stage}'. Inferred intent: ${lead.intent || 'High purchase interest'}.`,
                contactId: lead.contact.id,
                contactName: lead.contact.name,
                contactPhone: lead.contact.phone,
                estimatedValue: 4500,
                urgency: lead.score >= 85 ? 'CRITICAL' : 'HIGH',
                recommendedAction: 'Trigger product catalogue or discount offer via AI Agent',
                createdAt: lead.updatedAt.toISOString(),
            });
        }
        const pendingActions = await this.prisma.aiAction.findMany({
            where: { shopId, status: 'pending' },
            include: { contact: true },
            take: 10,
        });
        for (const action of pendingActions) {
            opportunities.push({
                id: `opp_action_${action.id.slice(0, 8)}`,
                type: 'HUMAN_ESCALATION',
                score: action.riskLevel === 'CRITICAL' ? 95 : 80,
                title: `⚠️ Action Pending Review: ${action.toolName}`,
                reason: action.rationale || `AI requested tool execution requiring business sign-off`,
                contactId: action.contactId || '',
                contactName: action.contact?.name || 'Customer',
                contactPhone: action.contact?.phone || 'N/A',
                estimatedValue: 2500,
                urgency: action.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
                recommendedAction: `Approve or reject action '${action.toolName}'`,
                createdAt: action.createdAt.toISOString(),
            });
        }
        const followUps = await this.prisma.aiFollowUp.findMany({
            where: { shopId, status: 'pending' },
            include: { contact: true },
            take: 10,
        });
        for (const fu of followUps) {
            if (!fu.contact)
                continue;
            opportunities.push({
                id: `opp_fu_${fu.id.slice(0, 8)}`,
                type: fu.reason.includes('cart') ? 'ABANDONED_CART' : 'UPSELL',
                score: 75,
                title: `🛒 Re-engagement Opportunity: ${fu.contact.name}`,
                reason: `Scheduled follow-up reason: '${fu.reason}' scheduled at ${fu.scheduledAt.toLocaleDateString()}`,
                contactId: fu.contact.id,
                contactName: fu.contact.name,
                contactPhone: fu.contact.phone,
                estimatedValue: 1800,
                urgency: 'MEDIUM',
                recommendedAction: 'Send automated WhatsApp follow-up template',
                createdAt: fu.createdAt.toISOString(),
            });
        }
        return opportunities.sort((a, b) => b.score - a.score);
    }
};
exports.OpportunityDetectionService = OpportunityDetectionService;
exports.OpportunityDetectionService = OpportunityDetectionService = OpportunityDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpportunityDetectionService);
//# sourceMappingURL=opportunity-detection.service.js.map