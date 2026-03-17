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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const chat_gateway_1 = require("../chat/chat.gateway");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    httpService;
    chatGateway;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(prisma, httpService, chatGateway) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.chatGateway = chatGateway;
    }
    async verifyWebhook(mode, token, challenge, shopId) {
        if (mode !== 'subscribe')
            return null;
        if (shopId) {
            const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
            if (creds?.webhookVerifyToken && token === creds.webhookVerifyToken) {
                return challenge;
            }
        }
        const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatshub_webhook_password';
        if (token === WEBHOOK_VERIFY_TOKEN) {
            this.logger.log('Webhook verified successfully.');
            return challenge;
        }
        return null;
    }
    async processWebhookEvent(body) {
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                const wabaId = entry.id;
                const shopCreds = await this.prisma.whatsAppCredential.findFirst({
                    where: { businessAccountId: wabaId },
                });
                if (!shopCreds) {
                    this.logger.warn(`Received webhook for unknown WABA ID: ${wabaId}`);
                    continue;
                }
                const changes = entry.changes[0];
                const value = changes.value;
                if (value.messages) {
                    await this.handleIncomingMessage(shopCreds.shopId, value.contacts[0], value.messages[0]);
                }
                if (value.statuses) {
                    await this.handleMessageStatus(shopCreds.shopId, value.statuses[0]);
                }
                if (changes.field === 'message_template_status_update') {
                    await this.handleTemplateStatusUpdate(shopCreds.shopId, value);
                }
            }
        }
    }
    async handleTemplateStatusUpdate(shopId, value) {
        const { event, message_template_id, message_template_name, message_template_language, reason } = value;
        this.logger.log(`[Webhook] Template status update for shop ${shopId}: ${message_template_name} -> ${event}`);
        let status = 'pending';
        if (event === 'APPROVED')
            status = 'approved';
        else if (event === 'REJECTED')
            status = 'rejected';
        else if (event === 'PENDING')
            status = 'pending';
        await this.prisma.template.updateMany({
            where: {
                shopId,
                templateName: message_template_name,
                language: message_template_language
            },
            data: { status }
        });
    }
    async handleIncomingMessage(shopId, contactData, messageData) {
        const contact = await this.prisma.contact.upsert({
            where: {
                shopId_phone: { shopId, phone: contactData.wa_id },
            },
            update: {
                name: contactData.profile.name,
            },
            create: {
                shopId,
                phone: contactData.wa_id,
                name: contactData.profile.name,
            },
        });
        const conversation = await this.prisma.conversation.upsert({
            where: {
                shopId_contactId: { shopId, contactId: contact.id },
            },
            update: {
                lastMessageAt: new Date(),
                unreadCount: { increment: 1 },
            },
            create: {
                shopId,
                contactId: contact.id,
                lastMessageAt: new Date(),
                unreadCount: 1,
            },
        });
        const content = messageData.type === 'text' ? messageData.text.body : '';
        const savedMsg = await this.prisma.message.create({
            data: {
                id: messageData.id,
                shopId,
                conversationId: conversation.id,
                direction: 'inbound',
                type: messageData.type,
                content,
                status: 'delivered',
                timestamp: new Date(parseInt(messageData.timestamp) * 1000),
            },
        });
        this.chatGateway.notifyNewMessage(shopId, {
            ...savedMsg,
            conversationId: conversation.id,
            contact: {
                name: contact.name,
                phone: contact.phone,
            },
        });
        if (messageData.type === 'text') {
            const incomingText = messageData.text.body.trim().toLowerCase();
            const automations = await this.prisma.automation.findMany({
                where: { shopId, isActive: true }
            });
            this.logger.log(`[Automation] ${automations.length} active automation(s). Incoming: "${incomingText}"`);
            for (const auto of automations) {
                const keyword = auto.triggerKeyword?.toLowerCase().trim();
                if (!keyword)
                    continue;
                if (incomingText.includes(keyword) || keyword === incomingText) {
                    this.logger.log(`[Automation] MATCH! Keyword="${keyword}" → sending reply to ${contactData.wa_id}`);
                    try {
                        await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', auto.replyText);
                        this.logger.log(`[Automation] Reply sent successfully to ${contactData.wa_id}`);
                    }
                    catch (sendErr) {
                        const detail = sendErr.response?.data ? JSON.stringify(sendErr.response.data) : sendErr.message;
                        this.logger.error(`[Automation] FAILED to send reply: ${detail}`);
                    }
                    break;
                }
            }
        }
    }
    async handleMessageStatus(shopId, statusData) {
        try {
            await this.prisma.message.update({
                where: { id: statusData.id },
                data: { status: statusData.status },
            });
        }
        catch (e) {
            this.logger.warn(`Status update failed for message ${statusData.id}. It might not exist.`);
        }
    }
    async sendOutboundMessage(shopId, toPhone, type, content, mediaUrl) {
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (!creds)
            throw new Error('WhatsApp credentials not found for this shop');
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhone,
            type: type,
        };
        if (type === 'text') {
            payload.text = { preview_url: false, body: content };
        }
        else if (['image', 'document', 'video', 'audio'].includes(type) && mediaUrl) {
            payload[type] = { link: mediaUrl };
        }
        else if (type === 'template') {
            payload.template = {
                name: content,
                language: { code: 'en_US' }
            };
        }
        const url = `https://graph.facebook.com/v18.0/${creds.phoneNumberId}/messages`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${creds.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Error sending WhatsApp message', error.response?.data || error.message);
            throw error;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        chat_gateway_1.ChatGateway])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map