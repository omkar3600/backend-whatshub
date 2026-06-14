import { PrismaService } from '../prisma/prisma.service';
export declare class AutomationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAutomation(shopId: string, data: any): Promise<any>;
    getAutomations(shopId: string): Promise<any>;
    updateAutomation(shopId: string, id: string, data: any): Promise<any>;
    deleteAutomation(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
