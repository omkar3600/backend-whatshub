import { PrismaService } from '../prisma/prisma.service';
export declare class ChatbotService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        apiKey: string | null;
        model: string;
        temperature: number;
        systemPrompt: string | null;
        businessInfo: string | null;
    } | null>;
    upsertConfig(shopId: string, data: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        apiKey: string | null;
        model: string;
        temperature: number;
        systemPrompt: string | null;
        businessInfo: string | null;
    }>;
    generateResponse(shopId: string, contactName: string, userMessage: string): Promise<{
        text?: string;
        error?: string;
    }>;
    private buildSystemPrompt;
    toggleAiPause(shopId: string, conversationId: string, paused: boolean): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
