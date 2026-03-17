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

    async resendFailed(shopId: string, campaignId: string) {
        const original = await this.prisma.campaign.findUnique({
            where: { id: campaignId, shopId },
            include: { template: true }
        });

        if (!original || !original.failureHistory) {
            throw new NotFoundException('Campaign or failure history not found');
        }

        const failedList = original.failureHistory as any[];
        if (failedList.length === 0) return { message: 'No failed contacts to resend' };

        // For simplicity, we create a new "Processing" state or just re-run for these specific ones
        // Here we just trigger a one-off process by adding to queue with custom data
        // For robustness, let's create a "Retry" campaign entry
        const retryCampaign = await this.prisma.campaign.create({
            data: {
                shopId,
                name: `Retry: ${original.name}`,
                templateId: original.templateId,
                status: 'processing',
                scheduledAt: new Date(),
                targetTags: original.targetTags as any // Keep original tags reference if needed
                // We'll pass the specific list in the job data
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
