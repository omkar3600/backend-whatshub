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
const phone_normalizer_1 = require("../common/utils/phone-normalizer");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function resolveBodyText(bodyTemplate, components) {
    const bodyComp = components?.find((c) => c.type?.toLowerCase() === 'body');
    if (!bodyComp?.parameters?.length)
        return bodyTemplate;
    let resolved = bodyTemplate;
    bodyComp.parameters.forEach((param, idx) => {
        resolved = resolved.replace(`{{${idx + 1}}}`, param.text || '');
    });
    return resolved;
}
let CampaignProcessor = class CampaignProcessor extends bullmq_1.WorkerHost {
    prisma;
    whatsappService;
    constructor(prisma, whatsappService) {
        super();
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async process(job) {
        const { campaignId } = job.data;
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { template: true }
        });
        if (!campaign || !campaign.template)
            return;
        if (campaign.status !== 'scheduled' && campaign.status !== 'processing')
            return;
        const templateComponents = campaign.templateParams;
        const rawBodyText = campaign.template.components
            ? campaign.template.components.find((c) => c.type === 'BODY')?.text || campaign.template.templateName
            : campaign.template.templateName;
        const resolvedBody = resolveBodyText(rawBodyText, templateComponents || []);
        const headerComp = templateComponents?.find((c) => c.type?.toLowerCase() === 'header');
        const headerImageUrl = headerComp?.parameters?.[0]?.image?.link
            || headerComp?.parameters?.[0]?.video?.link
            || campaign.headerMediaUrl
            || null;
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'processing' }
        });
        const targetPhones = campaign.targetPhones;
        const targetTags = campaign.targetTags;
        const targetFilters = campaign.targetFilters;
        const campaignMeta = campaign.stats || {};
        const excludeUnsubscribed = campaignMeta.excludeUnsubscribed ?? false;
        const sendDelay = campaignMeta.sendDelay ?? 50;
        const failureHistory = [];
        let aborted = false;
        const existingCount = await this.prisma.campaignContact.count({ where: { campaignId } });
        if (existingCount === 0) {
            let targetList = [];
            if (targetPhones && targetPhones.length > 0) {
                const normalizedTargetPhones = targetPhones.map(p => (0, phone_normalizer_1.normalizePhone)(p) || p);
                const contacts = await this.prisma.contact.findMany({
                    where: { shopId: campaign.shopId }
                });
                const contactMap = new Map();
                for (const c of contacts) {
                    const normKey = (0, phone_normalizer_1.normalizePhone)(c.phone) || c.phone;
                    contactMap.set(normKey, c);
                }
                const seenPhones = new Set();
                for (const phone of normalizedTargetPhones) {
                    if (seenPhones.has(phone))
                        continue;
                    seenPhones.add(phone);
                    const matched = contactMap.get(phone);
                    targetList.push({
                        phone,
                        name: matched?.name || phone,
                        contactId: matched?.id || null
                    });
                }
            }
            else {
                const baseWhere = { shopId: campaign.shopId };
                const contacts = await this.prisma.contact.findMany({
                    where: baseWhere,
                    include: { conversations: true }
                });
                let filtered = contacts;
                if (targetTags && targetTags.length > 0) {
                    filtered = filtered.filter(c => {
                        const tags = c.tags || [];
                        return targetTags.some(t => tags.includes(t));
                    });
                }
                if (targetFilters) {
                    filtered = filtered.filter(c => {
                        if (targetFilters.city && (!c.city || c.city.toLowerCase().trim() !== targetFilters.city.toLowerCase().trim()))
                            return false;
                        if (targetFilters.hasTags && targetFilters.hasTags.length > 0) {
                            const tags = c.tags || [];
                            if (!targetFilters.hasTags.some((t) => tags.includes(t)))
                                return false;
                        }
                        if (targetFilters.noMessagesInDays) {
                            const convo = c.conversations?.[0];
                            if (convo && convo.lastMessageAt) {
                                const days = (Date.now() - new Date(convo.lastMessageAt).getTime()) / (86400 * 1000);
                                if (days < targetFilters.noMessagesInDays)
                                    return false;
                            }
                        }
                        return true;
                    });
                }
                if (excludeUnsubscribed) {
                    filtered = filtered.filter(c => {
                        const tags = c.tags || [];
                        return !tags.includes('unsubscribed');
                    });
                }
                targetList = filtered.map(c => ({ phone: c.phone, name: c.name, contactId: c.id }));
            }
            if (targetList.length > 0) {
                await this.prisma.campaignContact.createMany({
                    data: targetList.map(item => ({
                        campaignId,
                        contactId: item.contactId || null,
                        phone: item.phone,
                        name: item.name,
                        status: 'pending',
                    })),
                    skipDuplicates: true
                });
            }
        }
        let hasMore = true;
        while (hasMore) {
            const currentCampaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
                select: { status: true }
            });
            if (currentCampaign?.status === 'aborted') {
                aborted = true;
                break;
            }
            const pendingBatch = await this.prisma.campaignContact.findMany({
                where: { campaignId, status: 'pending' },
                take: 100,
                orderBy: { id: 'asc' }
            });
            if (pendingBatch.length === 0) {
                hasMore = false;
                break;
            }
            for (let i = 0; i < pendingBatch.length; i++) {
                const item = pendingBatch[i];
                try {
                    const templateParamsObj = campaign.templateParams;
                    const templateContent = templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                        ? { name: campaign.template.templateName, language: campaign.template.language, components: templateParamsObj }
                        : { name: campaign.template.templateName, language: campaign.template.language };
                    const headerMediaUrl = campaign.headerMediaUrl ?? undefined;
                    const result = await this.whatsappService.sendOutboundMessage(campaign.shopId, item.phone, 'template', templateContent, headerMediaUrl);
                    const wamid = result?.messages?.[0]?.id;
                    await this.prisma.campaignContact.update({
                        where: { id: item.id },
                        data: { status: 'sent', failReason: null, wamid: wamid ?? null }
                    });
                    if (item.contactId) {
                        try {
                            const conversation = await this.prisma.conversation.upsert({
                                where: { shopId_contactId: { shopId: campaign.shopId, contactId: item.contactId } },
                                create: { shopId: campaign.shopId, contactId: item.contactId, lastMessageAt: new Date() },
                                update: { lastMessageAt: new Date() },
                            });
                            await this.prisma.message.create({
                                data: {
                                    id: wamid || undefined,
                                    shopId: campaign.shopId,
                                    conversationId: conversation.id,
                                    direction: 'outbound',
                                    type: 'template',
                                    content: resolvedBody,
                                    mediaUrl: headerImageUrl,
                                    status: 'sent',
                                    templateData: {
                                        templateName: campaign.template.templateName,
                                        campaignName: campaign.name,
                                        campaignId,
                                        wamid: wamid ?? null,
                                        components: campaign.template.components,
                                    },
                                },
                            });
                        }
                        catch (msgErr) {
                            console.error(`[Campaign] Failed to save message record for ${item.phone}:`, msgErr);
                        }
                    }
                }
                catch (e) {
                    const axiosErr = e;
                    const metaError = axiosErr?.response?.data?.error?.message;
                    const reason = metaError || (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error');
                    failureHistory.push({ phone: item.phone, name: item.name, reason, timestamp: new Date() });
                    await this.prisma.campaignContact.update({
                        where: { id: item.id },
                        data: { status: 'failed', failReason: reason }
                    });
                }
                if (i < pendingBatch.length - 1) {
                    await sleep(sendDelay);
                }
            }
        }
        const finalContacts = await this.prisma.campaignContact.findMany({
            where: { campaignId },
            select: { status: true }
        });
        let finalSent = 0, finalDelivered = 0, finalRead = 0, finalClicked = 0, finalReplied = 0, finalFailed = 0, finalPending = 0;
        for (const fc of finalContacts) {
            const s = fc.status;
            if (['sent', 'delivered', 'read', 'replied', 'clicked'].includes(s))
                finalSent++;
            if (['delivered', 'read', 'replied', 'clicked'].includes(s))
                finalDelivered++;
            if (['read', 'replied', 'clicked'].includes(s))
                finalRead++;
            if (s === 'replied')
                finalReplied++;
            if (s === 'clicked')
                finalClicked++;
            if (s === 'failed')
                finalFailed++;
            if (s === 'pending')
                finalPending++;
        }
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: aborted ? 'aborted' : 'completed',
                stats: {
                    ...campaignMeta,
                    total: finalContacts.length,
                    pending: finalPending,
                    sent: finalSent,
                    delivered: finalDelivered,
                    read: finalRead,
                    clicked: finalClicked,
                    replied: finalReplied,
                    failed: finalFailed,
                },
                failureHistory: failureHistory
            }
        });
    }
};
exports.CampaignProcessor = CampaignProcessor;
exports.CampaignProcessor = CampaignProcessor = __decorate([
    (0, bullmq_1.Processor)('campaigns', { concurrency: 3 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], CampaignProcessor);
//# sourceMappingURL=campaign.processor.js.map