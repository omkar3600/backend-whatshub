import { PrismaService } from '../../prisma/prisma.service';
export declare class KnowledgeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }[]>;
    create(shopId: string, data: {
        title: string;
        content: string;
        category?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }>;
    update(id: string, shopId: string, data: {
        title?: string;
        content?: string;
        category?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }>;
    delete(id: string, shopId: string): Promise<{
        success: boolean;
    }>;
}
