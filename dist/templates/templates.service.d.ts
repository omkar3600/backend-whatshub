import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
export declare class TemplatesService {
    private prisma;
    private httpService;
    private cryptoService;
    private readonly logger;
    private readonly graphApiBase;
    constructor(prisma: PrismaService, httpService: HttpService, cryptoService: CryptoService);
    private getCredentials;
    createTemplate(shopId: string, data: any): Promise<{
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
        category: string;
        templateName: string;
        language: string;
        components: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    deleteTemplate(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
