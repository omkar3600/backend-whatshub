import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export declare class TemplatesService {
    private prisma;
    private httpService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService);
    createTemplate(shopId: string, data: any): Promise<any>;
    syncTemplates(shopId: string): Promise<{
        message: string;
        updated: number;
        imported: number;
    }>;
    getTemplates(shopId: string): Promise<any>;
    deleteTemplate(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
