import { Injectable, Logger, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
import { firstValueFrom } from 'rxjs';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FlowEngineService } from '../flows/flow-engine.service';

interface WhatsAppCredentials {
    shopId: string;
    phoneNumberId: string;
    accessToken: string; // Decrypted
    businessAccountId: string;
    wabaId: string;
}

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly graphApiBase = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v18.0'}`;

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private cryptoService: CryptoService,
        private chatGateway: ChatGateway,
        private chatbotService: ChatbotService,
        @Inject(forwardRef(() => FlowEngineService))
        private flowEngineService: FlowEngineService,
    ) { }

    /**
     * Get decrypted credentials for a shop.
     * Tries the new WhatsAppBusinessAccount model first,
     * falls back to legacy WhatsAppCredential-style env vars for backward compat.
     */
    async getCredentials(shopId: string): Promise<WhatsAppCredentials> {
        // Try new multi-tenant model first
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
                // Account exists but no active default phone — try any active phone
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

    /**
     * Get credentials by phone number ID — used for webhook routing.
     */
    async getCredentialsByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppCredentials | null> {
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

    /**
     * Look up shopId from a WABA ID (businessAccountId or wabaId).
     */
    async getShopByWabaId(wabaId: string): Promise<string | null> {
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

    async verifyWebhook(mode: string, token: string, challenge: string) {
        if (mode !== 'subscribe') return null;

        const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
        if (WEBHOOK_VERIFY_TOKEN && token === WEBHOOK_VERIFY_TOKEN) {
            this.logger.log('Webhook verified successfully.');
            return challenge;
        }

        // Check per-shop tokens
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { webhookVerifyToken: token },
        });
        if (account) {
            this.logger.log(`Webhook verified for shop ${account.shopId}`);
            return challenge;
        }

        return null;
    }

    async processWebhookEvent(body: any) {
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                const wabaId = entry.id;

                // Look up shop via the new multi-tenant model
                const shopId = await this.getShopByWabaId(wabaId);

                if (!shopId) {
                    this.logger.warn(`Received webhook for unknown WABA ID: ${wabaId}`);

                    // Log to audit
                    await this.logWebhookAudit(null, null, 'unknown_waba', null, body, 'failed', `Unknown WABA ID: ${wabaId}`);
                    continue;
                }

                for (const change of entry.changes || []) {
                    const value = change.value;
                    const phoneNumberId = value?.metadata?.phone_number_id;

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
                    } catch (error) {
                        this.logger.error(`Error processing webhook for shop ${shopId}: ${error.message}`);
                        await this.logWebhookAudit(shopId, phoneNumberId, 'error', null, value, 'failed', error.message);

                        // Store in dead letter for retry
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

    private async handlePhoneNumberNameUpdate(shopId: string, wabaAccountId: string, value: any) {
        const { display_phone_number, decision, requested_verified_name, rejection_reason } = value;
        this.logger.log(`[Webhook] Name update for ${display_phone_number}: ${decision}`);

        // Note: Meta passes display_phone_number, which may not have the + sign.
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

            // Re-register the phone number to apply the change
            try {
                const creds = await this.getCredentialsByPhoneNumberId(phone.phoneNumberId);
                if (creds) {
                    await firstValueFrom(
                        this.httpService.post(`${this.graphApiBase}/${phone.phoneNumberId}/register`, {
                            messaging_product: 'whatsapp',
                            pin: require('crypto').randomInt(100000, 999999).toString()
                        }, {
                            headers: { Authorization: `Bearer ${creds.accessToken}` }
                        })
                    );
                    this.logger.log(`Successfully re-registered phone ${phone.phoneNumberId} with new name.`);
                }
            } catch (err: any) {
                this.logger.error(`Failed to auto-register phone after name approval: ${err.message}`);
            }
        } else if (decision === 'REJECTED') {
            await this.prisma.whatsAppPhoneNumber.update({
                where: { id: phone.id },
                data: {
                    nameStatus: 'REJECTED'
                }
            });
            this.logger.warn(`Name change rejected: ${rejection_reason}`);
        }
    }

    private async handleTemplateStatusUpdate(shopId: string, value: any) {
        const { event, message_template_id, message_template_name, message_template_language, reason } = value;
        this.logger.log(`[Webhook] Template status update for shop ${shopId}: ${message_template_name} -> ${event}`);

        let status = 'pending';
        if (event === 'APPROVED') status = 'approved';
        else if (event === 'REJECTED') status = 'rejected';
        else if (event === 'PENDING') status = 'pending';

        await this.prisma.template.updateMany({
            where: {
                shopId,
                templateName: message_template_name,
                language: message_template_language
            },
            data: { status }
        });
    }

    private async handleIncomingMessage(shopId: string, phoneNumberId: string | undefined, contactData: any, messageData: any) {
        // 1. Upsert Contact
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

        // 2. Upsert Conversation
        const conversation = await this.prisma.conversation.upsert({
            where: {
                shopId_contactId: { shopId, contactId: contact.id },
            },
            update: {
                lastMessageAt: new Date(),
                unreadCount: { increment: 1 },
                phoneNumberId: phoneNumberId || undefined,
            },
            create: {
                shopId,
                contactId: contact.id,
                phoneNumberId: phoneNumberId || undefined,
                lastMessageAt: new Date(),
                unreadCount: 1,
            },
        });

        // 3. Extract content and media URL based on message type
        let content = '';
        let mediaUrl: string | undefined;
        const msgType = messageData.type;

        if (msgType === 'text') {
            content = messageData.text?.body || '';
        } else if (['image', 'video', 'audio', 'document', 'sticker'].includes(msgType)) {
            const mediaObj = messageData[msgType];
            content = mediaObj?.caption || mediaObj?.filename || '';
            if (mediaObj?.id) {
                try {
                    const creds = await this.getCredentials(shopId);
                    const metaResp = await firstValueFrom(
                        this.httpService.get(
                            `${this.graphApiBase}/${mediaObj.id}`,
                            { headers: { Authorization: `Bearer ${creds.accessToken}` } }
                        )
                    );
                    const mediaDlUrl: string = metaResp.data.url;
                    const fileResp = await firstValueFrom(
                        this.httpService.get(mediaDlUrl, {
                            headers: { Authorization: `Bearer ${creds.accessToken}` },
                            responseType: 'arraybuffer',
                        })
                    );
                    // Upload to Supabase Storage
                    const dbUrlMatch = (process.env.DATABASE_URL || '').match(/postgres\.([a-z]+):/);
                    const projectRef = process.env.SUPABASE_PROJECT_REF || (dbUrlMatch ? dbUrlMatch[1] : '');
                    const supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
                    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
                    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
                    const ext = mediaObj.mime_type ? '.' + mediaObj.mime_type.split('/')[1].split(';')[0] : '';
                    const fileName = `incoming/${shopId}/${mediaObj.id}${ext}`;
                    const mimeType = mediaObj.mime_type || 'application/octet-stream';

                    await firstValueFrom(
                        this.httpService.post(
                            `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
                            Buffer.from(fileResp.data),
                            {
                                headers: {
                                    Authorization: `Bearer ${supabaseKey}`,
                                    apikey: supabaseKey,
                                    'Content-Type': mimeType,
                                    'x-upsert': 'true',
                                },
                                maxBodyLength: 50 * 1024 * 1024,
                                maxContentLength: 50 * 1024 * 1024,
                            }
                        )
                    );
                    mediaUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
                } catch (mediaErr: any) {
                    this.logger.error(`[Media] Failed to download media ${mediaObj?.id}: ${mediaErr?.message}`);
                    mediaUrl = undefined;
                }
            }
        } else if (msgType === 'location') {
            const loc = messageData.location;
            content = `📍 Location: ${loc?.name || ''} ${loc?.address || ''} (${loc?.latitude}, ${loc?.longitude})`;
        } else if (msgType === 'button') {
            content = messageData.button?.text || '';
        } else if (msgType === 'interactive') {
            const ia = messageData.interactive;
            if (ia?.button_reply) content = ia.button_reply.title;
            else if (ia?.list_reply) content = ia.list_reply.title;
            else content = JSON.stringify(ia);
        } else {
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

        // Notify frontend via Socket.io
        this.chatGateway.notifyNewMessage(shopId, {
            ...savedMsg,
            conversationId: conversation.id,
            contact: {
                name: contact.name,
                phone: contact.phone,
            },
        });

        // --- Smart Automations ---
        let automationFired = false;
        if (messageData.type === 'text') {
            const incomingText = messageData.text.body.trim().toLowerCase();
            const automations = await this.prisma.automation.findMany({
                where: { shopId, isActive: true }
            });
            this.logger.log(`[Automation] ${automations.length} active automation(s). Incoming: "${incomingText}"`);

            for (const auto of automations) {
                const keyword = auto.triggerKeyword?.toLowerCase().trim();
                if (!keyword) continue;
                if (incomingText.includes(keyword) || keyword === incomingText) {
                    this.logger.log(`[Automation] MATCH! Keyword="${keyword}" → sending reply to ${contactData.wa_id}`);
                    try {
                        await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', auto.replyText);
                        this.logger.log(`[Automation] Reply sent successfully to ${contactData.wa_id}`);

                        const savedAutoMsg = await this.prisma.message.create({
                            data: {
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
                    } catch (sendErr: unknown) {
                        const axiosErr = sendErr as any;
                        const detail = axiosErr?.response?.data
                            ? JSON.stringify(axiosErr.response.data)
                            : sendErr instanceof Error ? sendErr.message : String(sendErr);
                        this.logger.error(`[Automation] FAILED to send reply: ${detail}`);
                    }
                    break;
                }
            }
        }

        // --- Flows ---
        let flowFired = false;
        if (!automationFired && messageData.type === 'text') {
            flowFired = await this.flowEngineService.processIncomingMessage(shopId, contact.phone, messageData.text.body);
            if (flowFired) {
                this.logger.log(`[Flow] Flow triggered/continued for ${contact.phone}`);
            }
        }

        // --- AI Chatbot ---
        if (!automationFired && !flowFired && messageData.type === 'text') {
            const conv = await this.prisma.conversation.findUnique({
                where: { id: conversation.id },
                select: { aiPaused: true },
            });
            if (!conv?.aiPaused) {
                const aiReply = await this.chatbotService.generateResponse(
                    shopId,
                    contact.name,
                    messageData.text.body,
                    conversation.id,
                );
                if (aiReply.text) {
                    this.logger.log(`[Chatbot] Sending AI reply to ${contactData.wa_id}`);
                    await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', aiReply.text);

                    const savedAiMsg = await this.prisma.message.create({
                        data: {
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

                } else if (aiReply.error) {
                    this.logger.error(`[Chatbot] Failed to generate AI reply for ${contactData.wa_id}: ${aiReply.error}`);
                }
            } else {
                this.logger.log(`[Chatbot] AI paused for conversation ${conversation.id} — skipping.`);
            }
        }
    }

    private async handleMessageStatus(shopId: string, statusData: any) {
        const { id: messageId, status, recipient_id: recipientPhone } = statusData;

        try {
            await this.prisma.message.update({
                where: { id: messageId },
                data: { status },
            });
        } catch (e) {
            this.logger.warn(`Status update failed for message ${messageId}. It might not exist.`);
        }

        if (['delivered', 'read', 'sent'].includes(status)) {
            try {
                const statusRank: Record<string, number> = { pending: 0, sent: 1, delivered: 2, read: 3, clicked: 4 };
                const incomingRank = statusRank[status] ?? 0;

                const existing = await this.prisma.campaignContact.findFirst({
                    where: { wamid: messageId },
                });

                if (existing) {
                    const existingRank = statusRank[existing.status] ?? 0;
                    if (incomingRank > existingRank) {
                        await this.prisma.campaignContact.update({
                            where: { id: existing.id },
                            data: { status },
                        });
                        this.logger.log(`[Campaign] Updated CampaignContact wamid:${messageId} → ${status}`);
                    }
                }
            } catch (e) {
                this.logger.warn(`Failed to update CampaignContact for wamid ${messageId}: ${e}`);
            }
        }
    }

    async sendOutboundMessage(shopId: string, toPhone: string, type: string, content: any, mediaUrl?: string) {
        const creds = await this.getCredentials(shopId);

        const payload: any = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhone,
            type: type,
        };

        if (type === 'text') {
            payload.text = { preview_url: false, body: content };
        } else if (['image', 'document', 'video', 'audio'].includes(type) && mediaUrl) {
            payload[type] = { link: mediaUrl };
        } else if (type === 'interactive') {
            const config = content.config || {};
            payload.type = 'interactive';
            payload.interactive = {
                type: 'button',
                body: { text: content.text || content.body || '' },
                action: {
                    buttons: (config.buttons || []).map((btn: any, idx: number) => ({
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
        } else if (type === 'template') {
            const templateName = typeof content === 'string' ? content : content.name;
            const templateLanguage = (typeof content !== 'string' && content.language) ? content.language : 'en_US';
            payload.template = {
                name: templateName,
                language: { code: templateLanguage }
            };
            if (typeof content !== 'string' && content.components) {
                payload.template.components = content.components;
            }
        }

        const url = `${this.graphApiBase}/${creds.phoneNumberId}/messages`;

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${creds.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            );
            return response.data;
        } catch (error: unknown) {
            const axiosErr = error as any;
            const detail = axiosErr?.response?.data || (error instanceof Error ? error.message : String(error));
            this.logger.error('Error sending WhatsApp message', detail);
            throw error;
        }
    }

    // ─── Audit Logging ─────────────────────────────────────────────────────

    private async logWebhookAudit(
        shopId: string | null,
        phoneNumberId: string | null,
        eventType: string,
        waMessageId: string | null,
        payload: any,
        processingStatus: string,
        errorMessage?: string,
    ): Promise<void> {
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
        } catch (e) {
            this.logger.error(`Failed to log webhook audit: ${e.message}`);
        }
    }

    // --- Business Profile Settings ---

    async getBusinessProfile(shopId: string) {
        const creds = await this.getCredentials(shopId);
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );

            // Get the internal phone details for Name Tracking
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
        } catch (error: any) {
            this.logger.error(`Failed to fetch business profile: ${error.response?.data?.error?.message || error.message}`);
            throw error;
        }
    }

    async updateBusinessProfile(shopId: string, data: any) {
        const creds = await this.getCredentials(shopId);
        try {
            const payload: any = {
                messaging_product: 'whatsapp',
                about: data.about,
                address: data.address,
                description: data.description,
                email: data.email,
                websites: data.websites,
                vertical: data.vertical
            };
            
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            const response = await firstValueFrom(
                this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile`, payload, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to update business profile: ${error.response?.data?.error?.message || error.message}`);
            throw error;
        }
    }

    async uploadProfilePicture(shopId: string, file: any) {
        const creds = await this.getCredentials(shopId);
        try {
            // Step 1: Create resumable upload session
            const sessionRes = await firstValueFrom(
                this.httpService.post(`${this.graphApiBase}/app/uploads?file_length=${file.size}&file_type=${file.mimetype}`, {}, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );
            const sessionId = sessionRes.data.id;

            // Step 2: Upload file bytes
            const uploadRes = await firstValueFrom(
                this.httpService.post(`${this.graphApiBase}/${sessionId}`, file.buffer, {
                    headers: {
                        'Authorization': `OAuth ${creds.accessToken}`,
                        'file_offset': '0',
                        'Content-Type': 'application/octet-stream'
                    }
                })
            );
            const handle = uploadRes.data.h;

            // Step 3: Update Profile
            const profileRes = await firstValueFrom(
                this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}/whatsapp_business_profile`, {
                    messaging_product: 'whatsapp',
                    profile_picture_handle: handle
                }, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );
            return profileRes.data;
        } catch (error: any) {
            this.logger.error(`Failed to upload profile picture: ${error.response?.data?.error?.message || error.message}`);
            throw new Error(error.response?.data?.error?.message || 'Failed to upload profile picture');
        }
    }

    async updateDisplayName(shopId: string, newName: string) {
        const creds = await this.getCredentials(shopId);
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.graphApiBase}/${creds.phoneNumberId}`, {
                    new_display_name: newName
                }, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );

            // Update database to track the pending state
            await this.prisma.whatsAppPhoneNumber.update({
                where: { phoneNumberId: creds.phoneNumberId },
                data: {
                    nameStatus: 'PENDING',
                    pendingName: newName
                }
            });

            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to update display name: ${error.response?.data?.error?.message || error.message}`);
            throw new Error(error.response?.data?.error?.message || 'Failed to request display name change');
        }
    }

    async registerActiveNumber(shopId: string, customPin?: string) {
        const creds = await this.getCredentials(shopId);
        const url = `${this.graphApiBase}/${creds.phoneNumberId}/register`;
        const pin = customPin || require('crypto').randomInt(100000, 999999).toString();

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, {
                    messaging_product: 'whatsapp',
                    pin: pin
                }, {
                    headers: {
                        Authorization: `Bearer ${creds.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            );

            await this.prisma.whatsAppPhoneNumber.update({
                where: { phoneNumberId: creds.phoneNumberId },
                data: { status: 'active' }
            });

            return { success: true, message: 'Phone number registered successfully', data: response.data };
        } catch (error: any) {
            const detail = error.response?.data || error.message;
            this.logger.error(`Manual registration failed for phone ${creds.phoneNumberId}:`, JSON.stringify(detail));
            throw new BadRequestException(`Meta registration failed: ${JSON.stringify(detail)}`);
        }
    }
}
