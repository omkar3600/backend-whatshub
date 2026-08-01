import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('campaigns') private campaignsQueue: Queue
    ) { }

    async createCampaign(shopId: string, data: any) {
        const { name, templateId, targetTags, targetPhones, targetFilters, scheduledAt, templateParams, headerMediaUrl, sendDelay, excludeUnsubscribed, sendNow } = data;

        // Validate: if not sending now, scheduled time must be in the future
        let resolvedScheduledAt: Date;
        let queueDelay: number;

        if (sendNow) {
            // Instant launch — no time needed, fire immediately
            resolvedScheduledAt = new Date();
            queueDelay = 0;
        } else {
            if (!scheduledAt) {
                throw new Error('scheduledAt is required for scheduled campaigns');
            }
            resolvedScheduledAt = new Date(scheduledAt);
            const msUntilSend = resolvedScheduledAt.getTime() - Date.now();
            if (msUntilSend < 30_000) {
                // Reject if less than 30 seconds in the future
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
                stats: { sendDelay: sendDelay ?? 300, excludeUnsubscribed: excludeUnsubscribed ?? false } as any,
            },
        });

        // Fire-and-forget: do NOT await — prevents HTTP request from hanging if Redis is slow
        this.campaignsQueue.add('processCampaign', { campaignId: campaign.id }, { delay: queueDelay })
            .catch((err) => {
                console.error(`[Campaign] Failed to enqueue campaign ${campaign.id}:`, err?.message || err);
                this.prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: 'failed', failureHistory: [{ reason: 'Queue connection failed: ' + (err?.message || 'Redis unavailable'), timestamp: new Date() }] as any }
                }).catch(() => {});
            });

        return campaign;
    }

    async getCampaigns(shopId: string) {
        const campaigns = await this.prisma.campaign.findMany({
            where: { shopId },
            include: {
                template: true,
                // Include aggregated contact stats for real-time counts
                contacts: { select: { status: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return campaigns.map(c => {
            const configMeta = (c.stats as any) || {};

            let sentCount = 0;
            let deliveredCount = 0;
            let readCount = 0;
            let clickedCount = 0;
            let repliedCount = 0;
            let failedCount = 0;
            let pendingCount = 0;

            for (const contact of c.contacts) {
                const s = contact.status;
                if (['sent', 'delivered', 'read', 'replied', 'clicked', 'failed'].includes(s)) sentCount++;
                if (['delivered', 'read', 'replied', 'clicked'].includes(s)) deliveredCount++;
                if (['read', 'replied', 'clicked'].includes(s)) readCount++;
                if (s === 'replied') repliedCount++;
                if (s === 'clicked') clickedCount++;
                if (s === 'failed') failedCount++;
                if (s === 'pending') pendingCount++;
            }

            return {
                ...c,
                contacts: undefined, // don't send all contacts to list view
                stats: {
                    sendDelay: configMeta.sendDelay,
                    excludeUnsubscribed: configMeta.excludeUnsubscribed,
                    total: c.contacts.length,
                    sent: sentCount,
                    delivered: deliveredCount,
                    read: readCount,
                    replied: repliedCount,
                    clicked: clickedCount,
                    failed: failedCount,
                    pending: pendingCount,
                },
            };
        });
    }

    async deleteCampaign(shopId: string, campaignId: string) {
        // Only allow deleting scheduled campaigns
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.status === 'processing') {
            throw new Error('Cannot delete a processing campaign. Abort it first.');
        }

        // Ideally we should also remove the job from BullMQ if it's scheduled
        // For simplicity, we just delete it from DB and the processor will ignore it if it doesn't find it
        return this.prisma.campaign.delete({
            where: { id: campaignId }
        });
    }

    async abortCampaign(shopId: string, campaignId: string) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.status !== 'processing') {
            throw new Error('Can only abort processing campaigns');
        }

        return this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'aborted' }
        });
    }

    async launchRetarget(shopId: string, campaignId: string, body: { name: string; templateId: string; phones: string[] }) {
        const { name, templateId, phones } = body;

        // Verify original campaign belongs to shop
        const original = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId }
        });
        if (!original) throw new NotFoundException('Original campaign not found');

        const campaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name,
                templateId,
                targetPhones: phones,
                scheduledAt: new Date(),
                status: 'processing', // Start immediately
            },
        });

        await this.campaignsQueue.add('processCampaign', { campaignId: campaign.id });

        return campaign;
    }

    async getCampaignAnalytics(shopId: string, campaignId: string) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId },
            include: {
                template: true,
                contacts: {
                    orderBy: { sentAt: 'desc' },
                },
            },
        });

        if (!campaign) throw new NotFoundException('Campaign not found');

        const allContactsMap = new Map<string, any>();

        // 1. Add all CampaignContact entries
        for (const c of campaign.contacts) {
            allContactsMap.set(c.phone, c);
        }

        // 2. Also merge any failures recorded in campaign.failureHistory
        const failHist = (campaign.failureHistory as any[]) || [];
        for (const fh of failHist) {
            if (fh.phone && !allContactsMap.has(fh.phone)) {
                allContactsMap.set(fh.phone, {
                    id: `fh-${fh.phone}`,
                    campaignId,
                    contactId: null,
                    phone: fh.phone,
                    name: fh.name || fh.phone,
                    status: 'failed',
                    failReason: fh.reason || 'Failed to send',
                    sentAt: fh.timestamp || campaign.createdAt,
                    updatedAt: fh.timestamp || campaign.createdAt,
                });
            }
        }

        const allContactsList = Array.from(allContactsMap.values());

        const byStatus = {
            all: allContactsList,
            sent: allContactsList.filter(c => ['sent', 'delivered', 'read', 'replied', 'clicked', 'failed'].includes(c.status)),
            delivered: allContactsList.filter(c => ['delivered', 'read', 'replied', 'clicked'].includes(c.status)),
            read: allContactsList.filter(c => ['read', 'replied', 'clicked'].includes(c.status)),
            replied: allContactsList.filter(c => c.status === 'replied'),
            clicked: allContactsList.filter(c => c.status === 'clicked'),
            failed: allContactsList.filter(c => c.status === 'failed'),
            unread: allContactsList.filter(c => ['sent', 'delivered'].includes(c.status)),
        };

        const stats = {
            total: allContactsList.length,
            sent: byStatus.sent.length,
            delivered: byStatus.delivered.length,
            read: byStatus.read.length,
            replied: byStatus.replied.length,
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

    async addTagsToContacts(shopId: string, campaignId: string, body: { phones: string[]; tags: string[] }) {
        const { phones, tags } = body;

        // Verify campaign belongs to shop
        const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, shopId } });
        if (!campaign) throw new NotFoundException('Campaign not found');

        // For each phone, find contact and merge tags
        const results: any[] = [];
        for (const phone of phones) {
            const contact = await this.prisma.contact.findUnique({
                where: { shopId_phone: { shopId, phone } },
            });
            if (!contact) continue;

            const existingTags = (contact.tags as string[]) || [];
            const mergedTags = Array.from(new Set([...existingTags, ...tags]));

            const updated = await this.prisma.contact.update({
                where: { id: contact.id },
                data: { tags: mergedTags },
            });
            results.push(updated);
        }

        return { updated: results.length, message: `Tags added to ${results.length} contacts` };
    }

    async resendFailed(shopId: string, campaignId: string) {
        const original = await this.prisma.campaign.findFirst({
            where: { id: campaignId, shopId },
            include: { template: true, contacts: { where: { status: 'failed' } } }
        });

        if (!original) {
            throw new NotFoundException('Campaign not found');
        }

        const failedPhones = new Set<string>();

        // 1. Collect from CampaignContact entries with status === 'failed'
        original.contacts.forEach(c => failedPhones.add(c.phone));

        // 2. Collect from failureHistory JSON array
        const failHist = (original.failureHistory as any[]) || [];
        failHist.forEach(f => { if (f.phone) failedPhones.add(f.phone); });

        const phonesList = Array.from(failedPhones);
        if (phonesList.length === 0) return { message: 'No failed contacts to resend' };

        const retryCampaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name: `Retry: ${original.name}`,
                templateId: original.templateId,
                status: 'processing',
                scheduledAt: new Date(),
                templateParams: original.templateParams as any,
                targetPhones: phonesList
            }
        });

        await this.campaignsQueue.add('processCampaign', {
            campaignId: retryCampaign.id
        });

        return retryCampaign;
    }
}
