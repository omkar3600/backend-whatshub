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
            // Dynamically query Google's API to ensure we only select a model this specific API key actually has access to
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`);
            const data = await response.json() as any;
            
            if (!data.models) {
                this.logger.error(`[Chatbot] Failed to fetch models: ${JSON.stringify(data)}`);
                return { error: data.error?.message || 'Invalid API Key or unauthorized' };
            }

            // Filter out models that don't support standard text generation
            const textModels = data.models.filter((m: any) => 
                m.supportedGenerationMethods?.includes('generateContent') && 
                !m.name.includes('vision') && 
                !m.name.includes('embedding') &&
                !m.name.includes('test')
            );
            
            const modelNames = textModels.map((m: any) => m.name.replace('models/', ''));

            // Preference order for standard robust generation
            let selectedModel = '';
            if (modelNames.includes('gemini-1.5-flash')) selectedModel = 'gemini-1.5-flash';
            else if (modelNames.includes('gemini-1.5-pro')) selectedModel = 'gemini-1.5-pro';
            else if (modelNames.includes('gemini-2.0-flash')) selectedModel = 'gemini-2.0-flash';
            else if (modelNames.includes('gemini-pro')) selectedModel = 'gemini-pro';
            else if (modelNames.length > 0) selectedModel = modelNames[0];

            if (!selectedModel) {
                return { error: 'Your API key does not have access to any text generation models on the v1beta endpoint.' };
            }

            this.logger.log(`[Chatbot] Using dynamically verified model: ${selectedModel}`);

            const genAI = new GoogleGenerativeAI(config.apiKey);
            const model = genAI.getGenerativeModel({
                model: selectedModel,
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
