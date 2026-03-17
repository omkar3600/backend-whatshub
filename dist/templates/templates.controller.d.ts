import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    createTemplate(user: any, body: any): Promise<any>;
    getTemplates(user: any): Promise<any>;
    deleteTemplate(user: any, id: string): Promise<{
        message: string;
    }>;
    syncTemplates(user: any): Promise<{
        message: string;
        updated: number;
        imported: number;
    }>;
}
