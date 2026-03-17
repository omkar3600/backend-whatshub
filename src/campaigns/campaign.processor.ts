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

        // Guard: campaign must exist, have a valid template, and be in a processable state
        if (!campaign || !campaign.template) return;
        if (campaign.status !== 'scheduled' && campaign.status !== 'processing') return;

        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'processing' }
        });

        let contacts = await this.prisma.contact.findMany({
            where: { shopId: campaign.shopId }
        });

        // Narrow to specific phones if this is a retry job
        if (limitToPhones && Array.isArray(limitToPhones)) {
            contacts = contacts.filter(c => limitToPhones.includes(c.phone));
        }

        // Filter by targetTags if specified
        const targetTags = campaign.targetTags as string[] | null;
        if (targetTags && targetTags.length > 0) {
            contacts = contacts.filter(c => {
                const contactTags = (c.tags as string[]) || [];
                return targetTags.some(tag => contactTags.includes(tag));
            });
        }

        let sent = 0, failed = 0;
        const failureHistory: { phone: string; name: string; reason: string; timestamp: Date }[] = [];

        for (const c of contacts) {
            try {
                const templateParamsObj = campaign.templateParams as any;
                const templateContent =
                    templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                        ? { name: campaign.template.templateName, components: templateParamsObj }
                        : campaign.template.templateName;

                // Convert null → undefined for headerMediaUrl (WhatsApp service expects string | undefined)
                const headerMediaUrl = campaign.headerMediaUrl ?? undefined;

                await this.whatsappService.sendOutboundMessage(
                    campaign.shopId,
                    c.phone,
                    'template',
                    templateContent,
                    headerMediaUrl
                );
                sent++;

                // Save per-contact record as "sent"
                await this.prisma.campaignContact.upsert({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: {
                        campaignId,
                        contactId: c.id,
                        phone: c.phone,
                        name: c.name,
                        status: 'sent',
                    },
                    update: { status: 'sent', failReason: null },
                });
            } catch (e: unknown) {
                failed++;
                // Safely extract message from unknown error type
                const reason =
                    e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';

                failureHistory.push({
                    phone: c.phone,
                    name: c.name,
                    reason,
                    timestamp: new Date()
                });

                // Save per-contact record as "failed"
                await this.prisma.campaignContact.upsert({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: {
                        campaignId,
                        contactId: c.id,
                        phone: c.phone,
                        name: c.name,
                        status: 'failed',
                        failReason: reason,
                    },
                    update: { status: 'failed', failReason: reason },
                });
            }
        }

        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'completed',
                stats: { sent, delivered: sent, read: 0, clicked: 0, failed },
                failureHistory: failureHistory
            }
        });
    }
}
