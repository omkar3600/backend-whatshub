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
        const { name, templateId, targetTags, scheduledAt, templateParams, headerMediaUrl } = data;
        const campaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name,
                templateId,
                targetTags: targetTags || [],
                templateParams: templateParams || {},
                headerMediaUrl: headerMediaUrl || null,
                scheduledAt: new Date(scheduledAt || Date.now()),
                status: 'scheduled',
            },
        });

        const delay = Math.max(0, new Date(campaign.scheduledAt).getTime() - Date.now());
        await this.campaignsQueue.add('processCampaign', { campaignId: campaign.id }, { delay });

        return campaign;
    }

    async getCampaigns(shopId: string) {
        return this.prisma.campaign.findMany({
            where: { shopId },
            include: { template: true },
            orderBy: { createdAt: 'desc' },
        });
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
        const byStatus = {
            sent: allContacts.filter(c => c.status === 'sent'),
            delivered: allContacts.filter(c => c.status === 'delivered'),
            read: allContacts.filter(c => c.status === 'read'),
            clicked: allContacts.filter(c => c.status === 'clicked'),
            failed: allContacts.filter(c => c.status === 'failed'),
        };

        const stats = {
            total: allContacts.length,
            sent: byStatus.sent.length,
            delivered: byStatus.delivered.length,
            read: byStatus.read.length,
            clicked: byStatus.clicked.length,
            failed: byStatus.failed.length,
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
                targetTags: original.targetTags as any
            }
        });

        const failedPhones = failedList.map(f => f.phone);
        await this.campaignsQueue.add('processCampaign', {
            campaignId: retryCampaign.id,
            limitToPhones: failedPhones
        });

        return retryCampaign;
    }
}
