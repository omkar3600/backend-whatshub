import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    createTemplate(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        category: string;
        templateName: string;
        language: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getTemplates(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        category: string;
        templateName: string;
        language: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    deleteTemplate(user: any, id: string): Promise<{
        message: string;
    }>;
    syncTemplates(user: any): Promise<{
        message: string;
        updated: number;
        imported: number;
    }>;
}
