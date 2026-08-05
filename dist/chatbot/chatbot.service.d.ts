import { PrismaService } from '../prisma/prisma.service';
export declare class ChatbotService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(shopId: string): Promise<{
        apiKey: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        model: string;
        temperature: number;
        systemPrompt: string | null;
        businessInfo: string | null;
        agentMode: boolean;
        autonomyLevel: number;
        agentName: string | null;
        agentPersonality: string | null;
        allowedTools: import("@prisma/client/runtime/library").JsonValue | null;
        followupEnabled: boolean;
        hotLeadThreshold: number;
        maxIterations: number;
    } | null>;
    upsertConfig(shopId: string, data: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
    }): Promise<{
        apiKey: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        model: string;
        temperature: number;
        systemPrompt: string | null;
        businessInfo: string | null;
        agentMode: boolean;
        autonomyLevel: number;
        agentName: string | null;
        agentPersonality: string | null;
        allowedTools: import("@prisma/client/runtime/library").JsonValue | null;
        followupEnabled: boolean;
        hotLeadThreshold: number;
        maxIterations: number;
    }>;
    generateResponse(shopId: string, contactName: string, userMessage: string, conversationId?: string): Promise<{
        text?: string;
        error?: string;
    }>;
    private buildSystemPrompt;
    toggleAiPause(shopId: string, conversationId: string, paused: boolean): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
