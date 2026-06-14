import { AutomationsService } from './automations.service';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    createAutomation(user: any, body: any): Promise<any>;
    getAutomations(user: any): Promise<any>;
    updateAutomation(user: any, id: string, body: any): Promise<any>;
    deleteAutomation(user: any, id: string): Promise<{
        message: string;
    }>;
}
