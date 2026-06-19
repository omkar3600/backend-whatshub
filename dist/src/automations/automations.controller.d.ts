import { AutomationsService } from './automations.service';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    createAutomation(user: any, body: any): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    getAutomations(user: any): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }[]>;
    updateAutomation(user: any, id: string, body: any): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    deleteAutomation(user: any, id: string): Promise<{
        message: string;
    }>;
}
