import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FlowEngineService } from '../flows/flow-engine.service';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private chatGateway: ChatGateway,
        private chatbotService: ChatbotService,
        @Inject(forwardRef(() => FlowEngineService))
        private flowEngineService: FlowEngineService,
    ) { }

    async verifyWebhook(mode: string, token: string, challenge: string, shopId?: string) {
        if (mode !== 'subscribe') return null;

        // If shopId is provided, check their specific token
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

    async processWebhookEvent(body: any) {
        // Determine event type: message received, message status, etc.
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                // Attempt to find the shop matching this WhatsApp account ID
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

    private async handleTemplateStatusUpdate(shopId: string, value: any) {
        const { event, message_template_id, message_template_name, message_template_language, reason } = value;
        this.logger.log(`[Webhook] Template status update for shop ${shopId}: ${message_template_name} -> ${event}`);

        // Map Meta status to our local status
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

    private async handleIncomingMessage(shopId: string, contactData: any, messageData: any) {
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
            },
            create: {
                shopId,
                contactId: contact.id,
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
            // Fetch the real download URL from Meta API
            if (mediaObj?.id) {
                try {
                    const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
                    if (creds) {
                        const metaResp = await firstValueFrom(
                            this.httpService.get(
                                `https://graph.facebook.com/v18.0/${mediaObj.id}`,
                                { headers: { Authorization: `Bearer ${creds.accessToken}` } }
                            )
                        );
                        const mediaDlUrl: string = metaResp.data.url;
                        // Download the actual file bytes from the temporary signed URL
                        const fileResp = await firstValueFrom(
                            this.httpService.get(mediaDlUrl, {
                                headers: { Authorization: `Bearer ${creds.accessToken}` },
                                responseType: 'arraybuffer',
                            })
                        );
                        // Save to local uploads folder
                        const fs = await import('fs');
                        const path = await import('path');
                        const uploadsDir = path.join(process.cwd(), 'uploads');
                        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                        const ext = mediaObj.mime_type ? '.' + mediaObj.mime_type.split('/')[1].split(';')[0] : '';
                        const fileName = `incoming-${mediaObj.id}${ext}`;
                        fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(fileResp.data));
                        mediaUrl = `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`}/uploads/${fileName}`;
                    }
                } catch (mediaErr: any) {
                    this.logger.error(`[Media] Failed to download media ${mediaObj?.id}: ${mediaErr?.message}`);
                    // Fall back to using the Meta media ID as reference
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

        const savedMsg = await this.prisma.message.create({
            data: {
                id: messageData.id, // Use Meta's message ID
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
                // Use contains matching: trigger if message includes the keyword
                if (incomingText.includes(keyword) || keyword === incomingText) {
                    this.logger.log(`[Automation] MATCH! Keyword="${keyword}" → sending reply to ${contactData.wa_id}`);
                    try {
                        await this.sendOutboundMessage(shopId, contactData.wa_id, 'text', auto.replyText);
                        this.logger.log(`[Automation] Reply sent successfully to ${contactData.wa_id}`);
                        
                        // --- Save and Notify ---
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

                        // Update conversation lastMessageAt
                        await this.prisma.conversation.update({
                            where: { id: conversation.id },
                            data: { lastMessageAt: new Date() },
                        });
                        // -----------------------

                        automationFired = true;
                    } catch (sendErr: unknown) {
                        const axiosErr = sendErr as any;
                        const detail = axiosErr?.response?.data
                            ? JSON.stringify(axiosErr.response.data)
                            : sendErr instanceof Error ? sendErr.message : String(sendErr);
                        this.logger.error(`[Automation] FAILED to send reply: ${detail}`);
                    }
                    break; // Only fire the first matching automation
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

        // --- AI Chatbot (only if no automation fired and no flow fired and AI not paused) ---
        if (!automationFired && !flowFired && messageData.type === 'text') {
            // Check if this conversation has AI paused
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
                    
                    // --- Save and Notify ---
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

                    // Update conversation lastMessageAt
                    await this.prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { lastMessageAt: new Date() },
                    });
                    // -----------------------

                } else if (aiReply.error) {
                    this.logger.error(`[Chatbot] Failed to generate AI reply for ${contactData.wa_id}: ${aiReply.error}`);
                }
            } else {
                this.logger.log(`[Chatbot] AI paused for conversation ${conversation.id} — skipping.`);
            }
        }
    }

    private async handleMessageStatus(shopId: string, statusData: any) {
        try {
            await this.prisma.message.update({
                where: { id: statusData.id },
                data: { status: statusData.status },
            });
        } catch (e) {
            this.logger.warn(`Status update failed for message ${statusData.id}. It might not exist.`);
        }
    }

    async sendOutboundMessage(shopId: string, toPhone: string, type: string, content: any, mediaUrl?: string) {
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (!creds) throw new Error('WhatsApp credentials not found for this shop');

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
                type: 'button', // Defaulting to button for now
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
            // Support media header if present
            if (config.mediaType && (config.imageUrl || config.videoUrl)) {
                payload.interactive.header = {
                    type: config.mediaType.toLowerCase() === 'image' ? 'image' : 'video',
                    [config.mediaType.toLowerCase() === 'image' ? 'image' : 'video']: {
                        link: config.imageUrl || config.videoUrl
                    }
                };
            }
        } else if (type === 'template') {
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
}
