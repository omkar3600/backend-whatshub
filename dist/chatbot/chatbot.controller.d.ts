import { ChatbotService } from './chatbot.service';
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    getConfig(req: any): Promise<any>;
    updateConfig(req: any, body: {
        isActive?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
        systemPrompt?: string;
        businessInfo?: string;
    }): Promise<any>;
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
