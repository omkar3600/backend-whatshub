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

    async createSequence(shopId: string, data: { name: string; triggerType: string; triggerTag?: string; triggerKeyword?: string; steps: any[] }) {
        const { name, triggerType, triggerTag, triggerKeyword, steps } = data;

        const sequence = await this.prisma.sequence.create({
            data: {
                shopId,
                name,
                triggerType,
                triggerTag,
                triggerKeyword,
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

    async getSequenceAnalytics(shopId: string, sequenceId: string) {
        // Aggregate subscribers by currentStep
        const stepCounts = await this.prisma.sequenceSubscriber.groupBy({
            by: ['currentStep', 'status'],
            where: { sequenceId, sequence: { shopId } },
            _count: { id: true }
        });

        const totalEnrolled = await this.prisma.sequenceSubscriber.count({
            where: { sequenceId, sequence: { shopId } }
        });

        return {
            totalEnrolled,
            stepBreakdown: stepCounts.map(sc => ({
                step: sc.currentStep,
                status: sc.status,
                count: sc._count.id
            }))
        };
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

    // Called when a user sends an incoming message
    async handleKeywordTriggered(shopId: string, contactId: string, keyword: string) {
        if (!keyword) return;
        
        // Find active sequences that trigger on this keyword
        const activeSequences = await this.prisma.sequence.findMany({
            where: {
                shopId,
                isActive: true,
                triggerType: 'KEYWORD',
                triggerKeyword: { equals: keyword, mode: 'insensitive' }
            },
            include: { steps: { orderBy: { stepNumber: 'asc' }, take: 1 } }
        });

        for (const seq of activeSequences) {
            if (seq.steps.length === 0) continue;

            const existingSub = await this.prisma.sequenceSubscriber.findUnique({
                where: { sequenceId_contactId: { sequenceId: seq.id, contactId } }
            });

            if (!existingSub) {
                const sub = await this.prisma.sequenceSubscriber.create({
                    data: { sequenceId: seq.id, contactId, status: 'active', currentStep: 1 }
                });
                const step1 = seq.steps[0];
                await this.enqueueStep(sub.id, step1.id, step1.delayHours);
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
