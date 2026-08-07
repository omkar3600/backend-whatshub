import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/services/crypto.service';
import Groq from 'groq-sdk';

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);

    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) {}

    async getConfig(shopId: string) {
        if (!shopId) return null;
        return this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    }

    async upsertConfig(shopId: string, data: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
        agentMode?: boolean;
        autonomyLevel?: number;
        agentName?: string;
        agentPersonality?: string;
        allowedTools?: any;
        followupEnabled?: boolean;
        hotLeadThreshold?: number;
        maxIterations?: number;
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
    async generateResponse(shopId: string, contactName: string, userMessage: string, conversationId?: string): Promise<{ text?: string, error?: string }> {
        const config = await this.getConfig(shopId);

        if (!config || !config.isActive) {
            return { error: 'Chatbot is not configured or is inactive.' };
        }

        // Determine API key (decrypted shop key or platform fallback)
        let apiKey = '';
        if (config.apiKey) {
            try {
                apiKey = this.crypto.decrypt(config.apiKey);
            } catch {
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
            // Configure Groq client with strict 12s timeout and 1 retry
            const groq = new Groq({ apiKey, timeout: 12000, maxRetries: 1 });
            
            const knowledgeSources = await this.prisma.aiKnowledgeSource.findMany({
                where: { shopId, isActive: true },
                take: 5,
            });

            const systemContext = this.buildSystemPrompt(
                config.systemPrompt,
                config.businessInfo,
                contactName,
                knowledgeSources,
                config.allowedTools
            );

            const messages: any[] = [
                { role: 'system', content: systemContext }
            ];

            // --- Chat Context / History (Bounded to 6 recent turns) ---
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

            // Ensure the latest user message is included as the final user turn
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
                const cleanUserMessage = userMessage.length > 1000 ? userMessage.slice(0, 1000) + '...' : userMessage;
                messages.push({ role: 'user', content: cleanUserMessage });
            }
            // ------------------------------

            const primaryModel = config.model || 'llama-3.3-70b-versatile';
            const fallbackModel = 'llama-3.1-8b-instant';

            // Attempt 1: Primary Model
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
            } catch (primaryErr: any) {
                this.logger.warn(`[Chatbot] Primary model ${primaryModel} failed (${primaryErr.message}). Retrying with fast fallback model ${fallbackModel}...`);
            }

            // Attempt 2: High-speed Fallback Model (llama-3.1-8b-instant)
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
            } catch (fallbackErr: any) {
                this.logger.error(`[Chatbot] Fallback model ${fallbackModel} also failed: ${fallbackErr.message}`);
                return { error: fallbackErr.message || 'Groq AI Service Unavailable' };
            }

            return { error: 'Empty response returned from AI.' };
        } catch (err: any) {
            this.logger.error(`[Chatbot] Groq AI generation failed for shop ${shopId}: ${err.message}`);
            return { error: err.message || 'Unknown API Error' };
        }
    }

    private buildSystemPrompt(
        systemPrompt: string | null,
        businessInfo: string | null,
        contactName: string,
        knowledgeSources: any[] = [],
        allowedTools: any = null
    ): string {
        const parts: string[] = [];

        parts.push(`[SYSTEM BEHAVIOR AND PERSONA]`);
        if (systemPrompt && systemPrompt.trim()) {
            parts.push(systemPrompt.trim().slice(0, 3000));
        } else {
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

        parts.push(`\n[CRITICAL INSTRUCTIONS]`);
        parts.push(`1. You must answer the customer's questions strictly using the facts inside [DETAILED BUSINESS PROFILE & RULES], [CUSTOM ACTIONS & AUTOMATED INTENT RULES], and [ATTACHED BUSINESS RESOURCES & KNOWLEDGE ARTICLES] provided above.`);
        parts.push(`2. If the customer asks a question or makes a request that is NOT covered by the business info, custom actions, or resources, politely state that you do not have that information and a human agent will assist them shortly.`);
        parts.push(`3. When a customer's intent matches a [CUSTOM ACTION], execute the corresponding action instructions immediately.`);
        parts.push(`4. Do NOT invent, assume, or hallucinate any prices, rules, features, or policies.`);
        parts.push(`5. Always maintain the persona defined in [SYSTEM BEHAVIOR AND PERSONA].`);

        return parts.join('\n');
    }

    async toggleAiPause(shopId: string, conversationId: string, paused: boolean) {
        return this.prisma.conversation.updateMany({
            where: { id: conversationId, shopId },
            data: { aiPaused: paused },
        });
    }
}
