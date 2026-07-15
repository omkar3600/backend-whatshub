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
var SendMessageExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageExecutor = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const expression_engine_service_1 = require("../expression-engine.service");
class SendMessageSchema {
    validate(config) {
        if (!config.messageType) {
            throw new Error('messageType is required');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                messageType: { type: 'string', enum: ['text', 'template'] },
                text: { type: 'string' },
                templateName: { type: 'string' }
            },
            required: ['messageType']
        };
    }
}
let SendMessageExecutor = SendMessageExecutor_1 = class SendMessageExecutor {
    whatsappService;
    expressionEngine;
    type = 'sendMessage';
    schema = new SendMessageSchema();
    logger = new common_1.Logger(SendMessageExecutor_1.name);
    constructor(whatsappService, expressionEngine) {
        this.whatsappService = whatsappService;
        this.expressionEngine = expressionEngine;
    }
    async execute(context, nodeData) {
        this.logger.debug(`Executing SendMessage for instance ${context.instanceId}`);
        let messageContent = nodeData.text || '';
        if (messageContent) {
            messageContent = await this.expressionEngine.evaluateString(messageContent, {
                contact: context.variables.contact,
                workflow: context.variables.workflow,
                system: { now: new Date().toISOString() }
            });
        }
        try {
            const contactData = await this.whatsappService['prisma'].contact.findUnique({
                where: { id: context.contactId }
            });
            if (!contactData)
                throw new Error('Contact not found');
            if (nodeData.messageType === 'text') {
                this.logger.log(`[Workflow] Sending TEXT to Contact ${context.contactId} (${contactData.phone})`);
                await this.whatsappService.sendOutboundMessage(context.shopId, contactData.phone, 'text', messageContent);
            }
            else if (nodeData.messageType === 'template') {
                this.logger.log(`[Workflow] Sending TEMPLATE ${nodeData.templateName} to Contact ${context.contactId} (${contactData.phone})`);
                await this.whatsappService.sendOutboundMessage(context.shopId, contactData.phone, 'template', {
                    name: nodeData.templateName,
                    language: 'en_US'
                });
            }
            return { status: 'continue' };
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error.message}`);
            return { status: 'error', error: error.message };
        }
    }
};
exports.SendMessageExecutor = SendMessageExecutor;
exports.SendMessageExecutor = SendMessageExecutor = SendMessageExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        expression_engine_service_1.ExpressionEngineService])
], SendMessageExecutor);
//# sourceMappingURL=send-message.node.js.map