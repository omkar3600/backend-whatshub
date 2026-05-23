"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencesService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
let SequencesService = class SequencesService {
    prisma;
    sequencesQueue;
    constructor(prisma, sequencesQueue) {
        this.prisma = prisma;
        this.sequencesQueue = sequencesQueue;
    }
    async createSequence(shopId, data) {
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
    async getSequences(shopId) {
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
    async toggleSequence(shopId, id, isActive) {
        return this.prisma.sequence.update({
            where: { id, shopId },
            data: { isActive }
        });
    }
    async deleteSequence(shopId, id) {
        return this.prisma.sequence.delete({
            where: { id, shopId }
        });
    }
    async handleContactTagsUpdated(shopId, contactId, tags) {
        if (!tags || tags.length === 0)
            return;
        const activeSequences = await this.prisma.sequence.findMany({
            where: {
                shopId,
                isActive: true,
                triggerTag: { in: tags }
            },
            include: { steps: { orderBy: { stepNumber: 'asc' }, take: 1 } }
        });
        for (const seq of activeSequences) {
            if (seq.steps.length === 0)
                continue;
            const existingSub = await this.prisma.sequenceSubscriber.findUnique({
                where: { sequenceId_contactId: { sequenceId: seq.id, contactId } }
            });
            if (!existingSub) {
                const sub = await this.prisma.sequenceSubscriber.create({
                    data: {
                        sequenceId: seq.id,
                        contactId,
                        status: 'active',
                        currentStep: 1
                    }
                });
                const step1 = seq.steps[0];
                await this.enqueueStep(sub.id, step1.id, step1.delayHours);
            }
            else if (existingSub.status === 'cancelled') {
            }
        }
    }
    async enqueueStep(subscriberId, stepId, delayHours) {
        const delayMs = delayHours * 60 * 60 * 1000;
        await this.sequencesQueue.add('processStep', {
            sequenceSubscriberId: subscriberId,
            sequenceStepId: stepId
        }, { delay: delayMs });
    }
};
exports.SequencesService = SequencesService;
exports.SequencesService = SequencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('sequences')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], SequencesService);
//# sourceMappingURL=sequences.service.js.map