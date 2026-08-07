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
        title: string;
        category: string;
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
        title: string;
        category: string;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        content: string;
        isActive: boolean;
        title: string;
        category: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
