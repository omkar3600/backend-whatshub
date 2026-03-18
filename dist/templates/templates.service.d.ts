import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export declare class TemplatesService {
    private prisma;
    private httpService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService);
    createTemplate(shopId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        templateName: string;
        language: string;
        category: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }>;
    syncTemplates(shopId: string): Promise<{
        message: string;
        updated: number;
        imported: number;
    }>;
    getTemplates(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        shopId: string;
        templateName: string;
        language: string;
        category: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    deleteTemplate(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
