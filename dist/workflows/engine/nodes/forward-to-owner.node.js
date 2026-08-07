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
var ForwardToOwnerExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForwardToOwnerExecutor = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
class ForwardToOwnerSchema {
    validate(config) {
        if (!config.ownerPhone) {
            throw new Error('ownerPhone is required');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                ownerPhone: { type: 'string' },
                customNote: { type: 'string' },
                forwardType: { type: 'string', enum: ['full_message', 'summary_alert'] },
            },
            required: ['ownerPhone'],
        };
    }
}
let ForwardToOwnerExecutor = ForwardToOwnerExecutor_1 = class ForwardToOwnerExecutor {
    whatsappService;
    prisma;
    type = 'forwardToOwner';
    schema = new ForwardToOwnerSchema();
    logger = new common_1.Logger(ForwardToOwnerExecutor_1.name);
    constructor(whatsappService, prisma) {
        this.whatsappService = whatsappService;
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing ForwardToOwner for contact ${context.contactId}`);
        const ownerPhone = (nodeData.ownerPhone || '').trim();
        if (!ownerPhone) {
            return { status: 'error', error: 'Owner phone number is missing' };
        }
        try {
            const contact = await this.prisma.contact.findUnique({
                where: { id: context.contactId },
            });
            let lastMsgContent = context.variables?.incomingMessage || '';
            if (!lastMsgContent && context.contactId) {
                const conversation = await this.prisma.conversation.findFirst({
                    where: { contactId: context.contactId, shopId: context.shopId },
                });
                if (conversation) {
                    const lastMsg = await this.prisma.message.findFirst({
                        where: { conversationId: conversation.id },
                        orderBy: { timestamp: 'desc' },
                    });
                    if (lastMsg)
                        lastMsgContent = lastMsg.content || '';
                }
            }
            const alertText = [
                `🚨 *FORWARD TO OWNER ALERT*`,
                `---------------------------------`,
                `👤 *Customer*: ${contact?.name || 'Customer'} (${contact?.phone || 'Unknown'})`,
                `💬 *Message*: ${lastMsgContent || 'New customer message received'}`,
                nodeData.customNote ? `📝 *Note*: ${nodeData.customNote}` : '',
                `⏰ *Time*: ${new Date().toLocaleTimeString('en-IN')}`,
            ].filter(Boolean).join('\n');
            await this.whatsappService.sendOutboundMessage(context.shopId, ownerPhone, 'text', alertText);
            this.logger.log(`[ForwardToOwner Node] Alert sent to owner phone ${ownerPhone}`);
            return { status: 'continue' };
        }
        catch (error) {
            this.logger.error(`ForwardToOwner execution failed: ${error.message}`);
            return { status: 'error', error: error.message };
        }
    }
};
exports.ForwardToOwnerExecutor = ForwardToOwnerExecutor;
exports.ForwardToOwnerExecutor = ForwardToOwnerExecutor = ForwardToOwnerExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        prisma_service_1.PrismaService])
], ForwardToOwnerExecutor);
//# sourceMappingURL=forward-to-owner.node.js.map