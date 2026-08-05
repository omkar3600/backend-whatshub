import { ChatbotService } from './chatbot.service';
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    getConfig(req: any): Promise<{
        isActive: boolean;
        model: string;
        temperature: number;
        systemPrompt: string;
        businessInfo: string;
        apiKey: string;
        agentMode: boolean;
        autonomyLevel: number;
        agentName: string;
        agentPersonality: string;
        allowedTools: never[];
        followupEnabled: boolean;
        hotLeadThreshold: number;
        maxIterations: number;
    } | {
        apiKey: string;
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
    updateConfig(req: any, body: {
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
        allowedTools?: string[];
        followupEnabled?: boolean;
        hotLeadThreshold?: number;
        maxIterations?: number;
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
    togglePause(req: any, conversationId: string, paused: boolean): Promise<{
        success: boolean;
        conversationId: string;
        aiPaused: boolean;
    }>;
    testConnection(req: any, message?: string): Promise<{
        success: boolean;
        message: string;
        reply?: undefined;
    } | {
        success: boolean;
        reply: string;
        message?: undefined;
    }>;
}
