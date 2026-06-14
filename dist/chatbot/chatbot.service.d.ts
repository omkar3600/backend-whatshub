import { PrismaService } from '../prisma/prisma.service';
export declare class ChatbotService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(shopId: string): Promise<any>;
    upsertConfig(shopId: string, data: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
    }): Promise<any>;
    generateResponse(shopId: string, contactName: string, userMessage: string, conversationId?: string): Promise<{
        text?: string;
        error?: string;
    }>;
    private buildSystemPrompt;
    toggleAiPause(shopId: string, conversationId: string, paused: boolean): Promise<any>;
}
