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
exports.AnalyticsTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AnalyticsTools = class AnalyticsTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'get_conversation_stats',
                description: 'Get conversation statistics for today, this week, and this month.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    const now = new Date();
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const weekStart = new Date(todayStart);
                    weekStart.setDate(todayStart.getDate() - 7);
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    const [todayConvs, weekConvs, monthConvs, totalContacts] = await Promise.all([
                        this.prisma.conversation.count({ where: { shopId: ctx.shopId, lastMessageAt: { gte: todayStart } } }),
                        this.prisma.conversation.count({ where: { shopId: ctx.shopId, lastMessageAt: { gte: weekStart } } }),
                        this.prisma.conversation.count({ where: { shopId: ctx.shopId, lastMessageAt: { gte: monthStart } } }),
                        this.prisma.contact.count({ where: { shopId: ctx.shopId } }),
                    ]);
                    return { success: true, data: { today: todayConvs, thisWeek: weekConvs, thisMonth: monthConvs, totalContacts } };
                },
            },
            {
                name: 'get_lead_pipeline_summary',
                description: 'Get count of contacts in each lead pipeline stage.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    const stages = ['NEW', 'INTERESTED', 'QUALIFIED', 'PRODUCT_SELECTED', 'NEGOTIATING', 'PAYMENT_PENDING', 'PURCHASED', 'INACTIVE'];
                    const counts = {};
                    for (const stage of stages) {
                        counts[stage] = await this.prisma.aiLeadScore.count({ where: { shopId: ctx.shopId, stage } });
                    }
                    return { success: true, data: counts };
                },
            },
            {
                name: 'get_campaign_stats',
                description: 'Get performance statistics for a specific campaign.',
                inputSchema: {
                    type: 'object',
                    properties: { campaignId: { type: 'string', description: 'The campaign ID' } },
                    required: ['campaignId'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const campaign = await this.prisma.campaign.findFirst({
                        where: { id: params.campaignId, shopId: ctx.shopId },
                    });
                    if (!campaign)
                        return { success: false, error: 'Campaign not found' };
                    return { success: true, data: { name: campaign.name, status: campaign.status, stats: campaign.stats } };
                },
            },
        ];
    }
};
exports.AnalyticsTools = AnalyticsTools;
exports.AnalyticsTools = AnalyticsTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsTools);
//# sourceMappingURL=analytics-tools.js.map