import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledge;
    constructor(knowledge: KnowledgeService);
    list(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }[]>;
    create(body: {
        title: string;
        content: string;
        category?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        category: string;
        title: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
