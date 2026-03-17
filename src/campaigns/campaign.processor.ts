import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Processor('campaigns')
export class CampaignProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) {
        super();
    }

    async process(job: Job<any>) {
        const { campaignId, limitToPhones } = job.data;
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { template: true }
        });

        if (!campaign || (campaign.status !== 'scheduled' && campaign.status !== 'processing')) return;

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

        let sent = 0, failed = 0;
        const failureHistory: any[] = [];

        for (const c of contacts) {
            try {
                const templateParamsObj = campaign.templateParams as any;
                const templateContent = templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0 
                    ? { name: campaign.template.templateName, components: templateParamsObj }
                    : campaign.template.templateName;

                await this.whatsappService.sendOutboundMessage(
                    campaign.shopId,
                    c.phone,
                    'template',
                    templateContent,
                    campaign.headerMediaUrl as string | undefined
                );
                sent++;
            } catch (e) {
                failed++;
                failureHistory.push({
                    phone: c.phone,
                    name: c.name,
                    reason: e.message || 'Unknown error',
                    timestamp: new Date()
                });
            }
        }

        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'completed',
                stats: { sent, delivered: sent, read: 0, failed },
                failureHistory: failureHistory
            }
        });
    }
}
