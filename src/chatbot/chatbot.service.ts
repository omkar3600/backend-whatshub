import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);

    constructor(private prisma: PrismaService) {}

    async getConfig(shopId: string) {
        return this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    }

    async upsertConfig(shopId: string, data: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
    }) {
        return this.prisma.chatbotConfig.upsert({
            where: { shopId },
            update: data,
            create: { shopId, ...data },
        });
    }

    /**
     * Generate an AI reply for an incoming message.
     * Returns the text reply or an error message.
     */
    async generateResponse(shopId: string, contactName: string, userMessage: string): Promise<{ text?: string, error?: string }> {
        const config = await this.getConfig(shopId);

        if (!config || !config.isActive || !config.apiKey) {
            return { error: 'Chatbot is not configured or is inactive.' };
        }

        try {
            const genAI = new GoogleGenerativeAI(config.apiKey);
            // hardcode to gemini-pro to ensure older API keys don't hit a 404
            const model = genAI.getGenerativeModel({
                model: 'gemini-pro',
                generationConfig: {
                    temperature: config.temperature ?? 0.7,
                }
            });

            // Since gemini-pro does not support systemInstruction, we prepend the context to the user's message
            const systemContext = this.buildSystemPrompt(config.systemPrompt, config.businessInfo, contactName);
            const fullPrompt = `${systemContext}\n\nCustomer says: ${userMessage}`;
            
            const result = await model.generateContent(fullPrompt);
            return { text: result.response.text() };
        } catch (err: any) {
            this.logger.error(`[Chatbot] AI generation failed for shop ${shopId}: ${err.message}`);
            return { error: err.message || 'Unknown API Error' };
        }
    }

    private buildSystemPrompt(systemPrompt: string | null, businessInfo: string | null, contactName: string): string {
        const parts: string[] = [];

        if (systemPrompt) {
            parts.push(systemPrompt);
        } else {
            parts.push('You are a helpful business assistant. Answer customer queries politely and professionally.');
        }

        parts.push(`\nThe customer you are talking to is named: ${contactName}.`);

        if (businessInfo) {
            parts.push(`\n--- BUSINESS INFORMATION ---\n${businessInfo}\n--- END OF BUSINESS INFORMATION ---`);
            parts.push('\nUse ONLY the Business Information above to answer customer queries. If you do not know the answer from the provided information, politely say you will check and get back to them.');
        }

        return parts.join('\n');
    }

    async toggleAiPause(shopId: string, conversationId: string, paused: boolean) {
        return this.prisma.conversation.updateMany({
            where: { id: conversationId, shopId },
            data: { aiPaused: paused },
        });
    }
}
