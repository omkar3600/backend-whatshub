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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ChatbotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../common/services/crypto.service");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let ChatbotService = ChatbotService_1 = class ChatbotService {
    prisma;
    crypto;
    logger = new common_1.Logger(ChatbotService_1.name);
    constructor(prisma, crypto) {
        this.prisma = prisma;
        this.crypto = crypto;
    }
    async getConfig(shopId) {
        if (!shopId)
            return null;
        return this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    }
    async upsertConfig(shopId, data) {
        return this.prisma.chatbotConfig.upsert({
            where: { shopId },
            update: data,
            create: { shopId, ...data },
        });
    }
    async generateResponse(shopId, contactName, userMessage, conversationId) {
        const config = await this.getConfig(shopId);
        if (!config || !config.isActive) {
            return { error: 'Chatbot is not configured or is inactive.' };
        }
        let apiKey = '';
        if (config.apiKey) {
            try {
                apiKey = this.crypto.decrypt(config.apiKey);
            }
            catch {
                apiKey = config.apiKey;
            }
        }
        if (!apiKey) {
            const sysKey = await this.prisma.systemConfig.findUnique({ where: { key: 'GROQ_API_KEY' } });
            apiKey = sysKey?.value || process.env.GROQ_API_KEY || '';
        }
        if (!apiKey) {
            return { error: 'No Groq API key configured. Please set your API key in Chatbot settings.' };
        }
        try {
            const groq = new groq_sdk_1.default({ apiKey, timeout: 12000, maxRetries: 1 });
            const knowledgeSources = await this.prisma.aiKnowledgeSource.findMany({
                where: { shopId, isActive: true },
                take: 5,
            });
            const systemContext = this.buildSystemPrompt(config.systemPrompt, config.businessInfo, contactName, knowledgeSources, config.allowedTools);
            const messages = [
                { role: 'system', content: systemContext }
            ];
            if (conversationId) {
                const history = await this.prisma.message.findMany({
                    where: { conversationId },
                    orderBy: { timestamp: 'desc' },
                    take: 6,
                });
                const sortedHistory = history.reverse();
                for (const msg of sortedHistory) {
                    if (msg.content) {
                        const content = msg.content.length > 400 ? msg.content.slice(0, 400) + '...' : msg.content;
                        messages.push({
                            role: msg.direction === 'inbound' ? 'user' : 'assistant',
                            content
                        });
                    }
                }
            }
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
                const cleanUserMessage = userMessage.length > 1000 ? userMessage.slice(0, 1000) + '...' : userMessage;
                messages.push({ role: 'user', content: cleanUserMessage });
            }
            const primaryModel = config.model || 'llama-3.3-70b-versatile';
            const fallbackModel = 'llama-3.1-8b-instant';
            try {
                const completion = await groq.chat.completions.create({
                    messages,
                    model: primaryModel,
                    temperature: config.temperature ?? 0.7,
                    max_tokens: 1024,
                });
                const replyText = completion.choices[0]?.message?.content?.trim();
                if (replyText) {
                    return { text: replyText };
                }
            }
            catch (primaryErr) {
                this.logger.warn(`[Chatbot] Primary model ${primaryModel} failed (${primaryErr.message}). Retrying with fast fallback model ${fallbackModel}...`);
            }
            try {
                const fallbackCompletion = await groq.chat.completions.create({
                    messages,
                    model: fallbackModel,
                    temperature: config.temperature ?? 0.7,
                    max_tokens: 1024,
                });
                const fallbackReply = fallbackCompletion.choices[0]?.message?.content?.trim();
                if (fallbackReply) {
                    return { text: fallbackReply };
                }
            }
            catch (fallbackErr) {
                this.logger.error(`[Chatbot] Fallback model ${fallbackModel} also failed: ${fallbackErr.message}`);
                return { error: fallbackErr.message || 'Groq AI Service Unavailable' };
            }
            return { error: 'Empty response returned from AI.' };
        }
        catch (err) {
            this.logger.error(`[Chatbot] Groq AI generation failed for shop ${shopId}: ${err.message}`);
            return { error: err.message || 'Unknown API Error' };
        }
    }
    buildSystemPrompt(systemPrompt, businessInfo, contactName, knowledgeSources = [], allowedTools = null) {
        const parts = [];
        parts.push(`[CORE PERSONA & CHATBOT BEHAVIOR - MANDATORY OVERRIDE]`);
        if (systemPrompt && systemPrompt.trim()) {
            parts.push(systemPrompt.trim().slice(0, 3000));
        }
        else {
            parts.push('You are a helpful business assistant. Answer customer queries politely and professionally.');
        }
        parts.push(`\n[CURRENT CONVERSATION CONTEXT]`);
        parts.push(`The customer you are speaking to right now is named: ${contactName}.`);
        if (businessInfo && businessInfo.trim()) {
            const truncatedInfo = businessInfo.trim().length > 4000
                ? businessInfo.trim().slice(0, 4000) + '... (truncated)'
                : businessInfo.trim();
            parts.push(`\n[DETAILED BUSINESS PROFILE & RULES]`);
            parts.push(truncatedInfo);
        }
        if (allowedTools && Array.isArray(allowedTools.customActions) && allowedTools.customActions.length > 0) {
            parts.push(`\n[CUSTOM ACTIONS & AUTOMATED INTENT RULES]`);
            for (const ca of allowedTools.customActions.slice(0, 10)) {
                if (ca.enabled !== false && ca.name && ca.trigger) {
                    parts.push(`• ACTION NAME: "${ca.name}"`);
                    parts.push(`  WHEN CUSTOMER INTENT MATCHES: ${ca.trigger}`);
                    parts.push(`  RESPONSE / INSTRUCTION TO EXECUTE: ${ca.response}`);
                }
            }
        }
        if (knowledgeSources && knowledgeSources.length > 0) {
            parts.push(`\n[ATTACHED BUSINESS RESOURCES & KNOWLEDGE ARTICLES]`);
            for (const ks of knowledgeSources.slice(0, 3)) {
                parts.push(`--- ${ks.title} (${ks.category || 'General'}) ---`);
                const content = (ks.content || '').slice(0, 1200);
                parts.push(content);
            }
        }
        parts.push(`\n[CRITICAL FINAL OUTPUT INSTRUCTIONS - MUST OBEY]`);
        parts.push(`1. PERSONA & FORMATTING: Strictly adopt the exact tone, language, emojis, line breaks, and paragraph structure specified under [CORE PERSONA & CHATBOT BEHAVIOR - MANDATORY OVERRIDE].`);
        parts.push(`2. LINE BREAKS & PARAGRAPHS: Do NOT write response as one long continuous paragraph if new lines or line spacing were requested. Use clear line breaks (new lines) to separate thoughts into short, readable WhatsApp-style lines.`);
        parts.push(`3. MEDIA & UNKNOWN INFO: If the customer asks for photos, media, or info not in the business profile, state that our team will respond shortly.`);
        parts.push(`4. FACTUAL ACCURACY: Answer strictly using facts inside business profile, custom actions, and knowledge articles. Do NOT invent prices or rules.`);
        parts.push(`5. CUSTOM ACTIONS: When customer intent matches a [CUSTOM ACTION], execute that action's instructions immediately.`);
        return parts.join('\n');
    }
    async toggleAiPause(shopId, conversationId, paused) {
        return this.prisma.conversation.updateMany({
            where: { id: conversationId, shopId },
            data: { aiPaused: paused },
        });
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = ChatbotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map