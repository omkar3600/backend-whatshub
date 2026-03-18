import { PrismaService } from '../prisma/prisma.service';
export declare class AutomationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAutomation(shopId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    getAutomations(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }[]>;
    updateAutomation(shopId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        type: string;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    deleteAutomation(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
