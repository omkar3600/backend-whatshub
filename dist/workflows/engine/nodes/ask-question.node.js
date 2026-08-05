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
var AskQuestionExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskQuestionExecutor = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
class AskQuestionSchema {
    validate(config) {
        if (!config.questionText) {
            throw new Error('questionText is required for AskQuestionNode');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                questionText: { type: 'string' },
                validationType: { type: 'string', enum: ['text', 'email', 'phone', 'number', 'regex'] },
                regexPattern: { type: 'string' },
                outputVariable: { type: 'string' },
                invalidMessageText: { type: 'string' },
            },
            required: ['questionText'],
        };
    }
}
let AskQuestionExecutor = AskQuestionExecutor_1 = class AskQuestionExecutor {
    prisma;
    whatsappService;
    type = 'askQuestion';
    schema = new AskQuestionSchema();
    logger = new common_1.Logger(AskQuestionExecutor_1.name);
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    validateAnswer(val, type, pattern) {
        if (!val)
            return false;
        const trimmed = val.trim();
        if (type === 'email') {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        }
        else if (type === 'phone') {
            return /^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/[\s-]/g, ''));
        }
        else if (type === 'number') {
            return !isNaN(Number(trimmed));
        }
        else if (type === 'regex' && pattern) {
            try {
                return new RegExp(pattern).test(trimmed);
            }
            catch {
                return true;
            }
        }
        return true;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing AskQuestion for instance ${context.instanceId}`);
        const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
        if (!contact)
            return { status: 'error', error: 'Contact not found' };
        const varName = nodeData.outputVariable || 'userAnswer';
        if (context.variables.lastMessageText) {
            const replyText = context.variables.lastMessageText;
            const isValid = this.validateAnswer(replyText, nodeData.validationType || 'text', nodeData.regexPattern);
            if (isValid) {
                this.logger.log(`[Workflow Node] Answer validated for ${contact.phone}: ${replyText}`);
                context.variables[varName] = replyText;
                return { status: 'continue' };
            }
            else {
                const invalidMsg = nodeData.invalidMessageText || 'Invalid format. Please try again:';
                this.logger.log(`[Workflow Node] Answer validation failed for ${contact.phone}. Retrying...`);
                await this.whatsappService.sendOutboundMessage(context.shopId, contact.phone, 'text', invalidMsg);
                return { status: 'wait', resumeToken: `askQuestion_${context.instanceId}` };
            }
        }
        const questionText = nodeData.questionText || 'Please provide your response:';
        await this.whatsappService.sendOutboundMessage(context.shopId, contact.phone, 'text', questionText);
        return { status: 'wait', resumeToken: `askQuestion_${context.instanceId}` };
    }
};
exports.AskQuestionExecutor = AskQuestionExecutor;
exports.AskQuestionExecutor = AskQuestionExecutor = AskQuestionExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], AskQuestionExecutor);
//# sourceMappingURL=ask-question.node.js.map