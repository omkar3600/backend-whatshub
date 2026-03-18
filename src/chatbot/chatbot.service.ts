import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

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
            const groq = new Groq({ apiKey: config.apiKey });
            
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
        } catch (err: any) {
            this.logger.error(`[Chatbot] Groq AI generation failed for shop ${shopId}: ${err.message}`);
            return { error: err.message || 'Unknown API Error' };
        }
    }

    private buildSystemPrompt(systemPrompt: string | null, businessInfo: string | null, contactName: string): string {
        const parts: string[] = [];

        parts.push(`[SYSTEM BEHAVIOR AND PERSONA]`);
        if (systemPrompt && systemPrompt.trim()) {
            parts.push(systemPrompt.trim());
        } else {
            parts.push('You are a helpful business assistant. Answer customer queries politely and professionally.');
        }

        parts.push(`\n[CURRENT CONVERSATION CONTEXT]`);
        parts.push(`The customer you are speaking to right now is named: ${contactName}.`);

        if (businessInfo && businessInfo.trim()) {
            parts.push(`\n[BUSINESS KNOWLEDGE BASE]`);
            parts.push(businessInfo.trim());
            parts.push(`\n[CRITICAL INSTRUCTIONS]`);
            parts.push(`1. You must answer the customer's questions strictly using the facts inside the [BUSINESS KNOWLEDGE BASE] provided above.`);
            parts.push(`2. If the customer asks a question or makes a request that is NOT covered by the [BUSINESS KNOWLEDGE BASE], you must politely state that you do not have that information and a human agent will assist them shortly.`);
            parts.push(`3. Do NOT invent, assume, or hallucinate any prices, rules, features, or policies.`);
            parts.push(`4. Always maintain the personality defined in the [SYSTEM BEHAVIOR AND PERSONA] section.`);
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
