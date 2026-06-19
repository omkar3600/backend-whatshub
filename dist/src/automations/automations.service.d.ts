import { PrismaService } from '../prisma/prisma.service';
export declare class AutomationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAutomation(shopId: string, data: any): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    getAutomations(shopId: string): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }[]>;
    updateAutomation(shopId: string, id: string, data: any): Promise<{
        id: string;
        shopId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        triggerKeyword: string | null;
        replyText: string;
    }>;
    deleteAutomation(shopId: string, id: string): Promise<{
        message: string;
    }>;
}
