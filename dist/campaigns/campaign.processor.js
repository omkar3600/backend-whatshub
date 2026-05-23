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
        let contacts = await this.prisma.contact.findMany({
            where: { shopId: campaign.shopId },
            include: { conversations: true }
        });
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
        const targetFilters = campaign.targetFilters;
        if (targetFilters) {
            contacts = contacts.filter(c => {
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
        const campaignMeta = campaign.stats || {};
        const excludeUnsubscribed = campaignMeta.excludeUnsubscribed ?? false;
        if (excludeUnsubscribed) {
            contacts = contacts.filter(c => {
                const tags = c.tags || [];
                return !tags.includes('unsubscribed');
            });
        }
        const sendDelay = campaignMeta.sendDelay ?? 300;
        let sent = 0, failed = 0;
        const failureHistory = [];
        const pendingWrites = [];
        const flushWrites = async () => {
            if (pendingWrites.length === 0)
                return;
            const batch = pendingWrites.splice(0, pendingWrites.length);
            await this.prisma.$transaction(batch.map(args => this.prisma.campaignContact.upsert(args)));
        };
        let aborted = false;
        for (let i = 0; i < contacts.length; i++) {
            const c = contacts[i];
            if (i % 20 === 0) {
                const currentCampaign = await this.prisma.campaign.findUnique({
                    where: { id: campaignId },
                    select: { status: true }
                });
                if (currentCampaign?.status === 'aborted') {
                    aborted = true;
                    break;
                }
            }
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
            if (pendingWrites.length >= 50) {
                await flushWrites();
            }
            if (i < contacts.length - 1) {
                await sleep(sendDelay);
            }
        }
        await flushWrites();
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