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
        const sendDelay = campaignMeta.sendDelay ?? 300;
        let sent = 0, failed = 0;
        const failureHistory = [];
        let aborted = false;
        let cursor = undefined;
        let hasMore = true;
        let messagesProcessed = 0;
        while (hasMore) {
            const currentCampaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
                select: { status: true }
            });
            if (currentCampaign?.status === 'aborted') {
                aborted = true;
                break;
            }
            const baseWhere = { shopId: campaign.shopId };
            if (targetPhones && targetPhones.length > 0) {
                baseWhere.phone = { in: targetPhones };
            }
            const batch = await this.prisma.contact.findMany({
                take: 1000,
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
                where: baseWhere,
                include: { conversations: true },
                orderBy: { id: 'asc' }
            });
            if (batch.length === 0) {
                hasMore = false;
                break;
            }
            cursor = batch[batch.length - 1].id;
            let contactsToProcess = batch;
            if (targetTags && targetTags.length > 0) {
                contactsToProcess = contactsToProcess.filter(c => {
                    const contactTags = c.tags || [];
                    return targetTags.some(tag => contactTags.includes(tag));
                });
            }
            if (targetFilters) {
                contactsToProcess = contactsToProcess.filter(c => {
                    if (targetFilters.city) {
                        if (!c.city || c.city.toLowerCase().trim() !== targetFilters.city.toLowerCase().trim())
                            return false;
                    }
                    if (targetFilters.hasTags && targetFilters.hasTags.length > 0) {
                        const contactTags = c.tags || [];
                        if (!targetFilters.hasTags.some((tag) => contactTags.includes(tag)))
                            return false;
                    }
                    if (targetFilters.noMessagesInDays) {
                        const convo = c.conversations?.[0];
                        if (convo && convo.lastMessageAt) {
                            const daysSinceLastMessage = (Date.now() - new Date(convo.lastMessageAt).getTime()) / (1000 * 60 * 60 * 24);
                            if (daysSinceLastMessage < targetFilters.noMessagesInDays)
                                return false;
                        }
                    }
                    return true;
                });
            }
            if (excludeUnsubscribed) {
                contactsToProcess = contactsToProcess.filter(c => {
                    const tags = c.tags || [];
                    return !tags.includes('unsubscribed');
                });
            }
            const pendingWrites = [];
            for (let i = 0; i < contactsToProcess.length; i++) {
                const c = contactsToProcess[i];
                messagesProcessed++;
                try {
                    const templateParamsObj = campaign.templateParams;
                    const templateContent = templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                        ? { name: campaign.template.templateName, language: campaign.template.language, components: templateParamsObj }
                        : { name: campaign.template.templateName, language: campaign.template.language };
                    const headerMediaUrl = campaign.headerMediaUrl ?? undefined;
                    const result = await this.whatsappService.sendOutboundMessage(campaign.shopId, c.phone, 'template', templateContent, headerMediaUrl);
                    const wamid = result?.messages?.[0]?.id;
                    sent++;
                    pendingWrites.push({
                        where: { campaignId_phone: { campaignId, phone: c.phone } },
                        create: { campaignId, contactId: c.id, phone: c.phone, name: c.name, status: 'sent', wamid: wamid ?? null },
                        update: { status: 'sent', failReason: null, wamid: wamid ?? null },
                    });
                    try {
                        const conversation = await this.prisma.conversation.upsert({
                            where: { shopId_contactId: { shopId: campaign.shopId, contactId: c.id } },
                            create: { shopId: campaign.shopId, contactId: c.id, lastMessageAt: new Date() },
                            update: { lastMessageAt: new Date() },
                        });
                        await this.prisma.message.create({
                            data: {
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
                        console.error(`[Campaign] Failed to save message record for ${c.phone}:`, msgErr);
                    }
                }
                catch (e) {
                    failed++;
                    const axiosErr = e;
                    const metaError = axiosErr?.response?.data?.error?.message;
                    const reason = metaError || (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error');
                    failureHistory.push({ phone: c.phone, name: c.name, reason, timestamp: new Date() });
                    pendingWrites.push({
                        where: { campaignId_phone: { campaignId, phone: c.phone } },
                        create: { campaignId, contactId: c.id, phone: c.phone, name: c.name, status: 'failed', failReason: reason },
                        update: { status: 'failed', failReason: reason },
                    });
                }
                if (pendingWrites.length >= 50 || i === contactsToProcess.length - 1) {
                    if (pendingWrites.length > 0) {
                        await this.prisma.$transaction(pendingWrites.map(args => this.prisma.campaignContact.upsert(args)));
                        pendingWrites.length = 0;
                    }
                }
                if (i < contactsToProcess.length - 1) {
                    await sleep(sendDelay);
                }
            }
        }
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: aborted ? 'aborted' : 'completed',
                stats: { ...campaignMeta, sent, delivered: 0, read: 0, clicked: 0, failed },
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