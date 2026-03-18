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
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let ChatbotService = ChatbotService_1 = class ChatbotService {
    prisma;
    logger = new common_1.Logger(ChatbotService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig(shopId) {
        return this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    }
    async upsertConfig(shopId, data) {
        return this.prisma.chatbotConfig.upsert({
            where: { shopId },
            update: data,
            create: { shopId, ...data },
        });
    }
    async generateResponse(shopId, contactName, userMessage) {
        const config = await this.getConfig(shopId);
        if (!config || !config.isActive || !config.apiKey) {
            return { error: 'Chatbot is not configured or is inactive.' };
        }
        try {
            const groq = new groq_sdk_1.default({ apiKey: config.apiKey });
            const systemContext = this.buildSystemPrompt(config.systemPrompt, config.businessInfo, contactName);
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemContext },
                    { role: 'user', content: userMessage }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: config.temperature ?? 0.7,
            });
            return { text: completion.choices[0]?.message?.content || '' };
        }
        catch (err) {
            this.logger.error(`[Chatbot] Groq AI generation failed for shop ${shopId}: ${err.message}`);
            return { error: err.message || 'Unknown API Error' };
        }
    }
    buildSystemPrompt(systemPrompt, businessInfo, contactName) {
        const parts = [];
        if (systemPrompt) {
            parts.push(systemPrompt);
        }
        else {
            parts.push('You are a helpful business assistant. Answer customer queries politely and professionally.');
        }
        parts.push(`\nThe customer you are talking to is named: ${contactName}.`);
        if (businessInfo) {
            parts.push(`\n--- BUSINESS INFORMATION ---\n${businessInfo}\n--- END OF BUSINESS INFORMATION ---`);
            parts.push('\nUse ONLY the Business Information above to answer customer queries. If you do not know the answer from the provided information, politely say you will check and get back to them.');
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map