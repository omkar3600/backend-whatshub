import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SequencesService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('sequences') private sequencesQueue: Queue
    ) { }

    async createSequence(shopId: string, data: { name: string; triggerTag: string; steps: any[] }) {
        const { name, triggerTag, steps } = data;

        const sequence = await this.prisma.sequence.create({
            data: {
                shopId,
                name,
                triggerTag,
                steps: {
                    create: steps.map((s, idx) => ({
                        stepNumber: idx + 1,
                        delayHours: s.delayHours,
                        templateId: s.templateId,
                        templateParams: s.templateParams || {}
                    }))
                }
            },
            include: { steps: true }
        });

        return sequence;
    }

    async getSequences(shopId: string) {
        return this.prisma.sequence.findMany({
            where: { shopId },
            include: {
                steps: {
                    include: { template: true },
                    orderBy: { stepNumber: 'asc' }
                },
                _count: {
                    select: { subscribers: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async toggleSequence(shopId: string, id: string, isActive: boolean) {
        return this.prisma.sequence.update({
            where: { id, shopId },
            data: { isActive }
        });
    }

    async deleteSequence(shopId: string, id: string) {
        return this.prisma.sequence.delete({
            where: { id, shopId }
        });
    }

    // Called when a contact is updated with new tags
    async handleContactTagsUpdated(shopId: string, contactId: string, tags: string[]) {
        // Find active sequences that trigger on any of these tags
        if (!tags || tags.length === 0) return;

        const activeSequences = await this.prisma.sequence.findMany({
            where: {
                shopId,
                isActive: true,
                triggerTag: { in: tags }
            },
            include: { steps: { orderBy: { stepNumber: 'asc' }, take: 1 } }
        });

        for (const seq of activeSequences) {
            if (seq.steps.length === 0) continue;

            // Check if contact is already subscribed
            const existingSub = await this.prisma.sequenceSubscriber.findUnique({
                where: { sequenceId_contactId: { sequenceId: seq.id, contactId } }
            });

            if (!existingSub) {
                // Create subscriber
                const sub = await this.prisma.sequenceSubscriber.create({
                    data: {
                        sequenceId: seq.id,
                        contactId,
                        status: 'active',
                        currentStep: 1
                    }
                });

                // Enqueue step 1
                const step1 = seq.steps[0];
                await this.enqueueStep(sub.id, step1.id, step1.delayHours);
            } else if (existingSub.status === 'cancelled') {
                // If they re-got the tag, maybe restart? For now, do nothing.
            }
        }
    }

    async enqueueStep(subscriberId: string, stepId: string, delayHours: number) {
        const delayMs = delayHours * 60 * 60 * 1000;
        await this.sequencesQueue.add('processStep', {
            sequenceSubscriberId: subscriberId,
            sequenceStepId: stepId
        }, { delay: delayMs });
    }
}
