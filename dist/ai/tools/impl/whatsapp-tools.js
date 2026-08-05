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
exports.WhatsAppTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
let WhatsAppTools = class WhatsAppTools {
    prisma;
    whatsapp;
    constructor(prisma, whatsapp) {
        this.prisma = prisma;
        this.whatsapp = whatsapp;
    }
    async getContactPhone(contactId) {
        const c = await this.prisma.contact.findUnique({ where: { id: contactId } });
        return c?.phone || null;
    }
    getTools() {
        return [
            {
                name: 'send_text_message',
                description: 'Send a plain text WhatsApp message to the current customer.',
                inputSchema: {
                    type: 'object',
                    properties: { message: { type: 'string', description: 'The text message to send' } },
                    required: ['message'],
                },
                riskLevel: 'LOW',
                requiresApproval: (autonomyLevel) => autonomyLevel < 3,
                execute: async (ctx, params) => {
                    const phone = ctx.contactId ? await this.getContactPhone(ctx.contactId) : null;
                    if (!phone)
                        return { success: false, error: 'No phone for contact' };
                    await this.whatsapp.sendOutboundMessage(ctx.shopId, phone, 'text', params.message);
                    return { success: true, data: { sent: true } };
                },
            },
            {
                name: 'send_interactive_buttons',
                description: 'Send an interactive WhatsApp message with up to 3 reply buttons.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        body: { type: 'string', description: 'Main message body text' },
                        buttons: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } } }, maxItems: 3, description: 'Reply buttons (max 3)' },
                    },
                    required: ['body', 'buttons'],
                },
                riskLevel: 'LOW',
                requiresApproval: (autonomyLevel) => autonomyLevel < 3,
                execute: async (ctx, params) => {
                    const phone = ctx.contactId ? await this.getContactPhone(ctx.contactId) : null;
                    if (!phone)
                        return { success: false, error: 'No phone for contact' };
                    await this.whatsapp.sendOutboundMessage(ctx.shopId, phone, 'interactive', {
                        text: params.body,
                        config: { buttons: params.buttons.map(b => ({ id: b.id, text: b.text })) },
                    });
                    return { success: true, data: { sent: true } };
                },
            },
        ];
    }
};
exports.WhatsAppTools = WhatsAppTools;
exports.WhatsAppTools = WhatsAppTools = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], WhatsAppTools);
//# sourceMappingURL=whatsapp-tools.js.map