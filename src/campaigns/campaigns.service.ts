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
        const { name, templateId, targetTags, targetPhones, scheduledAt, templateParams, headerMediaUrl, sendDelay, excludeUnsubscribed } = data;
        const campaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name,
                templateId,
                targetTags: targetTags || [],
                targetPhones: targetPhones || [],
                templateParams: templateParams || {},
                headerMediaUrl: headerMediaUrl || null,
                scheduledAt: new Date(scheduledAt || Date.now()),
                status: 'scheduled',
                // Store send options separately from stats so processor completion doesn't overwrite them
                stats: { sendDelay: sendDelay ?? 300, excludeUnsubscribed: excludeUnsubscribed ?? false } as any,
            },
        });

        // Fire-and-forget: do NOT await the queue add — if Redis is slow or unavailable,
        // this prevents the HTTP request from hanging indefinitely.
        const delay = Math.max(0, new Date(campaign.scheduledAt).getTime() - Date.now());
        this.campaignsQueue.add('processCampaign', { campaignId: campaign.id }, { delay })
            .catch((err) => {
                console.error(`[Campaign] Failed to enqueue campaign ${campaign.id}:`, err?.message || err);
                // Update campaign status to reflect queue failure so user knows
                this.prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: 'failed', failureHistory: [{ reason: 'Queue connection failed: ' + (err?.message || 'Redis unavailable'), timestamp: new Date() }] as any }
                }).catch(() => {});
            });

        return campaign;
    }


    async getCampaigns(shopId: string) {
        return this.prisma.campaign.findMany({
            where: { shopId },
            include: { template: true },
            orderBy: { createdAt: 'desc' },
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

        const allContacts = campaign.contacts;
        const readPhones = new Set(allContacts.filter(c => c.status === 'read').map(c => c.phone));
        const byStatus = {
            sent: allContacts.filter(c => c.status === 'sent'),
            delivered: allContacts.filter(c => c.status === 'delivered'),
            read: allContacts.filter(c => c.status === 'read'),
            clicked: allContacts.filter(c => c.status === 'clicked'),
            failed: allContacts.filter(c => c.status === 'failed'),
            // Unread = delivered or sent but never progressed to 'read'
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
            include: { template: true }
        });

        if (!original || !original.failureHistory) {
            throw new NotFoundException('Campaign or failure history not found');
        }

        const failedList = original.failureHistory as any[];
        if (failedList.length === 0) return { message: 'No failed contacts to resend' };

        const retryCampaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name: `Retry: ${original.name}`,
                templateId: original.templateId,
                status: 'processing',
                scheduledAt: new Date(),
                targetTags: original.targetTags as any,
                targetPhones: (failedList.map(f => f.phone)) as any
            }
        });

        await this.campaignsQueue.add('processCampaign', {
            campaignId: retryCampaign.id
        });

        return retryCampaign;
    }
}
