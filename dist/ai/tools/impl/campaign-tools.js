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
exports.CampaignTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const campaigns_service_1 = require("../../../campaigns/campaigns.service");
let CampaignTools = class CampaignTools {
    prisma;
    campaigns;
    constructor(prisma, campaigns) {
        this.prisma = prisma;
        this.campaigns = campaigns;
    }
    getTools() {
        return [
            {
                name: 'get_campaigns',
                description: 'Get list of recent campaigns and their performance stats.',
                inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'Number of campaigns to return (default 5)' } } },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const campaigns = await this.prisma.campaign.findMany({
                        where: { shopId: ctx.shopId },
                        orderBy: { createdAt: 'desc' },
                        take: params.limit || 5,
                        include: { template: { select: { templateName: true } } },
                    });
                    return { success: true, data: campaigns.map(c => ({ id: c.id, name: c.name, status: c.status, stats: c.stats, template: c.template?.templateName })) };
                },
            },
            {
                name: 'create_campaign_draft',
                description: 'Create a draft campaign (does NOT send). Returns the campaign ID for review. Always prefer this over send_campaign unless user explicitly requests immediate send.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Campaign name' },
                        templateId: { type: 'string', description: 'Template ID to use' },
                        targetTags: { type: 'array', items: { type: 'string' }, description: 'Tags to target' },
                    },
                    required: ['name', 'templateId'],
                },
                riskLevel: 'MEDIUM',
                requiresApproval: (autonomyLevel) => autonomyLevel < 3,
                execute: async (ctx, params) => {
                    const campaign = await this.prisma.campaign.create({
                        data: {
                            shopId: ctx.shopId,
                            name: params.name,
                            templateId: params.templateId,
                            targetTags: params.targetTags || [],
                            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            status: 'scheduled',
                            stats: {},
                        },
                    });
                    return { success: true, data: { campaignId: campaign.id, name: campaign.name, status: 'draft_created', message: 'Campaign draft created. Please review and launch from the Campaigns page.' } };
                },
            },
        ];
    }
};
exports.CampaignTools = CampaignTools;
exports.CampaignTools = CampaignTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campaigns_service_1.CampaignsService])
], CampaignTools);
//# sourceMappingURL=campaign-tools.js.map