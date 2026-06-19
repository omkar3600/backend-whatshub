import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    createTemplate(user: any, body: any): Promise<{
        id: string;
        shopId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        templateName: string;
        language: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getTemplates(user: any): Promise<{
        id: string;
        shopId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        templateName: string;
        language: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getLibrary(): Promise<({
        id: string;
        name: string;
        industry: string;
        templateName: string;
        category: string;
        subCategory: string;
        language: string;
        headerType: string;
        headerText: string;
        bodyText: string;
        footerText: string;
        buttons: {
            type: string;
            text: string;
            url: string;
        }[];
        sampleValues: string[];
    } | {
        id: string;
        name: string;
        industry: string;
        templateName: string;
        category: string;
        language: string;
        headerType: string;
        headerText: string;
        bodyText: string;
        footerText: string;
        buttons: {
            type: string;
            text: string;
            phone_number: string;
        }[];
        sampleValues: string[];
        subCategory?: undefined;
    } | {
        id: string;
        name: string;
        industry: string;
        templateName: string;
        category: string;
        language: string;
        headerType: string;
        headerText: string;
        bodyText: string;
        footerText: string;
        buttons: ({
            type: string;
            text: string;
            url: string;
        } | {
            type: string;
            text: string;
            url?: undefined;
        })[];
        sampleValues: string[];
        subCategory?: undefined;
    })[]>;
    deleteTemplate(user: any, id: string): Promise<{
        message: string;
    }>;
    syncTemplates(user: any): Promise<{
        message: string;
        updated: number;
        imported: number;
    }>;
    uploadTemplateMedia(user: any, file: Express.Multer.File): Promise<{
        handle: any;
    }>;
    uploadTemplateMediaUrl(user: any, body: {
        fileUrl: string;
    }): Promise<{
        handle: any;
    }>;
}
