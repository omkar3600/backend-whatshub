import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

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

        let contacts = await this.prisma.contact.findMany({
            where: { shopId: campaign.shopId }
        });

        // Filter by targetPhones if specified in the campaign
        const targetPhones = campaign.targetPhones as string[] | null;
        if (targetPhones && targetPhones.length > 0) {
            contacts = contacts.filter(c => targetPhones.includes(c.phone));
        }

        // Filter by targetTags if specified
        const targetTags = campaign.targetTags as string[] | null;
        if (targetTags && targetTags.length > 0) {
            contacts = contacts.filter(c => {
                const contactTags = (c.tags as string[]) || [];
                return targetTags.some(tag => contactTags.includes(tag));
            });
        }

        // Exclude unsubscribed contacts if requested
        // sendDelay and excludeUnsubscribed are stored inside the stats JSON field during campaign creation
        const campaignMeta = (campaign.stats as any) || {};
        const excludeUnsubscribed = campaignMeta.excludeUnsubscribed ?? false;
        if (excludeUnsubscribed) {
            contacts = contacts.filter(c => {
                const tags = (c.tags as string[]) || [];
                return !tags.includes('unsubscribed');
            });
        }

        // Configurable send delay (ms) — default 300ms = ~3 msgs/sec, safe for all Meta tiers
        const sendDelay: number = campaignMeta.sendDelay ?? 300;

        let sent = 0, failed = 0;
        const failureHistory: { phone: string; name: string; reason: string; timestamp: Date }[] = [];

        // Pending DB writes — flushed every 50 records for efficiency
        const pendingWrites: Parameters<typeof this.prisma.campaignContact.upsert>[0][] = [];

        const flushWrites = async () => {
            if (pendingWrites.length === 0) return;
            const batch = pendingWrites.splice(0, pendingWrites.length);
            await this.prisma.$transaction(batch.map(args => this.prisma.campaignContact.upsert(args)));
        };

        let aborted = false;

        for (let i = 0; i < contacts.length; i++) {
            const c = contacts[i];

            // Check abort status every 20 messages to reduce DB load
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
                const templateParamsObj = campaign.templateParams as any;
                const templateContent =
                    templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                        ? { name: campaign.template.templateName, language: campaign.template.language, components: templateParamsObj }
                        : { name: campaign.template.templateName, language: campaign.template.language };

                // Convert null → undefined for headerMediaUrl
                const headerMediaUrl = campaign.headerMediaUrl ?? undefined;

                const result = await this.whatsappService.sendOutboundMessage(
                    campaign.shopId,
                    c.phone,
                    'template',
                    templateContent,
                    headerMediaUrl
                );

                // Capture the wamid (Meta message ID) from the API response
                const wamid: string | undefined = result?.messages?.[0]?.id;
                sent++;

                pendingWrites.push({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: { campaignId, contactId: c.id, phone: c.phone, name: c.name, status: 'sent', wamid: wamid ?? null },
                    update: { status: 'sent', failReason: null, wamid: wamid ?? null },
                });

                // Save a Message record so the campaign send appears in the inbox chat window
                // Find or create the conversation for this contact
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
                            // Store resolved body so inbox shows actual message text
                            content: resolvedBody,
                            // Store header image if present
                            mediaUrl: headerImageUrl,
                            status: 'sent',
                            // Attach template + campaign info for the badge in the inbox
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
                    // Don't fail the whole campaign if message save fails
                    console.error(`[Campaign] Failed to save message record for ${c.phone}:`, msgErr);
                }
            } catch (e: unknown) {
                failed++;
                const axiosErr = e as any;
                const metaError = axiosErr?.response?.data?.error?.message;
                const reason = metaError || (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error');

                failureHistory.push({ phone: c.phone, name: c.name, reason, timestamp: new Date() });

                pendingWrites.push({
                    where: { campaignId_phone: { campaignId, phone: c.phone } },
                    create: { campaignId, contactId: c.id, phone: c.phone, name: c.name, status: 'failed', failReason: reason },
                    update: { status: 'failed', failReason: reason },
                });
            }

            // Flush writes every 50 contacts
            if (pendingWrites.length >= 50) {
                await flushWrites();
            }

            // Rate limiting — pause between messages
            if (i < contacts.length - 1) {
                await sleep(sendDelay);
            }
        }

        // Flush any remaining writes
        await flushWrites();

        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: aborted ? 'aborted' : 'completed',
                // Merge results into existing stats (preserves sendDelay/excludeUnsubscribed)
                stats: { ...campaignMeta, sent, delivered: 0, read: 0, clicked: 0, failed },
                failureHistory: failureHistory
            }
        });
    }
}
