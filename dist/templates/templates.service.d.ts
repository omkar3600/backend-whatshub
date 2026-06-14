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
