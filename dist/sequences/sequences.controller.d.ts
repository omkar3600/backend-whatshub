import { SequencesService } from './sequences.service';
export declare class SequencesController {
    private readonly sequencesService;
    constructor(sequencesService: SequencesService);
    create(req: any, data: {
        name: string;
        triggerTag: string;
        steps: any[];
    }): Promise<{
        steps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stepNumber: number;
            delayHours: number;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            sequenceId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
    findAll(req: any): Promise<({
        _count: {
            subscribers: number;
        };
        steps: ({
            template: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                shopId: string;
                category: string;
                templateName: string;
                language: string;
                components: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stepNumber: number;
            delayHours: number;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            sequenceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    })[]>;
    toggle(req: any, id: string, data: {
        isActive: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
    delete(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
}
