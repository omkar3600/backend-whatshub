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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const sequences_service_1 = require("./sequences.service");
let SequenceProcessor = class SequenceProcessor extends bullmq_1.WorkerHost {
    prisma;
    whatsappService;
    sequencesService;
    constructor(prisma, whatsappService, sequencesService) {
        super();
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.sequencesService = sequencesService;
    }
    async process(job) {
        const { sequenceSubscriberId, sequenceStepId } = job.data;
        const subscriber = await this.prisma.sequenceSubscriber.findUnique({
            where: { id: sequenceSubscriberId },
            include: { contact: true, sequence: true }
        });
        const step = await this.prisma.sequenceStep.findUnique({
            where: { id: sequenceStepId },
            include: { template: true }
        });
        if (!subscriber || !step || subscriber.status !== 'active')
            return;
        if (subscriber.sequence.triggerTag) {
            const contactTags = subscriber.contact.tags || [];
            if (!contactTags.includes(subscriber.sequence.triggerTag)) {
                await this.prisma.sequenceSubscriber.update({
                    where: { id: subscriber.id },
                    data: { status: 'cancelled' }
                });
                return;
            }
        }
        try {
            const templateParamsObj = step.templateParams;
            let finalComponents = [];
            if (templateParamsObj && Array.isArray(templateParamsObj) && templateParamsObj.length > 0) {
                const parsedParams = templateParamsObj.map(param => {
                    let val = param;
                    if (val === '[Contact Name]')
                        val = subscriber.contact.name || '';
                    else if (val === '[Phone]')
                        val = subscriber.contact.phone || '';
                    return { type: 'text', text: val };
                });
                finalComponents = [
                    {
                        type: 'BODY',
                        parameters: parsedParams
                    }
                ];
            }
            const templateContent = finalComponents.length > 0
                ? { name: step.template.templateName, language: step.template.language, components: finalComponents }
                : { name: step.template.templateName, language: step.template.language };
            const result = await this.whatsappService.sendOutboundMessage(subscriber.sequence.shopId, subscriber.contact.phone, 'template', templateContent);
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
                    templateData: { templateName: step.template.templateName, wamid: result?.messages?.[0]?.id },
                },
            });
            await this.prisma.sequenceSubscriber.update({
                where: { id: subscriber.id },
                data: { currentStep: step.stepNumber + 1 }
            });
            const nextStep = await this.prisma.sequenceStep.findFirst({
                where: { sequenceId: subscriber.sequenceId, stepNumber: step.stepNumber + 1 }
            });
            if (nextStep) {
                await this.sequencesService.enqueueStep(subscriber.id, nextStep.id, nextStep.delayHours);
            }
            else {
                await this.prisma.sequenceSubscriber.update({
                    where: { id: subscriber.id },
                    data: { status: 'completed' }
                });
            }
        }
        catch (e) {
            console.error(`[Sequence] Failed to send step ${step.id} to ${subscriber.contact.phone}:`, e);
        }
    }
};
exports.SequenceProcessor = SequenceProcessor;
exports.SequenceProcessor = SequenceProcessor = __decorate([
    (0, bullmq_1.Processor)('sequences', { concurrency: 5 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService,
        sequences_service_1.SequencesService])
], SequenceProcessor);
//# sourceMappingURL=sequence.processor.js.map