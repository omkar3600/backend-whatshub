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
const crypto_service_1 = require("../common/services/crypto.service");
const system_config_service_1 = require("../admin/system-config.service");
const phone_normalizer_1 = require("../common/utils/phone-normalizer");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const chat_gateway_1 = require("../chat/chat.gateway");
const chatbot_service_1 = require("../chatbot/chatbot.service");
const flow_engine_service_1 = require("../flows/flow-engine.service");
const workflow_engine_service_1 = require("../workflows/engine/workflow-engine.service");
const trigger_registry_1 = require("../workflows/engine/registries/trigger.registry");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    httpService;
    cryptoService;
    systemConfigService;
    chatGateway;
    chatbotService;
    flowEngineService;
    workflowEngineService;
    triggerRegistry;
    logger = new common_1.Logger(WhatsappService_1.name);
    graphApiBase = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v18.0'}`;
    constructor(prisma, httpService, cryptoService, systemConfigService, chatGateway, chatbotService, flowEngineService, workflowEngineService, triggerRegistry) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.cryptoService = cryptoService;
        this.systemConfigService = systemConfigService;
        this.chatGateway = chatGateway;
        this.chatbotService = chatbotService;
        this.flowEngineService = flowEngineService;
        this.workflowEngineService = workflowEngineService;
        this.triggerRegistry = triggerRegistry;
    }
    async getGraphApiBase() {
        const version = await this.systemConfigService.get('META_API_VERSION', process.env.META_API_VERSION || 'v18.0');
        return `https://graph.facebook.com/${version}`;
    }
    async getCredentials(shopId) {
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { shopId, status: 'active' },
            include: {
                phoneNumbers: {
                    where: { status: 'active', isDefault: true },
                    take: 1,
                },
            },
        });
        if (account) {
            const defaultPhone = account.phoneNumbers[0];
            if (!defaultPhone) {
                const anyPhone = await this.prisma.whatsAppPhoneNumber.findFirst({
                    where: { wabaAccountId: account.id, status: 'active' },
                });
                if (!anyPhone) {
                    throw new Error(`No active phone numbers found for shop ${shopId}`);
                }
                return {
                    shopId,
                    phoneNumberId: anyPhone.phoneNumberId,
                    accessToken: this.cryptoService.decrypt(account.accessToken),
                    businessAccountId: account.businessAccountId,
                    wabaId: account.wabaId || account.businessAccountId,
                };
            }
            return {
                shopId,
                phoneNumberId: defaultPhone.phoneNumberId,
                accessToken: this.cryptoService.decrypt(account.accessToken),
                businessAccountId: account.businessAccountId,
                wabaId: account.wabaId || account.businessAccountId,
            };
        }
        throw new Error(`WhatsApp credentials not found for shop ${shopId}`);
    }
    async getCredentialsByPhoneNumberId(phoneNumberId) {
        const phone = await this.prisma.whatsAppPhoneNumber.findUnique({
            where: { phoneNumberId },
            include: { wabaAccount: true },
        });
        if (!phone || phone.status !== 'active' || phone.wabaAccount.status !== 'active') {
            return null;
        }
        return {
            shopId: phone.shopId,
            phoneNumberId: phone.phoneNumberId,
            accessToken: this.cryptoService.decrypt(phone.wabaAccount.accessToken),
            businessAccountId: phone.wabaAccount.businessAccountId,
            wabaId: phone.wabaAccount.wabaId || phone.wabaAccount.businessAccountId,
        };
    }
    async getShopByWabaId(wabaId) {
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: {
                OR: [
                    { businessAccountId: wabaId },
                    { wabaId: wabaId },
                ],
                status: 'active',
            },
        });
        return account?.shopId || null;
    }
    async verifyWebhook(mode, token, challenge) {
        if (mode !== 'subscribe')
            return null;
        const WEBHOOK_VERIFY_TOKEN = await this.systemConfigService.get('WEBHOOK_VERIFY_TOKEN', process.env.WEBHOOK_VERIFY_TOKEN);
        if (WEBHOOK_VERIFY_TOKEN && token === WEBHOOK_VERIFY_TOKEN) {
            this.logger.log('Webhook verified successfully.');
            return challenge;
        }
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { webhookVerifyToken: token },
        });
        if (account) {
            this.logger.log(`Webhook verified for shop ${account.shopId}`);
            return challenge;
        }
        return null;
    }
    async processWebhookEvent(body) {
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                const wabaId = entry.id;
                for (const change of entry.changes || []) {
                    const value = change.value;
                    const phoneNumberId = value?.metadata?.phone_number_id;
                    let shopId = await this.getShopByWabaId(wabaId);
                    if (!shopId && phoneNumberId) {
                        const creds = await this.getCredentialsByPhoneNumberId(phoneNumberId);
                        shopId = creds?.shopId || null;
                    }
                    if (!shopId) {
                        this.logger.warn(`Received webhook for unknown WABA ID: ${wabaId} / Phone ID: ${phoneNumberId}`);
                        await this.logWebhookAudit(null, phoneNumberId, 'unknown_waba', null, body, 'failed', `Unknown WABA/Phone ID: ${wabaId}/${phoneNumberId}`);
                        continue;
                    }
                    try {
                        if (value.messages) {
                            await this.handleIncomingMessage(shopId, phoneNumberId, value.contacts[0], value.messages[0]);
                            await this.logWebhookAudit(shopId, phoneNumberId, 'message', value.messages[0]?.id, value, 'processed');
                        }
                        if (value.statuses) {
                            await this.handleMessageStatus(shopId, value.statuses[0]);
                            await this.logWebhookAudit(shopId, phoneNumberId, 'status', value.statuses[0]?.id, value, 'processed');
                        }
                        if (change.field === 'message_template_status_update') {
                            await this.handleTemplateStatusUpdate(shopId, value);
                            await this.logWebhookAudit(shopId, phoneNumberId, 'template_status', null, value, 'processed');
                        }
                        if (change.field === 'phone_number_name_update') {
                            await this.handlePhoneNumberNameUpdate(shopId, wabaId, value);
                            await this.logWebhookAudit(shopId, null, 'account_update', null, value, 'processed');
                        }
                    }
                    catch (error) {
                        this.logger.error(`Error processing webhook for shop ${shopId}: ${error.message}`);
                        await this.logWebhookAudit(shopId, phoneNumberId, 'error', null, value, 'failed', error.message);
                        await this.prisma.deadLetterEvent.create({
                            data: {
                                sourceType: 'webhook',
                                originalPayload: value,
                                errorMessage: error.message,
                                status: 'pending',
                            },
                        });
                    }
                }
            }
        }
    }
    async handlePhoneNumberNameUpdate(shopId, wabaAccountId, value) {
        const { display_phone_number, decision, requested_verified_name, rejection_reason } = value;
        this.logger.log(`[Webhook] Name update for ${display_phone_number}: ${decision}`);
        const phone = await this.prisma.whatsAppPhoneNumber.findFirst({
            where: { shopId, displayPhoneNumber: display_phone_number }
        });
        if (!phone) {
            this.logger.warn(`Could not find phone number ${display_phone_number} to update name.`);
            return;
        }
        if (decision === 'APPROVED') {
            await this.prisma.whatsAppPhoneNumber.update({
                where: { id: phone.id },
                data: {
                    nameStatus: 'APPROVED',
                    verifiedName: requested_verified_name
                }
            });
            try {
                const creds = await this.getCredentialsByPhoneNumberId(phone.phoneNumberId);
                if (creds) {
                    await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${phone.phoneNumberId}/register`, {
                        messaging_product: 'whatsapp',
                        pin: require('crypto').randomInt(100000, 999999).toString()
                    }, {
                        headers: { Authorization: `Bearer ${creds.accessToken}` }
                    }));
                    this.logger.log(`Successfully re-registered phone ${phone.phoneNumberId} with new name.`);
                }
            }
            catch (err) {
                this.logger.error(`Failed to auto-register phone after name approval: ${err.message}`);
            }
        }
        else if (decision === 'REJECTED') {
            await this.prisma.whatsAppPhoneNumber.update({
                where: { id: phone.id },
                data: {
                    nameStatus: 'REJECTED'
                }
            });
            this.logger.warn(`Name change rejected: ${rejection_reason}`);
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
    async handleMessageStatus(shopId, statusData) {
        const { id: messageId, status, recipient_id: recipientPhone } = statusData;
        let failReason = null;
        if (status === 'failed' && statusData.errors && statusData.errors.length > 0) {
            failReason = statusData.errors[0].title || statusData.errors[0].message || 'Unknown error';
        }
        let message = null;
        try {
            message = await this.prisma.message.update({
                where: { id: messageId },
                data: { status },
            });
            if (message) {
                this.chatGateway.notifyMessageStatus(shopId, {
                    conversationId: message.conversationId,
                    messageId: messageId,
                    status: status,
                });
            }
        }
        catch (e) {
            this.logger.warn(`Status update failed for message ${messageId}. It might not exist.`);
        }
        if (['delivered', 'read', 'sent', 'replied', 'failed'].includes(status)) {
            try {
                const statusRank = { failed: -1, pending: 0, sent: 1, delivered: 2, read: 3, clicked: 4, replied: 5 };
                const incomingRank = statusRank[status] ?? 0;
                let existing = await this.prisma.campaignContact.findFirst({
                    where: { wamid: messageId },
                });
                if (!existing && recipientPhone) {
                    const cleanPhone = (0, phone_normalizer_1.normalizePhone)(recipientPhone);
                    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
                    existing = await this.prisma.campaignContact.findFirst({
                        where: {
                            OR: [
                                { phone: cleanPhone },
                                { phone: `+${cleanPhone}` },
                            ],
                            sentAt: { gte: fortyEightHoursAgo },
                            campaign: { shopId },
                        },
                        orderBy: { sentAt: 'desc' },
                    });
                }
                if (existing) {
                    const existingRank = statusRank[existing.status] ?? 0;
                    const shouldUpdate = status === 'failed' ? (existingRank < 3) : (incomingRank > existingRank);
                    if (shouldUpdate) {
                        await this.prisma.campaignContact.update({
                            where: { id: existing.id },
                            data: {
                                status,
                                ...(failReason ? { failReason } : {}),
                                ...(existing.wamid ? {} : { wamid: messageId }),
                            },
                        });
                        this.logger.log(`[Campaign] Updated CampaignContact wamid:${messageId} phone:${recipientPhone} → ${status}`);
                        if (status === 'failed' && failReason) {
                            const camp = await this.prisma.campaign.findUnique({
                                where: { id: existing.campaignId },
                                select: { failureHistory: true }
                            });
                            const history = camp?.failureHistory || [];
                            if (!history.some(h => h.phone === existing.phone)) {
                                history.push({
                                    phone: existing.phone,
                                    name: existing.name,
                                    reason: failReason,
                                    timestamp: new Date()
                                });
                                await this.prisma.campaign.update({
                                    where: { id: existing.campaignId },
                                    data: { failureHistory: history }
                                });
                            }
                        }
                        const campaignContacts = await this.prisma.campaignContact.findMany({
                            where: { campaignId: existing.campaignId },
                            select: { status: true }
                        });
                        let sent = 0, delivered = 0, read = 0, clicked = 0, replied = 0, failed = 0, pending = 0;
                        for (const c of campaignContacts) {
                            if (['sent', 'delivered', 'read', 'replied', 'clicked'].includes(c.status))
                                sent++;
                            if (['delivered', 'read', 'replied', 'clicked'].includes(c.status))
                                delivered++;
                            if (['read', 'replied', 'clicked'].includes(c.status))
                                read++;
                            if (c.status === 'replied')
                                replied++;
                            if (c.status === 'clicked')
                                clicked++;
                            if (c.status === 'failed')
                                failed++;
                            if (c.status === 'pending')
                                pending++;
                        }
                        const camp = await this.prisma.campaign.findUnique({
                            where: { id: existing.campaignId },
                            select: { stats: true }
                        });
                        const currentMeta = camp?.stats || {};
                        await this.prisma.campaign.update({
                            where: { id: existing.campaignId },
                            data: {
                                stats: {
                                    ...currentMeta,
                                    total: campaignContacts.length,
                                    pending,
                                    sent,
                                    delivered,
                                    read,
                                    clicked,
                                    replied,
                                    failed,
                                }
                            }
                        });
                        this.chatGateway.server.to(shopId).emit('campaignContactUpdated', {
                            campaignId: existing.campaignId,
                            contactId: existing.id,
                            phone: existing.phone,
                            status: status,
                        });
                    }
                }
            }
            catch (e) {
                this.logger.warn(`Failed to update CampaignContact for wamid ${messageId}: ${e}`);
            }
        }
    }
    async handleIncomingMessage(shopId, phoneNumberId, contactData, messageData) {
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
                lastContactMessageAt: new Date(),
                unreadCount: { increment: 1 },
                phoneNumberId: phoneNumberId || undefined,
            },
            create: {
                shopId,
                contactId: contact.id,
                phoneNumberId: phoneNumberId || undefined,
                lastMessageAt: new Date(),
                lastContactMessageAt: new Date(),
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
                    const creds = await this.getCredentials(shopId);
                    const metaResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${mediaObj.id}`, { headers: { Authorization: `Bearer ${creds.accessToken}` } }));
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
        const existingMsg = await this.prisma.message.findUnique({
            where: { id: messageData.id }
        });
        if (existingMsg) {
            this.logger.log(`[Webhook] Duplicate message received: ${messageData.id}. Skipping.`);
            return;
        }
        const savedMsg = await this.prisma.message.create({
            data: {
                id: messageData.id,
                shopId,
                conversationId: conversation.id,
                phoneNumberId: phoneNumberId || undefined,
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
        let workflowFired = false;
        const waitingInstances = await this.prisma.workflowInstance.findMany({
            where: { shopId, contactId: contact.id, status: 'waiting' }
        });
        for (const instance of waitingInstances) {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'active', resumeToken: null }
            });
            const version = await this.prisma.workflowVersion.findUnique({ where: { id: instance.workflowVersionId } });
            if (version) {
                const graph = version.graph;
                const edges = graph.edges?.filter((e) => e.source === instance.currentNodeId) || [];
                await this.prisma.workflowInstance.update({
                    where: { id: instance.id },
                    data: { previousNodeId: instance.currentNodeId, lastExecutedNodeId: instance.currentNodeId, executionVersion: { increment: 1 } }
                });
                for (const edge of edges) {
                    await this.workflowEngineService.enqueueNodeExecution(instance.id, edge.target);
                }
                workflowFired = true;
                this.logger.log(`[Workflow] Resumed waiting instance ${instance.id} for contact ${contact.phone}`);
            }
        }
        if (messageData.type === 'text' && !workflowFired) {
            try {
                const trigger = this.triggerRegistry.get('incomingMessage');
                if (trigger && trigger.evaluate) {
                    await trigger.evaluate({
                        shopId,
                        contactId: contact.id,
                        messageText: messageData.text.body,
                        messageType: 'text'
                    });
                }
            }
            catch (e) {
                this.logger.error(`[Workflow] Failed to evaluate triggers: ${e.message}`);
            }
        }
        let automationFired = false;
        if (messageData.type === 'text') {
            const incomingText = messageData.text.body.trim().toLowerCase();
            try {
                const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
                const normPhone = (0, phone_normalizer_1.normalizePhone)(contact.phone);
                const recentCampaignContact = await this.prisma.campaignContact.findFirst({
                    where: {
                        OR: [
                            { phone: contact.phone },
                            { phone: normPhone },
                            { phone: `+${normPhone}` },
                        ],
                        sentAt: { gte: fortyEightHoursAgo },
                        campaign: { shopId }
                    },
                    orderBy: { sentAt: 'desc' }
                });
                if (recentCampaignContact) {
                    const statusRank = { failed: -1, pending: 0, sent: 1, delivered: 2, read: 3, clicked: 4, replied: 5 };
                    const isClick = ['button', 'interactive'].includes(messageData.type);
                    const incomingStatus = isClick ? 'clicked' : 'replied';
                    const incomingRank = statusRank[incomingStatus];
                    const existingRank = statusRank[recentCampaignContact.status] ?? 0;
                    if (incomingRank > existingRank) {
                        await this.prisma.campaignContact.update({
                            where: { id: recentCampaignContact.id },
                            data: { status: incomingStatus }
                        });
                        this.logger.log(`[Campaign] Contact ${contact.phone} ${incomingStatus} to campaign ${recentCampaignContact.campaignId}`);
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Failed to update campaign tracking for ${contact.phone}: ${err}`);
            }
            const automations = await this.prisma.automation.findMany({
                where: { shopId, isActive: true }
            });
            this.logger.log(`[Automation] ${automations.length} active automation(s). Incoming: "${incomingText}"`);
            for (const auto of automations) {
                const keywordString = auto.triggerKeyword?.toLowerCase().trim();
                if (!keywordString)
                    continue;
                const keywords = keywordString.split(',').map((k) => k.trim()).filter(Boolean);
                const isMatch = keywords.some((kw) => {
                    if (kw === incomingText)
                        return true;
                    if (kw.length <= 3)
                        return incomingText === kw;
                    try {
                        const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        const regex = new RegExp(`(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b)`, 'i');
                        return regex.test(incomingText);
                    }
                    catch {
                        return incomingText === kw;
                    }
                });
                if (isMatch) {
                    this.logger.log(`[Automation] MATCH! Keyword="${keywordString}" → sending reply to ${contactData.wa_id}`);
                    try {
                        const metaRes = await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', auto.replyText);
                        const wamid = metaRes?.messages?.[0]?.id;
                        this.logger.log(`[Automation] Reply sent successfully to ${contactData.wa_id}`);
                        const savedAutoMsg = await this.prisma.message.create({
                            data: {
                                id: wamid || undefined,
                                shopId,
                                conversationId: conversation.id,
                                phoneNumberId: phoneNumberId || undefined,
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
                    const metaRes = await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', aiReply.text);
                    const wamid = metaRes?.messages?.[0]?.id;
                    const savedAiMsg = await this.prisma.message.create({
                        data: {
                            id: wamid || undefined,
                            shopId,
                            conversationId: conversation.id,
                            phoneNumberId: phoneNumberId || undefined,
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
    async markMessageAsRead(shopId, messageId) {
        const creds = await this.getCredentials(shopId);
        const payload = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId
        };
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}/messages`, payload, {
                headers: { Authorization: `Bearer ${creds.accessToken}`, 'Content-Type': 'application/json' }
            }));
        }
        catch (error) {
            this.logger.error(`Failed to mark message as read: ${messageId}`, error.response?.data || error.message);
        }
    }
    async check24HourWindow(shopId, toPhone) {
        const clean = (0, phone_normalizer_1.normalizePhone)(toPhone);
        const contact = await this.prisma.contact.findFirst({
            where: { shopId, OR: [{ phone: clean }, { phone: `+${clean}` }] }
        });
        if (!contact)
            return true;
        const conversation = await this.prisma.conversation.findUnique({
            where: { shopId_contactId: { shopId, contactId: contact.id } }
        });
        if (!conversation || !conversation.lastContactMessageAt) {
            return false;
        }
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return conversation.lastContactMessageAt >= twentyFourHoursAgo;
    }
    async getAppSecretProof(accessToken) {
        const appSecret = await this.systemConfigService.get('META_APP_SECRET', process.env.META_APP_SECRET);
        if (!appSecret || appSecret.includes('your_meta_app_secret') || appSecret.trim() === '')
            return undefined;
        return (0, crypto_1.createHmac)('sha256', appSecret.trim()).update(accessToken).digest('hex');
    }
    async sendOutboundMessage(shopId, toPhone, type, content, mediaUrl) {
        const creds = await this.getCredentials(shopId);
        const cleanPhone = (0, phone_normalizer_1.normalizePhone)(toPhone);
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
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
            const rawButtons = config.buttons || [];
            const sanitizedButtons = rawButtons.slice(0, 3).map((btn, idx) => {
                const titleStr = (btn.text || btn.title || 'Click').trim();
                return {
                    type: 'reply',
                    reply: {
                        id: btn.id || `btn-${idx}`,
                        title: titleStr.length > 20 ? titleStr.slice(0, 20) : titleStr
                    }
                };
            });
            payload.type = 'interactive';
            payload.interactive = {
                type: 'button',
                body: { text: content.text || content.body || '' },
                action: { buttons: sanitizedButtons }
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
            const templateName = typeof content === 'string' ? content : content.name;
            const templateLanguage = (typeof content !== 'string' && content.language) ? content.language : 'en_US';
            payload.template = {
                name: templateName,
                language: { code: templateLanguage }
            };
            const components = [];
            if (typeof content !== 'string' && Array.isArray(content.components)) {
                for (const comp of content.components) {
                    if (!comp || !comp.type)
                        continue;
                    const compType = String(comp.type).toLowerCase();
                    const sanitizedComp = { type: compType };
                    if (comp.sub_type) {
                        sanitizedComp.sub_type = String(comp.sub_type).toLowerCase();
                    }
                    if (comp.index !== undefined && comp.index !== null) {
                        sanitizedComp.index = String(comp.index);
                    }
                    if (Array.isArray(comp.parameters)) {
                        sanitizedComp.parameters = comp.parameters.map((p) => {
                            const pType = p.type ? String(p.type).toLowerCase() : 'text';
                            if (pType === 'text') {
                                return { ...p, type: 'text', text: p.text && String(p.text).trim() !== '' ? String(p.text).trim() : ' ' };
                            }
                            return p;
                        });
                    }
                    if (sanitizedComp.parameters && sanitizedComp.parameters.length > 0) {
                        components.push(sanitizedComp);
                    }
                }
            }
            const hasHeader = components.some(c => c.type === 'header');
            if (!hasHeader && mediaUrl) {
                let headerType = 'image';
                const lowerUrl = mediaUrl.toLowerCase();
                if (lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || lowerUrl.includes('.avi') || lowerUrl.includes('/video/')) {
                    headerType = 'video';
                }
                else if (lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || lowerUrl.includes('.docx') || lowerUrl.includes('/document/')) {
                    headerType = 'document';
                }
                components.unshift({
                    type: 'header',
                    parameters: [
                        {
                            type: headerType,
                            [headerType]: { link: mediaUrl }
                        }
                    ]
                });
            }
            if (components.length > 0) {
                payload.template.components = components;
            }
        }
        const url = `${this.graphApiBase}/${creds.phoneNumberId}/messages`;
        const proof = await this.getAppSecretProof(creds.accessToken);
        const maxRetries = 3;
        let attempt = 0;
        let lastError = null;
        while (attempt < maxRetries) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${creds.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: proof ? { appsecret_proof: proof } : {},
                }));
                return response.data;
            }
            catch (error) {
                lastError = error;
                const axiosErr = error;
                const statusCode = axiosErr?.response?.status;
                const errorCode = axiosErr?.response?.data?.error?.code;
                const isRateLimit = statusCode === 429 || [131048, 130429, 131056].includes(errorCode);
                const isTransientServerErr = statusCode >= 500 && statusCode <= 504;
                attempt++;
                if ((isRateLimit || isTransientServerErr) && attempt < maxRetries) {
                    const delayMs = Math.pow(2, attempt) * 1000;
                    this.logger.warn(`[WhatsApp API] Rate limit or transient error (${errorCode || statusCode}). Retrying attempt ${attempt}/${maxRetries} in ${delayMs}ms...`);
                    await new Promise(res => setTimeout(res, delayMs));
                    continue;
                }
                const detail = axiosErr?.response?.data || (error instanceof Error ? error.message : String(error));
                this.logger.error('Error sending WhatsApp message', detail);
                throw error;
            }
        }
        throw lastError;
    }
    async processDeadLetterQueue() {
        const pendingEvents = await this.prisma.deadLetterEvent.findMany({
            where: { status: 'pending', retryCount: { lt: 3 } },
            take: 50
        });
        let resolvedCount = 0;
        for (const event of pendingEvents) {
            try {
                await this.processWebhookEvent(event.originalPayload);
                await this.prisma.deadLetterEvent.update({
                    where: { id: event.id },
                    data: { status: 'resolved', resolvedAt: new Date() }
                });
                resolvedCount++;
            }
            catch (e) {
                await this.prisma.deadLetterEvent.update({
                    where: { id: event.id },
                    data: {
                        retryCount: { increment: 1 },
                        lastAttemptAt: new Date(),
                        errorMessage: e.message || 'Retry failed'
                    }
                });
            }
        }
        return { processed: pendingEvents.length, resolved: resolvedCount };
    }
    async logWebhookAudit(shopId, phoneNumberId, eventType, waMessageId, payload, processingStatus, errorMessage) {
        try {
            await this.prisma.webhookAuditLog.create({
                data: {
                    shopId,
                    phoneNumberId,
                    eventType,
                    waMessageId,
                    payload,
                    processingStatus,
                    errorMessage,
                },
            });
        }
        catch (e) {
            this.logger.error(`Failed to log webhook audit: ${e.message}`);
        }
    }
    async getBusinessProfile(shopId) {
        try {
            const creds = await this.getCredentials(shopId);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            const phoneDetails = await this.prisma.whatsAppPhoneNumber.findUnique({
                where: { phoneNumberId: creds.phoneNumberId }
            });
            return {
                ...(response.data.data?.[0] || {}),
                phoneDetails: {
                    nameStatus: phoneDetails?.nameStatus || 'NONE',
                    pendingName: phoneDetails?.pendingName || null,
                    verifiedName: phoneDetails?.verifiedName || null
                }
            };
        }
        catch (error) {
            const metaMsg = error.response?.data?.error?.message || error.message || 'Failed to fetch business profile';
            this.logger.error(`Failed to fetch business profile for shop ${shopId}: ${metaMsg}`);
            throw new common_1.BadRequestException(`WhatsApp Profile Error: ${metaMsg}`);
        }
    }
    async updateBusinessProfile(shopId, data) {
        const creds = await this.getCredentials(shopId);
        try {
            const payload = {
                messaging_product: 'whatsapp',
            };
            if (data.about !== undefined && data.about !== '')
                payload.about = data.about;
            else if (data.description !== undefined && data.description !== '')
                payload.about = data.description;
            if (data.address !== undefined && data.address !== '')
                payload.address = data.address;
            if (data.email !== undefined && data.email !== '')
                payload.email = data.email;
            if (Array.isArray(data.websites) && data.websites.length > 0)
                payload.websites = data.websites;
            if (data.vertical !== undefined && data.vertical !== '')
                payload.vertical = data.vertical;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile`, payload, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            return response.data;
        }
        catch (error) {
            const metaMsg = error.response?.data?.error?.message || error.message || 'Failed to update profile';
            this.logger.error(`Failed to update business profile: ${metaMsg}`);
            const { HttpException, HttpStatus } = require('@nestjs/common');
            throw new HttpException(metaMsg, HttpStatus.BAD_REQUEST);
        }
    }
    async uploadProfilePicture(shopId, file) {
        const creds = await this.getCredentials(shopId);
        try {
            const sessionRes = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/app/uploads?file_length=${file.size}&file_type=${file.mimetype}`, {}, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            const sessionId = sessionRes.data.id;
            const uploadRes = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${sessionId}`, file.buffer, {
                headers: {
                    'Authorization': `OAuth ${creds.accessToken}`,
                    'file_offset': '0',
                    'Content-Type': 'application/octet-stream'
                }
            }));
            const handle = uploadRes.data.h;
            const profileRes = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile`, {
                messaging_product: 'whatsapp',
                profile_picture_handle: handle
            }, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            return profileRes.data;
        }
        catch (error) {
            this.logger.error(`Failed to upload profile picture: ${error.response?.data?.error?.message || error.message}`);
            throw new Error(error.response?.data?.error?.message || 'Failed to upload profile picture');
        }
    }
    async updateDisplayName(shopId, newName) {
        const creds = await this.getCredentials(shopId);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}`, {
                new_display_name: newName
            }, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            await this.prisma.whatsAppPhoneNumber.update({
                where: { phoneNumberId: creds.phoneNumberId },
                data: {
                    nameStatus: 'PENDING',
                    pendingName: newName
                }
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to update display name: ${error.response?.data?.error?.message || error.message}`);
            throw new Error(error.response?.data?.error?.message || 'Failed to request display name change');
        }
    }
    async registerActiveNumber(shopId, customPin) {
        const creds = await this.getCredentials(shopId);
        const url = `${this.graphApiBase}/${creds.phoneNumberId}/register`;
        const pin = customPin || require('crypto').randomInt(100000, 999999).toString();
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                messaging_product: 'whatsapp',
                pin: pin
            }, {
                headers: {
                    Authorization: `Bearer ${creds.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            await this.prisma.whatsAppPhoneNumber.update({
                where: { phoneNumberId: creds.phoneNumberId },
                data: { status: 'active' }
            });
            return { success: true, message: 'Phone number registered successfully', data: response.data };
        }
        catch (error) {
            const detail = error.response?.data || error.message;
            this.logger.error(`Manual registration failed for phone ${creds.phoneNumberId}:`, JSON.stringify(detail));
            throw new common_1.BadRequestException(`Meta registration failed: ${JSON.stringify(detail)}`);
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => flow_engine_service_1.FlowEngineService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => workflow_engine_service_1.WorkflowEngineService))),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => trigger_registry_1.TriggerRegistry))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        crypto_service_1.CryptoService,
        system_config_service_1.SystemConfigService,
        chat_gateway_1.ChatGateway,
        chatbot_service_1.ChatbotService,
        flow_engine_service_1.FlowEngineService,
        workflow_engine_service_1.WorkflowEngineService,
        trigger_registry_1.TriggerRegistry])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map