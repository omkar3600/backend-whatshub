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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
let OwnerTools = class OwnerTools {
    prisma;
    whatsapp;
    constructor(prisma, whatsapp) {
        this.prisma = prisma;
        this.whatsapp = whatsapp;
    }
    getTools() {
        return [
            {
                name: 'notify_owner_hot_lead',
                description: 'Send a real-time notification alert to the business owner about a high-value or urgent lead.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        leadName: { type: 'string', description: 'Name of the high-intent lead' },
                        leadPhone: { type: 'string', description: 'Phone number of lead' },
                        score: { type: 'number', description: 'Lead score (0-100)' },
                        reason: { type: 'string', description: 'Reason why this lead requires owner attention' },
                    },
                    required: ['leadName', 'reason'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const shop = await this.prisma.shop.findUnique({
                        where: { id: ctx.shopId },
                        select: { phone: true, shopName: true },
                    });
                    if (shop?.phone) {
                        const alertText = `🚨 *HOT LEAD ALERT* (${shop.shopName})\n\n👤 *Customer:* ${params.leadName}\n📞 *Phone:* ${params.leadPhone || 'N/A'}\n🔥 *Score:* ${params.score || 90}/100\n💡 *Reason:* ${params.reason}`;
                        await this.whatsapp.sendOutboundMessage(ctx.shopId, shop.phone, 'text', alertText).catch(() => { });
                    }
                    return {
                        success: true,
                        data: {
                            alertSent: true,
                            message: `Owner notified about hot lead ${params.leadName}`,
                        },
                    };
                },
            },
            {
                name: 'get_daily_business_briefing',
                description: 'Generate an executive daily briefing summary covering active conversations, hot leads, top customer intents, and campaign performance.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    const now = new Date();
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const [todayConversations, hotLeads, totalContacts, activeCampaigns, pendingApprovals,] = await Promise.all([
                        this.prisma.conversation.count({ where: { shopId: ctx.shopId, lastMessageAt: { gte: todayStart } } }),
                        this.prisma.aiLeadScore.findMany({
                            where: { shopId: ctx.shopId, score: { gte: 75 } },
                            take: 5,
                            include: { contact: { select: { name: true, phone: true } } },
                        }),
                        this.prisma.contact.count({ where: { shopId: ctx.shopId } }),
                        this.prisma.campaign.count({ where: { shopId: ctx.shopId, status: 'sending' } }),
                        this.prisma.aiAction.count({ where: { shopId: ctx.shopId, status: 'pending' } }),
                    ]);
                    return {
                        success: true,
                        data: {
                            date: todayStart.toLocaleDateString('en-IN'),
                            todayConversations,
                            totalContacts,
                            activeCampaigns,
                            pendingApprovals,
                            topHotLeads: hotLeads.map(l => ({
                                name: l.contact.name,
                                phone: l.contact.phone,
                                score: l.score,
                                stage: l.stage,
                                intent: l.intent,
                            })),
                        },
                    };
                },
            },
        ];
    }
};
exports.OwnerTools = OwnerTools;
exports.OwnerTools = OwnerTools = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], OwnerTools);
//# sourceMappingURL=owner-tools.js.map