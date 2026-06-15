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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignsService = class CampaignsService {
    prisma;
    campaignsQueue;
    constructor(prisma, campaignsQueue) {
        this.prisma = prisma;
        this.campaignsQueue = campaignsQueue;
    }
    async createCampaign(shopId, data) {
        const { name, templateId, targetTags, targetPhones, targetFilters, scheduledAt, templateParams, headerMediaUrl, sendDelay, excludeUnsubscribed, sendNow } = data;
        let resolvedScheduledAt;
        let queueDelay;
        if (sendNow) {
            resolvedScheduledAt = new Date();
            queueDelay = 0;
        }
        else {
            if (!scheduledAt) {
                throw new Error('scheduledAt is required for scheduled campaigns');
            }
            resolvedScheduledAt = new Date(scheduledAt);
            const msUntilSend = resolvedScheduledAt.getTime() - Date.now();
            if (msUntilSend < 30_000) {
                throw new Error('Scheduled time must be at least 30 seconds in the future');
            }
            queueDelay = msUntilSend;
        }
        const campaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name,
                templateId,
                targetTags: targetTags || [],
                targetPhones: targetPhones || [],
                targetFilters: targetFilters || null,
                templateParams: templateParams || {},
                headerMediaUrl: headerMediaUrl || null,
                scheduledAt: resolvedScheduledAt,
                status: 'scheduled',
                stats: { sendDelay: sendDelay ?? 300, excludeUnsubscribed: excludeUnsubscribed ?? false },
            },
        });
        this.campaignsQueue.add('processCampaign', { campaignId: campaign.id }, { delay: queueDelay })
            .catch((err) => {
            console.error(`[Campaign] Failed to enqueue campaign ${campaign.id}:`, err?.message || err);
            this.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'failed', failureHistory: [{ reason: 'Queue connection failed: ' + (err?.message || 'Redis unavailable'), timestamp: new Date() }] }
            }).catch(() => { });
        });
        return campaign;
    }
    async getCampaigns(shopId) {
        const campaigns = await this.prisma.campaign.findMany({
            where: { shopId },
            include: {
                template: true,
                contacts: { select: { status: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return campaigns.map(c => {
            const configMeta = c.stats || {};
            if (c.status === 'completed' || c.status === 'aborted') {
                return {
                    ...c,
                    contacts: undefined,
                    stats: configMeta,
                };
            }
            const statusCounts = c.contacts.reduce((acc, contact) => {
                acc[contact.status] = (acc[contact.status] || 0) + 1;
                return acc;
            }, {});
            return {
                ...c,
                contacts: undefined,
                stats: {
                    sendDelay: configMeta.sendDelay,
                    excludeUnsubscribed: configMeta.excludeUnsubscribed,
                    total: c.contacts.length,
                    sent: statusCounts['sent'] || 0,
                    delivered: statusCounts['delivered'] || 0,
                    read: statusCounts['read'] || 0,
                    clicked: statusCounts['clicked'] || 0,
                    failed: statusCounts['failed'] || 0,
                    pending: statusCounts['pending'] || 0,
                },
            };
        });
    }
    async deleteCampaign(shopId, campaignId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.status === 'processing') {
            throw new Error('Cannot delete a processing campaign. Abort it first.');
        }
        return this.prisma.campaign.delete({
            where: { id: campaignId }
        });
    }
    async abortCampaign(shopId, campaignId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.status !== 'processing') {
            throw new Error('Can only abort processing campaigns');
        }
        return this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'aborted' }
        });
    }
    async launchRetarget(shopId, campaignId, body) {
        const { name, templateId, phones } = body;
        const original = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });
        if (!original)
            throw new common_1.NotFoundException('Original campaign not found');
        const campaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name,
                templateId,
                targetPhones: phones,
                scheduledAt: new Date(),
                status: 'processing',
            },
        });
        await this.campaignsQueue.add('processCampaign', { campaignId: campaign.id });
        return campaign;
    }
    async getCampaignAnalytics(shopId, campaignId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId },
            include: {
                template: true,
                contacts: {
                    orderBy: { sentAt: 'desc' },
                },
            },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const allContacts = campaign.contacts;
        const readPhones = new Set(allContacts.filter(c => c.status === 'read').map(c => c.phone));
        const byStatus = {
            sent: allContacts.filter(c => c.status === 'sent'),
            delivered: allContacts.filter(c => c.status === 'delivered'),
            read: allContacts.filter(c => c.status === 'read'),
            clicked: allContacts.filter(c => c.status === 'clicked'),
            failed: allContacts.filter(c => c.status === 'failed'),
            unread: allContacts.filter(c => ['delivered', 'sent'].includes(c.status) && !readPhones.has(c.phone)),
        };
        const stats = {
            total: allContacts.length,
            sent: byStatus.sent.length,
            delivered: byStatus.delivered.length,
            read: byStatus.read.length,
            clicked: byStatus.clicked.length,
            failed: byStatus.failed.length,
            unread: byStatus.unread.length,
        };
        return {
            campaign,
            stats,
            contacts: byStatus,
        };
    }
    async addTagsToContacts(shopId, campaignId, body) {
        const { phones, tags } = body;
        const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, shopId } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const results = [];
        for (const phone of phones) {
            const contact = await this.prisma.contact.findUnique({
                where: { shopId_phone: { shopId, phone } },
            });
            if (!contact)
                continue;
            const existingTags = contact.tags || [];
            const mergedTags = Array.from(new Set([...existingTags, ...tags]));
            const updated = await this.prisma.contact.update({
                where: { id: contact.id },
                data: { tags: mergedTags },
            });
            results.push(updated);
        }
        return { updated: results.length, message: `Tags added to ${results.length} contacts` };
    }
    async resendFailed(shopId, campaignId) {
        const original = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId },
            include: { template: true }
        });
        if (!original || !original.failureHistory) {
            throw new common_1.NotFoundException('Campaign or failure history not found');
        }
        const failedList = original.failureHistory;
        if (failedList.length === 0)
            return { message: 'No failed contacts to resend' };
        const retryCampaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name: `Retry: ${original.name}`,
                templateId: original.templateId,
                status: 'processing',
                scheduledAt: new Date(),
                templateParams: original.templateParams,
                targetPhones: (failedList.map(f => f.phone))
            }
        });
        await this.campaignsQueue.add('processCampaign', {
            campaignId: retryCampaign.id
        });
        return retryCampaign;
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('campaigns')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map