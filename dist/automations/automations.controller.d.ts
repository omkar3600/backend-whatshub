import { AutomationsService } from './automations.service';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    createAutomation(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    getAutomations(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }[]>;
    updateAutomation(user: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    deleteAutomation(user: any, id: string): Promise<{
        message: string;
    }>;
}
