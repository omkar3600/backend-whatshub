import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { normalizePhone } from '../common/utils/phone-normalizer';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Resolve body text: substitute {{1}}, {{2}} etc with actual parameter values */
function resolveBodyText(bodyTemplate: string, components: any[]): string {
    const bodyComp = components?.find((c: any) => c.type?.toLowerCase() === 'body');
    if (!bodyComp?.parameters?.length) return bodyTemplate;
    let resolved = bodyTemplate;
    bodyComp.parameters.forEach((param: any, idx: number) => {
        resolved = resolved.replace(`{{${idx + 1}}}`, param.text || '');
    });
    return resolved;
}

@Processor('campaigns', { concurrency: 3 })
export class CampaignProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) {
        super();
    }

    async process(job: Job<any>) {
        const { campaignId } = job.data;
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { template: true }
        });

        // Guard: campaign must exist, have a valid template, and be in a processable state
        if (!campaign || !campaign.template) return;
        if (campaign.status !== 'scheduled' && campaign.status !== 'processing') return;

        // Pre-resolve the body template text for this campaign
        const templateComponents = campaign.templateParams as any[];
        const rawBodyText = campaign.template.components
            ? (campaign.template.components as any[]).find((c: any) => c.type === 'BODY')?.text || campaign.template.templateName
            : campaign.template.templateName;
        const resolvedBody = resolveBodyText(rawBodyText, templateComponents || []);

        // Header media URL from the components array (if any)
        const headerComp = templateComponents?.find((c: any) => c.type?.toLowerCase() === 'header');
        const headerImageUrl: string | null = headerComp?.parameters?.[0]?.image?.link
            || headerComp?.parameters?.[0]?.video?.link
            || campaign.headerMediaUrl
            || null;

        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'processing' }
        });

        // Filter definitions
        const targetPhones = campaign.targetPhones as string[] | null;
        const targetTags = campaign.targetTags as string[] | null;
        const targetFilters = campaign.targetFilters as any;
        const campaignMeta = (campaign.stats as any) || {};
        const excludeUnsubscribed = campaignMeta.excludeUnsubscribed ?? false;
        const sendDelay: number = campaignMeta.sendDelay ?? 50;

        const failureHistory: { phone: string; name: string; reason: string; timestamp: Date }[] = [];
        let aborted = false;

        // Step 1: Pre-populate CampaignContact entries if none exist yet for this campaign
        const existingCount = await this.prisma.campaignContact.count({ where: { campaignId } });
        if (existingCount === 0) {
            let targetList: { phone: string; name: string; contactId?: string | null }[] = [];

            if (targetPhones && targetPhones.length > 0) {
                const normalizedTargetPhones = targetPhones.map(p => normalizePhone(p) || p);
                const contacts = await this.prisma.contact.findMany({
                    where: { shopId: campaign.shopId }
                });
                const contactMap = new Map<string, any>();
                for (const c of contacts) {
                    const normKey = normalizePhone(c.phone) || c.phone;
                    contactMap.set(normKey, c);
                }

                const seenPhones = new Set<string>();
                for (const phone of normalizedTargetPhones) {
                    if (seenPhones.has(phone)) continue;
                    seenPhones.add(phone);
                    const matched = contactMap.get(phone);
                    targetList.push({
                        phone,
                        name: matched?.name || phone,
                        contactId: matched?.id || null
                    });
                }
            } else {
                const baseWhere: any = { shopId: campaign.shopId };
                const contacts = await this.prisma.contact.findMany({
                    where: baseWhere,
                    include: { conversations: true }
                });

                let filtered = contacts;
                if (targetTags && targetTags.length > 0) {
                    filtered = filtered.filter(c => {
                        const tags = (c.tags as string[]) || [];
                        return targetTags.some(t => tags.includes(t));
                    });
                }
                if (targetFilters) {
                    filtered = filtered.filter(c => {
                        if (targetFilters.city && (!c.city || c.city.toLowerCase().trim() !== targetFilters.city.toLowerCase().trim())) return false;
                        if (targetFilters.hasTags && targetFilters.hasTags.length > 0) {
                            const tags = (c.tags as string[]) || [];
                            if (!targetFilters.hasTags.some((t: string) => tags.includes(t))) return false;
                        }
                        if (targetFilters.noMessagesInDays) {
                            const convo = c.conversations?.[0];
                            if (convo && convo.lastMessageAt) {
                                const days = (Date.now() - new Date(convo.lastMessageAt).getTime()) / (86400 * 1000);
                                if (days < targetFilters.noMessagesInDays) return false;
                            }
                        }
                        return true;
                    });
                }
                if (excludeUnsubscribed) {
                    filtered = filtered.filter(c => {
                        const tags = (c.tags as string[]) || [];
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

        // Step 2: Batch process pending CampaignContacts
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
                    const templateParamsObj = campaign.templateParams as any;
                    const templateContent =
                        templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                            ? { name: campaign.template.templateName, language: campaign.template.language, components: templateParamsObj }
                            : { name: campaign.template.templateName, language: campaign.template.language };

                    const headerMediaUrl = campaign.headerMediaUrl ?? undefined;

                    const result = await this.whatsappService.sendOutboundMessage(
                        campaign.shopId,
                        item.phone,
                        'template',
                        templateContent,
                        headerMediaUrl
                    );

                    const wamid: string | undefined = result?.messages?.[0]?.id;

                    await this.prisma.campaignContact.update({
                        where: { id: item.id },
                        data: { status: 'sent', failReason: null, wamid: wamid ?? null }
                    });

                    // Save message record if contactId exists
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
                                    } as any,
                                },
                            });
                        } catch (msgErr) {
                            console.error(`[Campaign] Failed to save message record for ${item.phone}:`, msgErr);
                        }
                    }
                } catch (e: unknown) {
                    const axiosErr = e as any;
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
            if (['sent', 'delivered', 'read', 'replied', 'clicked'].includes(s)) finalSent++;
            if (['delivered', 'read', 'replied', 'clicked'].includes(s)) finalDelivered++;
            if (['read', 'replied', 'clicked'].includes(s)) finalRead++;
            if (s === 'replied') finalReplied++;
            if (s === 'clicked') finalClicked++;
            if (s === 'failed') finalFailed++;
            if (s === 'pending') finalPending++;
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
}
