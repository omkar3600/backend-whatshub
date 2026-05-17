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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const chat_gateway_1 = require("../chat/chat.gateway");
const chatbot_service_1 = require("../chatbot/chatbot.service");
const flow_engine_service_1 = require("../flows/flow-engine.service");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    httpService;
    chatGateway;
    chatbotService;
    flowEngineService;
    logger = new common_1.Logger(WhatsappService_1.name);
    constructor(prisma, httpService, chatGateway, chatbotService, flowEngineService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.chatGateway = chatGateway;
        this.chatbotService = chatbotService;
        this.flowEngineService = flowEngineService;
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
        const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
        if (WEBHOOK_VERIFY_TOKEN && token === WEBHOOK_VERIFY_TOKEN) {
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
        let content = '';
        let mediaUrl;
        const msgType = messageData.type;
        if (msgType === 'text') {
            content = messageData.text?.body || '';
        }
        else if (['image', 'video', 'audio', 'document', 'sticker'].includes(msgType)) {
            const mediaObj = messageData[msgType];
            content = mediaObj?.caption || mediaObj?.filename || '';
            if (mediaObj?.id) {
                try {
                    const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
                    if (creds) {
                        const metaResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://graph.facebook.com/v18.0/${mediaObj.id}`, { headers: { Authorization: `Bearer ${creds.accessToken}` } }));
                        const mediaDlUrl = metaResp.data.url;
                        const fileResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(mediaDlUrl, {
                            headers: { Authorization: `Bearer ${creds.accessToken}` },
                            responseType: 'arraybuffer',
                        }));
                        const dbUrlMatch = (process.env.DATABASE_URL || '').match(/postgres\.([a-z]+):/);
                        const projectRef = process.env.SUPABASE_PROJECT_REF || (dbUrlMatch ? dbUrlMatch[1] : '');
                        const supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
                        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
                        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
                        const ext = mediaObj.mime_type ? '.' + mediaObj.mime_type.split('/')[1].split(';')[0] : '';
                        const fileName = `incoming/${shopId}/${mediaObj.id}${ext}`;
                        const mimeType = mediaObj.mime_type || 'application/octet-stream';
                        await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`, Buffer.from(fileResp.data), {
                            headers: {
                                Authorization: `Bearer ${supabaseKey}`,
                                apikey: supabaseKey,
                                'Content-Type': mimeType,
                                'x-upsert': 'true',
                            },
                            maxBodyLength: 50 * 1024 * 1024,
                            maxContentLength: 50 * 1024 * 1024,
                        }));
                        mediaUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
                    }
                }
                catch (mediaErr) {
                    this.logger.error(`[Media] Failed to download media ${mediaObj?.id}: ${mediaErr?.message}`);
                    mediaUrl = undefined;
                }
            }
        }
        else if (msgType === 'location') {
            const loc = messageData.location;
            content = `📍 Location: ${loc?.name || ''} ${loc?.address || ''} (${loc?.latitude}, ${loc?.longitude})`;
        }
        else if (msgType === 'button') {
            content = messageData.button?.text || '';
        }
        else if (msgType === 'interactive') {
            const ia = messageData.interactive;
            if (ia?.button_reply)
                content = ia.button_reply.title;
            else if (ia?.list_reply)
                content = ia.list_reply.title;
            else
                content = JSON.stringify(ia);
        }
        else {
            content = JSON.stringify(messageData);
        }
        const savedMsg = await this.prisma.message.create({
            data: {
                id: messageData.id,
                shopId,
                conversationId: conversation.id,
                direction: 'inbound',
                type: msgType,
                content,
                mediaUrl,
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
        let automationFired = false;
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
                        const savedAutoMsg = await this.prisma.message.create({
                            data: {
                                shopId,
                                conversationId: conversation.id,
                                direction: 'outbound',
                                type: 'text',
                                content: auto.replyText,
                                status: 'sent',
                            },
                        });
                        this.chatGateway.notifyNewMessage(shopId, {
                            ...savedAutoMsg,
                            contact: { name: contact.name, phone: contact.phone }
                        });
                        await this.prisma.conversation.update({
                            where: { id: conversation.id },
                            data: { lastMessageAt: new Date() },
                        });
                        automationFired = true;
                    }
                    catch (sendErr) {
                        const axiosErr = sendErr;
                        const detail = axiosErr?.response?.data
                            ? JSON.stringify(axiosErr.response.data)
                            : sendErr instanceof Error ? sendErr.message : String(sendErr);
                        this.logger.error(`[Automation] FAILED to send reply: ${detail}`);
                    }
                    break;
                }
            }
        }
        let flowFired = false;
        if (!automationFired && messageData.type === 'text') {
            flowFired = await this.flowEngineService.processIncomingMessage(shopId, contact.phone, messageData.text.body);
            if (flowFired) {
                this.logger.log(`[Flow] Flow triggered/continued for ${contact.phone}`);
            }
        }
        if (!automationFired && !flowFired && messageData.type === 'text') {
            const conv = await this.prisma.conversation.findUnique({
                where: { id: conversation.id },
                select: { aiPaused: true },
            });
            if (!conv?.aiPaused) {
                const aiReply = await this.chatbotService.generateResponse(shopId, contact.name, messageData.text.body, conversation.id);
                if (aiReply.text) {
                    this.logger.log(`[Chatbot] Sending AI reply to ${contactData.wa_id}`);
                    await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', aiReply.text);
                    const savedAiMsg = await this.prisma.message.create({
                        data: {
                            shopId,
                            conversationId: conversation.id,
                            direction: 'outbound',
                            type: 'text',
                            content: aiReply.text,
                            status: 'sent',
                        },
                    });
                    this.chatGateway.notifyNewMessage(shopId, {
                        ...savedAiMsg,
                        contact: { name: contact.name, phone: contact.phone }
                    });
                    await this.prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { lastMessageAt: new Date() },
                    });
                }
                else if (aiReply.error) {
                    this.logger.error(`[Chatbot] Failed to generate AI reply for ${contactData.wa_id}: ${aiReply.error}`);
                }
            }
            else {
                this.logger.log(`[Chatbot] AI paused for conversation ${conversation.id} — skipping.`);
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
        else if (type === 'interactive') {
            const config = content.config || {};
            payload.type = 'interactive';
            payload.interactive = {
                type: 'button',
                body: { text: content.text || content.body || '' },
                action: {
                    buttons: (config.buttons || []).map((btn, idx) => ({
                        type: 'reply',
                        reply: {
                            id: btn.id || `btn-${idx}`,
                            title: btn.text || btn.title || 'Click'
                        }
                    }))
                }
            };
            if (config.header) {
                payload.interactive.header = { type: 'text', text: config.header };
            }
            if (config.footer) {
                payload.interactive.footer = { text: config.footer };
            }
            if (config.mediaType && (config.imageUrl || config.videoUrl)) {
                payload.interactive.header = {
                    type: config.mediaType.toLowerCase() === 'image' ? 'image' : 'video',
                    [config.mediaType.toLowerCase() === 'image' ? 'image' : 'video']: {
                        link: config.imageUrl || config.videoUrl
                    }
                };
            }
        }
        else if (type === 'template') {
            payload.template = {
                name: typeof content === 'string' ? content : content.name,
                language: { code: 'en_US' }
            };
            if (typeof content !== 'string' && content.components) {
                payload.template.components = content.components;
            }
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
            const axiosErr = error;
            const detail = axiosErr?.response?.data || (error instanceof Error ? error.message : String(error));
            this.logger.error('Error sending WhatsApp message', detail);
            throw error;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => flow_engine_service_1.FlowEngineService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        chat_gateway_1.ChatGateway,
        chatbot_service_1.ChatbotService,
        flow_engine_service_1.FlowEngineService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map