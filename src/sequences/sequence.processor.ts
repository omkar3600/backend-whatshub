import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SequencesService } from './sequences.service';

@Processor('sequences', { concurrency: 5 })
export class SequenceProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService,
        private sequencesService: SequencesService
    ) {
        super();
    }

    async process(job: Job<any>) {
        const { sequenceSubscriberId, sequenceStepId } = job.data;
        
        const subscriber = await this.prisma.sequenceSubscriber.findUnique({
            where: { id: sequenceSubscriberId },
            include: { contact: true, sequence: true }
        });
        
        const step = await this.prisma.sequenceStep.findUnique({
            where: { id: sequenceStepId },
            include: { template: true }
        });

        if (!subscriber || !step || subscriber.status !== 'active') return;

        // Verify contact still has the trigger tag
        if (subscriber.sequence.triggerTag) {
            const contactTags = (subscriber.contact.tags as string[]) || [];
            if (!contactTags.includes(subscriber.sequence.triggerTag)) {
                await this.prisma.sequenceSubscriber.update({
                    where: { id: subscriber.id },
                    data: { status: 'cancelled' }
                });
                return;
            }
        }

        // Send template
        try {
            const templateParamsObj = step.templateParams as any;
            const templateContent = templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0
                    ? { name: step.template.templateName, language: step.template.language, components: templateParamsObj }
                    : { name: step.template.templateName, language: step.template.language };

            const result = await this.whatsappService.sendOutboundMessage(
                subscriber.sequence.shopId,
                subscriber.contact.phone,
                'template',
                templateContent
            );

            const conversation = await this.prisma.conversation.upsert({
                where: { shopId_contactId: { shopId: subscriber.sequence.shopId, contactId: subscriber.contact.id } },
                create: { shopId: subscriber.sequence.shopId, contactId: subscriber.contact.id, lastMessageAt: new Date() },
                update: { lastMessageAt: new Date() },
            });

            await this.prisma.message.create({
                data: {
                    shopId: subscriber.sequence.shopId,
                    conversationId: conversation.id,
                    direction: 'outbound',
                    type: 'template',
                    content: `Sequence Step ${step.stepNumber}: ${step.template.templateName}`,
                    status: 'sent',
                    templateData: { templateName: step.template.templateName, wamid: result?.messages?.[0]?.id } as any,
                },
            });

            // Mark step as completed and find next step
            await this.prisma.sequenceSubscriber.update({
                where: { id: subscriber.id },
                data: { currentStep: step.stepNumber + 1 }
            });

            const nextStep = await this.prisma.sequenceStep.findFirst({
                where: { sequenceId: subscriber.sequenceId, stepNumber: step.stepNumber + 1 }
            });

            if (nextStep) {
                await this.sequencesService.enqueueStep(subscriber.id, nextStep.id, nextStep.delayHours);
            } else {
                await this.prisma.sequenceSubscriber.update({
                    where: { id: subscriber.id },
                    data: { status: 'completed' }
                });
            }

        } catch (e) {
            console.error(`[Sequence] Failed to send step ${step.id} to ${subscriber.contact.phone}:`, e);
            // Optionally, we could retry or cancel here. We'll leave it as active so it could be manually retried in future updates.
        }
    }
}
