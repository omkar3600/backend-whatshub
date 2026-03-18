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
exports.CampaignProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let CampaignProcessor = class CampaignProcessor extends bullmq_1.WorkerHost {
    prisma;
    whatsappService;
    constructor(prisma, whatsappService) {
        super();
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async process(job) {
        const { campaignId, limitToPhones } = job.data;
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { template: true }
        });
        if (!campaign || !campaign.template)
            return;
        if (campaign.status !== 'scheduled' && campaign.status !== 'processing')
            return;
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'processing' }
        });
        let contacts = await this.prisma.contact.findMany({
            where: { shopId: campaign.shopId }
        });
        if (limitToPhones && Array.isArray(limitToPhones)) {
            contacts = contacts.filter(c => limitToPhones.includes(c.phone));
        }
        const targetPhones = campaign.targetPhones;
        if (targetPhones && targetPhones.length > 0) {
            contacts = contacts.filter(c => targetPhones.includes(c.phone));
        }
        const targetTags = campaign.targetTags;
        if (targetTags && targetTags.length > 0) {
            contacts = contacts.filter(c => {
                const contactTags = c.tags || [];
                return targetTags.some(tag => contactTags.includes(tag));
            });
        }
        let sent = 0, failed = 0;
        const failureHistory = [];
        for (const c of contacts) {
            const currentCampaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
                select: { status: true }
            });
            if (currentCampaign?.status === 'aborted') {
                break;
            }
            try {
                const templateParamsObj = campaign.templateParams;
                const templateContent = templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                    ? { name: campaign.template.templateName, components: templateParamsObj }
                    : campaign.template.templateName;
                const headerMediaUrl = campaign.headerMediaUrl ?? undefined;
                await this.whatsappService.sendOutboundMessage(campaign.shopId, c.phone, 'template', templateContent, headerMediaUrl);
                sent++;
                await this.prisma.campaignContact.upsert({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: {
                        campaignId,
                        contactId: c.id,
                        phone: c.phone,
                        name: c.name,
                        status: 'sent',
                    },
                    update: { status: 'sent', failReason: null },
                });
            }
            catch (e) {
                failed++;
                const reason = e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
                failureHistory.push({
                    phone: c.phone,
                    name: c.name,
                    reason,
                    timestamp: new Date()
                });
                await this.prisma.campaignContact.upsert({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: {
                        campaignId,
                        contactId: c.id,
                        phone: c.phone,
                        name: c.name,
                        status: 'failed',
                        failReason: reason,
                    },
                    update: { status: 'failed', failReason: reason },
                });
            }
        }
        const finalCampaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { status: true }
        });
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: finalCampaign?.status === 'aborted' ? 'aborted' : 'completed',
                stats: { sent, delivered: sent, read: 0, clicked: 0, failed },
                failureHistory: failureHistory
            }
        });
    }
};
exports.CampaignProcessor = CampaignProcessor;
exports.CampaignProcessor = CampaignProcessor = __decorate([
    (0, bullmq_1.Processor)('campaigns'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], CampaignProcessor);
//# sourceMappingURL=campaign.processor.js.map